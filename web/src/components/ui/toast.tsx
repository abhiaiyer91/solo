import { toast as sonnerToast, Toaster as SonnerToaster } from 'sonner'

/**
 * Custom toast functions styled for Journey theme
 */
export const toast = {
  /**
   * Success toast for quest completions, level ups, etc.
   */
  success: (message: string, options?: { description?: string }) => {
    sonnerToast.success(message, {
      description: options?.description,
      duration: 4000,
      className: 'system-toast-success',
    })
  },

  /**
   * Error toast for failures
   */
  error: (message: string, options?: { description?: string }) => {
    sonnerToast.error(message, {
      description: options?.description,
      duration: 4000,
      className: 'system-toast-error',
    })
  },

  /**
   * XP award toast with formatted XP display
   */
  xp: (amount: number, source: string) => {
    sonnerToast.success(`+${amount} XP`, {
      description: source,
      duration: 3000,
      className: 'system-toast-xp',
    })
  },

  /**
   * Level up celebration toast
   */
  levelUp: (newLevel: number) => {
    sonnerToast.success(`LEVEL ${newLevel}`, {
      description: 'The System has recorded your growth.',
      duration: 5000,
      className: 'system-toast-levelup',
    })
  },

  /**
   * System message toast (neutral, informational)
   */
  system: (message: string) => {
    sonnerToast(message, {
      duration: 3000,
      className: 'system-toast-info',
    })
  },

  /**
   * Warning toast
   */
  warning: (message: string, options?: { description?: string }) => {
    sonnerToast.warning(message, {
      description: options?.description,
      duration: 4000,
      className: 'system-toast-warning',
    })
  },
}

/**
 * Toast provider component - wrap app with this
 */
export function ToastProvider() {
  return (
    <SonnerToaster
      position="top-right"
      expand={false}
      richColors={false}
      closeButton
      toastOptions={{
        style: {
          background: 'hsl(0 0% 5%)',
          border: '1px solid hsl(220 10% 20%)',
          color: 'hsl(0 0% 90%)',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: '0.875rem',
        },
        className: 'system-toast',
      }}
    />
  )
}

export default toast
