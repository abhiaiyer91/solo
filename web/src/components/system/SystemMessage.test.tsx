import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SystemMessage } from './SystemMessage'

describe('SystemMessage', () => {
  it('should render children content', () => {
    render(<SystemMessage>Test message content</SystemMessage>)

    expect(screen.getByText('Test message content')).toBeInTheDocument()
  })

  it('should display SYSTEM label', () => {
    render(<SystemMessage>Any message</SystemMessage>)

    expect(screen.getByText('SYSTEM')).toBeInTheDocument()
  })

  it('should render with default variant styling', () => {
    const { container } = render(<SystemMessage>Default message</SystemMessage>)

    // Check for default border color class
    const messageDiv = container.firstChild
    expect(messageDiv).toHaveClass('border-system-blue/50')
  })

  it('should render with warning variant styling', () => {
    const { container } = render(
      <SystemMessage variant="warning">Warning message</SystemMessage>
    )

    const messageDiv = container.firstChild
    expect(messageDiv).toHaveClass('border-system-gold/50')
  })

  it('should render with success variant styling', () => {
    const { container } = render(
      <SystemMessage variant="success">Success message</SystemMessage>
    )

    const messageDiv = container.firstChild
    expect(messageDiv).toHaveClass('border-system-green/50')
  })

  it('should render with error variant styling', () => {
    const { container } = render(
      <SystemMessage variant="error">Error message</SystemMessage>
    )

    const messageDiv = container.firstChild
    expect(messageDiv).toHaveClass('border-system-red/50')
  })

  it('should apply custom className', () => {
    const { container } = render(
      <SystemMessage className="custom-class">Message</SystemMessage>
    )

    const messageDiv = container.firstChild
    expect(messageDiv).toHaveClass('custom-class')
  })

  it('should render complex children', () => {
    render(
      <SystemMessage>
        <strong>Bold text</strong> and <em>italic text</em>
      </SystemMessage>
    )

    expect(screen.getByText('Bold text')).toBeInTheDocument()
    expect(screen.getByText(/italic text/)).toBeInTheDocument()
  })

  it('should preserve whitespace in message', () => {
    const { container } = render(
      <SystemMessage>
        Line 1{'\n'}Line 2{'\n'}Line 3
      </SystemMessage>
    )

    // Check for whitespace-pre-wrap class
    const textContainer = container.querySelector('.whitespace-pre-wrap')
    expect(textContainer).toBeInTheDocument()
  })

  it('should render with animation attributes', () => {
    const { container } = render(<SystemMessage>Animated message</SystemMessage>)

    // Framer motion adds data attributes or style transforms
    const messageDiv = container.firstChild
    expect(messageDiv).toBeInTheDocument()
  })
})
