import { Metadata, Viewport } from 'next'
import React, { Suspense } from 'react'
import MAdminCurriculumClient from '@components/Mobile/Admin/MAdminCurriculumClient'

export const dynamic = 'force-dynamic'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Dersler ve MEB Müfredatı (İdare) — Oxonom EDU (m-admin-curriculum)',
  description: 'Mobil okul idare ders kataloğu, MEB üniteleri, kazanımları, haftalık ders saatleri ve materyal yönetimi.',
}

export default function MAdminCurriculumPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0D15]" />}>
      <MAdminCurriculumClient />
    </Suspense>
  )
}
