import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'
import Link from 'next/link'
import { TradingCard } from '@/components/cards/TradingCard'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ playerId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { playerId } = await params
  return {
    title: `Player Card — KickoffTo`,
    description: `Generate a WC2026 player trading card for ${playerId}. Download as PNG.`,
  }
}

// Mock player data — replace with API-Football data in production
function getMockPlayer(playerId: string) {
  const players: Record<string, any> = {
    'messi': {
      id: 'messi', name: 'L. Messi', fullName: 'Lionel Messi',
      position: 'ATT', nationality: 'Argentina', flag: '🇦🇷',
      club: 'Inter Miami', photo: null,
      kitColors: ['#75aadb', '#ffffff'],
      stats: { goals: 6, assists: 4, appearances: 7, rating: 9.2 },
      rarity: 'gold',
      number: 10,
      highlights: ['2022 World Cup Winner', 'Record 8 Ballon d\'Or', 'All-time WC goal record holder'],
    },
    'mbappe': {
      id: 'mbappe', name: 'K. Mbappé', fullName: 'Kylian Mbappé',
      position: 'ATT', nationality: 'France', flag: '🇫🇷',
      club: 'Real Madrid', photo: null,
      kitColors: ['#003087', '#ffffff'],
      stats: { goals: 5, assists: 3, appearances: 7, rating: 8.9 },
      rarity: 'gold',
      number: 9,
      highlights: ['2022 Golden Boot · 8 goals', 'Youngest French WC finalist', 'Champions League winner 2024'],
    },
    'davies': {
      id: 'davies', name: 'A. Davies', fullName: 'Alphonso Davies',
      position: 'DEF', nationality: 'Canada', flag: '🇨🇦',
      club: 'Bayern Munich', photo: null,
      kitColors: ['#e31837', '#ffffff'],
      stats: { goals: 1, assists: 3, appearances: 6, rating: 8.1 },
      rarity: 'silver',
      number: 19,
      highlights: ['Canada\'s highest paid player', 'Bundesliga champion × 6', 'Hosting WC2026 on home soil'],
    },
    'bellingham': {
      id: 'bellingham', name: 'J. Bellingham', fullName: 'Jude Bellingham',
      position: 'MID', nationality: 'England', flag: '🏴',
      club: 'Real Madrid', photo: null,
      kitColors: ['#cf081f', '#ffffff'],
      stats: { goals: 0, assists: 0, appearances: 0, rating: 0 },
      rarity: 'gold',
    },
    'vinicius': {
      id: 'vinicius', name: 'Vinicius Jr.', fullName: 'Vinicius Junior',
      position: 'ATT', nationality: 'Brazil', flag: '🇧🇷',
      club: 'Real Madrid', photo: null,
      kitColors: ['#f7e03b', '#009c3b'],
      stats: { goals: 0, assists: 0, appearances: 0, rating: 0 },
      rarity: 'gold',
    },
    'haaland': {
      id: 'haaland', name: 'E. Haaland', fullName: 'Erling Haaland',
      position: 'ATT', nationality: 'Norway', flag: '🇳🇴',
      club: 'Man City', photo: null,
      kitColors: ['#97c1e7', '#ffffff'],
      stats: { goals: 0, assists: 0, appearances: 0, rating: 0 },
      rarity: 'gold',
    },
    'kane': {
      id: 'kane', name: 'H. Kane', fullName: 'Harry Kane',
      position: 'ATT', nationality: 'England', flag: '🏴',
      club: 'Bayern Munich', photo: null,
      kitColors: ['#cf081f', '#ffffff'],
      stats: { goals: 0, assists: 0, appearances: 0, rating: 0 },
      rarity: 'silver',
    },
    'salah': {
      id: 'salah', name: 'M. Salah', fullName: 'Mohamed Salah',
      position: 'ATT', nationality: 'Egypt', flag: '🇪🇬',
      club: 'Liverpool', photo: null,
      kitColors: ['#c8102e', '#ffffff'],
      stats: { goals: 0, assists: 0, appearances: 0, rating: 0 },
      rarity: 'gold',
    },
    'pulisic': {
      id: 'pulisic', name: 'C. Pulisic', fullName: 'Christian Pulisic',
      position: 'ATT', nationality: 'American', flag: '🇺🇸',
      club: 'AC Milan', photo: null,
      kitColors: ['#b22234', '#ffffff'],
      stats: { goals: 8, assists: 9, appearances: 78, rating: 7.8 },
      rarity: 'silver', number: 10,
    },
    'adams': {
      id: 'adams', name: 'T. Adams', fullName: 'Tyler Adams',
      position: 'CDM', nationality: 'American', flag: '🇺🇸',
      club: 'AFC Bournemouth', photo: null,
      kitColors: ['#b22234', '#ffffff'],
      stats: { goals: 2, assists: 8, appearances: 52, rating: 7.4 },
      rarity: 'silver', number: 4,
    },
    'mckennie': {
      id: 'mckennie', name: 'W. McKennie', fullName: 'Weston McKennie',
      position: 'MID', nationality: 'American', flag: '🇺🇸',
      club: 'Juventus', photo: null,
      kitColors: ['#b22234', '#ffffff'],
      stats: { goals: 6, assists: 7, appearances: 62, rating: 7.3 },
      rarity: 'silver', number: 8,
    },
    'balogun': {
      id: 'balogun', name: 'F. Balogun', fullName: 'Folarin Balogun',
      position: 'ST', nationality: 'American', flag: '🇺🇸',
      club: 'Monaco', photo: null,
      kitColors: ['#b22234', '#ffffff'],
      stats: { goals: 14, assists: 5, appearances: 18, rating: 7.5 },
      rarity: 'silver', number: 9,
    },
    'turner': {
      id: 'turner', name: 'M. Turner', fullName: 'Matt Turner',
      position: 'GK', nationality: 'American', flag: '🇺🇸',
      club: 'Crystal Palace', photo: null,
      kitColors: ['#b22234', '#ffffff'],
      stats: { goals: 0, assists: 0, appearances: 38, rating: 7.1 },
      rarity: 'bronze', number: 1,
    },
    'wirtz': {
      id: 'wirtz', name: 'F. Wirtz', fullName: 'Florian Wirtz',
      position: 'CAM', nationality: 'German', flag: '🇩🇪',
      club: 'Bayer Leverkusen', photo: null,
      kitColors: ['#ffffff', '#000000'],
      stats: { goals: 18, assists: 20, appearances: 32, rating: 8.6 },
      rarity: 'gold', number: 10,
    },
    'hakimi': {
      id: 'hakimi', name: 'A. Hakimi', fullName: 'Achraf Hakimi',
      position: 'DEF', nationality: 'Moroccan', flag: '🇲🇦',
      club: 'PSG', photo: null,
      kitColors: ['#c1272d', '#006233'],
      stats: { goals: 4, assists: 12, appearances: 68, rating: 7.9 },
      rarity: 'silver', number: 2,
    },
  }
  return players[playerId] || null
}

