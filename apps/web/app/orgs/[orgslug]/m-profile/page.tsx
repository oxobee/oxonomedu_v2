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
  title: 'Hesap Ayarları & Profilim — Oxonom EDU (m-profile)',
  description: 'Mobil öncelikli öğretmen hesap ayarları, profil ve güvenlik yönetim ekranı.',
}

export default function OrgMProfilePage({ params }: { params?: { orgslug?: string } }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0D15]" />}>
      <MobileAppShell initialTab="profile" orgSlug={params?.orgslug} />
    </Suspense>
  )
}
