# ADR-003: API Versioning Strategy

## Status
ACCEPTED - 2026-01-24

## Context
As AgentHub SaaS grows, we need a way to evolve our API without breaking existing clients (web, mobile, integrations). Currently, we have no versioning, which poses a significant risk to system stability and team velocity.

## Decision
We will implement **URL-based versioning** starting with `v1`.
- All production APIs will be prefixed with `/api/v1/`.
- We will support at least the current and previous versions.
- Deprecation will follow a 6-month window.

## Consequences

**Positive:**
- ✅ Independent deployment of frontend and backend.
- ✅ Zero breaking changes for existing integrations.
- ✅ Support for gradual feature rollouts.

**Negative:**
- ⚠️ Maintenance of multiple API paths.
- ⚠️ Slight increase in routing complexity.

## Implementation
- Moved existing routes to `/api/v1/`.
- Updated `SETUP.md` to reflect new paths.

## References
- [Stripe API Versioning](https://stripe.com/docs/api/versioning)
- Sun Tzu Strategic Reconnaissance 2026-01-24
