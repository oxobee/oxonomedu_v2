import { Metadata } from 'next'
import React, { Suspense } from 'react'
import MAdminCurriculumClient from '@components/Mobile/Admin/MAdminCurriculumClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Haftalık Ders ve Teneffüs Programı — Oxonom EDU',
  description: 'Haftalık ders saatleri, ders-teneffüs süreleri ve zümre koordinasyon çizelgesi.',
}

export default function CurriculumPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent animate-pulse" />}>
      <div className="w-full max-w-7xl mx-auto p-3 sm:p-5 lg:p-7">
        <MAdminCurriculumClient hideHeader={false} hideDock={false} />
      </div>
    </Suspense>
  )
}
