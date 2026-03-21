import { Navbar } from '@/components/ui/Navbar'
import { BottomNav } from '@/components/ui/BottomNav'
import { Ticker } from '@/components/ui/Ticker'
import { CouncilClient } from '@/components/council/CouncilClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Character Council — KickoffTo',
    description: 'Ask all 16 characters simultaneously. See how they disagree.',
}

export default function CouncilPage() {
    return (
        <>
            <Navbar />
            <Ticker segments={[
                '⚡ Character Council · all 16 respond simultaneously',
                'Rate limited · 1 session per hour',
                'Strategy · Narrative · Chaos',
            ]} />
            <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px 100px' }}>
                <div style={{ marginBottom: 28 }}>
                    <p style={{
                        fontSize: 10, fontWeight: 700, color: 'var(--green)',
                        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
                    }}>
                        Character Council
                    </p>
                    <h1 style={{
                        fontFamily: 'var(--font-display)', fontWeight: 800,
                        fontSize: 'clamp(24px, 4vw, 40px)',
                        letterSpacing: -0.5, color: 'var(--text)', marginBottom: 8,
                    }}>
                        ALL 16 CHARACTERS RESPOND
                    </h1>
                    <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>
                        Ask one question. Every character answers simultaneously.
                        See how El Maestro, ARIA-9, The Antagonist and 13 others disagree.
                    </p>
                </div>
                <CouncilClient />
            </main>
            <BottomNav />
        </>
    )
}
