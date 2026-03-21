'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
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
  number?: number
  highlights?: string[]
}

interface TradingCardProps {
  player: Player
}

const RARITY = {
  bronze: { border: '#8b5a2b', glow: 'rgba(139,90,43,0.5)', badge: '#cd7f32', label: 'Bronze',   serial: '07' },
  silver: { border: '#708090', glow: 'rgba(112,128,144,0.4)', badge: '#c0c0c0', label: 'Silver',   serial: '03' },
  gold:   { border: '#d4a017', glow: 'rgba(212,160,23,0.6)',  badge: '#ffd700', label: 'Gold',     serial: '01' },
  rainbow:{ border: '#9b59b6', glow: 'rgba(155,89,182,0.6)', badge: '#7c3aed', label: 'Rainbow',  serial: '00' },
}

const PLAYER_NUMBERS: Record<string, number> = {
  messi: 10, mbappe: 9, davies: 19, bellingham: 5,
  vinicius: 7, yamal: 19, wirtz: 10, pulisic: 10,
  hakimi: 2, haaland: 9, kane: 9, salah: 11,
}

const POSITION_MAP: Record<string, 'GK'|'DEF'|'MID'|'ATT'> = {
  GK:'GK', DEF:'DEF', CB:'DEF', LB:'DEF', RB:'DEF',
  MID:'MID', CM:'MID', CAM:'MID', CDM:'MID',
  ATT:'ATT', ST:'ATT', LW:'ATT', RW:'ATT', CF:'ATT',
}

// Generate deterministic serial number from player id
function getSerial(playerId: string, rarityCode: string): string {
  let hash = 0
  for (const c of playerId) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff
  return String(hash).padStart(4, '0')
}

