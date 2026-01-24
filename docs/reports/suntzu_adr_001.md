# ADR-001: Implement Executable Agent Orchestration Layer

## Status
ACCEPTED - 2026-01-23

## Context
The repository defined agent protocols in Markdown, but lacked a bridge between documentation and execution. Users had to manually interpret the "Phases" defined in the agent files.

## Decision
We will implement an executable orchestration layer using YAML configurations in `config/agents/`. Each file maps the human-readable phases (Scan, Execute, Verify, etc.) to specific shell commands.

## Consequences
- **Positive:** Agents become "runnable" via CI/CD or CLI tools.
- **Positive:** Standardizes how different agents interact with the codebase.
- **Negative:** Adds a small maintenance overhead for YAML files.

## Implementation
1. Create `config/agents/` directory.
2. Define phase-to-command mappings for all 7 agents.
3. Integrate configs into future runner scripts.
