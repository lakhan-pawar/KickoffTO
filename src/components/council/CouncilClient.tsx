'use client'
import { useState } from 'react'
import Link from 'next/link'

const AGENTS = [
  { id: 'el-maestro',    name: 'El Maestro',    icon: '🎯', color: '#1e3a5f', role: 'Tactics'    },
  { id: 'xg-oracle',     name: 'xG Oracle',     icon: '📊', color: '#1a3a2a', role: 'Data'       },
  { id: 'the-archive',   name: 'The Archive',   icon: '📜', color: '#1a3a1a', role: 'History'    },
  { id: 'talentspotter', name: 'TalentSpotter', icon: '🔍', color: '#1a3a3a', role: 'Scouting'   },
  { id: 'aria-9',        name: 'ARIA-9',        icon: '🤖', color: '#0a0a18', role: 'Machine'    },
  { id: 'fpl-guru',      name: 'FPL Guru',      icon: '🏆', color: '#2a1a3a', role: 'Fantasy'    },
  { id: 'the-voice',     name: 'The Voice',     icon: '🎙️', color: '#7c1d2e', role: 'Commentary' },
  { id: 'the-antagonist',name: 'The Antagonist',icon: '⚡', color: '#2a0a0a', role: 'Dissent'    },
]

const FALLBACKS: Record<string, string> = {
  'el-maestro':    "I'd need to study more tape before committing on that one.",
  'xg-oracle':     "Insufficient data. Sample size too small for a meaningful conclusion.",
  'the-archive':   "The historical record is ambiguous here. I'll reserve judgement.",
  'talentspotter': "My scouts haven't filed a report on this yet.",
  'aria-9':        "Query outside current parameters. No output generated.",
  'fpl-guru':      "Still running the numbers. Fantasy implications are complex.",
  'the-voice':     "And on this occasion... I'll let the silence speak.",
  'the-antagonist':"Everyone else is wrong anyway, so does my opinion even matter?",
}

const SUGGESTED = [
  "Who wins WC2026?",
  "Best player at WC2026?",
  "Which group is hardest?",
  "Can Canada reach the knockouts?",
  "Dark horses to watch?",
  "Who surprises everyone?",
]

interface AgentResp {
  id: string
  text: string
  loading: boolean
}

