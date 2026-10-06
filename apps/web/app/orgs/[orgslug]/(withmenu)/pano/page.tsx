import React from 'react'
import PanoClient from '@components/Pano/PanoClient'

import type { Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata = {
  title: 'Pano OS | Oxonom Edu',
  description: 'Oxonom Edu Eğitim İşletim Sistemi, akıllı tahta, interaktif araçlar ve ders panosu.',
}

export default function PanoPage() {
  return <PanoClient />
}
