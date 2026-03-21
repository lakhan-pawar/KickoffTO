'use client'
import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  componentName?: string
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error(`[KickoffTo Error Boundary] ${this.props.componentName ?? 'Unknown'}:`, error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 20, textAlign: 'center',
          color: 'var(--text-2)', fontSize: 13,
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Something went wrong</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>
            {this.props.componentName && `${this.props.componentName} failed to load`}
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              background: 'var(--green)', color: '#fff', border: 'none',
              borderRadius: 8, padding: '6px 14px', fontSize: 12,
              cursor: 'pointer', fontWeight: 600,
            }}
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
