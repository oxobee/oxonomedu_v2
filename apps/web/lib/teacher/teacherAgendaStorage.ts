/**
 * Teacher Agenda & School Exam Calendar Storage & Sync Helper
 * Manages colorful categorized notes and cross-role synchronized school exams.
 */

export interface TeacherNote {
  id: string
  title: string
  category: 'lesson_plan' | 'observation' | 'parent' | 'meeting' | 'exam' | 'reminder' | 'general'
  content: string
  color: 'amber' | 'blue' | 'emerald' | 'purple' | 'rose' | 'indigo' | 'pink' | 'slate'
  className?: string
  date: string
  updatedAt: string
  isPinned: boolean
  tags?: string[]
}

export interface SchoolExamItem {
  id: string
  className: string // e.g. "9-A" or "Tüm Sınıflar"
  courseName: string // e.g. "Türk Dili ve Edebiyatı"
  title: string // e.g. "1. Dönem 1. Yazılı Sınavı"
  type: 'exam' | 'quiz' | 'common' | 'mock' | 'performance' | 'oral' | 'written' | string
  examTypeLabel?: string // e.g. "Yazılı Sınav", "Sözlü Sınav", "Quiz", "Performans / Proje", "Deneme Sınavı"
  date: string // ISO date or localized date string, e.g. "2026-10-28"
  time: string // e.g. "10:20 - 11:00"
  period?: number // e.g. 3 (3. Ders)
  durationMinutes: number // e.g. 40
  location: string // e.g. "Derslik 101 (9-A)"
  teacherName: string // e.g. "Bahar ÇETİN"
  scope?: string // Kazanımlar ve Konu Kapsamı
  isPublished: boolean
  status: 'upcoming' | 'completed' | 'in_progress'
  scores?: Record<string, number>
  createdAt?: string
}

