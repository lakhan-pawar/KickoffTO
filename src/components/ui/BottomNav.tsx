'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/',           icon: '⚽', label: 'Home' },
  { href: '/characters', icon: '🎭', label: 'AI Chat' },
  { href: '/live',       icon: '⚡', label: 'Live' },
  { href: '/games',      icon: '🎮', label: 'Games' },
  { href: '/more',       icon: '☰',  label: 'More' },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      height: 56,
      background: 'rgba(8,8,8,0.98)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {TABS.map(({ href, icon, label }) => {
        const active = href === '/' ? pathname === '/' : pathname?.startsWith(href)
        return (
          <Link key={href} href={href} style={{
            flex: 1, textDecoration: 'none',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 3, position: 'relative', minHeight: 44,
          }}>
            {active && (
              <div style={{
                position: 'absolute', top: 0,
                width: 28, height: 2.5, borderRadius: '0 0 3px 3px',
                background: 'linear-gradient(90deg,#16a34a,#22c55e)',
              }} />
            )}
            <span style={{
              fontSize: 19, lineHeight: 1,
              opacity: active ? 1 : 0.38,
            }}>
              {icon}
            </span>
            <span style={{
              fontSize: 10, fontWeight: active ? 700 : 400,
              color: active ? 'var(--green-bright)' : 'var(--text-3)',
              letterSpacing: 0.1,
            }}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
