import { Metadata } from 'next'
import React from 'react'
import LiveClassRadar from '@components/Common/LiveClassRadar'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Okul Geneli Canlı Ders Radarı — Okul Yönetimi | Oxonom EDU',
  description: 'Tüm şubeler için anlık ders takibi, okul zili senkronizasyonu ve ders akış denetimi.',
}

export default function PrincipalLiveClassPage() {
  return (
    <div className="space-y-6 pb-12 p-3 sm:p-5 lg:p-7 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            Okul Geneli Canlı Ders ve Zaman Radarı
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Şube bazlı anlık ders iş süreleri, zil senkronizasyonu ve MEB haftalık program denetimi
          </p>
        </div>
      </div>

      <LiveClassRadar role="principal" initialClassCode="1/A" showClassSelector={true} />
    </div>
  )
}
