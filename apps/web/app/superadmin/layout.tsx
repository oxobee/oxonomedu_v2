import { Metadata, Viewport } from 'next'
import React from 'react'
import SuperadminShell from '@/components/Superadmin/SuperadminShell'

export const dynamic = 'force-dynamic'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Oxonom Superadmin — Sistem, OS & Game Studio Yönetim Portalı',
  description: 'Game Studio oyun yönetimi, Öğretmen OS arayüzü, hero slider ve sistem ayarları.',
}

export default function SuperadminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SuperadminShell>{children}</SuperadminShell>
}
