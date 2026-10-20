import React, { Suspense } from 'react'
import PanoClient from '@components/Pano/PanoClient'
import type { Viewport, Metadata } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ boardId: string }>
}): Promise<Metadata> {
  const { boardId } = await params
  const cleanId = decodeURIComponent(boardId || 'Pano').toUpperCase()
  return {
    title: `Pano OS (${cleanId}) | Oxonom Edu`,
    description: `Oxonom Edu Eğitim İşletim Sistemi, ${cleanId} akıllı tahta, interaktif araçlar ve ders panosu.`,
  }
}

export default function PanoBoardIdPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 w-screen h-screen bg-[#070304] flex items-center justify-center select-none">
          <div className="w-10 h-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PanoClient />
    </Suspense>
  )
}
