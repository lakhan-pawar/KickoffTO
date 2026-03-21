import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'
import Link from 'next/link'

const MORE_LINKS = [
  { href: '/history', icon: '📜', label: 'WC History', desc: 'All 23 World Cups · 1930–2026' },
  { href: '/story',   icon: '📖', label: 'Story Mode', desc: 'The WC2026 AI novel · daily chapters' },
  { href: '/pulse',   icon: '🌐', label: 'Internet Pulse', desc: 'What the world is saying right now' },
  { href: '/schedule',icon: '📅', label: 'Schedule', desc: 'All 104 WC2026 fixtures' },
  { href: '/teams',   icon: '🏳️', label: 'Teams', desc: 'All 48 qualified nations' },
  { href: '/groups',  icon: '⚽', label: 'Groups', desc: '12 groups · standings' },
]

export default function MorePage() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px 100px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 28, letterSpacing: -0.5, color: 'var(--text)', marginBottom: 20 }}>
          MORE
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MORE_LINKS.map(item => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div className="card-hover" style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{item.desc}</div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>→</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <BottomNav />
    </>
  )
}
