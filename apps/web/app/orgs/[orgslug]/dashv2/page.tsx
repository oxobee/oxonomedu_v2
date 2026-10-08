import { Metadata } from 'next'
import React, { Suspense } from 'react'
import DashV2Client from '@components/DashboardV2/DashV2Client'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Oxonom EDU — Öğretmen Çalışma Alanı (Dash v2)',
  description: 'Mobil öncelikli, sade ve modern öğretmen dashboard çalışma alanı.',
}

export default function OrgDashV2Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <DashV2Client />
    </Suspense>
  )
}
