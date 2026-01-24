# ADR-002: Agent Orchestration Architecture for AgentHub SaaS

## Status
ACCEPTED - 2026-01-24

## Context

**Current Situation:**
- We have 7 specialized agent identities with defined protocols
- Each agent has YAML configs mapping phases to commands
- No unified execution engine exists
- Need to run agents safely in multi-tenant SaaS environment

**Business Need:**
AgentHub SaaS requires a secure, scalable orchestration layer that can:
- Execute agent protocols in isolated workspaces
- Stream real-time progress to users
- Handle concurrent agent executions
- Prevent malicious code execution
- Scale to 1000s of executions/hour

**Strategic Goals:**
- Enable non-technical users to run sophisticated AI agents
- Create marketplace for custom agent identities
- Support both hosted and self-hosted deployments
- Build defensible moat through orchestration IP

---

## Decision

**We will implement a three-tier agent orchestration architecture:**

### Tier 1: Agent Definition Layer
- **Format:** YAML configs in `agents/{agent-name}.yaml`
- **Content:** Phase definitions, command mappings, constraints
- **Validation:** Zod schemas enforce structure
- **Versioning:** Semantic versioning (agent@version)

### Tier 2: Orchestration Engine
- **Technology:** Node.js workers with BullMQ queue
- **Isolation:** Docker containers with resource limits
- **Communication:** WebSocket for real-time updates
- **Storage:** PostgreSQL for execution history + Redis for state

### Tier 3: Execution Runtime
- **Sandbox:** Docker containers (256MB RAM, 30s timeout)
- **Security:** Read-only filesystem, no network access
- **Monitoring:** Prometheus metrics + Datadog APM
- **Logging:** Structured JSON logs to CloudWatch

---

## Architecture Diagram

```
┌─────────────┐
│   User UI   │
│  (Next.js)  │
└──────┬──────┘
       │ WebSocket
       ▼
┌─────────────────────────────────────┐
│    API Gateway (Next.js API)        │
│  - Authentication (NextAuth)        │
│  - Rate Limiting (10 exec/min)      │
│  - Input Validation (Zod)           │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│   Orchestration Engine (BullMQ)     │
│  - Queue management                 │
│  - Worker pool (5 concurrent)       │
│  - Retry logic (3 attempts)         │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Agent Executor (Docker)            │
│  - Load agent YAML config           │
│  - Execute phases sequentially      │
│  - Stream output via Redis PubSub   │
│  - Store results in PostgreSQL      │
└─────────────────────────────────────┘
       │
       ▼
┌──────────────┬──────────────────────┐
│ PostgreSQL   │      Redis           │
│ (Execution   │   (State + Cache)    │
│  History)    │                      │
└──────────────┴──────────────────────┘
```

---

## Implementation Details

### 1. Agent Configuration Schema

```yaml
# agents/tuber.yaml
identity: Tuber
version: 2.0.0
icon: wrench
description: "Data Layer Optimizer"

# Resource limits
constraints:
  maxExecutionTime: 30000  # 30 seconds
  maxMemory: 256          # MB
  maxConcurrent: 5        # Per workspace

# Execution phases
phases:
  diagnose:
    timeout: 10000
    commands:
      - "pnpm test:integration --grep='N+1'"
    outputs:
      - "opportunities.json"

  plan:
    timeout: 5000
    commands:
      - "git diff main"
    depends_on: ["diagnose"]

  # ... more phases
```

### 2. Orchestration Engine (TypeScript)

```typescript
// src/orchestration/engine.ts
import { Queue, Worker } from 'bullmq';
import { Docker } from 'dockerode';

interface AgentJob {
  workspaceId: string;
  agentType: string;
  agentVersion: string;
  context: {
    codebase: string;
    constraints: Record<string, any>;
  };
}

// BullMQ queue for agent executions
export const agentQueue = new Queue<AgentJob>('agent-executions', {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379')
  }
});

// Worker processes agent executions
export const agentWorker = new Worker<AgentJob>(
  'agent-executions',
  async (job) => {
    const { workspaceId, agentType, context } = job.data;

    // Load agent configuration
    const agentConfig = await loadAgentConfig(agentType);

    // Create isolated Docker container
    const docker = new Docker();
    const container = await docker.createContainer({
      Image: 'agenthub/executor:latest',
      Env: [
        `WORKSPACE_ID=${workspaceId}`,
        `AGENT_TYPE=${agentType}`
      ],
      HostConfig: {
        Memory: agentConfig.constraints.maxMemory * 1024 * 1024,
        NetworkMode: 'none', // No network access
        ReadonlyRootfs: true
      }
    });

    // Execute phases sequentially
    const results = [];
    for (const [phaseName, phase] of Object.entries(agentConfig.phases)) {
      const phaseResult = await executePhase(
        container,
        phaseName,
        phase,
        context
      );

      // Emit progress via WebSocket
      await emitProgress(workspaceId, job.id, {
        phase: phaseName,
        status: phaseResult.status,
        output: phaseResult.output
      });

      results.push(phaseResult);

      if (phaseResult.status === 'failed') {
        break; // Stop on first failure
      }
    }

    // Cleanup
    await container.remove({ force: true });

    return results;
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379')
    },
    concurrency: 5 // Max 5 concurrent executions
  }
);
```

### 3. Security Isolation

**Docker Container Security:**
```dockerfile
# docker/executor.dockerfile
FROM node:20-alpine

# Create non-root user
RUN addgroup -g 1000 agent && \
    adduser -D -u 1000 -G agent agent

# Install only production dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copy agent execution runtime
COPY --chown=agent:agent src/runtime ./runtime

USER agent

# Set resource limits
ENV NODE_OPTIONS="--max-old-space-size=256"

CMD ["node", "runtime/executor.js"]
```

