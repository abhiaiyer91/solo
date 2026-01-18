import { Hono } from 'hono'
import {
  getContentRecord,
  getContentRecordsByCategory,
  getInterpolatedContent,
  type NarrativeCategory,
} from '../services/narrative'

const VALID_CATEGORIES: NarrativeCategory[] = [
  'ONBOARDING',
  'SYSTEM_MESSAGE',
  'DAILY_QUEST',
  'DEBUFF',
  'DUNGEON',
  'BOSS',
  'TITLE',
  'SEASON',
  'LEVEL_UP',
  'DAILY_REMINDER',
]

const contentRoutes = new Hono()

// Get content by key
contentRoutes.get('/content/:key', async (c) => {
  const key = c.req.param('key')

  try {
    const content = await getContentRecord(key)
    if (!content) {
      return c.json({ error: 'Content not found' }, 404)
    }
    return c.json(content)
  } catch (error) {
    console.error('Get content error:', error)
    return c.json({ error: 'Failed to get content' }, 500)
  }
})

// Get content by category
contentRoutes.get('/content/category/:category', async (c) => {
  const category = c.req.param('category').toUpperCase() as NarrativeCategory

  if (!VALID_CATEGORIES.includes(category)) {
    return c.json({ error: 'Invalid category' }, 400)
  }

  try {
    const contents = await getContentRecordsByCategory(category)
    return c.json({ category, contents })
  } catch (error) {
    console.error('Get content by category error:', error)
    return c.json({ error: 'Failed to get content' }, 500)
  }
})

// Interpolate content with variables
contentRoutes.post('/content/:key/interpolate', async (c) => {
  const key = c.req.param('key')

  try {
    const body = await c.req.json<{ variables: Record<string, string | number> }>()
    const content = await getInterpolatedContent(key, body.variables || {})

    if (!content) {
      return c.json({ error: 'Content not found' }, 404)
    }

    return c.json({ key, content })
  } catch (error) {
    console.error('Interpolate content error:', error)
    return c.json({ error: 'Failed to interpolate content' }, 500)
  }
})

export default contentRoutes
