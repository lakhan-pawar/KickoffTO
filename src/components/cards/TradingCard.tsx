'use client'
import { useEffect, useRef, useState } from 'react'
import { PositionAvatar } from './PositionAvatar'

interface Player {
  id: string
  name: string
  fullName: string
  position: string
  nationality: string
  flag: string
  club: string
  photo: string | null
  kitColors: string[]
  stats: { goals: number; assists: number; appearances: number; rating: number }
  rarity: 'bronze' | 'silver' | 'gold' | 'rainbow'
}

interface TradingCardProps {
  player: Player
}

const RARITY_COLORS = {
  bronze: { border: '#8b5a2b', glow: 'rgba(139,90,43,0.4)', badge: '#cd7f32', text: 'Bronze' },
  silver: { border: '#708090', glow: 'rgba(112,128,144,0.3)', badge: '#c0c0c0', text: 'Silver' },
  gold: { border: '#d4a017', glow: 'rgba(212,160,23,0.5)', badge: '#ffd700', text: 'Gold' },
  rainbow: { border: '#9b59b6', glow: 'rgba(155,89,182,0.5)', badge: '#7c3aed', text: 'Rainbow Foil' },
}

const POSITION_MAP: Record<string, 'GK' | 'DEF' | 'MID' | 'ATT'> = {
  'GK': 'GK', 'GOALKEEPER': 'GK',
  'DEF': 'DEF', 'CB': 'DEF', 'LB': 'DEF', 'RB': 'DEF',
  'MID': 'MID', 'CM': 'MID', 'CAM': 'MID', 'CDM': 'MID',
  'ATT': 'ATT', 'ST': 'ATT', 'LW': 'ATT', 'RW': 'ATT', 'CF': 'ATT',
}

