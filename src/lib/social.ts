// src/lib/social.ts
import type { SocialPost } from '@/types'

const REDDIT_UA = 'KickoffTo/1.0 (contact: hello@kickoffto.com)'

// ── NewsData.io — primary source ──────────────────────────
async function fetchNews(): Promise<SocialPost[]> {
  const apiKey = process.env.NEWS_API_KEY_1
    ?? process.env.NEWS_API_KEY_2
    ?? process.env.NEWS_API_KEY_3

  if (!apiKey) throw new Error('No NewsData API key')

  // Refined query: specifically FIFA World Cup 2026
  const url = `https://newsdata.io/api/1/news`
    + `?apikey=${apiKey}`
    + `&q="World+Cup+2026"+OR+"FIFA+World+Cup"`
    + `&language=en`
    + `&category=sports`
    + `&size=15`

  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 300 },
  })

  if (!res.ok) throw new Error(`NewsData ${res.status}`)

  const data = await res.json() as {
    status: string
    results: Array<{
      article_id: string
      title: string
      description: string | null
      link: string
      source_name: string
      pubDate: string
    }>
  }

  if (data.status !== 'success') throw new Error('NewsData error')

  return (data.results ?? [])
    .filter(a => a.title.toLowerCase().includes('cup') || a.title.toLowerCase().includes('fifa'))
    .map(a => ({
      id: a.article_id,
      text: a.title + (a.description ? ` — ${a.description}` : ''),
      author: a.source_name,
      created: a.pubDate,
      source: 'news' as const,
      url: a.link,
    }))
}

// ── Reddit r/worldcup — secondary source ──────────────────
async function fetchReddit(): Promise<SocialPost[]> {
  const urls = [
    'https://www.reddit.com/r/worldcup/hot.json?limit=15',
    'https://www.reddit.com/r/soccer/search.json?q=World+Cup+2026&sort=new&limit=15&restrict_sr=1',
    'https://www.reddit.com/r/ussoccer/hot.json?limit=10',
    'https://www.reddit.com/r/CanadaSoccer/hot.json?limit=10',
  ]

  const posts: SocialPost[] = []

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': REDDIT_UA },
        next: { revalidate: 300 },
      })
      if (!res.ok) continue

      const data = await res.json() as {
        data: {
          children: Array<{
            data: {
              id: string
              title: string
              selftext: string
              author: string
              created_utc: number
              permalink: string
              score: number
            }
          }>
        }
      }

      const items = data?.data?.children ?? []
      items.forEach(({ data: p }) => {
        // Basic relevance check for the broader subreddits
        const title = p.title.toLowerCase()
        if (url.includes('soccer') && !title.match(/cup|fifa|2026|mexico|canada|usa|national/)) return

        posts.push({
          id: p.id,
          text: p.title,
          author: `u/${p.author}`,
          created: new Date(p.created_utc * 1000).toISOString(),
          source: 'reddit' as const,
          url: `https://reddit.com${p.permalink}`,
        })
      })
    } catch {
      // continue to next URL
    }
  }

  return posts
}

// ── Bluesky authenticated — tertiary source ────────────────
async function fetchBlueskyAuth(): Promise<SocialPost[]> {
  const identifier = process.env.BLUESKY_IDENTIFIER_1
  const password   = process.env.BLUESKY_APP_PASSWORD_1

  if (!identifier || !password) return []

  try {
    // Create session
    const sessionRes = await fetch(
      'https://bsky.social/xrpc/com.atproto.server.createSession',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      }
    )
    if (!sessionRes.ok) return []

    const { accessJwt } = await sessionRes.json()

    // Search posts
    const searchRes = await fetch(
      `https://bsky.social/xrpc/app.bsky.feed.searchPosts?q=WorldCup2026&limit=20&sort=latest`,
      {
        headers: { Authorization: `Bearer ${accessJwt}` },
        next: { revalidate: 300 },
      }
    )
    if (!searchRes.ok) return []

    const data = await searchRes.json() as {
      posts: Array<{
        uri: string
        record: { text: string }
        author: { handle: string }
        indexedAt: string
      }>
    }

    return (data.posts ?? []).map(p => ({
      id: p.uri,
      text: p.record.text,
      author: p.author.handle,
      created: p.indexedAt,
      source: 'bluesky' as const,
      url: `https://bsky.app/profile/${p.author.handle}/post/${p.uri.split('/').pop()}`,
    }))
  } catch {
    return []
  }
}

// ── Main export ────────────────────────────────────────────
export async function getSocialPosts(query: string): Promise<SocialPost[]> {
  const results = await Promise.allSettled([
    fetchNews(),
    fetchReddit(),
    fetchBlueskyAuth(),
  ])

  const allPosts: SocialPost[] = []

  results.forEach(r => {
    if (r.status === 'fulfilled') {
      allPosts.push(...r.value)
    }
  })

  // Sort by date descending
  allPosts.sort((a, b) =>
    new Date(b.created).getTime() - new Date(a.created).getTime()
  )

  return allPosts
}
