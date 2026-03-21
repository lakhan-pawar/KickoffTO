import type { SocialPost } from '@/types'
import { REDDIT_SUBREDDITS } from './constants'

const REDDIT_USER_AGENT = process.env.REDDIT_USER_AGENT
  ?? 'KickoffTo/1.0 (contact: hello@kickoffto.com)'

// Primary: Bluesky public search API (no auth needed)
async function fetchBluesky(query: string): Promise<SocialPost[]> {
  const url = `https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts`
    + `?q=${encodeURIComponent(query)}&limit=25&sort=latest`

  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`Bluesky ${res.status}`)

  const data = await res.json() as {
    posts: Array<{
      uri: string
      record: { text: string }
      author: { handle: string }
      indexedAt: string
    }>
  }

  return data.posts.map(p => ({
    id: p.uri,
    text: p.record.text,
    author: p.author.handle,
    created: p.indexedAt,
    source: 'bluesky' as const,
    url: `https://bsky.app/profile/${p.author.handle}/post/${p.uri.split('/').pop()}`,
  }))
}

// Secondary: Reddit .json (no OAuth — just User-Agent header)
async function fetchReddit(subreddit: string, query?: string): Promise<SocialPost[]> {
  const baseUrl = query
    ? `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&sort=new&limit=20`
    : `https://www.reddit.com/r/${subreddit}/hot.json?limit=20`

  const res = await fetch(baseUrl, {
    headers: { 'User-Agent': REDDIT_USER_AGENT },
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error(`Reddit ${res.status}`)

  const data = await res.json() as {
    data: { children: Array<{ data: {
      id: string; title: string; author: string
      created_utc: number; score: number; permalink: string
    }}> }
  }

  return data.data.children.map(c => ({
    id: c.data.id,
    text: c.data.title,
    author: `u/${c.data.author}`,
    created: new Date(c.data.created_utc * 1000).toISOString(),
    source: 'reddit' as const,
    score: c.data.score,
    url: `https://reddit.com${c.data.permalink}`,
  }))
}

// Tertiary: NewsData.io
async function fetchNews(query: string): Promise<SocialPost[]> {
  const key = process.env.NEWS_API_KEY_1
  if (!key) throw new Error('No NewsData key')

  const url = `https://newsdata.io/api/1/news`
    + `?q=${encodeURIComponent(query)}&language=en&apikey=${key}`

  const res = await fetch(url, { next: { revalidate: 1800 } })
  if (!res.ok) throw new Error(`NewsData ${res.status}`)

  const data = await res.json() as {
    results: Array<{
      article_id: string; title: string
      source_id: string; pubDate: string; link: string
    }>
  }

  return (data.results ?? []).map(a => ({
    id: a.article_id,
    text: a.title,
    author: a.source_id,
    created: a.pubDate,
    source: 'news' as const,
    url: a.link,
  }))
}

// Main export with failover
export async function getSocialPosts(query: string = '#WC2026'): Promise<SocialPost[]> {
  // Try Bluesky first
  try {
    const posts = await fetchBluesky(`#WC2026 ${query}`)
    if (posts.length > 0) return posts
  } catch {}

  // Fallback to Reddit (all subreddits in parallel)
  try {
    const results = await Promise.allSettled(
      REDDIT_SUBREDDITS.map(sub => fetchReddit(sub, query))
    )
    const posts = results
      .filter((r): r is PromiseFulfilledResult<SocialPost[]> => r.status === 'fulfilled')
      .flatMap(r => r.value)
      .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
      .slice(0, 25)
    if (posts.length > 0) return posts
  } catch {}

  // Fallback to news
  try {
    return await fetchNews(query)
  } catch {}

  // Mock floor
  return [
    {
      id: 'mock-1',
      text: 'WC2026 is going to be incredible. 48 teams, three nations, one trophy.',
      author: 'kickoffto_mock',
      created: new Date().toISOString(),
      source: 'bluesky',
      url: 'https://bsky.app',
    },
  ]
}
