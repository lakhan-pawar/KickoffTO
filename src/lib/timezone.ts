export function formatMatchTime(kickoff: string): {
  date: string
  time: string
  relative: string
  full: string
} {
  const dt = new Date(kickoff)
  const now = new Date()
  const diff = dt.getTime() - now.getTime()

  const date = dt.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  })

  const time = dt.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
    timeZoneName: 'short',
  })

  let relative = ''
  if (diff < 0) {
    relative = 'Finished'
  } else if (diff < 3600000) {
    const mins = Math.floor(diff / 60000)
    relative = `${mins}m`
  } else if (diff < 86400000) {
    const hrs = Math.floor(diff / 3600000)
    relative = `In ${hrs}h`
  } else {
    const days = Math.floor(diff / 86400000)
    relative = `In ${days}d`
  }

  const full = `${date} · ${time}`

  return { date, time, relative, full }
}

export function getTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}
