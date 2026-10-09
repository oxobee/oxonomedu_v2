import { Metadata, Viewport } from 'next'
import React, { Suspense } from 'react'
import MAdminStudentsClient from '@components/Mobile/Admin/MAdminStudentsClient'

export const dynamic = 'force-dynamic'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Öğrenci Yönetimi (İdare) — Oxonom EDU (m-admin-students)',
  description: 'Mobil okul idare öğrenci listesi, künye, yeni kayıt ve şube nakil işlemleri.',
}

export default function MAdminStudentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0D15]" />}>
      <MAdminStudentsClient />
    </Suspense>
  )
}
