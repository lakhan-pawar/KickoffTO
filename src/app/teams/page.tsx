import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'
import Link from 'next/link'
import type { Metadata } from 'next'
import groupsData from '@/data/wc2026-groups.json'

export const metadata: Metadata = {
  title: 'WC2026 Teams — KickoffTo',
  description: 'All 48 WC2026 teams.',
}

const CONF_COLORS: Record<string, string> = {
  UEFA:     '#1d4ed8',
  CONMEBOL: '#15803d',
  CONCACAF: '#b91c1c',
  CAF:      '#a16207',
  AFC:      '#7c3aed',
  OFC:      '#0e7490',
}

export default function TeamsPage() {
  const allTeams = groupsData.groups.flatMap(g =>
    g.teams.map(t => ({ ...t, group: g.letter }))
  )

  const byConf = allTeams.reduce<Record<string, typeof allTeams>>((acc, t) => {
    if (!acc[t.confederation]) acc[t.confederation] = []
    acc[t.confederation].push(t)
    return acc
  }, {})

  const confOrder = ['UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC', 'OFC']

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 14px 72px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 28, letterSpacing: -0.5, color: 'var(--text)', marginBottom: 20,
        }}>
          48 TEAMS
        </h1>

        {confOrder.map(conf => {
          const teams = byConf[conf]
          if (!teams?.length) return null
          const color = CONF_COLORS[conf] ?? '#888'

          return (
            <div key={conf} style={{ marginBottom: 24 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
              }}>
                <div style={{ width: 3, height: 16, borderRadius: 2, background: color }} />
                <span style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--text-2)',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  {conf} · {teams.length} teams
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: 8,
              }}>
                {teams.map(team => (
                  <Link
                    key={team.code}
                    href={`/teams/${team.code.toLowerCase()}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      borderRadius: 14, overflow: 'hidden',
                      background: team.kitColors[0],
                      position: 'relative', aspectRatio: '3/4',
                      display: 'flex', flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: 10,
                      boxShadow: `0 2px 12px ${team.kitColors[0]}44`,
                      transition: 'transform 0.15s, box-shadow 0.15s',
                    }}
                    >

                      {/* Giant flag — the hero */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 64, opacity: 0.65,
                        filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
                      }}>
                        {team.flag}
                      </div>

                      {/* Kit second colour strip */}
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        height: 4, background: team.kitColors[1] ?? 'rgba(255,255,255,0.3)',
                      }} />

                      {/* Group badge */}
                      <div style={{
                        alignSelf: 'flex-end',
                        background: 'rgba(0,0,0,0.45)',
                        backdropFilter: 'blur(6px)',
                        borderRadius: 6, padding: '2px 6px',
                        fontSize: 9, fontWeight: 800,
                        color: '#fff', letterSpacing: 0.5,
                        position: 'relative',
                      }}>
                        Grp {team.group}
                      </div>

                      {/* Team name */}
                      <div style={{
                        position: 'relative',
                        background: 'rgba(0,0,0,0.55)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: 8, padding: '5px 7px',
                        marginBottom: 4,
                      }}>
                        <div style={{
                          fontSize: 11, fontWeight: 800,
                          color: '#fff', lineHeight: 1.2,
                        }}>
                          {team.name}
                        </div>
                        <div style={{
                          fontSize: 9, color: 'rgba(255,255,255,0.6)',
                          fontWeight: 500, marginTop: 1,
                        }}>
                          {conf}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </main>
      <BottomNav />
    </>
  )
}
