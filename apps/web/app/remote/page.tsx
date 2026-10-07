import React, { Suspense } from 'react'
import { Metadata } from 'next'
import RemoteClient from '@/components/Remote/RemoteClient'

export const metadata: Metadata = {
  title: 'Akıllı Tahta Uzaktan Kumanda | Oxonom Edu',
  description: 'Oxonom Edu Akıllı Tahta mobil uzaktan kumanda paneli.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
}

export default function RemotePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-400">Kumanda Yükleniyor...</span>
          </div>
        </div>
      }
    >
      <RemoteClient />
    </Suspense>
  )
}
