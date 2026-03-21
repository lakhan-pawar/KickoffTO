'use client'
import { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'

interface JournalEntry {
  id: string
  type: 'reaction' | 'note'
  matchId: string
  reaction?: string
  text?: string
  timestamp: string
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])

  useEffect(() => {
    const journal = JSON.parse(localStorage.getItem('kt-journal') ?? '[]')
    setEntries(journal)
  }, [])

  function deleteEntry(id: string) {
    const updated = entries.filter(e => e.id !== id)
    setEntries(updated)
    localStorage.setItem('kt-journal', JSON.stringify(updated))
  }

  const REACTION_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
    hype:  { emoji: '🔥', label: 'HYPE',  color: 'var(--green)' },
    shock: { emoji: '😱', label: 'SHOCK', color: 'var(--yellow-card)' },
    drama: { emoji: '😤', label: 'DRAMA', color: 'var(--red-card)' },
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '32px 16px 100px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 28, letterSpacing: -0.5, color: 'var(--text)', marginBottom: 8,
        }}>
          TOURNAMENT JOURNAL
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 24 }}>
          Your personal record of WC2026. Reactions saved from live match rooms.
        </p>

        {entries.length === 0 ? (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 16, padding: '40px 20px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📓</div>
            <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 16 }}>
              Your journal is empty.
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
              Head to a <a href="/live" style={{ color: 'var(--green)' }}>Live Match Room</a> and
              react to the action. Your reactions will appear here automatically.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {entries.map(entry => {
              const config = entry.reaction ? REACTION_CONFIG[entry.reaction] : null
              return (
                <div key={entry.id} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: 16, position: 'relative',
                  borderLeft: config ? `4px solid ${config.color}` : '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 24 }}>{config?.emoji ?? '📝'}</span>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: config?.color ?? 'var(--text-3)', textTransform: 'uppercase' }}>
                          {config?.label ?? 'NOTE'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600 }}>
                          Match: {entry.matchId}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      style={{
                        background: 'none', border: 'none', color: 'var(--text-3)',
                        fontSize: 16, cursor: 'pointer', padding: 4,
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)' }}>
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                </div>
              )
            }
            )}
          </div>
        )}

        {/* Feature info */}
        <div style={{
          marginTop: 32, padding: 16, background: 'var(--bg-elevated)',
          borderRadius: 12, border: '1px solid var(--border)',
        }}>
          <p style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
            <strong>Private by design:</strong> Your journal is stored only in your browser&apos;s
            local storage. KickoffTo doesn&apos;t save your personal notes or specific reaction history
            on our servers.
          </p>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
