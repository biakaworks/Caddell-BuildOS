import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Open_Sans, Geist_Mono, Oswald, Fraunces } from 'next/font/google'
import { AppShell } from '@/components/buildos/app-shell'
import './globals.css'

// Open Sans — UI / body. Oswald — bold condensed sans for large headings.
const openSans = Open_Sans({ variable: '--font-open-sans', subsets: ['latin'] })
const oswald = Oswald({ variable: '--font-oswald', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})
// Editorial serif — used ONLY for the client-facing Showcase output.
const fraunces = Fraunces({
  variable: '--font-display',
  subsets: ['latin'],
  axes: ['opsz'],
})

export const metadata: Metadata = {
  title: 'BuildOS — Caddell Construction',
  description:
    'BuildOS is Caddell Construction’s internal operating platform for pursuits, estimating, projects, knowledge, and leadership reporting.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#691C32',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`light ${openSans.variable} ${oswald.variable} ${geistMono.variable} ${fraunces.variable}`}
    >
      <body className="bg-background font-sans antialiased">
        <AppShell>{children}</AppShell>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