export default async function CardPage({ params }: PageProps) {
  const { playerId } = await params
  const player = getMockPlayer(playerId)

  if (!player) {
    return (
      <>
        <Navbar />
        <main style={{ maxWidth: 500, margin: '0 auto', padding: '60px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🃏</div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 22, color: 'var(--text)', marginBottom: 8,
          }}>
            Card not found
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20 }}>
            We don&apos;t have a card for &ldquo;{playerId}&rdquo; yet.
            Full squad cards arrive June 11 when squads are confirmed.
          </p>
          <Link href="/cards" style={{
            background: 'linear-gradient(135deg,#16a34a,#15803d)',
            color: '#fff', textDecoration: 'none', borderRadius: 12,
            padding: '12px 24px', fontSize: 14, fontWeight: 700,
          }}>
            ← All cards
          </Link>
        </main>
        <BottomNav />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '32px 16px 100px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 24, letterSpacing: -0.3, color: 'var(--text)', marginBottom: 4,
        }}>
          Trading Card
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 24 }}>
          WC2026 · {player.fullName} · {player.nationality}
        </p>

        <TradingCard player={player} />

        {/* Quick links to other players */}
        <div style={{ marginTop: 24 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            Try other players
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['messi', 'mbappe', 'davies'].filter(id => id !== playerId).map(id => (
              <a key={id} href={`/cards/${id}`} style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '6px 12px', fontSize: 12,
                color: 'var(--text-2)', textDecoration: 'none',
                textTransform: 'capitalize',
              }}>
                {id} →
              </a>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
