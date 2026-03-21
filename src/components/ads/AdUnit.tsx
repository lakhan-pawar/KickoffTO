'use client'
import { useEffect } from 'react'

interface AdUnitProps {
  slot: string
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  style?: React.CSSProperties
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export function AdUnit({ slot, format = 'auto', style }: AdUnitProps) {
  // Never show ads in development
  if (process.env.NODE_ENV !== 'production') return null
  // Never show if AdSense ID not configured
  if (!process.env.NEXT_PUBLIC_GA_ID) return null

  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [])

  return (
    <div style={{ margin: '16px 0', ...style }}>
      <p style={{
        fontSize: 9, color: 'var(--text-3)',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        marginBottom: 4,
      }}>
        Advertisement
      </p>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_GA_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
