'use client'
import { useState, useRef, useEffect } from 'react'
import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'
import Link from 'next/link'

const TEAMS = [
  { code: 'ARG', name: 'Argentina', flag: '🇦🇷' },
  { code: 'FRA', name: 'France', flag: '🇫🇷' },
  { code: 'BRA', name: 'Brazil', flag: '🇧🇷' },
  { code: 'ENG', name: 'England', flag: '🏴' },
  { code: 'ESP', name: 'Spain', flag: '🇪🇸' },
  { code: 'GER', name: 'Germany', flag: '🇩🇪' },
  { code: 'POR', name: 'Portugal', flag: '🇵🇹' },
  { code: 'NED', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'CAN', name: 'Canada', flag: '🇨🇦' },
  { code: 'USA', name: 'USA', flag: '🇺🇸' },
  { code: 'MEX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'MAR', name: 'Morocco', flag: '🇲🇦' },
  { code: 'JPN', name: 'Japan', flag: '🇯🇵' },
  { code: 'URU', name: 'Uruguay', flag: '🇺🇾' },
]

const STYLES = [
  { id: 'terrace', label: 'Terrace', emoji: '📣', desc: 'Classic football chant' },
  { id: 'melodic', label: 'Melodic', emoji: '🎵', desc: 'Sung to a famous tune' },
  { id: 'sarcastic', label: 'Sarcastic', emoji: '😏', desc: 'For the opposition' },
  { id: 'epic', label: 'Epic', emoji: '🏆', desc: 'Tournament anthem' },
]

// Voice personalities for the chant reader
const VOICE_STYLES = [
  {
    id: 'stadium',
    label: 'Stadium Announcer',
    emoji: '🎙️',
    config: { rate: 0.82, pitch: 0.75, volume: 1.0 },
    desc: 'Deep, powerful, echoing',
  },
  {
    id: 'terrace',
    label: 'Terrace Fan',
    emoji: '📣',
    config: { rate: 1.15, pitch: 1.1, volume: 1.0 },
    desc: 'Passionate, loud, energetic',
  },
  {
    id: 'commentator',
    label: 'Commentator',
    emoji: '🎤',
    config: { rate: 0.95, pitch: 0.9, volume: 0.95 },
    desc: 'Professional, clear, measured',
  },
  {
    id: 'ultra',
    label: 'Ultra',
    emoji: '🔥',
    config: { rate: 1.3, pitch: 1.2, volume: 1.0 },
    desc: 'Fast, intense, fanatical',
  },
]

export default function ChantPage() {
  const [team, setTeam] = useState('CAN')
  const [style, setStyle] = useState('terrace')
  const [chant, setChant] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState('stadium')
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Stop TTS when user navigates away from chant page
  useEffect(() => {
    return () => {
      // Cleanup: cancel speech when component unmounts
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Also add to the stopAudio function — make sure it's called on route change
  // Add router.events listener if using Next.js app router:
  useEffect(() => {
    function handleRouteChange() {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
        setIsPlaying(false)
      }
    }
    window.addEventListener('beforeunload', handleRouteChange)
    return () => {
      window.removeEventListener('beforeunload', handleRouteChange)
      handleRouteChange() // Also run on component unmount
    }
  }, [])

  const selectedTeam = TEAMS.find(t => t.code === team)!

  // Load available system voices
  function loadVoices() {
    if (typeof window === 'undefined') return
    const voices = window.speechSynthesis.getVoices()
    setAvailableVoices(voices)
  }

  if (typeof window !== 'undefined') {
    window.speechSynthesis.onvoiceschanged = loadVoices
  }

  async function generate() {
    setLoading(true)
    setError('')
    setChant('')
    stopAudio()

    try {
      const res = await fetch('/api/games/chant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team: selectedTeam.name, style }),
      })
      if (!res.ok) throw new Error(`API error ${res.status}`)
      const data = await res.json()
      setChant(data.chant ?? '')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate chant')
    } finally {
      setLoading(false)
    }
  }

  function playChant() {
    if (!chant || typeof window === 'undefined') return
    if (isPlaying) { stopAudio(); return }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(chant)
    const voiceStyle = VOICE_STYLES.find(v => v.id === selectedVoice)!
    const { rate, pitch, volume } = voiceStyle.config

    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume
    utterance.lang = 'en-GB' // British English sounds best for football chants

    // Pick the best available voice for this style
    const voices = window.speechSynthesis.getVoices()
    let chosenVoice: SpeechSynthesisVoice | undefined

    if (selectedVoice === 'stadium' || selectedVoice === 'commentator') {
      // Deep voices — prefer UK English male
      chosenVoice = voices.find(v =>
        v.lang.startsWith('en-GB') && v.name.toLowerCase().includes('male')
      ) ?? voices.find(v => v.lang.startsWith('en-GB') && !v.name.toLowerCase().includes('female'))
      ?? voices.find(v => v.lang.startsWith('en'))
    } else if (selectedVoice === 'terrace') {
      // Energetic — US or UK
      chosenVoice = voices.find(v => v.lang.startsWith('en-US'))
        ?? voices.find(v => v.lang.startsWith('en'))
    } else if (selectedVoice === 'ultra') {
      // Fast and intense — any English
      chosenVoice = voices.find(v => v.lang.startsWith('en-AU'))
        ?? voices.find(v => v.lang.startsWith('en'))
    }

    if (chosenVoice) utterance.voice = chosenVoice

    utterance.onstart = () => setIsPlaying(true)
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)

    // Haptic on play
    if (navigator.vibrate) navigator.vibrate([10, 20, 10])
  }

  function stopAudio() {
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel()
    }
    setIsPlaying(false)
  }

  function copyChant() {
    navigator.clipboard?.writeText(chant)
    setCopied(true)
    if (navigator.vibrate) navigator.vibrate(8)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px 80px' }}>
        <Link href="/games" style={{
          fontSize: 12, color: 'var(--green)', textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20,
        }}>
          ← Games
        </Link>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 28, letterSpacing: -0.5, color: 'var(--text)', marginBottom: 6,
        }}>
          CHANT CREATOR
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 24 }}>
          Generate a WC2026 terrace chant. Then hear it performed in different voices.
        </p>

        {/* Team picker */}
        <div style={{ marginBottom: 16 }}>
          <p style={{
            fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
          }}>Team</p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
            gap: 6,
          }}>
            {TEAMS.map(t => (
              <button key={t.code} onClick={() => setTeam(t.code)} style={{
                background: team === t.code ? 'var(--bg-elevated)' : 'var(--bg-card)',
                border: `1px solid ${team === t.code ? 'var(--green)' : 'var(--border)'}`,
                borderRadius: 8, padding: '8px 6px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 12, color: team === t.code ? 'var(--text)' : 'var(--text-2)',
                fontWeight: team === t.code ? 600 : 400,
              }}>
                <span style={{ fontSize: 16 }}>{t.flag}</span>
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Style picker */}
        <div style={{ marginBottom: 20 }}>
          <p style={{
            fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
          }}>Chant style</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
            {STYLES.map(s => (
              <button key={s.id} onClick={() => setStyle(s.id)} style={{
                background: style === s.id ? 'var(--bg-elevated)' : 'var(--bg-card)',
                border: `1px solid ${style === s.id ? 'var(--green)' : 'var(--border)'}`,
                borderRadius: 10, padding: '10px 12px', cursor: 'pointer',
                textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 18 }}>{s.emoji}</span>
                <div>
                  <div style={{
                    fontSize: 12, fontWeight: 600,
                    color: style === s.id ? 'var(--text)' : 'var(--text-2)',
                  }}>{s.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{s.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <button onClick={generate} disabled={loading} style={{
          width: '100%',
          background: loading ? 'var(--bg-elevated)' : 'linear-gradient(135deg,#16a34a,#15803d)',
          color: loading ? 'var(--text-3)' : '#fff',
          border: 'none', borderRadius: 12, padding: '14px 20px',
          fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: 20,
          boxShadow: loading ? 'none' : '0 4px 16px rgba(22,163,74,0.35)',
        }}>
          {loading ? `Writing ${selectedTeam.name} chant...` : `${selectedTeam.flag} Generate chant →`}
        </button>

        {error && (
          <div style={{
            background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)',
            borderRadius: 10, padding: '12px 16px', marginBottom: 16,
            fontSize: 13, color: '#f87171',
          }}>
            {error}
          </div>
        )}

        {chant && (
          <div>
            {/* Chant display */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 14, padding: 20, marginBottom: 16,
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Team colour accent */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: 'linear-gradient(90deg, #16a34a, #22c55e)',
              }} />
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 14, marginTop: 6,
              }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  {selectedTeam.flag} {selectedTeam.name} · {STYLES.find(s => s.id === style)?.label}
                </span>
              </div>
              <pre style={{
                fontFamily: 'var(--font-display)',
                fontSize: 16, fontWeight: 700,
                color: 'var(--text)', lineHeight: 2,
                whiteSpace: 'pre-wrap', margin: 0,
                letterSpacing: -0.2,
              }}>
                {chant}
              </pre>
            </div>

            {/* Voice selector */}
            <div style={{ marginBottom: 12 }}>
              <p style={{
                fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
              }}>
                Voice style
              </p>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6,
              }}>
                {VOICE_STYLES.map(v => (
                  <button key={v.id} onClick={() => { setSelectedVoice(v.id); stopAudio() }} style={{
                    background: selectedVoice === v.id ? 'var(--bg-elevated)' : 'var(--bg-card)',
                    border: `1px solid ${selectedVoice === v.id ? 'var(--green)' : 'var(--border)'}`,
                    borderRadius: 9, padding: '8px 10px', cursor: 'pointer',
                    textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{ fontSize: 18 }}>{v.emoji}</span>
                    <div>
                      <div style={{
                        fontSize: 11, fontWeight: 600,
                        color: selectedVoice === v.id ? 'var(--text)' : 'var(--text-2)',
                      }}>{v.label}</div>
                      <div style={{ fontSize: 9, color: 'var(--text-3)' }}>{v.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              {/* Play / Stop */}
              <button onClick={playChant} style={{
                flex: 1,
                background: isPlaying
                  ? 'rgba(239,68,68,0.15)'
                  : 'linear-gradient(135deg,#16a34a,#15803d)',
                color: isPlaying ? '#f87171' : '#fff',
                border: isPlaying ? '1px solid rgba(239,68,68,0.3)' : 'none',
                borderRadius: 12, padding: '13px',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: isPlaying ? 'none' : '0 4px 16px rgba(22,163,74,0.35)',
              }}>
                {isPlaying ? (
                  <>
                    <span style={{
                      display: 'inline-flex', gap: 2, alignItems: 'flex-end', height: 16,
                    }}>
                      {[0,1,2,3].map(i => (
                        <span key={i} style={{
                          width: 3, borderRadius: 2,
                          background: '#f87171',
                          animation: `eqBar 0.5s ease-in-out ${i*0.1}s infinite alternate`,
                        }} />
                      ))}
                    </span>
                    Stop
                  </>
                ) : (
                  <>🔊 Play chant</>
                )}
              </button>

              <button onClick={copyChant} style={{
                flex: 1,
                background: copied ? 'var(--bg-elevated)' : 'var(--bg-card)',
                color: copied ? 'var(--green)' : 'var(--text-2)',
                border: `1px solid ${copied ? 'var(--green)' : 'var(--border)'}`,
                borderRadius: 12, padding: '13px',
                fontSize: 14, fontWeight: 500, cursor: 'pointer',
              }}>
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>

            <button onClick={generate} style={{
              width: '100%', background: 'var(--bg-elevated)',
              border: '1px solid var(--border)', borderRadius: 12,
              padding: '10px', fontSize: 13,
              color: 'var(--text-2)', cursor: 'pointer',
            }}>
              🔄 New chant
            </button>

            <p style={{
              fontSize: 10, color: 'var(--text-3)', textAlign: 'center', marginTop: 10,
            }}>
              Audio uses your device's built-in text-to-speech · Best in Chrome or Safari
            </p>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  )
}
