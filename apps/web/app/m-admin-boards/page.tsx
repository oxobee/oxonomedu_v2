import { Metadata, Viewport } from 'next'
import React, { Suspense } from 'react'
import MAdminBoardsClient from '@components/Mobile/Admin/MAdminBoardsClient'

export const dynamic = 'force-dynamic'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Akıllı Tahta Yönetimi (İdare) — Oxonom EDU (m-admin-boards)',
  description: 'Mobil okul idare akıllı tahta takip merkezi, canlı oturumlar ve uzaktan yönetim.',
}

export default function MAdminBoardsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0D15]" />}>
      <MAdminBoardsClient />
    </Suspense>
  )
}