export const NOTE_CATEGORIES: { id: TeacherNote['category']; label: string; icon: string; bg: string; text: string }[] = [
  { id: 'lesson_plan', label: 'Ders Planları & Hazırlık', icon: 'BookOpen', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', text: 'text-blue-500' },
  { id: 'observation', label: 'Öğrenci Gözlemleri', icon: 'UserCheck', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', text: 'text-emerald-500' },
  { id: 'parent', label: 'Veli Görüşmeleri', icon: 'PhoneCall', bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', text: 'text-purple-500' },
  { id: 'meeting', label: 'Zümre & Kurul', icon: 'Users', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', text: 'text-amber-500' },
  { id: 'exam', label: 'Sınav & Değerlendirme', icon: 'Award', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', text: 'text-rose-500' },
  { id: 'reminder', label: 'Önemli & Hatırlatıcı', icon: 'AlertCircle', bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400', text: 'text-indigo-500' },
  { id: 'general', label: 'Genel Notlar', icon: 'FileText', bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400', text: 'text-slate-500' },
]

export const NOTE_COLOR_THEMES: Record<
  TeacherNote['color'],
  {
    name: string
    bgLight: string
    bgDark: string
    border: string
    headerBg: string
    dot: string
    textAccent: string
  }
> = {
  amber: {
    name: 'Sarı / Kehribar (Sticky)',
    bgLight: 'bg-amber-50/80 hover:bg-amber-50',
    bgDark: 'dark:bg-amber-950/25 dark:hover:bg-amber-950/35',
    border: 'border-amber-200/90 dark:border-amber-800/60',
    headerBg: 'bg-amber-100/60 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300',
    dot: 'bg-amber-400',
    textAccent: 'text-amber-700 dark:text-amber-300',
  },
  blue: {
    name: 'Mavi / Akademi',
    bgLight: 'bg-sky-50/80 hover:bg-sky-50',
    bgDark: 'dark:bg-sky-950/25 dark:hover:bg-sky-950/35',
    border: 'border-sky-200/90 dark:border-sky-800/60',
    headerBg: 'bg-sky-100/60 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300',
    dot: 'bg-sky-500',
    textAccent: 'text-sky-700 dark:text-sky-300',
  },
  emerald: {
    name: 'Zümrüt Yeşili / Gözlem',
    bgLight: 'bg-emerald-50/80 hover:bg-emerald-50',
    bgDark: 'dark:bg-emerald-950/25 dark:hover:bg-emerald-950/35',
    border: 'border-emerald-200/90 dark:border-emerald-800/60',
    headerBg: 'bg-emerald-100/60 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    textAccent: 'text-emerald-700 dark:text-emerald-300',
  },
  purple: {
    name: 'Mor / Veli & Rehberlik',
    bgLight: 'bg-purple-50/80 hover:bg-purple-50',
    bgDark: 'dark:bg-purple-950/25 dark:hover:bg-purple-950/35',
    border: 'border-purple-200/90 dark:border-purple-800/60',
    headerBg: 'bg-purple-100/60 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300',
    dot: 'bg-purple-500',
    textAccent: 'text-purple-700 dark:text-purple-300',
  },
  rose: {
    name: 'Gül Kurusu / Sınav & Acil',
    bgLight: 'bg-rose-50/80 hover:bg-rose-50',
    bgDark: 'dark:bg-rose-950/25 dark:hover:bg-rose-950/35',
    border: 'border-rose-200/90 dark:border-rose-800/60',
    headerBg: 'bg-rose-100/60 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300',
    dot: 'bg-rose-500',
    textAccent: 'text-rose-700 dark:text-rose-300',
  },
  indigo: {
    name: 'İndigo / Zümre',
    bgLight: 'bg-indigo-50/80 hover:bg-indigo-50',
    bgDark: 'dark:bg-indigo-950/25 dark:hover:bg-indigo-950/35',
    border: 'border-indigo-200/90 dark:border-indigo-800/60',
    headerBg: 'bg-indigo-100/60 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300',
    dot: 'bg-indigo-500',
    textAccent: 'text-indigo-700 dark:text-indigo-300',
  },
  pink: {
    name: 'Pembe / Proje',
    bgLight: 'bg-pink-50/80 hover:bg-pink-50',
    bgDark: 'dark:bg-pink-950/25 dark:hover:bg-pink-950/35',
    border: 'border-pink-200/90 dark:border-pink-800/60',
    headerBg: 'bg-pink-100/60 dark:bg-pink-900/40 text-pink-800 dark:text-pink-300',
    dot: 'bg-pink-500',
    textAccent: 'text-pink-700 dark:text-pink-300',
  },
  slate: {
    name: 'Gri / Nötr',
    bgLight: 'bg-slate-50/80 hover:bg-slate-50',
    bgDark: 'dark:bg-slate-900/40 dark:hover:bg-slate-900/60',
    border: 'border-slate-200/90 dark:border-slate-800/60',
    headerBg: 'bg-slate-100/60 dark:bg-slate-800/50 text-slate-800 dark:text-slate-300',
    dot: 'bg-slate-400',
    textAccent: 'text-slate-700 dark:text-slate-300',
  },
}

export const INITIAL_TEACHER_NOTES: TeacherNote[] = [
  {
    id: 'note-1',
    title: '9-A Şiir Bilgisi & Aruz Kalıpları Dersi Planı',
    category: 'lesson_plan',
    content:
      'Fâilâtün fâilâtün fâilün ve Mefâîlün kalıpları için akıllı tahtada etkileşimli vezin bulma alıştırması yapılacak. Öğrencilere dağıtılacak çalışma kâğıtları fotokopiden alındı.',
    color: 'blue',
    className: '9-A',
    date: '14 Ekim 2026',
    updatedAt: '14 Ekim 2026, 08:30',
    isPinned: true,
    tags: ['Aruz', 'Akıllı Tahta', '9-A'],
  },
  {
    id: 'note-2',
    title: 'Öğrenci Gözlemi: Ercil & Melis Zümre Değerlendirmesi',
    category: 'observation',
    content:
      'Ercil Can (104) edebiyat metin tahlili ve kompozisyonda üstün kavrayış gösteriyor. Matematik sınavında da tam puan seviyesinde. Melis ve Ahmet grup çalışmalarına çok aktif katılıyor.',
    color: 'emerald',
    className: '9-A',
    date: '13 Ekim 2026',
    updatedAt: '13 Ekim 2026, 16:45',
    isPinned: true,
    tags: ['Ercil Can', 'Gözlem', 'Üstün Başarı'],
  },
  {
    id: 'note-3',
    title: '1. Dönem 1. Yazılı Sınavı Kağıt Okuma Notları',
    category: 'exam',
    content:
      '9-A sınıfının 1. Yazılı sınavları okundu. Sınıf ortalaması 91.4 ile okul birincisi oldu. Sorulardan divan edebiyatı gazel beyit tahlilinde başarı oranı %96.',
    color: 'rose',
    className: '9-A',
    date: '12 Ekim 2026',
    updatedAt: '12 Ekim 2026, 17:15',
    isPinned: false,
    tags: ['Yazılı', 'Not Okuma', 'Sonuçlar'],
  },
  {
    id: 'note-4',
    title: 'Veli İletişimi: Hafta Sonu Seminer & Bilgilendirme',
    category: 'parent',
    content:
      'Cuma günü saat 16:00 veli bilgilendirme mesajı gönderilecek. Dijital kütüphane ve akıllı tahta ev ödevi modülü hakkında velilere kullanım kılavuzu iletildi.',
    color: 'purple',
    className: '9-A',
    date: '11 Ekim 2026',
    updatedAt: '11 Ekim 2026, 11:20',
    isPinned: false,
    tags: ['Veli', 'Rehberlik'],
  },
  {
    id: 'note-5',
    title: 'Edebiyat Zümresi Toplantı Kararları (Ekim Ayı)',
    category: 'meeting',
    content:
      'Müdür Kemal SOYSAL başkanlığında yapılan zümre toplantısında 2. ortak yazılı sınav tarihi 28 Kasım olarak kararlaştırıldı. Soru dağılım tabloları MEB formatına uyarlandı.',
    color: 'indigo',
    className: 'Tüm Sınıflar',
    date: '10 Ekim 2026',
    updatedAt: '10 Ekim 2026, 14:00',
    isPinned: false,
    tags: ['Zümre', 'Müdürlük', 'Karar'],
  },
  {
    id: 'note-6',
    title: 'TÜBİTAK Bilim Fuarı Proje Başvurusu Hatırlatıcısı',
    category: 'reminder',
    content:
      'Akıllı tahta kodlama ve dijital sözlük projesi için son başvuru tarihi 30 Ekim. Proje ekibi öğrencileri: Ercil Can, Melis Tekin, Ahmet Yılmaz.',
    color: 'amber',
    className: '9-A',
    date: '09 Ekim 2026',
    updatedAt: '09 Ekim 2026, 09:10',
    isPinned: true,
    tags: ['TÜBİTAK', 'Proje', 'Önemli'],
  },
]

export const CANONICAL_SCHOOL_EXAMS: SchoolExamItem[] = [
  {
    id: 'exam-ede-1',
    className: '9-A',
    courseName: 'Türk Dili ve Edebiyatı',
    title: '1. Dönem 1. Yazılı Sınavı',
    type: 'exam',
    examTypeLabel: 'Yazılı Sınav',
    date: '12 Ekim 2026',
    time: '09:25 - 10:05',
    period: 2,
    durationMinutes: 40,
    location: 'Derslik 101 (9-A)',
    teacherName: 'Bahar ÇETİN',
    scope: 'Giriş Ünitesi, Edebiyatın Sanatlarla İlişkisi, İletişim Ögeleri ve Hikaye Tahlili',
    isPublished: true,
    status: 'upcoming',
    scores: {},
  },
  {
    id: 'exam-mat-1',
    className: '9-A',
    courseName: 'Matematik',
    title: '1. Dönem 1. Yazılı Sınavı',
    type: 'exam',
    examTypeLabel: 'Yazılı Sınav',
    date: '18 Ekim 2026',
    time: '08:30 - 09:10',
    period: 1,
    durationMinutes: 40,
    location: 'Derslik 101 (9-A)',
    teacherName: 'Bahar ÇETİN',
    scope: 'Önermeler, Bileşik Önermeler ve Kümelerde İşlemler',
    isPublished: true,
    status: 'upcoming',
    scores: {},
  },
  {
    id: 'exam-ede-sozlu-1',
    className: '9-A',
    courseName: 'Türk Dili ve Edebiyatı',
    title: '1. Dönem Şiir Okuma & Diksiyon Sözlü Sınavı',
    type: 'oral',
    examTypeLabel: 'Sözlü Sınav',
    date: '15 Ekim 2026',
    time: '11:15 - 11:55',
    period: 4,
    durationMinutes: 40,
    location: 'Derslik 101 (9-A)',
    teacherName: 'Bahar ÇETİN',
    scope: 'Ezbere şiir okuma, tonlama ve vurgu, divan şiiri ahenk tahlili',
    isPublished: true,
    status: 'upcoming',
    scores: {},
  },
  {
    id: 'exam-mat-perf-1',
    className: '9-A',
    courseName: 'Matematik',
    title: '1. Dönem Fonksiyon Modelleme Performans Görevi',
    type: 'performance',
    examTypeLabel: 'Performans / Proje',
    date: '05 Kasım 2026',
    time: '11:15 - 11:55',
    period: 4,
    durationMinutes: 40,
    location: 'Derslik 101 (9-A)',
    teacherName: 'Bahar ÇETİN',
    scope: 'Günlük hayat problemlerinin fonksiyonlarla modellenmesi ve grafik çizimi',
    isPublished: true,
    status: 'upcoming',
    scores: {},
  },
  {
    id: 'exam-ede-quiz-1',
    className: '9-A',
    courseName: 'Türk Dili ve Edebiyatı',
    title: 'Edebiyat Şiir Tahlili Mini Quiz',
    type: 'quiz',
    examTypeLabel: 'Quiz',
    date: '24 Ekim 2026',
    time: '10:20 - 10:40',
    period: 3,
    durationMinutes: 20,
    location: 'Derslik 101 (9-A)',
    teacherName: 'Bahar ÇETİN',
    scope: 'Nazım birimi, kafiye ve redif, şiirde ahenk unsurları',
    isPublished: true,
    status: 'upcoming',
  },
  {
    id: 'exam-mat-quiz-1',
    className: '9-A',
    courseName: 'Matematik',
    title: 'Denklem Sistemleri Hızlı Tarama Quizi',
    type: 'quiz',
    examTypeLabel: 'Quiz',
    date: '27 Ekim 2026',
    time: '11:15 - 11:40',
    period: 4,
    durationMinutes: 25,
    location: 'Derslik 101 (9-A)',
    teacherName: 'Bahar ÇETİN',
    scope: 'Birinci dereceden iki bilinmeyenli denklem ve eşitsizlikler',
    isPublished: true,
    status: 'upcoming',
  },
  {
    id: 'exam-bil-1',
    className: '9-A',
    courseName: 'Bilişim & Kodlama',
    title: 'Python Kodlama ve Algoritma Uygulama Sınavı',
    type: 'exam',
    examTypeLabel: 'Yazılı Sınav',
    date: '20 Kasım 2026',
    time: '13:40 - 14:20',
    period: 6,
    durationMinutes: 40,
    location: 'Bilişim Atölyesi',
    teacherName: 'Bahar ÇETİN',
    scope: 'Python değişkenler, koşul blokları ve akış diyagramları',
    isPublished: true,
    status: 'upcoming',
  },
  {
    id: 'exam-ede-2',
    className: '9-A',
    courseName: 'Türk Dili ve Edebiyatı',
    title: '1. Dönem 2. Yazılı Sınavı (Ortak)',
    type: 'common',
    examTypeLabel: 'Yazılı Sınav',
    date: '28 Kasım 2026',
    time: '10:20 - 11:00',
    period: 3,
    durationMinutes: 40,
    location: 'Derslik 101 (9-A)',
    teacherName: 'Bahar ÇETİN',
    scope: 'Şiir ünitesi geneli, masal/fabl türleri, isim tamlamaları ve yazım kuralları',
    isPublished: true,
    status: 'upcoming',
  },
  {
    id: 'exam-deneme-1',
    className: '9-A',
    courseName: 'Tüm Dersler',
    title: '1. Kurumsal Genel Kazanım Deneme Sınavı',
    type: 'mock',
    examTypeLabel: 'Deneme Sınavı',
    date: '15 Kasım 2026',
    time: '09:00 - 11:30',
    period: 1,
    durationMinutes: 120,
    location: 'Okul Konferans Salonu',
    teacherName: 'Ölçme & Değerlendirme Zümresi',
    scope: 'MEB 9. Sınıf 1. Çeyrek Tüm Müfredat Konuları',
    isPublished: true,
    status: 'upcoming',
  },
]

// ── Notes LocalStorage Handlers ──
export function getStoredTeacherNotes(): TeacherNote[] {
  if (typeof window === 'undefined') return INITIAL_TEACHER_NOTES
  try {
    const raw = localStorage.getItem('oxonom_teacher_agenda_notes')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (_) {}
  return INITIAL_TEACHER_NOTES
}

export function saveStoredTeacherNotes(notes: TeacherNote[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('oxonom_teacher_agenda_notes', JSON.stringify(notes))
    window.dispatchEvent(new Event('oxonom_teacher_notes_updated'))
  } catch (_) {}
}

// ── Exam Calendar Handlers (Cross-Role Synced) ──
export function getStoredSchoolExams(): SchoolExamItem[] {
  if (typeof window === 'undefined') return CANONICAL_SCHOOL_EXAMS
  try {
    const deletedRaw = localStorage.getItem('oxonom_deleted_exam_ids')
    const deletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : []

    const raw = localStorage.getItem('oxonom_school_exam_calendar')
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.filter((e) => !deletedIds.includes(e.id))
      }
    }
    return CANONICAL_SCHOOL_EXAMS.filter((e) => !deletedIds.includes(e.id))
  } catch (_) {}
  return CANONICAL_SCHOOL_EXAMS
}

export function saveStoredSchoolExams(exams: SchoolExamItem[]) {
  if (typeof window === 'undefined') return
  try {
    const deletedRaw = localStorage.getItem('oxonom_deleted_exam_ids')
    const deletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : []
    const clean = exams.filter((e) => !deletedIds.includes(e.id))

    localStorage.setItem('oxonom_school_exam_calendar', JSON.stringify(clean))
    window.dispatchEvent(new Event('oxonom_exam_calendar_updated'))
    window.dispatchEvent(new Event('oxonom_student_updated'))
  } catch (_) {}
}

/**
 * Sync exams with the backend API so multiple browsers/incognito windows stay synchronized.
 */
export async function fetchExamsFromServer(): Promise<SchoolExamItem[]> {
  try {
    const res = await fetch('/api/exams', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      if (data.success && Array.isArray(data.exams)) {
        if (typeof window !== 'undefined') {
          const deletedRaw = localStorage.getItem('oxonom_deleted_exam_ids')
          const deletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : []
          const cleanExams = data.exams.filter((e: any) => !deletedIds.includes(e.id))

          localStorage.setItem('oxonom_school_exam_calendar', JSON.stringify(cleanExams))
          window.dispatchEvent(new Event('oxonom_exam_calendar_updated'))
          window.dispatchEvent(new Event('oxonom_student_updated'))
          return cleanExams
        }
        return data.exams
      }
    }
  } catch (err) {
    console.warn('fetchExamsFromServer fallback to localStorage:', err)
  }
  return getStoredSchoolExams()
}

export async function pushExamToServer(exam: SchoolExamItem): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      const deletedRaw = localStorage.getItem('oxonom_deleted_exam_ids')
      if (deletedRaw) {
        const deletedIds: string[] = JSON.parse(deletedRaw)
        const next = deletedIds.filter((id) => id !== exam.id)
        localStorage.setItem('oxonom_deleted_exam_ids', JSON.stringify(next))
      }
    } catch (_) {}
  }
  try {
    const res = await fetch('/api/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exam }),
    })
    if (res.ok) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('oxonom_exam_calendar_updated'))
        window.dispatchEvent(new Event('oxonom_student_updated'))
      }
    }
    return res.ok
  } catch (_) {
    return false
  }
}

export async function deleteExamFromServer(examId: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      const deletedRaw = localStorage.getItem('oxonom_deleted_exam_ids')
      const deletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : []
      if (!deletedIds.includes(examId)) {
        deletedIds.push(examId)
        localStorage.setItem('oxonom_deleted_exam_ids', JSON.stringify(deletedIds))
      }

      // Also clean up local stored exams
      const current = getStoredSchoolExams().filter((e) => e.id !== examId)
      localStorage.setItem('oxonom_school_exam_calendar', JSON.stringify(current))
      window.dispatchEvent(new Event('oxonom_exam_calendar_updated'))
      window.dispatchEvent(new Event('oxonom_student_updated'))
    } catch (_) {}
  }
  try {
    const res = await fetch(`/api/exams?id=${encodeURIComponent(examId)}`, {
      method: 'DELETE',
    })
    return res.ok
  } catch (_) {
    return false
  }
}
