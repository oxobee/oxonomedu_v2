import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  FileCheck,
  Sparkles,
  BookmarkCheck,
  TrendingUp,
  MessageSquare,
  Calendar,
  Settings,
  LucideIcon,
  Radio,
  CalendarDays,
  Gamepad2,
} from 'lucide-react'

export type FeatureStatus = 'active' | 'passive' | 'restricted'

export interface StudentSubMenuItem {
  id: string
  label: string
  path: string
  status: FeatureStatus
  description?: string
  badge?: string
}

export interface StudentMenuItem {
  id: string
  label: string
  path: string
  icon: LucideIcon
  status: FeatureStatus
  sortOrder: number
  description: string
  badge?: string
  category: 'main' | 'academic' | 'learning' | 'personal' | 'settings'
  children?: StudentSubMenuItem[]
}

export const STUDENT_MENU_CONFIG: StudentMenuItem[] = [
  {
    id: 'dashboard',
    label: 'Ana Sayfa',
    path: '/student/dashboard',
    icon: LayoutDashboard,
    status: 'active',
    sortOrder: 1,
    category: 'main',
    description: 'Günlük ders akışı, sıradaki ders, bekleyen ödevler ve öğrenci genel görünümü.',
  },
  {
    id: 'gamestudio',
    label: 'Game Studio',
    path: '/student/gamestudio',
    icon: Gamepad2,
    status: 'active',
    sortOrder: 2,
    badge: 'Yeni Mağaza',
    category: 'learning',
    description: 'Eğitici oyun mağazası: Matematik, fen, kodlama, zeka ve dil maceraları.',
  },

  {
    id: 'courses',
    label: 'Derslerim',
    path: '/student/courses',
    icon: GraduationCap,
    status: 'active',
    sortOrder: 2,
    category: 'academic',
    description: 'Kayıtlı olunan dersler, haftalık ders saatleri, ders öğretmenleri ve müfredat içerikleri.',
    children: [
      { id: 'courses-list', label: 'Tüm Derslerim', path: '/student/courses', status: 'active' },
      { id: 'courses-curriculum', label: 'Müfredat & Konular', path: '/student/courses#curriculum', status: 'active' },
    ],
  },
  {
    id: 'assignments',
    label: 'Ödevlerim',
    path: '/student/assignments',
    icon: BookOpen,
    status: 'active',
    sortOrder: 3,
    category: 'academic',
    description: 'Öğretmenler tarafından verilen ödevler, teslim durumları, dosya yükleme ve notlar.',
    children: [
      { id: 'assignments-pending', label: 'Bekleyen Ödevler', path: '/student/assignments?tab=pending', status: 'active' },
      { id: 'assignments-completed', label: 'Tamamlananlar', path: '/student/assignments?tab=completed', status: 'active' },
    ],
  },
  {
    id: 'assessments',
    label: 'Sınavlar ve Notlar',
    path: '/student/assessments',
    icon: FileCheck,
    status: 'active',
    sortOrder: 4,
    category: 'academic',
    description: 'Yazılı sınavlar, sözlü değerlendirmeler, quizler ve yayımlanmış resmi sınav sonuçları.',
    children: [
      { id: 'assessments-exams', label: 'Yazılı Sınavlar', path: '/student/assessments/exams', status: 'active' },
      { id: 'assessments-quizzes', label: 'Quizler', path: '/student/assessments/quizzes', status: 'active' },
      { id: 'assessments-results', label: 'Sınav Sonuçları', path: '/student/assessments/results', status: 'active' },
    ],
  },
  {
    id: 'academic-calendar',
    label: 'Akademik Takvim & Etkinlikler',
    path: '/student/academic-calendar',
    icon: CalendarDays,
    status: 'active',
    sortOrder: 4.5,
    category: 'academic',
    description: 'MEB 2026-2027 resmi çalışma takvimi, sınav haftaları, ara tatiller ve okul etkinlikleri.',
  },
  {
    id: 'learn',
    label: 'Öğren ve Keşfet',
    path: '/student/learn',
    icon: Sparkles,
    status: 'active',
    sortOrder: 5,
    category: 'learning',
    description: 'İnteraktif öğrenme etkinlikleri, konu testleri, bilimsel simülasyonlar ve eğitici oyunlar.',
    children: [
      { id: 'learn-subjects', label: 'Ders Konuları', path: '/student/learn/subjects', status: 'active' },
      { id: 'learn-activities', label: 'Etkinlikler & Simülasyon', path: '/student/learn/activities', status: 'active' },
      { id: 'learn-games', label: 'Eğitici Oyunlar', path: '/student/learn/games', status: 'active' },
    ],
  },
  {
    id: 'library',
    label: 'Kitaplık',
    path: '/student/library',
    icon: BookOpen,
    status: 'active',
    sortOrder: 6,
    category: 'learning',
    description: 'MEB ders kitapları, etkileşimli dijital kitaplar ve okuma arşivi.',
    children: [
      { id: 'library-all', label: 'Tüm Kitaplar', path: '/student/library', status: 'active' },
      { id: 'library-reading', label: 'Devam Edenler', path: '/student/library?status=in_progress', status: 'active' },
      { id: 'library-favorites', label: 'Favorilerim', path: '/student/library?status=favorites', status: 'active' },
    ],
  },
  {
    id: 'progress',
    label: 'Gelişimim',
    path: '/student/progress',
    icon: TrendingUp,
    status: 'active',
    sortOrder: 7,
    category: 'personal',
    description: 'Akademik not ortalaması, çalışma analizi, devamlılık durumu ve ödev istatistikleri.',
    children: [
      { id: 'progress-subjects', label: 'Ders Başarısı & Analiz', path: '/student/progress/subjects', status: 'active' },
    ],
  },
  {
    id: 'communication',
    label: 'Mesajlar ve Duyurular',
    path: '/student/communication',
    icon: MessageSquare,
    status: 'active',
    sortOrder: 8,
    category: 'personal',
    description: 'Okul ve 9-A sınıfı resmi duyuruları, öğretmen bildirimleri ve önemli okul mesajları.',
    children: [
      { id: 'comm-announcements', label: 'Duyurular', path: '/student/communication/announcements', status: 'active' },
      { id: 'comm-messages', label: 'Öğretmen Mesajları', path: '/student/communication/messages', status: 'active' },
      { id: 'comm-notifications', label: 'Bildirimler', path: '/student/communication/notifications', status: 'active' },
    ],
  },
  {
    id: 'planner',
    label: 'Defterim ve Planlayıcım',
    path: '/student/planner',
    icon: Calendar,
    status: 'active',
    sortOrder: 9,
    category: 'personal',
    description: 'Kişisel çalışma ajandası, günlük ders çalışma hedefleri ve yapılacaklar listesi.',
    children: [
      { id: 'planner-calendar', label: 'Çalışma Takvimi', path: '/student/planner/calendar', status: 'active' },
      { id: 'planner-notes', label: 'Ders Notlarım', path: '/student/planner/notes', status: 'active' },
      { id: 'planner-tasks', label: 'Görevlerim & Yapılacaklar', path: '/student/planner/tasks', status: 'active' },
    ],
  },
  {
    id: 'settings',
    label: 'Profilim ve Ayarlar',
    path: '/student/settings',
    icon: Settings,
    status: 'active',
    sortOrder: 10,
    category: 'settings',
    description: 'Öğrenci kimlik bilgileri, veli irtibat bilgisi, arayüz teması ve oturum yönetimi.',
    children: [
      { id: 'settings-profile', label: 'Öğrenci Profili', path: '/student/settings/profile', status: 'active' },
      { id: 'settings-notifications', label: 'Bildirim Ayarları', path: '/student/settings/notifications', status: 'active' },
      { id: 'settings-accessibility', label: 'Erişilebilirlik & Tema', path: '/student/settings/accessibility', status: 'active' },
      { id: 'settings-security', label: 'Güvenlik & Oturum', path: '/student/settings/security', status: 'active' },
    ],
  },
]

export const DOCK_STUDENT_ITEMS = [
  { id: 'dashboard', label: 'Ana Sayfa', path: '/student/dashboard', icon: LayoutDashboard },
  { id: 'courses', label: 'Derslerim', path: '/student/courses', icon: GraduationCap },
  { id: 'assignments', label: 'Ödevlerim', path: '/student/assignments', icon: BookOpen },
  { id: 'learn', label: 'Öğren', path: '/student/learn', icon: Sparkles },
]

export function getStudentMenuItemByPath(pathname: string): StudentMenuItem | undefined {
  return STUDENT_MENU_CONFIG.find(
    (item) => pathname === item.path || pathname.startsWith(item.path + '/')
  )
}
