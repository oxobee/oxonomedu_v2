'use client'

export interface PrincipalProfile {
  id?: number
  name: string
  title: string
  email: string
  tcNo: string
  phone: string
  twoFactorActive: boolean
  schoolName: string
  role?: string
  username?: string
  first_name?: string
  last_name?: string
  loginTime?: string
  institutionCode?: string
  is_customized?: boolean
}

export interface SchoolInfo {
  officialName: string
  institutionCode: string
  educationLevel: string
  city: string
  district: string
  address: string
  schoolPhone: string
  schoolEmail: string
  website: string
  term: string
}

export const DEFAULT_PRINCIPAL_PROFILE: PrincipalProfile = {
  id: 50,
  name: 'Dr. Uğur UĞURLU',
  title: 'Okul Müdürü · Kurum Yetkilisi',
  email: 'mudur@oxonom.com',
  tcNo: '10000000146',
  phone: '+90 532 999 2200',
  twoFactorActive: true,
  schoolName: 'Necla Görer İlkokulu',
  role: '1. Derece Kurum Müdürü (Baş Yönetici)',
  username: 'mudur',
  first_name: 'Dr. Uğur',
  last_name: 'UĞURLU',
  loginTime: 'Bugün, 08:30',
  institutionCode: '741295',
}

export const DEFAULT_SCHOOL_INFO: SchoolInfo = {
  officialName: 'Necla Görer İlkokulu',
  institutionCode: '741295',
  educationLevel: 'İlkokul (1-4. Sınıflar)',
  city: 'İstanbul',
  district: 'Kadıköy',
  address: 'Fenerbahçe Mah. Lale Sk. No:14 Kadıköy / İstanbul',
  schoolPhone: '+90 (216) 414 10 20',
  schoolEmail: 'bilgi@neclagorer.k12.tr',
  website: 'https://neclagorer.k12.tr',
  term: '2025-2026 Bahar Dönemi',
}

const PRINCIPAL_PROFILE_KEY = 'oxonom_principal_profile'
const ADMIN_SESSION_KEY = 'oxonom_active_admin_session'
const SCHOOL_INFO_KEY = 'oxonom_school_info'

/**
 * Returns the currently saved principal profile from persistent storage,
 * falling back to active session or defaults.
 */
