// src/app/api/director/[matchId]/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { groqChat } from '@/lib/groq'
import { getCache, setCache } from '@/lib/redis'

export const runtime = 'edge'

const GENRE_PROMPTS: Record<string, string> = {
  horror: `You are a horror screenwriter. Write the match as a terrifying horror story.
Use EXACTLY these speaker tags on new lines:
[NARRATOR] for atmospheric narration
[PLAYER] when a player speaks (use their real name in parentheses after: [PLAYER:Messi])
[KEEPER] for the goalkeeper's terrified inner monologue
[CROWD] for crowd whispers

Format STRICTLY like this:
[NARRATOR] The stadium lights flickered as darkness crept across the pitch.
[PLAYER:Messi] Something is wrong here. The ball... it breathes.
[KEEPER] I cannot stop it. No one can stop it.
[NARRATOR] And then the goal came.

3-4 exchanges. Use actual player names from the match. Be genuinely frightening.`,

  romance: `You are a romantic screenwriter. Write the match as a sweeping love story.
Use EXACTLY these speaker tags:
[NARRATOR] for poetic narration
[PLAYER] when a player speaks (yearning, passionate. e.g. [PLAYER:Ronaldo])
[COACH] for the wise mentor figure

Format strictly with tags on new lines. 3-4 exchanges. Use real player names.`,

  heist: `You are a crime writer. Write the match as an Ocean's Eleven-style heist.
Use EXACTLY these speaker tags:
[NARRATOR] for slick narration
[MASTERMIND] the captain giving orders (use real captain name: [MASTERMIND:Name])
[LOOKOUT] the winger calling plays (e.g. [LOOKOUT:Name])
[SAFE] the goalkeeper as the vault

Format strictly with tags. 3-4 exchanges. Use real player names.`,

  scifi: `You are a sci-fi writer. Write the match as an epic space battle.
Use EXACTLY these speaker tags:
[NARRATOR] for epic space narration
[COMMANDER] the captain as starship commander (e.g. [COMMANDER:Name])
[ANDROID] an android player giving data readouts (e.g. [ANDROID:Name])
[CONTROL] mission control commentary

Format strictly with tags. 3-4 exchanges. Use real player names.`,

  western: `You are a western writer. Write the match as a frontier showdown.
Use EXACTLY these speaker tags:
[NARRATOR] for dusty western narration
[SHERIFF] the captain as lawman (e.g. [SHERIFF:Name])
[OUTLAW] the opposing striker as outlaw (e.g. [OUTLAW:Name])
[BARKEEP] neutral observer commentary

Format strictly with tags. 3-4 exchanges. Use real player names.`,

  comedy: `You are a comedy writer. Write the match as a hilarious farce.
Use EXACTLY these speaker tags:
[NARRATOR] for exasperated narration
[CONFUSED] a player who has no idea what's happening (e.g. [CONFUSED:Name])
[REFEREE] the hapless referee
[FAN] an absurd fan commentary

Format strictly with tags. 3-4 exchanges. Use real player names.`,
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
