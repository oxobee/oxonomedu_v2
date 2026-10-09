import { Metadata } from 'next'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import { getAuthOrgSlug } from '@services/org/orgResolution'
import MLoginClient from '@components/Mobile/MLoginClient'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Giriş Yap — Oxonom Okulları',
  description: 'Oxonom Okulları Dijital Kurum Giriş Portalı',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default async function MobileLoginPage() {
  const orgslug = await getAuthOrgSlug()
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
      <MLoginClient org={org} orgslug={orgslug || 'oxonom'} />
    </Suspense>
  )
}
