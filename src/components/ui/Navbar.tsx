'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const NAV = [
  { href: '/',           label: 'Home' },
  { href: '/characters', label: 'Characters' },
  { href: '/live',       label: 'Live' },
  { href: '/games',      label: 'Games' },
  { href: '/story',      label: 'Story' },
  { href: '/history',    label: 'History' },
]

export function Navbar({ isLive }: { isLive?: boolean } = {}) {
  const pathname = usePathname()
  const [dark, setDark] = useState(true)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('kt-theme')
    const isDark = stored !== 'light'
    setDark(isDark)
    document.documentElement.className = isDark ? 'dark' : 'light'
  }, [])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.className = next ? 'dark' : 'light'
    localStorage.setItem('kt-theme', next ? 'dark' : 'light')
  }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: scrolled ? 'rgba(8,8,8,0.97)' : 'rgba(8,8,8,0.8)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.07)' : 'transparent'}`,
      transition: 'all 0.2s',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '0 14px', height: 52,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        {/* Logo mark */}
        <Link href="/" style={{ textDecoration: 'none', flexShrink: 0, marginRight: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg, #16a34a 0%, #0d7a35 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(22,163,74,0.45)',
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 13, color: '#fff', letterSpacing: -0.5,
          }}>
            KT
          </div>
        </Link>

        {/* Nav */}
        <nav style={{
          flex: 1, display: 'flex', gap: 1,
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          {NAV.map(({ href, label }) => {
            const active = href === '/' ? pathname === '/' : pathname?.startsWith(href)
            return (
              <Link key={href} href={href} style={{ textDecoration: 'none', flexShrink: 0 }}>
                <div style={{
                  padding: '7px 11px', borderRadius: 9,
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  color: active ? '#fff' : 'var(--text-3)',
                  background: active ? 'rgba(22,163,74,0.18)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(22,163,74,0.3)' : 'transparent'}`,
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}>
                  {label}
                </div>
              </Link>
            )
          })}
        </nav>

        <button onClick={toggle} style={{
          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          color: 'var(--text-2)', cursor: 'pointer', fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {dark ? '☀' : '🌙'}
        </button>
      </div>
    </header>
  )
}
