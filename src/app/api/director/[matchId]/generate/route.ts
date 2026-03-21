// src/app/api/director/[matchId]/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { groqChat } from '@/lib/groq'
import { getCache, setCache } from '@/lib/redis'

export const runtime = 'edge'

const GENRE_PROMPTS: Record<string, string> = {
  horror: `You are a horror screenwriter. Rewrite this football match as a terrifying horror story.
Use dark atmosphere, dread, and suspense. The ball is cursed. The goalkeeper is haunted.
Make it genuinely scary. 3 paragraphs. Cinematic. No football clichés.`,

  romance: `You are a romantic screenwriter. Rewrite this football match as a passionate love story.
Two teams — star-crossed lovers. Goals are stolen kisses. Cards are heartbreaks.
Make it sweeping and emotional. 3 paragraphs. Cinematic.`,

  heist: `You are a crime thriller screenwriter. Rewrite this match as an Ocean's Eleven-style heist.
The stadium is the vault. The ball is the prize. Each goal is a perfectly executed move.
Sharp, clever, stylish. 3 paragraphs. Cinematic.`,

  scifi: `You are a sci-fi screenwriter. Rewrite this match as a battle in the far future.
Players are androids. The pitch is a space station. Goals are quantum events.
Epic and futuristic. 3 paragraphs. Cinematic.`,

  western: `You are a western screenwriter. Rewrite this match as a classic gunfight showdown.
Two rival clans. The stadium is a dusty frontier town. Goals are draws at high noon.
Gritty, tense, sparse dialogue. 3 paragraphs. Cinematic.`,

  comedy: `You are a comedy screenwriter. Rewrite this match as a hilarious farce.
Everything goes wrong in the funniest possible way. The referee is incompetent.
The goalkeepers are terrified of the ball. Absurd and funny. 3 paragraphs.`,
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params

  try {
    const body = await request.json()
    const { genre, match } = body as {
      genre: string
      match: {
        homeTeam: { name: string; flag: string }
        awayTeam: { name: string; flag: string }
        homeScore: number
        awayScore: number
        events: Array<{ minute: number; type: string; player: string; team: string }>
      }
    }

    if (!genre || !match) {
      return NextResponse.json({ error: 'Missing genre or match data' }, { status: 400 })
    }

    // Cache key per match + genre
    const cacheKey = `director:${matchId}:${genre}`
    try {
      const cached = await getCache<{ script: string }>(cacheKey)
      if (cached) return NextResponse.json({ script: cached.script, cached: true })
    } catch {}

    const genrePrompt = GENRE_PROMPTS[genre] ?? GENRE_PROMPTS.heist

    // Build match context
    const eventsText = match.events
      .map(e => `${e.minute}' ${e.type.toUpperCase()} — ${e.player} (${e.team})`)
      .join('\n')

    const matchContext = `
Match: ${match.homeTeam.name} ${match.homeScore} - ${match.awayScore} ${match.awayTeam.name}
Key events:
${eventsText || 'No events recorded yet'}
`

    const screenplay = await groqChat(
      [{
        role: 'user',
        content: `${genrePrompt}

${matchContext}

Write the screenplay now. Start immediately — no preamble.
Use the actual player names and teams but transform the context completely.
3 paragraphs. Vivid and cinematic.`,
      }],
      'llama-3.3-70b-versatile',
      500,
    )

    const result = { script: screenplay.trim(), cached: false }

    try { await setCache(cacheKey, result, 3600) } catch {}

    return NextResponse.json(result)

  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
