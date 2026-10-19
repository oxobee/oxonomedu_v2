import React, { Suspense } from 'react'
import WhiteboardClient from '@components/Whiteboard/WhiteboardClient'
import type { Viewport, Metadata } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Akıllı Tahta | Oxonom Edu',
  description: 'Oxonom Edu interaktif akıllı tahta, çizim, serbest not alma ve ders sunum alanı.',
}

export default function PanoWhiteboardPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 w-screen h-screen bg-[#FCF9FD] dark:bg-[#17101C] flex items-center justify-center select-none">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-[#4B075F] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-black text-[#4B075F] dark:text-[#C58ADB]">Akıllı Tahta Yükleniyor...</span>
          </div>
        </div>
      }
    >
      <WhiteboardClient />
    </Suspense>
  )
}
