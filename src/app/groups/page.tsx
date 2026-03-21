import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'
export default function GroupsPage() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px 100px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 28, color: 'var(--text)', marginBottom: 8 }}>Groups</h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 16 }}>
          Groups confirmed at the draw. Full standings update here from June 11.
        </p>
        <a href="https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/groups"
          target="_blank" rel="noopener noreferrer"
          style={{ color: 'var(--green)', fontSize: 14 }}>
          View groups on FIFA.com →
        </a>
      </main>
      <BottomNav />
    </>
  )
}
