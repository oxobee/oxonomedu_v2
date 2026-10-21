import {
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  Users,
  Calendar,
  Tv,
  BookOpen,
  BarChart3,
  Megaphone,
  Settings,
  ShieldCheck,
  LucideIcon,
  Sparkles,
  Building2,
  FileCheck,
  HeartHandshake,
  FolderKanban,
  CalendarDays,
  ShieldAlert,
  Radio,
  Sliders,
  Gamepad2,
} from 'lucide-react'

export type FeatureStatus = 'active' | 'passive' | 'restricted'

export interface PrincipalSubMenuItem {
  id: string
  label: string
  path: string
  status: FeatureStatus
  description?: string
  missingDependency?: string
}

export interface PrincipalMenuItem {
  id: string
  label: string
  path: string
  icon: LucideIcon
  status: FeatureStatus
  sortOrder: number
  description: string
  badge?: string
  category: 'management' | 'staff' | 'students' | 'academic' | 'hardware' | 'additional'
  missingDependency?: string
  hidden?: boolean
  children?: PrincipalSubMenuItem[]
}

export const PRINCIPAL_CATEGORIES: Array<{
  id: PrincipalMenuItem['category']
  title: string
}> = [
  { id: 'management', title: 'Yönetim & Genel Bakış' },
  { id: 'staff', title: 'Öğretmenler & Kadro' },
  { id: 'students', title: 'Öğrenciler & Sınıflar' },
  { id: 'academic', title: 'Akademik & Ders Programı' },
  { id: 'hardware', title: 'Donanım & Akıllı Sistem' },
  { id: 'additional', title: 'Diğer İdari Modüller' },
]

