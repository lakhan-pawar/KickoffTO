import { NextRequest, NextResponse } from 'next/server'
import { groqChat } from '@/lib/groq'
import { getCache, setCache } from '@/lib/redis'

export const runtime = 'edge'

const GENRE_PROMPTS: Record<string, string> = {
  horror: `You are a horror screenplay writer. Retell this football match as a terrifying horror story. The stadium is an eerie place, the crowd a faceless mob, goals are shocking moments of dread. Use screenplay format: scene headings in CAPS, action lines, character names in CAPS before dialogue. 300 words max.`,
  romance: `You are a romantic screenplay writer. Retell this football match as a sweeping romance. Players fall for the game, the crowd is the backdrop, goals are moments of pure joy. Screenplay format. 300 words max.`,
  heist: `You are a heist thriller screenplay writer. Retell this football match as a sophisticated heist. The team is a crew, the goal is the vault, the tactics are the plan. Screenplay format. 300 words max.`,
  scifi: `You are a sci-fi screenplay writer. Retell this football match set in the far future. Players are enhanced humans or AIs, the stadium is on another planet, goals involve advanced technology. Screenplay format. 300 words max.`,
  western: `You are a western screenplay writer. Retell this football match as a western showdown. The pitch is Main Street, the managers are sheriffs, goals are gunfights. Screenplay format. 300 words max.`,
  comedy: `You are a comedy screenplay writer. Retell this football match as a slapstick comedy. Everything goes wrong in the most absurd ways, VAR decisions are comedic disasters, goals happen by accident. Screenplay format. 300 words max.`,
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params
    const { genre, match } = await request.json()

    if (!GENRE_PROMPTS[genre]) {
      return NextResponse.json({ error: 'Invalid genre' }, { status: 400 })
    }

    // Check cache
    const cacheKey = `director:${matchId}:${genre}`
    const cached = await getCache<{ script: string }>(cacheKey)
    if (cached) return NextResponse.json(cached)

    const systemPrompt = GENRE_PROMPTS[genre]

    const userPrompt = `Match: ${match.homeTeam} ${match.homeScore}–${match.awayScore} ${match.awayTeam}
Venue: ${match.venue}
Key events:
${match.events.map((e: any) =>
  `- ${e.minute}': ${e.type === 'goal' ? '⚽ GOAL' : e.type.toUpperCase()} — ${e.player} (${e.team}) — ${e.detail}`
).join('\n')}

Write the screenplay now. Use proper screenplay format.
Start with FADE IN: and end with FADE OUT.
Include at least 3 scenes. Name characters after the actual players.`

    const script = await groqChat(
      [{ role: 'user', content: userPrompt }],
      'llama-3.3-70b-versatile',
      700,
      systemPrompt,
    )

    const result = { script: script.trim(), genre, matchId }

    // Cache permanently — same match + genre always gives same script
    await setCache(cacheKey, result)

    return NextResponse.json(result)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
