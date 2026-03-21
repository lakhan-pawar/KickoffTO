// src/app/api/debug/reddit/route.ts
import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  const results: Record<string, unknown> = {}

  const feeds = [
    { name: 'worldcup_rss',  url: 'https://www.reddit.com/r/worldcup/.rss' },
    { name: 'soccer_search', url: 'https://www.reddit.com/r/soccer/search.rss?q=World+Cup+2026&sort=new&restrict_sr=1' },
  ]

  for (const { name, url } of feeds) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'KickoffTo/1.0 WC2026 fan app (by /u/kickoffto)',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        },
      })

      const text = await res.text()
      const entries = (text.match(/<entry>/g) ?? []).length
      const items   = (text.match(/<item>/g) ?? []).length

      // Extract first title to confirm real data
      const firstTitle = text.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
        ?? text.match(/<title[^>]*>(.*?)<\/title>/)?.[1]
        ?? 'no title found'

      results[name] = {
        status: res.status,
        ok: res.ok,
        entries,
        items,
        totalBlocks: entries + items,
        firstTitle: firstTitle.slice(0, 80),
        contentType: res.headers.get('content-type'),
        bodyPreview: text.slice(0, 200),
      }
    } catch (err: unknown) {
      results[name] = {
        error: err instanceof Error ? err.message : 'fetch failed',
      }
    }
  }

  return NextResponse.json(results)
}
