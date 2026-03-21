// Match types
export interface Match {
  id: string
  homeTeam: Team
  awayTeam: Team
  homeScore: number | null
  awayScore: number | null
  status: 'scheduled' | 'live' | 'finished' | 'postponed'
  minute: number | null
  round: string
  venue: string
  kickoff: string // ISO date string
  intensity: 'normal' | 'big' | 'historic' // for emotion-tier animations
  events?: MatchEvent[]
}

export interface MatchEvent {
  minute: number
  type: 'goal' | 'yellow' | 'red' | 'sub' | 'var'
  team: 'home' | 'away'
  player: string
  detail?: string
}

export interface Team {
  id: string
  name: string
  shortName: string
  code: string // e.g. "ARG"
  flag: string // emoji e.g. "🇦🇷"
  kitColors: { home: string[]; away: string[] }
  confederation: 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC'
}

export interface Player {
  id: string
  name: string
  position: 'GK' | 'DEF' | 'MID' | 'ATT'
  nationality: string
  flag: string
  club: string
  photo: string | null
  stats: {
    goals: number
    assists: number
    appearances: number
    rating: number | null
  }
}

// Goal types
export interface Goal {
  id: string
  matchId: string
  minute: number
  scorer: string
  team: string
  teamCode: string
  homeScore: number
  awayScore: number
  explainer?: {
    maestro: string   // El Maestro tactical analysis
    voice: string     // The Voice dramatic narration
    generatedAt: string
  }
}

// Social types
export interface SocialPost {
  id: string
  text: string
  author: string
  created: string
  source: 'bluesky' | 'reddit' | 'news'
  url: string
  score?: number // reddit upvotes
}

// Character types
export type CharacterTier = 'Strategy' | 'Data' | 'Entertainment'
export type CharacterPhase = 1 | 2 | 3

export interface Character {
  id: string
  name: string
  monogram: string
  icon?: string   // 2-letter e.g. "EM"
  role: string
  tier: CharacterTier
  phase: CharacterPhase
  color: string      // identity hex e.g. "#1e3a5f"
  model: 'llama-3.3-70b-versatile' | 'llama-3.1-8b-instant' | 'mixtral-8x7b-32768'
  bio: string
  welcome: string
  suggested: string[]
  voiceId: string    // Gemini Live API voice name
}

// AI types
export interface AIResponse {
  content: string
  model: string
  provider: 'groq' | 'gemini' | 'mock'
  cached: boolean
}

// WC History
export interface WorldCup {
  year: number
  host: string
  winner: string
  winnerFlag: string
  finalScore: string
  topScorer: string
  teams: number
  narrative: string  // The Archive's voice
}
