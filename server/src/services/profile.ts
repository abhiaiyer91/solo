/**
 * Profile Customization Service
 * Handles profile personalization and unlocks
 */

import { eq } from 'drizzle-orm'
import { dbClient as db } from '../db'
import {
  profileCustomization,
  AVATARS,
  FRAMES,
  THEMES,
  type ProfileCustomization,
  type AvatarId,
  type FrameId,
  type ThemeId,
} from '../db/schema/profile'
import { logger } from '../lib/logger'

function requireDb() {
  if (!db) throw new Error('Database not initialized')
  return db
}

/**
 * Get user's profile customization
 */
export async function getProfileCustomization(
  userId: string
): Promise<ProfileCustomization | null> {
  const database = requireDb()

  const [profile] = await database
    .select()
    .from(profileCustomization)
    .where(eq(profileCustomization.userId, userId))
    .limit(1)

  return profile ?? null
}

/**
 * Get or create profile customization
 */
export async function getOrCreateProfileCustomization(
  userId: string
): Promise<ProfileCustomization> {
  const database = requireDb()

  let profile = await getProfileCustomization(userId)

  if (!profile) {
    ;[profile] = await database
      .insert(profileCustomization)
      .values({ userId })
      .returning()

    logger.info('Profile customization created', { userId })
  }

  return profile
}

/**
 * Update profile display name
 */
export async function updateDisplayName(
  userId: string,
  displayName: string
): Promise<ProfileCustomization> {
  const database = requireDb()

  // Validate display name
  const sanitized = displayName.trim()
  if (sanitized.length < 2 || sanitized.length > 30) {
    throw new Error('Display name must be 2-30 characters')
  }

  // Check for inappropriate content (basic filter)
  const forbidden = ['admin', 'mod', 'staff', 'system', 'null', 'undefined']
  if (forbidden.some((word) => sanitized.toLowerCase().includes(word))) {
    throw new Error('Display name contains forbidden words')
  }

  await getOrCreateProfileCustomization(userId)

  const [updated] = await database
    .update(profileCustomization)
    .set({ displayName: sanitized, updatedAt: new Date() })
    .where(eq(profileCustomization.userId, userId))
    .returning()

  return updated
}

/**
 * Update selected avatar
 */
export async function updateAvatar(
  userId: string,
  avatarId: AvatarId
): Promise<ProfileCustomization> {
  const database = requireDb()

  // Check if avatar is valid
  const avatar = AVATARS.find((a) => a.id === avatarId)
  if (!avatar) {
    throw new Error('Invalid avatar')
  }

  // Get current profile
  const profile = await getOrCreateProfileCustomization(userId)

  // Check if avatar is unlocked
  if (!profile.unlockedAvatars?.includes(avatarId) && avatarId !== 'default') {
    throw new Error('Avatar not unlocked')
  }

  const [updated] = await database
    .update(profileCustomization)
    .set({ avatarId, updatedAt: new Date() })
    .where(eq(profileCustomization.userId, userId))
    .returning()

  return updated
}

/**
 * Update selected frame
 */
export async function updateFrame(
  userId: string,
  frameId: FrameId
): Promise<ProfileCustomization> {
  const database = requireDb()

  // Check if frame is valid
  const frame = FRAMES.find((f) => f.id === frameId)
  if (!frame) {
    throw new Error('Invalid frame')
  }

  // Get current profile
  const profile = await getOrCreateProfileCustomization(userId)

  // Check if frame is unlocked
  if (!profile.unlockedFrames?.includes(frameId) && frameId !== 'none') {
    throw new Error('Frame not unlocked')
  }

  const [updated] = await database
    .update(profileCustomization)
    .set({ frameId, updatedAt: new Date() })
    .where(eq(profileCustomization.userId, userId))
    .returning()

  return updated
}

/**
 * Update selected theme
 */
export async function updateTheme(
  userId: string,
  themeId: ThemeId
): Promise<ProfileCustomization> {
  const database = requireDb()

  // Check if theme is valid
  const theme = THEMES.find((t) => t.id === themeId)
  if (!theme) {
    throw new Error('Invalid theme')
  }

  // Get current profile
  const profile = await getOrCreateProfileCustomization(userId)

  // Check if theme is unlocked
  if (!profile.unlockedThemes?.includes(themeId) && themeId !== 'default') {
    throw new Error('Theme not unlocked')
  }

  const [updated] = await database
    .update(profileCustomization)
    .set({ themeId, updatedAt: new Date() })
    .where(eq(profileCustomization.userId, userId))
    .returning()

  return updated
}

/**
 * Update profile card visibility settings
 */
export async function updateProfileCardSettings(
  userId: string,
  settings: {
    showLevel?: boolean
    showStreak?: boolean
    showTitle?: boolean
    showStats?: boolean
  }
): Promise<ProfileCustomization> {
  const database = requireDb()

  await getOrCreateProfileCustomization(userId)

  const [updated] = await database
    .update(profileCustomization)
    .set({
      ...settings,
      updatedAt: new Date(),
    })
    .where(eq(profileCustomization.userId, userId))
    .returning()

  return updated
}

/**
 * Unlock an avatar for a user
 */
export async function unlockAvatar(
  userId: string,
  avatarId: AvatarId
): Promise<ProfileCustomization> {
  const database = requireDb()

  const profile = await getOrCreateProfileCustomization(userId)
  const currentAvatars = profile.unlockedAvatars ?? ['default']

  if (currentAvatars.includes(avatarId)) {
    return profile // Already unlocked
  }

  const newAvatars = [...currentAvatars, avatarId]

  const [updated] = await database
    .update(profileCustomization)
    .set({ unlockedAvatars: newAvatars, updatedAt: new Date() })
    .where(eq(profileCustomization.userId, userId))
    .returning()

  logger.info('Avatar unlocked', { userId, avatarId })

  return updated
}

