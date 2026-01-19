# G160: Offline Food Database Cache

## Overview
Cache frequently scanned products and recent lookups locally to enable offline barcode scanning and reduce API calls.

## Context
**Source:** Ideation loop --topic "food scanning with photo recognition and barcode detection"
**Design Doc:** `docs/mobile/food-scanning.md`
**Current State:** All lookups require network connection

## Acceptance Criteria
- [ ] Cache barcode lookups locally (AsyncStorage)
- [ ] Offline scanning shows cached products
- [ ] Recently scanned products available offline
- [ ] User's custom foods stored locally
- [ ] Cache expires after 30 days
- [ ] Cache size limit (100MB max)
- [ ] Background sync when back online
- [ ] Clear cache option in settings

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| mobile/src/lib/food-cache.ts | Create | Cache management utilities |
| mobile/src/hooks/useFoodCache.ts | Create | Cache access hook |
| mobile/src/hooks/useOfflineSync.ts | Create | Background sync logic |
| mobile/src/services/offline-queue.ts | Create | Queue offline logs for sync |
| mobile/src/components/OfflineIndicator.tsx | Create | Show offline status |
| mobile/src/screens/SettingsScreen.tsx | Modify | Add cache management |

## Implementation Notes

### Cache Structure
```typescript
interface FoodCache {
  version: number
  products: Map<string, CachedProduct>
  lastSync: string
  totalSize: number
}

interface CachedProduct {
  barcode: string
  product: NormalizedProduct
  cachedAt: string
  accessCount: number
  lastAccessed: string
}
```

### Cache Strategy
1. **On successful lookup**: Cache product with TTL
2. **On scan attempt**: Check cache first, then API
3. **Background refresh**: Update stale entries when online
4. **LRU eviction**: Remove least recently used when full

### Offline Detection
```typescript
import NetInfo from '@react-native-community/netinfo'

const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true)
    })
    return unsubscribe
  }, [])

  return isConnected
}
```

### Offline Queue for Logs
When offline, queue nutrition logs:
```typescript
interface QueuedLog {
  id: string
  type: 'meal_log' | 'photo_analysis'
  data: object
  createdAt: string
  retryCount: number
}

const queueForSync = async (log: QueuedLog) => {
  const queue = await AsyncStorage.getItem('offline_queue')
  const items = queue ? JSON.parse(queue) : []
  items.push(log)
  await AsyncStorage.setItem('offline_queue', JSON.stringify(items))
}
```

### Background Sync
When connectivity restored:
1. Process offline queue in order
2. Refresh stale cache entries
3. Clear successfully synced items
4. Notify user of sync status

### Cache Size Management
```typescript
const CACHE_SIZE_LIMIT = 100 * 1024 * 1024 // 100MB

const pruneCache = async () => {
  const cache = await getCache()
  if (cache.totalSize <= CACHE_SIZE_LIMIT) return

  // Sort by lastAccessed (oldest first)
  const sorted = [...cache.products.values()]
    .sort((a, b) => new Date(a.lastAccessed).getTime() - new Date(b.lastAccessed).getTime())

  // Remove until under limit
  while (cache.totalSize > CACHE_SIZE_LIMIT * 0.8) {
    const oldest = sorted.shift()
    if (!oldest) break
    cache.products.delete(oldest.barcode)
    cache.totalSize -= estimateSize(oldest)
  }

  await saveCache(cache)
}
```

### UI Indicators
- Show "Offline" badge when not connected
- Show "Cached" badge on products from cache
- Show sync progress when reconnecting
- Show queue count for pending logs

## Definition of Done
- [ ] All acceptance criteria met
- [ ] No TypeScript errors
- [ ] Barcode scanning works offline for cached products
- [ ] Logs sync correctly when back online
- [ ] Cache doesn't grow unbounded
- [ ] User can clear cache from settings
