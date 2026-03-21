import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'
import Link from 'next/link'
export default function StoryPage() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '60px 16px',
        textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 28, color: 'var(--text)', marginBottom: 8 }}>Story Mode</h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6,
          maxWidth: 400, margin: '0 auto 24px' }}>
          The WC2026 AI novel begins on June 11. A new chapter generates
          after every match day — written by The Archive.
        </p>
        <Link href="/" style={{ color: 'var(--green)', fontSize: 13 }}>← Home</Link>
      </main>
      <BottomNav />
    </>
  )
}
