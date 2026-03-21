'use client'
import { useEffect, useState } from 'react'

const TOURNAMENT_START = new Date('2026-06-11T20:00:00Z')

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  started: boolean
}

function getTimeLeft(): TimeLeft {
  const now = new Date()
  const diff = TOURNAMENT_START.getTime() - now.getTime()

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, started: true }
  }

  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    started: false,
  }
}

export function Countdown() {
  const [time, setTime] = useState<TimeLeft>(getTimeLeft())
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const newTime = getTimeLeft()
      if (newTime.seconds !== time.seconds) {
        setFlash(true)
        setTimeout(() => setFlash(false), 150)
      }
      setTime(newTime)
    }, 1000)
    return () => clearInterval(interval)
  }, [time.seconds])

  if (time.started) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--green)', color: '#fff',
          borderRadius: 99, padding: '8px 20px',
          fontSize: 14, fontWeight: 700,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%', background: '#fff',
            display: 'inline-block',
            animation: 'livePulse 1.5s ease-in-out infinite',
          }} />
          WC2026 IS LIVE
        </div>
      </div>
    )
  }

  const units = [
    { value: time.days, label: 'Days' },
    { value: time.hours, label: 'Hours' },
    { value: time.minutes, label: 'Mins' },
    { value: time.seconds, label: 'Secs' },
  ]

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{
        fontSize: 10, fontWeight: 700, color: 'var(--green)',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12,
      }}>
        Tournament begins
      </p>
      <div style={{
        display: 'flex', gap: 8, justifyContent: 'center',
        flexWrap: 'wrap',
      }}>
        {units.map(unit => (
          <div key={unit.label} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 12, padding: '16px 12px',
            minWidth: 72, textAlign: 'center',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 40, fontWeight: 900,
              fontVariantNumeric: 'tabular-nums',
              color: unit.label === 'Secs' && flash
                ? 'var(--green)' : 'var(--text)',
              lineHeight: 1,
              transition: 'color 0.1s',
            }}>
              {String(unit.value).padStart(2, '0')}
            </div>
            <div style={{
              fontSize: 9, fontWeight: 700, color: 'var(--text-3)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              marginTop: 6,
            }}>
              {unit.label}
            </div>
          </div>
        ))}
      </div>
      <p style={{
        fontSize: 12, color: 'var(--text-3)', marginTop: 12,
      }}>
        June 11, 2026 · Estadio Azteca, Mexico City · Opening match
      </p>
    </div>
  )
}
