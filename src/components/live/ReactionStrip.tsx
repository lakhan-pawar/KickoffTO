'use client'
import { useState, useEffect } from 'react'

const REACTIONS = [
  { key: 'hype',  emoji: '🔥', label: 'Hype'  },
  { key: 'shock', emoji: '😱', label: 'Shock' },
  { key: 'drama', emoji: '😤', label: 'Drama' },
] as const

type ReactionKey = typeof REACTIONS[number]['key']

interface ReactionStripProps {
  matchId: string
  expanded?: boolean
}

export function ReactionStrip({ matchId, expanded = false }: ReactionStripProps) {
  const [counts, setCounts] = useState<Record<ReactionKey, number>>({
    hype: 12483, shock: 4218, drama: 892,
  })
  const [userVote, setUserVote] = useState<ReactionKey | null>(null)
  const [animating, setAnimating] = useState<ReactionKey | null>(null)

  async function handleReaction(key: ReactionKey) {
    // Optimistic update
    setCounts(prev => ({ ...prev, [key]: prev[key] + 1 }))
    setUserVote(key)
    setAnimating(key)
    setTimeout(() => setAnimating(null), 300)

    // Save to local journal for Wrapped/Journal features
    try {
      const journal = JSON.parse(localStorage.getItem('kt-journal') ?? '[]')
      const newEntry = {
        id: Date.now().toString(),
        type: 'reaction',
        matchId,
        reaction: key,
        timestamp: new Date().toISOString(),
      }
      localStorage.setItem('kt-journal', JSON.stringify([newEntry, ...journal].slice(0, 100)))
    } catch (e) {}

    // Fire and forget to API
    try {
      await fetch(`/api/live/${matchId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction: key }),
      })
    } catch {
      // Revert on error
      setCounts(prev => ({ ...prev, [key]: prev[key] - 1 }))
    }
  }

  if (!expanded) {
    // Compact strip — always visible above bottom nav
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 10, padding: '8px 12px',
        display: 'flex', gap: 8,
      }}>
        {REACTIONS.map(r => (
          <button
            key={r.key}
            onClick={() => handleReaction(r.key)}
            style={{
              flex: 1, background: userVote === r.key
                ? 'var(--bg-elevated)' : 'transparent',
              border: `1px solid ${userVote === r.key ? 'var(--green)' : 'var(--border)'}`,
              borderRadius: 8, padding: '7px 4px',
              cursor: 'pointer', display: 'flex',
              flexDirection: 'column', alignItems: 'center', gap: 3,
              transform: animating === r.key ? 'scale(1.15)' : 'scale(1)',
              transition: 'transform 0.2s ease, border-color 0.15s',
            }}
          >
            <span style={{ fontSize: 18 }}>{r.emoji}</span>
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: 'var(--text-2)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {counts[r.key].toLocaleString()}
            </span>
          </button>
        ))}
      </div>
    )
  }

  // Expanded view for Reactions tab
  return (
    <div style={{ padding: 16 }}>
      <p style={{
        fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16,
      }}>
        Fan pulse — live reactions
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {REACTIONS.map(r => {
          const total = Object.values(counts).reduce((a, b) => a + b, 0)
          const pct = Math.round((counts[r.key] / total) * 100)
          return (
            <div key={r.key}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6,
              }}>
                <span style={{ fontSize: 28 }}>{r.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 12, marginBottom: 4,
                  }}>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                      {r.label}
                    </span>
                    <span style={{ color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums' }}>
                      {counts[r.key].toLocaleString()} · {pct}%
                    </span>
                  </div>
                  <div style={{
                    height: 6, background: 'var(--bg-elevated)',
                    borderRadius: 3, overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      background: r.key === 'hype'
                        ? 'var(--green)' : r.key === 'shock'
                        ? 'var(--yellow-card)' : 'var(--red-card)',
                      width: `${pct}%`,
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
                <button
                  onClick={() => handleReaction(r.key)}
                  style={{
                    background: userVote === r.key ? 'var(--green)' : 'var(--bg-elevated)',
                    color: userVote === r.key ? '#fff' : 'var(--text-3)',
                    border: '1px solid var(--border)',
                    borderRadius: 8, padding: '6px 12px',
                    fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {userVote === r.key ? '✓ Voted' : '+'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
