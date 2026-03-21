import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'
export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '32px 16px 100px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 24, color: 'var(--text)', marginBottom: 16 }}>Privacy Policy</h1>
        <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.8 }}>
          <p style={{ marginBottom: 12 }}>KickoffTo does not require an account or login. No personal data is collected.</p>
          <p style={{ marginBottom: 12 }}>Your game data (predictions, bracket, trivia scores) is stored in your browser&apos;s localStorage only — it never leaves your device.</p>
          <p style={{ marginBottom: 12 }}>Push notification subscriptions (if you opt in) store only a device token — no name, email or personal information.</p>
          <p style={{ marginBottom: 12 }}>Crowd reaction counts are anonymous increments — no IP addresses are stored.</p>
          <p style={{ marginBottom: 12 }}>We use Google AdSense for advertising. Google may use cookies to personalise ads.</p>
          <p>KickoffTo is an unofficial fan app. Not affiliated with FIFA or any football association.</p>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
