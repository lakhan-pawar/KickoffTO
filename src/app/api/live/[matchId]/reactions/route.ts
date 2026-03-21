import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params

  try {
    const [hype, shock, drama] = await Promise.all([
      redis.get(`reaction:${matchId}:hype`),
      redis.get(`reaction:${matchId}:shock`),
      redis.get(`reaction:${matchId}:drama`),
    ])

    return NextResponse.json({
      hype: Number(hype) || 0,
      shock: Number(shock) || 0,
      drama: Number(drama) || 0,
    })
  } catch {
    return NextResponse.json({ hype: 0, shock: 0, drama: 0 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params

  try {
    const { reaction } = await request.json()

    if (!['hype', 'shock', 'drama'].includes(reaction)) {
      return NextResponse.json({ error: 'Invalid reaction' }, { status: 400 })
    }

    // Increment counter
    const key = `reaction:${matchId}:${reaction}`
    const newCount = await redis.incr(key)

    // Set expiry of 48 hours if this is the first increment
    if (newCount === 1) {
      await redis.expire(key, 172800)
    }

    return NextResponse.json({ [reaction]: newCount })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
