import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import {
  getPartners,
  getPendingRequests,
  requestPartner,
  acceptRequest,
  declineRequest,
  endPartnership,
  sendNudge,
  getTodayNudges,
} from '../services/accountability'

const accountabilityRoutes = new Hono()

// Get current partners
accountabilityRoutes.get('/accountability/partners', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const partners = await getPartners(user.id, user.timezone ?? 'UTC')
    return c.json({ partners })
  } catch (error) {
    console.error('Get partners error:', error)
    return c.json({ error: 'Failed to get partners' }, 500)
  }
})

// Get pending requests
accountabilityRoutes.get('/accountability/requests', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const requests = await getPendingRequests(user.id)
    return c.json({ requests })
  } catch (error) {
    console.error('Get requests error:', error)
    return c.json({ error: 'Failed to get requests' }, 500)
  }
})

// Send partner request
accountabilityRoutes.post('/accountability/request', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const { userId: targetUserId } = await c.req.json<{ userId: string }>()

    if (!targetUserId) {
      return c.json({ error: 'User ID required' }, 400)
    }

    const pair = await requestPartner(user.id, targetUserId)
    return c.json({
      pair,
      message: '[SYSTEM] Partnership request sent.',
    })
  } catch (error) {
    console.error('Request partner error:', error)
    const message = error instanceof Error ? error.message : 'Failed to send request'
    return c.json({ error: message }, 400)
  }
})

// Accept partner request
accountabilityRoutes.post('/accountability/accept/:requestId', requireAuth, async (c) => {
  const user = c.get('user')!
  const requestId = c.req.param('requestId')

  try {
    const pair = await acceptRequest(user.id, requestId)
    return c.json({
      pair,
      message: '[SYSTEM] Partnership established.',
    })
  } catch (error) {
    console.error('Accept request error:', error)
    const message = error instanceof Error ? error.message : 'Failed to accept request'
    return c.json({ error: message }, 400)
  }
})

// Decline partner request
accountabilityRoutes.post('/accountability/decline/:requestId', requireAuth, async (c) => {
  const user = c.get('user')!
  const requestId = c.req.param('requestId')

  try {
    await declineRequest(user.id, requestId)
    return c.json({
      message: '[SYSTEM] Request declined.',
    })
  } catch (error) {
    console.error('Decline request error:', error)
    return c.json({ error: 'Failed to decline request' }, 400)
  }
})

// End partnership
accountabilityRoutes.post('/accountability/end/:pairId', requireAuth, async (c) => {
  const user = c.get('user')!
  const pairId = c.req.param('pairId')

  try {
    await endPartnership(user.id, pairId)
    return c.json({
      message: '[SYSTEM] Partnership ended.',
    })
  } catch (error) {
    console.error('End partnership error:', error)
    const message = error instanceof Error ? error.message : 'Failed to end partnership'
    return c.json({ error: message }, 400)
  }
})

// Send nudge
accountabilityRoutes.post('/accountability/nudge/:pairId', requireAuth, async (c) => {
  const user = c.get('user')!
  const pairId = c.req.param('pairId')

  try {
    const nudge = await sendNudge(user.id, pairId, user.timezone ?? 'UTC')
    return c.json({
      nudge,
      message: '[SYSTEM] Nudge sent.',
    })
  } catch (error) {
    console.error('Send nudge error:', error)
    const message = error instanceof Error ? error.message : 'Failed to send nudge'
    return c.json({ error: message }, 400)
  }
})

// Get today's nudges received
accountabilityRoutes.get('/accountability/nudges', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const count = await getTodayNudges(user.id, user.timezone ?? 'UTC')
    return c.json({ nudgesReceived: count })
  } catch (error) {
    console.error('Get nudges error:', error)
    return c.json({ error: 'Failed to get nudges' }, 500)
  }
})

export default accountabilityRoutes
