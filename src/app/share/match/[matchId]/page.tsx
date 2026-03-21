'use client'
import { useRef, useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'

const MOCK_MATCHES: Record<string, any> = {
  'mock-arg-fra': {
    homeTeam: { name: 'Argentina', flag: '🇦🇷', kitColor: '#75aadb' },
    awayTeam: { name: 'France', flag: '🇫🇷', kitColor: '#003087' },
    homeScore: 2, awayScore: 1,
    round: 'Group A', venue: 'MetLife Stadium',
    keyMoments: ["23' ⚽ Messi (ARG)", "45' ⚽ Mbappé (FRA)", "67' ⚽ Messi pen (ARG)"],
  },
}

export default function ShareMatchPage() {
  const params = useParams()
  const matchId = params?.matchId as string
  const match = MOCK_MATCHES[matchId] ?? MOCK_MATCHES['mock-arg-fra']
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [downloaded, setDownloaded] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 1080
    const H = 1920
    canvas.width = W
    canvas.height = H

    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, W, H)

    // Kit colour halves
    const lg = ctx.createLinearGradient(0, 0, W / 2, 0)
    lg.addColorStop(0, match.homeTeam.kitColor + '55')
    lg.addColorStop(1, 'transparent')
    ctx.fillStyle = lg
    ctx.fillRect(0, 0, W / 2, H * 0.55)

    const rg = ctx.createLinearGradient(W / 2, 0, W, 0)
    rg.addColorStop(0, 'transparent')
    rg.addColorStop(1, match.awayTeam.kitColor + '55')
    ctx.fillStyle = rg
    ctx.fillRect(W / 2, 0, W / 2, H * 0.55)

    // Header
    ctx.fillStyle = '#16a34a'
    ctx.font = 'bold 40px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('KickoffTo · WC2026', W / 2, 120)
    ctx.fillStyle = '#5a5a5a'
    ctx.font = '32px system-ui'
    ctx.fillText(match.round + ' · ' + match.venue, W / 2, 168)

    // Flags
    ctx.font = '200px system-ui'
    ctx.fillText(match.homeTeam.flag, W / 4, 520)
    ctx.fillText(match.awayTeam.flag, (W * 3) / 4, 520)

    // Score
    ctx.fillStyle = '#f5f5f5'
    ctx.font = 'bold 220px system-ui'
    ctx.fillText(`${match.homeScore}–${match.awayScore}`, W / 2, 780)

    // Team names
    ctx.font = 'bold 52px system-ui'
    ctx.fillText(match.homeTeam.name, W / 4, 860)
    ctx.fillText(match.awayTeam.name, (W * 3) / 4, 860)

    // Divider
    ctx.fillStyle = '#2a2a2a'
    ctx.fillRect(80, 900, W - 160, 1)

    // Key moments
    ctx.fillStyle = '#f5f5f5'
    ctx.font = 'bold 36px system-ui'
    ctx.textAlign = 'left'
    ctx.fillText('KEY MOMENTS', 80, 980)
    ctx.fillStyle = '#a0a0a0'
    ctx.font = '38px system-ui'
    match.keyMoments.forEach((m: string, i: number) => {
      ctx.fillText(m, 80, 1060 + i * 72)
    })

    // URL
    ctx.fillStyle = '#3a3a3a'
    ctx.font = '30px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('kickoffto.com', W / 2, H - 80)
  }, [match])

  function download() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `kickoffto-match-${matchId}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 2000)
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 500, margin: '0 auto', padding: '32px 16px 100px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 24, color: 'var(--text)', marginBottom: 6 }}>
          Share Match
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20 }}>
          {match.homeTeam.flag} {match.homeTeam.name} {match.homeScore}–
          {match.awayScore} {match.awayTeam.name} {match.awayTeam.flag}
        </p>
        <div style={{
          border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden',
          marginBottom: 16, maxHeight: 450,
          display: 'flex', alignItems: 'center', background: '#000',
        }}>
          <canvas ref={canvasRef}
            style={{ width: '100%', maxHeight: 450, objectFit: 'contain' }} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={download} style={{
            flex: 1, background: 'var(--green)', color: '#fff', border: 'none',
            borderRadius: 10, padding: '12px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>
            {downloaded ? '✓ Downloaded!' : '↓ Download 9:16 card'}
          </button>
          <a href={`/live/${matchId}`} style={{
            flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '12px', fontSize: 13, color: 'var(--text-2)',
            textDecoration: 'none', textAlign: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            Live room →
          </a>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
