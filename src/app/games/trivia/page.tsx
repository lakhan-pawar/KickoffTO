'use client'
import { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'
import Link from 'next/link'

interface TriviaQuestion {
  question: string
  options: string[]
  correct: number
  explanation: string
}

export default function TriviaPage() {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([])
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if already played today
    const today = new Date().toISOString().split('T')[0]
    const stored = localStorage.getItem(`kt-trivia-${today}`)
    if (stored) {
      const data = JSON.parse(stored)
      setQuestions(data.questions)
      setAnswers(data.answers)
      setSubmitted(data.submitted)
      setLoading(false)
      return
    }

    // Fetch questions
    fetch('/api/games/trivia')
      .then(r => r.json())
      .then(data => {
        setQuestions(data.questions ?? [])
        setAnswers(new Array(data.questions?.length ?? 5).fill(null))
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load today\'s trivia. Try again.')
        setLoading(false)
      })
  }, [])

  function selectAnswer(qIdx: number, aIdx: number) {
    if (submitted) return
    const updated = [...answers]
    updated[qIdx] = aIdx
    setAnswers(updated)
  }

  function submitAnswers() {
    if (answers.some(a => a === null)) return
    setSubmitted(true)
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(`kt-trivia-${today}`, JSON.stringify({
      questions, answers, submitted: true,
    }))
  }

  const score = submitted
    ? questions.filter((q, i) => answers[i] === q.correct).length
    : 0

  function shareResult() {
    const emoji = questions.map((q, i) =>
      answers[i] === q.correct ? '⚽' : '❌'
    ).join('')
    const text = `KickoffTo Trivia ${score}/${questions.length} ${emoji}\nkickoffto.com/games/trivia`
    navigator.clipboard?.writeText(text)
    alert('Result copied to clipboard!')
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main style={{ maxWidth: 600, margin: '0 auto', padding: '80px 16px',
          textAlign: 'center', color: 'var(--text-2)', fontSize: 14 }}>
          Loading today&apos;s trivia...
        </main>
        <BottomNav />
      </>
    )
  }

  if (error || questions.length === 0) {
    return (
      <>
        <Navbar />
        <main style={{ maxWidth: 600, margin: '0 auto', padding: '80px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🧠</div>
          <div style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 20 }}>
            {error || 'Trivia unavailable right now. Check back soon.'}
          </div>
          <Link href="/games" style={{ color: 'var(--green)', fontSize: 13 }}>← Back to games</Link>
        </main>
        <BottomNav />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px 100px' }}>
        <Link href="/games" style={{
          fontSize: 12, color: 'var(--green)', textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20,
        }}>
          ← Games
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 28, letterSpacing: -0.5, color: 'var(--text)', marginBottom: 4 }}>
              DAILY TRIVIA
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {submitted && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28,
                fontWeight: 900, color: score >= 4 ? 'var(--green)' : 'var(--text)',
                fontVariantNumeric: 'tabular-nums' }}>
                {score}/{questions.length}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>correct</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
          {questions.map((q, qIdx) => (
            <div key={qIdx} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 12, padding: 16,
            }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12,
                alignItems: 'flex-start' }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: submitted
                    ? answers[qIdx] === q.correct ? 'var(--green)' : 'var(--red-card)'
                    : answers[qIdx] !== null ? 'var(--green)' : 'var(--bg-elevated)',
                  color: '#fff', fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {submitted
                    ? answers[qIdx] === q.correct ? '⚽' : '❌'
                    : qIdx + 1}
                </span>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)',
                  lineHeight: 1.5, margin: 0 }}>
                  {q.question}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {q.options.map((opt, aIdx) => {
                  const isSelected = answers[qIdx] === aIdx
                  const isCorrect = submitted && aIdx === q.correct
                  const isWrong = submitted && isSelected && aIdx !== q.correct

                  return (
                    <button
                      key={aIdx}
                      onClick={() => selectAnswer(qIdx, aIdx)}
                      disabled={submitted}
                      style={{
                        background: isCorrect ? 'rgba(22,163,74,0.15)'
                          : isWrong ? 'rgba(220,38,38,0.1)'
                          : isSelected ? 'var(--bg-elevated)' : 'transparent',
                        border: `1px solid ${isCorrect ? 'var(--green)'
                          : isWrong ? 'var(--red-card)'
                          : isSelected ? 'var(--green)' : 'var(--border)'}`,
                        borderRadius: 8, padding: '9px 12px',
                        fontSize: 12, color: isCorrect ? 'var(--green)'
                          : isWrong ? 'var(--red-card)' : 'var(--text-2)',
                        cursor: submitted ? 'default' : 'pointer',
                        textAlign: 'left', fontWeight: isSelected ? 500 : 400,
                        transition: 'all 0.15s',
                      }}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>

              {submitted && (
                <div style={{
                  marginTop: 10, padding: '8px 10px',
                  background: 'var(--bg-elevated)', borderRadius: 7,
                  fontSize: 11, color: 'var(--text-2)', lineHeight: 1.5,
                }}>
                  {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        {!submitted ? (
          <button
            onClick={submitAnswers}
            disabled={answers.some(a => a === null)}
            style={{
              width: '100%', background: answers.some(a => a === null)
                ? 'var(--bg-elevated)' : 'var(--green)',
              color: answers.some(a => a === null) ? 'var(--text-3)' : '#fff',
              border: 'none', borderRadius: 10,
              padding: '12px 20px', fontSize: 14, fontWeight: 700,
              cursor: answers.some(a => a === null) ? 'not-allowed' : 'pointer',
            }}
          >
            {answers.some(a => a === null)
              ? `Answer all ${questions.length} questions to submit`
              : 'Submit answers →'}
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={shareResult} style={{
              flex: 1, background: 'var(--green)', color: '#fff',
              border: 'none', borderRadius: 10, padding: '12px 20px',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}>
              Share result 📋
            </button>
            <Link href="/games" style={{
              flex: 1, background: 'var(--bg-elevated)', color: 'var(--text-2)',
              border: '1px solid var(--border)', borderRadius: 10,
              padding: '12px 20px', fontSize: 14, fontWeight: 500,
              textDecoration: 'none', textAlign: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              Back to games
            </Link>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  )
}
