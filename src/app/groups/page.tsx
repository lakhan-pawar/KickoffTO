import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'
import Link from 'next/link'
import type { Metadata } from 'next'
import groupsData from '@/data/wc2026-groups.json'

export const metadata: Metadata = {
  title: 'WC2026 Groups — KickoffTo',
  description: 'All 12 WC2026 groups.',
}

export const revalidate = 300

export default function GroupsPage() {
  const { groups } = groupsData

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 14px 72px' }}>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 28, letterSpacing: -0.5, color: 'var(--text)', marginBottom: 6,
        }}>
          GROUPS
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 20 }}>
          12 groups · 48 teams · Top 2 from each advance
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 12,
        }}>
          {groups.map(group => (
            <div key={group.letter} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 16, overflow: 'hidden',
            }}>
              {/* Group header with kit colour stripe */}
              <div style={{ height: 4, display: 'flex' }}>
                {group.teams.map(t => (
                  <div key={t.code} style={{
                    flex: 1, background: t.kitColors[0],
                  }} />
                ))}
              </div>

              <div style={{ padding: '12px 14px 6px' }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 900,
                  fontSize: 22, color: 'var(--text)', letterSpacing: -0.5,
                  marginBottom: 12,
                }}>
                  Group {group.letter}
                </div>

                {/* Column headers */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 28px 28px 28px 28px 32px',
                  gap: 4, marginBottom: 6,
                  fontSize: 9, fontWeight: 700, color: 'var(--text-3)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  paddingLeft: 48,
                }}>
                  <span />
                  <span style={{ textAlign: 'center' }}>P</span>
                  <span style={{ textAlign: 'center' }}>W</span>
                  <span style={{ textAlign: 'center' }}>D</span>
                  <span style={{ textAlign: 'center' }}>L</span>
                  <span style={{ textAlign: 'center' }}>Pts</span>
                </div>

                {/* Teams */}
                {group.teams.map((team, i) => (
                  <Link
                    key={team.code}
                    href={`/teams/${team.code.toLowerCase()}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '32px 1fr 28px 28px 28px 28px 32px',
                      gap: 4, alignItems: 'center',
                      padding: '7px 0',
                      borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                      cursor: 'pointer',
                    }}>
                      {/* Rank */}
                      <span style={{
                        fontSize: 11, fontWeight: 700, textAlign: 'center',
                        color: i < 2 ? 'var(--green)' : 'var(--text-3)',
                      }}>
                        {i + 1}
                      </span>

                      {/* Flag + Name */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ fontSize: 20 }}>{team.flag}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                          {team.name.length > 11 ? team.name.slice(0, 11) + '…' : team.name}
                        </span>
                      </div>

                      {/* Stats — all 0 pre-tournament */}
                      {[0, 0, 0, 0].map((v, j) => (
                        <span key={j} style={{
                          fontSize: 12, color: 'var(--text-3)',
                          textAlign: 'center', fontVariantNumeric: 'tabular-nums',
                        }}>
                          {v}
                        </span>
                      ))}
                      <span style={{
                        fontSize: 13, fontWeight: 700, color: 'var(--text)',
                        textAlign: 'center', fontVariantNumeric: 'tabular-nums',
                      }}>
                        0
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              <div style={{
                padding: '8px 14px',
                borderTop: '1px solid var(--border)',
                background: 'var(--bg-elevated)',
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{
                  fontSize: 9, color: 'var(--green)', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  Top 2 advance
                </span>
                <span style={{ fontSize: 9, color: 'var(--text-3)' }}>
                  From June 11
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </>
  )
}
