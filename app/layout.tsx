import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Roboto_Condensed, Roboto_Mono, Crimson_Pro } from 'next/font/google'
import { AppShell } from '@/components/buildos/app-shell'
import './globals.css'

// Caddell brand type, per the Brand Standards Guide + caddell-brand skill:
//   Roboto Condensed — headings and UI/body (the brand's sans)
//   Crimson Pro      — the approved serif; used ONLY for the client-facing Showcase
// Both are Google Fonts, so next/font self-hosts them at build time: no runtime
// request, no layout shift, and they render inside the v0 preview.
const robotoCondensed = Roboto_Condensed({
  variable: '--font-roboto-condensed',
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
})
const robotoMono = Roboto_Mono({
  variable: '--font-roboto-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
})
const crimsonPro = Crimson_Pro({
  variable: '--font-crimson-pro',
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BuildOS — Caddell Construction',
  description:
    'BuildOS is Caddell Construction’s internal operating platform for pursuits, estimating, projects, knowledge, and leadership reporting.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-light-32x32.png', sizes: '32x32', type: 'image/png' },
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
      className={`light ${robotoCondensed.variable} ${robotoMono.variable} ${crimsonPro.variable}`}
    >
      <body className="bg-background font-sans antialiased">
        <AppShell>{children}</AppShell>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
