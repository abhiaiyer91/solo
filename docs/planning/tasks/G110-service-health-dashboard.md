# G110: Service Health Admin Dashboard

## Overview
Create a simple admin dashboard to monitor service health, database metrics, and user activity.

## Acceptance Criteria
- [ ] Admin-only route with auth check
- [ ] Display active users (daily/weekly/monthly)
- [ ] Show database size and query performance
- [ ] Display error rates and recent errors
- [ ] Show API endpoint response times

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| `server/src/routes/admin.ts` | Create | Admin API endpoints |
| `server/src/services/metrics.ts` | Create | Metrics collection |
| `web/src/pages/Admin.tsx` | Create | Admin dashboard UI |
| `web/src/components/admin/MetricsCard.tsx` | Create | Metrics display |

## Metrics to Track
- Active users (DAU, WAU, MAU)
- Quest completion rates
- Average session duration
- Error rates by endpoint
- Database query performance

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Admin route protected
- [ ] Metrics display correctly
- [ ] No TypeScript errors