export function getStoredPrincipalProfile(): PrincipalProfile {
  if (typeof window === 'undefined') return DEFAULT_PRINCIPAL_PROFILE

  // Trigger background server sync so mobile and desktop remain synchronized
  ensurePrincipalProfileSynced()

  try {
    // 1. Try dedicated persistent principal profile first
    const savedPrincipal = localStorage.getItem(PRINCIPAL_PROFILE_KEY)
    let parsedPrincipal: Partial<PrincipalProfile> | null = null
    if (savedPrincipal) {
      try {
        parsedPrincipal = JSON.parse(savedPrincipal)
      } catch (_) {}
    }

    // 2. Try active admin session
    const savedAdminSession = localStorage.getItem(ADMIN_SESSION_KEY)
    let parsedSession: Partial<PrincipalProfile> | null = null
    if (savedAdminSession) {
      try {
        parsedSession = JSON.parse(savedAdminSession)
      } catch (_) {}
    }

    // 3. Try official school info
    const savedSchool = localStorage.getItem(SCHOOL_INFO_KEY)
    let parsedSchool: Partial<SchoolInfo> | null = null
    if (savedSchool) {
      try {
        parsedSchool = JSON.parse(savedSchool)
      } catch (_) {}
    }

    const name =
      parsedPrincipal?.name ||
      parsedSession?.name ||
      (parsedPrincipal?.first_name
        ? `${parsedPrincipal.first_name} ${parsedPrincipal.last_name || ''}`.trim()
        : parsedSession?.first_name
        ? `${parsedSession.first_name} ${parsedSession.last_name || ''}`.trim()
        : DEFAULT_PRINCIPAL_PROFILE.name)

    const title =
      parsedPrincipal?.title ||
      parsedSession?.title ||
      DEFAULT_PRINCIPAL_PROFILE.title

    const email =
      parsedPrincipal?.email ||
      parsedSession?.email ||
      DEFAULT_PRINCIPAL_PROFILE.email

    const tcNo =
      parsedPrincipal?.tcNo ||
      parsedSession?.tcNo ||
      DEFAULT_PRINCIPAL_PROFILE.tcNo

    const phone =
      parsedPrincipal?.phone ||
      parsedSession?.phone ||
      DEFAULT_PRINCIPAL_PROFILE.phone

    const schoolName =
      parsedSchool?.officialName ||
      parsedPrincipal?.schoolName ||
      parsedSession?.schoolName ||
      DEFAULT_PRINCIPAL_PROFILE.schoolName

    const twoFactorActive =
      parsedPrincipal?.twoFactorActive ??
      parsedSession?.twoFactorActive ??
      DEFAULT_PRINCIPAL_PROFILE.twoFactorActive

    const role =
      parsedPrincipal?.role ||
      parsedSession?.role ||
      DEFAULT_PRINCIPAL_PROFILE.role

    const username =
      parsedPrincipal?.username ||
      parsedSession?.username ||
      DEFAULT_PRINCIPAL_PROFILE.username

    const parts = name.trim().split(/\s+/)
    const first_name = parts[0] || 'Dr. Uğur'
    const last_name = parts.slice(1).join(' ') || 'UĞURLU'

    return {
      id: parsedSession?.id || 50,
      name,
      title,
      email,
      tcNo,
      phone,
      twoFactorActive,
      schoolName,
      role,
      username,
      first_name,
      last_name,
      loginTime: parsedSession?.loginTime || DEFAULT_PRINCIPAL_PROFILE.loginTime,
      institutionCode: parsedSchool?.institutionCode || '741295',
    }
  } catch (_) {
    return DEFAULT_PRINCIPAL_PROFILE
  }
}

/**
 * Saves the principal profile to persistent storage and active session,
 * syncing across tabs and dispatching custom events.
 */
