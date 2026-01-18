/**
 * Sound Effects Library
 * 
 * Provides audio feedback for game events.
 * Uses Web Audio API for low-latency playback.
 */

export type SoundType = 'levelUp' | 'xpGain' | 'questComplete' | 'error' | 'click' | 'streakMilestone'

// Sound URLs - can be replaced with actual sound files
const SOUND_URLS: Record<SoundType, string> = {
  levelUp: '/sounds/level-up.mp3',
  xpGain: '/sounds/xp-gain.mp3',
  questComplete: '/sounds/quest-complete.mp3',
  error: '/sounds/error.mp3',
  click: '/sounds/click.mp3',
  streakMilestone: '/sounds/streak-milestone.mp3',
}

// Audio context singleton
let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    } catch (e) {
      console.warn('Web Audio API not supported')
      return null
    }
  }
  
  return audioContext
}

// Sound cache for preloaded audio
const soundCache = new Map<string, AudioBuffer>()

/**
 * Preload a sound for faster playback
 */
export async function preloadSound(type: SoundType): Promise<void> {
  const ctx = getAudioContext()
  if (!ctx) return
  
  const url = SOUND_URLS[type]
  if (soundCache.has(url)) return
  
  try {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
    soundCache.set(url, audioBuffer)
  } catch (e) {
    // Sound file may not exist - fail silently
    console.debug(`Sound not loaded: ${type}`)
  }
}

/**
 * Play a sound effect
 */
export function playSound(type: SoundType, volume = 0.5): void {
  const ctx = getAudioContext()
  if (!ctx) return
  
  const url = SOUND_URLS[type]
  const buffer = soundCache.get(url)
  
  if (buffer) {
    // Use cached buffer for low-latency playback
    const source = ctx.createBufferSource()
    const gainNode = ctx.createGain()
    
    source.buffer = buffer
    gainNode.gain.value = volume
    
    source.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    source.start(0)
  } else {
    // Fallback: try to load and play
    preloadSound(type)
    // Don't play this time - will be ready next time
  }
}

/**
 * Preload all sounds
 */
export async function preloadAllSounds(): Promise<void> {
  const types: SoundType[] = ['levelUp', 'xpGain', 'questComplete', 'error', 'click', 'streakMilestone']
  await Promise.all(types.map(preloadSound))
}
