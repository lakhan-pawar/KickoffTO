import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'
import { Ticker } from '@/components/ui/Ticker'
import Link from 'next/link'
import type { Metadata } from 'next'
import wcHistory from '@/data/wc-history.json'

export const metadata: Metadata = {
  title: 'WC History — KickoffTo',
  description: 'Every World Cup from 1930 to 2026. Narrated by The Archive.',
}

export default function HistoryPage() {
  return (
    <>
      <Navbar />
      <Ticker segments={[
        '📜 All 23 World Cups · 1930 to 2026',
        'Narrated by The Archive · KickoffTo',
        'Click any year to hear the story',
      ]} />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px 100px' }}>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(24px, 4vw, 40px)',
            letterSpacing: -0.5, color: 'var(--text)', marginBottom: 8,
          }}>
            MEMORY PALACE
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>
            Every World Cup from 1930 to 2026. Click any year — The Archive narrates.
          </p>
        </div>

        {/* Archive character spotlight */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderLeft: '3px solid #1a3a1a',
          borderRadius: '0 12px 12px 0',
          padding: 16, marginBottom: 28,
          display: 'flex', gap: 12, alignItems: 'center',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: '#1a3a1a',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 13, color: 'rgba(255,255,255,0.85)', flexShrink: 0,
          }}>
            AR
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
              The Archive · Football Historian
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5 }}>
              &ldquo;Every tournament has a story. Every final a moment. Click any year and I will tell you what it really meant.&rdquo;
            </div>
          </div>
        </div>

        {/* Timeline grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 10,
        }}>
          {(wcHistory as any[]).map((wc: any) => (
            <Link
              key={wc.year}
              href={`/history/${wc.year}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="card-archive-hover" style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 12, padding: 14,
                position: 'relative', overflow: 'hidden',
                cursor: 'pointer',
              }}>
                {/* Ghost year */}
                <div style={{
                  position: 'absolute', right: -4, bottom: -8,
                  fontFamily: 'var(--font-display)',
                  fontSize: 48, fontWeight: 900,
                  color: 'transparent',
                  WebkitTextStroke: '1px var(--border)',
                  lineHeight: 1, pointerEvents: 'none',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {wc.year}
                </div>

                <div style={{ fontSize: 20, marginBottom: 6 }}>
                  {wc.winnerFlag}
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 18,
                  fontWeight: 800, color: 'var(--text)',
                  fontVariantNumeric: 'tabular-nums', marginBottom: 2,
                }}>
                  {wc.year}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', marginBottom: 2 }}>
                  {wc.winner}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>
                  {wc.host}
                </div>
              </div>
            </Link>
          ))}
        </div>

      </main>
      <BottomNav />
    </>
  )
}