/**
 * Unlock a frame for a user
 */
export async function unlockFrame(
  userId: string,
  frameId: FrameId
): Promise<ProfileCustomization> {
  const database = requireDb()

  const profile = await getOrCreateProfileCustomization(userId)
  const currentFrames = profile.unlockedFrames ?? ['none']

  if (currentFrames.includes(frameId)) {
    return profile // Already unlocked
  }

  const newFrames = [...currentFrames, frameId]

  const [updated] = await database
    .update(profileCustomization)
    .set({ unlockedFrames: newFrames, updatedAt: new Date() })
    .where(eq(profileCustomization.userId, userId))
    .returning()

  logger.info('Frame unlocked', { userId, frameId })

  return updated
}

/**
 * Unlock a theme for a user
 */
export async function unlockTheme(
  userId: string,
  themeId: ThemeId
): Promise<ProfileCustomization> {
  const database = requireDb()

  const profile = await getOrCreateProfileCustomization(userId)
  const currentThemes = profile.unlockedThemes ?? ['default']

  if (currentThemes.includes(themeId)) {
    return profile // Already unlocked
  }

  const newThemes = [...currentThemes, themeId]

  const [updated] = await database
    .update(profileCustomization)
    .set({ unlockedThemes: newThemes, updatedAt: new Date() })
    .where(eq(profileCustomization.userId, userId))
    .returning()

  logger.info('Theme unlocked', { userId, themeId })

  return updated
}

/**
 * Get all customization options with unlock status
 */
export function getCustomizationOptions(profile: ProfileCustomization | null) {
  const unlockedAvatars = profile?.unlockedAvatars ?? ['default']
  const unlockedFrames = profile?.unlockedFrames ?? ['none']
  const unlockedThemes = profile?.unlockedThemes ?? ['default']

  return {
    avatars: AVATARS.map((avatar) => ({
      ...avatar,
      unlocked: unlockedAvatars.includes(avatar.id),
      selected: profile?.avatarId === avatar.id,
    })),
    frames: FRAMES.map((frame) => ({
      ...frame,
      unlocked: unlockedFrames.includes(frame.id),
      selected: profile?.frameId === frame.id,
    })),
    themes: THEMES.map((theme) => ({
      ...theme,
      unlocked: unlockedThemes.includes(theme.id),
      selected: profile?.themeId === theme.id,
    })),
  }
}

/**
 * Check and unlock items based on player progress
 */
export async function checkAndUnlockItems(
  userId: string,
  playerData: {
    level: number
    streakDays: number
    stats: { STR: number; AGI: number; VIT: number; DISC: number }
    bossDefeats: number
    dungeonClears: number
    perfectDays: number
    seasonCompletions: number
  }
): Promise<{ avatars: AvatarId[]; frames: FrameId[]; themes: ThemeId[] }> {
  const unlocked: { avatars: AvatarId[]; frames: FrameId[]; themes: ThemeId[] } = {
    avatars: [],
    frames: [],
    themes: [],
  }

  // Check avatars
  for (const avatar of AVATARS) {
    if (!avatar.requirement) continue

    let shouldUnlock = false
    const req = avatar.requirement

    if (req.type === 'level' && playerData.level >= req.value) {
      shouldUnlock = true
    } else if (req.type === 'streak' && playerData.streakDays >= req.value) {
      shouldUnlock = true
    } else if (req.type === 'stat') {
      const statKey = req.stat as keyof typeof playerData.stats
      if (playerData.stats[statKey] >= req.value) {
        shouldUnlock = true
      }
    } else if (req.type === 'boss_defeats' && playerData.bossDefeats >= req.value) {
      shouldUnlock = true
    } else if (req.type === 'dungeon_clears' && playerData.dungeonClears >= req.value) {
      shouldUnlock = true
    } else if (req.type === 'perfect_days' && playerData.perfectDays >= req.value) {
      shouldUnlock = true
    }

    if (shouldUnlock) {
      await unlockAvatar(userId, avatar.id as AvatarId)
      unlocked.avatars.push(avatar.id as AvatarId)
    }
  }

  // Check frames
  for (const frame of FRAMES) {
    if (!frame.requirement) continue

    let shouldUnlock = false
    const req = frame.requirement

    if (req.type === 'level' && playerData.level >= req.value) {
      shouldUnlock = true
    } else if (req.type === 'streak' && playerData.streakDays >= req.value) {
      shouldUnlock = true
    } else if (req.type === 'boss_defeats' && playerData.bossDefeats >= req.value) {
      shouldUnlock = true
    } else if (req.type === 'dungeon_clears' && playerData.dungeonClears >= req.value) {
      shouldUnlock = true
    }

    if (shouldUnlock) {
      await unlockFrame(userId, frame.id as FrameId)
      unlocked.frames.push(frame.id as FrameId)
    }
  }

  // Check themes
  for (const theme of THEMES) {
    if (!theme.requirement) continue

    let shouldUnlock = false
    const req = theme.requirement

    if (req.type === 'level' && playerData.level >= req.value) {
      shouldUnlock = true
    } else if (req.type === 'streak' && playerData.streakDays >= req.value) {
      shouldUnlock = true
    } else if (req.type === 'boss_defeats' && playerData.bossDefeats >= req.value) {
      shouldUnlock = true
    } else if (req.type === 'season_completion' && playerData.seasonCompletions >= req.value) {
      shouldUnlock = true
    }

    if (shouldUnlock) {
      await unlockTheme(userId, theme.id as ThemeId)
      unlocked.themes.push(theme.id as ThemeId)
    }
  }

  return unlocked
}
