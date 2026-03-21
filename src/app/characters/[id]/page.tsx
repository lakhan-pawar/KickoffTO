'use client'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'
import { ChatPanel } from '@/components/characters/ChatPanel'
import { CHARACTER_MAP } from '@/lib/constants'
import Link from 'next/link'

export default function CharacterPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const prefilledQuestion = searchParams?.get('q') ?? ''
  const id = params?.id as string
  const character = CHARACTER_MAP.get(id)
  const [infoExpanded, setInfoExpanded] = useState(false)

  // Lock body scroll — only chat panel scrolls
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  if (!character) {
    return (
      <>
        <Navbar />
        <main style={{ padding: '60px 16px', textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 900,
            color: 'transparent', WebkitTextStroke: '1px var(--border)',
            marginBottom: 12,
          }}>404</div>
          <p style={{ color: 'var(--text-2)', marginBottom: 16 }}>Character not found</p>
          <Link href="/characters" style={{ color: 'var(--green)', fontSize: 13 }}>
            ← All characters
          </Link>
        </main>
        <BottomNav />
      </>
    )
  }

  return (
    <div style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'var(--bg)',
    }}>

      {/* ── STICKY TOP BAR (Gemini/Claude style) ────────── */}
      <div style={{
        flexShrink: 0,
        background: character.color,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Ghost monogram watermark */}
        <div style={{
          position: 'absolute', right: -10, top: -10,
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 88, color: 'rgba(255,255,255,0.07)',
          letterSpacing: -4, lineHeight: 1,
          pointerEvents: 'none', userSelect: 'none',
          opacity: 0.2, // Boost for emoji
        }}>
          {character.icon ?? character.monogram}
        </div>

        {/* Top row: back + identity + status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px 0',
        }}>
          <Link href="/characters" style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'rgba(0,0,0,0.28)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 16, textDecoration: 'none', flexShrink: 0,
            border: '1px solid rgba(255,255,255,0.12)',
          }}>
            ←
          </Link>

          <div style={{
            width: 40, height: 40, borderRadius: 11,
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, // larger for emoji
            flexShrink: 0,
          }}>
            {character.icon ?? character.monogram}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 16, color: '#fff', letterSpacing: -0.3, lineHeight: 1.1,
            }}>
              {character.name}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>
              {character.role}
            </div>
          </div>

          {/* Online pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)',
            borderRadius: 99, padding: '4px 10px',
            border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0,
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: '#4ade80', display: 'inline-block',
              animation: 'livePulse 1.5s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 10, color: '#4ade80', fontWeight: 700 }}>
              Online
            </span>
          </div>

          {/* Info toggle */}
          <button
            onClick={() => setInfoExpanded(e => !e)}
            style={{
              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
              background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title={infoExpanded ? 'Hide info' : 'Show bio'}
          >
            {infoExpanded ? '✕' : 'ℹ'}
          </button>
        </div>

        {/* Suggested prompts horizontal scroll */}
        <div style={{
          display: 'flex', gap: 6, overflowX: 'auto',
          padding: '10px 14px 12px',
          scrollbarWidth: 'none',
        }}>
          {character.suggested.slice(0, 5).map(prompt => (
            <div key={prompt} style={{
              background: 'rgba(0,0,0,0.28)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 99, padding: '5px 12px',
              fontSize: 11, color: 'rgba(255,255,255,0.8)',
              whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0,
              fontWeight: 500,
            }}>
              {prompt}
            </div>
          ))}
        </div>

        {/* Expandable bio panel */}
        {infoExpanded && (
          <div style={{
            padding: '0 14px 14px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            marginTop: 0,
          }}>
            <p style={{
              fontSize: 13, color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.65, marginTop: 12,
            }}>
              {character.bio}
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <Link href={`/share/character/${character.id}`} style={{
                fontSize: 11, color: 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
                background: 'rgba(0,0,0,0.25)', borderRadius: 8,
                padding: '5px 10px', border: '1px solid rgba(255,255,255,0.1)',
              }}>
                📱 Share quote
              </Link>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(
                    `${window.location.origin}/characters/${character.id}`
                  )
                }}
                style={{
                  fontSize: 11, color: 'rgba(255,255,255,0.6)',
                  background: 'rgba(0,0,0,0.25)', borderRadius: 8,
                  padding: '5px 10px', border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                }}
              >
                🔗 Copy link
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── CHAT PANEL — fills remaining height, only this scrolls ── */}
      <div style={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        marginBottom: 56, // BottomNav height
      }}>
        <ChatPanel character={character} compact prefilledQuestion={prefilledQuestion} />
      </div>

      <BottomNav />
    </div>
  )
}