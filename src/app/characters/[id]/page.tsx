'use client'
import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { useParams } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { Ticker } from '@/components/ui/Ticker'
import { BottomNav } from '@/components/ui/BottomNav'
import { CHARACTERS, CHARACTER_MAP } from '@/lib/constants'
import { ShareButton } from '@/components/characters/ShareButton'
import { SuggestedPrompts } from '@/components/characters/SuggestedPrompts'
import { ChatPanel } from '@/components/characters/ChatPanel'

export default function CharacterPage() {
  const params = useParams()
  const id = params?.id as string
  const character = CHARACTER_MAP.get(id)

  if (!character) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 48,
            fontWeight: 900, color: 'transparent',
            WebkitTextStroke: '1px var(--border)', marginBottom: 16 }}>404</div>
          <p style={{ color: 'var(--text-2)', marginBottom: 16 }}>Character not found</p>
          <a href="/characters" style={{ color: 'var(--green)', fontSize: 13 }}>
            ← All characters
          </a>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <Ticker segments={[
        `Chatting with ${character.name} · ${character.role}`,
        character.bio,
        `Share: kickoffto.com/characters/${character.id}`,
      ]} />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 100px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr)',
          gap: 20,
        }}>

          {/* Info panel */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderLeft: `3px solid ${character.color}`,
            borderRadius: '0 12px 12px 0',
            padding: 20,
          }}>
            <a href="/characters" style={{
              fontSize: 12, color: 'var(--green)', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 16,
            }}>
              ← All characters
            </a>

            {/* Avatar */}
            <div style={{
              width: 64, height: 64, borderRadius: 14,
              background: character.color,
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 22, color: 'rgba(255,255,255,0.85)',
              marginBottom: 14,
            }}>
              {character.monogram}
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 22, letterSpacing: -0.3,
              color: 'var(--text)', marginBottom: 4,
            }}>
              {character.name}
            </h1>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 12 }}>
              {character.role} · {character.tier}
            </p>

            {/* Online dot */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              marginBottom: 14, fontSize: 12, color: 'var(--green)',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--green)', display: 'inline-block',
                animation: 'livePulse 1.5s ease-in-out infinite',
              }} />
              Online · Ready
            </div>

            <p style={{
              fontSize: 13, color: 'var(--text-2)',
              lineHeight: 1.7, marginBottom: 16,
            }}>
              {character.bio}
            </p>

            <ShareButton characterId={character.id} />
            <a
              href={`/share/character/${character.id}`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                width: '100%', padding: '8px 12px', marginTop: 6,
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: 8, fontSize: 12, fontWeight: 500,
                color: 'var(--text-3)', textDecoration: 'none',
              }}
            >
              📱 Share quote card →
            </a>

            <div style={{ marginTop: 14 }}>
              <p style={{
                fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
              }}>
                Try asking
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {character.suggested.map(prompt => (
                  <div key={prompt} style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 8, padding: '8px 10px',
                    fontSize: 12, color: 'var(--text-2)',
                  }}>
                    {prompt}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat */}
          <ChatPanel character={character} />

        </div>
      </main>
      <BottomNav />
    </>
  )
}