export function CouncilClient() {
  const [question, setQuestion]       = useState('')
  const [asked, setAsked]             = useState('')
  const [responses, setResponses]     = useState<AgentResp[]>([])
  const [verdict, setVerdict]         = useState('')
  const [verdictLoading, setVL]       = useState(false)
  const [running, setRunning]         = useState(false)

  async function ask(q: string) {
    if (!q.trim() || running) return
    setRunning(true)
    setAsked(q.trim())
    setVerdict('')
    setVL(false)
    setResponses(AGENTS.map(a => ({ id: a.id, text: '', loading: true })))

    const promises = AGENTS.map(async agent => {
      try {
        const res = await fetch(`/api/characters/${agent.id}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{
              role: 'user',
              content: `Council question: "${q}"\n\nReply in 2-3 sentences max. Stay in character. Be direct. No preamble.`,
            }],
          }),
          signal: AbortSignal.timeout(14000),
        })
        const data = await res.json()
        const text = (data.response ?? data.content ?? data.message ?? '').trim()
        setResponses(prev =>
          prev.map(r => r.id === agent.id ? { ...r, text: text || FALLBACKS[agent.id], loading: false } : r)
        )
      } catch {
        setResponses(prev =>
          prev.map(r => r.id === agent.id ? { ...r, text: FALLBACKS[agent.id], loading: false } : r)
        )
      }
    })

    await Promise.allSettled(promises)
    setRunning(false)

    // Generate verdict
    setVL(true)
    try {
      const res = await fetch('/api/characters/el-maestro/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `As council chair, give a 1-sentence verdict on: "${q}". Start directly — no preamble.`,
          }],
        }),
        signal: AbortSignal.timeout(8000),
      })
      const data = await res.json()
      setVerdict((data.response ?? data.content ?? '').trim())
    } catch {
      setVerdict("The council remains divided — no clear consensus on this one.")
    } finally {
      setVL(false)
    }
  }

  return (
    <div>
      {/* Input */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 16, padding: 16, marginBottom: 20,
      }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { ask(question); setQuestion('') }}}
            placeholder="Ask the council anything about WC2026..."
            disabled={running}
            style={{
              flex: 1, background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 12, padding: '12px 16px',
              fontSize: 15, color: 'var(--text)', outline: 'none',
              fontFamily: 'var(--font-body)', minHeight: 48,
              opacity: running ? 0.6 : 1,
            }}
          />
          <button
            onClick={() => { ask(question); setQuestion('') }}
            disabled={!question.trim() || running}
            style={{
              background: question.trim() && !running
                ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'var(--bg-elevated)',
              color: question.trim() && !running ? '#fff' : 'var(--text-3)',
              border: 'none', borderRadius: 12,
              padding: '12px 20px', fontSize: 14, fontWeight: 700,
              cursor: question.trim() && !running ? 'pointer' : 'not-allowed',
              minHeight: 48, whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            {running ? 'Asking...' : 'Ask Council →'}
          </button>
        </div>

        {/* Suggested */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {SUGGESTED.map(s => (
            <button key={s}
              onClick={() => { ask(s) }}
              disabled={running}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 99, padding: '5px 12px',
                fontSize: 11, color: 'var(--text-2)',
                cursor: running ? 'not-allowed' : 'pointer',
                fontWeight: 500,
              }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {!asked && (
        <div style={{
          textAlign: 'center', padding: '48px 20px',
          color: 'var(--text-3)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
            8 characters. One question.
          </div>
          <div style={{ fontSize: 13 }}>
            See how El Maestro, ARIA-9, The Antagonist and 5 others disagree.
          </div>
        </div>
      )}

      {asked && (
        <>
          {/* Active question */}
          <div style={{
            background: 'var(--green-tint)',
            border: '1px solid rgba(22,163,74,0.2)',
            borderRadius: 12, padding: '10px 16px',
            fontSize: 14, fontWeight: 600, color: 'var(--text)',
            marginBottom: 14,
          }}>
            &ldquo;{asked}&rdquo;
          </div>

          {/* Verdict */}
          <div style={{
            background: 'var(--bg-card)',
            borderTop: '3px solid #16a34a',
            border: '1px solid var(--border)',
            borderRadius: '0 0 14px 14px',
            padding: '12px 16px', marginBottom: 20,
          }}>
            <div style={{
              fontSize: 9, fontWeight: 700, color: 'var(--green)',
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6,
            }}>
              ⚡ Council Verdict
            </div>
            <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.55, margin: 0 }}>
              {verdictLoading
                ? 'Synthesising...'
                : verdict || (running ? 'Awaiting all responses...' : '')}
            </p>
          </div>

          {/* Note */}
          <p style={{
            fontSize: 11, color: 'var(--text-3)',
            marginBottom: 14, fontStyle: 'italic',
          }}>
            Responses are intentionally brief. Tap &ldquo;Go deeper →&rdquo; on any card to continue with that character.
          </p>

          {/* Agent grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 10,
          }}>
            {responses.map(r => {
              const agent = AGENTS.find(a => a.id === r.id)!
              return (
                <div key={r.id} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderLeft: `3px solid ${agent.color}`,
                  borderRadius: '0 14px 14px 0',
                  padding: 14,
                }}>
                  {/* Header */}
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: 8, marginBottom: 10,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 9,
                      background: agent.color,
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 16, flexShrink: 0,
                    }}>
                      {agent.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 700, color: 'var(--text)',
                      }}>
                        {agent.name}
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--text-3)' }}>
                        {agent.role}
                      </div>
                    </div>
                    {r.loading && (
                      <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                        {[0,1,2].map(i => (
                          <span key={i} style={{
                            width: 5, height: 5, borderRadius: '50%',
                            background: agent.color, display: 'inline-block',
                            animation: `typingBounce 0.6s ease-in-out ${i*0.12}s infinite`,
                          }} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Response */}
                  {!r.loading && (
                    <>
                      <p style={{
                        fontSize: 13, color: 'var(--text-2)',
                        lineHeight: 1.65, margin: '0 0 12px',
                      }}>
                        {r.text}
                      </p>

                      {/* Go deeper — navigates to individual chat with question */}
                      <Link
                        href={`/characters/${r.id}?q=${encodeURIComponent(asked)}`}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border)',
                          borderRadius: 8, padding: '6px 12px',
                          fontSize: 11, color: 'var(--text-2)',
                          textDecoration: 'none', fontWeight: 600,
                          transition: 'border-color 0.15s, color 0.15s',
                        }}
                        onMouseEnter={e => {
                          const el = e.currentTarget as HTMLAnchorElement
                          el.style.borderColor = agent.color
                          el.style.color = 'var(--text)'
                        }}
                        onMouseLeave={e => {
                          const el = e.currentTarget as HTMLAnchorElement
                          el.style.borderColor = 'var(--border)'
                          el.style.color = 'var(--text-2)'
                        }}
                      >
                        {agent.icon} Go deeper with {agent.name} →
                      </Link>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
