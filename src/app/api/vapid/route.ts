import { NextResponse } from 'next/server'
export const runtime = 'edge'
export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!publicKey) {
    return NextResponse.json(
      { error: 'VAPID keys not configured. Run: npx web-push generate-vapid-keys' },
      { status: 500 }
    )
  }
  return NextResponse.json({ publicKey })
}
