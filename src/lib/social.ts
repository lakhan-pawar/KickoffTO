// src/lib/social.ts
import type { SocialPost } from '@/types'

const REDDIT_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// ── Reddit — PRIMARY source (always football-specific) ─────
const FOOTBALL_SUBREDDITS = [
  { sub: 'worldcup',      hot: true },
  { sub: 'soccer',        hot: true },
  { sub: 'football',      hot: true },
  { sub: 'premierleague', hot: true },
]

async function fetchReddit(): Promise<SocialPost[]> {
  const RSS_FEEDS = [
    {
      url: 'https://www.reddit.com/r/worldcup/.rss',
      sub: 'worldcup',
    },
    {
      url: 'https://www.reddit.com/r/soccer/search.rss?q=World+Cup+2026&sort=new&restrict_sr=1',
      sub: 'soccer',
    },
    {
      url: 'https://www.reddit.com/r/football/search.rss?q=World+Cup+2026&sort=new&restrict_sr=1',
      sub: 'football',
    },
  ]

  const posts: SocialPost[] = []

  await Promise.allSettled(RSS_FEEDS.map(async ({ url, sub }) => {
    try {
      const res = await fetch(url, {
        headers: {
          // Reddit requires descriptive User-Agent for RSS too
          'User-Agent': 'KickoffTo/1.0 WC2026 fan app (by /u/kickoffto)',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        },
        next: { revalidate: 300 },
      })

      if (!res.ok) return

      const xml = await res.text()

      // Parse RSS with regex — no XML parser needed
      // Extract <entry> blocks (Reddit uses Atom format)
      const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) ?? []

      // Also try <item> blocks (standard RSS format)
      const items = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? []

      const blocks = entries.length > 0 ? entries : items

      for (const block of blocks.slice(0, 15)) {
        // Extract title
        const titleMatch = block.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>/)
          ?? block.match(/<title[^>]*>(.*?)<\/title>/)
        const title = titleMatch?.[1]?.trim()
        if (!title) continue

        // Extract link
        const linkMatch = block.match(/<link[^>]*href="([^"]+)"/)
          ?? block.match(/<link>(.*?)<\/link>/)
          ?? block.match(/<id>(https?:\/\/[^<]+)<\/id>/)
        const link = linkMatch?.[1]?.trim()

        // Extract author
        const authorMatch = block.match(/<author[^>]*>[\s\S]*?<name>(.*?)<\/name>/)
          ?? block.match(/<dc:creator><!\[CDATA\[(.*?)\]\]><\/dc:creator>/)
          ?? block.match(/<dc:creator>(.*?)<\/dc:creator>/)
        const author = authorMatch?.[1]?.trim() ?? `r/${sub}`

        // Extract date
        const dateMatch = block.match(/<published>(.*?)<\/published>/)
          ?? block.match(/<updated>(.*?)<\/updated>/)
          ?? block.match(/<pubDate>(.*?)<\/pubDate>/)
        const dateStr = dateMatch?.[1]?.trim()
        const created = dateStr
          ? new Date(dateStr).toISOString()
          : new Date().toISOString()

        // Generate stable ID from link or title
        const id = `reddit-${(link ?? title).replace(/[^a-z0-9]/gi, '').slice(0, 32)}`

        posts.push({
          id,
          text: title
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'"),
          author: author.startsWith('/u/') ? author : `/u/${author}`,
          created,
          source: 'reddit',
          url: link ?? `https://reddit.com/r/${sub}`,
          subreddit: sub,
        })
      }
    } catch {
      // Silently skip failed feed
    }
  }))

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
