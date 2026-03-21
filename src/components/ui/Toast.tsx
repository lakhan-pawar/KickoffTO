'use client'
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  emoji?: string
}

interface ToastContextValue {
  showToast: (message: string, type?: Toast['type'], emoji?: string) => void
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
})

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((
    message: string,
    type: Toast['type'] = 'success',
    emoji?: string
  ) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type, emoji }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 2200)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.emoji && <span style={{ marginRight: 6 }}>{toast.emoji}</span>}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
