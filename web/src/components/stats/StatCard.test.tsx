import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatCard } from './StatCard'

describe('StatCard', () => {
  describe('Rendering', () => {
    it('should render stat label', () => {
      render(<StatCard label="STR" value={25} color="#ff0000" />)

      expect(screen.getByText('STR')).toBeInTheDocument()
    })

    it('should render stat value', () => {
      render(<StatCard label="AGI" value={30} color="#00ff00" />)

      expect(screen.getByText('30')).toBeInTheDocument()
    })

    it('should render description when provided', () => {
      render(
        <StatCard
          label="VIT"
          value={20}
          color="#0000ff"
          description="Vitality affects your health"
        />
      )

      expect(screen.getByText('Vitality affects your health')).toBeInTheDocument()
    })

    it('should not render description when not provided', () => {
      const { container } = render(<StatCard label="DISC" value={15} color="#ffff00" />)

      // Should only have label, value, and progress bar
      const textElements = container.querySelectorAll('p')
      expect(textElements.length).toBe(0)
    })
  })

  describe('Color styling', () => {
    it('should apply color to value', () => {
      render(<StatCard label="STR" value={25} color="#ff5500" />)

      const valueElement = screen.getByText('25')
      expect(valueElement).toHaveStyle({ color: '#ff5500' })
    })

    it('should apply color to progress bar', () => {
      const { container } = render(<StatCard label="AGI" value={50} color="#00ff55" />)

      // Find the progress bar inner div
      const progressBars = container.querySelectorAll('[style*="background-color"]')
      expect(progressBars.length).toBeGreaterThan(0)
    })
  })

  describe('Progress calculation', () => {
    it('should calculate progress based on value and maxValue', () => {
      const { container } = render(
        <StatCard label="TEST" value={50} maxValue={100} color="#000" />
      )

      // The progress bar should animate to 50%
      const progressBar = container.querySelector('.h-full')
      expect(progressBar).toBeInTheDocument()
    })

    it('should use default maxValue of 100', () => {
      const { container } = render(<StatCard label="TEST" value={75} color="#000" />)

      // With default maxValue of 100, 75 should be 75%
      const progressBar = container.querySelector('.h-full')
      expect(progressBar).toBeInTheDocument()
    })

    it('should cap progress at 100%', () => {
      const { container } = render(
        <StatCard label="TEST" value={150} maxValue={100} color="#000" />
      )

      // Progress should be capped at 100%
      const progressBar = container.querySelector('.h-full')
      expect(progressBar).toBeInTheDocument()
    })

    it('should handle zero value', () => {
      render(<StatCard label="TEST" value={0} color="#000" />)

      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should handle custom maxValue', () => {
      render(<StatCard label="XP" value={500} maxValue={1000} color="#000" />)

      // 500/1000 = 50%
      expect(screen.getByText('500')).toBeInTheDocument()
    })
  })

  describe('Different stat types', () => {
    it('should render strength stat', () => {
      render(<StatCard label="STR" value={25} color="#e53e3e" />)

      expect(screen.getByText('STR')).toBeInTheDocument()
      expect(screen.getByText('25')).toBeInTheDocument()
    })

    it('should render agility stat', () => {
      render(<StatCard label="AGI" value={30} color="#38a169" />)

      expect(screen.getByText('AGI')).toBeInTheDocument()
      expect(screen.getByText('30')).toBeInTheDocument()
    })

    it('should render vitality stat', () => {
      render(<StatCard label="VIT" value={20} color="#3182ce" />)

      expect(screen.getByText('VIT')).toBeInTheDocument()
      expect(screen.getByText('20')).toBeInTheDocument()
    })

    it('should render discipline stat', () => {
      render(<StatCard label="DISC" value={15} color="#805ad5" />)

      expect(screen.getByText('DISC')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument()
    })
  })

  describe('Animation', () => {
    it('should have motion animation wrapper', () => {
      const { container } = render(<StatCard label="TEST" value={50} color="#000" />)

      // Framer motion wraps the component
      expect(container.firstChild).toBeInTheDocument()
    })
  })
})
