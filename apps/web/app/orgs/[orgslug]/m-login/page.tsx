import { Metadata } from 'next'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import MLoginClient from '@components/Mobile/MLoginClient'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Öğretmen Girişi — Oxonom EDU',
  description: 'Oxonom EDU Mobil Öğretmen Giriş Alanı',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

interface PageProps {
  params: Promise<{ orgslug: string }>
}

export default async function OrgMobileLoginPage({ params }: PageProps) {
  const { orgslug } = await params
  let org: any = null
  if (orgslug) {
    try {
      org = await getOrganizationContextInfo(orgslug, {
        revalidate: 60,
        tags: ['organizations'],
      })
    } catch {
      org = null
    }
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0D15]" />}>
      <MLoginClient org={org} orgslug={orgslug} />
    </Suspense>
  )
}
