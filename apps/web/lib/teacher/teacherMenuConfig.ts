import {
  LayoutDashboard,
  Calendar,
  Users,
  CheckSquare,
  BookOpen,
  Award,
  Tv,
  Sparkles,
  FolderOpen,
  MessageSquare,
  TrendingUp,
  FileText,
  BarChart3,
  Settings,
  LucideIcon,
  CalendarDays,
  Monitor,
  Gamepad2,
} from 'lucide-react'

export type FeatureStatus = 'active' | 'passive' | 'restricted'

export interface TeacherSubMenuItem {
  id: string
  label: string
  path: string
  status: FeatureStatus
  description?: string
  missingDependency?: string
}

export interface TeacherMenuItem {
  id: string
  label: string
  path: string
  icon: LucideIcon
  status: FeatureStatus
  sortOrder: number
  description: string
  missingDependency?: string
  hidden?: boolean
  children?: TeacherSubMenuItem[]
  openInNewTab?: boolean
  badge?: string
  category?: 'DERSLER & YÖNETİM' | 'ÖLÇME & DEĞERLENDİRME' | 'KAYNAKLAR & İLETİŞİM' | 'DİĞER'
}

export const TEACHER_MENU_CONFIG: TeacherMenuItem[] = [
  // ── DERSLER & YÖNETİM ──
  {
    id: 'dashboard',
    label: 'Ana Sayfa',
    path: '/teacher/dashboard',
    icon: LayoutDashboard,
    status: 'active',
    sortOrder: 1,
    category: 'DERSLER & YÖNETİM',
    description: 'Günlük ders akışı, sıradaki ders, akıllı tahta bağlantısı ve hızlı öğretmen işlemleri.',
  },
  {
    id: 'schedule',
    label: 'Derslerim ve Programım',
    path: '/teacher/schedule',
    icon: Calendar,
    status: 'active',
    sortOrder: 2,
    category: 'DERSLER & YÖNETİM',
    description: 'Haftalık ve günlük ders programı, sınıf saatleri, ders kazanımları ve tahtayla başlatma.',
    children: [
      { id: 'schedule-daily', label: 'Günlük Program', path: '/teacher/schedule/daily', status: 'active', description: 'Bugünün ders saatleri ve sınıfları' },
      { id: 'schedule-weekly', label: 'Haftalık Program', path: '/teacher/schedule/weekly', status: 'active', description: 'Tüm haftanın ders dağılımı' },
      { id: 'schedule-lesson-plans', label: 'Ders Planları', path: '/teacher/schedule/lesson-plans', status: 'active', description: 'Kazanım ve günlük ders planları' },
    ],
  },
  {
    id: 'teacher-courses',
    label: 'Öğrenci Ders Yönetimi',
    path: '/teacher/courses',
    icon: BookOpen,
    status: 'active',
    sortOrder: 3,
    category: 'DERSLER & YÖNETİM',
    description: 'Öğrencilerin Derslerim ekranını yönetme: Müfredat kitaplarını gizle/göster, materyal ve çalışma yükleme, sınav ve not ekleme.',
    children: [
      { id: 'teacher-courses-all', label: 'Ders İçerikleri & Kitaplar', path: '/teacher/courses', status: 'active', description: 'Müfredat kitapları görünürlüğü ve ders materyalleri' },
      { id: 'teacher-courses-materials', label: 'Materyal & Dosya Ekle', path: '/teacher/courses?tab=materials', status: 'active', description: 'Sınıfa veya öğrenciye materyal yükleme' },
      { id: 'teacher-courses-exams', label: 'Sınav & Not Yönetimi', path: '/teacher/courses?tab=exams', status: 'active', description: 'Yazılı ve performans notları' },
    ],
  },
  {
    id: 'classes',
    label: 'Sınıflarım ve Öğrencilerim',
    path: '/teacher/classes',
    icon: Users,
    status: 'active',
    sortOrder: 4,
    category: 'DERSLER & YÖNETİM',
    description: 'Atanmış şubeler, sınıf listeleri, detaylı öğrenci profilleri ve veli iletişim bilgileri.',
    children: [
      { id: 'classes-list', label: 'Sınıf Listeleri', path: '/teacher/classes', status: 'active' },
      { id: 'classes-groups', label: 'Çalışma Grupları', path: '/teacher/classes/groups', status: 'passive', description: 'Sınıf içi proje ve etkinlik çalışma grupları', missingDependency: 'Grup yönetimi ve dinamik kümeleme veri modeli' },
    ],
  },
  {
    id: 'attendance',
    label: 'Yoklama ve Devam',
    path: '/teacher/attendance',
    icon: CheckSquare,
    status: 'active',
    sortOrder: 5,
    category: 'DERSLER & YÖNETİM',
    description: 'Ders bazlı pratik dokunmatik yoklama, devam takibi ve sınıf mevcudu kaydı.',
    children: [
      { id: 'attendance-take', label: 'Yoklama Al', path: '/teacher/attendance/take', status: 'active', description: 'Aktif ders için yoklama girişi' },
      { id: 'attendance-history', label: 'Geçmiş Yoklamalar', path: '/teacher/attendance/history', status: 'active', description: 'Kaydedilmiş geçmiş yoklama kayıtları' },
      { id: 'attendance-reports', label: 'e-Okul / Devam Raporları', path: '/teacher/attendance/reports', status: 'passive', description: 'Resmi MEB e-Okul devamsızlık aktarımı', missingDependency: 'MEB e-Okul resmi API entegrasyonu' },
    ],
  },

  // ── ÖLÇME & DEĞERLENDİRME ──
  {
    id: 'assignments',
    label: 'Ödev ve Çalışmalar',
    path: '/teacher/assignments',
    icon: BookOpen,
    status: 'active',
    sortOrder: 6,
    category: 'ÖLÇME & DEĞERLENDİRME',
    description: 'Ödev oluşturma, yayınlama, öğrenci teslimlerini inceleme ve puanlama/geri bildirim.',
    children: [
      { id: 'assignments-list', label: 'Ödev Listesi', path: '/teacher/assignments', status: 'active' },
      { id: 'assignments-create', label: 'Yeni Ödev Oluştur', path: '/teacher/assignments/create', status: 'active' },
      { id: 'assignments-submissions', label: 'Teslimler & Değerlendirme', path: '/teacher/assignments/submissions', status: 'active' },
    ],
  },
  {
    id: 'agenda',
    label: 'Ajanda',
    path: '/teacher/agenda',
    icon: CalendarDays,
    status: 'active',
    sortOrder: 7,
    category: 'ÖLÇME & DEĞERLENDİRME',
    description: 'Renkli kategorize ders notları, zümre toplantıları ve öğrencilere canlı yansıyan sınav takvimi.',
    children: [
      { id: 'agenda-all', label: 'Tüm Ajanda', path: '/teacher/agenda', status: 'active' },
      { id: 'agenda-notes', label: 'Notlarım & Not Oluştur', path: '/teacher/agenda', status: 'active' },
      { id: 'agenda-exams', label: 'Sınav Takvimi', path: '/teacher/agenda', status: 'active' },
    ],
  },
  {
    id: 'academic-calendar',
    label: 'Akademik Takvim & Etkinlikler',
    path: '/teacher/academic-calendar',
    icon: CalendarDays,
    status: 'active',
    sortOrder: 8,
    category: 'ÖLÇME & DEĞERLENDİRME',
    description: 'MEB 2026-2027 resmi çalışma takvimi, ortak sınavlar, tatiller ve okul etkinlikleri.',
  },
  {
    id: 'assessments',
    label: 'Sınavlar ve Değerlendirme',
    path: '/teacher/assessments',
    icon: Award,
    status: 'active',
    sortOrder: 9,
    category: 'ÖLÇME & DEĞERLENDİRME',
    description: 'Soru bankası, sınıf içi quizler, sınav takvimi ve başarı değerlendirme kriterleri.',
    children: [
      { id: 'assessments-quizzes', label: 'Sınıf Quizleri', path: '/teacher/assessments/quizzes', status: 'active' },
      { id: 'assessments-question-bank', label: 'Soru Bankası', path: '/teacher/assessments/question-bank', status: 'active' },
      { id: 'assessments-exams', label: 'Yazılı Sınav Takvimi', path: '/teacher/agenda', status: 'active', description: 'Şube bazlı ve canlı senkronize resmi sınav takvimi' },
      { id: 'assessments-grades', label: 'Not Girişi & e-Okul Aktarımı', path: '/teacher/assessments/grades', status: 'passive', description: 'Dönemlik resmi not defteri', missingDependency: 'e-Okul resmi not aktarım servisi' },
    ],
  },
  {
    id: 'student-progress',
    label: 'Öğrenci Gelişimi ve Rehberlik',
    path: '/teacher/student-progress',
    icon: TrendingUp,
    status: 'active',
    sortOrder: 10,
    category: 'ÖLÇME & DEĞERLENDİRME',
    description: 'Öğrenci akademik gidişatı, ödev teslim oranları, devam durumu ve rehberlik görüşme kayıtları.',
    children: [
      { id: 'progress-overview', label: 'Sınıf Başarı Özeti', path: '/teacher/student-progress/overview', status: 'active' },
      { id: 'progress-guidance', label: 'Rehberlik Servisi Kayıtları', path: '/teacher/student-progress/guidance', status: 'active' },
      { id: 'progress-learning-gaps', label: 'Kazanım Eksiği Tespiti', path: '/teacher/student-progress/learning-gaps', status: 'passive', missingDependency: 'Kazanım bazlı otomatik analiz algoritması' },
    ],
  },

  // ── KAYNAKLAR & İLETİŞİM ──
  {
    id: 'files',
    label: 'Dosyalarım ve Paylaşımlar',
    path: '/teacher/files',
    icon: FileText,
    status: 'active',
    sortOrder: 11,
    category: 'KAYNAKLAR & İLETİŞİM',
    description: 'Kişisel ders dosyaları, tahta çıktıları, paylaşılan çalışma kağıtları ve arşiv.',
  },
  {
    id: 'communication',
    label: 'İletişim ve Duyurular',
    path: '/teacher/communication',
    icon: MessageSquare,
    status: 'active',
    sortOrder: 12,
    category: 'KAYNAKLAR & İLETİŞİM',
    description: 'Sınıf duyuruları, veli bilgilendirme mesajları ve toplantı planlama merkezi.',
    children: [
      { id: 'communication-announcements', label: 'Sınıf Duyuruları', path: '/teacher/communication', status: 'active' },
      { id: 'communication-parent-meetings', label: 'Veli Toplantı Planı', path: '/teacher/communication', status: 'active' },
      { id: 'communication-messages', label: 'Mesajlar', path: '/teacher/communication', status: 'active' },
    ],
  },
  {
    id: 'reports',
    label: 'Raporlarım',
    path: '/teacher/reports',
    icon: BarChart3,
    status: 'active',
    sortOrder: 13,
    category: 'KAYNAKLAR & İLETİŞİM',
    description: 'Yoklama istatistikleri, ödev teslim analizleri ve sınıf başarı karneleri.',
    children: [
      { id: 'reports-attendance', label: 'Yoklama Raporları', path: '/teacher/reports/attendance', status: 'active' },
      { id: 'reports-assignments', label: 'Ödev Teslim Raporları', path: '/teacher/reports/assignments', status: 'active' },
      { id: 'reports-official', label: 'Resmi Dönem Sonu Raporları', path: '/teacher/reports/official', status: 'passive', missingDependency: 'MEB Resmi Raporlama Formatı Entegrasyonu' },
    ],
  },

  // ── DİĞER ──
  {
    id: 'settings',
    label: 'Profil ve Ayarlar',
    path: '/teacher/settings',
    icon: Settings,
    status: 'active',
    sortOrder: 14,
    category: 'DİĞER',
    description: 'Öğretmen kimlik bilgileri, branş ayarları, eşleştirilmiş akıllı tahtalar ve güvenlik.',
    children: [
      { id: 'settings-profile', label: 'Öğretmen Profili', path: '/teacher/settings/profile', status: 'active' },
      { id: 'settings-devices', label: 'Eşleştirilmiş Cihazlar', path: '/teacher/settings/devices', status: 'active' },
      { id: 'settings-security', label: 'Şifre & Güvenlik', path: '/teacher/settings/security', status: 'active' },
    ],
  },
  {
    id: 'gamestudio',
    label: 'Game Studio',
    path: '/teacher/gamestudio',
    icon: Gamepad2,
    status: 'active',
    sortOrder: 15,
    badge: 'Çok Yakında',
    category: 'DİĞER',
    description: 'Öğrenciler ve sınıflar için eğitsel oyun kütüphanesi ve sınıf aktiviteleri.',
  },
]

export function getMenuItemByPath(pathname: string): TeacherMenuItem | undefined {
  const clean = pathname.split('?')[0]
  // Exact match
  const exact = TEACHER_MENU_CONFIG.find((m) => m.path === clean)
  if (exact) return exact

  // Prefix match
  return TEACHER_MENU_CONFIG.find((m) => clean.startsWith(m.path))
}

export function getSubMenuItemByPath(pathname: string): TeacherSubMenuItem | undefined {
  const clean = pathname.split('?')[0]
  for (const item of TEACHER_MENU_CONFIG) {
    if (item.children) {
      const sub = item.children.find((c) => c.path === clean || clean.startsWith(c.path))
      if (sub) return sub
    }
  }
  return undefined
}
