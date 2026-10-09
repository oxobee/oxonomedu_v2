import { Metadata, Viewport } from 'next'
import React, { Suspense } from 'react'
import MAdminScheduleClient from '@components/Mobile/Admin/MAdminScheduleClient'

export const dynamic = 'force-dynamic'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Ders Programı Yönetimi (İdare) — Oxonom EDU (m-admin-schedule)',
  description: 'Mobil okul idare haftalık ders programı oluşturma, sınıf/öğretmen/derslik bazlı akış, çakışma kontrolü ve yayımlama.',
}

export default function MAdminSchedulePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0D15]" />}>
      <MAdminScheduleClient />
    </Suspense>
  )
}