**Resource Limits Enforced:**
- CPU: 0.5 cores max
- Memory: 256MB hard limit
- Execution time: 30 seconds timeout
- Disk I/O: Read-only filesystem
- Network: Completely disabled

---

## Data Model

### PostgreSQL Schema

```prisma
model AgentExecution {
  id        String   @id @default(cuid())

  // Multi-tenant isolation
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id])

  // Agent metadata
  agentType    String  // 'tuber' | 'bolt' | etc
  agentVersion String  // '2.0.0'

  // Execution state
  status    String   // 'queued' | 'running' | 'completed' | 'failed'
  phase     String?  // Current phase name
  progress  Int      @default(0) // 0-100

  // Input/Output
  input     Json
  output    Json?
  error     String?

  // Metadata
  startedAt   DateTime  @default(now())
  completedAt DateTime?
  duration    Int?      // milliseconds

  // Resource usage
  cpuTime     Int?      // milliseconds
  memoryPeak  Int?      // bytes

  @@index([workspaceId, status])
  @@index([agentType, status])
  @@index([startedAt])
}
```

### Redis State Management

```typescript
// Real-time execution state in Redis
interface ExecutionState {
  executionId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  phase: string;
  progress: number;
  logs: string[];
  startTime: number;
}

// Store with 1-hour TTL
await redis.setex(
  `execution:${executionId}`,
  3600,
  JSON.stringify(executionState)
);

// Publish progress updates
await redis.publish(
  `workspace:${workspaceId}:updates`,
  JSON.stringify({ executionId, ...update })
);
```

---

## Consequences

### Positive

✅ **Security:** Docker isolation prevents malicious code execution
✅ **Scalability:** Queue-based architecture scales horizontally
✅ **Real-time:** WebSocket updates provide live progress
✅ **Reliability:** BullMQ handles retries and failure recovery
✅ **Multi-tenancy:** Workspace isolation at database + runtime level
✅ **Observability:** Comprehensive logging and metrics
✅ **Flexibility:** Easy to add new agent types

### Negative

⚠️ **Complexity:** Docker + BullMQ + Redis adds operational overhead
⚠️ **Cost:** Docker containers consume more resources than processes
⚠️ **Latency:** Container startup adds ~2-3 seconds per execution
⚠️ **Debugging:** Harder to debug issues inside containers

### Neutral

📊 **Infrastructure:** Requires Docker, Redis, PostgreSQL
📊 **Monitoring:** Need Prometheus + Datadog for production
📊 **Scaling:** Kubernetes recommended for > 1000 executions/hour

---

## Alternatives Considered

### Alternative 1: Direct Process Execution
```typescript
// Run agent phases as child processes
const result = execSync('pnpm test:integration');
```
**Rejected:** No isolation, security risk, can't limit resources

### Alternative 2: AWS Lambda per Phase
**Rejected:** Cold start latency (500ms-2s), expensive at scale

### Alternative 3: WebAssembly Sandbox
**Rejected:** Limited language support, immature tooling

### Alternative 4: Firecracker VMs
**Rejected:** Overkill for our use case, complex to manage

---

## Migration Path

### Phase 1: Local Development (Week 1-2)
- Implement engine without Docker (process-based)
- Test with file-based queue (no Redis)
- Validate core orchestration logic

### Phase 2: Production Infrastructure (Week 3-4)
- Add Docker container execution
- Deploy BullMQ with Redis
- Implement WebSocket real-time updates

### Phase 3: Scale & Optimize (Month 2)
- Kubernetes deployment
- Horizontal autoscaling
- Performance optimizations

---

## Success Metrics

**Performance:**
- Agent execution start latency: < 5 seconds
- Phase execution time: < 30 seconds
- Concurrent executions: 100+ per instance

**Reliability:**
- Success rate: > 95%
- Queue processing: < 10 seconds wait time
- Container crashes: < 0.1%

**Security:**
- Zero container escapes
- Zero cross-workspace data leaks
- 100% input validation coverage

---

## Open Questions

1. **Q:** How to handle long-running agent executions (> 30 seconds)?
   **A:** Implement async execution with email/webhook notifications

2. **Q:** How to support custom agent identities from users?
   **A:** Phase 2 feature - validate YAML schema, security review required

3. **Q:** What if Docker is unavailable (e.g., some hosting providers)?
   **A:** Fallback to process-based execution with clear security warnings

---

## References

**External:**
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [Multi-tenant Architecture Patterns](https://aws.amazon.com/blogs/architecture/)

**Internal:**
- ADR-001: API Versioning Strategy
- agents/*.yaml: Agent configurations
- Oracle Strategic Reading: Agent Adoption Dynamics

**Metrics:**
- [Agent Execution Dashboard](https://grafana.agenthub.com/executions)
- [Security Monitoring](https://datadog.agenthub.com/security)

---

## Implementation Checklist

- [ ] Create orchestration engine (Week 1)
- [ ] Build Docker executor runtime (Week 2)
- [ ] Implement BullMQ queue (Week 2)
- [ ] Add WebSocket real-time updates (Week 3)
- [ ] Security audit (Week 4)
- [ ] Load testing (Week 4)
- [ ] Production deployment (Week 4)

---

**Decision Made By:** Sun Tzu 🎯 (Strategic Architecture Agent)
**Date:** 2026-01-24
**Next Review:** 2026-02-24 (after MVP launch)
