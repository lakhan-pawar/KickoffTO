// src/lib/social.ts
import type { SocialPost } from '@/types'

const REDDIT_UA = 'KickoffTo/1.0 (contact: hello@kickoffto.com)'

// ── NewsData.io — primary source ──────────────────────────
async function fetchNews(): Promise<SocialPost[]> {
  const apiKey = process.env.NEWS_API_KEY_1
    ?? process.env.NEWS_API_KEY_2
    ?? process.env.NEWS_API_KEY_3

  if (!apiKey) throw new Error('No NewsData API key')

  // Broaden query for better coverage
  const url = `https://newsdata.io/api/1/news`
    + `?apikey=${apiKey}`
    + `&q=FIFA+World+Cup+2026+OR+WC2026+OR+CONCACAF`
    + `&language=en`
    + `&category=sports`
    + `&size=10`

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

  return (data.results ?? []).map(a => ({
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
  const subreddits = ['worldcup', 'soccer', 'ussoccer', 'CanadaSoccer']
  const posts: SocialPost[] = []

  // Fetch 'hot' for each subreddit for guaranteed content
  for (const sub of subreddits) {
    try {
      const url = `https://www.reddit.com/r/${sub}/hot.json?limit=10`
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
      // continue
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
