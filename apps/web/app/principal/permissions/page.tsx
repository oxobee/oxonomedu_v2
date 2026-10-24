import { Metadata } from 'next'
import React from 'react'
import PrincipalPermissionsView from '@/components/Principal/views/PrincipalPermissionsView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Personel Yetki & Ekran Tanımlama — Müdür Portalı | Oxonom EDU',
  description:
    'Öğretmen, müdür yardımcısı ve rehberlik kadrosu için ekran erişim ve işlem yetkilendirme merkezi.',
}

export default function PrincipalPermissionsPage() {
  return <PrincipalPermissionsView />
}