export function savePrincipalProfile(updates: Partial<PrincipalProfile>): PrincipalProfile {
  if (typeof window === 'undefined') return { ...DEFAULT_PRINCIPAL_PROFILE, ...updates }

  try {
    const current = getStoredPrincipalProfile()
    const name = (updates.name ?? current.name).trim()
    const parts = name.split(/\s+/)
    const first_name = parts[0] || 'Dr. Uğur'
    const last_name = parts.slice(1).join(' ') || 'UĞURLU'

    const isCustomized = updates.name !== undefined ? true : (current.is_customized ?? false)

    const merged: PrincipalProfile = {
      ...current,
      ...updates,
      name,
      first_name,
      last_name,
      title: (updates.title ?? current.title).trim(),
      email: (updates.email ?? current.email).trim(),
      phone: (updates.phone ?? current.phone).trim(),
      tcNo: (updates.tcNo ?? current.tcNo).trim(),
      schoolName: (updates.schoolName ?? current.schoolName).trim(),
      twoFactorActive: updates.twoFactorActive ?? current.twoFactorActive,
      is_customized: isCustomized,
    }

    const serialized = JSON.stringify(merged)
    localStorage.setItem(PRINCIPAL_PROFILE_KEY, serialized)
    localStorage.setItem(ADMIN_SESSION_KEY, serialized)

    try {
      document.cookie = `oxonom_principal_name=${encodeURIComponent(merged.name)}; path=/; max-age=31536000; SameSite=Lax`
      document.cookie = `oxonom_principal_profile=${encodeURIComponent(serialized)}; path=/; max-age=31536000; SameSite=Lax`
    } catch (_) {}

    // Synchronize to backend server so changes persist across all devices (Mobile & PC)
    if (typeof fetch !== 'undefined') {
      fetch('/api/principal/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      }).catch(() => {})
    }

    // Notify all components in current window
    window.dispatchEvent(new CustomEvent('oxonom_admin_updated', { detail: merged }))
    window.dispatchEvent(new CustomEvent('oxonom_principal_updated', { detail: merged }))

    return merged
  } catch (_) {
    return { ...DEFAULT_PRINCIPAL_PROFILE, ...updates }
  }
}

let hasTriggeredServerSync = false

/**
 * Asynchronously fetches latest principal profile from server so phone and PC always show identical data
 */
export async function syncPrincipalProfileFromServer(): Promise<PrincipalProfile | null> {
  if (typeof window === 'undefined') return null

  try {
    // Check if we have a locally customized profile in localStorage
    const localRaw = localStorage.getItem(PRINCIPAL_PROFILE_KEY)
    let localCustomized = false
    let localProfile: PrincipalProfile | null = null
    if (localRaw) {
      try {
        localProfile = JSON.parse(localRaw)
        if (localProfile?.is_customized || (localProfile?.name && localProfile.name.trim() !== DEFAULT_PRINCIPAL_PROFILE.name.trim())) {
          localCustomized = true
        }
      } catch (_) {}
    }

    const res = await fetch('/api/principal/profile', { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    if (data && data.success && data.profile) {
      const serverProf = data.profile as PrincipalProfile

      // If server profile is NOT customized, but client ALREADY IS customized, re-sync client to server!
      if (!serverProf.is_customized && localCustomized && localProfile) {
        fetch('/api/principal/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(localProfile),
        }).catch(() => {})
        return localProfile
      }

      const serialized = JSON.stringify(serverProf)
      localStorage.setItem(PRINCIPAL_PROFILE_KEY, serialized)
      localStorage.setItem(ADMIN_SESSION_KEY, serialized)

      try {
        document.cookie = `oxonom_principal_name=${encodeURIComponent(serverProf.name)}; path=/; max-age=31536000; SameSite=Lax`
        document.cookie = `oxonom_principal_profile=${encodeURIComponent(serialized)}; path=/; max-age=31536000; SameSite=Lax`
      } catch (_) {}

      window.dispatchEvent(new CustomEvent('oxonom_admin_updated', { detail: serverProf }))
      window.dispatchEvent(new CustomEvent('oxonom_principal_updated', { detail: serverProf }))
      return serverProf
    }
  } catch (_) {}
  return null
}

/**
 * Auto-triggers background server sync once per session
 */
export function ensurePrincipalProfileSynced(): void {
  if (typeof window === 'undefined' || hasTriggeredServerSync) return
  hasTriggeredServerSync = true
  syncPrincipalProfileFromServer().catch(() => {})
}

/**
 * Returns saved official school details
 */
export function getStoredSchoolInfo(): SchoolInfo {
  if (typeof window === 'undefined') return DEFAULT_SCHOOL_INFO

  try {
    const saved = localStorage.getItem(SCHOOL_INFO_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...DEFAULT_SCHOOL_INFO, ...parsed }
    }
  } catch (_) {}

  return DEFAULT_SCHOOL_INFO
}

/**
 * Saves school details and syncs school name with principal profile
 */
export function saveSchoolInfo(updates: Partial<SchoolInfo>): SchoolInfo {
  if (typeof window === 'undefined') return { ...DEFAULT_SCHOOL_INFO, ...updates }

  try {
    const current = getStoredSchoolInfo()
    const merged: SchoolInfo = {
      ...current,
      ...updates,
      officialName: (updates.officialName ?? current.officialName).trim(),
      institutionCode: (updates.institutionCode ?? current.institutionCode).trim(),
    }

    localStorage.setItem(SCHOOL_INFO_KEY, JSON.stringify(merged))

    // Sync schoolName to principal profile as well
    if (merged.officialName) {
      savePrincipalProfile({
        schoolName: merged.officialName,
        institutionCode: merged.institutionCode,
      })
    }

    window.dispatchEvent(new CustomEvent('oxonom_school_updated', { detail: merged }))
    return merged
  } catch (_) {
    return { ...DEFAULT_SCHOOL_INFO, ...updates }
  }
}

/**
 * Computes 2-letter uppercase initials from full name (e.g. "Ahmet Yılmaz" -> "AY")
 */
export function getPrincipalInitials(name?: string): string {
  if (!name || !name.trim()) return 'OX'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'OX'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}
