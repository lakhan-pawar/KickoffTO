'use client'
import { useState, useRef } from 'react'
import { Flag, FLAG_ISO } from '@/components/ui/Flag'

// Fixed emoji — no encoding issues
const GENRES = [
  { id: 'horror',  emoji: '🎃', name: 'Horror',      desc: 'A nightmare in 90 minutes',      voice: 'Dan',      color: '#dc2626' },
  { id: 'romance', emoji: '💕', name: 'Romance',     desc: 'Love in the beautiful game',     voice: 'Liv',      color: '#f43f5e' },
  { id: 'heist',   emoji: '💰', name: 'Heist',       desc: 'The perfect footballing robbery', voice: 'Will',     color: '#d97706' },
  { id: 'scifi',   emoji: '🚀', name: 'Sci-Fi',      desc: 'Football in the far future',     voice: 'Scarlett', color: '#2563eb' },
  { id: 'western', emoji: '🤠', name: 'Western',     desc: 'A duel at high noon',            voice: 'Dan',      color: '#b45309' },
  { id: 'comedy',  emoji: '😂', name: 'Comedy',      desc: 'When football gets absurd',      voice: 'Freya',    color: '#16a34a' },
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
  const audioRef = useRef<HTMLAudioElement>(null)

  const genre = GENRES.find(g => g.id === selectedGenre)

  async function generate(genreId: string) {
    setSelectedGenre(genreId)
    setLoading(true)
    setError('')
    setScript('')
    setAudioDataUri(null)
    setAudioError('')
    setVoiceUsed('')

    try {
      const res = await fetch(`/api/director/${match.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genre: genreId, match }),
      })

      if (!res.ok) throw new Error(`API error ${res.status}`)
      const data = await res.json()
      setScript(data.script ?? '')
      setCached(data.cached ?? false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  async function narrate() {
    if (!script || !selectedGenre) return
    setAudioLoading(true)
    setAudioError('')
    setAudioDataUri(null)
    setVoiceUsed('')
    setAudioStatus('Connecting to Unreal Speech...')

    const slowTimer = setTimeout(() => {
      setAudioStatus('Generating audio... usually takes 2-5 seconds')
    }, 3000)

    try {
      const res = await fetch(`/api/director/${match.id}/narrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script, genre: selectedGenre }),
      })

      clearTimeout(slowTimer)

      // Always parse as text first
      const rawText = await res.text()
      let data: {
        audioDataUri?: string | null
        voiceUsed?: string
        error?: string
      } = {}

      try {
        data = JSON.parse(rawText)
      } catch {
        setAudioError(`Server error: ${rawText.slice(0, 150)}`)
        return
      }

      if (data.audioDataUri) {
        setAudioDataUri(data.audioDataUri)
        setVoiceUsed(data.voiceUsed ?? '')
        setAudioStatus('')
      } else {
        let errorMsg = data.error ?? 'Audio generation failed'
        if (errorMsg.includes('FUNCTION_INVOCATION_TIMEOUT')) {
          errorMsg = '⏱️ Timed out. Script may be too long — try regenerating.'
        } else if (errorMsg.includes('No UNREAL_SPEECH_API_KEY')) {
          errorMsg = '⚙️ Add UNREAL_SPEECH_API_KEY_1 to Vercel environment variables.'
        } else if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
          errorMsg = '🔑 Invalid API key. Regenerate at unrealspeech.com'
        } else if (errorMsg.includes('429')) {
          errorMsg = '📊 Rate limited. Try again in a moment.'
        }
        setAudioError(errorMsg)
        setAudioStatus('')
      }
    } catch (err: unknown) {
      clearTimeout(slowTimer)
      setAudioError(err instanceof Error ? err.message : 'Network error')
      setAudioStatus('')
    } finally {
      setAudioLoading(false)
    }
  }

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
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

      {/* Genre selector */}
      <p style={{
        fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        marginBottom: 12,
      }}>
        Choose a genre
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 8, marginBottom: 20,
      }}>
        {GENRES.map(g => (
          <button
            key={g.id}
            onClick={() => generate(g.id)}
            disabled={loading}
            style={{
              background: selectedGenre === g.id
                ? g.color + '22' : 'var(--bg-card)',
              border: `1px solid ${selectedGenre === g.id ? g.color : 'var(--border)'}`,
              borderRadius: 12, padding: '12px 14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s',
              opacity: loading && selectedGenre !== g.id ? 0.5 : 1,
            }}
            onMouseEnter={e => {
              if (!loading) {
                const el = e.currentTarget as HTMLButtonElement
                el.style.borderColor = g.color
                el.style.transform = 'translateY(-2px)'
              }
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.borderColor = selectedGenre === g.id ? g.color : 'var(--border)'
              el.style.transform = 'none'
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
              Voice: {g.voice}
            </div>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
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
          <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
            {genre?.emoji} Writing {genre?.name} screenplay...
          </div>
        </div>
      )}

      {/* Error */}
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

      {/* Generated screenplay */}
      {script && genre && (
        <div style={{ marginBottom: 20 }}>

          {/* Script display */}
          <div style={{
            background: 'var(--bg-card)',
            border: `1px solid ${genre.color}44`,
            borderTop: `3px solid ${genre.color}`,
            borderRadius: '0 0 16px 16px',
            padding: '20px',
            marginBottom: 14,
            position: 'relative',
          }}>
            {/* Genre badge */}
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
                  {genre.name.toUpperCase()} MODE
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>
                  Voice: {genre.voice} · {cached ? '🟡 Cached' : '🟢 Generated now'}
                </div>
              </div>
              <button
                onClick={() => generate(genre.id)}
                style={{
                  marginLeft: 'auto',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 8, padding: '5px 10px',
                  fontSize: 11, color: 'var(--text-2)',
                  cursor: 'pointer',
                }}
              >
                🔄 Regenerate
              </button>
            </div>

            <div style={{
              fontSize: 14, color: 'var(--text)',
              lineHeight: 1.8, whiteSpace: 'pre-wrap',
              fontFamily: 'Georgia, serif',
            }}>
              {script}
            </div>
          </div>

          {/* TTS controls */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '14px 16px',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: 10, marginBottom: audioDataUri ? 12 : 0,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                  🎙️ Narrate this screenplay
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>
                  {genre.voice} voice · Powered by Unreal Speech
                </div>
              </div>

              <button
                onClick={narrate}
                disabled={audioLoading}
                style={{
                  background: audioLoading
                    ? 'var(--bg-elevated)'
                    : `linear-gradient(135deg, ${genre.color}, ${genre.color}cc)`,
                  color: audioLoading ? 'var(--text-3)' : '#fff',
                  border: 'none', borderRadius: 10,
                  padding: '10px 18px', fontSize: 13,
                  fontWeight: 700, cursor: audioLoading ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: audioLoading ? 'none' : `0 4px 16px ${genre.color}44`,
                }}
              >
                {audioLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid #fff', borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                      display: 'inline-block', flexShrink: 0,
                    }} />
                    {audioStatus || 'Generating...'}
                  </div>
                ) : '▶ Generate audio'}
              </button>
            </div>

            {audioError && (
              <div style={{
                fontSize: 12, color: '#f87171', marginTop: 8,
                background: 'rgba(220,38,38,0.08)',
                border: '1px solid rgba(220,38,38,0.2)',
                borderRadius: 8, padding: '10px 12px',
                lineHeight: 1.5,
              }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Audio generation failed</div>
                <div style={{ fontSize: 11 }}>{audioError}</div>
                {audioError.includes('Vercel') && (
                  <a
                    href="https://vercel.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block', marginTop: 6,
                      fontSize: 11, color: '#60a5fa',
                    }}
                  >
                    Open Vercel Dashboard →
                  </a>
                )}
              </div>
            )}

            {/* Audio Controls */}
            {audioDataUri && (
              <div style={{ marginTop: 12 }}>
                <audio
                  ref={audioRef}
                  src={audioDataUri}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
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
                      {genre?.emoji} {genre?.name} Narration
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>
                      {voiceUsed || genre?.voice} · Unreal Speech v8
                      {isPlaying && (
                        <span style={{ marginLeft: 8, color: genre?.color }}>
                          ● Playing...
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = audioDataUri
                      link.download = `kickoffto-${genre?.id}-narration.mp3`
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
              </div>
            )}
          </div>

          {/* Attribution required by Unreal Speech free plan */}
          <p style={{
            fontSize: 9, color: 'var(--text-3)',
            textAlign: 'center', marginTop: 8,
          }}>
            Audio by <a href="https://unrealspeech.com" target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-3)' }}>unrealspeech.com</a>
          </p>
        </div>
      )}

      {/* Match events */}
      {!script && !loading && match.events?.length > 0 && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 16,
        }}>
          <p style={{
            fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12,
          }}>
            Match events · the raw material
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {match.events.map((event, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, alignItems: 'center',
                fontSize: 12, color: 'var(--text-2)',
              }}>
                <span style={{
                  fontSize: 10, fontVariantNumeric: 'tabular-nums',
                  color: 'var(--text-3)', minWidth: 28,
                }}>
                  {event.minute}&apos;
                </span>
                <span style={{ fontSize: 14 }}>
                  {event.type === 'goal' ? '⚽'
                    : event.type === 'yellow' ? '🟡'
                    : event.type === 'red' ? '🟥' : '↕'}
                </span>
                <span style={{ flex: 1 }}>
                  {event.player}
                  <span style={{ color: 'var(--text-3)', marginLeft: 6 }}>
                    · {event.team}
                  </span>
                </span>
              </div>
            ))}
          </div>
          <p style={{
            fontSize: 11, color: 'var(--text-3)',
            marginTop: 14, fontStyle: 'italic',
          }}>
            Pick a genre above — Groq turns these events into a screenplay
          </p>
        </div>
      )}
    </div>
  )
}
