/**
 * PsychologyChat - AI conversation interface for psychology assessment
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStartPsychology, usePsychologyRespond, type PsychologyMessage } from '@/hooks/useOnboarding'

interface PsychologyChatProps {
  onComplete: () => void
  onSkip: () => void
}

export function PsychologyChat({ onComplete, onSkip }: PsychologyChatProps) {
  const [messages, setMessages] = useState<PsychologyMessage[]>([])
  const [input, setInput] = useState('')
  const [isStarted, setIsStarted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const startMutation = useStartPsychology()
  const respondMutation = usePsychologyRespond()

  const isTyping = startMutation.isPending || respondMutation.isPending

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Start the conversation
  const handleStart = async () => {
    try {
      const result = await startMutation.mutateAsync()
      setIsStarted(true)
      setMessages([{
        role: 'assistant',
        content: result.initialMessage,
        timestamp: new Date().toISOString(),
      }])
    } catch {
      // Error handled by mutation
    }
  }

  // Send user message
  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMessage: PsychologyMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')

    try {
      const result = await respondMutation.mutateAsync(input.trim())
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.response,
        timestamp: new Date().toISOString(),
      }])

      if (result.isComplete) {
        setTimeout(onComplete, 1500)
      }
    } catch {
      // Error handled by mutation
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isStarted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-md mx-auto text-center"
      >
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-system-blue mb-2">
            {'>'} PSYCHOLOGICAL CALIBRATION
          </h2>
          <p className="text-sm text-system-text-muted">
            System will analyze your behavioral patterns
          </p>
        </div>

        {/* Intro */}
        <div className="system-window p-4 mb-6 text-left">
          <div className="text-sm text-system-text-muted mb-3">
            SYSTEM NOTICE:
          </div>
          <p className="text-system-text mb-4">
            This assessment helps calibrate your experience. The System will ask 
            questions about your habits, motivations, and preferences.
          </p>
          <p className="text-system-text-muted text-sm">
            Your responses are used to personalize quest difficulty and timing.
            This typically takes 2-3 minutes.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onSkip}
            className="text-sm text-system-text-muted hover:text-system-text"
          >
            Skip Assessment
          </button>
          <button
            onClick={handleStart}
            disabled={startMutation.isPending}
            className="px-6 py-2 bg-system-blue text-system-black font-bold rounded hover:bg-system-blue/80 disabled:opacity-50"
          >
            {startMutation.isPending ? 'Initializing...' : 'Begin Assessment'}
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-md mx-auto flex flex-col h-[400px]"
    >
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold text-system-blue">
          {'>'} SYSTEM CALIBRATION
        </h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto system-window p-4 mb-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded ${
                  msg.role === 'user'
                    ? 'bg-system-blue/20 text-system-text'
                    : 'bg-system-panel text-system-text'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="text-xs text-system-blue mb-1 font-bold">SYSTEM</div>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-system-panel p-3 rounded">
              <div className="text-xs text-system-blue mb-1 font-bold">SYSTEM</div>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-system-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-system-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-system-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isTyping}
          placeholder="Type your response..."
          className="flex-1 px-3 py-2 bg-system-black border border-system-text/20 rounded text-system-text placeholder:text-system-text/30 focus:border-system-blue focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={isTyping || !input.trim()}
          className="px-4 py-2 bg-system-blue text-system-black font-bold rounded hover:bg-system-blue/80 disabled:opacity-50"
        >
          {isTyping ? '...' : '>'}
        </button>
      </div>

      {/* Skip Option */}
      <div className="text-center mt-3">
        <button
          onClick={onSkip}
          className="text-xs text-system-text-muted hover:text-system-text"
        >
          Skip remaining assessment
        </button>
      </div>
    </motion.div>
  )
}
