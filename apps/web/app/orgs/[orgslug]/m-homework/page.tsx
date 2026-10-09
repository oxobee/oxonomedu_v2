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
  title: 'Teslim ve Değerlendirme — Oxonom EDU (m-homework)',
  description: 'Mobil öncelikli ödev teslimleri, değerlendirme ve puanlama ekranı.',
}

export default function OrgMHomeworkPage({ params }: { params?: { orgslug?: string } }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0D15]" />}>
      <MobileAppShell initialTab="assignments" orgSlug={params?.orgslug} />
    </Suspense>
  )
}
