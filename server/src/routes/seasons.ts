import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import {
  getAllSeasons,
  getCurrentSeason,
  getSeasonById,
  getUserCurrentSeason,
  getUserSeasonHistory,
  getSeasonLeaderboard,
  startUserInSeason,
  getSeasonByNumber,
} from '../services/season'
import { getAllTitles } from '../services/title'

const seasonRoutes = new Hono()

// Get all titles (public)
seasonRoutes.get('/titles', async (c) => {
  try {
    const allTitles = await getAllTitles()
    return c.json({ titles: allTitles })
  } catch (error) {
    console.error('Get titles error:', error)
    return c.json({ error: 'Failed to get titles' }, 500)
  }
})

// Get all seasons
seasonRoutes.get('/seasons', async (c) => {
  try {
    const allSeasons = await getAllSeasons()
    return c.json({ seasons: allSeasons })
  } catch (error) {
    console.error('Get seasons error:', error)
    return c.json({ error: 'Failed to get seasons' }, 500)
  }
})

// Get current season
seasonRoutes.get('/seasons/current', async (c) => {
  try {
    const current = await getCurrentSeason()
    if (!current) {
      return c.json({ error: 'No active season' }, 404)
    }
    return c.json(current)
  } catch (error) {
    console.error('Get current season error:', error)
    return c.json({ error: 'Failed to get current season' }, 500)
  }
})

// Get seasonal quests (unlocks in Season 2)
seasonRoutes.get('/seasons/quests', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const participation = await getUserCurrentSeason(user.id)
    const currentSeason = participation?.season ?? null

    // Seasonal quests unlock in Season 2 (The Contender)
    const UNLOCK_SEASON = 2
    const isUnlocked = currentSeason ? currentSeason.number >= UNLOCK_SEASON : false

    // For now, return empty quests - seasonal quest system can be expanded later
    // This provides the expected response shape for the frontend
    return c.json({
      season: currentSeason
        ? {
            id: currentSeason.id,
            name: currentSeason.name,
            theme: currentSeason.theme,
            number: currentSeason.number,
            isActive: currentSeason.status === 'ACTIVE',
            startDate: participation?.startedAt?.toISOString() ?? null,
            endDate: null,
          }
        : null,
      quests: [],
      isUnlocked,
      unlockSeason: UNLOCK_SEASON,
      currentSeason: currentSeason?.number ?? null,
    })
  } catch (error) {
    console.error('Get seasonal quests error:', error)
    return c.json({ error: 'Failed to get seasonal quests' }, 500)
  }
})

// Get specific season
seasonRoutes.get('/seasons/:id', async (c) => {
  const seasonId = c.req.param('id')

  try {
    const season = await getSeasonById(seasonId)
    if (!season) {
      return c.json({ error: 'Season not found' }, 404)
    }
    return c.json(season)
  } catch (error) {
    console.error('Get season error:', error)
    return c.json({ error: 'Failed to get season' }, 500)
  }
})

// Get season leaderboard
seasonRoutes.get('/seasons/:id/leaderboard', async (c) => {
  const seasonId = c.req.param('id')
  const limit = parseInt(c.req.query('limit') || '50')
  const offset = parseInt(c.req.query('offset') || '0')

  try {
    const leaderboard = await getSeasonLeaderboard(seasonId, limit, offset)
    return c.json({ leaderboard })
  } catch (error) {
    console.error('Get leaderboard error:', error)
    return c.json({ error: 'Failed to get leaderboard' }, 500)
  }
})

// Get player's current season (with auto-enrollment)
seasonRoutes.get('/player/season', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    let participation = await getUserCurrentSeason(user.id)

    // If user has no season, start them in Season 1
    if (!participation) {
      const season1 = await getSeasonByNumber(1)
      if (season1) {
        participation = await startUserInSeason(user.id, season1.id)
      }
    }

    return c.json(participation)
  } catch (error) {
    console.error('Get player season error:', error)
    return c.json({ error: 'Failed to get player season' }, 500)
  }
})

// Get player's season history
seasonRoutes.get('/player/seasons/history', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const history = await getUserSeasonHistory(user.id)
    return c.json({ history })
  } catch (error) {
    console.error('Get season history error:', error)
    return c.json({ error: 'Failed to get season history' }, 500)
  }
})

export default seasonRoutes
