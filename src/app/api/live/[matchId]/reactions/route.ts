import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export const runtime = 'edge'

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

    const key = `reactions:${matchId}:${reaction}`
    const newCount = await redis.incr(key)

    // Set 7-day expiry on first increment
    await redis.expire(key, 7 * 24 * 60 * 60)

    return NextResponse.json({ reaction, count: newCount })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params
  try {
    const [hype, shock, drama] = await Promise.all([
      redis.get<number>(`reactions:${matchId}:hype`),
      redis.get<number>(`reactions:${matchId}:shock`),
      redis.get<number>(`reactions:${matchId}:drama`),
    ])

    return NextResponse.json({
      hype: hype ?? 0,
      shock: shock ?? 0,
      drama: drama ?? 0,
    })
  } catch {
    return NextResponse.json({ hype: 0, shock: 0, drama: 0 })
  }
}
