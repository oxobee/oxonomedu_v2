import { getAPIUrl } from '@services/config/config'
import {
  RequestBodyFormWithAuthHeader,
  RequestBodyWithAuthHeader,
  errorHandling,
  getResponseMetadata,
} from '@services/utils/ts/requests'

/*
 This file includes only POST, PUT, DELETE requests
 GET requests are called from the frontend using SWR (https://swr.vercel.app/)
*/

export async function createNewOrganization(body: any, access_token: string) {
  const result = await fetch(
    `${getAPIUrl()}orgs/`,
    RequestBodyWithAuthHeader('POST', body, null, access_token)
  )
  const res = await errorHandling(result)
  return res
}

export async function deleteOrganizationFromBackend(
  org_id: any,
  access_token: string
) {
  const result = await fetch(
    `${getAPIUrl()}orgs/${org_id}`,
    RequestBodyWithAuthHeader('DELETE', null, null, access_token)
  )
  const res = await errorHandling(result)
  return res
}

export const DEFAULT_FALLBACK_ORG = {
  id: 30,
  org_uuid: 'org_oxonom_okullari',
  name: 'Oxonom Okulları',
  slug: 'oxonom',
  description: '1 Okul, 1 Sınıf, 1 Müdür, 1 Öğretmen, 1 Öğrenci — Bütünleşik Dijital Kurum',
  about: 'Oxonom Okulları; okul müdürü, sınıf rehber öğretmeni ve öğrencinin tamamen birbirine tanımlandığı, MEB müfredatına tam uyumlu yeni nesil akıllı eğitim kurumu.',
  socials: {},
  links: {},
  scripts: {},
  logo_image: '/pwa-icon.svg',
  thumbnail_image: '',
  previews: {},
  explore: true,
  label: 'Oxonom Okulları',
  email: 'bilgi@oxonom.com',
  is_demo: false,
  creation_date: '2026-09-30 10:00:43.058047',
  update_date: '2026-09-30 10:00:43.058056',
  config: {
    id: 30,
    org_id: 30,
    creation_date: '2026-09-30 10:00:43.515544',
    update_date: '2026-09-30 20:17:00.480975',
    config: {
      plan: 'premium',
      active: true,
      overrides: {},
      admin_toggles: {
        ai: { disabled: false, copilot_enabled: true },
        api: { disabled: false },
        boards: { disabled: false },
        folders: { disabled: false },
        members: { disabled: false, signup_mode: 'open' },
        payments: { disabled: false },
        podcasts: { disabled: false },
        security: {
          require_2fa: false,
          allowed_auth_methods: ['password', 'magic_login', 'google', 'sso'],
          exempt_external_auth: true,
          require_2fa_enabled_at: null,
          require_2fa_grace_days: 0,
          allow_central_session_sharing: true,
        },
        analytics: { disabled: false },
        communities: { disabled: false },
        playgrounds: { disabled: false },
        collaboration: { disabled: false },
      },
      customization: {
        seo: {
          twitter_handle: '',
          default_og_image: '',
          noindex_communities: false,
          default_meta_description: 'Oxonom Okulları akıllı eğitim ve dijital öğrenme portalı',
          google_site_verification: '',
          default_meta_title_suffix: 'Oxonom Okulları',
        },
        menu: { items: [] },
        general: {
          font: '',
          color: '',
          watermark: false,
          footer_text: 'Oxonom Okulları — Geleceğin Eğitimi Burada Başlar',
          favicon_image: '/pwa-icon.svg',
          default_language: 'tr',
          email_sender_name: 'Oxonom Okulları',
          square_logo_image: '/pwa-icon.svg',
        },
        landing: {},
        course_end: { message: '', button_link: '', button_text: '' },
        auth_branding: {
          text_color: 'light',
          background_type: 'gradient',
          welcome_message: 'Oxonom Okulları Portalı',
          background_image: '',
          unsplash_photo_url: '',
          unsplash_photographer_url: '',
          unsplash_photographer_name: '',
        },
        signup_fields: { fields: [] },
      },
      config_version: '2.0',
      resolved_features: {
        ai: { enabled: true, available: true, limit: 2000, required_plan: 'free' },
        analytics: { enabled: true, available: true, limit: 0, required_plan: 'standard' },
        api: { enabled: true, available: true, limit: 0, required_plan: null },
        assignments: { enabled: true, available: true, limit: 0, required_plan: null },
        audit_logs: { enabled: false, available: false, limit: 0, required_plan: 'enterprise' },
        boards: { enabled: true, available: true, limit: 0, required_plan: 'personal' },
        collaboration: { enabled: true, available: true, limit: 0, required_plan: 'standard' },
        folders: { enabled: true, available: true, limit: 0, required_plan: null },
        communities: { enabled: true, available: true, limit: 0, required_plan: 'standard' },
        courses: { enabled: true, available: true, limit: 0, required_plan: null },
        members: { enabled: true, available: true, limit: 0, required_plan: null },
        payments: { enabled: true, available: true, limit: 0, required_plan: 'standard' },
        playgrounds: { enabled: true, available: true, limit: 0, required_plan: 'personal' },
        podcasts: { enabled: true, available: true, limit: 0, required_plan: 'standard' },
        roles: { enabled: true, available: true, limit: 0, required_plan: 'pro' },
        scorm: { enabled: false, available: false, limit: 0, required_plan: 'enterprise' },
        sso: { enabled: false, available: false, limit: 0, required_plan: 'enterprise' },
        usergroups: { enabled: true, available: true, limit: 0, required_plan: 'standard' },
        versioning: { enabled: true, available: true, limit: 0, required_plan: 'pro' },
      },
    },
  },
}

export const OXONOM_FALLBACK_ORG = DEFAULT_FALLBACK_ORG

