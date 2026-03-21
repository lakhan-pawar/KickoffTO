import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'
import Link from 'next/link'

export default function BracketPage() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '60px 16px 100px',
        textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 28, color: 'var(--text)', marginBottom: 8 }}>
          Bracket Battle
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6,
          marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
          The full 48-team bracket builder launches when the groups are confirmed.
          Check back closer to June 11.
        </p>
        <Link href="/games" style={{
          background: 'var(--green)', color: '#fff', textDecoration: 'none',
          padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
        }}>
          ← Back to games
        </Link>
      </main>
      <BottomNav />
    </>
  )
}