export function TradingCard({ player }: TradingCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [description, setDescription] = useState('')
  const [loadingDesc, setLoadingDesc] = useState(true)
  const [downloading, setDownloading] = useState(false)

  // Photo state
  const [proxiedPhotoUrl, setProxiedPhotoUrl] = useState<string | null>(null)
  const [photoLoaded, setPhotoLoaded] = useState(false)
  const [photoFailed, setPhotoFailed] = useState(false)
  const [loadingPhoto, setLoadingPhoto] = useState(true)
  const [photoSource, setPhotoSource] = useState<'sportsdb' | 'avatar'>('avatar')

  const rarity = RARITY_COLORS[player.rarity] ?? RARITY_COLORS.gold
  const kitColor = player.kitColors[0] ?? '#888888'
  const accentColor = player.kitColors[1] ?? '#ffffff'
  const positionKey = player.position.toUpperCase()
  const svgPosition = POSITION_MAP[positionKey] ?? 'ATT'

  // Step 1 — fetch photo URL from our API, then proxy it to avoid CORS
  useEffect(() => {
    let cancelled = false

    async function fetchAndProxyPhoto() {
      setLoadingPhoto(true)
      setPhotoLoaded(false)
      setPhotoFailed(false)
      setProxiedPhotoUrl(null)

      try {
        const res = await fetch(`/api/cards/${player.id}/photo`)
        if (!res.ok) throw new Error('No photo endpoint')

        const data = await res.json()
        const originalUrl = data.cutout ?? data.thumb ?? null

        if (!originalUrl) throw new Error('No photo URL')

        // Route through our proxy to bypass Canvas CORS restriction
        const proxied = `/api/proxy/image?url=${encodeURIComponent(originalUrl)}`
        if (!cancelled) setProxiedPhotoUrl(proxied)
      } catch {
        if (!cancelled) {
          setPhotoFailed(true)
          setPhotoSource('avatar')
          setLoadingPhoto(false)
        }
      }
    }

    fetchAndProxyPhoto()
    return () => { cancelled = true }
  }, [player.id])

  // Step 2 — draw card, (re)draw whenever photo state changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 300
    const H = 420
    canvas.width = W
    canvas.height = H

    function drawCard(photoImg?: HTMLImageElement) {
      if (!ctx) return

      // Base background
      ctx.fillStyle = '#0a0a0a'
      ctx.roundRect(0, 0, W, H, 16)
      ctx.fill()

      // Photo area gradient (kit colour → dark)
      const photoGrad = ctx.createLinearGradient(0, 0, 0, 190)
      photoGrad.addColorStop(0, kitColor + 'cc')
      photoGrad.addColorStop(1, '#0a0a0a')
      ctx.fillStyle = photoGrad
      ctx.roundRect(0, 0, W, 190, [16, 16, 0, 0])
      ctx.fill()

      // Kit colour band at very top (stripe)
      const kitColors = player.kitColors
      kitColors.forEach((color, i) => {
        ctx.fillStyle = color
        const segW = W / kitColors.length
        const isFirst = i === 0
        const isLast = i === kitColors.length - 1
        ctx.roundRect(
          i * segW, 0, segW, 8,
          isFirst ? [16, 0, 0, 0] : isLast ? [0, 16, 0, 0] : 0
        )
        ctx.fill()
      })

      // WC2026 label
      ctx.fillStyle = 'rgba(22,163,74,0.2)'
      ctx.fillRect(0, 8, W, 28)
      ctx.fillStyle = '#16a34a'
      ctx.font = 'bold 10px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('WC2026', W / 2, 26)

      if (photoImg) {
        // Draw real player cutout
        const maxH = 148
        const scale = Math.min(maxH / photoImg.height, (W - 20) / photoImg.width)
        const drawW = photoImg.width * scale
        const drawH = photoImg.height * scale
        const drawX = (W - drawW) / 2
        const drawY = 36

        ctx.drawImage(photoImg, drawX, drawY, drawW, drawH)

        // Vignette fade at bottom of photo area
        const vignette = ctx.createLinearGradient(0, 145, 0, 190)
        vignette.addColorStop(0, 'rgba(10,10,10,0)')
        vignette.addColorStop(1, 'rgba(10,10,10,1)')
        ctx.fillStyle = vignette
        ctx.fillRect(0, 145, W, 45)
      } else {
        // Fallback: position text + flag in photo area
        ctx.fillStyle = kitColor + '22'
        ctx.fillRect(0, 36, W, 154)

        ctx.fillStyle = 'rgba(255,255,255,0.05)'
        ctx.font = 'bold 56px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText(player.position, W / 2, 126)

        ctx.font = '38px system-ui'
        ctx.fillText(player.flag, W / 2, 78)
      }

      // ── Stats section ──────────────────────────────────────────

      // Player name
      const nameY = 204
      ctx.fillStyle = '#f5f5f5'
      ctx.font = 'bold 18px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(player.name, W / 2, nameY)

      // Position · Nationality
      ctx.fillStyle = '#a0a0a0'
      ctx.font = '10px system-ui'
      ctx.fillText(`${player.position} · ${player.nationality}`, W / 2, nameY + 16)

      // Club
      ctx.fillStyle = '#707070'
      ctx.font = '10px system-ui'
      ctx.fillText(player.club, W / 2, nameY + 30)

      // Thin divider
      ctx.strokeStyle = '#2a2a2a'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(16, nameY + 40)
      ctx.lineTo(W - 16, nameY + 40)
      ctx.stroke()

      // Stats row
      const statsY = nameY + 64
      const stats = [
        { label: 'Goals', value: String(player.stats.goals) },
        { label: 'Assists', value: String(player.stats.assists) },
        { label: 'Apps', value: String(player.stats.appearances) },
        {
          label: 'Rating', value: player.stats.rating > 0
            ? player.stats.rating.toFixed(1) : '-'
        },
      ]

      const colW = W / stats.length
      stats.forEach((stat, i) => {
        const cx = i * colW + colW / 2

        // Subtle column bg
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
        ctx.fillRect(i * colW, nameY + 42, colW, 40)

        ctx.fillStyle = '#f5f5f5'
        ctx.font = 'bold 17px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText(stat.value, cx, statsY)

        ctx.fillStyle = '#5a5a5a'
        ctx.font = '8px system-ui'
        ctx.fillText(stat.label.toUpperCase(), cx, statsY + 13)
      })

      // Second divider
      ctx.strokeStyle = '#2a2a2a'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(16, statsY + 22)
      ctx.lineTo(W - 16, statsY + 22)
      ctx.stroke()

      // Rarity badge (bottom right)
      ctx.fillStyle = rarity.badge
      ctx.font = 'bold 8px system-ui'
      ctx.textAlign = 'right'
      ctx.fillText(rarity.text.toUpperCase(), W - 10, H - 10)

      // KickoffTo watermark (bottom left)
      ctx.fillStyle = '#282828'
      ctx.font = '8px system-ui'
      ctx.textAlign = 'left'
      ctx.fillText('kickoffto.com', 10, H - 10)

      // Rarity border with glow
      ctx.shadowColor = rarity.glow
      ctx.shadowBlur = 10
      ctx.strokeStyle = rarity.border
      ctx.lineWidth = 1.5
      ctx.roundRect(1, 1, W - 2, H - 2, 15)
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    if (proxiedPhotoUrl && !photoFailed) {
      const img = new Image()
      // No crossOrigin needed — request comes from same origin via proxy
      img.onload = () => {
        setPhotoLoaded(true)
        setPhotoSource('sportsdb')
        setLoadingPhoto(false)
        drawCard(img)
      }
      img.onerror = () => {
        setPhotoFailed(true)
        setPhotoSource('avatar')
        setLoadingPhoto(false)
        drawCard()
      }
      img.src = proxiedPhotoUrl
    } else if (!loadingPhoto) {
      drawCard()
    }
  }, [player, proxiedPhotoUrl, photoFailed, loadingPhoto, kitColor, rarity])

  // Fetch AI description
  useEffect(() => {
    let cancelled = false
    async function fetchDesc() {
      setLoadingDesc(true)
      try {
        const res = await fetch(`/api/cards/${player.id}/description`)
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        if (!cancelled) setDescription(data.description ?? '')
      } catch {
        if (!cancelled) setDescription(
          `${player.fullName} is one of the standout performers at WC2026.`
        )
      }
      if (!cancelled) setLoadingDesc(false)
    }
    fetchDesc()
    return () => { cancelled = true }
  }, [player.id, player.fullName])

  function downloadCard() {
    const canvas = canvasRef.current
    if (!canvas) return
    setDownloading(true)
    const link = document.createElement('a')
    link.download = `kickoffto-${player.id}-wc2026.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    setTimeout(() => setDownloading(false), 1000)
  }

  return (
    <div>
      {/* Card */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <div style={{
          position: 'relative', borderRadius: 16, overflow: 'hidden',
          boxShadow: `0 0 20px ${rarity.glow}, 0 8px 32px rgba(0,0,0,0.6)`,
        }}>
          {/* Canvas */}
          <canvas
            ref={canvasRef}
            style={{ display: 'block', maxWidth: '100%', borderRadius: 16 }}
          />

          {/* SVG avatar overlay — only when no photo loaded */}
          {!loadingPhoto && !photoLoaded && (
            <div style={{
              position: 'absolute',
              top: 36, left: '50%',
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
              opacity: 0.85,
            }}>
              <PositionAvatar
                position={svgPosition}
                kitColor={kitColor}
                accentColor={accentColor}
                width={120}
                height={148}
              />
            </div>
          )}

          {/* Loading shimmer overlay */}
          {loadingPhoto && (
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 16,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s linear infinite',
              pointerEvents: 'none',
            }} />
          )}

          {/* Holographic shimmer */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `
              linear-gradient(
                120deg,
                transparent 0%,
                rgba(255,255,255,0.12) 40%,
                transparent 60%
              ),
              repeating-linear-gradient(
                45deg,
                rgba(255,0,150,0.03) 0px,
                rgba(0,200,255,0.03) 3px,
                rgba(0,255,200,0.03) 6px,
                rgba(255,255,0,0.03) 9px
              )
            `,
            mixBlendMode: 'screen',
            backgroundSize: '200% 100%, 20px 20px',
            animation: 'shimmer 4s linear infinite',
            pointerEvents: 'none',
            borderRadius: 16,
          }} />
        </div>
      </div>

      {/* Photo source indicator */}
      <div style={{
        textAlign: 'center', marginBottom: 12,
        fontSize: 10, color: 'var(--text-3)',
      }}>
        {loadingPhoto
          ? '⏳ Loading photo...'
          : photoSource === 'sportsdb'
            ? '📸 Photo via TheSportsDB'
            : `🎨 ${svgPosition} illustrated avatar`}
      </div>

      {/* AI Description */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 10, padding: '12px 14px', marginBottom: 14,
      }}>
        <p style={{
          fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65,
          fontStyle: 'italic', margin: 0,
        }}>
          {loadingDesc
            ? 'Generating card description...'
            : `"${description}"`}
        </p>
        {!loadingDesc && (
          <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 6 }}>
            — El Maestro · KickoffTo WC2026
          </p>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={downloadCard}
          disabled={loadingPhoto}
          style={{
            flex: 1, background: loadingPhoto ? 'var(--bg-elevated)' : 'var(--green)',
            color: loadingPhoto ? 'var(--text-3)' : '#fff',
            border: 'none', borderRadius: 10, padding: '11px 16px',
            fontSize: 13, fontWeight: 700,
            cursor: loadingPhoto ? 'not-allowed' : 'pointer',
            opacity: downloading ? 0.7 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {downloading ? '↓ Saving...' : loadingPhoto ? 'Loading...' : '↓ Download PNG'}
        </button>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(
              `${window.location.origin}/cards/${player.id}`
            )
            alert('Card link copied!')
          }}
          style={{
            flex: 1, background: 'var(--bg-elevated)', color: 'var(--text-2)',
            border: '1px solid var(--border)', borderRadius: 10,
            padding: '11px 16px', fontSize: 13, cursor: 'pointer',
          }}
        >
          Share card
        </button>
      </div>
    </div>
  )
}
