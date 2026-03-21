const FOOTBALL_API_KEYS = [
  process.env.FOOTBALL_API_KEY_1!,
  process.env.FOOTBALL_API_KEY_2!,
  process.env.FOOTBALL_API_KEY_3!,
].filter(Boolean)

const FOOTBALL_DATA_KEYS = [
  process.env.FOOTBALL_DATA_KEY_1!,
  process.env.FOOTBALL_DATA_KEY_2!,
  process.env.FOOTBALL_DATA_KEY_3!,
].filter(Boolean)

let apifKeyIndex = 0
let fdKeyIndex = 0

function getApiFootballKey() {
  return FOOTBALL_API_KEYS[apifKeyIndex++ % FOOTBALL_API_KEYS.length]
}

function getFootballDataKey() {
  return FOOTBALL_DATA_KEYS[fdKeyIndex++ % FOOTBALL_DATA_KEYS.length]
}

// API-Football: primary
async function fetchApiFootball(endpoint: string): Promise<unknown> {
  const key = getApiFootballKey()
  const res = await fetch(`https://v3.football.api-sports.io/${endpoint}`, {
    headers: { 'x-apisports-key': key },
    next: { revalidate: 30 },
  })
  if (!res.ok) throw new Error(`API-Football ${res.status}`)
  return res.json()
}

// football-data.org: secondary
async function fetchFootballData(endpoint: string): Promise<unknown> {
  const key = getFootballDataKey()
  const res = await fetch(`https://api.football-data.org/v4/${endpoint}`, {
    headers: { 'X-Auth-Token': key },
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`football-data ${res.status}`)
  return res.json()
}

// TheSportsDB: tertiary (no key)
async function fetchTheSportsDB(endpoint: string): Promise<unknown> {
  const res = await fetch(
    `https://www.thesportsdb.com/api/v1/json/3/${endpoint}`,
    { next: { revalidate: 120 } },
  )
  if (!res.ok) throw new Error(`TheSportsDB ${res.status}`)
  return res.json()
}

// Generic failover wrapper
async function withFailover<T>(
  primary: () => Promise<T>,
  secondary: () => Promise<T>,
  tertiary: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try { return await primary() } catch {}
  try { return await secondary() } catch {}
  try { return await tertiary() } catch {}
  return fallback
}

// Get live fixtures
export async function getLiveFixtures() {
  return withFailover(
    () => fetchApiFootball('fixtures?live=all'),
    () => fetchFootballData('matches?status=LIVE'),
    () => fetchTheSportsDB('eventsroundseason.php?id=4&r=1&s=2026'),
    { response: [], errors: {} },
  )
}

// Get upcoming fixtures
export async function getUpcomingFixtures(next: number = 10) {
  return withFailover(
    () => fetchApiFootball(`fixtures?next=${next}&league=1&season=2026`),
    () => fetchFootballData('competitions/2001/matches?status=SCHEDULED'),
    () => fetchTheSportsDB('eventsseason.php?id=4&s=2026'),
    { response: [], errors: {} },
  )
}

// Get match events (goals, cards, subs)
export async function getMatchEvents(fixtureId: string) {
  return withFailover(
    () => fetchApiFootball(`fixtures/events?fixture=${fixtureId}`),
    () => fetchFootballData(`matches/${fixtureId}`),
    async () => ({ events: [] }),
    { response: [] },
  )
}

// Get squad for a team
export async function getSquad(teamId: string) {
  return withFailover(
    () => fetchApiFootball(`players/squads?team=${teamId}`),
    () => fetchTheSportsDB(`lookup_all_players.php?id=${teamId}`),
    async () => ({ players: [] }),
    { response: [] },
  )
}
