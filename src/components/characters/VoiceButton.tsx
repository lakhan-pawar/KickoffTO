'use client'
import { useState, useEffect, useRef } from 'react'

interface VoiceButtonProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

export function VoiceButton({ onTranscript, disabled }: VoiceButtonProps) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (SpeechRecognition) {
      setSupported(true)
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        onTranscript(transcript)
        setListening(false)
      }
      recognitionRef.current.onerror = () => setListening(false)
      recognitionRef.current.onend = () => setListening(false)
    }
  }, [onTranscript])

  function toggleListening() {
    if (!supported || disabled) return
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
    } else {
      try {
        recognitionRef.current?.start()
        setListening(true)
      } catch (e) {
        setListening(false)
      }
    }
  }

  if (!supported) return null

  return (
    <button
      onClick={toggleListening}
      disabled={disabled}
      aria-label={listening ? 'Stop voice input' : 'Start voice input — speak your question'}
      title={listening ? 'Stop listening' : 'Speak your question'}
      style={{
        width: 38, height: 38, borderRadius: 8, flexShrink: 0,
        background: listening ? 'rgba(220,38,38,0.15)' : 'var(--bg-elevated)',
        border: `1px solid ${listening ? '#dc2626' : 'var(--border)'}`,
        color: listening ? '#dc2626' : 'var(--text-3)',
        cursor: 'pointer', fontSize: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s',
      }}
      className={listening ? 'animate-live' : ''}
    >
      {listening ? '⏹' : '🎤'}
      <style jsx>{`
        @keyframes livePulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        .animate-live {
          animation: livePulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </button>
  )
}
