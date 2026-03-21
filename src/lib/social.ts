// src/lib/social.ts
import type { SocialPost } from '@/types'

const REDDIT_UA = 'KickoffTo/1.0 (contact: hello@kickoffto.com)'

// ── Reddit — PRIMARY source (always football-specific) ─────
const FOOTBALL_SUBREDDITS = [
  { sub: 'worldcup',  hot: true },
  { sub: 'soccer',    hot: true },
  { sub: 'football',  hot: true },
]

async function fetchRedditSub(
  sub: string,
  hot: boolean
): Promise<SocialPost[]> {
  const url = hot
    ? `https://www.reddit.com/r/${sub}/hot.json?limit=15`
    : `https://www.reddit.com/r/${sub}/search.json?q=World+Cup+2026&sort=new&limit=10&restrict_sr=1`

  const res = await fetch(url, {
    headers: { 'User-Agent': REDDIT_UA },
    next: { revalidate: 300 },
  })

  if (!res.ok) throw new Error(`Reddit ${sub} ${res.status}`)

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
          subreddit: string
          url: string
          thumbnail: string
        }
      }>
    }
  }

  return (data?.data?.children ?? []).map(({ data: p }) => ({
    id: `reddit-${p.id}`,
    text: p.title,
    author: `u/${p.author}`,
    created: new Date(p.created_utc * 1000).toISOString(),
    source: 'reddit' as const,
    url: `https://reddit.com${p.permalink}`,
    score: p.score,
    subreddit: p.subreddit,
  }))
}

async function fetchReddit(): Promise<SocialPost[]> {
  const results = await Promise.allSettled(
    FOOTBALL_SUBREDDITS.map(({ sub, hot }) => fetchRedditSub(sub, hot))
  )

  const posts: SocialPost[] = []
  results.forEach(r => {
    if (r.status === 'fulfilled') posts.push(...r.value)
  })

  // Deduplicate by id, sort by date
  const seen = new Set<string>()
  return posts
    .filter(p => {
      if (seen.has(p.id)) return false
      seen.add(p.id)
      return true
    })
    .sort((a, b) =>
      new Date(b.created).getTime() - new Date(a.created).getTime()
    )
}

// ── NewsData.io — SECONDARY, football-filtered ─────────────
async function fetchNews(): Promise<SocialPost[]> {
  const apiKey = process.env.NEWS_API_KEY_1
    ?? process.env.NEWS_API_KEY_2
    ?? process.env.NEWS_API_KEY_3

  if (!apiKey) return []

  // Strict football query — filters out athletics, rugby etc
  const query = encodeURIComponent('World Cup 2026 football soccer FIFA')
  const url = `https://newsdata.io/api/1/news`
    + `?apikey=${apiKey}`
    + `&q=${query}`
    + `&language=en`
    + `&category=sports`
    + `&size=8`

  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 600 }, // 10 min cache for news
    })

    if (!res.ok) return []

    const data = await res.json() as {
      status: string
      results?: Array<{
        article_id: string
        title: string
        description: string | null
        link: string
        source_name: string
        pubDate: string
        keywords?: string[] | null
      }>
    }

    if (data.status !== 'success' || !data.results) return []

    // Extra filter: must mention football/soccer/FIFA/World Cup in title
    const footballTerms = /football|soccer|fifa|world cup|wc2026|worldcup/i

    return data.results
      .filter(a => footballTerms.test(a.title) || footballTerms.test(a.description ?? ''))
      .map(a => ({
        id: `news-${a.article_id}`,
        text: a.title,
        author: a.source_name,
        created: a.pubDate,
        source: 'news' as const,
        url: a.link,
      }))
  } catch {
    return []
  }
}

// ── Bluesky authenticated — TERTIARY ──────────────────────
async function fetchBluesky(): Promise<SocialPost[]> {
  const identifier = process.env.BLUESKY_IDENTIFIER_1
  const password   = process.env.BLUESKY_APP_PASSWORD_1
  if (!identifier || !password) return []

  try {
    const sessionRes = await fetch(
      'https://bsky.social/xrpc/com.atproto.server.createSession',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
        next: { revalidate: 0 },
      }
    )
    if (!sessionRes.ok) return []
    const { accessJwt } = await sessionRes.json() as { accessJwt: string }

    const searchRes = await fetch(
      'https://bsky.social/xrpc/app.bsky.feed.searchPosts'
        + '?q=%23WorldCup2026&limit=20&sort=latest',
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
      id: `bsky-${p.uri}`,
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
export async function getSocialPosts(
  _query: string = '#WC2026'
): Promise<SocialPost[]> {
  const [redditResult, newsResult, blueskyResult] = await Promise.allSettled([
    fetchReddit(),
    fetchNews(),
    fetchBluesky(),
  ])

  const posts: SocialPost[] = []

  // Reddit first (most football-specific)
  if (redditResult.status === 'fulfilled') {
    posts.push(...redditResult.value)
  }
  // News second (filtered to football)
  if (newsResult.status === 'fulfilled') {
    posts.push(...newsResult.value)
  }
  // Bluesky third (if available)
  if (blueskyResult.status === 'fulfilled') {
    posts.push(...blueskyResult.value)
  }

  // Sort all by date, deduplicate
  const seen = new Set<string>()
  const sorted = posts
    .filter(p => {
      if (seen.has(p.id)) return false
      seen.add(p.id)
      return true
    })
    .sort((a, b) =>
      new Date(b.created).getTime() - new Date(a.created).getTime()
    )

  // If everything fails, return meaningful empty state
  return sorted
}
