import { Metadata } from 'next'
import React from 'react'
import OxonomPricingClient from '@components/Pricing/OxonomPricingClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Fiyatlandırma & Kampanyalar — Oxonom EDU Plus',
  description: '9 Ay Öde 12 Ay Kullan kampanyası, 14 gün kredi kartsız ücretsiz deneme ve MEB müfredatına tam uyumlu yapay zekâ destekli eğitim paketleri.',
}

export default function StudentPricingPage() {
  return <OxonomPricingClient />
}
