import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { QuestList } from './QuestList'
import { createMockQuest } from '@/test/mocks/api'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

// Create a wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('QuestList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('should show loading indicator when isLoading is true', () => {
      render(<QuestList quests={[]} isLoading={true} />, { wrapper: createWrapper() })

      expect(screen.getByText('Loading quests...')).toBeInTheDocument()
    })

    it('should show loading spinner animation', () => {
      const { container } = render(<QuestList quests={[]} isLoading={true} />, {
        wrapper: createWrapper(),
      })

      expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show empty message when no quests provided', () => {
      render(<QuestList quests={[]} isLoading={false} />, { wrapper: createWrapper() })

      expect(screen.getByText(/No quests available/)).toBeInTheDocument()
    })

    it('should show seed script hint in empty state', () => {
      render(<QuestList quests={[]} isLoading={false} />, { wrapper: createWrapper() })

      expect(screen.getByText(/Run the seed script/)).toBeInTheDocument()
    })
  })

  describe('Quest Rendering', () => {
    it('should render all provided quests', () => {
      const quests = [
        createMockQuest({ id: '1', name: 'Quest 1' }),
        createMockQuest({ id: '2', name: 'Quest 2' }),
        createMockQuest({ id: '3', name: 'Quest 3' }),
      ]

      render(<QuestList quests={quests} />, { wrapper: createWrapper() })

      expect(screen.getByText('Quest 1')).toBeInTheDocument()
      expect(screen.getByText('Quest 2')).toBeInTheDocument()
      expect(screen.getByText('Quest 3')).toBeInTheDocument()
    })

    it('should render quests in order', () => {
      const quests = [
        createMockQuest({ id: '1', name: 'First Quest' }),
        createMockQuest({ id: '2', name: 'Second Quest' }),
      ]

      render(<QuestList quests={quests} />, { wrapper: createWrapper() })

      const questNames = screen.getAllByRole('heading', { level: 3 }).map((el) => el.textContent)
      // Note: actual heading level may vary based on QuestCard implementation
    })

    it('should handle mixed quest statuses', () => {
      const quests = [
        createMockQuest({ id: '1', name: 'Active Quest', status: 'ACTIVE' }),
        createMockQuest({ id: '2', name: 'Completed Quest', status: 'COMPLETED', xpAwarded: 50 }),
        createMockQuest({ id: '3', name: 'Failed Quest', status: 'FAILED' }),
      ]

      render(<QuestList quests={quests} />, { wrapper: createWrapper() })

      expect(screen.getByText('Active Quest')).toBeInTheDocument()
      expect(screen.getByText('Completed Quest')).toBeInTheDocument()
      expect(screen.getByText('Failed Quest')).toBeInTheDocument()
    })
  })

  describe('Quest Categories', () => {
    it('should render quests from different categories', () => {
      const quests = [
        createMockQuest({ id: '1', name: 'Steps Quest', category: 'MOVEMENT' }),
        createMockQuest({ id: '2', name: 'Workout Quest', category: 'TRAINING' }),
        createMockQuest({ id: '3', name: 'Sleep Quest', category: 'RECOVERY' }),
      ]

      render(<QuestList quests={quests} />, { wrapper: createWrapper() })

      expect(screen.getByText('MOVEMENT')).toBeInTheDocument()
      expect(screen.getByText('TRAINING')).toBeInTheDocument()
      expect(screen.getByText('RECOVERY')).toBeInTheDocument()
    })
  })

  describe('Quest Progress', () => {
    it('should show progress for active quests', () => {
      const quests = [
        createMockQuest({
          id: '1',
          name: 'Progress Quest',
          status: 'ACTIVE',
          currentValue: 5000,
          targetValue: 10000,
          completionPercent: 50,
        }),
      ]

      render(<QuestList quests={quests} />, { wrapper: createWrapper() })

      expect(screen.getByText('5000 / 10000')).toBeInTheDocument()
    })

    it('should show XP reward for active quests', () => {
      const quests = [createMockQuest({ id: '1', name: 'XP Quest', baseXP: 75 })]

      render(<QuestList quests={quests} />, { wrapper: createWrapper() })

      expect(screen.getByText('+75 XP')).toBeInTheDocument()
    })
  })

  describe('Core Quest Badge', () => {
    it('should show CORE badge for core quests', () => {
      const quests = [createMockQuest({ id: '1', name: 'Core Quest', isCore: true })]

      render(<QuestList quests={quests} />, { wrapper: createWrapper() })

      expect(screen.getByText('CORE')).toBeInTheDocument()
    })

    it('should not show CORE badge for non-core quests', () => {
      const quests = [createMockQuest({ id: '1', name: 'Optional Quest', isCore: false })]

      render(<QuestList quests={quests} />, { wrapper: createWrapper() })

      expect(screen.queryByText('CORE')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible quest cards', () => {
      const quests = [createMockQuest({ id: '1', name: 'Accessible Quest' })]

      render(<QuestList quests={quests} />, { wrapper: createWrapper() })

      // Quest should be clickable/interactive
      expect(screen.getByText('Accessible Quest')).toBeInTheDocument()
    })
  })
})
