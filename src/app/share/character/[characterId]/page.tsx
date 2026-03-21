'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'
import { CHARACTER_MAP } from '@/lib/constants'

export default function ShareCharacterPage() {
  const params = useParams()
  const characterId = params?.characterId as string
  const character = CHARACTER_MAP.get(characterId)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [quote, setQuote] = useState('')
  const [loading, setLoading] = useState(true)
  const [downloaded, setDownloaded] = useState(false)

  const drawCard = useCallback((quoteText: string) => {
    const canvas = canvasRef.current
    if (!canvas || !character) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 1080
    const H = 1920
    canvas.width = W
    canvas.height = H

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0, '#0a0a0a')
    bg.addColorStop(1, character.color + '44')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    // Character colour left accent
    ctx.fillStyle = character.color
    ctx.fillRect(0, 0, 12, H)

    // Monogram avatar
    ctx.fillStyle = character.color
    ctx.beginPath()
    if (ctx.roundRect) {
      ctx.roundRect(80, 200, 120, 120, 24)
    } else {
      ctx.rect(80, 200, 120, 120)
    }
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.font = 'bold 52px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText(character.monogram, 140, 276)

    // Character name
    ctx.fillStyle = '#f5f5f5'
    ctx.font = 'bold 56px system-ui'
    ctx.textAlign = 'left'
    ctx.fillText(character.name, 80, 380)
    ctx.fillStyle = '#606060'
    ctx.font = '36px system-ui'
    ctx.fillText(character.role, 80, 430)

    // Accent line
    ctx.fillStyle = character.color
    ctx.fillRect(80, 460, 200, 3)

    // Quote text wrapped
    ctx.fillStyle = '#e0e0e0'
    ctx.font = 'bold 52px system-ui'
    ctx.textAlign = 'left'
    const words = quoteText.split(' ')
    let line = ''
    let y = 580
    const maxWidth = W - 160
    for (const word of words) {
      const testLine = line + word + ' '
      if (ctx.measureText(testLine).width > maxWidth && line !== '') {
        ctx.fillText(line, 80, y)
        line = word + ' '
        y += 72
        if (y > H - 400) { line += '...'; break }
      } else {
        line = testLine
      }
    }
    if (line.trim()) ctx.fillText(line, 80, y)

    // WC2026 badge
    ctx.fillStyle = 'rgba(22,163,74,0.2)'
    ctx.beginPath()
    if (ctx.roundRect) {
      ctx.roundRect(80, H - 280, 320, 60, 12)
    } else {
      ctx.rect(80, H - 280, 320, 60)
    }
    ctx.fill()
    ctx.fillStyle = '#16a34a'
    ctx.font = 'bold 28px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('WC2026 · KickoffTo', 240, H - 242)

    // URL
    ctx.fillStyle = '#3a3a3a'
    ctx.font = '28px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText(`kickoffto.com/characters/${characterId}`, W / 2, H - 80)
  }, [character, characterId])

  useEffect(() => {
    if (!character) return
    const fallbackQuote = character.welcome.slice(0, 200)
    setQuote(fallbackQuote)
    drawCard(fallbackQuote)
    setLoading(false)
  }, [character, drawCard])

  useEffect(() => {
    if (quote) drawCard(quote)
  }, [quote, drawCard])

  function download() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `kickoffto-${characterId}-quote.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 2000)
  }

  if (!character) return (
    <>
      <Navbar />
      <main style={{ maxWidth: 500, margin: '0 auto', padding: '60px 16px',
        textAlign: 'center' }}>
        <p style={{ color: 'var(--text-2)', marginBottom: 12 }}>Character not found</p>
        <a href="/characters" style={{ color: 'var(--green)' }}>← All characters</a>
      </main>
      <BottomNav />
    </>
  )

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 500, margin: '0 auto', padding: '32px 16px 100px' }}>
        <a href={`/characters/${characterId}`} style={{
          fontSize: 12, color: 'var(--green)', textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20,
        }}>
          ← Back to {character.name}
        </a>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 24, color: 'var(--text)', marginBottom: 6 }}>
          Share {character.name}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20 }}>
          9:16 quote card for Stories, Reels and TikTok.
        </p>
        <div style={{
          border: '1px solid var(--border)', borderRadius: 12,
          overflow: 'hidden', marginBottom: 16, maxHeight: 450,
          display: 'flex', alignItems: 'center', background: '#000',
        }}>
          <canvas ref={canvasRef}
            style={{ width: '100%', maxHeight: 450, objectFit: 'contain' }} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={download} disabled={loading} style={{
            flex: 1, background: loading ? 'var(--bg-elevated)' : 'var(--green)',
            color: loading ? 'var(--text-3)' : '#fff', border: 'none',
            borderRadius: 10, padding: '12px', fontSize: 13, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {downloaded ? '✓ Downloaded!' : '↓ Download 9:16 card'}
          </button>
          <button onClick={() => {
            navigator.clipboard?.writeText(
              `${window.location.origin}/characters/${characterId}`
            )
            alert('Link copied!')
          }} style={{
            flex: 1, background: 'var(--bg-elevated)',
            border: '1px solid var(--border)', borderRadius: 10,
            padding: '12px', fontSize: 13, color: 'var(--text-2)', cursor: 'pointer',
          }}>
            Copy link
          </button>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
