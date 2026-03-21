import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'
import { getCache, setCache, CACHE_KEYS } from '@/lib/redis'
import { groqChat } from '@/lib/groq'
import Link from 'next/link'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

// Mock player data — replace with API-Football when tournament starts
const PLAYERS: Record<string, any> = {
  'messi': {
    id: 'messi', name: 'Lionel Messi', position: 'ATT',
    nationality: 'Argentina', flag: '🇦🇷', age: 38,
    club: 'Inter Miami', photo: null,
    kitColors: ['#75aadb', '#ffffff'],
    stats: { goals: 0, assists: 0, appearances: 0, rating: null },
    bio: 'The greatest footballer of all time, making what could be his final World Cup appearance.',
  },
  'mbappe': {
    id: 'mbappe', name: 'Kylian Mbappé', position: 'ATT',
    nationality: 'France', flag: '🇫🇷', age: 27,
    club: 'Real Madrid', photo: null,
    kitColors: ['#003087', '#ffffff'],
    stats: { goals: 0, assists: 0, appearances: 0, rating: null },
    bio: 'The heir apparent to Messi and Ronaldo. WC2026 is his tournament to own.',
  },
  'davies': {
    id: 'davies', name: 'Alphonso Davies', position: 'DEF',
    nationality: 'Canada', flag: '🇨🇦', age: 25,
    club: 'Bayern Munich', photo: null,
    kitColors: ['#e31837', '#ffffff'],
    stats: { goals: 0, assists: 0, appearances: 0, rating: null },
    bio: "Canada's most recognisable player. A left-back who attacks like a winger.",
  },
}

async function getScoutReport(playerId: string, playerName: string): Promise<string> {
  const cacheKey = CACHE_KEYS.playerScout(playerId)
  const cached = await getCache<{ report: string }>(cacheKey)
  if (cached) return cached.report

  try {
    const report = await groqChat(
      [{
        role: 'user',
        content: `You are TalentSpotter, a chief football scout at WC2026.
Write a 3-sentence scouting report for ${playerName}.
Style: precise, analytical, name specific strengths and one concern.
3 sentences only. No bullet points.`,
      }],
      'llama-3.3-70b-versatile',
      200,
      'You are TalentSpotter, a chief football scout. 3 sentences only.',
    )
    await setCache(cacheKey, { report: report.trim() }, 86400 * 7)
    return report.trim()
  } catch {
    return `${playerName} is one of the standout players at WC2026. A technically gifted performer with excellent decision-making. Worth watching closely throughout the tournament.`
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const player = PLAYERS[id]
  if (!player) return { title: 'Player — KickoffTo' }
  return {
    title: `${player.name} — KickoffTo WC2026`,
    description: player.bio,
  }
}

export default async function PlayerPage({ params }: PageProps) {
  const { id } = await params
  const player = PLAYERS[id]

  if (!player) {
    return (
      <>
        <Navbar />
        <main style={{ maxWidth: 600, margin: '0 auto', padding: '60px 16px',
          textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 24, color: 'var(--text)', marginBottom: 8 }}>
            Player not found
          </h1>
          <Link href="/teams" style={{ color: 'var(--green)', fontSize: 13 }}>
            ← Browse all teams
          </Link>
        </main>
        <BottomNav />
      </>
    )
  }

  const scoutReport = await getScoutReport(player.id, player.name)

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px 100px' }}>

        {/* Player header */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 16, padding: 24, marginBottom: 16,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Ghost flag */}
          <div style={{
            position: 'absolute', right: -10, top: -10,
            fontSize: 100, opacity: 0.06, lineHeight: 1,
            pointerEvents: 'none',
          }}>
            {player.flag}
          </div>

          {/* Kit strip */}
          <div style={{
            display: 'flex', gap: 3, marginBottom: 16,
          }}>
            {player.kitColors.map((color: string, i: number) => (
              <div key={i} style={{
                height: 6, flex: 1, borderRadius: 3,
                background: color, opacity: 0.8,
              }} />
            ))}
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            {/* Photo placeholder */}
            <div style={{
              width: 72, height: 72, borderRadius: 14,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, flexShrink: 0,
            }}>
              {player.flag}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 24, letterSpacing: -0.3,
                color: 'var(--text)', marginBottom: 4,
              }}>
                {player.name}
              </h1>
              <div style={{
                display: 'flex', gap: 8, flexWrap: 'wrap',
                fontSize: 12, color: 'var(--text-3)', marginBottom: 8,
              }}>
                <span>{player.position}</span>
                <span>·</span>
                <span>{player.nationality}</span>
                <span>·</span>
                <span>Age {player.age}</span>
                <span>·</span>
                <span>{player.club}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
                {player.bio}
              </p>
            </div>
          </div>
        </div>

        {/* TalentSpotter scouting report */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderLeft: '3px solid #1a3a3a',
          borderRadius: '0 12px 12px 0',
          padding: 16, marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 7,
              background: '#1a3a3a',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 9, color: 'rgba(255,255,255,0.85)',
            }}>TS</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>
                TalentSpotter · Scout Report
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>
                Cached · AI-generated · WC2026
              </div>
            </div>
          </div>
          <p style={{
            fontSize: 13, color: 'var(--text-2)',
            lineHeight: 1.7, fontStyle: 'italic', margin: 0,
          }}>
            &ldquo;{scoutReport}&rdquo;
          </p>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href={`/cards/${player.id}`} style={{
            flex: 1, background: 'var(--bg-elevated)',
            border: '1px solid var(--border)', borderRadius: 10,
            padding: '12px 16px', textDecoration: 'none',
            fontSize: 13, color: 'var(--text)',
            display: 'flex', alignItems: 'center', gap: 8,
            minWidth: 140,
          }}>
            🃏 Trading card
          </Link>
          <Link href={`/characters/talentspotter`} style={{
            flex: 1, background: 'var(--bg-elevated)',
            border: '1px solid var(--border)', borderRadius: 10,
            padding: '12px 16px', textDecoration: 'none',
            fontSize: 13, color: 'var(--text)',
            display: 'flex', alignItems: 'center', gap: 8,
            minWidth: 140,
          }}>
            🔍 Ask TalentSpotter
          </Link>
          <Link href="/characters/xg-oracle" style={{
            flex: 1, background: 'var(--bg-elevated)',
            border: '1px solid var(--border)', borderRadius: 10,
            padding: '12px 16px', textDecoration: 'none',
            fontSize: 13, color: 'var(--text)',
            display: 'flex', alignItems: 'center', gap: 8,
            minWidth: 140,
          }}>
            📊 Ask xG Oracle
          </Link>
        </div>

      </main>
      <BottomNav />
    </>
  )
}
