'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Flag, FLAG_ISO } from '@/components/ui/Flag'

const GENRES = [
  { id: 'horror',  emoji: '🎃', name: 'Horror',  desc: 'A nightmare in 90 minutes',       voice: 'Orpheus',  color: '#dc2626' },
  { id: 'romance', emoji: '💕', name: 'Romance', desc: 'Love in the beautiful game',      voice: 'Luna',     color: '#f43f5e' },
  { id: 'heist',   emoji: '💰', name: 'Heist',   desc: 'The perfect footballing robbery', voice: 'Orion',    color: '#d97706' },
  { id: 'scifi',   emoji: '🚀', name: 'Sci-Fi',  desc: 'Football in the far future',      voice: 'Stella',   color: '#2563eb' },
  { id: 'western', emoji: '🤠', name: 'Western', desc: 'A duel at high noon',             voice: 'Arcas',    color: '#b45309' },
  { id: 'comedy',  emoji: '😂', name: 'Comedy',  desc: 'When football gets absurd',       voice: 'Athena',   color: '#16a34a' },
]

interface MatchEvent {
  minute: number
  type: string
  player: string
  team: string
  detail?: string
}

interface MatchData {
  id: string
  homeTeam: { name: string; flag: string; code: string }
  awayTeam: { name: string; flag: string; code: string }
  homeScore: number
  awayScore: number
  status: string
  round: string
  venue: string
  events: MatchEvent[]
}

interface DirectorModeClientProps {
  match: MatchData
  initialGenre?: string | null
}

// Web Audio API background generator — no audio files needed
function createBackgroundSound(
  audioCtx: AudioContext,
  genre: string
): { start: () => void; stop: () => void } {
  const nodes: AudioNode[] = []
  const gainNode = audioCtx.createGain()
  gainNode.gain.value = 0.12 // subtle background level
  gainNode.connect(audioCtx.destination)

  function createOsc(freq: number, type: OscillatorType, gainVal: number) {
    const osc  = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type      = type
    osc.frequency.value = freq
    gain.gain.value     = gainVal
    osc.connect(gain)
    gain.connect(gainNode)
    nodes.push(osc, gain)
    return osc
  }

  function setupHorror() {
    // Low drone + slow LFO pulse
    const drone = createOsc(55, 'sawtooth', 0.3)
    const lfo   = audioCtx.createOscillator()
    const lfoG  = audioCtx.createGain()
    lfo.frequency.value = 0.3
    lfoG.gain.value     = 20
    lfo.connect(lfoG)
    lfoG.connect(drone.frequency)
    nodes.push(lfo, lfoG)
    // High unsettling tone
    createOsc(880, 'sine', 0.05)
    lfo.start(); drone.start()
  }

  function setupRomance() {
    // Soft chords — piano-like
    [261.6, 329.6, 392.0].forEach((freq, i) => {
      const osc = audioCtx.createOscillator()
      const env = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      env.gain.setValueAtTime(0, audioCtx.currentTime)
      env.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.5 + i * 0.1)
      osc.connect(env)
      env.connect(gainNode)
      nodes.push(osc, env)
      osc.start()
    })
  }

  function setupHeist() {
    // Ticking rhythm + bass
    const bass = createOsc(80, 'triangle', 0.4)
    bass.start()
    // Rhythm using gain automation
    const ticker = audioCtx.createOscillator()
    const tickGain = audioCtx.createGain()
    ticker.frequency.value = 800
    tickGain.gain.value    = 0
    ticker.connect(tickGain)
    tickGain.connect(gainNode)
    nodes.push(ticker, tickGain)
    ticker.start()
    // Pulse every 0.5s
    let t = audioCtx.currentTime
    for (let i = 0; i < 60; i++) {
      tickGain.gain.setValueAtTime(0.2, t)
      tickGain.gain.setValueAtTime(0,   t + 0.05)
      t += 0.5
    }
  }

  function setupScifi() {
    // Space drone — slow sweep
    const sweep = createOsc(110, 'sine', 0.3)
    sweep.frequency.linearRampToValueAtTime(220, audioCtx.currentTime + 8)
    sweep.start()
    createOsc(55, 'sine', 0.2).start()
  }

  function setupWestern() {
    // Wind-like filtered noise via multiple detuned oscillators
    [196, 220, 247].forEach(freq => {
      const osc = createOsc(freq, 'sawtooth', 0.08)
      osc.detune.value = Math.random() * 20 - 10
      osc.start()
    })
  }

  function setupComedy() {
    // Bouncy major chord arpeggios
    const notes = [261.6, 329.6, 392.0, 523.3]
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator()
      const env = audioCtx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = freq
      env.gain.value = 0.1
      osc.connect(env)
      env.connect(gainNode)
      nodes.push(osc, env)
      osc.start(audioCtx.currentTime + i * 0.15)
    })
  }

  const SETUP: Record<string, () => void> = {
    horror: setupHorror, romance: setupRomance, heist: setupHeist,
    scifi: setupScifi, western: setupWestern, comedy: setupComedy,
  }

  return {
    start: () => { (SETUP[genre] ?? setupHeist)() },
    stop:  () => {
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1)
      setTimeout(() => nodes.forEach(n => { try { (n as OscillatorNode).stop?.() } catch {} }), 1100)
    },
  }
}

