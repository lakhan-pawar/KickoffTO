import { streamText, createDataStreamResponse, formatDataStreamPart } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { NextRequest } from 'next/server'
import { agentChatLimiter } from '@/lib/redis'
import { CHARACTER_MAP } from '@/lib/constants'
import { buildCharacterSystemPrompt } from '@/lib/groq'

export const runtime = 'edge'
export const maxDuration = 30

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  // 1. Find character
  const character = CHARACTER_MAP.get(id)
  if (!character) {
    return new Response(
      JSON.stringify({ error: `Character "${id}" not found` }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // 2. Check API keys loaded
  const groqKeys = [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
  ].filter(Boolean) as string[]

  if (groqKeys.length === 0) {
    return new Response(
      JSON.stringify({
        error: 'No Groq API keys configured. Add GROQ_API_KEY_1 to Vercel environment variables.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // 3. Rate limit
  const ip = request.headers.get('x-forwarded-for')
    ?? request.headers.get('x-real-ip')
    ?? 'unknown'

  try {
    const { success, reset } = await agentChatLimiter.limit(`chat:${ip}`)
    if (!success) {
      return new Response(
        JSON.stringify({
          error: `Rate limit exceeded. Wait until ${new Date(reset).toLocaleTimeString()}.`,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Reset': String(reset),
          },
        }
      )
    }
  } catch (redisErr) {
    // Redis rate limit failed — allow the request but log it
    console.error('Rate limit check failed:', redisErr)
  }

  // 4. Parse messages
  let messages: any[]
  try {
    const body = await request.json()
    messages = body.messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages array' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // 5. Try each Groq key
  const keyIndex = Math.floor(Date.now() / 60000) % groqKeys.length
  const orderedKeys = [
    ...groqKeys.slice(keyIndex),
    ...groqKeys.slice(0, keyIndex),
  ]

  let lastError: string = ''

  for (const apiKey of orderedKeys) {
    try {
      const groq = createGroq({ apiKey })
      const result = streamText({
        model: groq(character.model) as any,
        system: buildCharacterSystemPrompt(character),
        messages,
        maxTokens: 300,
        temperature: 0.8,
      })
      return result.toDataStreamResponse()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      lastError = msg
      console.error(`Groq key failed: ${msg}`)

      // If it's a 401/403 (bad key) or 429 (rate limit) try next key
      if (msg.includes('401') || msg.includes('403') || msg.includes('429')) {
        continue
      }
      // For other errors, break immediately
      break
    }
  }

  // 6. All keys failed — return character-specific mock in stream format
  const mockResponses: Record<string, string> = {
    'el-maestro': 'The tactical analysis is temporarily unavailable. Please try again — the pressing triggers need a moment to recalibrate.',
    'xg-oracle': 'The xG model is temporarily offline. The statistics will resume momentarily.',
    'the-voice': 'I am momentarily speechless. An unprecedented occurrence. The commentary will return.',
    'ultra': 'The servers are being ROBBED right now! Back in a moment!',
    'aria-9': 'Processing capacity temporarily exceeded, Operator. Standby for reconnection.',
    'coach-believe': 'Even the servers need to believe sometimes! Try again — I promise it will work!',
    'var-review': 'Connection under review. Under Law 17, play may be temporarily suspended.',
    'the-archive': 'The Archive is momentarily closed for cataloguing. Return shortly.',
    'talentspotter': 'Scout network temporarily offline. The talent identification will resume.',
    'fpl-guru': 'FPL servers overloaded — probably because everyone is captaining the same player. Try again.',
    'chef-fury': 'This connection is DISGUSTING. RAW. Completely RAW. Try again.',
    'consulting-mind': 'The network, my friend, is temporarily impeding my deductions. Elementary solution: try again.',
    'multiverse': 'In 9,847 of the timelines I observe, this connection works. Try again.',
    'psychologist': 'The connection anxiety is real. But manageable. Try once more.',
    'canvas': 'Even the most beautiful paintings need a second coat. Try again.',
    'antagonist': 'Of course the connection failed. I predicted this. Try again — I dare you.',
  }

  const mockMsg = mockResponses[id]
    ?? `${character.name} is temporarily unavailable. Error: ${lastError}. Please try again.`

  // Return in data stream format so useChat adds it to messages
  return createDataStreamResponse({
    execute: (dataStream) => {
      dataStream.write(formatDataStreamPart('text', mockMsg))
    },
  })
}
