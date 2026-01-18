import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuestCard } from './QuestCard'
import type { Quest } from '@/hooks/useQuests'

const createMockQuest = (overrides: Partial<Quest> = {}): Quest => ({
  id: 'quest-1',
  templateId: 'template-1',
  name: 'Daily Steps',
  description: 'Walk 10,000 steps today',
  type: 'DAILY',
  category: 'MOVEMENT',
  isCore: true,
  baseXP: 50,
  statType: 'AGI',
  statBonus: 1,
  allowPartial: true,
  minPartialPercent: 50,
  status: 'ACTIVE',
  currentValue: 5000,
  targetValue: 10000,
  completionPercent: 50,
  completedAt: null,
  xpAwarded: null,
  questDate: '2026-01-18',
  requirement: { type: 'numeric', metric: 'steps', operator: 'gte', value: 10000 },
  ...overrides,
})

describe('QuestCard', () => {
  describe('Rendering', () => {
    it('should render quest name', () => {
      const quest = createMockQuest()
      render(<QuestCard quest={quest} onClick={() => {}} />)

      expect(screen.getByText('Daily Steps')).toBeInTheDocument()
    })

    it('should render quest description', () => {
      const quest = createMockQuest()
      render(<QuestCard quest={quest} onClick={() => {}} />)

      expect(screen.getByText('Walk 10,000 steps today')).toBeInTheDocument()
    })

    it('should render quest category', () => {
      const quest = createMockQuest()
      render(<QuestCard quest={quest} onClick={() => {}} />)

      expect(screen.getByText('MOVEMENT')).toBeInTheDocument()
    })

    it('should render CORE badge for core quests', () => {
      const quest = createMockQuest({ isCore: true })
      render(<QuestCard quest={quest} onClick={() => {}} />)

      expect(screen.getByText('CORE')).toBeInTheDocument()
    })

    it('should not render CORE badge for non-core quests', () => {
      const quest = createMockQuest({ isCore: false })
      render(<QuestCard quest={quest} onClick={() => {}} />)

      expect(screen.queryByText('CORE')).not.toBeInTheDocument()
    })

    it('should render base XP for active quest', () => {
      const quest = createMockQuest({ status: 'ACTIVE', baseXP: 50 })
      render(<QuestCard quest={quest} onClick={() => {}} />)

      expect(screen.getByText('+50 XP')).toBeInTheDocument()
    })

    it('should render progress for pending quest', () => {
      const quest = createMockQuest({ currentValue: 5000, targetValue: 10000 })
      render(<QuestCard quest={quest} onClick={() => {}} />)

      expect(screen.getByText('5000 / 10000')).toBeInTheDocument()
    })
  })

  describe('Status-based rendering', () => {
    it('should render completed status with green styling', () => {
      const quest = createMockQuest({
        status: 'COMPLETED',
        xpAwarded: 55,
        completionPercent: 100,
      })
      const { container } = render(<QuestCard quest={quest} onClick={() => {}} />)

      expect(screen.getByText('COMPLETED')).toBeInTheDocument()
      expect(screen.getByText('+55 XP')).toBeInTheDocument()

      // Check for green border styling
      expect(container.firstChild).toHaveClass('border-system-green/50')
    })

    it('should render failed status with red styling', () => {
      const quest = createMockQuest({
        status: 'FAILED',
        completionPercent: 30,
      })
      const { container } = render(<QuestCard quest={quest} onClick={() => {}} />)

      expect(screen.getByText('FAILED')).toBeInTheDocument()
      expect(container.firstChild).toHaveClass('border-system-red/50')
    })

    it('should not show progress numbers for completed quest', () => {
      const quest = createMockQuest({
        status: 'COMPLETED',
        currentValue: 10000,
        targetValue: 10000,
        completionPercent: 100,
      })
      render(<QuestCard quest={quest} onClick={() => {}} />)

      expect(screen.queryByText('10000 / 10000')).not.toBeInTheDocument()
    })

    it('should not show progress numbers for failed quest', () => {
      const quest = createMockQuest({
        status: 'FAILED',
        currentValue: 3000,
        targetValue: 10000,
        completionPercent: 30,
      })
      render(<QuestCard quest={quest} onClick={() => {}} />)

      expect(screen.queryByText('3000 / 10000')).not.toBeInTheDocument()
    })
  })

  describe('Click handling', () => {
    it('should call onClick when active quest is clicked', () => {
      const handleClick = vi.fn()
      const quest = createMockQuest({ status: 'ACTIVE' })
      render(<QuestCard quest={quest} onClick={handleClick} />)

      fireEvent.click(screen.getByText('Daily Steps'))
      expect(handleClick).toHaveBeenCalled()
    })

    it('should not call onClick when completed quest is clicked', () => {
      const handleClick = vi.fn()
      const quest = createMockQuest({ status: 'COMPLETED' })
      render(<QuestCard quest={quest} onClick={handleClick} />)

      fireEvent.click(screen.getByText('Daily Steps'))
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should not call onClick when failed quest is clicked', () => {
      const handleClick = vi.fn()
      const quest = createMockQuest({ status: 'FAILED' })
      render(<QuestCard quest={quest} onClick={handleClick} />)

      fireEvent.click(screen.getByText('Daily Steps'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Completing state', () => {
    it('should show completing spinner when isCompleting is true', () => {
      const quest = createMockQuest({ status: 'ACTIVE' })
      render(<QuestCard quest={quest} onClick={() => {}} isCompleting={true} />)

      expect(screen.getByText('COMPLETING...')).toBeInTheDocument()
    })

    it('should show status when isCompleting is false', () => {
      const quest = createMockQuest({ status: 'ACTIVE' })
      render(<QuestCard quest={quest} onClick={() => {}} isCompleting={false} />)

      expect(screen.getByText('PENDING')).toBeInTheDocument()
    })
  })

  describe('Reset functionality', () => {
    it('should show undo button for completed quest with onReset handler', () => {
      const quest = createMockQuest({ status: 'COMPLETED' })
      render(<QuestCard quest={quest} onClick={() => {}} onReset={() => {}} />)

      expect(screen.getByText('Undo Completion')).toBeInTheDocument()
    })

    it('should not show undo button when onReset is not provided', () => {
      const quest = createMockQuest({ status: 'COMPLETED' })
      render(<QuestCard quest={quest} onClick={() => {}} />)

      expect(screen.queryByText('Undo Completion')).not.toBeInTheDocument()
    })

    it('should call onReset when undo button is clicked', () => {
      const handleReset = vi.fn()
      const quest = createMockQuest({ status: 'COMPLETED' })
      render(<QuestCard quest={quest} onClick={() => {}} onReset={handleReset} />)

      fireEvent.click(screen.getByText('Undo Completion'))
      expect(handleReset).toHaveBeenCalled()
    })

    it('should show undoing text when isResetting is true', () => {
      const quest = createMockQuest({ status: 'COMPLETED' })
      render(
        <QuestCard quest={quest} onClick={() => {}} onReset={() => {}} isResetting={true} />
      )

      expect(screen.getByText('Undoing...')).toBeInTheDocument()
    })

    it('should disable undo button when isResetting is true', () => {
      const quest = createMockQuest({ status: 'COMPLETED' })
      render(
        <QuestCard quest={quest} onClick={() => {}} onReset={() => {}} isResetting={true} />
      )

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })
})
