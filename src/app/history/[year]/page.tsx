// src/app/history/[year]/page.tsx v2
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'
import Link from 'next/link'
import type { Metadata } from 'next'
import wcHistory from '@/data/wc-history.json'

function getHistoryFlag(winnerName: string): string {
  const name = winnerName.toLowerCase().replace('west ', '').trim()
  const map: Record<string,string> = {
    uruguay:'uy', italy:'it', germany:'de', brazil:'br', england:'gb-eng',
    argentina:'ar', france:'fr', spain:'es'
  }
  return map[name] ?? 'un'
}

interface PageProps {
  params: Promise<{ year: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year } = await params
  const wc = (wcHistory as any[]).find(w => String(w.year) === year)
  if (!wc) return { title: 'Year not found — KickoffTo' }
  return {
    title: `${wc.year} World Cup — KickoffTo`,
    description: `${wc.winner} won the ${wc.year} World Cup in ${wc.host}. ${wc.narrative}`,
  }
}

export function generateStaticParams() {
  return (wcHistory as any[]).map(wc => ({ year: String(wc.year) }))
}

export default async function HistoryYearPage({ params }: PageProps) {
  const { year } = await params
  const wc = (wcHistory as any[]).find(w => String(w.year) === year)
  if (!wc) notFound()

  const allYears = (wcHistory as any[]).map(w => w.year).sort()
  const currentIndex = allYears.indexOf(wc.year)
  const prevYear = currentIndex > 0 ? allYears[currentIndex - 1] : null
  const nextYear = currentIndex < allYears.length - 1 ? allYears[currentIndex + 1] : null

  return (
    <>
      <Navbar />
      <main style={{
        maxWidth: 720, margin: '0 auto', padding: '32px 16px 100px',
        // Subtle Archive forest tint
        background: 'color-mix(in srgb, #1a3a1a 4%, transparent)',
        minHeight: '100vh',
      }}>

        {/* Back link */}
        <Link href="/history" style={{
          fontSize: 12, color: 'var(--green)', textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24,
        }}>
          ← All World Cups
        </Link>

        <div style={{ position: 'relative', marginBottom: 8 }}>
          <h1 style={{
            fontFamily:'var(--font-display)', fontWeight:900,
            fontSize:'clamp(48px, 12vw, 96px)',
            letterSpacing:-3, lineHeight:1,
            color:'var(--text)',
            // Add text shadow for visibility on all backgrounds:
            WebkitTextStroke:'1px rgba(128,128,128,0.3)',
            marginBottom:8,
          }}>
            {wc.year}
          </h1>
        </div>

        {/* Winner + host */}
        <div style={{ textAlign:'center', marginBottom:16 }}>
          <img
            src={`https://flagcdn.com/w160/${getHistoryFlag(wc.winner ?? '')}.png`}
            alt={wc.winner}
            style={{
              width:96, height:'auto',
              borderRadius:10,
              boxShadow:'0 8px 32px rgba(0,0,0,0.4)',
              border:'2px solid rgba(255,255,255,0.1)',
            }}
          />
        </div>
        <div style={{ marginBottom: 4 }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 24,
            fontWeight: 800, color: 'var(--text)',
          }}>
            {wc.winner}
          </span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 4 }}>
          {wc.host} · Final: {wc.finalScore}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 24 }}>
          Top scorer: {wc.topScorer} · {wc.teams} teams
        </div>

        <div style={{ height: 1, background: 'var(--border)', marginBottom: 24 }} />

        {/* The Archive narration card */}
        <div style={{
          background: 'rgba(10,20,10,0.6)',
          border: '1px solid rgba(26,58,26,0.4)',
          borderLeft: '3px solid #1a3a1a',
          borderRadius: '0 12px 12px 0',
          padding: 20, marginBottom: 24,
        }}>
          {/* Archive header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: '#1a3a1a',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 10, color: 'rgba(255,255,255,0.85)',
            }}>
              AR
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)' }}>
                The Archive
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Football Historian</div>
            </div>
          </div>

          <p style={{
            fontSize: 14, color: 'var(--text-2)',
            lineHeight: 1.85, fontStyle: 'italic', margin: 0,
          }}>
            &ldquo;{wc.narrative}&rdquo;
          </p>
        </div>

        {/* Ask The Archive CTA */}
        <Link href="/characters/the-archive" style={{
          background: 'var(--bg-card)',
          border: '1px solid #1a3a1a',
          borderRadius: 10, padding: '12px 16px',
          textDecoration: 'none', marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
            Want to know more about the {wc.year} World Cup?
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)', flexShrink: 0 }}>
            Ask The Archive →
          </span>
        </Link>

        {/* Prev / Next year navigation */}
        <div style={{ display: 'flex', gap: 10 }}>
          {prevYear && (
            <Link href={`/history/${prevYear}`} style={{
              flex: 1, background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: 10,
              padding: '10px 14px', textDecoration: 'none',
              fontSize: 12, color: 'var(--text-2)',
            }}>
              ← {prevYear}
            </Link>
          )}
          {nextYear && (
            <Link href={`/history/${nextYear}`} style={{
              flex: 1, background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: 10,
              padding: '10px 14px', textDecoration: 'none',
              fontSize: 12, color: 'var(--text-2)', textAlign: 'right',
            }}>
              {nextYear} →
            </Link>
          )}
        </div>

      </main>
      <BottomNav />
    </>
  )
}
