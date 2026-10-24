// apps/web/lib/schools/schoolTenantManager.ts
'use client'

import { getStoredPrincipalProfile } from '@/lib/principal/principalProfileStorage'

export const DEMO_INSTITUTION_CODE = '741295' // Necla Görer İlkokulu / Demo Okulu

/**
 * Returns the currently active school's MEB/Kurum code.
 */
export function getCurrentSchoolCode(): string {
  if (typeof window === 'undefined') return DEMO_INSTITUTION_CODE
  try {
    const p = getStoredPrincipalProfile()
    if (p && p.institutionCode) {
      return String(p.institutionCode).trim()
    }
    const savedCode = localStorage.getItem('oxonom_active_school_code')
    if (savedCode) return savedCode.trim()
  } catch (_) {}
  return DEMO_INSTITUTION_CODE
}

/**
 * Checks if the current school is the pre-seeded Oxonom demo school.
 */
export function isDemoSchool(code?: string): boolean {
  const c = code || getCurrentSchoolCode()
  return c === DEMO_INSTITUTION_CODE
}

/**
 * Storage keys partitioned strictly per school institution code
 */
export function getSchoolClassesKey(code?: string): string {
  return `oxonom_tenant_classes_${code || getCurrentSchoolCode()}`
}

export function getSchoolTeachersKey(code?: string): string {
  return `oxonom_tenant_teachers_${code || getCurrentSchoolCode()}`
}

export function getSchoolStudentsKey(code?: string): string {
  return `oxonom_tenant_students_${code || getCurrentSchoolCode()}`
}

export function getSchoolBoardsKey(code?: string): string {
  return `oxonom_tenant_boards_${code || getCurrentSchoolCode()}`
}

/**
 * Checks if the current principal is in a brand-new, empty school partition
 */
export function isCurrentSchoolEmpty(code?: string): boolean {
  if (typeof window === 'undefined') return false
  const p = getStoredPrincipalProfile()
  if (p && p.isNewEmptySchool) return true
  if (localStorage.getItem('oxonom_is_empty_profile') === 'true') return true

  const c = code || getCurrentSchoolCode()
  if (isDemoSchool(c)) return false

  // Check if school has any classes or students saved
  const savedClasses = localStorage.getItem(getSchoolClassesKey(c))
  if (!savedClasses) return true
  try {
    const parsed = JSON.parse(savedClasses)
    return !Array.isArray(parsed) || parsed.length === 0
  } catch (_) {
    return true
  }
}

/**
 * Load isolated classes for the current school
 */
export function getTenantClasses(code?: string): any[] | null {
  if (typeof window === 'undefined') return null
  const c = code || getCurrentSchoolCode()

  // For newly created or non-demo schools:
  const key = getSchoolClassesKey(c)
  const saved = localStorage.getItem(key)

  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) return parsed
    } catch (_) {}
  }

  // If this is NOT the demo school, IT MUST REMAIN 100% EMPTY by default!
  if (!isDemoSchool(c)) {
    return []
  }

  // Demo school fallback
  return null
}

/**
 * Save isolated classes for the current school
 */
export function saveTenantClasses(classes: any[], code?: string): void {
  if (typeof window === 'undefined') return
  const c = code || getCurrentSchoolCode()
  const key = getSchoolClassesKey(c)
  try {
    localStorage.setItem(key, JSON.stringify(classes))
    // Also dispatch sync event
    window.dispatchEvent(new CustomEvent('oxonom_classes_updated', { detail: { code: c, count: classes.length } }))
  } catch (_) {}
}

/**
 * Load isolated teachers for the current school
 */
export function getTenantTeachers(code?: string): any[] | null {
  if (typeof window === 'undefined') return null
  const c = code || getCurrentSchoolCode()

  const key = getSchoolTeachersKey(c)
  const saved = localStorage.getItem(key)

  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) return parsed
    } catch (_) {}
  }

  // If this is NOT the demo school, return empty array!
  if (!isDemoSchool(c)) {
    return []
  }

  // Demo school fallback
  return null
}

/**
 * Save isolated teachers for the current school
 */
export function saveTenantTeachers(teachers: any[], code?: string): void {
  if (typeof window === 'undefined') return
  const c = code || getCurrentSchoolCode()
  const key = getSchoolTeachersKey(c)
  try {
    localStorage.setItem(key, JSON.stringify(teachers))
    window.dispatchEvent(new CustomEvent('oxonom_teachers_updated', { detail: { code: c, count: teachers.length } }))
  } catch (_) {}
}

