/**
 * useSystemMessage - Message queue management hook
 */

import { useState, useCallback, useRef } from 'react'

export type MessageVariant = 'default' | 'warning' | 'error' | 'success' | 'classified'

export interface SystemMessageItem {
  id: string
  text: string
  variant: MessageVariant
  prefix?: string
  onComplete?: () => void
}

interface UseSystemMessageReturn {
  messages: SystemMessageItem[]
  currentMessage: SystemMessageItem | null
  currentIndex: number
  hasMessages: boolean
  queueMessage: (message: Omit<SystemMessageItem, 'id'>) => string
  advance: () => void
  skipCurrent: () => void
  clearQueue: () => void
  isTyping: boolean
  setIsTyping: (typing: boolean) => void
}

/**
 * Hook for managing system message queue
 */
export function useSystemMessage(): UseSystemMessageReturn {
  const [messages, setMessages] = useState<SystemMessageItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const idCounter = useRef(0)

  const queueMessage = useCallback((message: Omit<SystemMessageItem, 'id'>) => {
    const id = `msg-${++idCounter.current}-${Date.now()}`
    setMessages((prev) => [...prev, { ...message, id }])
    return id
  }, [])

  const advance = useCallback(() => {
    const current = messages[currentIndex]
    if (current?.onComplete) {
      current.onComplete()
    }
    setCurrentIndex((prev) => prev + 1)
  }, [messages, currentIndex])

  const skipCurrent = useCallback(() => {
    setIsTyping(false)
    advance()
  }, [advance])

  const clearQueue = useCallback(() => {
    setMessages([])
    setCurrentIndex(0)
    setIsTyping(false)
  }, [])

  const currentMessage = messages[currentIndex] ?? null
  const hasMessages = currentIndex < messages.length

  return {
    messages,
    currentMessage,
    currentIndex,
    hasMessages,
    queueMessage,
    advance,
    skipCurrent,
    clearQueue,
    isTyping,
    setIsTyping,
  }
}

/**
 * Parse message tokens for effects
 */
export interface ParsedToken {
  type: 'text' | 'pause' | 'slow' | 'fast' | 'glitch' | 'redacted' | 'newline'
  content?: string
  duration?: number
}

export function parseMessageTokens(text: string): ParsedToken[] {
  const tokens: ParsedToken[] = []
  const regex = /\{\{(pause:\d+|slow|fast|glitch|redacted)\}\}|\n/g
  
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    // Add text before the token
    if (match.index > lastIndex) {
      tokens.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      })
    }

    // Parse the token
    const tokenStr = match[0]
    
    if (tokenStr === '\n') {
      tokens.push({ type: 'newline' })
    } else if (tokenStr.startsWith('{{pause:')) {
      const duration = parseInt(tokenStr.match(/\d+/)?.[0] ?? '1000', 10)
      tokens.push({ type: 'pause', duration })
    } else if (tokenStr === '{{slow}}') {
      tokens.push({ type: 'slow' })
    } else if (tokenStr === '{{fast}}') {
      tokens.push({ type: 'fast' })
    } else if (tokenStr === '{{glitch}}') {
      tokens.push({ type: 'glitch' })
    } else if (tokenStr === '{{redacted}}') {
      tokens.push({ type: 'redacted' })
    }

    lastIndex = regex.lastIndex
  }

  // Add remaining text
  if (lastIndex < text.length) {
    tokens.push({
      type: 'text',
      content: text.slice(lastIndex),
    })
  }

  return tokens
}

/**
 * Get prefix for message variant
 */
export function getMessagePrefix(variant: MessageVariant): string {
  const prefixes: Record<MessageVariant, string> = {
    default: '● SYSTEM',
    warning: '! WARNING',
    error: '[ERROR]',
    success: '✓ CONFIRMED',
    classified: '◆ CLASSIFIED',
  }
  return prefixes[variant]
}

/**
 * Get variant styles
 */
export function getVariantStyles(variant: MessageVariant): string {
  const styles: Record<MessageVariant, string> = {
    default: 'border-system-blue text-system-blue',
    warning: 'border-yellow-500 text-yellow-500',
    error: 'border-red-500 text-red-500',
    success: 'border-system-accent text-system-accent',
    classified: 'border-purple-500 text-purple-500',
  }
  return styles[variant]
}
