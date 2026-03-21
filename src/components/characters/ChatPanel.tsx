'use client'
import { useChat } from 'ai/react'
import { useEffect, useRef, useState } from 'react'
import { ShareButton } from './ShareButton'
import { SuggestedPrompts } from './SuggestedPrompts'
import { VoiceButton } from './VoiceButton'
import { speakAsCharacter, stopSpeaking } from './CharacterTTS'
import type { Character } from '@/types'

interface ChatPanelProps {
  character: Character
  compact?: boolean
}

export function ChatPanel({ character, compact }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [apiStatus, setApiStatus] = useState<'unknown' | 'ok' | 'error'>('unknown')
  const [apiError, setApiError] = useState('')
  const [isVoiceActive, setIsVoiceActive] = useState(false)

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    setInput,
    reload,
  } = useChat({
    api: `/api/characters/${character.id}/chat`,
    initialMessages: [{
      id: 'welcome',
      role: 'assistant',
      content: character.welcome,
    }],
    onError: (err) => {
      console.error('Chat error:', err)
      setApiError(err.message || 'Unknown error')
      setApiStatus('error')
    },
    onFinish: (message) => {
      setApiStatus('ok')
      setApiError('')
      if (isVoiceActive) speakAsCharacter(message.content, character.id)
    },
  })

  useEffect(() => {
    if (!isVoiceActive) stopSpeaking()
  }, [isVoiceActive])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Check API health on mount
  useEffect(() => {
    fetch('/api/debug/keys')
      .then(r => r.json())
      .then(data => {
        if (data.groq) {
          setApiStatus('ok')
        } else {
          setApiStatus('error')
          setApiError('Groq API key not found in environment variables')
        }
      })
      .catch(() => {
        // Debug endpoint missing — not critical
      })
  }, [])

  // In compact mode, use full-height flex layout
  if (compact) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        overflow: 'hidden', background: 'var(--bg)',
      }}>
        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '12px 14px',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {messages.map(message => (
            <div key={message.id} style={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              {message.role === 'assistant' && (
                <div style={{
                  width: 26, height: 26, borderRadius: 8,
                  background: character.color, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 900,
                  fontSize: 9, color: 'rgba(255,255,255,0.9)',
                  marginRight: 8, alignSelf: 'flex-end',
                }}>
                  {character.monogram}
                </div>
              )}
              <div style={{
                maxWidth: '78%', padding: '10px 14px',
                borderRadius: message.role === 'user'
                  ? '18px 18px 4px 18px'
                  : '18px 18px 18px 4px',
                fontSize: 14, lineHeight: 1.55,
                background: message.role === 'user'
                  ? 'linear-gradient(135deg, #16a34a, #15803d)'
                  : 'var(--bg-elevated)',
                color: message.role === 'user' ? '#fff' : 'var(--text)',
                border: message.role === 'user'
                  ? 'none'
                  : '1px solid var(--border)',
                boxShadow: message.role === 'user'
                  ? '0 2px 12px rgba(22,163,74,0.35)'
                  : 'none',
              }}>
                {message.content || (
                  <span style={{ color: 'var(--text-3)', fontStyle: 'italic', fontSize: 12 }}>
                    Empty response — check Groq API key
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 26, height: 26, borderRadius: 8,
                background: character.color, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontWeight: 900,
                fontSize: 9, color: 'rgba(255,255,255,0.9)',
              }}>
                {character.monogram}
              </div>
              <div style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '18px 18px 18px 4px',
                padding: '10px 14px',
                display: 'flex', gap: 5, alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: character.color, display: 'inline-block',
                    animation: 'typingBounce 0.8s ease-in-out infinite',
                    animationDelay: `${i * 0.15}s`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error banner */}
        {(apiStatus === 'error' || error) && (
          <div style={{
            margin: '0 14px 8px',
            background: 'rgba(220,38,38,0.1)',
            border: '1px solid rgba(220,38,38,0.25)',
            borderRadius: 10, padding: '8px 12px',
            fontSize: 12, color: '#f87171',
          }}>
            {apiError || error?.message || 'Chat connection issue — check API keys'}
          </div>
        )}

        {/* Input — sticky at bottom */}
        <div style={{
          padding: '10px 14px',
          paddingBottom: 'max(12px, calc(env(safe-area-inset-bottom) + 12px))',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg)',
          display: 'flex', gap: 8, alignItems: 'flex-end',
          flexShrink: 0,
        }}>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e as any)
              }
            }}
            placeholder={`Ask ${character.name}...`}
            style={{
              flex: 1, background: 'var(--bg-elevated)',
              border: `1px solid ${input ? character.color + '66' : 'var(--border)'}`,
              borderRadius: 22, padding: '10px 16px',
              fontSize: 15, color: 'var(--text)', outline: 'none',
              minHeight: 44, transition: 'border-color 0.2s',
            }}
          />
          <button
            onClick={e => {
              if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(6)
              handleSubmit(e as any)
            }}
            disabled={isLoading || !input.trim()}
            style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              background: input.trim() && !isLoading
                ? `linear-gradient(135deg, ${character.color}, ${character.color}cc)`
                : 'var(--bg-elevated)',
              border: `1px solid ${input.trim() ? 'transparent' : 'var(--border)'}`,
              color: input.trim() && !isLoading ? '#fff' : 'var(--text-3)',
              cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
              fontSize: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: input.trim() && !isLoading
                ? `0 2px 12px ${character.color}55` : 'none',
              transition: 'all 0.2s',
            }}
          >
            {isLoading ? '⋯' : '↑'}
          </button>
        </div>
      </div>
    )
  }

  // Non-compact: original layout
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      display: 'flex', flexDirection: 'column',
      height: 580, overflow: 'hidden',
      boxShadow: isVoiceActive ? '0 0 0 2px var(--red-card)' : 'none',
      transition: 'box-shadow 0.3s ease',
    }}>

      {/* Header */}
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--bg-elevated)',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: character.color,
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 11, color: 'rgba(255,255,255,0.85)', flexShrink: 0,
        }}>
          {character.monogram}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
            {character.name}
          </div>
          <div style={{
            fontSize: 10,
            display: 'flex', alignItems: 'center', gap: 4,
            color: apiStatus === 'error' ? 'var(--red-card)'
              : apiStatus === 'ok' ? 'var(--green)' : 'var(--text-3)',
          }}>
            <span style={{
              width: 4, height: 4, borderRadius: '50%',
              background: apiStatus === 'error' ? 'var(--red-card)'
                : apiStatus === 'ok' ? 'var(--green)' : 'var(--text-3)',
              display: 'inline-block',
              animation: apiStatus === 'ok'
                ? 'livePulse 1.5s ease-in-out infinite' : 'none',
            }} />
            {apiStatus === 'error' ? 'Connection error'
              : apiStatus === 'ok' ? 'Online'
              : 'Connecting...'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setIsVoiceActive(!isVoiceActive)}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: isVoiceActive ? 'var(--red-card)' : 'var(--bg-card)',
              border: `1px solid ${isVoiceActive ? 'var(--red-card)' : 'var(--border)'}`,
              color: isVoiceActive ? '#fff' : 'var(--text-3)',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 14, transition: 'all 0.2s',
            }}
            title={isVoiceActive ? 'Turn off voice mode' : 'Turn on voice mode'}
          >
            {isVoiceActive ? '🎤' : '🎙️'}
          </button>
          <div style={{ flexShrink: 0, minWidth: 130 }}>
            <ShareButton characterId={character.id} />
          </div>
        </div>
      </div>

      {/* API Error Banner — shows when there's a connection problem */}
      {(apiStatus === 'error' || error) && (
        <div style={{
          background: 'rgba(220,38,38,0.1)',
          border: '1px solid rgba(220,38,38,0.3)',
          borderRadius: 0,
          padding: '10px 14px',
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600,
              color: 'var(--red-card)', marginBottom: 3 }}>
              Chat connection issue
            </div>
            <div style={{
              fontSize: 11, color: 'var(--red-card)', opacity: 0.8,
              lineHeight: 1.5, wordBreak: 'break-word',
            }}>
              {apiError || error?.message || 'Could not connect to AI. Check API keys in Vercel environment variables.'}
            </div>
            <div style={{
              fontSize: 10, color: 'var(--text-3)', marginTop: 4,
            }}>
              API: /api/characters/{character.id}/chat
            </div>
          </div>
          <button
            onClick={() => { setApiStatus('unknown'); setApiError(''); reload(); }}
            style={{
              background: 'var(--red-card)', color: '#fff', border: 'none',
              borderRadius: 6, padding: '4px 8px', fontSize: 10,
              cursor: 'pointer', flexShrink: 0, fontWeight: 600,
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: 14,
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {/* Legacy VoiceMode removed in favor of inline VoiceButton */}
        {messages.map(message => (
          <div key={message.id} style={{
            display: 'flex',
            justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '82%', padding: '10px 14px',
              borderRadius: 10, fontSize: 13, lineHeight: 1.6,
              ...(message.role === 'user' ? {
                background: 'var(--green)', color: '#fff',
                borderBottomRightRadius: 2,
              } : {
                background: 'var(--bg-elevated)', color: 'var(--text)',
                border: '1px solid var(--border)',
                borderBottomLeftRadius: 2,
              }),
            }}>
              {message.content || (
                // Empty response indicator
                <span style={{ color: 'var(--text-3)', fontStyle: 'italic',
                  fontSize: 12 }}>
                  Empty response received — check Groq API key in Vercel env vars
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '10px 14px', background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 10, borderBottomLeftRadius: 2,
              display: 'flex', gap: 4, alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: character.color, display: 'inline-block',
                  animation: 'typingBounce 0.8s ease-in-out infinite',
                  animationDelay: `${i * 0.15}s`,
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Suggested prompts on fresh chat */}
        {messages.length === 1 && !isLoading && (
          <div style={{ marginTop: 8 }}>
            <p style={{
              fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
            }}>
              Try asking
            </p>
            <SuggestedPrompts
              prompts={character.suggested}
              onSelect={p => setInput(p)}
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '10px 12px', borderTop: '1px solid var(--border)',
        display: 'flex', gap: 8,
      }}>
        <VoiceButton 
          onTranscript={(text) => setInput(text)} 
          disabled={isLoading}
        />
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e as any)
            }
          }}
          placeholder={`Ask ${character.name} anything...`}
          style={{
            flex: 1, background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 8, padding: '9px 12px',
            fontSize: 13, color: 'var(--text)', outline: 'none',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = character.color }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
        />
        <button
          onClick={e => {
            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(6)
            handleSubmit(e as any)
          }}
          disabled={isLoading || !input.trim()}
          style={{
            background: 'var(--green)', color: '#fff', border: 'none',
            borderRadius: 8, padding: '9px 16px', fontSize: 13,
            fontWeight: 600, cursor: 'pointer', flexShrink: 0,
            opacity: (isLoading || !input.trim()) ? 0.5 : 1,
          }}
        >
          {isLoading ? '...' : 'Send →'}
        </button>
      </div>

      {/* Footer with debug info */}
      <div style={{
        padding: '5px 12px', borderTop: '1px solid var(--border)',
        fontSize: 10, color: 'var(--text-3)', textAlign: 'center',
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>Powered by Groq · {character.model}</span>
        <a
          href="/api/debug/keys"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--text-3)', textDecoration: 'none' }}
        >
          Check API status →
        </a>
      </div>
    </div>
  )
}