/**
 * Load isolated students for the current school
 */
export function getTenantStudents(code?: string): any[] | null {
  if (typeof window === 'undefined') return null
  const c = code || getCurrentSchoolCode()

  const key = getSchoolStudentsKey(c)
  const saved = localStorage.getItem(key)

  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) return parsed
    } catch (_) {}
  }

  // If this is NOT the demo school, return empty array!
  if (!isDemoSchool(c)) {
    return []
  }

  // Demo school fallback
  return null
}

/**
 * Save isolated students for the current school
 */
export function saveTenantStudents(students: any[], code?: string): void {
  if (typeof window === 'undefined') return
  const c = code || getCurrentSchoolCode()
  const key = getSchoolStudentsKey(c)
  try {
    localStorage.setItem(key, JSON.stringify(students))
    window.dispatchEvent(new CustomEvent('oxonom_students_updated', { detail: { code: c, count: students.length } }))
  } catch (_) {}
}

/**
 * Load isolated digital boards for the current school
 */
export function getTenantBoards(code?: string): any[] | null {
  if (typeof window === 'undefined') return null
  const c = code || getCurrentSchoolCode()
  const key = getSchoolBoardsKey(c)
  const saved = localStorage.getItem(key)

  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) return parsed
    } catch (_) {}
  }

  // If this is NOT the demo school, return empty array!
  if (!isDemoSchool(c)) {
    return []
  }

  // Demo school fallback
  return null
}

/**
 * Save isolated digital boards for the current school
 */
export function saveTenantBoards(boards: any[], code?: string): void {
  if (typeof window === 'undefined') return
  const c = code || getCurrentSchoolCode()
  const key = getSchoolBoardsKey(c)
  try {
    localStorage.setItem(key, JSON.stringify(boards))
    window.dispatchEvent(new CustomEvent('oxonom_boards_updated', { detail: { code: c, count: boards.length } }))
  } catch (_) {}
}

export type SchoolSector = 'devlet' | 'ozel' | 'kurs'

/**
 * Gets whether the school is a State Public School (Devlet), Private School (Özel), or Course (Kurs).
 */
export function getSchoolSector(code?: string): SchoolSector {
  if (typeof window === 'undefined') return 'devlet'
  const c = code || getCurrentSchoolCode()

  // 1. Direct explicit sector key
  const savedSector = localStorage.getItem(`oxonom_school_sector_${c}`)
  if (savedSector === 'ozel' || savedSector === 'kurs' || savedSector === 'devlet') {
    return savedSector
  }

  // 2. Check superadmin schools database
  try {
    const rawSchools = localStorage.getItem('oxonom_superadmin_schools')
    if (rawSchools) {
      const list = JSON.parse(rawSchools)
      const found = list.find((s: any) => s.code === c || s.id === c)
      if (found) {
        if (found.schoolSector) return found.schoolSector
        const typeStr = (found.type || '').toLowerCase()
        if (typeStr.includes('kurs') || typeStr.includes('etüt')) return 'kurs'
        if (typeStr.includes('özel') || typeStr.includes('kolej')) return 'ozel'
        if (typeStr.includes('devlet') || typeStr.includes('meb') || typeStr.includes('resmi')) return 'devlet'
      }
    }
  } catch (_) {}

  // 3. Check principal profile
  try {
    const p = getStoredPrincipalProfile()
    if (p) {
      const pSchool = (p.schoolName || '').toLowerCase()
      if (pSchool.includes('kurs') || pSchool.includes('etüt')) return 'kurs'
      if (pSchool.includes('özel') || pSchool.includes('kolej')) return 'ozel'
    }
  } catch (_) {}

  return 'devlet'
}

/**
 * Returns true if finance, tuition, and teacher salary modules are permitted.
 * In State Public Schools (Devlet Okulları), teachers are on civil service payroll (KBS)
 * and education is free, so finance/salary tabs are strictly hidden!
 */
export function isFinanceEnabled(code?: string): boolean {
  const sector = getSchoolSector(code)
  return sector === 'ozel' || sector === 'kurs'
}

/**
 * Saves school sector explicitly
 */
export function setSchoolSector(code: string, sector: SchoolSector): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`oxonom_school_sector_${code}`, sector)
  } catch (_) {}
}
