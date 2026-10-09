import { Metadata, Viewport } from 'next'
import React, { Suspense } from 'react'
import MobileAppShell from '@components/Mobile/MobileAppShell'

export const dynamic = 'force-dynamic'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Oxonom EDU — Öğretmen Çalışma Alanı (Dash v2)',
  description: 'Mobil öncelikli, sade ve modern öğretmen dashboard çalışma alanı.',
}

export default async function OrgDashV2Page({ params }: { params?: Promise<{ orgslug?: string }> }) {
  const resolvedParams = params ? await params : undefined
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0D15]" />}>
      <MobileAppShell initialTab="home" orgSlug={resolvedParams?.orgslug} />
    </Suspense>
  )
}
