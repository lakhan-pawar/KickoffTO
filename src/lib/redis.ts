import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Rate limiters
export const agentChatLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(15, '1 m'),
  prefix: 'rl:chat',
})

export const councilLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(1, '1 h'),
  prefix: 'rl:council',
})

export const directorLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(3, '1 h'),
  prefix: 'rl:director',
})

// Cache helpers
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get<T>(key)
    return data ?? null
  } catch {
    return null
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds?: number,
): Promise<void> {
  try {
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, value)
    } else {
      await redis.set(key, value)
    }
  } catch {
    // Fail silently — cache is best effort
  }
}

// Cache key constants
export const CACHE_KEYS = {
  goalExplainer: (matchId: string, goalId: string) => `goal:${matchId}:${goalId}`,
  matchPreview: (matchId: string) => `preview:${matchId}`,
  playerScout: (playerId: string) => `scout:player:${playerId}`,
  teamScout: (teamId: string) => `scout:team:${teamId}`,
  trivia: (date: string) => `trivia:${date}`,
  storyChapter: (date: string) => `story:${date}`,
  historyNarration: (year: number) => `history:${year}`,
  socialPulse: () => `social:pulse`,
  liveReactions: (matchId: string) => `reactions:${matchId}`,
  directorMode: (matchId: string, genre: string) => `director:${matchId}:${genre}`,
  cardDescription: (playerId: string) => `card:desc:${playerId}`,
  h2hNarrative: (teamA: string, teamB: string) => {
    const [a, b] = [teamA, teamB].sort()
    return `h2h:${a}:${b}`
  },
}
