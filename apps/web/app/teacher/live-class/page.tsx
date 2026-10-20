import { Metadata } from 'next'
import React from 'react'
import LiveClassRadar from '@components/Common/LiveClassRadar'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Canlı Ders & Zaman Radarı — Öğretmen Portalı | Oxonom EDU',
  description: 'Aktif ders süresi takibi, akıllı tahta yönetimi, yoklama ve ders akışı.',
}

export default function TeacherLiveClassPage() {
  return (
    <div className="space-y-6 pb-12 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            Öğretmen Canlı Ders Takip Radarı
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Aktif ders iş süresi, yoklama durumu, akıllı tahta bağlantısı ve günün 6 saatlik ders dağılımı
          </p>
        </div>
      </div>

      <LiveClassRadar role="teacher" showClassSelector={true} />
    </div>
  )
}
