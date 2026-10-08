import React, { Suspense } from 'react'
import GamesPageClient from './GamesPageClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Eğitici Oyunlar | Oxonom Edu',
  description: 'Öğrenciler için eğitici HTML5 zeka, matematik, fen ve dil oyunları.',
}

export default function GamesDirectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8f8f8]" />}>
      <GamesPageClient />
    </Suspense>
  )
}
