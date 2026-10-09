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
  title: 'Akıllı Tahtalar & Panolar — Oxonom EDU (m-boards)',
  description: 'Mobil öncelikli akıllı tahtalar ve panolar yönetim ekranı.',
}

export default function OrgMBoardsPage({ params }: { params?: { orgslug?: string } }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0D15]" />}>
      <MobileAppShell initialTab="boards" orgSlug={params?.orgslug} />
    </Suspense>
  )
}
