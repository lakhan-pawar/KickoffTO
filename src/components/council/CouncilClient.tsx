'use client'
import { useState } from 'react'
import { CHARACTERS } from '@/lib/constants'
import { CharacterCard } from '@/components/ui/CharacterCard'

export function CouncilClient() {
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function askCouncil(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim() || isLoading) return

    setIsLoading(true)
    setResponses({})
    setErrors({})

    // Parallel requests to all 16 characters
    await Promise.all(CHARACTERS.map(async (char) => {
      try {
        const res = await fetch(`/api/characters/${char.id}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: question }]
          })
        })

        if (!res.ok) throw new Error('Failed to respond')
        
        // Handle streaming response simply for the council view
        const reader = res.body?.getReader()
        if (!reader) throw new Error('No reader')

        let fullText = ''
        const decoder = new TextDecoder()
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          // AI SDK Data Stream format: 0:"text"
          const lines = chunk.split('\n').filter(Boolean)
          for (const line of lines) {
            if (line.startsWith('0:')) {
              const text = JSON.parse(line.substring(2))
              fullText += text
              setResponses(prev => ({ ...prev, [char.id]: fullText }))
            }
          }
        }
      } catch (err: any) {
        setErrors(prev => ({ ...prev, [char.id]: err.message }))
      }
    }))

    setIsLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Input area */}
      <form 
        onSubmit={askCouncil}
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '20px 24px', position: 'relative',
        }}
      >
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask the council anything... 'Who will win WC2026?'"
          style={{
            width: '100%', background: 'transparent', border: 'none',
            color: 'var(--text)', fontSize: 16, lineHeight: 1.5,
            resize: 'none', height: 80, outline: 'none',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            style={{
              background: 'var(--green)', color: '#fff', border: 'none',
              borderRadius: 10, padding: '10px 24px', fontWeight: 700,
              fontSize: 14, cursor: (isLoading || !question.trim()) ? 'not-allowed' : 'pointer',
              opacity: (isLoading || !question.trim()) ? 0.6 : 1,
            }}
          >
            {isLoading ? 'The Council is deliberating...' : 'Ask the Council →'}
          </button>
        </div>
      </form>

      {/* Grid of responses */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 16,
      }}>
        {CHARACTERS.map(char => {
          const response = responses[char.id]
          const error = errors[char.id]
          const isPending = isLoading && !response && !error

          return (
            <div key={char.id} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column',
              opacity: isPending ? 0.6 : 1,
              transition: 'opacity 0.3s ease',
            }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 10, background: char.color + '11' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: char.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 800, color: '#fff', fontSize: 11 }}>
                  {char.monogram}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{char.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{char.tier} · {char.role}</div>
                </div>
              </div>
              
              <div style={{ padding: 14, flex: 1, minHeight: 80 }}>
                {response ? (
                  <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{response}</p>
                ) : error ? (
                  <p style={{ fontSize: 12, color: 'var(--red-card)' }}>⚠️ {error}</p>
                ) : isPending ? (
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--border-hover)',
                        animation: 'typingBounce 1s infinite', animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>Waiting for question...</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
