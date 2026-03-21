'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface LiveMatch {
  id: string
  homeTeam: { name: string; flag: string }
  awayTeam: { name: string; flag: string }
  homeScore: number
  awayScore: number
  minute: number | null
  status: 'live' | 'finished' | 'scheduled'
}

export function MiniPlayer() {
  const [liveMatch, setLiveMatch] = useState<LiveMatch | null>(null)
  const pathname = usePathname()

  // Don't show on the live match page itself
  const isOnLivePage = pathname?.startsWith('/live/')

  useEffect(() => {
    if (isOnLivePage) {
      setLiveMatch(null)
      return
    }

    async function checkLive() {
      try {
        const res = await fetch('/api/live/current')
        if (!res.ok) return
        const data = await res.json()
        if (data.match) setLiveMatch(data.match)
        else setLiveMatch(null)
      } catch {}
    }

    checkLive()
    // Poll every 30 seconds
    const interval = setInterval(checkLive, 30000)
    return () => clearInterval(interval)
  }, [isOnLivePage])

  if (!liveMatch || isOnLivePage) return null

  return (
    <Link href={`/live/${liveMatch.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        position: 'fixed',
        bottom: 56, // above BottomNav
        left: 0, right: 0,
        height: 40,
        zIndex: 150,
        background: 'rgba(10,10,10,0.95)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderTop: '1px solid rgba(22,163,74,0.3)',
        display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: 10,
      }}>
        {/* Live indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--green)', display: 'inline-block',
            animation: 'livePulse 1.5s ease-in-out infinite',
          }} />
          <span style={{
            fontSize: 9, fontWeight: 700, color: 'var(--green)',
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            LIVE
          </span>
        </div>

        {/* Score */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          gap: 8, justifyContent: 'center',
        }}>
          <span style={{ fontSize: 16 }}>{liveMatch.homeTeam.flag}</span>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800,
            fontVariantNumeric: 'tabular-nums', color: 'var(--text)',
            letterSpacing: -0.5,
          }}>
            {liveMatch.homeScore} – {liveMatch.awayScore}
          </span>
          <span style={{ fontSize: 16 }}>{liveMatch.awayTeam.flag}</span>
        </div>

        {/* Minute */}
        <div style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {liveMatch.minute !== null && (
            <span style={{
              fontSize: 11, color: 'var(--text-3)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {liveMatch.minute}&apos;
            </span>
          )}
          <span style={{
            fontSize: 10, color: 'var(--green)', fontWeight: 600,
          }}>
            Watch →
          </span>
        </div>
      </div>
    </Link>
  )
}
