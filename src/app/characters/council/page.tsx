import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'
import { CouncilClient } from '@/components/council/CouncilClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Character Council — KickoffTo',
  description: 'Ask all 8 characters simultaneously. See how they disagree.',
}

export default function CouncilPage() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 14px 80px' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <a href="/characters" style={{
              fontSize: 12, color: 'var(--green)',
              textDecoration: 'none', display: 'inline-flex',
              alignItems: 'center', gap: 4,
            }}>
              ← Characters
            </a>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 28, letterSpacing: -0.5, color: 'var(--text)', marginBottom: 6,
          }}>
            CHARACTER COUNCIL
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
            One question. 8 characters respond simultaneously.
            Tap &ldquo;Go deeper&rdquo; on any response to continue with that character.
          </p>
        </div>
        <CouncilClient />
      </main>
      <BottomNav />
    </>
  )
}
