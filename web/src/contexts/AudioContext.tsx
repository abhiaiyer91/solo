/**
 * Audio Settings Context
 *
 * Provides global audio settings and state throughout the app.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { audioManager } from '../lib/audio'

interface AudioSettings {
  enabled: boolean
  volume: number // 0-1
}

interface AudioContextValue {
  settings: AudioSettings
  setEnabled: (enabled: boolean) => void
  setVolume: (volume: number) => void
  toggleEnabled: () => void
  isInitialized: boolean
}

const AudioContext = createContext<AudioContextValue | null>(null)

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [settings, setSettings] = useState<AudioSettings>({
    enabled: true,
    volume: 0.5,
  })

  // Sync with audio manager on mount
  useEffect(() => {
    setSettings({
      enabled: audioManager.isEnabled(),
      volume: audioManager.getVolume(),
    })
  }, [])

  // Initialize audio on first user interaction
  useEffect(() => {
    const handleInteraction = async () => {
      if (!isInitialized) {
        await audioManager.init()
        setIsInitialized(true)
        // Re-sync settings after init
        setSettings({
          enabled: audioManager.isEnabled(),
          volume: audioManager.getVolume(),
        })
      }
    }

    document.addEventListener('click', handleInteraction, { once: true })
    document.addEventListener('keydown', handleInteraction, { once: true })
    document.addEventListener('touchstart', handleInteraction, { once: true })

    return () => {
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('keydown', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
    }
  }, [isInitialized])

  const setEnabled = useCallback((enabled: boolean) => {
    audioManager.setEnabled(enabled)
    setSettings((prev) => ({ ...prev, enabled }))
  }, [])

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume))
    audioManager.setVolume(clampedVolume)
    setSettings((prev) => ({ ...prev, volume: clampedVolume }))
  }, [])

  const toggleEnabled = useCallback(() => {
    const newEnabled = !settings.enabled
    audioManager.setEnabled(newEnabled)
    setSettings((prev) => ({ ...prev, enabled: newEnabled }))
  }, [settings.enabled])

  return (
    <AudioContext.Provider
      value={{
        settings,
        setEnabled,
        setVolume,
        toggleEnabled,
        isInitialized,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export function useAudioSettings(): AudioContextValue {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudioSettings must be used within AudioProvider')
  }
  return context
}

/**
 * Sound Settings Component
 *
 * Add this to Profile or Settings page to let users control audio.
 *
 * @example
 * ```tsx
 * function SettingsPage() {
 *   return (
 *     <div>
 *       <h2>Settings</h2>
 *       <SoundSettings />
 *     </div>
 *   )
 * }
 * ```
 */
export function SoundSettings() {
  const { settings, setEnabled, setVolume, toggleEnabled } = useAudioSettings()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label htmlFor="sound-toggle" className="text-sm font-medium text-zinc-300">
          Sound Effects
        </label>
        <button
          id="sound-toggle"
          onClick={toggleEnabled}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full
            transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
            ${settings.enabled ? 'bg-indigo-600' : 'bg-zinc-700'}
          `}
          role="switch"
          aria-checked={settings.enabled}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${settings.enabled ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      {settings.enabled && (
        <div className="space-y-2">
          <label htmlFor="volume-slider" className="text-sm font-medium text-zinc-400">
            Volume: {Math.round(settings.volume * 100)}%
          </label>
          <input
            id="volume-slider"
            type="range"
            min="0"
            max="100"
            value={settings.volume * 100}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Off</span>
            <span>Max</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default AudioContext
