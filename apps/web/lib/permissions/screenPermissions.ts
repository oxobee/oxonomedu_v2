// apps/web/lib/permissions/screenPermissions.ts
'use client'

import { getCurrentSchoolCode } from '@/lib/schools/schoolTenantManager'

export interface ScreenPermission {
  id: string
  label: string
  category: string
  description: string
  defaultForRoles: string[]
}

export interface RoleDefinition {
  id: string
  title: string
  badge: string
  description: string
  color: 'purple' | 'blue' | 'emerald' | 'amber'
}

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    id: 'admin_assist',
    title: 'Müdür Yardımcısı',
    badge: 'İdari Yönetici',
    description: 'Okul geneli ders dağılımı, nöbet çizelgeleri, zümre onayları ve idari ekran yetkileri.',
    color: 'purple',
  },
  {
    id: 'head_dept',
    title: 'Zümre Başkanı',
    badge: 'Akademik Lider',
    description: 'Zümre kararları, MEB müfredatı, ortak sınav planları ve branş koordinasyonu.',
    color: 'blue',
  },
  {
    id: 'guidance',
    title: 'Rehber Öğretmen',
    badge: 'Rehberlik & Psikolojik Danışmanlık',
    description: 'Öğrenci kütük dosyaları, aile/rehberlik görüşme notları ve başarı takibi.',
    color: 'emerald',
  },
  {
    id: 'teacher',
    title: 'Sınıf / Branş Öğretmeni',
    badge: 'Eğitim Kadrosu',
    description: 'Ders programı, günlük yoklama, MEB e-Okul sınav notları, ödevler ve akıllı tahta erişimi.',
    color: 'amber',
  },
]

export const SYSTEM_SCREEN_PERMISSIONS: ScreenPermission[] = [
  // Kategori 1: Temel Öğretmen & Program
  {
    id: 'teacher_dashboard',
    label: 'Dashboard & Günlük Akış',
    category: 'Temel & Program',
    description: 'Günün dersleri, hızlı duyurular ve şube istatistikleri',
    defaultForRoles: ['admin_assist', 'head_dept', 'guidance', 'teacher'],
  },
  {
    id: 'teacher_schedule',
    label: 'Haftalık Ders Programı',
    category: 'Temel & Program',
    description: 'Kendi haftalık ders çizelgesi ve derslik yerleşimleri',
    defaultForRoles: ['admin_assist', 'head_dept', 'guidance', 'teacher'],
  },
  {
    id: 'teacher_classes',
    label: 'Sınıf & Şube Listeleri',
    category: 'Temel & Program',
    description: 'Girdiği şubelerin mevcudu ve öğrenci listeleri',
    defaultForRoles: ['admin_assist', 'head_dept', 'guidance', 'teacher'],
  },
  {
    id: 'teacher_curriculum',
    label: 'MEB Müfredat & Yıllık Planlar',
    category: 'Temel & Program',
    description: 'Bakanlık kazanımları, ünite içerikleri ve yıllık planlar',
    defaultForRoles: ['admin_assist', 'head_dept', 'teacher'],
  },

  // Kategori 2: Ölçme, Değerlendirme & Yoklama
  {
    id: 'teacher_attendance',
    label: 'Günlük Yoklama Alma',
    category: 'Ölçme & Yoklama',
    description: 'Ders saati bazlı yoklama alma ve devamsızlık işleme',
    defaultForRoles: ['admin_assist', 'head_dept', 'teacher'],
  },
  {
    id: 'teacher_attendance_history',
    label: 'Geçmiş Yoklama Arşivi',
    category: 'Ölçme & Yoklama',
    description: 'Tarihsel devamsızlık filtreleme ve sınıf raporları',
    defaultForRoles: ['admin_assist', 'head_dept', 'teacher'],
  },
  {
    id: 'teacher_exams',
    label: 'Sınav Tanımlama & Not Girişi',
    category: 'Ölçme & Yoklama',
    description: 'MEB e-Okul formatında 1. ve 2. yazılı notlarını kaydetme',
    defaultForRoles: ['admin_assist', 'head_dept', 'teacher'],
  },
  {
    id: 'teacher_assignments',
    label: 'Ödev & Proje Yönetimi',
    category: 'Ölçme & Yoklama',
    description: 'Ödev oluşturma, teslim kontrolü ve değerlendirme',
    defaultForRoles: ['admin_assist', 'head_dept', 'teacher'],
  },

  // Kategori 3: Rehberlik & Öğrenci Dosyaları
  {
    id: 'teacher_guidance',
    label: 'Rehberlik Görüşme Notları',
    category: 'Rehberlik & Dosyalar',
    description: 'Öğrenci rehberlik, gelişim ve aile görüşme kayıtları',
    defaultForRoles: ['admin_assist', 'guidance'],
  },
  {
    id: 'teacher_student_dossier',
    label: 'Öğrenci Kütük Dosyası',
    category: 'Rehberlik & Dosyalar',
    description: 'Öğrencinin sağlık, veli, iletişim ve özlük detayları',
    defaultForRoles: ['admin_assist', 'guidance', 'head_dept'],
  },
  {
    id: 'teacher_academic_records',
    label: 'Akademik Başarı Karnesi',
    category: 'Rehberlik & Dosyalar',
    description: 'Ders bazlı başarı grafikleri ve gelişim istatistikleri',
    defaultForRoles: ['admin_assist', 'guidance', 'head_dept', 'teacher'],
  },

  // Kategori 4: Donanım & Akıllı Tahtalar
  {
    id: 'teacher_smartboard',
    label: 'Akıllı Tahta Canlı İzleme',
    category: 'Akıllı Tahta & Donanım',
    description: 'Aktif sınıf tahtalarının durumunu ve oturumlarını görme',
    defaultForRoles: ['admin_assist', 'head_dept', 'teacher'],
  },
  {
    id: 'teacher_smartboard_lock',
    label: 'Tahta Oturumunu Kapatma',
    category: 'Akıllı Tahta & Donanım',
    description: 'Akıllı tahtayı uzaktan kapatabilme ve kilitleme yetkisi',
    defaultForRoles: ['admin_assist', 'head_dept'],
  },

  // Kategori 5: Dosya, Rapor ve İletişim
  {
    id: 'teacher_reports',
    label: 'Raporlarım & Şube İstatistikleri',
    category: 'Raporlar & Dosyalar',
    description: 'Şube bazlı başarı, ödev ve devamsızlık analiz grafikleri',
    defaultForRoles: ['admin_assist', 'head_dept', 'guidance'],
  },
  {
    id: 'teacher_library',
    label: 'Eğitim Kütüphanesi & Dosyalar',
    category: 'Raporlar & Dosyalar',
    description: 'Kişisel ders materyalleri ve ortak zümre arşivi',
    defaultForRoles: ['admin_assist', 'head_dept', 'guidance', 'teacher'],
  },
  {
    id: 'teacher_notifications',
    label: 'Veliye / Öğrenciye Bildirim Gönderme',
    category: 'Raporlar & Dosyalar',
    description: 'Öğrenci veya veliye anlık bildirim ve SMS iletme',
    defaultForRoles: ['admin_assist', 'guidance', 'head_dept'],
  },

  // Kategori 6: İdari & Yönetim Yetkileri
  {
    id: 'admin_view_schedule',
    label: 'Haftalık Ders Programı (Okul Geneli)',
    category: 'İdari & Yönetim',
    description: 'Okul genelindeki tüm öğretmenlerin ve sınıfların haftalık ders dağılımı',
    defaultForRoles: ['admin_assist'],
  },
  {
    id: 'admin_view_teachers',
    label: 'Öğretmen Kadrosu & Nöbet Çizelgesi',
    category: 'İdari & Yönetim',
    description: 'Kurum personeli, nöbet günleri ve boş saat çizelgeleri',
    defaultForRoles: ['admin_assist'],
  },
  {
    id: 'admin_branch_head',
    label: 'Zümre Onayları & Tutanaklar',
    category: 'İdari & Yönetim',
    description: 'Zümre kararlarını onaylama ve resmi tutanak tutma',
    defaultForRoles: ['admin_assist', 'head_dept'],
  },
]

