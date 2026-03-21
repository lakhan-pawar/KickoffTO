import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'
export default function PulsePage() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '60px 16px',
        textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌐</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 28, color: 'var(--text)', marginBottom: 8 }}>Internet Pulse</h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6,
          maxWidth: 400, margin: '0 auto' }}>
          Live Bluesky posts, Reddit discussions and YouTube highlights.
          Launching with the tournament on June 11.
        </p>
      </main>
      <BottomNav />
    </>
  )
}
