'use client'
import { useState, useRef } from 'react'
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
  const [narrationInfo, setNarrationInfo] = useState<{
    originalLength: number
    usedLength: number
  } | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const genre = GENRES.find(g => g.id === selectedGenre)

  async function generateAndNarrate(genreId: string) {
    setSelectedGenre(genreId)
    setLoading(true)
    setError('')
    setScript('')
    setAudioDataUri(null)
    setAudioError('')
    setVoiceUsed('')
    setNarrationInfo(null)
    setAudioStatus('Writing screenplay...')

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
      
      // Pivot to narration state
      setLoading(false)
      setAudioLoading(true)
      setAudioStatus('Narrating with Deepgram Aura-2...')

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
        originalLength?: number
        usedLength?: number
        error?: string
        debug?: Record<string, unknown>
      } = {}

      try {
        audioData = JSON.parse(rawAudio)
      } catch {
        setAudioError(`Server error: ${rawAudio.slice(0, 100)}`)
        return
      }

      if (audioData.audioDataUri) {
        setAudioDataUri(audioData.audioDataUri)
        setVoiceUsed(audioData.voiceUsed ?? '')
        if (audioData.originalLength && audioData.usedLength) {
          setNarrationInfo({
            originalLength: audioData.originalLength,
            usedLength: audioData.usedLength,
          })
        }
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
        Choose a genre to generate & narrate
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
            onMouseEnter={e => {
              if (!loading && !audioLoading) {
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
              Voice: {g.voice} (Aura-2)
            </div>
          </button>
        ))}
      </div>

      {/* Global Loading State */}
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
            {audioStatus || (loading ? `${genre?.emoji} Writing screenplay...` : 'Generating audio...')}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
            {loading ? 'Groq is writing your script' : 'Deepgram Aura-2 is narrating'}
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

      {/* Generated screenplay + Audio Player */}
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
                onClick={() => generateAndNarrate(genre.id)}
                disabled={loading || audioLoading}
                style={{
                  marginLeft: 'auto',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 8, padding: '5px 10px',
                  fontSize: 11, color: 'var(--text-2)',
                  cursor: (loading || audioLoading) ? 'not-allowed' : 'pointer',
                  opacity: (loading || audioLoading) ? 0.5 : 1,
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

          {/* Audio Player and Errors */}
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
                  Retry Narration
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
                      {voiceUsed || `${genre?.voice} (Aura-2)`}
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

                {narrationInfo && narrationInfo.originalLength > narrationInfo.usedLength && (
                  <div style={{
                    fontSize: 9, color: 'var(--text-3)', marginTop: 6, textAlign: 'center',
                  }}>
                    Narrating first {narrationInfo.usedLength} of {narrationInfo.originalLength} chars
                  </div>
                )}
              </div>
            )}
            
            {!audioDataUri && !audioLoading && !audioError && (
               <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center' }}>
                 Audio narrated by Deepgram Aura-2
               </div>
            )}
          </div>

          <p style={{
            fontSize: 9, color: 'var(--text-3)',
            textAlign: 'center', marginTop: 8,
          }}>
            Audio by <a href="https://deepgram.com" target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-3)' }}>deepgram.com</a>
          </p>
        </div>
      )}

      {/* Match events summary if no script yet */}
      {!script && !loading && !audioLoading && match.events?.length > 0 && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 16,
        }}>
          <p style={{
            fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12,
          }}>
            Match events · ready for production
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
            Select a genre above to generate the screenplay and narration instantly.
          </p>
        </div>
      )}
    </div>
  )
}
