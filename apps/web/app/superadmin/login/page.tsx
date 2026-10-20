// apps/web/app/superadmin/login/page.tsx
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
  title: 'Süper Admin Girişi — Oxonom EDU Game Studio',
  description: 'Oxonom EDU Süper Admin & Game Studio yönetim portalı.',
}

export default function SuperadminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070A12]" />}>
      <GlobalLoginClient />
    </Suspense>
  )
}
