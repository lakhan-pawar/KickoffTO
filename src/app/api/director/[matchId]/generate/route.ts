// src/app/api/director/[matchId]/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { groqChat } from '@/lib/groq'
import { getCache, setCache } from '@/lib/redis'

export const runtime = 'edge'

const GENRE_PROMPTS: Record<string, string> = {
  horror: `You are narrating a horror audio drama about a football match.
Write as PROSE NARRATION with character dialogue. NO screenplay format.
NO: FADE IN, CUT TO, INT., EXT., (stage directions), ALL CAPS SCENE HEADINGS.

Use EXACTLY these speaker tags inline:
[NARRATOR] for atmospheric narration (2-3 sentences)
[PLAYER:Name] when a specific player speaks (short, fearful line)
[KEEPER] for the goalkeeper's terrified thoughts

EXAMPLE FORMAT:
[NARRATOR] The stadium fell silent as fog crept across the pitch. Something was wrong — the ball pulsed with a dark energy that no one could explain.
[PLAYER:Messi] The ball... it called to me. I could hear it whispering my name.
[NARRATOR] He struck it. The net rippled. But the goalkeeper never moved.
[KEEPER] I wanted to dive. My body simply refused.

Write 4-5 exchanges. Use the ACTUAL player names from this match. Be genuinely eerie and atmospheric. Prose only — no screenplay directions.`,

  romance: `You are narrating a romantic audio drama about a football match.
Write as PROSE NARRATION with character dialogue. NO screenplay format.
NO: FADE IN, CUT TO, INT., EXT., (stage directions), ALL CAPS SCENE HEADINGS.

Use EXACTLY these speaker tags:
[NARRATOR] for poetic, sweeping narration
[PLAYER:Name] for passionate, yearning dialogue from specific players
[COACH] for wise mentor observations

EXAMPLE FORMAT:
[NARRATOR] Under the floodlights, two teams danced the oldest dance — the pursuit of something just out of reach.
[PLAYER:Messi] Every touch of the ball tonight felt like a conversation with fate.
[NARRATOR] And when the goal came, it was not a strike — it was a declaration.

Write 4-5 exchanges. Use actual player names. Poetic and emotional prose only.`,

  heist: `You are narrating a heist thriller audio drama about a football match.
Write as PROSE NARRATION with character dialogue. NO screenplay format.
NO: FADE IN, CUT TO, INT., EXT., (stage directions), ALL CAPS SCENE HEADINGS.

Use EXACTLY these speaker tags:
[NARRATOR] for slick, tense narration
[MASTERMIND:Name] the captain giving tactical orders
[LOOKOUT:Name] the winger calling positions
[SAFE:Name] the goalkeeper as the vault being cracked

EXAMPLE FORMAT:
[NARRATOR] The plan had been months in the making. Sixty thousand witnesses, and not one of them would see it coming.
[MASTERMIND:Messi] Positions. We go in sixty seconds. Remember — the keeper always moves left.
[LOOKOUT:Mbappé] South corridor clear. They have no idea.
[NARRATOR] The pass was surgical. The finish, inevitable.

Write 4-5 exchanges. Use actual player names. Sharp and tense prose only.`,

  scifi: `You are narrating a science fiction audio drama about a football match.
Write as PROSE NARRATION with character dialogue. NO screenplay format.
NO: FADE IN, CUT TO, INT., EXT., (stage directions), ALL CAPS SCENE HEADINGS.

Use EXACTLY these speaker tags:
[NARRATOR] for epic, cosmic narration
[COMMANDER:Name] the captain as starship commander
[ANDROID:Name] an android player giving data readouts
[CONTROL] mission control commentary

EXAMPLE FORMAT:
[NARRATOR] Stardate 2026. Two civilisations meet on the neutral ground of MetLife Station, their conflict watched by four billion across seventeen systems.
[COMMANDER:Messi] Shields at maximum. We attack in formation delta.
[ANDROID:Mbappé] Probability of success: 94.7 percent. Initiating sequence.
[NARRATOR] The quantum strike folded spacetime. The keeper had no frame of reference in which to react.

Write 4-5 exchanges. Use actual player names. Epic sci-fi prose only.`,

  western: `You are narrating a western audio drama about a football match.
Write as PROSE NARRATION with character dialogue. NO screenplay format.
NO: FADE IN, CUT TO, INT., EXT., (stage directions), ALL CAPS SCENE HEADINGS.

Use EXACTLY these speaker tags:
[NARRATOR] for dusty, sparse western narration
[SHERIFF:Name] the captain as the lawman
[OUTLAW:Name] the opposing striker as the outlaw
[BARKEEP] a neutral observer at the saloon

EXAMPLE FORMAT:
[NARRATOR] The town of MetLife had seen trouble before. But nothing like this. Two strangers, one ball, and a reckoning sixty minutes in the making.
[SHERIFF:Messi] I've been waiting for this moment since sunrise, son.
[OUTLAW:Mbappé] Your move, old man. Town ain't big enough for both our formations.
[NARRATOR] The shot rang out like a gunshot across the prairie. The keeper never stood a chance.

Write 4-5 exchanges. Use actual player names. Spare, tense western prose only.`,

  comedy: `You are narrating a comedy audio drama about a football match.
Write as PROSE NARRATION with character dialogue. NO screenplay format.
NO: FADE IN, CUT TO, INT., EXT., (stage directions), ALL CAPS SCENE HEADINGS.

Use EXACTLY these speaker tags:
[NARRATOR] for exasperated, absurdist narration
[CONFUSED:Name] a bewildered player reacting to chaos
[REFEREE] the hapless, confused referee
[FAN] an increasingly hysterical fan in the stands

EXAMPLE FORMAT:
[NARRATOR] Nobody predicted that the biggest crisis of the match would be a rogue pigeon and a referee who had clearly never watched football before.
[CONFUSED:Messi] Why is there a banana peel on the penalty spot? Why is nobody talking about this?
[REFEREE] I have reviewed the footage seventeen times and I still cannot explain what happened.
[FAN] I paid eight hundred dollars for these seats and I have never been happier.

Write 4-5 exchanges. Use actual player names. Absurd, funny prose only.`,
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
