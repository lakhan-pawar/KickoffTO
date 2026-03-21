import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'
import Link from 'next/link'

const FEATURED_TEAMS = [
  { code: 'ARG', name: 'Argentina', flag: '🇦🇷', group: 'A', star: 'L. Messi', playerId: 'messi' },
  { code: 'FRA', name: 'France', flag: '🇫🇷', group: 'D', star: 'K. Mbappé', playerId: 'mbappe' },
  { code: 'BRA', name: 'Brazil', flag: '🇧🇷', group: 'C', star: 'Vinicius Jr.', playerId: null },
  { code: 'ENG', name: 'England', flag: '🏴', group: 'E', star: 'J. Bellingham', playerId: null },
  { code: 'ESP', name: 'Spain', flag: '🇪🇸', group: 'B', star: 'Y. Yamal', playerId: null },
  { code: 'GER', name: 'Germany', flag: '🇩🇪', group: 'F', star: 'F. Wirtz', playerId: null },
  { code: 'POR', name: 'Portugal', flag: '🇵🇹', group: 'G', star: 'C. Ronaldo', playerId: null },
  { code: 'NED', name: 'Netherlands', flag: '🇳🇱', group: 'H', star: 'V. van Dijk', playerId: null },
  { code: 'CAN', name: 'Canada', flag: '🇨🇦', group: 'B', star: 'A. Davies', playerId: 'davies' },
  { code: 'USA', name: 'USA', flag: '🇺🇸', group: 'A', star: 'C. Pulisic', playerId: null },
  { code: 'MEX', name: 'Mexico', flag: '🇲🇽', group: 'C', star: 'H. Lozano', playerId: null },
  { code: 'MAR', name: 'Morocco', flag: '🇲🇦', group: 'F', star: 'A. Hakimi', playerId: null },
]

export default function TeamsPage() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px 100px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(24px, 4vw, 40px)',
          letterSpacing: -0.5, color: 'var(--text)', marginBottom: 8,
        }}>
          TEAMS
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 24 }}>
          48 nations · WC2026 · Canada, Mexico & USA
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 10, marginBottom: 24,
        }}>
          {FEATURED_TEAMS.map(team => (
            <div key={team.code} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 14, position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Ghost flag */}
              <div style={{
                position: 'absolute', right: -6, top: -6,
                fontSize: 52, opacity: 0.06, lineHeight: 1,
                pointerEvents: 'none',
              }}>
                {team.flag}
              </div>

              <div style={{ fontSize: 28, marginBottom: 8 }}>{team.flag}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14,
                fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                {team.name}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 8 }}>
                Group {team.group} · ⭐ {team.star}
              </div>
              <div style={{ display: 'flex', gap: 5 }}>
                {team.playerId && (
                  <Link href={`/players/${team.playerId}`} style={{
                    fontSize: 10, color: 'var(--green)', textDecoration: 'none',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: 5, padding: '3px 7px',
                  }}>
                    Scout →
                  </Link>
                )}
                <Link href={`/h2h?teamA=${team.code}`} style={{
                  fontSize: 10, color: 'var(--text-3)', textDecoration: 'none',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  borderRadius: 5, padding: '3px 7px',
                }}>
                  H2H →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center' }}>
          Full 48-team roster · Squads confirmed closer to June 11
        </p>
      </main>
      <BottomNav />
    </>
  )
}