export const PRINCIPAL_MENU_CONFIG: PrincipalMenuItem[] = [
  // ── 1. YÖNETİM & GENEL BAKIŞ ──
  {
    id: 'dashboard',
    label: 'Genel Bakış & İdare',
    path: '/principal/dashboard',
    icon: LayoutDashboard,
    status: 'active',
    sortOrder: 1,
    category: 'management',
    description: 'Okul mevcudu, günlük devamsızlık durumu, açık tahtalar ve yönetici hızlı aksiyonları.',
  },
  {
    id: 'settings',
    label: 'Kurum & Profil Ayarları',
    path: '/principal/settings',
    icon: Settings,
    status: 'active',
    sortOrder: 2,
    category: 'management',
    description: 'Okul kurumsal bilgileri, müdür kimliği, 2FA güvenlik ayarları ve sistem tercihleri.',
  },

  // ── 2. ÖĞRETMENLER & KADRO ──
  {
    id: 'teachers',
    label: 'Öğretmenler & Kadro',
    path: '/principal/teachers',
    icon: Briefcase,
    status: 'active',
    sortOrder: 3,
    category: 'staff',
    badge: '1 Öğretmen',
    description: 'Öğretmen kadrosu, branş dağılımı, özlük dosyaları, yetkilendirme ve avans/ek ders yönetimi.',
    children: [
      { id: 'teachers-list', label: 'Öğretmen Listesi', path: '/principal/teachers', status: 'active' },
      { id: 'teachers-workspace', label: 'Öğretmen Portalı (Ebru TEKNECİ)', path: '/teacher/dashboard', status: 'active' },
      { id: 'teachers-assign', label: 'Ders Görevlendirme', path: '/principal/teachers?action=assign', status: 'active' },
      { id: 'teachers-duties', label: 'Nöbet Çizelgesi', path: '/principal/teachers?tab=nobet', status: 'active' },
      { id: 'teachers-perm', label: 'Yetkilendirme Matrisi', path: '/principal/teachers?tab=yetkiler', status: 'active' },
    ],
  },

  // ── 3. ÖĞRENCİLER & SINIFLAR ──
  {
    id: 'students',
    label: 'Öğrenciler & Kayıt',
    path: '/principal/students',
    icon: GraduationCap,
    status: 'active',
    sortOrder: 4,
    category: 'students',
    badge: '1 Öğrenci',
    description: 'Kapsamlı öğrenci kütük kayıtları, nüfus & veli bilgileri, resmi evraklar ve nakil işlemleri.',
  },
  {
    id: 'classes',
    label: 'Sınıflar & Şubeler',
    path: '/principal/classes',
    icon: Users,
    status: 'active',
    sortOrder: 5,
    category: 'students',
    description: 'Sınıf listeleri, yeni sınıf tanımlama, rehber öğretmenler ve dönem sonu terfi/nakil motoru.',
  },

  // ── 4. AKADEMİK & DERS PROGRAMI ──
  {
    id: 'curriculum',
    label: 'Haftalık Ders Programı',
    path: '/principal/curriculum',
    icon: Calendar,
    status: 'active',
    sortOrder: 6,
    category: 'academic',
    description: 'Haftalık ders programı, sınıf çizelgeleri, ders saatleri dağılımı ve zümre müfredat koordinasyonu.',
  },
  {
    id: 'academic-calendar',
    label: 'Akademik Takvim & Etkinlikler',
    path: '/principal/academic-calendar',
    icon: CalendarDays,
    status: 'active',
    sortOrder: 7,
    category: 'academic',
    description: 'MEB 2026-2027 resmi çalışma takvimi, ortak sınav haftaları, tatiller ve etkinlik yönetimi.',
  },
  {
    id: 'reports',
    label: 'İdari Raporlar & İstatistik',
    path: '/principal/reports',
    icon: BarChart3,
    status: 'active',
    sortOrder: 8,
    category: 'academic',
    description: 'Okul geneli devamsızlık analizleri, akademik başarı grafikleri ve resmi e-Okul çıktıları.',
  },
  {
    id: 'library-management',
    label: 'Kitaplık Yönetimi',
    path: '/principal/library',
    icon: BookOpen,
    status: 'active',
    sortOrder: 8.5,
    category: 'academic',
    badge: 'Müfredat',
    description: 'Sınıf bazında MEB ders kitaplarının öğrenciye gösterilme ve gizlenme ayarları.',
  },

  // ── 5. DİJİTAL SİSTEMLER & PANO ──
  {
    id: 'pano',
    label: 'Dijital Okul Panosu',
    path: '/pano',
    icon: Tv,
    status: 'active',
    sortOrder: 9,
    category: 'hardware',
    badge: 'Canlı',
    description: 'Derslik ve okul koridorlarında yayınlanan dijital nöbetçi, ders saati ve duyuru panosu.',
  },

  // ── 6. DİĞER İDARİ MODÜLLER (08 — 14) ──
  {
    id: 'parents',
    label: 'Veli Yönetimi (08)',
    path: '/m-admin-parents',
    icon: HeartHandshake,
    status: 'passive',
    sortOrder: 10,
    category: 'additional',
    badge: 'Yakında',
    description: 'Veli künyeleri, öğrenci eşleştirmeleri, veli hesapları ve iletişim izinleri.',
    missingDependency: 'Veli mobil uygulaması ve SMS servis entegrasyonu tamamlandığında aktif olacaktır.',
  },
  {
    id: 'announcements',
    label: 'Duyurular & SMS',
    path: '/principal/announcements',
    icon: Megaphone,
    status: 'active',
    sortOrder: 11,
    category: 'additional',
    badge: 'MEB SMS',
    description: 'Okul geneli duyurular, veli/öğretmen SMS gönderimleri, hazır şablonlar ve pano yönetimi.',
  },
  {
    id: 'library',
    label: 'İçerik Kütüphanesi (11)',
    path: '/m-admin-library',
    icon: FolderKanban,
    status: 'passive',
    sortOrder: 12,
    category: 'additional',
    badge: 'Yakında',
    description: 'Eğitsel oyunlar, ders materyalleri, çalışma kağıtları ve video içerikler.',
    missingDependency: 'Kurumsal dijital arşiv modülü tamamlandığında aktif olacaktır.',
  },
  {
    id: 'calendar',
    label: 'Okul Takvimi (12)',
    path: '/m-admin-calendar',
    icon: CalendarDays,
    status: 'passive',
    sortOrder: 13,
    category: 'additional',
    badge: 'Yakında',
    description: 'Resmi tatiller, sınav tarihleri, veli toplantıları ve akademik takvim planı.',
    missingDependency: 'MEB Çalışma Takvimi API senkronizasyonu tamamlandığında aktif olacaktır.',
  },
  {
    id: 'security',
    label: 'Yetki & Güvenlik (13)',
    path: '/m-admin-security',
    icon: ShieldAlert,
    status: 'passive',
    sortOrder: 14,
    category: 'additional',
    badge: 'Yakında',
    description: 'Yönetici hesapları, roller, denetim günlüğü, KVKK ve oturum kayıtları.',
    missingDependency: 'Detaylı audit log motoru tamamlandığında aktif olacaktır.',
  },
  {
    id: 'gamestudio',
    label: 'Game Studio',
    path: '/principal/gamestudio',
    icon: Gamepad2,
    status: 'active',
    sortOrder: 15,
    category: 'additional',
    badge: 'Çok Yakında',
    description: 'Eğitici oyun mağazası ve okul geneli oyun izinleri kontrolü.',
  },
]

export function getPrincipalMenuItemByPath(pathname: string): PrincipalMenuItem | undefined {
  const clean = pathname.split('?')[0]
  const exact = PRINCIPAL_MENU_CONFIG.find((m) => m.path === clean)
  if (exact) return exact
  return PRINCIPAL_MENU_CONFIG.find((m) => clean.startsWith(m.path))
}
