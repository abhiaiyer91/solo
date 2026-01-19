/**
 * Audio Manager
 *
 * Manages sound effects for the web application using Web Audio API.
 * Provides low-latency playback with volume control and preloading.
 */

// Sound effect types
export type SoundEffect =
  | 'quest_complete'
  | 'level_up'
  | 'xp_gain'
  | 'boss_encounter'
  | 'boss_victory'
  | 'boss_defeat'
  | 'dungeon_enter'
  | 'dungeon_clear'
  | 'streak_bonus'
  | 'button_click'
  | 'notification'
  | 'error'
  | 'success'
  | 'unlock'

// Sound file paths (would be placed in public/sounds/)
const SOUND_PATHS: Record<SoundEffect, string> = {
  quest_complete: '/sounds/quest-complete.mp3',
  level_up: '/sounds/level-up.mp3',
  xp_gain: '/sounds/xp-gain.mp3',
  boss_encounter: '/sounds/boss-encounter.mp3',
  boss_victory: '/sounds/boss-victory.mp3',
  boss_defeat: '/sounds/boss-defeat.mp3',
  dungeon_enter: '/sounds/dungeon-enter.mp3',
  dungeon_clear: '/sounds/dungeon-clear.mp3',
  streak_bonus: '/sounds/streak-bonus.mp3',
  button_click: '/sounds/button-click.mp3',
  notification: '/sounds/notification.mp3',
  error: '/sounds/error.mp3',
  success: '/sounds/success.mp3',
  unlock: '/sounds/unlock.mp3',
}

// Priority sounds to preload on init
const PRELOAD_SOUNDS: SoundEffect[] = [
  'quest_complete',
  'xp_gain',
  'button_click',
  'notification',
  'success',
]

class AudioManager {
  private audioContext: AudioContext | null = null
  private audioBuffers: Map<SoundEffect, AudioBuffer> = new Map()
  private masterVolume = 0.5
  private enabled = true
  private initialized = false

  /**
   * Initialize the audio context (must be called after user interaction)
   */
  async init(): Promise<void> {
    if (this.initialized) return

    try {
      // Create audio context
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioContextClass) {
        console.warn('Web Audio API not supported')
        return
      }

      this.audioContext = new AudioContextClass()
      this.initialized = true

      // Load settings from localStorage
      this.loadSettings()

      // Preload priority sounds
      await this.preloadSounds(PRELOAD_SOUNDS)
    } catch (error) {
      console.error('Failed to initialize audio:', error)
    }
  }

  /**
   * Resume audio context (needed after user interaction in some browsers)
   */
  async resume(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume()
    }
  }

  /**
   * Preload sounds into memory for instant playback
   */
  async preloadSounds(sounds: SoundEffect[]): Promise<void> {
    if (!this.audioContext) return

    const loadPromises = sounds.map(async (sound) => {
      if (this.audioBuffers.has(sound)) return

      try {
        const path = SOUND_PATHS[sound]
        const response = await fetch(path)

        if (!response.ok) {
          // Sound file doesn't exist yet - this is expected during development
          return
        }

        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer)
        this.audioBuffers.set(sound, audioBuffer)
      } catch {
        // Silently fail for missing sounds during development
      }
    })

    await Promise.allSettled(loadPromises)
  }

  /**
   * Play a sound effect
   */
  async play(sound: SoundEffect, options?: { volume?: number }): Promise<void> {
    if (!this.enabled || !this.audioContext) return

    // Ensure context is running
    await this.resume()

    // Load sound if not preloaded
    if (!this.audioBuffers.has(sound)) {
      await this.preloadSounds([sound])
    }

    const buffer = this.audioBuffers.get(sound)
    if (!buffer) {
      // Sound file doesn't exist yet
      return
    }

    try {
      // Create source and gain nodes
      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()

      source.buffer = buffer
      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      // Apply volume
      const volume = (options?.volume ?? 1) * this.masterVolume
      gainNode.gain.value = volume

      // Play
      source.start(0)
    } catch (error) {
      console.error(`Failed to play sound ${sound}:`, error)
    }
  }

  /**
   * Set master volume (0-1)
   */
  setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume))
    this.saveSettings()
  }

  /**
   * Get current master volume
   */
  getVolume(): number {
    return this.masterVolume
  }

  /**
   * Enable or disable all sounds
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    this.saveSettings()
  }

  /**
   * Check if sounds are enabled
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem(
        'journey_audio_settings',
        JSON.stringify({
          volume: this.masterVolume,
          enabled: this.enabled,
        })
      )
    } catch {
      // Ignore localStorage errors
    }
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    try {
      const data = localStorage.getItem('journey_audio_settings')
      if (data) {
        const settings = JSON.parse(data)
        this.masterVolume = settings.volume ?? 0.5
        this.enabled = settings.enabled ?? true
      }
    } catch {
      // Use defaults if settings can't be loaded
    }
  }
}

// Singleton instance
export const audioManager = new AudioManager()

// Convenience function for playing sounds
export function playSound(sound: SoundEffect, options?: { volume?: number }): void {
  audioManager.play(sound, options)
}

// Export for testing
export { AudioManager }