export function TradingCard({ player }: TradingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const backCanvasRef = useRef<HTMLCanvasElement>(null)

  const [flipped, setFlipped] = useState(false)
  const [proxiedUrl, setProxiedUrl] = useState<string | null>(null)
  const [photoLoaded, setPhotoLoaded] = useState(false)
  const [photoFailed, setPhotoFailed] = useState(false)
  const [loadingPhoto, setLoadingPhoto] = useState(true)
  const [description, setDescription] = useState('')
  const [loadingDesc, setLoadingDesc] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [downloadFormat, setDownloadFormat] = useState<'card'|'story'|'square'>('card')
  const [shimmerX, setShimmerX] = useState(50)
  const [shimmerY, setShimmerY] = useState(50)
  const [tiltX, setTiltX] = useState(0)
  const [tiltY, setTiltY] = useState(0)
  const [statsAnimated, setStatsAnimated] = useState(false)
  const [displayStats, setDisplayStats] = useState({
    goals: 0, assists: 0, appearances: 0, rating: 0,
  })

  const rarity = RARITY[player.rarity] ?? RARITY.gold
  const kitColor = player.kitColors[0] ?? '#888'
  const accentColor = player.kitColors[1] ?? '#ffffff'
  const posKey = player.position.toUpperCase()
  const svgPosition = POSITION_MAP[posKey] ?? 'ATT'
  const playerNumber = PLAYER_NUMBERS[player.id] ?? null
  const serial = getSerial(player.id, player.rarity)

  // 3D tilt on mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setTiltX((y - 0.5) * -18)
    setTiltY((x - 0.5) * 18)
    setShimmerX(x * 100)
    setShimmerY(y * 100)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTiltX(0)
    setTiltY(0)
    setShimmerX(50)
    setShimmerY(50)
  }, [])

  // Touch tilt for mobile
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el || !e.touches[0]) return
    const rect = el.getBoundingClientRect()
    const x = (e.touches[0].clientX - rect.left) / rect.width
    const y = (e.touches[0].clientY - rect.top) / rect.height
    setTiltX((y - 0.5) * -12)
    setTiltY((x - 0.5) * 12)
    setShimmerX(x * 100)
    setShimmerY(y * 100)
  }, [])

  // Stat count-up animation
  useEffect(() => {
    if (statsAnimated) return
    const target = player.stats
    const duration = 1000
    const start = Date.now()
    const timer = setInterval(() => {
      const progress = Math.min((Date.now() - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setDisplayStats({
        goals: Math.round(target.goals * ease),
        assists: Math.round(target.assists * ease),
        appearances: Math.round(target.appearances * ease),
        rating: parseFloat((target.rating * ease).toFixed(1)),
      })
      if (progress >= 1) {
        clearInterval(timer)
        setStatsAnimated(true)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [player.stats, statsAnimated])

  // Fetch proxied photo
  useEffect(() => {
    let cancelled = false
    async function fetchPhoto() {
      setLoadingPhoto(true)

      // Set a 4-second timeout — if photo doesn't load, show avatar
      const timeout = setTimeout(() => {
        if (!cancelled && loadingPhoto) {
          setPhotoFailed(true)
          setLoadingPhoto(false)
        }
      }, 4000)

      try {
        const res = await fetch(`/api/cards/${player.id}/photo`, {
          signal: AbortSignal.timeout(3500),
        })

        if (!res.ok) throw new Error(`API error ${res.status}`)
        const data = await res.json()
        const url = data.cutout ?? data.thumb ?? null

        clearTimeout(timeout)

        if (!cancelled && url) {
          setProxiedUrl(`/api/proxy/image?url=${encodeURIComponent(url)}`)
        } else {
          if (!cancelled) { setPhotoFailed(true); setLoadingPhoto(false) }
        }
      } catch {
        clearTimeout(timeout)
        if (!cancelled) { setPhotoFailed(true); setLoadingPhoto(false) }
      }
    }
    fetchPhoto()
    return () => { cancelled = true }
  }, [player.id])

  // Draw front canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (loadingPhoto && !photoFailed) return // Still loading, wait

    const W = 300, H = 420
    canvas.width = W
    canvas.height = H

    function draw(photoImg?: HTMLImageElement) {
      if (!ctx) return

      // Base
      ctx.fillStyle = '#080808'
      ctx.roundRect(0, 0, W, H, 18)
      ctx.fill()

      // Kit colour gradient hero area
      const heroGrad = ctx.createLinearGradient(0, 0, W, 200)
      heroGrad.addColorStop(0, kitColor + 'ee')
      heroGrad.addColorStop(0.6, kitColor + '88')
      heroGrad.addColorStop(1, '#080808')
      ctx.fillStyle = heroGrad
      ctx.roundRect(0, 0, W, 200, [18, 18, 0, 0])
      ctx.fill()

      // Kit stripe top — dual colour
      const stripeH = 8
      const halfW = W / 2
      ctx.fillStyle = kitColor
      ctx.fillRect(0, 0, halfW, stripeH)
      ctx.fillStyle = accentColor
      ctx.fillRect(halfW, 0, halfW, stripeH)

      // WC2026 + flag badge
      ctx.fillStyle = 'rgba(0,0,0,0.45)'
      ctx.roundRect(8, stripeH + 6, 90, 22, 6)
      ctx.fill()
      ctx.fillStyle = '#16a34a'
      ctx.font = 'bold 10px system-ui'
      ctx.textAlign = 'left'
      ctx.fillText('⚽ WC2026', 14, stripeH + 20)

      // Player number badge (top right)
      if (playerNumber) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)'
        ctx.roundRect(W - 38, stripeH + 6, 30, 22, 6)
        ctx.fill()
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 12px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText(`#${playerNumber}`, W - 23, stripeH + 20)
      }

      // Photo or avatar
      if (photoImg) {
        const maxH = 155
        const scale = Math.min(maxH / photoImg.height, (W - 20) / photoImg.width)
        const dW = photoImg.width * scale
        const dH = photoImg.height * scale
        ctx.drawImage(photoImg, (W - dW) / 2, 34, dW, dH)

        // Vignette
        const vig = ctx.createLinearGradient(0, 150, 0, 205)
        vig.addColorStop(0, 'rgba(8,8,8,0)')
        vig.addColorStop(1, 'rgba(8,8,8,1)')
        ctx.fillStyle = vig
        ctx.fillRect(0, 150, W, 55)
      } else {
        // Placeholder pattern
        ctx.fillStyle = kitColor + '22'
        ctx.fillRect(0, 36, W, 164)
        ctx.fillStyle = 'rgba(255,255,255,0.06)'
        ctx.font = 'bold 52px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText(player.position, W / 2, 130)
        ctx.font = '38px system-ui'
        ctx.fillText(player.flag, W / 2, 80)
      }

      // Glassmorphism info area
      ctx.fillStyle = 'rgba(8,8,8,0.75)'
      ctx.fillRect(0, 200, W, 80)

      // Player name — large
      ctx.fillStyle = '#f0f0f0'
      ctx.font = 'bold 19px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(player.name, W / 2, 222)

      // Position · Nationality · Flag
      ctx.fillStyle = '#888'
      ctx.font = '11px system-ui'
      ctx.fillText(`${player.flag} ${player.position} · ${player.nationality}`, W / 2, 238)

      // Club
      ctx.fillStyle = '#555'
      ctx.font = '10px system-ui'
      ctx.fillText(player.club, W / 2, 253)

      // Divider
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(16, 263)
      ctx.lineTo(W - 16, 263)
      ctx.stroke()

      // Stats — with icons
      const STAT_DEFS = [
        { label: '⚽ Goals',   value: player.stats.goals },
        { label: '🎯 Assists', value: player.stats.assists },
        { label: '📅 Apps',    value: player.stats.appearances },
        { label: '⭐ Rating',  value: player.stats.rating > 0 ? player.stats.rating.toFixed(1) : '-' },
      ]
      const colW = W / 4
      STAT_DEFS.forEach((s, i) => {
        const cx = i * colW + colW / 2
        const sy = 296
        // Subtle alternating bg
        if (i % 2 === 0) {
          ctx.fillStyle = 'rgba(255,255,255,0.02)'
          ctx.fillRect(i * colW, 270, colW, 42)
        }
        ctx.fillStyle = '#f0f0f0'
        ctx.font = 'bold 17px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText(String(s.value), cx, sy)
        ctx.fillStyle = '#444'
        ctx.font = '8px system-ui'
        ctx.fillText(s.label, cx, sy + 13)
      })

      // Divider
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'
      ctx.beginPath()
      ctx.moveTo(16, 315)
      ctx.lineTo(W - 16, 315)
      ctx.stroke()

      // Rarity label left
      ctx.fillStyle = rarity.badge
      ctx.font = 'bold 9px system-ui'
      ctx.textAlign = 'left'
      ctx.fillText(rarity.label.toUpperCase(), 12, H - 26)

      // Serial number
      ctx.fillStyle = '#333'
      ctx.font = '8px system-ui'
      ctx.fillText(`#${serial}/10000`, 12, H - 14)

      // KickoffTo right
      ctx.fillStyle = '#222'
      ctx.font = '8px system-ui'
      ctx.textAlign = 'right'
      ctx.fillText('kickoffto.com', W - 12, H - 14)

      // Rarity border glow
      ctx.shadowColor = rarity.glow
      ctx.shadowBlur = 14
      ctx.strokeStyle = rarity.border
      ctx.lineWidth = 1.5
      ctx.roundRect(1, 1, W - 2, H - 2, 17)
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    if (proxiedUrl && !photoFailed) {
      const img = new Image()
      img.onload = () => { setPhotoLoaded(true); setLoadingPhoto(false); draw(img) }
      img.onerror = () => { setPhotoFailed(true); setLoadingPhoto(false); draw() }
      img.src = proxiedUrl
    } else {
      // Draw immediately with avatar — no more infinite loading
      draw()
    }
  }, [player, proxiedUrl, photoFailed, loadingPhoto, kitColor, accentColor, rarity, serial, playerNumber])

  // Draw back canvas
  useEffect(() => {
    const canvas = backCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 300, H = 420
    canvas.width = W
    canvas.height = H

    // Background
    ctx.fillStyle = '#0a0a0a'
    ctx.roundRect(0, 0, W, H, 18)
    ctx.fill()

    // Top gradient
    const grad = ctx.createLinearGradient(0, 0, W, 120)
    grad.addColorStop(0, kitColor + 'cc')
    grad.addColorStop(1, 'transparent')
    ctx.fillStyle = grad
    ctx.roundRect(0, 0, W, 120, [18, 18, 0, 0])
    ctx.fill()

    // Flag big
    ctx.font = '64px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText(player.flag, W / 2, 82)

    // Player name
    ctx.fillStyle = '#f0f0f0'
    ctx.font = 'bold 16px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText(player.fullName, W / 2, 110)

    // Career section header
    ctx.fillStyle = '#16a34a'
    ctx.font = 'bold 9px system-ui'
    ctx.textAlign = 'left'
    ctx.fillText('WC2026 PERFORMANCE', 16, 140)

    // Divider
    ctx.strokeStyle = '#16a34a'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(16, 145)
    ctx.lineTo(W - 16, 145)
    ctx.stroke()

    // Extended stats
    const extStats = [
      { label: 'Goals', value: player.stats.goals, icon: '⚽' },
      { label: 'Assists', value: player.stats.assists, icon: '🎯' },
      { label: 'Appearances', value: player.stats.appearances, icon: '📅' },
      { label: 'Rating', value: player.stats.rating > 0 ? player.stats.rating.toFixed(1) : 'TBD', icon: '⭐' },
      { label: 'Club', value: player.club, icon: '🏟️' },
      { label: 'Nationality', value: player.nationality, icon: '🌍' },
    ]

    extStats.forEach((s, i) => {
      const y = 165 + i * 28
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent'
      ctx.fillRect(12, y - 14, W - 24, 26)

      ctx.fillStyle = '#666'
      ctx.font = '10px system-ui'
      ctx.textAlign = 'left'
      ctx.fillText(`${s.icon} ${s.label}`, 20, y)

      ctx.fillStyle = '#d0d0d0'
      ctx.font = 'bold 11px system-ui'
      ctx.textAlign = 'right'
      ctx.fillText(String(s.value), W - 20, y)
    })

    // Rarity badge
    ctx.fillStyle = rarity.badge
    ctx.font = 'bold 9px system-ui'
    ctx.textAlign = 'left'
    ctx.fillText(rarity.label.toUpperCase(), 12, H - 26)
    ctx.fillStyle = '#333'
    ctx.font = '8px system-ui'
    ctx.fillText(`#${serial}/10000`, 12, H - 14)
    ctx.fillStyle = '#222'
    ctx.font = '8px system-ui'
    ctx.textAlign = 'right'
    ctx.fillText('kickoffto.com', W - 12, H - 14)

    // Border
    ctx.shadowColor = rarity.glow
    ctx.shadowBlur = 12
    ctx.strokeStyle = rarity.border
    ctx.lineWidth = 1.5
    ctx.roundRect(1, 1, W - 2, H - 2, 17)
    ctx.stroke()
    ctx.shadowBlur = 0
  }, [player, kitColor, rarity, serial])

  // AI description
  useEffect(() => {
    let cancelled = false
    fetch(`/api/cards/${player.id}/description`)
      .then(r => r.json())
      .then(d => { if (!cancelled) setDescription(d.description ?? '') })
      .catch(() => { if (!cancelled) setDescription(`${player.fullName} shines at WC2026.`) })
      .finally(() => { if (!cancelled) setLoadingDesc(false) })
    return () => { cancelled = true }
  }, [player.id, player.fullName])

  function downloadCard() {
    const canvas = downloadFormat === 'card'
      ? (flipped ? backCanvasRef.current : canvasRef.current)
      : canvasRef.current
    if (!canvas) return
    setDownloading(true)

    if (downloadFormat === 'story' || downloadFormat === 'square') {
      // Create a new canvas at the target size
      const out = document.createElement('canvas')
      const size = downloadFormat === 'story' ? { w: 1080, h: 1920 } : { w: 1080, h: 1080 }
      out.width = size.w
      out.height = size.h
      const ctx = out.getContext('2d')!

      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, size.h)
      bg.addColorStop(0, '#080808')
      bg.addColorStop(1, kitColor + '44')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, size.w, size.h)

      // Card centred
      const scale = Math.min(size.w * 0.8 / canvas.width, size.h * 0.7 / canvas.height)
      const dW = canvas.width * scale
      const dH = canvas.height * scale
      const dx = (size.w - dW) / 2
      const dy = downloadFormat === 'story' ? size.h * 0.2 : (size.h - dH) / 2

      ctx.drawImage(canvas, dx, dy, dW, dH)

      // KickoffTo branding
      ctx.fillStyle = '#16a34a'
      ctx.font = `bold ${size.w * 0.035}px system-ui`
      ctx.textAlign = 'center'
      ctx.fillText('KickoffTo · WC2026', size.w / 2, size.h * 0.92)

      const link = document.createElement('a')
      link.download = `kickoffto-${player.id}-${downloadFormat}.png`
      link.href = out.toDataURL('image/png')
      link.click()
    } else {
      const link = document.createElement('a')
      link.download = `kickoffto-${player.id}-wc2026.png`
      link.href = canvas!.toDataURL('image/png')
      link.click()
    }
    setTimeout(() => setDownloading(false), 1000)
  }

  async function shareCard() {
    const url = `${window.location.origin}/cards/${player.id}`
    const text = `Check out my ${player.fullName} WC2026 trading card on KickoffTo 🃏\n${url}`
    try {
      if (navigator.share) {
        await navigator.share({ title: `${player.fullName} · KickoffTo WC2026`, text, url })
      } else {
        await navigator.clipboard.writeText(text)
        alert('Card link + text copied!')
      }
    } catch {}
  }

  const photoSourceLabel = loadingPhoto
    ? '⏳ Loading photo...'
    : photoLoaded
    ? '📸 TheSportsDB'
    : `🎨 ${svgPosition} avatar`

  return (
    <div>
      {/* 3D Card with flip */}
      <div style={{
        display: 'flex', justifyContent: 'center', marginBottom: 16,
        perspective: '1000px',
      }}>
        <div
          ref={cardRef}
          onClick={() => setFlipped(f => !f)}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => { setTiltX(0); setTiltY(0) }}
          style={{
            position: 'relative', cursor: 'pointer',
            transition: flipped ? 'none' : 'transform 0.1s ease-out',
            transformStyle: 'preserve-3d',
            transform: `
              rotateX(${tiltX}deg)
              rotateY(${flipped ? 180 + tiltY : tiltY}deg)
            `,
          }}
        >
          {/* Front */}
          <div style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderRadius: 18, overflow: 'hidden',
            boxShadow: `0 0 30px ${rarity.glow}, 0 12px 40px rgba(0,0,0,0.7)`,
            position: 'relative',
          }}>
            <canvas ref={canvasRef} style={{ display: 'block', maxWidth: '100%' }} />

            {/* Loading skeleton overlay */}
            {loadingPhoto && (
              <div style={{
                position: 'absolute', top: 36, left: 0, right: 0, height: 164,
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s linear infinite',
              }} />
            )}

            {/* SVG avatar overlay */}
            {!loadingPhoto && !photoLoaded && (
              <div style={{
                position: 'absolute', top: 36, left: '50%',
                transform: 'translateX(-50%)',
                pointerEvents: 'none', opacity: 0.8,
              }}>
                <PositionAvatar
                  position={svgPosition}
                  kitColor={kitColor}
                  accentColor={accentColor}
                  width={120} height={152}
                />
              </div>
            )}

            {/* Holographic shimmer — follows cursor */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `
                radial-gradient(
                  circle at ${shimmerX}% ${shimmerY}%,
                  rgba(255,255,255,0.18) 0%,
                  transparent 50%
                ),
                repeating-linear-gradient(
                  ${45 + shimmerX * 0.5}deg,
                  rgba(255,0,150,0.04) 0px,
                  rgba(0,200,255,0.04) 4px,
                  rgba(0,255,180,0.04) 8px,
                  rgba(255,220,0,0.04) 12px
                )
              `,
              mixBlendMode: 'screen',
              pointerEvents: 'none',
              borderRadius: 18,
              transition: 'background 0.05s linear',
            }} />

            {/* Flip hint */}
            {!flipped && (
              <div style={{
                position: 'absolute', bottom: 10, right: 10,
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(6px)',
                borderRadius: 6, padding: '2px 7px',
                fontSize: 9, color: 'rgba(255,255,255,0.5)',
                pointerEvents: 'none',
              }}>
                Tap to flip
              </div>
            )}
          </div>

          {/* Back */}
          <div style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: 18, overflow: 'hidden',
            boxShadow: `0 0 30px ${rarity.glow}, 0 12px 40px rgba(0,0,0,0.7)`,
          }}>
            <canvas ref={backCanvasRef} style={{ display: 'block', maxWidth: '100%' }} />

            {/* Shimmer on back too */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `
                repeating-linear-gradient(
                  135deg,
                  rgba(255,0,150,0.03) 0px,
                  rgba(0,200,255,0.03) 4px,
                  rgba(0,255,180,0.03) 8px,
                  rgba(255,220,0,0.03) 12px
                )
              `,
              mixBlendMode: 'screen',
              pointerEvents: 'none',
              borderRadius: 18,
            }} />

            <div style={{
              position: 'absolute', bottom: 10, right: 10,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(6px)',
              borderRadius: 6, padding: '2px 7px',
              fontSize: 9, color: 'rgba(255,255,255,0.5)',
              pointerEvents: 'none',
            }}>
              Tap to flip back
            </div>
          </div>
        </div>
      </div>

      {/* Photo source + stats animated counter */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 12, padding: '0 2px',
      }}>
        <span style={{ fontSize: 10, color: 'var(--text-3)' }}>
          {photoSourceLabel}
        </span>
        <div style={{
          display: 'flex', gap: 12,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {[
            { icon: '⚽', val: displayStats.goals },
            { icon: '🎯', val: displayStats.assists },
            { icon: '📅', val: displayStats.appearances },
          ].map(s => (
            <span key={s.icon} style={{ fontSize: 12, color: 'var(--text-3)' }}>
              {s.icon} <span style={{ color: 'var(--text)', fontWeight: 700 }}>{s.val}</span>
            </span>
          ))}
        </div>
      </div>

      {/* AI Description */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderLeft: `3px solid ${kitColor}`,
        borderRadius: '0 12px 12px 0',
        padding: '12px 14px', marginBottom: 14,
      }}>
        <p style={{
          fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65,
          fontStyle: 'italic', margin: 0,
        }}>
          {loadingDesc ? 'Generating card description...' : `"${description}"`}
        </p>
        {!loadingDesc && (
          <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 5 }}>
            — El Maestro · KickoffTo WC2026
          </p>
        )}
      </div>

      {/* Download format selector */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 10,
      }}>
        {(['card', 'story', 'square'] as const).map(fmt => (
          <button
            key={fmt}
            onClick={() => setDownloadFormat(fmt)}
            style={{
              flex: 1, padding: '6px', borderRadius: 8, fontSize: 11,
              fontWeight: 600, cursor: 'pointer',
              background: downloadFormat === fmt ? 'var(--bg-elevated)' : 'transparent',
              border: `1px solid ${downloadFormat === fmt ? 'var(--border-mid)' : 'var(--border)'}`,
              color: downloadFormat === fmt ? 'var(--text)' : 'var(--text-3)',
            }}
          >
            {fmt === 'card' ? '🃏 Card' : fmt === 'story' ? '📱 Story' : '⬛ Square'}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={downloadCard}
          disabled={loadingPhoto}
          style={{
            flex: 2,
            background: loadingPhoto ? 'var(--bg-elevated)' : `linear-gradient(135deg, ${kitColor}, ${kitColor}bb)`,
            color: loadingPhoto ? 'var(--text-3)' : '#fff',
            border: 'none', borderRadius: 12, padding: '13px 16px',
            fontSize: 14, fontWeight: 700,
            cursor: loadingPhoto ? 'not-allowed' : 'pointer',
            boxShadow: loadingPhoto ? 'none' : `0 4px 20px ${kitColor}55`,
            opacity: downloading ? 0.7 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {downloading ? 'Saving...' : loadingPhoto ? 'Loading...' : '↓ Download'}
        </button>
        <button
          onClick={shareCard}
          style={{
            flex: 1, background: 'var(--bg-elevated)', color: 'var(--text-2)',
            border: '1px solid var(--border)', borderRadius: 12,
            padding: '13px 14px', fontSize: 14, cursor: 'pointer',
          }}
        >
          Share
        </button>
      </div>

      <p style={{
        fontSize: 10, color: 'var(--text-3)', textAlign: 'center',
        marginTop: 8,
      }}>
        #{serial}/10000 · {rarity.label} · {player.rarity === 'rainbow' ? '🌈 Rainbow Foil' : ''}
      </p>
    </div>
  )
}
