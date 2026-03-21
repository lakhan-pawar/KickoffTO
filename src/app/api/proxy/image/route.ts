// src/app/api/proxy/image/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url')

    if (!url) {
        return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
    }

    // Only allow TheSportsDB images
    if (!url.startsWith('https://r2.thesportsdb.com/')) {
        return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 })
    }

    try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Upstream error ${res.status}`)

        const buffer = await res.arrayBuffer()
        const contentType = res.headers.get('content-type') ?? 'image/png'

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400',
                'Access-Control-Allow-Origin': '*',
            },
        })
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed'
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}