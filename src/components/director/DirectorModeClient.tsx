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
    // Pulse every 0.5s for 60 pulses
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
      setTimeout(() => {
        nodes.forEach(n => {
          try { (n as OscillatorNode).stop?.() } catch {}
        })
      }, 1100)
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
  const [cached, setCached]               = useState(false)
  const [audioStatus, setAudioStatus]     = useState('')
  const [audioDataUri, setAudioDataUri]   = useState<string | null>(null)
  const [voiceUsed, setVoiceUsed]         = useState('')
  const [voicesInfo, setVoicesInfo]       = useState<string[]>([])
  const [bgEnabled, setBgEnabled]         = useState(true)

  const audioRef    = useRef<HTMLAudioElement>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const bgSoundRef  = useRef<{ start: () => void; stop: () => void } | null>(null)

  const genre = GENRES.find(g => g.id === selectedGenre)

  async function generateAndNarrate(genreId: string) {
    setSelectedGenre(genreId)
    setLoading(true)
    setError('')
    setScript('')
    setAudioDataUri(null)
    setAudioError('')
    setVoiceUsed('')
    setVoicesInfo([])
    setAudioStatus('Writing multi-voice screenplay...')

    try {
      // Step 1: Generate screenplay via Groq
      const scriptRes = await fetch(`/api/director/${match.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genre: genreId, match }),
      })

      if (!scriptRes.ok) throw new Error(`Script generation failed: ${scriptRes.status}`)

      const scriptData = await scriptRes.json()
      const generatedScript = scriptData.script ?? ''
      setScript(generatedScript)
      setCached(scriptData.cached ?? false)
      
      setLoading(false)
      setAudioLoading(true)
      setAudioStatus('Narrating with Deepgram Aura-2 cast...')

      // Step 2: Generate audio immediately
      const audioRes = await fetch(`/api/director/${match.id}/narrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: generatedScript, genre: genreId }),
      })

      const rawAudio = await audioRes.text()
      let audioData: {
        audioDataUri?: string | null
        voiceUsed?: string
        voicesUsed?: string[]
        error?: string
        debug?: Record<string, unknown>
      } = {}

      try {
        audioData = JSON.parse(rawAudio)
      } catch {
        setAudioError(`Server error (not JSON): ${rawAudio.slice(0, 100)}`)
        return
      }

      if (audioData.audioDataUri) {
        setAudioDataUri(audioData.audioDataUri)
        setVoiceUsed(audioData.voiceUsed ?? '')
        if (audioData.voicesUsed) setVoicesInfo(audioData.voicesUsed)
      } else {
        let errMsg = audioData.error ?? 'Audio generation failed'
        if (errMsg.includes('No DEEPGRAM_API_KEY')) {
          errMsg = '⚙️ Add DEEPGRAM_API_KEY_1 to Vercel environment variables'
        } else if (errMsg.includes('Invalid Deepgram')) {
          errMsg = '🔑 Invalid API key. Check console.deepgram.com'
        } else if (errMsg.includes('quota') || errMsg.includes('exhausted')) {
          errMsg = '📊 Quota reached. Add DEEPGRAM_API_KEY_2 to Vercel.'
        }
        setAudioError(errMsg)
        if (audioData.debug) console.error('[Deepgram TTS Debug]', audioData.debug)
      }

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
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
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext()
      }
      
      bgSoundRef.current?.stop() // safety stop
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
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
            {match.homeTeam.name}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 36, color: 'var(--text)', letterSpacing: -2,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {match.homeScore} – {match.awayScore}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>
            {match.round} · {match.venue}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <img src={`https://flagcdn.com/w80/${awayIso}.png`} alt={match.awayTeam.name}
            width={48} height={34} style={{ objectFit: 'cover', borderRadius: 5, marginBottom: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
            {match.awayTeam.name}
          </div>
        </div>
      </div>

      <p style={{
        fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        marginBottom: 12,
      }}>
        Choose a genre for a multi-voice screenplay
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 8, marginBottom: 20,
      }}>
        {GENRES.map(g => (
          <button
            key={g.id}
            onClick={() => generateAndNarrate(g.id)}
            disabled={loading || audioLoading}
            style={{
              background: selectedGenre === g.id
                ? g.color + '22' : 'var(--bg-card)',
              border: `1px solid ${selectedGenre === g.id ? g.color : 'var(--border)'}`,
              borderRadius: 12, padding: '12px 14px',
              cursor: (loading || audioLoading) ? 'not-allowed' : 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s',
              opacity: (loading || audioLoading) && selectedGenre !== g.id ? 0.5 : 1,
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 6 }}>{g.emoji}</div>
            <div style={{
              fontSize: 13, fontWeight: 700,
              color: selectedGenre === g.id ? g.color : 'var(--text)',
              marginBottom: 2,
            }}>
              {g.name}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{g.desc}</div>
            <div style={{
              fontSize: 9, color: 'var(--text-3)', marginTop: 4,
              fontStyle: 'italic',
            }}>
              Cast: Multi-Voice (Aura-2)
            </div>
          </button>
        ))}
      </div>

      {(loading || audioLoading) && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 14, padding: '24px 20px', textAlign: 'center',
          marginBottom: 20,
        }}>
          <div style={{
            display: 'flex', gap: 6, justifyContent: 'center',
            alignItems: 'center', marginBottom: 12,
          }}>
            {[0,1,2].map(i => (
              <span key={i} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: genre?.color ?? 'var(--green)',
                display: 'inline-block',
                animation: `typingBounce 0.6s ease-in-out ${i*0.15}s infinite`,
              }} />
            ))}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 4 }}>
            {audioStatus || (loading ? `${genre?.emoji} Writing script...` : 'Generating audio...')}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
            {loading ? 'Cast is rehearsing' : 'Deepgram Aura-2 is recording lines'}
          </div>
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(220,38,38,0.08)',
          border: '1px solid rgba(220,38,38,0.25)',
          borderRadius: 12, padding: '12px 16px',
          fontSize: 13, color: '#f87171', marginBottom: 20,
        }}>
          {error}
        </div>
      )}

      {script && genre && (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            background: 'var(--bg-card)',
            border: `1px solid ${genre.color}44`,
            borderTop: `3px solid ${genre.color}`,
            borderRadius: '0 0 16px 16px',
            padding: '20px',
            marginBottom: 14,
            position: 'relative',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              marginBottom: 16,
            }}>
              <span style={{ fontSize: 20 }}>{genre.emoji}</span>
              <div>
                <div style={{
                  fontSize: 12, fontWeight: 800,
                  color: genre.color,
                }}>
                  {genre.name.toUpperCase()} REPLAY
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>
                  {cached ? '🟡 From Archive' : '🟢 Fresh Script'}
                </div>
              </div>
              <button
                onClick={() => generateAndNarrate(genre.id)}
                disabled={loading || audioLoading}
                style={{
                  marginLeft: 'auto',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 8, padding: '5px 10px',
                  fontSize: 11, color: 'var(--text-2)',
                  cursor: (loading || audioLoading) ? 'not-allowed' : 'pointer',
                }}
              >
                🔄 Rewrite
              </button>
            </div>

            <div style={{
              fontSize: 14, color: 'var(--text)',
              lineHeight: 1.8, whiteSpace: 'pre-wrap',
              fontFamily: 'monospace', fontSize: 12,
            }}>
              {script}
            </div>
          </div>

          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '14px 16px',
          }}>
            {audioError && (
              <div style={{
                fontSize: 12, color: '#f87171',
                background: 'rgba(220,38,38,0.08)',
                border: '1px solid rgba(220,38,38,0.2)',
                borderRadius: 8, padding: '10px 12px',
                lineHeight: 1.5,
              }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Audio generation failed</div>
                <div style={{ fontSize: 11 }}>{audioError}</div>
                <button 
                  onClick={() => generateAndNarrate(genre.id)}
                  style={{
                    marginTop: 8, fontSize: 11, color: 'var(--text-2)',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: 6, padding: '4px 8px', cursor: 'pointer'
                  }}
                >
                  Retry Cast Recording
                </button>
              </div>
            )}

            {audioDataUri && (
              <div style={{ marginTop: audioError ? 12 : 0 }}>
                <audio
                  ref={audioRef}
                  src={audioDataUri}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => {
                    setIsPlaying(false)
                    bgSoundRef.current?.stop()
                  }}
                  style={{ display: 'none' }}
                />

                <div style={{
                  background: 'var(--bg-elevated)',
                  border: `1px solid ${genre?.color ?? 'var(--border)'}33`,
                  borderRadius: 12, padding: '12px 14px',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <button
                    onClick={togglePlay}
                    style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${genre?.color}, ${genre?.color}cc)`,
                      border: 'none', cursor: 'pointer', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, color: '#fff',
                      boxShadow: `0 2px 12px ${genre?.color}55`,
                    }}
                  >
                    {isPlaying ? '⏸' : '▶'}
                  </button>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                       Cinematic Match Narration
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                       Aura-2 Multi-Voice
                       {isPlaying && (
                         <span style={{ color: genre?.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                           <span className="pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                           Now Playing
                         </span>
                       )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = audioDataUri
                      link.download = `kickoffto-${genre?.id}-cinematic.mp3`
                      link.click()
                    }}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 8, padding: '6px 10px',
                      fontSize: 11, color: 'var(--text-2)',
                      cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    ↓ MP3
                  </button>
                </div>

                <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      const newState = !bgEnabled
                      setBgEnabled(newState)
                      if (isPlaying) {
                        if (newState) {
                          const bg = createBackgroundSound(audioCtxRef.current!, selectedGenre!)
                          bgSoundRef.current = bg
                          bg.start()
                        } else {
                          bgSoundRef.current?.stop()
                        }
                      }
                    }}
                    style={{
                      background: bgEnabled ? 'rgba(34,197,94,0.1)' : 'var(--bg-elevated)',
                      border: `1px solid ${bgEnabled ? 'var(--green)' : 'var(--border)'}`,
                      borderRadius: 8, padding: '5px 10px',
                      fontSize: 11, color: bgEnabled ? 'var(--green)' : 'var(--text-3)',
                      cursor: 'pointer', fontWeight: 600,
                    }}
                  >
                    🎵 {bgEnabled ? 'Atmosphere ON' : 'Atmosphere OFF'}
                  </button>

                  {voicesInfo.length > 0 && (
                    <div style={{ fontSize: 9, color: 'var(--text-3)', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {voicesInfo.slice(0, 4).map(v => (
                        <span key={v} style={{
                          background: 'var(--bg-elevated)', borderRadius: 4, padding: '2px 6px',
                        }}>
                          {v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes typingBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.3; }
          40% { transform: translateY(-8px); opacity: 1; }
        }
        .pulse {
          animation: pulseFade 1.5s ease-in-out infinite;
        }
        @keyframes pulseFade {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