export function DirectorModeClient({ match, initialGenre }: DirectorModeClientProps) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(initialGenre ?? null)
  const [script, setScript]               = useState('')
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')
  const [audioLoading, setAudioLoading]   = useState(false)
  const [audioError, setAudioError]       = useState('')
  const [isPlaying, setIsPlaying]         = useState(false)
  const [audioStatus, setAudioStatus]     = useState('')
  const [audioDataUri, setAudioDataUri]   = useState<string | null>(null)
  const [voicesInfo, setVoicesInfo]       = useState<string[]>([])
  const [bgEnabled, setBgEnabled]         = useState(true)

  const audioRef    = useRef<HTMLAudioElement>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const bgSoundRef  = useRef<{ start: () => void; stop: () => void } | null>(null)

  const genre = GENRES.find(g => g.id === selectedGenre)

  // Step 1: Generate only
  async function generate(genreId: string) {
    setSelectedGenre(genreId)
    setLoading(true)
    setError('')
    setScript('')
    setAudioDataUri(null)
    setAudioError('')
    setVoicesInfo([])

    try {
      const res = await fetch(`/api/director/${match.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genre: genreId, match }),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json()
      setScript(data.script ?? '')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Narrate only (called manually)
  async function narrate() {
    if (!script || !selectedGenre || audioLoading) return
    setAudioLoading(true)
    setAudioError('')
    setAudioDataUri(null)
    setAudioStatus('Connecting to Deepgram...')

    const slowTimer = setTimeout(() => {
      setAudioStatus('Synthesising voices... ~5 seconds')
    }, 3000)

    try {
      const res = await fetch(`/api/director/${match.id}/narrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script, genre: selectedGenre }),
      })

      clearTimeout(slowTimer)
      const rawText = await res.text()
      let data: {
        audioDataUri?: string | null
        voicesUsed?: string[]
        error?: string
        debug?: Record<string, unknown>
      } = {}

      try { data = JSON.parse(rawText) } catch {
        setAudioError(`Server error: ${rawText.slice(0, 100)}`)
        return
      }

      if (data.audioDataUri) {
        setAudioDataUri(data.audioDataUri)
        setVoicesInfo(data.voicesUsed ?? [])
      } else {
        let msg = data.error ?? 'Audio generation failed'
        if (msg.includes('No DEEPGRAM')) msg = '⚙️ Add DEEPGRAM_API_KEY_1 to Vercel'
        else if (msg.includes('Invalid')) msg = '🔑 Invalid API key — check console.deepgram.com'
        else if (msg.includes('quota') || msg.includes('exhausted')) msg = '📊 Quota reached — add DEEPGRAM_API_KEY_2'
        setAudioError(msg)
        if (data.debug) console.error('[Deepgram Debug]', data.debug)
      }
    } catch (err: unknown) {
      clearTimeout(slowTimer)
      setAudioError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setAudioLoading(false)
      setAudioStatus('')
    }
  }

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      bgSoundRef.current?.stop()
      setIsPlaying(false)
    } else {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext()
      
      const bg = createBackgroundSound(audioCtxRef.current, selectedGenre ?? 'heist')
      bgSoundRef.current = bg
      if (bgEnabled) bg.start()
      
      audio.play().catch(e => {
        console.error('Playback failed:', e)
        setIsPlaying(false)
        bgSoundRef.current?.stop()
      })
      setIsPlaying(true)
    }
  }

  function formatScriptForDisplay(raw: string): string {
    return raw
      .replace(/\[NARRATOR\]/g,          '📖 Narrator:')
      .replace(/\[PLAYER:([^\]]+)\]/g,   '⚽ $1:')
      .replace(/\[MASTERMIND:([^\]]+)\]/g,'🎯 $1:')
      .replace(/\[COMMANDER:([^\]]+)\]/g, '🚀 $1:')
      .replace(/\[SHERIFF:([^\]]+)\]/g,   '🤠 $1:')
      .replace(/\[CONFUSED:([^\]]+)\]/g,  '😕 $1:')
      .replace(/\[KEEPER\]/g,             '🧤 Keeper:')
      .replace(/\[SAFE:([^\]]+)\]/g,      '🧤 $1:')
      .replace(/\[ANDROID:([^\]]+)\]/g,   '🤖 $1:')
      .replace(/\[COACH\]/g,              '📋 Coach:')
      .replace(/\[CONTROL\]/g,            '🎙️ Control:')
      .replace(/\[LOOKOUT:([^\]]+)\]/g,   '👁️ $1:')
      .replace(/\[OUTLAW:([^\]]+)\]/g,    '🔫 $1:')
      .replace(/\[BARKEEP\]/g,            '🍺 Barkeep:')
      .replace(/\[REFEREE\]/g,            '🟥 Referee:')
      .replace(/\[FAN\]/g,                '📣 Fan:')
      .replace(/\[CROWD\]/g,              '👥 Crowd:')
      .replace(/\[([^\]]+)\]/g,           '🎭 $1:') // fallback
  }

  const homeIso = FLAG_ISO[match.homeTeam.code?.toUpperCase()] ?? 'un'
  const awayIso = FLAG_ISO[match.awayTeam.code?.toUpperCase()] ?? 'un'

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Match header */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '16px 20px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <img src={`https://flagcdn.com/w80/${homeIso}.png`} alt={match.homeTeam.name}
            width={48} height={34} style={{ objectFit: 'cover', borderRadius: 5, marginBottom: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{match.homeTeam.name}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 36, color: 'var(--text)', letterSpacing: -2 }}>
            {match.homeScore} – {match.awayScore}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{match.round} · {match.venue}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <img src={`https://flagcdn.com/w80/${awayIso}.png`} alt={match.awayTeam.name}
            width={48} height={34} style={{ objectFit: 'cover', borderRadius: 5, marginBottom: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{match.awayTeam.name}</div>
        </div>
      </div>

      <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
        Choose a genre for a prose radio play
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8, marginBottom: 20 }}>
        {GENRES.map(g => (
          <button key={g.id} onClick={() => generate(g.id)} disabled={loading || audioLoading}
            style={{
              background: selectedGenre === g.id ? g.color + '22' : 'var(--bg-card)',
              border: `1px solid ${selectedGenre === g.id ? g.color : 'var(--border)'}`,
              borderRadius: 12, padding: '12px 14px', cursor: (loading || audioLoading) ? 'not-allowed' : 'pointer',
              textAlign: 'left', transition: 'all 0.15s', opacity: (loading || audioLoading) && selectedGenre !== g.id ? 0.5 : 1,
            }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{g.emoji}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: selectedGenre === g.id ? g.color : 'var(--text)', marginBottom: 2 }}>{g.name}</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{g.desc}</div>
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px 20px', textAlign: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
            {[0,1,2].map(i => (
              <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: genre?.color ?? 'var(--green)', animation: `typingBounce 0.6s ease-in-out ${i*0.15}s infinite` }} />
            ))}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{genre?.emoji} Writing dramatic prose...</div>
        </div>
      )}

      {error && <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#f87171', marginBottom: 20 }}>{error}</div>}

      {script && genre && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start', marginBottom: 40 }} className="desktop-split">
          {/* Script Column */}
          <div style={{ background: 'var(--bg-card)', border: `1px solid ${genre.color}33`, borderTop: `4px solid ${genre.color}`, borderRadius: '0 0 16px 16px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 20 }}>{genre.emoji}</span>
              <div style={{ fontSize: 12, fontWeight: 800, color: genre.color }}>{genre.name.toUpperCase()} AUDIO DRAMA</div>
            </div>
            <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.9, whiteSpace: 'pre-wrap', fontFamily: 'Georgia, "Times New Roman", serif' }}>
              {formatScriptForDisplay(script)}
            </div>
          </div>

          /* Audio/Control Column */
          <div style={{ position: 'sticky', top: 20 }}>
            {!audioDataUri ? (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px' }}>
                <button onClick={narrate} disabled={audioLoading}
                  style={{
                    width: '100%', background: audioLoading ? 'var(--bg-elevated)' : `linear-gradient(135deg, ${genre?.color}, ${genre?.color}cc)`,
                    color: audioLoading ? 'var(--text-3)' : '#fff', border: 'none', borderRadius: 12, padding: '14px 20px', fontSize: 14, fontWeight: 700,
                    cursor: audioLoading ? 'not-allowed' : 'pointer', boxShadow: audioLoading ? 'none' : `0 4px 16px ${genre?.color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s',
                  }}>
                  {audioLoading ? <><span className="spinner" /> {audioStatus || 'Connecting...'}</> : <>🎙️ Narrate with Deepgram Aura-2</>}
                </button>
                <p style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'center', marginTop: 10, lineHeight: 1.4 }}>
                  Multi-voice cast · Dramatic prose cleaner active · Atmospheric mixing
                </p>
                {audioError && <div style={{ fontSize: 11, color: '#f87171', background: 'rgba(220,38,38,0.08)', borderRadius: 8, padding: '8px 12px', marginTop: 12 }}>{audioError}</div>}
              </div>
            ) : (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px' }}>
                <audio ref={audioRef} src={audioDataUri} onEnded={() => { setIsPlaying(false); bgSoundRef.current?.stop() }} style={{ display: 'none' }} />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <button onClick={togglePlay}
                    style={{
                      width: 54, height: 54, borderRadius: '50%', background: `linear-gradient(135deg, ${genre?.color}, ${genre?.color}cc)`,
                      border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#fff',
                      boxShadow: `0 4px 20px ${genre?.color}66`,
                    }}>{isPlaying ? '⏸' : '▶'}</button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>Now Playing</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Cast: {voicesInfo.length} voices active</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {voicesInfo.map(v => <span key={v} style={{ fontSize: 9, background: 'var(--bg-elevated)', borderRadius: 4, padding: '2px 6px', color: 'var(--text-3)' }}>{v}</span>)}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setBgEnabled(e => !e); if (isPlaying) { if (!bgEnabled) createBackgroundSound(audioCtxRef.current!, selectedGenre!).start(); else bgSoundRef.current?.stop(); } }}
                    style={{ flex: 1, background: bgEnabled ? 'rgba(34,197,94,0.1)' : 'var(--bg-elevated)', border: `1px solid ${bgEnabled ? 'var(--green)' : 'var(--border)'}`, borderRadius: 10, padding: '8px', fontSize: 11, color: bgEnabled ? 'var(--green)' : 'var(--text-3)', cursor: 'pointer', fontWeight: 600 }}>
                    🎵 BG {bgEnabled ? 'ON' : 'OFF'}
                  </button>
                  <button onClick={() => { const link = document.createElement('a'); link.href = audioDataUri; link.download = 'match-drama.mp3'; link.click(); }}
                    style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px', fontSize: 11, color: 'var(--text-2)', cursor: 'pointer' }}>
                    ↓ Download
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes typingBounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.3; } 40% { transform: translateY(-8px); opacity: 1; } }
        .spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid #fff; borderRadius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
        @media (max-width: 640px) { .desktop-split { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
