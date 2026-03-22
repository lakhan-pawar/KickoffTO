import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  const groqKeys = [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
  ].filter(Boolean)

  const geminiKeys = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
  ].filter(Boolean)

  function maskKey(key: string): string {
    if (!key || key.length < 8) return '❌ NOT SET'
    return `✓ ${key.slice(0, 6)}...${key.slice(-4)}`
  }

  return NextResponse.json({
    groq: groqKeys.length > 0,
    groqKeys: [
      process.env.GROQ_API_KEY_1,
      process.env.GROQ_API_KEY_2,
      process.env.GROQ_API_KEY_3,
    ].map((k, i) => ({
      name: `GROQ_API_KEY_${i + 1}`,
      status: k ? maskKey(k) : '❌ NOT SET',
      loaded: !!k,
    })),
    gemini: geminiKeys.length > 0,
    geminiKeys: [
      process.env.GEMINI_API_KEY_1,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
    ].map((k, i) => ({
      name: `GEMINI_API_KEY_${i + 1}`,
      status: k ? maskKey(k) : '❌ NOT SET',
      loaded: !!k,
    })),
    upstash: {
      redis: !!process.env.UPSTASH_REDIS_REST_URL,
      qstash: !!process.env.QSTASH_TOKEN,
    },
    football: {
      apiFootball: !!(
        process.env.FOOTBALL_API_KEY_1 ||
        process.env.FOOTBALL_API_KEY_2 ||
        process.env.FOOTBALL_API_KEY_3
      ),
      footballData: !!(
        process.env.FOOTBALL_DATA_KEY_1 ||
        process.env.FOOTBALL_DATA_KEY_2 ||
        process.env.FOOTBALL_DATA_KEY_3
      ),
    },

    deepgramTTS: {
      configured: !!(
        process.env.DEEPGRAM_API_KEY_1 ||
        process.env.DEEPGRAM_API_KEY_2
      ),
      keys: [
        { name: 'DEEPGRAM_API_KEY_1', loaded: !!process.env.DEEPGRAM_API_KEY_1 },
        { name: 'DEEPGRAM_API_KEY_2', loaded: !!process.env.DEEPGRAM_API_KEY_2 },
      ],
    },

    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
}
