import { Metadata } from 'next'
import React from 'react'
import PrincipalBoardsView from '@/components/Principal/views/PrincipalBoardsView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Dijital Okul Panoları — Müdür Portalı | Oxonom EDU',
  description: 'Okul girişi, koridorlar ve öğretmenler odası dijital pano ve ekran yönetim merkezi.',
}

export default function PrincipalBoardsPage() {
  return <PrincipalBoardsView />
}
