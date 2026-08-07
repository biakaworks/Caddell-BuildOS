import type { Metadata, Viewport } from 'next'
import { Geist_Mono } from 'next/font/google'
import { AppShell } from '@/components/buildos/app-shell'
import './globals.css'

// TT Hoves is not available on Google Fonts — using system fallback per brand spec.
// The CSS already specifies 'TT Hoves' first; if a licensed copy is loaded via a
// custom @font-face, it will apply automatically.
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CG&M — Glazing Operations',
  description:
    'Commercial Glass & Metal internal operations platform — estimates, fabrication, install scheduling, and dispatch in one place.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#F6F7FE',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={geistMono.variable} data-theme="light">
      <body className="bg-background font-sans antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
