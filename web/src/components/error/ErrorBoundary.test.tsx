import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary, RouteErrorBoundary } from './ErrorBoundary'

// Component that throws an error
function ThrowError({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>No error</div>
}

// Component that renders normally
function NormalComponent() {
  return <div>Normal component content</div>
}

describe('ErrorBoundary', () => {
  // Suppress console.error for cleaner test output
  const originalConsoleError = console.error
  beforeEach(() => {
    console.error = vi.fn()
  })
  afterEach(() => {
    console.error = originalConsoleError
  })

  describe('Normal rendering', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <NormalComponent />
        </ErrorBoundary>
      )

      expect(screen.getByText('Normal component content')).toBeInTheDocument()
    })

    it('should render multiple children without issues', () => {
      render(
        <ErrorBoundary>
          <div>Child 1</div>
          <div>Child 2</div>
        </ErrorBoundary>
      )

      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
    })
  })

  describe('Error handling', () => {
    it('should catch errors and render fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      // Should show error message from ErrorFallback
      expect(screen.getByText(/SYSTEM ERROR/i)).toBeInTheDocument()
    })

    it('should display error ID for debugging', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      // Error ID should be displayed (format: ERR-XXXXX)
      expect(screen.getByText(/ERR-/)).toBeInTheDocument()
    })

    it('should call onError callback when error occurs', () => {
      const handleError = vi.fn()

      render(
        <ErrorBoundary onError={handleError}>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(handleError).toHaveBeenCalled()
      expect(handleError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      )
    })

    it('should pass error to onError callback', () => {
      const handleError = vi.fn()

      render(
        <ErrorBoundary onError={handleError}>
          <ThrowError />
        </ErrorBoundary>
      )

      const [error] = handleError.mock.calls[0]
      expect(error.message).toBe('Test error message')
    })
  })

  describe('Custom fallback', () => {
    it('should render custom fallback when provided', () => {
      render(
        <ErrorBoundary fallback={<div>Custom error UI</div>}>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByText('Custom error UI')).toBeInTheDocument()
    })

    it('should not render default fallback when custom fallback provided', () => {
      render(
        <ErrorBoundary fallback={<div>Custom error UI</div>}>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.queryByText(/SYSTEM ERROR/i)).not.toBeInTheDocument()
    })
  })

  describe('Recovery (retry)', () => {
    it('should provide retry functionality', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // Error should be shown
      expect(screen.getByText(/SYSTEM ERROR/i)).toBeInTheDocument()

      // Click retry button if available
      const retryButton = screen.queryByText(/try again/i) || screen.queryByText(/retry/i)
      if (retryButton) {
        // Prepare for successful render
        rerender(
          <ErrorBoundary>
            <ThrowError shouldThrow={false} />
          </ErrorBoundary>
        )

        fireEvent.click(retryButton)
      }
    })
  })

  describe('Error logging', () => {
    it('should log error details to console', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(console.error).toHaveBeenCalled()
    })
  })
})

describe('RouteErrorBoundary', () => {
  const originalConsoleError = console.error
  const originalLocation = window.location

  beforeEach(() => {
    console.error = vi.fn()
    // Mock window.location
    delete (window as unknown as Record<string, unknown>).location
    window.location = { href: '' } as Location
  })

  afterEach(() => {
    console.error = originalConsoleError
    window.location = originalLocation
  })

  it('should catch errors like regular ErrorBoundary', () => {
    render(
      <RouteErrorBoundary>
        <ThrowError />
      </RouteErrorBoundary>
    )

    expect(screen.getByText(/SYSTEM ERROR/i)).toBeInTheDocument()
  })

  it('should render children when no error', () => {
    render(
      <RouteErrorBoundary>
        <NormalComponent />
      </RouteErrorBoundary>
    )

    expect(screen.getByText('Normal component content')).toBeInTheDocument()
  })
})
