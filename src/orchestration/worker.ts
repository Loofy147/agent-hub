import { Worker, Job } from 'bullmq';
import prisma from '@/lib/prisma';
import { redis, configLoader, executor, AgentJobData, PhaseResult } from './engine';

/**
 * Update workspace metrics
 * TUBER: Optimized batch updates
 */
async function updateMetrics(
  workspaceId: string,
  agentType: string,
  status: string,
  duration: number
): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const agentField = `${agentType}Executions`;

  await prisma.workspaceMetrics.upsert({
    where: {
      workspaceId_date: {
        workspaceId,
        date: today
      }
    },
    update: {
      executionsTotal: { increment: 1 },
      ...(status === 'completed' && {
        executionsSuccess: { increment: 1 }
      }),
      ...(status === 'failed' && {
        executionsFailed: { increment: 1 }
      }),
      [agentField]: { increment: 1 },
      avgExecutionTimeMs: duration
    },
    create: {
      workspaceId,
      date: today,
      executionsTotal: 1,
      executionsSuccess: status === 'completed' ? 1 : 0,
      executionsFailed: status === 'failed' ? 1 : 0,
      [agentField]: 1,
      avgExecutionTimeMs: duration
    }
  });
}

/**
 * Worker that processes agent executions
 * SUN TZU: Strategic execution with proper error handling
 */
export const agentWorker = new Worker<AgentJobData>(
  'agent-executions',
  async (job: Job<AgentJobData>) => {
    const { executionId, workspaceId, agentType, agentVersion, context } = job.data;

    console.log(`[Worker] Starting execution ${executionId} for ${agentType}`);

    try {
      // Update execution status to 'running'
      await prisma.agentExecution.update({
        where: { id: executionId },
        data: {
          status: 'running',
          startedAt: new Date(),
          jobId: job.id
        }
      });

      // Load agent configuration
      const config = await configLoader.loadConfig(agentType, agentVersion);

      // Execute phases sequentially
      const results: PhaseResult[] = [];
      const phases = Object.entries(config.phases);

      for (let i = 0; i < phases.length; i++) {
        const [phaseName, phase] = phases[i];

        // Update progress
        const progress = Math.round((i / phases.length) * 100);
        await prisma.agentExecution.update({
          where: { id: executionId },
          data: { phase: phaseName, progress }
        });

        // Execute phase
        const result = await executor.executePhase(
          executionId,
          phaseName,
          phase,
          context
        );

        results.push(result);

        // Emit progress update
        await executor.emitProgress(workspaceId, executionId, {
          phase: phaseName,
          status: result.status,
          output: result.output?.substring(0, 500) // Truncate for real-time
        });

        // Stop on first failure
        if (result.status === 'failed') {
          break;
        }
      }

      // Determine final status
      const hasFailed = results.some(r => r.status === 'failed');
      const finalStatus = hasFailed ? 'failed' : 'completed';
      const duration = results.reduce((sum, r) => sum + r.duration, 0);

      // Update execution with final results
      await prisma.agentExecution.update({
        where: { id: executionId },
        data: {
          status: finalStatus,
          progress: 100,
          output: { results },
          completedAt: new Date(),
          duration
        }
      });

      // Update workspace metrics
      await updateMetrics(workspaceId, agentType, finalStatus, duration);

      console.log(`[Worker] Completed execution ${executionId}: ${finalStatus}`);

      return { success: !hasFailed, results };

    } catch (error) {
      console.error(`[Worker] Execution ${executionId} failed:`, error);

      // Update execution as failed
      await prisma.agentExecution.update({
        where: { id: executionId },
        data: {
          status: 'failed',
          error: error.message,
          completedAt: new Date()
        }
      });

      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 5, // Max 5 concurrent executions
    limiter: {
      max: 100, // Max 100 jobs per minute
      duration: 60000
    }
  }
);

// Worker Event Handlers
agentWorker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

agentWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err);
});

agentWorker.on('error', (err) => {
  console.error('[Worker] Worker error:', err);
});
