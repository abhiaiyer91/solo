/**
 * Sound Effects Hook
 *
 * React hook for playing sound effects in components.
 * Handles audio context initialization and provides easy-to-use callbacks.
 */

import { useCallback, useEffect, useRef } from 'react'
import { audioManager, type SoundEffect } from '../lib/audio'

interface UseSoundOptions {
  volume?: number
  enabled?: boolean
}

interface UseSoundReturn {
  play: (sound: SoundEffect, options?: { volume?: number }) => void
  playOnce: (sound: SoundEffect, options?: { volume?: number }) => void
  isEnabled: boolean
  setEnabled: (enabled: boolean) => void
  volume: number
  setVolume: (volume: number) => void
}

/**
 * Hook for playing sound effects
 *
 * @example
 * ```tsx
 * function QuestCard() {
 *   const { play } = useSound()
 *
 *   const handleComplete = () => {
 *     play('quest_complete')
 *   }
 *
 *   return <button onClick={handleComplete}>Complete</button>
 * }
 * ```
 */
export function useSound(options?: UseSoundOptions): UseSoundReturn {
  const initialized = useRef(false)

  // Initialize audio on first user interaction
  useEffect(() => {
    const handleInteraction = async () => {
      if (!initialized.current) {
        await audioManager.init()
        initialized.current = true
      }
    }

    // Listen for first user interaction
    document.addEventListener('click', handleInteraction, { once: true })
    document.addEventListener('keydown', handleInteraction, { once: true })
    document.addEventListener('touchstart', handleInteraction, { once: true })

    return () => {
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('keydown', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
    }
  }, [])

  // Play sound
  const play = useCallback(
    (sound: SoundEffect, playOptions?: { volume?: number }) => {
      if (options?.enabled === false) return
      audioManager.play(sound, {
        volume: playOptions?.volume ?? options?.volume,
      })
    },
    [options?.enabled, options?.volume]
  )

  // Track which sounds have been played (for playOnce)
  const playedSounds = useRef(new Set<string>())

  // Play sound only once (useful for one-time events like unlocks)
  const playOnce = useCallback(
    (sound: SoundEffect, playOptions?: { volume?: number }) => {
      const key = `${sound}_${Date.now()}`
      if (playedSounds.current.has(sound)) return

      playedSounds.current.add(sound)
      play(sound, playOptions)

      // Clear after 1 second to allow replay
      setTimeout(() => {
        playedSounds.current.delete(sound)
      }, 1000)
    },
    [play]
  )

  // Settings controls
  const setEnabled = useCallback((enabled: boolean) => {
    audioManager.setEnabled(enabled)
  }, [])

  const setVolume = useCallback((volume: number) => {
    audioManager.setVolume(volume)
  }, [])

  return {
    play,
    playOnce,
    isEnabled: audioManager.isEnabled(),
    setEnabled,
    volume: audioManager.getVolume(),
    setVolume,
  }
}

/**
 * Hook for common game sound effects
 *
 * @example
 * ```tsx
 * function XPDisplay() {
 *   const { playXPGain, playLevelUp } = useGameSounds()
 *
 *   useEffect(() => {
 *     if (didLevelUp) playLevelUp()
 *     else if (didGainXP) playXPGain()
 *   }, [xp])
 * }
 * ```
 */
export function useGameSounds() {
  const { play, playOnce } = useSound()

  return {
    // Quest sounds
    playQuestComplete: useCallback(() => play('quest_complete'), [play]),

    // XP/Level sounds
    playXPGain: useCallback(() => play('xp_gain', { volume: 0.6 }), [play]),
    playLevelUp: useCallback(() => playOnce('level_up'), [playOnce]),

    // Boss sounds
    playBossEncounter: useCallback(() => play('boss_encounter'), [play]),
    playBossVictory: useCallback(() => playOnce('boss_victory'), [playOnce]),
    playBossDefeat: useCallback(() => play('boss_defeat'), [play]),

    // Dungeon sounds
    playDungeonEnter: useCallback(() => play('dungeon_enter'), [play]),
    playDungeonClear: useCallback(() => playOnce('dungeon_clear'), [playOnce]),

    // Misc
    playStreakBonus: useCallback(() => play('streak_bonus'), [play]),
    playUnlock: useCallback(() => playOnce('unlock'), [playOnce]),

    // UI sounds
    playClick: useCallback(() => play('button_click', { volume: 0.3 }), [play]),
    playNotification: useCallback(() => play('notification'), [play]),
    playSuccess: useCallback(() => play('success'), [play]),
    playError: useCallback(() => play('error', { volume: 0.7 }), [play]),
  }
}

export default useSound
