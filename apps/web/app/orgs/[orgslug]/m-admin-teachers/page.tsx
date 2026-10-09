import { Metadata, Viewport } from 'next'
import React, { Suspense } from 'react'
import MAdminTeachersClient from '@components/Mobile/Admin/MAdminTeachersClient'

export const dynamic = 'force-dynamic'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Öğretmen ve Personel Yönetimi (İdare) — Oxonom EDU (m-admin-teachers)',
  description: 'Mobil okul idare öğretmen kadrosu listesi, detaylar, özlük ve görevlendirme düzenleme.',
}

export default async function OrgMAdminTeachersPage({
  params,
}: {
  params?: Promise<{ orgslug?: string }>
}) {
  const resolvedParams = params ? await params : undefined
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0D15]" />}>
      <MAdminTeachersClient orgSlug={resolvedParams?.orgslug} />
    </Suspense>
  )
}
