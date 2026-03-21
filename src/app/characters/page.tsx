import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'
import type { Metadata } from 'next'
import { CharactersClient } from './CharactersClient'

export const metadata: Metadata = {
  title: 'AI Characters — KickoffTo WC2026',
  description: '16 AI characters. Chat live about WC2026.',
}

export default function CharactersPage() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 14px 80px' }}>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 28, letterSpacing: -0.5,
          color: 'var(--text)', marginBottom: 6,
        }}>
          AI CHARACTERS
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 24 }}>
          16 characters. Each one unique. Tap any to start chatting about WC2026.
        </p>

        <CharactersClient />
      </main>
      <BottomNav />
    </>
  )
}
