'use client'
import { useState } from 'react'
import type { Goal } from '@/types'

interface GoalCardProps {
  goal: Goal
}

export function GoalCard({ goal }: GoalCardProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div
      className="animate-fadeup"
      style={{
        marginBottom: 12,
        borderLeft: '3px solid var(--green)',
        borderRadius: '0 12px 12px 0',
        background: 'rgba(22,163,74,0.05)',
        border: '1px solid rgba(22,163,74,0.15)',
        overflow: 'hidden',
      }}
    >
      {/* Goal header */}
      <div style={{
        padding: '8px 12px',
        display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: '1px solid rgba(22,163,74,0.1)',
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--green)', display: 'inline-block',
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: 11, fontWeight: 700, color: 'var(--green)',
          flex: 1,
        }}>
          ⚽ GOAL — {goal.minute}' — {goal.scorer} ({goal.teamCode} {goal.homeScore}–{goal.awayScore})
        </span>
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-3)', fontSize: 12, padding: 2,
          }}
        >
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {expanded && goal.explainer && (
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>

          {/* El Maestro response */}
          <AgentResponse
            monogram="EM"
            name="El Maestro"
            color="#1e3a5f"
            text={goal.explainer.maestro}
          />

          {/* The Voice response */}
          <AgentResponse
            monogram="CV"
            name="The Voice"
            color="#7c1d2e"
            text={goal.explainer.voice}
          />

        </div>
      )}
    </div>
  )
}

interface AgentResponseProps {
  monogram: string
  name: string
  color: string
  text: string
}

function AgentResponse({ monogram, name, color, text }: AgentResponseProps) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 12px',
    }}>
      {/* Agent label */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6,
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          background: color,
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 9, color: 'rgba(255,255,255,0.85)',
          flexShrink: 0,
        }}>
          {monogram}
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)' }}>
          {name}
        </span>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65, margin: 0 }}>
        {text}
      </p>
    </div>
  )
}
