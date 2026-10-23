import { Metadata } from 'next'
import React from 'react'
import LiveClassRadar from '@components/Common/LiveClassRadar'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Canlı Ders & Zaman Radarı — Öğrenci Portalı | Oxonom EDU',
  description: 'Anlık ders takibi, iş süresi grafiği, sonraki derse kalan süre ve günün infografik ders akışı.',
}

export default function StudentLiveClassPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            Canlı Ders ve Zaman Radarı
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Gerçek zamanlı ders iş süresi, akıllı tahta bağlantısı ve günün 6 saatlik ders akışı
          </p>
        </div>
      </div>

      <LiveClassRadar role="student" initialClassCode="1/A" />
    </div>
  )
}
