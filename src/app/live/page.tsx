import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'
import { Ticker } from '@/components/ui/Ticker'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Live — KickoffTo',
  description: 'Live WC2026 match rooms with AI commentary and fan reactions.',
}

export default function LiveIndexPage() {
  const daysUntil = Math.max(0, Math.floor(
    (new Date('2026-06-11T20:00:00Z').getTime() - Date.now()) / 86400000
  ))

  return (
    <>
      <Navbar />
      <Ticker segments={[
        '⚡ Live match rooms open June 11 · WC2026',
        'Goal explainers · AI radio · Crowd reactions',
        `Tournament starts in ${daysUntil} days`,
      ]} />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px 100px' }}>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(24px, 4vw, 40px)',
          letterSpacing: -0.5, color: 'var(--text)', marginBottom: 8,
        }}>
          LIVE MATCH ROOMS
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 32, lineHeight: 1.6 }}>
          Every WC2026 match gets its own live room with auto-triggered AI
          commentary, crowd reactions, momentum tracking and KickoffTo Radio.
          Rooms open automatically at kickoff.
        </p>

        {/* Tournament countdown */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 20, marginBottom: 20, textAlign: 'center',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Tournament begins
          </div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 900,
            fontVariantNumeric: 'tabular-nums', color: 'var(--text)',
            letterSpacing: -1, marginBottom: 4,
          }}>
            {daysUntil}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-2)' }}>
            days until June 11, 2026
          </div>
        </div>

        {/* What to expect */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            What happens in a live room
          </p>
          {[
            { icon: '⚽', title: 'Auto goal explainer', desc: 'El Maestro + The Voice analyse every goal in real time — no user input needed' },
            { icon: '🔥', title: 'Crowd reactions', desc: 'Hype / Shock / Drama — anonymous live tallies from all fans watching' },
            { icon: '📊', title: 'Momentum meter', desc: 'Team kit colours show which side is dominating — updates every 60 seconds' },
            { icon: '🎙️', title: 'KickoffTo Radio', desc: 'Groq generates 2-sentence commentary — pick your commentator voice' },
          ].map(item => (
            <div key={item.title} style={{
              display: 'flex', gap: 14, padding: '12px 0',
              borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Preview demo room */}
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          Preview demo
        </p>
        <Link href="/live/mock-arg-fra" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderLeft: '3px solid var(--green)',
            borderRadius: '0 12px 12px 0',
            padding: 16,
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--green)',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Demo · Argentina vs France
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 28 }}>🇦🇷</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 32,
                fontWeight: 900, fontVariantNumeric: 'tabular-nums', color: 'var(--text)' }}>
                2 – 1
              </span>
              <span style={{ fontSize: 28 }}>🇫🇷</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10 }}>
              Group A · MetLife Stadium · 67&apos;
            </div>
            <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>
              Open demo match room →
            </div>
          </div>
        </Link>

      </main>
      <BottomNav />
    </>
  )
}
