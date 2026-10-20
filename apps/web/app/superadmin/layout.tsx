import { Metadata, Viewport } from 'next'
import React from 'react'
import SuperadminNavbar from '@/components/Superadmin/SuperadminNavbar'

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
  return (
    <div className="min-h-screen bg-[#0B0D13] text-white flex flex-col font-jakarta">
      <SuperadminNavbar />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
