import '../styles/globals.css'
import React from 'react'
import type { Metadata, Viewport } from 'next'
import Providers from '@components/Providers'
import PwaRegister from '@components/Mobile/PwaRegister'
import AppleSplashScreen from '@components/Mobile/AppleSplashScreen'
import { Wix_Madefor_Text, Tajawal, Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0A0D15',
}

export const metadata: Metadata = {
  title: 'Oxonom EDU — Dijital Okul Portalı',
  description: 'MEB Uyumlu Akıllı Okul Yönetimi, Ders Programı, Akıllı Tahta ve Öğrenci Takip Sistemi',
  manifest: '/manifest.json',
  applicationName: 'Oxonom EDU',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Oxonom EDU',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/pwa-icon.svg',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

const wixMadeforText = Wix_Madefor_Text({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-default',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif-display',
})

// Wix Madefor Text has no Arabic subset, so Arabic would otherwise fall back to
// whatever the OS provides — Geeza Pro, Segoe UI, Noto — and look like a
// different product on every platform.
//
// Tajawal is the Arabic face for the whole product. It is FORCED whenever the
// UI is Arabic (see globals.css), not merely offered as a fallback: Tajawal
// ships a Latin subset too, so a mixed Arabic screen renders in one typeface
// instead of switching per glyph between two designs with different
// proportions.
//
// Weights are 200-900 with no 600 — a `font-semibold` element rounds up to 700,
// which is the intended reading.
const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '700', '800'],
  display: 'swap',
  variable: '--font-arabic',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // `dir` is deliberately absent from the <html> below. React only reconciles
  // attributes present in its virtual tree, so leaving it out means React never
  // clobbers what dir-init.js wrote before paint. `lang="en"` stays as the
  // no-JS baseline for crawlers; the script overwrites it for everyone else.
  return (
    <html
      className={`${wixMadeforText.variable} ${tajawal.variable} ${plusJakartaSans.variable} ${playfairDisplay.variable}`}
      lang="tr"
      suppressHydrationWarning
    >
      <head>
        {/* Synchronous script — sets <html lang/dir> before body paints so an
            RTL locale never flashes an LTR layout. Must run first. */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/dir-init.js" />
        {/* Synchronous script — blocks parsing to guarantee window.__RUNTIME_CONFIG__ exists before any JS runs.
            Next.js <Script strategy="beforeInteractive"> is not truly blocking in all browsers (Safari). */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/runtime-config.js" />
        {/* Prevent white flash on embed routes: set html+body bg before body is painted.
            Reads the optional ?bgcolor param (hex-validated) or defaults to dark. */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/embed-bg.js" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Oxonom EDU" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0A0D15" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/svg+xml" href="/pwa-icon.svg" />
        <link rel="icon" type="image/png" sizes="192x192" href="/pwa-icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/pwa-icon-512.png" />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <AppleSplashScreen />
          <main className="animate-fade-in">
            {children}
          </main>
          <PwaRegister />
        </Providers>
      </body>
    </html>
  )
}
