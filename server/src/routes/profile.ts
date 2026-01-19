/**
 * Profile Customization Routes
 */

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth'
import {
  getOrCreateProfileCustomization,
  updateDisplayName,
  updateAvatar,
  updateFrame,
  updateTheme,
  updateProfileCardSettings,
  getCustomizationOptions,
} from '../services/profile'
import { AVATARS, FRAMES, THEMES } from '../db/schema/profile'
import { logger } from '../lib/logger'

const profileRoutes = new Hono()

/**
 * GET /profile/customization - Get user's profile customization
 */
profileRoutes.get('/customization', requireAuth, async (c) => {
  const user = c.get('user')!

  try {
    const profile = await getOrCreateProfileCustomization(user.id)
    const options = getCustomizationOptions(profile)

    return c.json({
      profile,
      options,
    })
  } catch (error) {
    logger.error('Error fetching profile customization', { error, userId: user.id })
    return c.json({ error: 'Failed to fetch profile customization' }, 500)
  }
})

/**
 * GET /profile/customization/options - Get available customization options
 */
profileRoutes.get('/customization/options', (c) => {
  return c.json({
    avatars: AVATARS,
    frames: FRAMES,
    themes: THEMES,
  })
})

/**
 * PATCH /profile/customization/display-name - Update display name
 */
profileRoutes.patch(
  '/customization/display-name',
  requireAuth,
  zValidator(
    'json',
    z.object({
      displayName: z.string().min(2).max(30),
    })
  ),
  async (c) => {
    const user = c.get('user')!
    const { displayName } = c.req.valid('json')

    try {
      const profile = await updateDisplayName(user.id, displayName)
      return c.json({ profile })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update display name'
      logger.error('Error updating display name', { error, userId: user.id })
      return c.json({ error: message }, 400)
    }
  }
)

/**
 * PATCH /profile/customization/avatar - Update selected avatar
 */
profileRoutes.patch(
  '/customization/avatar',
  requireAuth,
  zValidator(
    'json',
    z.object({
      avatarId: z.string(),
    })
  ),
  async (c) => {
    const user = c.get('user')!
    const { avatarId } = c.req.valid('json')

    try {
      const profile = await updateAvatar(user.id, avatarId as Parameters<typeof updateAvatar>[1])
      return c.json({ profile })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update avatar'
      logger.error('Error updating avatar', { error, userId: user.id })
      return c.json({ error: message }, 400)
    }
  }
)

/**
 * PATCH /profile/customization/frame - Update selected frame
 */
profileRoutes.patch(
  '/customization/frame',
  requireAuth,
  zValidator(
    'json',
    z.object({
      frameId: z.string(),
    })
  ),
  async (c) => {
    const user = c.get('user')!
    const { frameId } = c.req.valid('json')

    try {
      const profile = await updateFrame(user.id, frameId as Parameters<typeof updateFrame>[1])
      return c.json({ profile })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update frame'
      logger.error('Error updating frame', { error, userId: user.id })
      return c.json({ error: message }, 400)
    }
  }
)

/**
 * PATCH /profile/customization/theme - Update selected theme
 */
profileRoutes.patch(
  '/customization/theme',
  requireAuth,
  zValidator(
    'json',
    z.object({
      themeId: z.string(),
    })
  ),
  async (c) => {
    const user = c.get('user')!
    const { themeId } = c.req.valid('json')

    try {
      const profile = await updateTheme(user.id, themeId as Parameters<typeof updateTheme>[1])
      return c.json({ profile })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update theme'
      logger.error('Error updating theme', { error, userId: user.id })
      return c.json({ error: message }, 400)
    }
  }
)

/**
 * PATCH /profile/customization/card-settings - Update profile card visibility
 */
profileRoutes.patch(
  '/customization/card-settings',
  requireAuth,
  zValidator(
    'json',
    z.object({
      showLevel: z.boolean().optional(),
      showStreak: z.boolean().optional(),
      showTitle: z.boolean().optional(),
      showStats: z.boolean().optional(),
    })
  ),
  async (c) => {
    const user = c.get('user')!
    const settings = c.req.valid('json')

    try {
      const profile = await updateProfileCardSettings(user.id, settings)
      return c.json({ profile })
    } catch (error) {
      logger.error('Error updating card settings', { error, userId: user.id })
      return c.json({ error: 'Failed to update card settings' }, 500)
    }
  }
)

export default profileRoutes
