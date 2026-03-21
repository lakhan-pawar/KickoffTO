'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { ScoreHeader } from './ScoreHeader'
import { MomentumBar } from './MomentumBar'
import { GoalCard } from './GoalCard'
import { ReactionStrip } from './ReactionStrip'
import { LiveTabs } from './LiveTabs'
import { MatchStats } from './MatchStats'
import { RadioPanel } from './RadioPanel'
import { MiniPlayer } from '@/components/ui/MiniPlayer'
import { MatchDNA } from './MatchDNA'
import type { Match, Goal } from '@/types'

interface LiveMatchRoomProps {
  match: Match
}

export function LiveMatchRoom({ match }: LiveMatchRoomProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [activeTab, setActiveTab] = useState<'ai' | 'reactions' | 'stats' | 'radio'>('ai')
  const [momentum, setMomentum] = useState(0.5) // 0 = full home, 1 = full away
  const [isPolling, setIsPolling] = useState(match.status === 'live')
  const [liveMatch, setLiveMatch] = useState(match)
  const lastGoalCount = useRef(0)

  // Poll for match events every 30s when live
  useEffect(() => {
    if (!isPolling) return

    async function pollEvents() {
      try {
        const res = await fetch(`/api/live/${match.id}/events`)
        if (!res.ok) return
        const data = await res.json()

        // Update score
        if (data.match) setLiveMatch(data.match)

        // Detect new goals
        if (data.goals && data.goals.length > lastGoalCount.current) {
          setGoals(data.goals)
          lastGoalCount.current = data.goals.length
        }

        // Update momentum
        if (data.momentum !== undefined) setMomentum(data.momentum)
        
        // Update events
        if (data.events) {
          setLiveMatch(prev => ({ ...prev, events: data.events }))
        }
      } catch {
        // Silent fail — keep polling
      }
    }

    pollEvents()
    const interval = setInterval(pollEvents, 30000)
    return () => clearInterval(interval)
  }, [match.id, isPolling])

  // Mock goals for development
  useEffect(() => {
    if (goals.length === 0) {
      setGoals([
        {
          id: 'goal-1',
          matchId: match.id,
          minute: 67,
          scorer: 'L. Messi',
          team: 'Argentina',
          teamCode: 'ARG',
          homeScore: 2,
          awayScore: 1,
          explainer: {
            maestro: "Argentina exploited the gap behind France's high defensive line perfectly. Enzo Fernández's through ball split the midfield — the spacing was clinical. France left exactly the corridor El Maestro predicted they would.",
            voice: "He's done it AGAIN. The number ten. The eternal number ten. At sixty-seven minutes, Lionel Messi has written another line into the greatest story football has ever told.",
            generatedAt: new Date().toISOString(),
          },
        },
      ])
    }
    
    // Mock events
    if (!liveMatch.events) {
      setLiveMatch(prev => ({
        ...prev,
        events: [
          { minute: 23, type: 'goal', team: 'home', player: 'L. Messi', detail: 'Left foot, 18 yards' },
          { minute: 45, type: 'goal', team: 'away', player: 'K. Mbappé', detail: 'Counter-attack' },
          { minute: 67, type: 'goal', team: 'home', player: 'L. Messi', detail: 'Penalty' },
          { minute: 78, type: 'yellow', team: 'away', player: 'A. Tchouaméni', detail: 'Tactical foul' },
        ]
      }))
    }
  }, [])

  return (
    <div>
      {/* Score header — sticky */}
      <div style={{ position: 'sticky', top: 64, zIndex: 90 }}>
        <ScoreHeader match={liveMatch} />
      </div>

      {/* Momentum bar */}
      <MomentumBar
        homeTeam={liveMatch.homeTeam}
        awayTeam={liveMatch.awayTeam}
        momentum={momentum}
      />

      {/* Tab bar */}
      <LiveTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab content */}
      <div style={{ minHeight: 400 }}>

        {/* AI Commentary tab */}
        {activeTab === 'ai' && (
          <div style={{ padding: '12px 16px' }}>
            {goals.length > 0 ? (
              goals.slice().reverse().map(goal => (
                <GoalCard key={goal.id} goal={goal} />
              ))
            ) : (
              <div style={{
                textAlign: 'center', padding: '40px 20px',
                color: 'var(--text-3)', fontSize: 13,
              }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⚽</div>
                AI commentary appears here when goals are scored.
                <br />Checking for events every 30 seconds.
              </div>
            )}
          </div>
        )}

        {/* Reactions tab */}
        {activeTab === 'reactions' && (
          <ReactionStrip matchId={match.id} expanded />
        )}

        {/* Stats tab */}
        {activeTab === 'stats' && (
          <>
            <MatchDNA
              events={liveMatch.events ?? []}
              homeTeam={{ ...liveMatch.homeTeam, color: liveMatch.homeTeam.kitColors.home[0], flag: liveMatch.homeTeam.flag }}
              awayTeam={{ ...liveMatch.awayTeam, color: liveMatch.awayTeam.kitColors.home[0], flag: liveMatch.awayTeam.flag }}
              duration={liveMatch.minute ?? 90}
            />
            <MatchStats matchId={match.id} />
          </>
        )}

        {/* Radio tab */}
        {activeTab === 'radio' && (
          <RadioPanel matchId={match.id} match={liveMatch} />
        )}

      </div>

      {/* Always-visible reaction strip */}
      {liveMatch.status === 'live' && (
        <div style={{
          position: 'sticky', bottom: 100,
          padding: '0 16px',
          zIndex: 80,
        }}>
          <ReactionStrip matchId={match.id} expanded={false} />
        </div>
      )}

      {/* Mini player */}
      <MiniPlayer match={liveMatch.status === 'live' ? liveMatch : null} />
    </div>
  )
}
