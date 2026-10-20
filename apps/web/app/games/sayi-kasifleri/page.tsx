// apps/web/app/games/sayi-kasifleri/page.tsx
'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import SayiKasifleriGame from '@/components/GameStudio/SayiKasifleri/SayiKasifleriGame'

export default function SayiKasifleriStandalonePage() {
  const router = useRouter()

  const handleExit = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/student/gamestudio')
    }
  }

  return (
    <main className="w-full min-h-screen bg-[#070D18]">
      <SayiKasifleriGame onExit={handleExit} />
    </main>
  )
}
