import { agentWorker } from '@/orchestration/worker';
import { agentQueue, redis } from '@/orchestration/engine';
import prisma from '@/lib/prisma';

console.log('🤖 Agent worker started...');
console.log('Waiting for jobs...');

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down worker...');
  await agentWorker.close();
  await agentQueue.close();
  await redis.quit();
  await prisma.$disconnect();
  process.exit(0);
});