export function getFallbackOrgForSlug(slug?: string) {
  return DEFAULT_FALLBACK_ORG
}

export async function getOrganizationContextInfo(
  org_slug: any,
  next: any,
  access_token?: string
) {
  const fallback = getFallbackOrgForSlug(org_slug)
  try {
    const result = await fetch(
      `${getAPIUrl()}orgs/slug/${org_slug}`,
      RequestBodyWithAuthHeader('GET', null, next, access_token)
    )
    if (!result.ok) {
      return fallback
    }
    const res = await errorHandling(result)
    return res || fallback
  } catch (_err) {
    return fallback
  }
}

export async function getOrganizationContextInfoWithUUID(
  org_uuid: string,
  next: any,
  access_token?: string
) {
  const fallback = DEFAULT_FALLBACK_ORG
  try {
    const result = await fetch(
      `${getAPIUrl()}orgs/uuid/${org_uuid}`,
      RequestBodyWithAuthHeader('GET', null, next, access_token)
    )
    if (!result.ok) {
      return fallback
    }
    const res = await errorHandling(result)
    return res || fallback
  } catch (_err) {
    return fallback
  }
}

export async function getOrganizationContextInfoWithoutCredentials(
  org_slug: any,
  _next?: any
) {
  const fallback = getFallbackOrgForSlug(org_slug)
  try {
    let HeadersConfig = new Headers({ 'Content-Type': 'application/json' })
    let options: any = {
      method: 'GET',
      headers: HeadersConfig,
      redirect: 'follow',
      cache: 'no-store',
    }

    const result = await fetch(`${getAPIUrl()}orgs/slug/${org_slug}`, options)
    if (!result.ok) {
      return fallback
    }
    const res = await errorHandling(result)
    return res || fallback
  } catch (_err) {
    return fallback
  }
}

export function getOrganizationContextInfoNoAsync(
  org_slug: any,
  next: any,
  access_token: string
) {
  const result = fetch(
    `${getAPIUrl()}orgs/slug/${org_slug}`,
    RequestBodyWithAuthHeader('GET', null, next, access_token)
  )
  return result
}

export async function updateUserRole(
  org_id: any,
  user_id: any,
  role_uuid: any,
  access_token: string
) {
  const result = await fetch(
    `${getAPIUrl()}orgs/${org_id}/users/${user_id}/role/${role_uuid}`,
    RequestBodyWithAuthHeader('PUT', null, null, access_token)
  )
  const res = await getResponseMetadata(result)
  return res
}

export async function updateOrgLanding(
  org_id: any,
  landing_object: any,
  access_token: string
) {
  const result = await fetch(
    `${getAPIUrl()}orgs/${org_id}/landing`,
    RequestBodyWithAuthHeader('PUT', landing_object, null, access_token)
  )
  const res = await getResponseMetadata(result)
  return res
}

export async function updateOrgFoldersSort(
  org_id: any,
  sort_mode: string,
  access_token: string
) {
  const result = await fetch(
    `${getAPIUrl()}orgs/${org_id}/config/folders-sort?sort_mode=${sort_mode}`,
    RequestBodyWithAuthHeader('PUT', null, null, access_token)
  )
  const res = await getResponseMetadata(result)
  return res
}

export async function uploadLandingContent(
  org_uuid: any,
  content_file: File,
  access_token: string
) {
  const formData = new FormData()
  formData.append('content_file', content_file)
  
  const result = await fetch(
    `${getAPIUrl()}orgs/${org_uuid}/landing/content`,
    RequestBodyFormWithAuthHeader('POST', formData, null, access_token)
  )
  const res = await getResponseMetadata(result)
  return res
}

export async function removeUserFromOrg(
  org_id: any,
  user_id: any,
  access_token: any
) {
  const result = await fetch(
    `${getAPIUrl()}orgs/${org_id}/users/${user_id}`,
    RequestBodyWithAuthHeader('DELETE', null, null, access_token)
  )
  const res = await getResponseMetadata(result)
  return res
}

// Self-service: the current user leaves an org they belong to (no admin rights).
export async function leaveOrg(org_id: any, access_token: any) {
  const result = await fetch(
    `${getAPIUrl()}orgs/${org_id}/leave`,
    RequestBodyWithAuthHeader('DELETE', null, null, access_token)
  )
  const res = await getResponseMetadata(result)
  return res
}

export async function removeUsersFromOrg(
  org_id: any,
  user_ids: number[],
  access_token: string
) {
  const params = new URLSearchParams()
  user_ids.forEach((id) => params.append('user_ids', id.toString()))
  const result = await fetch(
    `${getAPIUrl()}orgs/${org_id}/users/batch/remove?${params.toString()}`,
    RequestBodyWithAuthHeader('DELETE', null, null, access_token)
  )
  const res = await getResponseMetadata(result)
  return res
}

export async function removeAllUsersFromOrg(
  org_id: any,
  access_token: string
) {
  const result = await fetch(
    `${getAPIUrl()}orgs/${org_id}/users/all`,
    RequestBodyWithAuthHeader('DELETE', null, null, access_token)
  )
  const res = await errorHandling(result)
  return res
}

export async function wipeOrgContent(org_id: any, access_token: string) {
  const result = await fetch(
    `${getAPIUrl()}orgs/${org_id}/content`,
    RequestBodyWithAuthHeader('DELETE', null, null, access_token)
  )
  const res = await errorHandling(result)
  return res
}

export async function joinOrg(
  args: {
    org_id: number
    user_id: string
    invite_code?: string
  },
  next: any,
  access_token?: string
) {
  const result = await fetch(
    `${getAPIUrl()}orgs/join`,
    RequestBodyWithAuthHeader('POST', args, next, access_token)
  )
  const res = await getResponseMetadata(result)
  return res
}
