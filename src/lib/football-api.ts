import type { Match, Team } from '@/types'
import teamColors from '@/data/team-colors.json'

// Team code to flag emoji mapping
const FLAG_MAP: Record<string, string> = {
  ARG: '🇦🇷', BRA: '🇧🇷', FRA: '🇫🇷', ENG: '🏴',
  ESP: '🇪🇸', GER: '🇩🇪', POR: '🇵🇹', NED: '🇳🇱',
  CAN: '🇨🇦', USA: '🇺🇸', MEX: '🇲🇽', ITA: '🇮🇹',
  URU: '🇺🇾', CRO: '🇭🇷', MAR: '🇲🇦', JPN: '🇯🇵',
  SEN: '🇸🇳', GHA: '🇬🇭', CMR: '🇨🇲', NGR: '🇳🇬',
  AUS: '🇦🇺', KOR: '🇰🇷', IRN: '🇮🇷', JOR: '🇯🇴',
  BEL: '🇧🇪', SUI: '🇨🇭', DEN: '🇩🇰', SWE: '🇸🇪',
  POL: '🇵🇱', CZE: '🇨🇿', SRB: '🇷🇸', TUR: '🇹🇷',
  UKR: '🇺🇦', COL: '🇨🇴', ECU: '🇪🇨', CHI: '🇨🇱',
  PER: '🇵🇪', VEN: '🇻🇪', PAR: '🇵🇾', BOL: '🇧🇴',
  SAU: '🇸🇦', QAT: '🇶🇦', UAE: '🇦🇪', IRQ: '🇮🇶',
  MAL: '🇲🇾', THA: '🇹🇭', VIE: '🇻🇳', PHI: '🇵🇭',
  EGY: '🇪🇬', TUN: '🇹🇳', ALG: '🇩🇿', RSA: '🇿🇦',
}

function getTeamFlag(code: string, name: string): string {
  return FLAG_MAP[code] ?? FLAG_MAP[name.slice(0, 3).toUpperCase()] ?? '🏳️'
}

function getKitColors(code: string): { home: string[]; away: string[] } {
  const colors = (teamColors as Record<string, { home: string[]; away: string[] }>)[code]
  return colors ?? { home: ['#888888', '#ffffff'], away: ['#ffffff', '#888888'] }
}

// Map API-Football fixture response to our Match type
export function mapApiFootballFixture(fixture: any): Match {
  const home = fixture.teams?.home
  const away = fixture.teams?.away
  const goals = fixture.goals
  const status = fixture.fixture?.status

  const mapStatus = (short: string): Match['status'] => {
    if (['1H', '2H', 'ET', 'P', 'LIVE', 'HT'].includes(short)) return 'live'
    if (['FT', 'AET', 'PEN'].includes(short)) return 'finished'
    if (['PST', 'CANC', 'ABD'].includes(short)) return 'postponed'
    return 'scheduled'
  }

  const homeCode = home?.code ?? home?.name?.slice(0, 3).toUpperCase() ?? 'HOM'
  const awayCode = away?.code ?? away?.name?.slice(0, 3).toUpperCase() ?? 'AWY'

  return {
    id: String(fixture.fixture?.id),
    homeTeam: {
      id: String(home?.id),
      name: home?.name ?? 'Home',
      shortName: home?.code ?? homeCode,
      code: homeCode,
      flag: getTeamFlag(homeCode, home?.name ?? ''),
      kitColors: getKitColors(homeCode),
      confederation: 'UEFA',
    },
    awayTeam: {
      id: String(away?.id),
      name: away?.name ?? 'Away',
      shortName: away?.code ?? awayCode,
      code: awayCode,
      flag: getTeamFlag(awayCode, away?.name ?? ''),
      kitColors: getKitColors(awayCode),
      confederation: 'UEFA',
    },
    homeScore: goals?.home ?? null,
    awayScore: goals?.away ?? null,
    status: mapStatus(status?.short ?? 'NS'),
    minute: status?.elapsed ?? null,
    round: fixture.league?.round ?? 'WC2026',
    venue: fixture.fixture?.venue?.name ?? 'TBD',
    kickoff: fixture.fixture?.date ?? new Date().toISOString(),
    intensity: 'normal',
  }
}

// Map football-data.org response to our Match type
export function mapFootballDataFixture(match: any): Match {
  const homeCode = match.homeTeam?.tla ?? 'HOM'
  const awayCode = match.awayTeam?.tla ?? 'AWY'

  const mapStatus = (s: string): Match['status'] => {
    if (s === 'IN_PLAY' || s === 'PAUSED') return 'live'
    if (s === 'FINISHED') return 'finished'
    if (s === 'POSTPONED' || s === 'CANCELLED') return 'postponed'
    return 'scheduled'
  }

  return {
    id: String(match.id),
    homeTeam: {
      id: String(match.homeTeam?.id),
      name: match.homeTeam?.name ?? 'Home',
      shortName: homeCode,
      code: homeCode,
      flag: getTeamFlag(homeCode, match.homeTeam?.name ?? ''),
      kitColors: getKitColors(homeCode),
      confederation: 'UEFA',
    },
    awayTeam: {
      id: String(match.awayTeam?.id),
      name: match.awayTeam?.name ?? 'Away',
      shortName: awayCode,
      code: awayCode,
      flag: getTeamFlag(awayCode, match.awayTeam?.name ?? ''),
      kitColors: getKitColors(awayCode),
      confederation: 'UEFA',
    },
    homeScore: match.score?.fullTime?.home ?? null,
    awayScore: match.score?.fullTime?.away ?? null,
    status: mapStatus(match.status ?? 'SCHEDULED'),
    minute: match.minute ?? null,
    round: match.stage ?? 'WC2026',
    venue: match.venue ?? 'TBD',
    kickoff: match.utcDate ?? new Date().toISOString(),
    intensity: 'normal',
  }
}
