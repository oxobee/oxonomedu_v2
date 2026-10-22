import { Metadata, Viewport } from 'next'
import React, { Suspense } from 'react'
import GlobalLoginClient from '@components/Auth/GlobalLoginClient'

export const dynamic = 'force-dynamic'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Giriş Yap — Oxonom EDU',
  description: 'Müdür, öğretmen ve öğrenci merkezi giriş portalı.',
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08050D]" />}>
      <GlobalLoginClient />
    </Suspense>
  )
}
