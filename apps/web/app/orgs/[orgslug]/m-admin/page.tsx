import { Metadata, Viewport } from 'next'
import React, { Suspense } from 'react'
import MAdminClient from '@components/Mobile/Admin/MAdminClient'

export const dynamic = 'force-dynamic'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'İdare Paneli & Yönetim Dashboard — Oxonom EDU (m-admin)',
  description: 'Mobil öncelikli okul idare paneli, istatistikler, devamsızlık ve yönetim modülleri.',
}

export default async function OrgMAdminPage({
  params,
}: {
  params?: Promise<{ orgslug?: string }>
}) {
  const resolvedParams = params ? await params : undefined
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0D15]" />}>
      <MAdminClient orgSlug={resolvedParams?.orgslug} />
    </Suspense>
  )
}
