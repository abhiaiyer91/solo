/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        system: {
          black: '#0a0a0f',
          dark: '#12121a',
          panel: '#1a1a24',
          border: '#2a2a3a',
          blue: '#4a9eff',
          'blue-glow': '#4a9eff40',
          purple: '#9b5de5',
          'purple-glow': '#9b5de540',
          gold: '#ffd700',
          red: '#ff4757',
          green: '#2ed573',
          orange: '#ff7f50',
          text: '#e4e4e7',
          'text-muted': '#71717a',
          'text-bright': '#ffffff',
        },
        stat: {
          str: '#ff6b6b',
          agi: '#4ecdc4',
          vit: '#45b7d1',
          disc: '#f9ca24',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(74, 158, 255, 0.25)',
        'glow-lg': '0 0 40px rgba(74, 158, 255, 0.35)',
      },
    },
  },
  plugins: [],
}