export const PERMISSION_CATEGORIES = Array.from(
  new Set(SYSTEM_SCREEN_PERMISSIONS.map((p) => p.category))
)

export function getRoleDefaultPermissions(roleId: string): string[] {
  return SYSTEM_SCREEN_PERMISSIONS
    .filter((p) => p.defaultForRoles.includes(roleId))
    .map((p) => p.id)
}

/**
 * Storage helpers for school-isolated role permissions
 */
export function getSchoolRolePermissionsKey(code?: string): string {
  return `oxonom_tenant_role_permissions_${code || getCurrentSchoolCode()}`
}

export function getTenantRolePermissions(roleId: string, code?: string): string[] {
  if (typeof window === 'undefined') return getRoleDefaultPermissions(roleId)
  const key = getSchoolRolePermissionsKey(code)
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && Array.isArray(parsed[roleId])) {
        return parsed[roleId]
      }
    }
  } catch (_) {}
  return getRoleDefaultPermissions(roleId)
}

export function saveTenantRolePermissions(roleId: string, permissions: string[], code?: string): void {
  if (typeof window === 'undefined') return
  const schoolCode = code || getCurrentSchoolCode()
  const key = getSchoolRolePermissionsKey(schoolCode)
  try {
    let allRoles: Record<string, string[]> = {}
    const raw = localStorage.getItem(key)
    if (raw) {
      allRoles = JSON.parse(raw) || {}
    }
    allRoles[roleId] = permissions
    localStorage.setItem(key, JSON.stringify(allRoles))
    window.dispatchEvent(
      new CustomEvent('oxonom_permissions_updated', {
        detail: { schoolCode, roleId, permissions, type: 'role' },
      })
    )
  } catch (_) {}
}

export function getTeacherCustomPermissions(teacherId: string, roleTemplate: string = 'teacher', code?: string): string[] {
  if (typeof window === 'undefined') return getTenantRolePermissions(roleTemplate, code)
  try {
    const raw = localStorage.getItem(`oxonom_teacher_permissions_${teacherId}`)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (_) {}
  return getTenantRolePermissions(roleTemplate, code)
}

export function saveTeacherCustomPermissions(teacherId: string, permissions: string[], code?: string): void {
  if (typeof window === 'undefined') return
  const schoolCode = code || getCurrentSchoolCode()
  try {
    localStorage.setItem(`oxonom_teacher_permissions_${teacherId}`, JSON.stringify(permissions))
    window.dispatchEvent(
      new CustomEvent('oxonom_permissions_updated', {
        detail: { schoolCode, teacherId, permissions, type: 'teacher' },
      })
    )
  } catch (_) {}
}
