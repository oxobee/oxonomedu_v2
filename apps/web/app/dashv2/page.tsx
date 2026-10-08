import { Metadata } from 'next'
import React from 'react'
import DashV2Client from '@components/DashboardV2/DashV2Client'

export const metadata: Metadata = {
  title: 'Oxonom EDU — Öğretmen Çalışma Alanı (Dash v2)',
  description: 'Mobil öncelikli, sade ve modern öğretmen dashboard çalışma alanı.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover',
}

export default function DashV2Page() {
  return <DashV2Client />
}
