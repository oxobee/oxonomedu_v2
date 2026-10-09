import { getOrganizationContextInfo } from '@services/organizations/orgs'
import { getAuthOrgSlug } from '@services/org/orgResolution'
import LoginClient from './login'
import MLoginClient from '@components/Mobile/MLoginClient'
import { Metadata } from 'next'
import { headers } from 'next/headers'
import OrgNotFound from '@components/Objects/StyledElements/Error/OrgNotFound'

export async function generateMetadata(): Promise<Metadata> {
  const orgslug = await getAuthOrgSlug()

  if (!orgslug) {
    // Apex (org-less) login.
    return { title: 'Giriş Yap — Oxonom Edu', robots: { index: false, follow: false } }
  }

  let org: any = null
  try {
    org = await getOrganizationContextInfo(orgslug, {
      revalidate: 60,
      tags: ['organizations'],
    })
  } catch {
    // Stale cookie or unknown org — fall back to generic title
  }

  return {
    title: 'Giriş Yap' + ` — ${org?.name || 'Oxonom Edu'}`,
    robots: { index: false, follow: false },
  }
}

const Login = async () => {
  const orgslug = await getAuthOrgSlug()

  // Detect mobile request from User-Agent header
  const reqHeaders = await headers()
  const userAgent = reqHeaders.get('user-agent') || ''
  const isMobileUA = /mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(userAgent)

  // No org slug → bare apex (learn.io) → generic, org-less login.
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
    // A subdomain (or single-tenancy) slug that can't be resolved is a real error.
    if (!org) {
      return <OrgNotFound />
    }
  }

  // If request originates from mobile device, deliver the mobile teacher login experience directly
  if (isMobileUA) {
    return <MLoginClient org={org} orgslug={orgslug || ''} />
  }

  return (
    <div>
      <LoginClient org={org}></LoginClient>
    </div>
  )
}

export default Login
