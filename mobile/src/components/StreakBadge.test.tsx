/**
 * StreakBadge Component Tests
 */

import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { StreakBadge, StreakBadgeCompact, StreakProgress } from './StreakBadge'

describe('StreakBadge', () => {
  describe('Basic rendering', () => {
    it('renders streak count correctly', () => {
      render(<StreakBadge streak={7} />)
      expect(screen.getByText('7')).toBeTruthy()
    })

    it('renders zero streak correctly', () => {
      render(<StreakBadge streak={0} />)
      expect(screen.getByText('0')).toBeTruthy()
    })

    it('renders large streak with label', () => {
      render(<StreakBadge streak={30} size="large" />)
      expect(screen.getByText('30')).toBeTruthy()
      expect(screen.getByText('DAY STREAK')).toBeTruthy()
    })
  })

  describe('Size variants', () => {
    it('renders small size', () => {
      render(<StreakBadge streak={5} size="small" />)
      expect(screen.getByText('5')).toBeTruthy()
    })

    it('renders medium size (default)', () => {
      render(<StreakBadge streak={10} />)
      expect(screen.getByText('10')).toBeTruthy()
    })
  })
})

describe('StreakBadgeCompact', () => {
  it('renders streak count', () => {
    render(<StreakBadgeCompact streak={15} />)
    expect(screen.getByText('15')).toBeTruthy()
  })

  it('shows fire emoji', () => {
    render(<StreakBadgeCompact streak={5} />)
    expect(screen.getByText('🔥')).toBeTruthy()
  })

  it('returns null for zero streak', () => {
    const { toJSON } = render(<StreakBadgeCompact streak={0} />)
    expect(toJSON()).toBeNull()
  })
})

describe('StreakProgress', () => {
  it('renders current and target streak', () => {
    render(<StreakProgress streak={5} nextMilestone={7} />)
    expect(screen.getByText('5/7')).toBeTruthy()
  })

  it('shows milestone label', () => {
    render(<StreakProgress streak={10} nextMilestone={30} />)
    expect(screen.getByText('Next milestone: Day 30')).toBeTruthy()
  })
})
