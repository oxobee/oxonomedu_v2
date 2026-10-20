import React, { Suspense } from 'react'
import WhiteboardClient from '@components/Whiteboard/WhiteboardClient'
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
  const cleanId = decodeURIComponent(boardId || 'Tahta').toUpperCase()
  return {
    title: `Akıllı Tahta (${cleanId}) | Oxonom Edu`,
    description: `Oxonom Edu ${cleanId} interaktif akıllı tahta, çizim ve sunum alanı.`,
  }
}

export default function PanoBoardWhiteboardPage() {
  return (
    <>
      <style>{`
        html, body {
          overflow: hidden !important;
          scrollbar-gutter: auto !important;
          scrollbar-width: none !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: 100% !important;
        }
        ::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      `}</style>
      <Suspense
        fallback={
          <div className="fixed inset-0 w-full h-full bg-[#FCF9FD] dark:bg-[#17101C] flex items-center justify-center select-none">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-[#4B075F] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-black text-[#4B075F] dark:text-[#C58ADB]">Akıllı Tahta Yükleniyor...</span>
            </div>
          </div>
        }
      >
        <WhiteboardClient />
      </Suspense>
    </>
  )
}
