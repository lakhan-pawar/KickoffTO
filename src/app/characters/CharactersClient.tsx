'use client'
import Link from 'next/link'
import { CHARACTERS } from '@/lib/constants'

const PHASE1_IDS = [
  'el-maestro','xg-oracle','fpl-guru','var-review',
  'the-archive','talentspotter','the-voice','ultra',
]
const PHASE2_IDS = ['coach-believe','chef-fury','aria-9','consulting-mind']
const PHASE3_IDS = ['the-multiverse','the-psychologist','canvas','the-antagonist']

const ICON_MAP: Record<string,string> = {
  'el-maestro':'🎯','xg-oracle':'📊','fpl-guru':'🏆','var-review':'📹',
  'the-archive':'📜','talentspotter':'🔍','the-voice':'🎙️','ultra':'🔥',
  'coach-believe':'💪','chef-fury':'😤','aria-9':'🤖','consulting-mind':'🧠',
  'the-multiverse':'🌀','the-psychologist':'🧬','canvas':'🎨','the-antagonist':'⚡',
}

const COLOR_MAP: Record<string,string> = {
  'el-maestro':'#1e3a5f','xg-oracle':'#1a3a2a','fpl-guru':'#2a1a3a',
  'var-review':'#2a2a1a','the-archive':'#1a3a1a','talentspotter':'#1a3a3a',
  'the-voice':'#7c1d2e','ultra':'#1a1a3a','coach-believe':'#78350f',
  'chef-fury':'#3a1a1a','aria-9':'#0a0a18','consulting-mind':'#2a1a2a',
  'the-multiverse':'#2a1a3a','the-psychologist':'#1a2a3a','canvas':'#3a2a3a',
  'the-antagonist':'#2a0a0a',
}

const ROLE_MAP: Record<string,string> = {
  'el-maestro':'Tactical Analyst','xg-oracle':'Data Scientist',
  'fpl-guru':'Fantasy Manager','var-review':'Rules Expert',
  'the-archive':'Football Historian','talentspotter':'Chief Scout',
  'the-voice':'Live Commentator','ultra':'Passionate Fan',
  'coach-believe':'Motivator','chef-fury':'Hot Takes',
  'aria-9':'Cold Machine','consulting-mind':'Deduction Engine',
  'the-multiverse':'What-If Oracle','the-psychologist':'Mind Reader',
  'canvas':'Visual Artist','the-antagonist':'Contrarian',
}

const NAME_MAP: Record<string,string> = {
  'el-maestro':'El Maestro','xg-oracle':'xG Oracle','fpl-guru':'FPL Guru',
  'var-review':'VAR Review','the-archive':'The Archive','talentspotter':'TalentSpotter',
  'the-voice':'The Voice','ultra':'Ultra','coach-believe':'Coach Believe',
  'chef-fury':'Chef Fury','aria-9':'ARIA-9','consulting-mind':'Consulting Mind',
  'the-multiverse':'The Multiverse','the-psychologist':'The Psychologist',
  'canvas':'Canvas','the-antagonist':'The Antagonist',
}

function CharSection({
  ids, label, sublabel, live,
}: {
  ids: string[], label: string, sublabel: string, live: boolean
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 14,
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 17, color: 'var(--text)', letterSpacing: -0.3,
          }}>
            {label}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
            {sublabel}
          </div>
        </div>
        {live && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(22,163,74,0.12)',
            border: '1px solid rgba(22,163,74,0.2)',
            borderRadius: 99, padding: '4px 10px',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#4ade80', display: 'inline-block',
              animation: 'livePulse 1.5s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 10, color: '#4ade80', fontWeight: 700 }}>
              Live now
            </span>
          </div>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 10,
      }}>
        {ids.map(id => {
          const color = COLOR_MAP[id] ?? '#1a1a2a'
          const icon  = ICON_MAP[id] ?? '⚽'
          const name  = NAME_MAP[id] ?? id
          const role  = ROLE_MAP[id] ?? ''

          const card = (
            <div style={{
              borderRadius: 16, overflow: 'hidden',
              background: color,
              boxShadow: live ? `0 4px 20px ${color}66` : 'none',
              position: 'relative', height: 164,
              opacity: live ? 1 : 0.45,
              transition: 'transform 0.15s, box-shadow 0.15s',
              cursor: live ? 'pointer' : 'default',
              display: 'flex', flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '14px 12px',
            }}
            onMouseEnter={e => {
              if (!live) return
              const el = e.currentTarget as HTMLDivElement
              el.style.transform = 'translateY(-3px) scale(1.02)'
              el.style.boxShadow = `0 10px 28px ${color}88`
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLDivElement
              el.style.transform = 'none'
              el.style.boxShadow = live ? `0 4px 20px ${color}66` : 'none'
            }}>

              {/* Ghost icon watermark */}
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 72, opacity: 0.08,
                pointerEvents: 'none', userSelect: 'none',
              }}>
                {icon}
              </div>

              {/* Top: icon avatar */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'rgba(0,0,0,0.35)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 20,
                  marginBottom: 10,
                }}>
                  {icon}
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 13,
                  fontWeight: 800, color: '#fff',
                  lineHeight: 1.1, marginBottom: 3,
                  textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                }}>
                  {name}
                </div>
                <div style={{
                  fontSize: 10, color: 'rgba(255,255,255,0.55)',
                  fontWeight: 500,
                }}>
                  {role}
                </div>
              </div>

              {/* Bottom: status */}
              <div style={{ position: 'relative' }}>
                {live ? (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: 'rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: 99, padding: '4px 10px',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}>
                    <span style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: '#4ade80', display: 'inline-block',
                      animation: 'livePulse 1.5s ease-in-out infinite',
                    }} />
                    <span style={{ fontSize: 10, color: '#4ade80', fontWeight: 700 }}>
                      Chat now →
                    </span>
                  </div>
                ) : (
                  <div style={{
                    fontSize: 9, color: 'rgba(255,255,255,0.3)',
                    fontWeight: 600, textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}>
                    Coming soon
                  </div>
                )}
              </div>
            </div>
          )

          return live ? (
            <Link key={id} href={`/characters/${id}`} style={{ textDecoration: 'none' }}>
              {card}
            </Link>
          ) : (
            <div key={id}>{card}</div>
          )
        })}
      </div>
    </div>
  )
}

export function CharactersClient() {
  return (
    <>
      {/* Council CTA */}
      <Link href="/characters/council" style={{ textDecoration: 'none', display: 'block', marginBottom: 28 }}>
        <div style={{
          background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a3e 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: 14,
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.2)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)'
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 26, flexShrink: 0,
          }}>⚡</div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 17,
              fontWeight: 800, color: '#fff', marginBottom: 4,
            }}>
              Character Council
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>
              Ask one question — 8 characters respond simultaneously · See how they disagree
            </div>
          </div>
          <div style={{
            fontSize: 20, color: 'rgba(255,255,255,0.3)',
            flexShrink: 0,
          }}>→</div>
        </div>
      </Link>

      <CharSection ids={PHASE1_IDS} label="Available now" sublabel="8 characters · Ready to chat" live={true} />
      <CharSection ids={PHASE2_IDS} label="Phase 2" sublabel="Unlocking June 18" live={false} />
      <CharSection ids={PHASE3_IDS} label="Phase 3" sublabel="Unlocking July 1 · Knockout stages" live={false} />
    </>
  )
}
