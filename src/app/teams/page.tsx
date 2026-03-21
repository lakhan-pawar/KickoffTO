import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'
const TEAMS = ['🇦🇷','🇧🇷','🇫🇷','🏴','🇪🇸','🇩🇪','🇵🇹','🇳🇱','🇨🇦','🇺🇸','🇲🇽','🇲🇦','🇯🇵','🇸🇳','🇭🇷','🇺🇾','🇧🇪','🇨🇭','🇩🇰','🇸🇪','🇦🇺','🇰🇷','🇮🇷','🇸🇦','🇪🇨','🇨🇴','🇨🇱','🇵🇪','🇵🇦','🇯🇲','🇳🇬','🇬🇭','🇨🇮','🇨🇲','🇹🇳','🇦🇴','🇷🇸','🇵🇱','🇨🇿','🇸🇮','🇸🇰','🇹🇷','🇺🇦','🇬🇷','🇦🇹','🇷🇴','🇧🇦','🇬🇪','🇦🇿']
export default function TeamsPage() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px 100px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 28, color: 'var(--text)', marginBottom: 20 }}>
          48 Teams
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {TEAMS.map((flag, i) => (
            <span key={i} style={{ fontSize: 36 }}>{flag}</span>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 16 }}>
          Full team profiles coming soon.
        </p>
      </main>
      <BottomNav />
    </>
  )
}
