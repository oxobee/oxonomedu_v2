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
  title: 'Öğrenci İşleri & Sınıf Dağılımı — Oxonom EDU (m-student)',
  description: 'Mobil öncelikli öğrenci listesi, şube dağılımı, nakil ve yoklama ekranı.',
}

export default async function OrgMStudentPage({ params }: { params?: Promise<{ orgslug?: string }> }) {
  const resolvedParams = params ? await params : undefined
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0D15]" />}>
      <MobileAppShell initialTab="student" orgSlug={resolvedParams?.orgslug} />
    </Suspense>
  )
}
