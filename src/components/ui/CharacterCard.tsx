'use client'
import Link from 'next/link'
import type { Character } from '@/types'

const EXPERTISE: Record<string, string[]> = {
  'el-maestro':    ['Tactics', 'Formation', 'Strategy'],
  'xg-oracle':     ['xG', 'Stats', 'Data'],
  'fpl-guru':      ['Fantasy', 'FPL', 'Picks'],
  'var-review':    ['Rules', 'VAR', 'Decisions'],
  'the-archive':   ['History', 'Records', 'Lore'],
  'talentspotter': ['Scouting', 'Players', 'Transfers'],
  'the-voice':     ['Commentary', 'Drama', 'Live'],
  'ultra':         ['Passion', 'Fan culture', 'Banter'],
  'coach-believe': ['Motivation', 'Mindset', 'Inspire'],
  'chef-fury':     ['Opinions', 'Takes', 'Rants'],
  'aria-9':        ['AI', 'Systems', 'Data'],
  'multiverse':    ['What-if', 'Alternate', 'Timeline'],
}

interface CharacterCardProps {
  character: Character
  size?: 'sm' | 'md' | 'lg'
}

export function CharacterCard({ character, size = 'md' }: CharacterCardProps) {
  const dims = size === 'sm'
    ? { w: 110, mono: 32, monoFont: 13 }
    : size === 'lg'
    ? { w: 160, mono: 56, monoFont: 20 }
    : { w: 130, mono: 44, monoFont: 17 }

  return (
    <Link href={character.phase === 1
      ? `/characters/${character.id}` : '#'}
      style={{ textDecoration: 'none' }}>
      <div style={{
        width: dims.w, flexShrink: 0,
        borderRadius: 16, overflow: 'hidden',
        background: character.color,
        boxShadow: `0 4px 20px ${character.color}55`,
        position: 'relative',
        opacity: character.phase === 1 ? 1 : 0.5,
        transition: 'transform 0.15s, box-shadow 0.15s',
        cursor: character.phase === 1 ? 'pointer' : 'default',
      } as any}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(-3px) scale(1.02)'
        el.style.boxShadow = `0 8px 32px ${character.color}88`
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(0) scale(1)'
        el.style.boxShadow = `0 4px 20px ${character.color}55`
      }}>

        {/* Large ghost monogram watermark */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: dims.mono * 2.2, color: 'rgba(255,255,255,0.07)',
          letterSpacing: -2, pointerEvents: 'none',
          userSelect: 'none',
        }}>
          {character.monogram}
        </div>

        {/* Content */}
        <div style={{ padding: '16px 12px 14px', position: 'relative' }}>
          {/* Monogram avatar */}
          <div style={{
            width: dims.mono, height: dims.mono, borderRadius: 10,
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: dims.monoFont, color: 'rgba(255,255,255,0.9)',
            letterSpacing: -0.5, marginBottom: 10,
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            {character.monogram}
          </div>

          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 14,
            fontWeight: 800, color: '#fff', lineHeight: 1.1,
            marginBottom: 4,
            textShadow: '0 1px 4px rgba(0,0,0,0.5)',
          }}>
            {character.name}
          </div>

          <div style={{
            fontSize: 10, color: 'rgba(255,255,255,0.65)',
            marginBottom: 8, fontWeight: 500,
          }}>
            {character.role}
          </div>

          {(EXPERTISE[character.id] ?? []).length > 0 && (
            <div style={{
              display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 5, marginBottom: 8,
            }}>
              {(EXPERTISE[character.id] ?? []).slice(0, 2).map(tag => (
                <span key={tag} className="expertise-tag">{tag}</span>
              ))}
            </div>
          )}

          {character.phase === 1 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)',
              borderRadius: 99, padding: '3px 8px',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: '#4ade80', display: 'inline-block',
                animation: 'livePulse 1.5s ease-in-out infinite',
              }} />
              <span style={{ fontSize: 9, color: '#4ade80', fontWeight: 700 }}>
                Online
              </span>
            </div>
          )}

          {character.phase > 1 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'rgba(0,0,0,0.3)', borderRadius: 99,
              padding: '3px 8px', border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>
                Phase {character.phase}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
