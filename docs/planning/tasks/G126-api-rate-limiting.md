# G126: API Rate Limiting Middleware

## Overview
Implement rate limiting to protect API from abuse and ensure fair usage.

## Acceptance Criteria
- [ ] Rate limit by IP and user ID
- [ ] Configurable limits per endpoint
- [ ] Return 429 with retry-after header
- [ ] Store rate data in Redis or memory
- [ ] Whitelist for admin endpoints

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| `server/src/middleware/rate-limit.ts` | Create | Rate limit middleware |
| `server/src/lib/rate-store.ts` | Create | Rate storage |
| `server/src/index.ts` | Modify | Apply middleware |

## Definition of Done
- [ ] Rate limits enforced
- [ ] Headers correct
- [ ] No TypeScript errors
