import { Metadata, Viewport } from 'next'
import React, { Suspense } from 'react'
import MAdminReportsClient from '@components/Mobile/Admin/MAdminReportsClient'

export const dynamic = 'force-dynamic'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Akademik Takip ve Raporlar (İdare) — Oxonom EDU (m-admin-reports)',
  description: 'Mobil okul idare akademik başarı, devamsızlık analizi, MEB kazanım takibi ve resmi PDF/Excel raporları.',
}

export default function MAdminReportsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0D15]" />}>
      <MAdminReportsClient />
    </Suspense>
  )
}
