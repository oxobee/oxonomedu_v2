// apps/web/app/games/uzay-seruveni/page.tsx
'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import UzaySeruveniGame from '@/components/GameStudio/UzaySeruveni/UzaySeruveniGame'

export default function UzaySeruveniStandalonePage() {
  const router = useRouter()

  const handleExit = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/student/gamestudio')
    }
  }

  return (
    <main className="w-full min-h-screen bg-[#0E0620]">
      <UzaySeruveniGame onExit={handleExit} />
    </main>
  )
}
