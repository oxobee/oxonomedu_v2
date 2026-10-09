import { Metadata, Viewport } from 'next'
import React, { Suspense } from 'react'
import MAdminClassesClient from '@components/Mobile/Admin/MAdminClassesClient'

export const dynamic = 'force-dynamic'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Sınıf ve Şube Yönetimi (İdare) — Oxonom EDU (m-admin-classes)',
  description: 'Mobil okul idare sınıf ve şube listesi, yoklama, akademik başarı grafikleri, öğrenci listeleri ve düzenleme.',
}

export default async function OrgMAdminClassesPage({
  params,
}: {
  params?: Promise<{ orgslug?: string }>
}) {
  const resolvedParams = params ? await params : undefined
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0D15]" />}>
      <MAdminClassesClient orgSlug={resolvedParams?.orgslug} />
    </Suspense>
  )
}
