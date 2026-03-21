import type { Metadata } from 'next'
import { Bricolage_Grotesque, DM_Sans } from 'next/font/google'
import './globals.css'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '700', '800'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'KickoffTo — WC2026',
  description: 'The internet\'s home for WC2026. 16 AI characters, live match rooms, fan games.',
  metadataBase: new URL('https://kickoffto.com'),
  openGraph: {
    title: 'KickoffTo — WC2026',
    description: 'The internet\'s home for WC2026',
    url: 'https://kickoffto.com',
    siteName: 'KickoffTo',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${bricolage.variable} ${dmSans.variable} font-body bg-page text-primary antialiased`}>
        {children}
      </body>
    </html>
  )
}
