import {
  CUSTOM_ASSIGNMENTS_STORAGE_KEY,
  getStoredCustomAssignments,
  getDeletedHomeworkIds,
  DEFAULT_SCHOOL_ASSIGNMENTS,
  type SchoolAssignmentItem,
  type QuizQuestion,
} from '@services/school_assignments/school_assignments'
import {
  DAYS_LIST,
  PRIMARY_PERIODS,
  MIDDLE_PERIODS,
  INITIAL_SCHEDULE_ENTRIES,
  type ScheduleEntry,
} from '@components/Mobile/Admin/MAdminScheduleClient'
import {
  ALL_INITIAL_STUDENTS,
  type MStudentItem,
  type MStudentCourseGrade,
} from '@components/Mobile/MStudentClient'
import { CANONICAL_SCHOOL_EXAMS, getStoredSchoolExams } from '@/lib/teacher/teacherAgendaStorage'
import { getStudentAttendanceSummary } from '@services/demo/attendanceService'

export interface GuidanceNoteItem {
  id: string
  date: string
  author: string
  content: string
}

export interface StudentProfile {
  id: string
  name: string
  firstName: string
  lastName: string
  email: string
  studentNo: string
  tcNo: string
  gender: string
  birthDate: string
  bloodType: string
  enrollmentDate: string
  className: string
  gradeLevel: string
  mentorTeacher: string
  schoolName: string
  gpa: number
  classRank: number
  attendanceRate: number
  absentDays: number
  absentExcusedDays?: number
  absentUnexcusedDays?: number
  parentName: string
  parentPhone: string
  parentRelation: string
  secondParentName: string
  secondParentPhone: string
  secondParentRelation: string
  emergencyPhone: string
  address: string
  disciplineStatus: string
  specialHealthNote?: string
  notes?: string
  guidanceNotes?: GuidanceNoteItem[]
  grades?: MStudentCourseGrade[]
}

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  id: 's-1',
  name: 'Erçil UĞURLU',
  firstName: 'Erçil',
  lastName: 'UĞURLU',
  email: 'ogrenci@oxonom.com',
  studentNo: '101',
  tcNo: '10000000146',
  gender: 'Erkek',
  birthDate: '15.06.2018 (7 Yaşında)',
  bloodType: 'A Rh+',
  enrollmentDate: '01.09.2024',
  className: '1/A',
  gradeLevel: '1. Sınıf',
  mentorTeacher: 'Özlem ZOR (Sınıf Öğretmeni)',
  schoolName: 'Oxonom Okulları',
  gpa: 98.8,
  classRank: 1,
  attendanceRate: 100,
  absentDays: 0,
  absentExcusedDays: 0,
  absentUnexcusedDays: 0,
  parentName: 'Ebru UĞURLU',
  parentPhone: '+90 532 999 1100',
  parentRelation: 'Anne (Mimar)',
  secondParentName: 'Dr. Uğur UĞURLU',
  secondParentPhone: '+90 532 999 2200',
  secondParentRelation: 'Baba (Kurum Müdürü)',
  emergencyPhone: '+90 532 999 2200',
  address: 'Caddebostan Mah. Bağdat Cad. No: 142/5 Kadıköy / İstanbul',
  disciplineStatus: 'Temiz Sicil — Örnek Öğrenci',
}

export interface StudentCourse {
  id: string
  code: string
  name: string
  teacherName: string
  teacherBranch: string
  weeklyHours: number
  classroom: string
  roomType: string
  color: string
  gradient: string
  description: string
  topics: Array<{ id: string; title: string; completed: boolean; week: number }>
  materials: Array<{ id: string; title: string; type: 'pdf' | 'doc' | 'video'; size: string }>
}

export const GRADE_1_COURSES: StudentCourse[] = [
  {
    id: 'turkce',
    code: 'TUR-101',
    name: 'Türkçe',
    teacherName: 'Özlem ZOR',
    teacherBranch: 'Sınıf Öğretmeni (1/A)',
    weeklyHours: 10,
    classroom: '1/A',
    roomType: '1. Kat · Derslik 101',
    color: 'blue',
    gradient: 'from-blue-600 to-indigo-700',
    description: 'İlk okuma-yazma hazırlığı, ses grupları ve harf bilgisi (A-N-E-T-İ-L), hece-kelime-cümle kurma ve anlama çalışmaları.',
    topics: [
      { id: 't1', title: 'İlk Okuma Yazmaya Hazırlık ve Çizgi Çalışmaları', completed: true, week: 1 },
      { id: 't2', title: '1. Ses Grubu: A - N - E - T Harfleri ve Hece Birleştirme', completed: true, week: 2 },
      { id: 't3', title: '2. Ses Grubu: İ - L - O - K Harfleri ve Kelime Oluşturma', completed: true, week: 3 },
      { id: 't4', title: '3. Ses Grubu: U - R - M - Y Harfleri ve Okuma Metinleri', completed: false, week: 4 },
      { id: 't5', title: 'Cümle Oluşturma, Büyük Harf ve Nokta Kullanımı', completed: false, week: 5 },
      { id: 't6', title: 'Görsel Okuma ve Serbest Hikaye Dinleme/Anlatma', completed: false, week: 6 },
    ],
    materials: [
      { id: 'm1', title: '1. Sınıf Ses ve Çizgi Çalışma Föyü (PDF)', type: 'pdf', size: '2.8 MB' },
      { id: 'm2', title: 'Hece Çarkı ve Harf Kartları Etkinlik Kağıdı', type: 'doc', size: '1.4 MB' },
      { id: 'm3', title: 'Ses Tanıma ve Telaffuz Eğitici Videosu', type: 'video', size: '36 MB' },
    ],
  },
  {
    id: 'matematik',
    code: 'MAT-101',
    name: 'Matematik',
    teacherName: 'Özlem ZOR',
    teacherBranch: 'Sınıf Öğretmeni (1/A)',
    weeklyHours: 5,
    classroom: '1/A',
    roomType: '1. Kat · Derslik 101',
    color: 'indigo',
    gradient: 'from-indigo-600 to-purple-700',
    description: 'Doğal sayılar (1-20), nesne sayma ve eşleştirme, ritmik sayma, basit toplama ve çıkarma, uzamsal ilişkiler.',
    topics: [
      { id: 't1', title: 'Uzamsal İlişkiler: Önünde-Arkasında, Sağında-Solunda', completed: true, week: 1 },
      { id: 't2', title: '1-10 Arası Rakamları Tanıma ve Yazma', completed: true, week: 2 },
      { id: 't3', title: 'Nesne Sayma, Sayı Doğrusu ve Karşılaştırma', completed: true, week: 3 },
      { id: 't4', title: 'İleriye ve Geriye Doğru Birer ve İkişer Ritmik Sayma', completed: false, week: 4 },
      { id: 't5', title: 'Toplama İşlemine Giriş (Nesnelerle Ekleme)', completed: false, week: 5 },
      { id: 't6', title: 'Temel Geometrik Şekiller: Daire, Kare, Üçgen', completed: false, week: 6 },
    ],
    materials: [
      { id: 'm1', title: 'Rakam Yazma ve Boyama Çalışma Sayfaları (PDF)', type: 'pdf', size: '3.1 MB' },
      { id: 'm2', title: '1-20 Sayı Eşleştirme Kartları', type: 'doc', size: '920 KB' },
    ],
  },
  {
    id: 'hayat-bilgisi',
    code: 'HAY-101',
    name: 'Hayat Bilgisi',
    teacherName: 'Özlem ZOR',
    teacherBranch: 'Sınıf Öğretmeni (1/A)',
    weeklyHours: 4,
    classroom: '1/A',
    roomType: '1. Kat · Derslik 101',
    color: 'teal',
    gradient: 'from-teal-600 to-emerald-700',
    description: 'Okulumuzda Hayat, Evimizde Hayat, Sağlıklı Hayat, Güvenli Hayat, Ülkemizde Hayat ve Doğada Hayat üniteleri.',
    topics: [
      { id: 't1', title: 'Okulumuzu Tanıyalım ve Sınıf Kuralları', completed: true, week: 1 },
      { id: 't2', title: 'Arkadaşlarımızla İletişim ve Nezaket Kuralları', completed: true, week: 2 },
      { id: 't3', title: 'Okul Yolu ve Trafikte Güvenlik Önlemleri', completed: false, week: 3 },
      { id: 't4', title: 'Kişisel Bakım, El Yıkama ve Sağlıklı Beslenme', completed: false, week: 4 },
      { id: 't5', title: 'Ailemiz, Evimizdeki Görevlerimiz ve Dayanışma', completed: false, week: 5 },
    ],
    materials: [
      { id: 'm1', title: 'Okulumuzda Hayat Etkinlik Dosyası (PDF)', type: 'pdf', size: '4.2 MB' },
    ],
  },
  {
    id: 'yabanci-dil-ingilizce',
    code: 'ING-101',
    name: 'Yabancı Dil (İngilizce)',
    teacherName: 'Canan YILDIRIM',
    teacherBranch: 'İngilizce',
    weeklyHours: 2,
    classroom: '1/A',
    roomType: '1. Kat · Derslik 101',
    color: 'purple',
    gradient: 'from-purple-600 to-violet-700',
    description: 'Greetings, Colors, Numbers 1-10, Classroom Objects, My Family ve Animals.',
    topics: [
      { id: 't1', title: 'Hello! Words of Greeting (Hello, Goodbye)', completed: true, week: 1 },
      { id: 't2', title: 'Colors: Red, Blue, Yellow, Green', completed: true, week: 2 },
      { id: 't3', title: 'Numbers 1 to 10 Songs & Chants', completed: false, week: 3 },
      { id: 't4', title: 'Classroom Objects: Pencil, Book, Bag', completed: false, week: 4 },
    ],
    materials: [
      { id: 'm1', title: 'English Fun Coloring & Flashcards (PDF)', type: 'pdf', size: '2.5 MB' },
    ],
  },
  {
    id: 'beden-egitimi-ve-oyun',
    code: 'BED-101',
    name: 'Beden Eğitimi ve Oyun',
    teacherName: 'Selim AKSOY',
    teacherBranch: 'Beden Eğitimi',
    weeklyHours: 5,
    classroom: '1/A',
    roomType: 'Kapalı Spor Salonu',
    color: 'orange',
    gradient: 'from-orange-500 to-amber-600',
    description: 'Temel hareket becerileri, nesne kontrolü, geleneksel çocuk oyunları, koordinasyon ve iş birliği.',
    topics: [
      { id: 't1', title: 'Yer Değiştirme Hareketleri: Yürüme, Koşma, Sıçrama', completed: true, week: 1 },
      { id: 't2', title: 'Denge Hareketleri ve Koordinasyon Parkuru', completed: true, week: 2 },
      { id: 't3', title: 'Geleneksel Çocuk Oyunları: Yağ Satarım Bal Satarım', completed: false, week: 3 },
      { id: 't4', title: 'Topla İlişkili Beceriler: Atma, Tutma, Yuvarlama', completed: false, week: 4 },
    ],
    materials: [
      { id: 'm1', title: 'Eğitsel Oyun Kuralları Kılavuzu', type: 'doc', size: '650 KB' },
    ],
  },
  {
    id: 'gorsel-sanatlar',
    code: 'GOR-101',
    name: 'Görsel Sanatlar',
    teacherName: 'Gülşah ÖZTÜRK',
    teacherBranch: 'Görsel Sanatlar',
    weeklyHours: 1,
    classroom: '1/A',
    roomType: 'Görsel Sanatlar Atölyesi',
    color: 'pink',
    gradient: 'from-pink-500 to-rose-600',
    description: 'Çizgi, şekil ve renkleri tanıma, pastel boya ve sulu boya teknikleri, kolaj ve yoğurma çalışmaları.',
    topics: [
      { id: 't1', title: 'Nokta ve Çizgiyle Resim Yapma', completed: true, week: 1 },
      { id: 't2', title: 'Ana ve Ara Renklerle Boyama', completed: false, week: 2 },
      { id: 't3', title: 'Oyun Hamuru ve Doğal Malzemelerle Modelleme', completed: false, week: 3 },
    ],
    materials: [
      { id: 'm1', title: 'Sanat Atölyesi Örnek Çizim Föyleri', type: 'pdf', size: '3.6 MB' },
    ],
  },
  {
    id: 'muzik',
    code: 'MUZ-101',
    name: 'Müzik',
    teacherName: 'Müzik Zümresi',
    teacherBranch: 'Müzik',
    weeklyHours: 1,
    classroom: '1/A',
    roomType: 'Müzik Odası',
    color: 'pink',
    gradient: 'from-rose-500 to-pink-600',
    description: 'Doğadaki sesler, ince ve kalın sesler, ritim tutma, çocuk şarkıları ve marşlar.',
    topics: [
      { id: 't1', title: 'Çevremizdeki Sesleri Dinleme ve Ayırt Etme', completed: true, week: 1 },
      { id: 't2', title: 'El Çırparak Basit Ritim Kalıpları Uygulama', completed: true, week: 2 },
      { id: 't3', title: 'İstiklal Marşı ve Okul Şarkıları Söyleme', completed: false, week: 3 },
    ],
    materials: [
      { id: 'm1', title: 'Çocuk Şarkıları Ritim Notaları Kitapçığı', type: 'pdf', size: '1.8 MB' },
    ],
  },
  {
    id: 'serbest-etkinlikler',
    code: 'SER-101',
    name: 'Serbest Etkinlikler & Kodlama',
    teacherName: 'Özlem ZOR',
    teacherBranch: 'Sınıf Öğretmeni (1/A)',
    weeklyHours: 2,
    classroom: '1/A',
    roomType: '1. Kat · Derslik 101',
    color: 'cyan',
    gradient: 'from-cyan-600 to-blue-700',
    description: 'Akıl ve zeka oyunları, blok tabanlı görsel kodlama mantığı, robotik hazırlık ve serbest drama.',
    topics: [
      { id: 't1', title: 'Akıl Oyunları: Tangram ve Sudoku Tanıtımı', completed: true, week: 1 },
      { id: 't2', title: 'Yön Bulma ve Adım Adım Kodlama Mantığı', completed: true, week: 2 },
    ],
    materials: [
      { id: 'm1', title: 'Algoritmik Düşünme & Tangram Görev Kartları', type: 'pdf', size: '2.1 MB' },
    ],
  },
]

export const STUDENT_COURSES: StudentCourse[] = GRADE_1_COURSES

export interface StudentAssessment {
  id: string
  title: string
  courseName: string
  type: 'exam' | 'quiz' | 'performance' | 'oral' | 'mock' | 'common' | string
  examTypeLabel?: string
  date: string
  time: string
  durationMinutes: number
  location: string
  maxScore: number
  score?: number
  isGraded: boolean
  isPublished: boolean
  teacherFeedback?: string
  status: 'upcoming' | 'completed' | 'in_progress'
  scope?: string
  teacherName?: string
  period?: number
  className?: string
}

export const STUDENT_ASSESSMENTS: StudentAssessment[] = [
  {
    id: 'as-1',
    title: '1. Değerlendirme (İlk Okuma & Ses Bilgisi)',
    courseName: 'Türkçe',
    type: 'exam',
    date: '16 Ekim 2026',
    time: '09:25',
    durationMinutes: 40,
    location: '1. Kat · Derslik 101 (1/A)',
    maxScore: 100,
    score: 100,
    isGraded: true,
    isPublished: true,
    status: 'completed',
    teacherFeedback: 'Özlem ZOR: Harika ses tanıma ve heceleme becerisi. Tebrikler!',
  },
  {
    id: 'as-2',
    title: '1. Değerlendirme (1-20 Sayı Sayma & Geometri)',
    courseName: 'Matematik',
    type: 'exam',
    date: '20 Ekim 2026',
    time: '10:20',
    durationMinutes: 40,
    location: '1. Kat · Derslik 101 (1/A)',
    maxScore: 100,
    score: 98,
    isGraded: true,
    isPublished: true,
    status: 'completed',
    teacherFeedback: 'Özlem ZOR: Ritmik sayma ve şekil eşleştirmede üstün başarı.',
  },
  {
    id: 'as-3',
    title: 'Performans Çalışması (Okulumuzda Hayat)',
    courseName: 'Hayat Bilgisi',
    type: 'performance',
    date: '24 Ekim 2026',
    time: '11:15',
    durationMinutes: 40,
    location: '1. Kat · Derslik 101 (1/A)',
    maxScore: 100,
    score: 98,
    isGraded: true,
    isPublished: true,
    status: 'completed',
    teacherFeedback: 'Özlem ZOR: Sınıf kurallarına uyum ve arkadaşlık ilişkilerinde örnek davranış.',
  },
  {
    id: 'as-4',
    title: 'Colors & Greetings Quiz',
    courseName: 'Yabancı Dil (İngilizce)',
    type: 'quiz',
    date: '28 Ekim 2026',
    time: '09:25',
    durationMinutes: 30,
    location: '1. Kat · Derslik 101 (1/A)',
    maxScore: 100,
    score: undefined,
    isGraded: false,
    isPublished: true,
    status: 'upcoming',
  },
]

export interface StudentAnnouncement {
  id: string
  title: string
  author: string
  authorRole: string
  date: string
  category: 'general' | 'academic' | 'event' | 'meeting' | 'emergency'
  priority?: 'low' | 'normal' | 'important' | 'emergency'
  content: string
  isPinned?: boolean
}

export const STUDENT_ANNOUNCEMENTS: StudentAnnouncement[] = [
  {
    id: 'ann-1',
    title: '1/A Şubesi Dönem Ortası Akademik Başarı ve Uyum Tebriği',
    author: 'Dr. Uğur UĞURLU',
    authorRole: 'Okul Müdürü',
    date: 'Bugün, 09:30',
    category: 'academic',
    priority: 'important',
    isPinned: true,
    content: '1/A şubemiz Türkçe, Matematik ve Hayat Bilgisi derslerindeki örnek sınıf düzeni ve üstün performansıyla okulumuzun gururu olmuştur. Sevgili öğrencimiz Erçil ve sınıf öğretmenimiz Özlem Hanımı tebrik eder, başarılarının devamını dilerim.',
  },
  {
    id: 'ann-2',
    title: 'Akıllı Tahta ve Dijital Kütüphane 1. Sınıf Yeni Föyleri Eklendi',
    author: 'Özlem ZOR',
    authorRole: '1/A Sınıf Öğretmeni',
    date: 'Dün, 14:15',
    category: 'academic',
    priority: 'normal',
    isPinned: false,
    content: 'Dersliklerimizde bulunan akıllı tahtalar ile senkronize çalışan yeni dijital okuma-yazma çalışma föyleri ve ritmik sayma etkinlikleri öğrenci kütüphanesine yüklenmiştir. Hafta sonu velilerinizle inceleyebilirsiniz.',
  },
  {
    id: 'ann-3',
    title: 'Oxonom Geleneksel Bilim Şenliği ve Robotik Atölyeleri',
    author: 'Oxonom Bilim Koordinatörlüğü',
    authorRole: 'Akademik Koordinatörlük',
    date: '10 Ekim 2026',
    category: 'event',
    priority: 'low',
    isPinned: false,
    content: 'Bu yıl düzenlenecek geleneksel Oxonom Bilim Şenliği ve Robotik Kodlama atölye etkinlikleri için hazırlıklar başladı.',
  },
]

export interface TemplateResolveContext {
  studentName?: string
  ogrenci_adi?: string
  parentName?: string
  veli_adi?: string
  className?: string
  sinif?: string
  teacherName?: string
  ogretmen_adi?: string
  schoolName?: string
  okul_adi?: string
  date?: string
  tarih?: string
  time?: string
  saat?: string
  studentNo?: string
  ogrenci_no?: string
  gpa?: string | number
  puan?: string | number
  gradeLevel?: string
  kademe?: string
  parentPhone?: string
  telefon?: string
}

export function resolveAnnouncementVariables(
  text: string,
  customContext?: TemplateResolveContext
): string {
  if (!text) return ''
  let result = typeof text === 'string' ? text : String(text || '')

  let profile: any = null
  if (typeof window !== 'undefined') {
    try {
      profile = getSynchronizedStudentProfile()
    } catch (_) {}
  }

  const now = new Date()
  let defaultDate = '18 Ekim 2026'
  let defaultTime = '18:30'
  try {
    defaultDate = `${now.getDate()} ${now.toLocaleString('tr-TR', { month: 'long' })} ${now.getFullYear()}`
    defaultTime = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  } catch (_) {}

  let mentorTeacher = String(profile?.mentorTeacher || 'Özlem ZOR')
  if (mentorTeacher.includes('(')) {
    mentorTeacher = mentorTeacher.split('(')[0].trim()
  }

  const ctx = {
    studentName: String(customContext?.studentName || customContext?.ogrenci_adi || profile?.name || 'Erçil UĞURLU'),
    parentName: String(customContext?.parentName || customContext?.veli_adi || profile?.parentName || 'Ebru UĞURLU'),
    className: String(customContext?.className || customContext?.sinif || profile?.className || '1/A'),
    teacherName: String(customContext?.teacherName || customContext?.ogretmen_adi || mentorTeacher || 'Özlem ZOR'),
    schoolName: String(customContext?.schoolName || customContext?.okul_adi || profile?.schoolName || 'Oxonom Okulları'),
    date: String(customContext?.date || customContext?.tarih || defaultDate),
    time: String(customContext?.time || customContext?.saat || defaultTime),
    studentNo: String(customContext?.studentNo || customContext?.ogrenci_no || profile?.studentNo || '101'),
    gpa: String(customContext?.gpa || customContext?.puan || profile?.gpa || '98.8'),
    gradeLevel: String(customContext?.gradeLevel || customContext?.kademe || profile?.gradeLevel || '1. Sınıf'),
    parentPhone: String(customContext?.parentPhone || customContext?.telefon || profile?.parentPhone || '+90 532 999 1100'),
  }

  try {

  // 1. Öğrenci Adı: {ogrenci_adi}, {ogrenciadi}, {öğrenci_adı}, {ogrenci}, (ogrenci_adi), [ogrenci_adi]
  result = result.replace(/[\{\[\(]\s*(?:ogrenci_adi|ogrenciadi|öğrenci_adı|öğrenciadı|ogrenci|öğrenci|ogrenci_ad|öğrenci_ad)\s*[\}\]\)]/gi, ctx.studentName!)

  // 2. Veli Adı: {veli_adi}, {veliadi}, {veli_adı}, {veli}, {velisi}, (veli_adi), [veli_adi]
  result = result.replace(/[\{\[\(]\s*(?:veli_adi|veliadi|veli_adı|veliadı|veli|velisi|veli_ad|anne_adi|baba_adi)\s*[\}\]\)]/gi, ctx.parentName!)

  // 3. Sınıf / Şube: {sinif}, {sınıf}, {sinifi}, {sınıfı}, {sube}, {şube}, (sinif), [sinif]
  result = result.replace(/[\{\[\(]\s*(?:sinif|sınıf|sinifi|sınıfı|sube|şube|sinif_sube|sınıf_şube)\s*[\}\]\)]/gi, ctx.className!)

  // 4. Öğretmen Adı: {ogretmen_adi}, {ogretmenadi}, {öğretmen_adı}, {ogretmen}, {öğretmen}, (ogretmen_adi), [ogretmen_adi]
  result = result.replace(/[\{\[\(]\s*(?:ogretmen_adi|ogretmenadi|öğretmen_adı|öğretmenadı|ogretmen|öğretmen|ogretmeni|öğretmeni|ogretmen_ad)\s*[\}\]\)]/gi, ctx.teacherName!)

  // 5. Okul Adı: {okul_adi}, {okuladi}, {okul_adı}, {okul}, {okulu}, (okul_adi), [okul_adi]
  result = result.replace(/[\{\[\(]\s*(?:okul_adi|okuladi|okul_adı|okuladı|okul|okulu|kurum_adi|kurum)\s*[\}\]\)]/gi, ctx.schoolName!)

  // 6. Tarih: {tarih}, {tarihi}, {derstarih}, {gun}, (tarih), [tarih]
  result = result.replace(/[\{\[\(]\s*(?:tarih|tarihi|derstarih|ders_tarihi|gun|gün)\s*[\}\]\)]/gi, ctx.date!)

  // 7. Saat: {saat}, {saati}, {vakit}, (saat), [saat]
  result = result.replace(/[\{\[\(]\s*(?:saat|saati|vakit|zaman)\s*[\}\]\)]/gi, ctx.time!)

  // 8. Öğrenci No: {ogrenci_no}, {öğrenci_no}, {okul_no}, {numara}, (ogrenci_no), [ogrenci_no]
  result = result.replace(/[\{\[\(]\s*(?:ogrenci_no|öğrenci_no|okul_no|numara|no)\s*[\}\]\)]/gi, ctx.studentNo!)

  // 9. Puan / Not / Ortalama: {puan}, {not}, {gpa}, {ortalama}
  result = result.replace(/[\{\[\(]\s*(?:puan|not|gpa|ortalama)\s*[\}\]\)]/gi, String(ctx.gpa!))

  // 10. Kademe / Seviye: {kademe}, {seviye}, {sinif_seviyesi}
  result = result.replace(/[\{\[\(]\s*(?:kademe|seviye|sinif_seviyesi)\s*[\}\]\)]/gi, ctx.gradeLevel!)

  // 11. Veli Telefon: {telefon}, {tel}, {veli_tel}
  result = result.replace(/[\{\[\(]\s*(?:telefon|tel|veli_tel|veli_telefon)\s*[\}\]\)]/gi, ctx.parentPhone)
  } catch (_) {}

  return result
}

export function getSynchronizedStudentAnnouncements(): StudentAnnouncement[] {
  let list: StudentAnnouncement[] = STUDENT_ANNOUNCEMENTS
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('oxonom_student_announcements')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed.filter((item: any) => item && typeof item === 'object')
        }
      }
    } catch (_) {}
  }
  return list.map((item: any, idx: number) => {
    const fallbackId = `ann-${idx}`
    const updated: StudentAnnouncement = {
      id: String(item?.id || fallbackId),
      title: String(item?.title || ''),
      author: String(item?.author || 'Oxonom Okulları'),
      authorRole: String(item?.authorRole || 'Okul Yönetimi'),
      date: String(item?.date || 'Bugün'),
      category: item?.category || 'general',
      priority: item?.priority || 'normal',
      content: String(item?.content || ''),
      isPinned: Boolean(item?.isPinned),
    }
    if (updated.title.includes('9-A')) {
      updated.title = updated.title.replace(/9-A/g, '1/A')
    }
    if (updated.content.includes('9-A')) {
      updated.content = updated.content.replace(/9-A/g, '1/A')
    }
    if (updated.authorRole.includes('9-A')) {
      updated.authorRole = '1/A Sınıf Öğretmeni'
    }
    // Automatically resolve all bracketed variables with user info
    updated.title = resolveAnnouncementVariables(updated.title)
    updated.content = resolveAnnouncementVariables(updated.content)
    return updated
  })
}

export function saveSynchronizedStudentAnnouncement(newAnnouncement: StudentAnnouncement) {
  if (typeof window === 'undefined') return
  try {
    const toSave: StudentAnnouncement = {
      ...newAnnouncement,
      title: resolveAnnouncementVariables(newAnnouncement.title),
      content: resolveAnnouncementVariables(newAnnouncement.content),
    }
    const current = getSynchronizedStudentAnnouncements()
    const updated = [toSave, ...current.filter((a) => a.id !== toSave.id)]
    localStorage.setItem('oxonom_student_announcements', JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('oxonom_student_announcements_updated', { detail: updated }))
    window.dispatchEvent(new CustomEvent('oxonom_student_updated'))
  } catch (_) {}
}

// Student submission storage
const SUBMISSIONS_STORAGE_KEY = 'oxonom_student_submissions_ercil'

export interface StudentSubmission {
  assignmentId: string
  submittedAt: string
  content: string
  fileName?: string
  status: 'submitted' | 'graded'
  score?: number
  feedback?: string
}

export function getStudentSubmissions(): Record<string, StudentSubmission> {
  if (typeof window === 'undefined') return {}
  const res: Record<string, StudentSubmission> = {}
  try {
    const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      Object.assign(res, parsed)
    }
  } catch (_) {}

  // Merge live teacher evaluations from m_homework_submissions_v2
  try {
    const teacherRaw = localStorage.getItem('m_homework_submissions_v2')
    if (teacherRaw) {
      const parsedTeacher = JSON.parse(teacherRaw)
      Object.entries(parsedTeacher).forEach(([hwId, subs]: [string, any]) => {
        const studentSub = subs?.['s-1'] || subs?.['101']
        if (studentSub) {
          res[hwId] = {
            assignmentId: hwId,
            submittedAt: studentSub.submittedAt || new Date().toLocaleDateString('tr-TR'),
            content: res[hwId]?.content || 'Çalışma teslim edildi.',
            fileName: res[hwId]?.fileName,
            status: studentSub.score !== undefined ? 'graded' : 'submitted',
            score: studentSub.score,
            feedback: studentSub.feedback,
          }
        }
      })
    }
  } catch (_) {}

  return res
}

export function saveStudentSubmission(sub: StudentSubmission): void {
  if (typeof window === 'undefined') return
  try {
    const current = getStudentSubmissions()
    current[sub.assignmentId] = sub
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(current))

    // Bridge into teacher storage m_homework_submissions_v2 so teacher sees it immediately
    try {
      const teacherRaw = localStorage.getItem('m_homework_submissions_v2')
      const teacherData = teacherRaw ? JSON.parse(teacherRaw) : {}
      const record = {
        studentId: 's-1',
        score: sub.score ?? 100,
        feedback: sub.feedback || (sub.content ? `Öğrenci Yanıtı: ${sub.content}` : 'Ödev teslimi alındı.'),
        submittedAt: sub.submittedAt || new Date().toLocaleString('tr-TR'),
        status: 'submitted',
      }

      if (!teacherData[sub.assignmentId]) teacherData[sub.assignmentId] = {}
      teacherData[sub.assignmentId]['s-1'] = record

      // Also bridge under canonical aliases if known
      const allAsgs = getSynchronizedStudentAssignments()
      const found = allAsgs.find((a: any) => String(a.assignment_uuid) === sub.assignmentId || String(a.id) === sub.assignmentId)
      if (found) {
        if (found.id) {
          if (!teacherData[found.id]) teacherData[found.id] = {}
          teacherData[found.id]['s-1'] = record
        }
        if (found.assignment_uuid) {
          if (!teacherData[found.assignment_uuid]) teacherData[found.assignment_uuid] = {}
          teacherData[found.assignment_uuid]['s-1'] = record
        }
      }

      localStorage.setItem('m_homework_submissions_v2', JSON.stringify(teacherData))
    } catch (_) {}

    window.dispatchEvent(new CustomEvent('oxonom_student_submission_updated', { detail: sub }))
    window.dispatchEvent(new CustomEvent('oxonom_student_homeworks_updated', { detail: sub }))
  } catch (_) {}
}

// Student Planner tasks storage
const PLANNER_TASKS_KEY = 'oxonom_student_planner_tasks_ercil'

export interface PlannerTask {
  id: string
  title: string
  course: string
  dueDate: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  bookId?: number | string
  bookTitle?: string
  pageNumber?: number
}

export const INITIAL_PLANNER_TASKS: PlannerTask[] = [
  { id: 'pt-1', title: 'Türkçe ses kartları ve hece okuma çalışması', course: 'Türkçe', dueDate: 'Bugün', completed: false, priority: 'high' },
  { id: 'pt-2', title: 'Matematik 1-20 arası ritmik sayma etkinliği', course: 'Matematik', dueDate: 'Yarın', completed: false, priority: 'medium' },
  { id: 'pt-3', title: 'Hayat Bilgisi okul kuralları resmi boyama', course: 'Hayat Bilgisi', dueDate: '16 Ekim', completed: true, priority: 'low' },
  { id: 'pt-4', title: 'İngilizce Greetings şarkısı telaffuz tekrarı', course: 'Yabancı Dil (İngilizce)', dueDate: '18 Ekim', completed: false, priority: 'medium' },
]

export function getStoredPlannerTasks(): PlannerTask[] {
  if (typeof window === 'undefined') return INITIAL_PLANNER_TASKS
  try {
    const raw = localStorage.getItem(PLANNER_TASKS_KEY)
    if (!raw) return INITIAL_PLANNER_TASKS
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_PLANNER_TASKS
  } catch (_) {
    return INITIAL_PLANNER_TASKS
  }
}

export function saveStoredPlannerTasks(tasks: PlannerTask[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PLANNER_TASKS_KEY, JSON.stringify(tasks))
  } catch (_) {}
}

// ────────────────────────────────────────────────────────────
// DYNAMIC SYNCHRONIZATION WITH TEACHER & PRINCIPAL ACCOUNTS
// ────────────────────────────────────────────────────────────

/**
 * Returns the authoritative student profile synchronized with the
 * teacher and principal portal records (oxonom_m_students_v3, teacher profile, attendance).
 */
export function getSynchronizedStudentProfile(): StudentProfile {
  if (typeof window === 'undefined') return DEFAULT_STUDENT_PROFILE

  try {
    let studentRecord: MStudentItem | null = null

    // 1. Read from authoritative student directory managed by teachers and principal
    const rawStudents = localStorage.getItem('oxonom_m_students_v3')
    if (rawStudents) {
      try {
        const parsed = JSON.parse(rawStudents)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Erçil UĞURLU (student ID s-1, No 101, class 9-A)
          studentRecord =
            parsed.find(
              (s: MStudentItem) =>
                s.id === 's-1' ||
                s.studentNo === '101' ||
                (s.name && s.name.toLowerCase().includes('erçil'))
            ) ||
            parsed.find(
              (s: MStudentItem) =>
                s.className?.includes('9-A') || s.className?.includes('9/A')
            ) ||
            parsed[0]
        }
      } catch (_) {}
    }

    if (!studentRecord) {
      studentRecord = ALL_INITIAL_STUDENTS[0] || (DEFAULT_STUDENT_PROFILE as any)
    }

    let needStudentCleanse = false
    if (studentRecord) {
      const is9 = !studentRecord.className || studentRecord.className.includes('9') || studentRecord.className === '9-A'
      const isErcil = (studentRecord.name && studentRecord.name.toLowerCase().includes('erçil')) || studentRecord.studentNo === '101'
      if (is9 || isErcil) {
        studentRecord.className = '1/A'
        ;(studentRecord as any).gradeLevel = '1. Sınıf'
        studentRecord.mentorTeacher = 'Özlem ZOR (Sınıf Öğretmeni)'
        if (!studentRecord.gpa || Number(studentRecord.gpa) < 50) {
          studentRecord.gpa = 98.8
          needStudentCleanse = true
        }
        // If grades have high school subjects, replace with authentic 1. Sınıf grades
        const hasHighSchool = studentRecord.grades?.some((g: any) =>
          g.courseName?.includes('Edebiyat') || g.courseName?.includes('Fizik') || g.courseName?.includes('Felsefe') || g.courseName?.includes('Bilişim')
        )
        if (!studentRecord.grades || studentRecord.grades.length === 0 || hasHighSchool) {
          studentRecord.grades = [
            { courseName: 'Türkçe', teacherName: 'Özlem ZOR', exam1: 99, exam2: 100, performance: 99, average: 99.3 },
            { courseName: 'Matematik', teacherName: 'Özlem ZOR', exam1: 98, exam2: 97, performance: 99, average: 98.0 },
            { courseName: 'Hayat Bilgisi', teacherName: 'Özlem ZOR', exam1: 100, exam2: 98, performance: 99, average: 99.0 },
            { courseName: 'Yabancı Dil (İngilizce)', teacherName: 'Nilgün KAYA', exam1: 98, exam2: 100, performance: 99, average: 99.0 },
          ]
          needStudentCleanse = true
        }
      }
    }

    if (needStudentCleanse && rawStudents) {
      try {
        const parsed = JSON.parse(rawStudents)
        if (Array.isArray(parsed)) {
          const updated = parsed.map((s: any) => {
            if (s.id === studentRecord?.id || s.studentNo === '101' || (s.name && s.name.toLowerCase().includes('erçil'))) {
              return studentRecord
            }
            return s
          })
          localStorage.setItem('oxonom_m_students_v3', JSON.stringify(updated))
        }
      } catch (_) {}
    }

    // 2. Mentor Teacher synchronization from active teacher's profile
    let mentorTeacher = studentRecord.mentorTeacher || 'Özlem ZOR (Sınıf Öğretmeni)'
    const rawTeacher = localStorage.getItem('oxonom_teacher_profile')
    if (rawTeacher) {
      try {
        const teacherObj = JSON.parse(rawTeacher)
        const tName = `${teacherObj.firstName || teacherObj.name || 'Özlem'} ${teacherObj.lastName || 'ZOR'}`.trim()
        const tBranch = teacherObj.branch || 'Sınıf Öğretmeni'
        mentorTeacher = `${tName} (${tBranch})`
      } catch (_) {}
    }

    // 3. Dynamic GPA and Course Grades calculation from official student record & calendar exams
    const baseCurriculum = [
      'Türkçe',
      'Matematik',
      'Hayat Bilgisi',
      'Yabancı Dil (İngilizce)',
      'Görsel Sanatlar',
      'Müzik',
      'Beden Eğitimi ve Oyun',
    ]

    const gradesMap = new Map<string, MStudentCourseGrade>()

    // Seed base courses
    baseCurriculum.forEach((cName) => {
      gradesMap.set(cName, {
        courseName: cName,
        teacherName: cName.includes('İngilizce')
          ? 'Nilgün KAYA'
          : cName.includes('Beden')
          ? 'Selim AKSOY'
          : cName.includes('Görsel')
          ? 'Gülşah ÖZTÜRK'
          : cName.includes('Müzik')
          ? 'Bahar ŞEN'
          : 'Özlem ZOR',
      })
    })

    // Overlay studentRecord.grades
    if (studentRecord.grades && Array.isArray(studentRecord.grades)) {
      studentRecord.grades.forEach((g) => {
        if (g && g.courseName) {
          const existing = gradesMap.get(g.courseName) || {
            courseName: g.courseName,
            teacherName: g.teacherName || 'Ders Öğretmeni',
          }
          gradesMap.set(g.courseName, { ...existing, ...g })
        }
      })
    }

    // Overlay actual exam scores from getStoredSchoolExams()
    try {
      const calendarExams = getStoredSchoolExams()
      const studentId = studentRecord.id || 's-1'

      calendarExams.forEach((ce) => {
        const studentScore = ce.scores?.[studentId] ?? ce.scores?.['s-1']
        if (studentScore !== undefined && studentScore !== null && String(studentScore) !== '') {
          const scoreNum = Number(studentScore)
          const targetCourse = ce.courseName
          const cur = gradesMap.get(targetCourse) || {
            courseName: targetCourse,
            teacherName: ce.teacherName || 'Ders Öğretmeni',
          }

          if (
            ce.type === 'performance' ||
            ce.type === 'oral' ||
            (ce.examTypeLabel || '').includes('Sözlü') ||
            (ce.examTypeLabel || '').includes('Performans')
          ) {
            cur.performance = scoreNum
          } else if (ce.title.includes('2.') || (ce.id && ce.id.includes('2'))) {
            cur.exam2 = scoreNum
          } else {
            cur.exam1 = scoreNum
          }

          gradesMap.set(targetCourse, cur)
        }
      })
    } catch (_) {}

    // Calculate each course average strictly from entered components
    const grades: MStudentCourseGrade[] = Array.from(gradesMap.values()).map((g) => {
      const e1 = g.exam1 !== undefined && g.exam1 !== null && String(g.exam1) !== '' ? Number(g.exam1) : null
      const e2 = g.exam2 !== undefined && g.exam2 !== null && String(g.exam2) !== '' ? Number(g.exam2) : null
      const perf = g.performance !== undefined && g.performance !== null && String(g.performance) !== '' ? Number(g.performance) : null

      const entered: { val: number; weight: number }[] = []
      if (e1 !== null && !isNaN(e1)) entered.push({ val: e1, weight: 0.4 })
      if (e2 !== null && !isNaN(e2)) entered.push({ val: e2, weight: 0.4 })
      if (perf !== null && !isNaN(perf)) entered.push({ val: perf, weight: 0.2 })

      let avg: number | undefined = undefined
      if (entered.length > 0) {
        const totalWeight = entered.reduce((acc, c) => acc + c.weight, 0)
        const weightedSum = entered.reduce((acc, c) => acc + c.val * c.weight, 0)
        avg = Number((weightedSum / totalWeight).toFixed(1))
      } else if (g.average !== undefined && g.average !== null && !isNaN(Number(g.average))) {
        avg = Number(Number(g.average).toFixed(1))
      }

      return {
        ...g,
        average: avg,
      }
    })

    // Calculate overall GPA strictly from courses that have actual grades
    const coursesWithAverage = grades.filter((g) => g.average !== undefined && g.average !== null)
    let calculatedGpa = 0

    if (coursesWithAverage.length > 0) {
      const sum = coursesWithAverage.reduce((acc, g) => acc + (Number(g.average) || 0), 0)
      calculatedGpa = Number((sum / coursesWithAverage.length).toFixed(1))
    } else if (typeof studentRecord.gpa === 'number') {
      calculatedGpa = studentRecord.gpa
    } else if (studentRecord.gpa) {
      calculatedGpa = Number(studentRecord.gpa)
    }

    // Dynamic Class Rank based on GPA
    let classRank = studentRecord.classRank || 1
    if (calculatedGpa > 0) {
      if (calculatedGpa < 50) {
        classRank = 30
      } else if (calculatedGpa < 70) {
        classRank = 18
      } else if (calculatedGpa < 85) {
        classRank = 8
      } else {
        classRank = 1
      }
    } else {
      classRank = studentRecord.classRank || 1
    }

    let disciplineStatus = studentRecord.disciplineStatus || 'Temiz Sicil'
    if (calculatedGpa >= 85) {
      disciplineStatus = 'Temiz Sicil — Üstün Başarı Onur Belgesi'
    } else if (calculatedGpa >= 60) {
      disciplineStatus = 'Temiz Sicil — Başarı Takip Sürecinde'
    } else if (calculatedGpa > 0) {
      disciplineStatus = 'Temiz Sicil — Akademik Destek ve Etüt Takibinde'
    }

    // 4. Live Attendance Synchronization from teacher's attendance service
    let attendanceRate = studentRecord.attendanceRate || 100
    let absentDays = (studentRecord.absentExcusedDays || 0) + (studentRecord.absentUnexcusedDays || 0)
    try {
      const summary = getStudentAttendanceSummary(
        studentRecord.id || 's-1',
        studentRecord.studentNo || '101',
        studentRecord.className || '1/A'
      )
      attendanceRate = summary.attendanceRate
      absentDays = summary.absentSessions
    } catch (_) {}

    const nameParts = (studentRecord.name || 'Erçil UĞURLU').split(' ')
    const firstName = nameParts[0] || 'Erçil'
    const lastName = nameParts.slice(1).join(' ') || 'UĞURLU'

    return {
      id: studentRecord.id || 's-1',
      name: studentRecord.name || 'Erçil UĞURLU',
      firstName,
      lastName,
      email: studentRecord.email || 'ogrenci@oxonom.com',
      studentNo: studentRecord.studentNo || '101',
      tcNo: studentRecord.tcNo || '10000000146',
      gender: studentRecord.gender || 'Erkek',
      birthDate: studentRecord.birthDate || '15.06.2018 (7 Yaşında)',
      bloodType: studentRecord.bloodType || 'A Rh+',
      enrollmentDate: studentRecord.enrollmentDate || '01.09.2024',
      className: studentRecord.className ? studentRecord.className.replace(' Şubesi', '') : '1/A',
      gradeLevel: (studentRecord as any).gradeLevel || '1. Sınıf',
      mentorTeacher: mentorTeacher || 'Özlem ZOR (Sınıf Öğretmeni)',
      schoolName: studentRecord.schoolName || 'Oxonom Okulları',
      gpa: calculatedGpa,
      classRank,
      attendanceRate,
      absentDays,
      absentExcusedDays: studentRecord.absentExcusedDays ?? 0,
      absentUnexcusedDays: studentRecord.absentUnexcusedDays ?? absentDays,
      parentName: studentRecord.parentName || 'Ebru UĞURLU',
      parentPhone: studentRecord.parentPhone || '+90 532 999 1100',
      parentRelation: studentRecord.parentRelation || 'Anne (Mimar)',
      secondParentName: studentRecord.secondParentName || 'Dr. Uğur UĞURLU',
      secondParentPhone: studentRecord.secondParentPhone || '+90 532 999 2200',
      secondParentRelation: studentRecord.secondParentRelation || 'Baba (Kurum Müdürü)',
      emergencyPhone: studentRecord.emergencyPhone || '+90 532 999 2200',
      address: studentRecord.address || 'Caddebostan Mah. Bağdat Cad. No: 142/5 Kadıköy / İstanbul',
      disciplineStatus,
      specialHealthNote: studentRecord.specialHealthNote,
      notes: studentRecord.notes,
      guidanceNotes: (studentRecord.guidanceNotes as any) || [],
      grades,
    }
  } catch (err) {
    console.warn('getSynchronizedStudentProfile fallback:', err)
    return DEFAULT_STUDENT_PROFILE
  }
}

/**
 * Returns dynamic assessments matching the teacher's grade book records for the student.
 */
export function getSynchronizedStudentAssessments(): StudentAssessment[] {
  const profile = getSynchronizedStudentProfile()
  const grades = profile.grades || []
  const assessments: StudentAssessment[] = []

  try {
    const calendarExams = getStoredSchoolExams()
    const currentClass = profile.className || '1/A'
    const normCurrent = currentClass.replace(/[-_]/g, '/').replace(/\s*şubesi\b|\s*subesi\b/gi, '').trim().toUpperCase()

    calendarExams.forEach((ce: any) => {
      const normCeClass = (ce.className || '').replace(/[-_]/g, '/').replace(/\s*şubesi\b|\s*subesi\b/gi, '').trim().toUpperCase()
      const matchClass =
        !ce.className ||
        ce.className === 'Tüm Sınıflar' ||
        normCeClass === normCurrent ||
        normCeClass === '' ||
        normCurrent.includes(normCeClass) ||
        normCeClass.includes(normCurrent)

      if (!matchClass) return

      const studentScore = ce.scores?.[profile.id] ?? ce.scores?.['s-1']
      const hasScoreInExam = studentScore !== undefined && studentScore !== null && String(studentScore) !== ''

      // Also check matching grade record
      const courseGrade = grades.find(
        (g) =>
          g.courseName.toLowerCase().includes(ce.courseName.toLowerCase()) ||
          ce.courseName.toLowerCase().includes(g.courseName.toLowerCase())
      )

      let resolvedScore: number | undefined = hasScoreInExam ? Number(studentScore) : undefined

      if (resolvedScore === undefined && courseGrade) {
        if (ce.type === 'performance' || ce.type === 'oral' || (ce.examTypeLabel || '').includes('Sözlü') || (ce.examTypeLabel || '').includes('Performans')) {
          if (courseGrade.performance !== undefined && courseGrade.performance !== null && String(courseGrade.performance) !== '') {
            resolvedScore = Number(courseGrade.performance)
          }
        } else if (ce.title.includes('2.') || ce.id.includes('2')) {
          if (courseGrade.exam2 !== undefined && courseGrade.exam2 !== null && String(courseGrade.exam2) !== '') {
            resolvedScore = Number(courseGrade.exam2)
          }
        } else if (ce.title.includes('1.') || ce.id.includes('1')) {
          if (courseGrade.exam1 !== undefined && courseGrade.exam1 !== null && String(courseGrade.exam1) !== '') {
            resolvedScore = Number(courseGrade.exam1)
          }
        }
      }

      const isGraded = resolvedScore !== undefined && !isNaN(resolvedScore)
      const typeLabel =
        ce.examTypeLabel ||
        (ce.type === 'quiz'
          ? 'Quiz'
          : ce.type === 'oral'
          ? 'Sözlü Sınav'
          : ce.type === 'performance'
          ? 'Performans / Proje'
          : ce.type === 'mock'
          ? 'Deneme Sınavı'
          : 'Yazılı Sınav')

      let feedback: string | undefined = undefined
      if (isGraded && resolvedScore !== undefined) {
        if (resolvedScore >= 85) {
          feedback = `${ce.teacherName || courseGrade?.teacherName || 'Öğretmen'}: Üstün akademik başarı ve konu hakimiyeti (${resolvedScore}/100).`
        } else if (resolvedScore >= 50) {
          feedback = `${ce.teacherName || courseGrade?.teacherName || 'Öğretmen'}: Başarılı çalışma, eksik kazanımlar tekrar edilmelidir (${resolvedScore}/100).`
        } else {
          feedback = `${ce.teacherName || courseGrade?.teacherName || 'Öğretmen'}: Kritik başarı seviyesi (${resolvedScore}/100). Birebir etüt ve telafi çalışması zorunludur.`
        }
      }

      assessments.push({
        id: ce.id || `exam-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        title: ce.title,
        courseName: ce.courseName,
        type: ce.type || 'exam',
        examTypeLabel: typeLabel,
        date: ce.date,
        time: ce.time || '10:20 - 11:00',
        period: ce.period,
        durationMinutes: ce.durationMinutes || 40,
        location: ce.location || `Derslik 101 (${currentClass})`,
        maxScore: 100,
        score: isGraded ? resolvedScore : undefined,
        isGraded,
        isPublished: true,
        status: isGraded ? 'completed' : 'upcoming',
        teacherFeedback: feedback,
        scope: ce.scope,
        teacherName: ce.teacherName || courseGrade?.teacherName || 'Ebru TEKNECİ',
        className: ce.className,
      })
    })
  } catch (err) {
    console.warn('Error in getSynchronizedStudentAssessments:', err)
  }

  return assessments
}

/**
 * Returns courses matching the teacher and schedule records for the student.
 * Dynamically merges materials added by teacher from oxonom_course_materials_${course.id}.
 */
export function getSynchronizedStudentCourses(): StudentCourse[] {
  const profile = getSynchronizedStudentProfile()

  return STUDENT_COURSES.map((course) => {
    const gradeMatch = profile.grades?.find((g) => g.courseName === course.name)
    const teacherName =
      gradeMatch?.teacherName ||
      (course.name === 'Türkçe' || course.name === 'Matematik' || course.name === 'Hayat Bilgisi'
        ? profile.mentorTeacher.split('(')[0].trim()
        : course.teacherName)

    let courseMaterials = [...course.materials]
    if (typeof window !== 'undefined') {
      try {
        const rawCustomMat = localStorage.getItem(`oxonom_course_materials_${course.id}`)
        if (rawCustomMat) {
          const parsed = JSON.parse(rawCustomMat)
          if (Array.isArray(parsed)) {
            courseMaterials = [...courseMaterials, ...parsed]
          }
        }
      } catch (_) {}
    }

    return {
      ...course,
      materials: courseMaterials,
      classroom: `${profile.className} (${course.roomType})`,
      teacherName,
    }
  })
}

/**
 * Returns guidance & pedagogical notes written by the teacher for this student.
 */
export function getSynchronizedGuidanceNotes(): GuidanceNoteItem[] {
  const profile = getSynchronizedStudentProfile()
  if (profile.guidanceNotes && profile.guidanceNotes.length > 0) {
    return profile.guidanceNotes
  }
  return [
    {
      id: 'gn-1',
      date: '28.09.2026',
      author: 'Özlem ZOR (1/A Sınıf Öğretmeni)',
      content:
        'Öğrencinin ilk okuma yazma hazırlık sürecindeki motivasyonu, sesleri fark etme ve arkadaşlarıyla uyumu mükemmel düzeydedir.',
    },
    {
      id: 'gn-2',
      date: '15.09.2026',
      author: 'Dr. Uğur UĞURLU (Okul Müdürü)',
      content:
        'Velisi Ebru Hanım ile 1. sınıf oryantasyon ve okula uyum süreci görüşmesi başarıyla gerçekleştirildi.',
    },
  ]
}

// Canonical 30-hour (6 periods/day x 5 days) schedule for 1/A matching the Principal's 1. Sınıf curriculum
export const CANONICAL_1A_SCHEDULE_30: ScheduleEntry[] = [
  // Pazartesi (6)
  { id: 'sc-1a-mon-1', orgId: 30, day: 'mon', period: 1, classCode: '1/A', subject: 'Türkçe', teacherName: 'Özlem ZOR', roomName: '1. Kat · Derslik 101', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-1a-mon-2', orgId: 30, day: 'mon', period: 2, classCode: '1/A', subject: 'Türkçe', teacherName: 'Özlem ZOR', roomName: '1. Kat · Derslik 101', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-1a-mon-3', orgId: 30, day: 'mon', period: 3, classCode: '1/A', subject: 'Matematik', teacherName: 'Özlem ZOR', roomName: '1. Kat · Derslik 101', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-1a-mon-4', orgId: 30, day: 'mon', period: 4, classCode: '1/A', subject: 'Matematik', teacherName: 'Özlem ZOR', roomName: '1. Kat · Derslik 101', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-1a-mon-5', orgId: 30, day: 'mon', period: 5, classCode: '1/A', subject: 'Hayat Bilgisi', teacherName: 'Özlem ZOR', roomName: '1. Kat · Derslik 101', color: 'teal', isSmartBoardActive: true },
  { id: 'sc-1a-mon-6', orgId: 30, day: 'mon', period: 6, classCode: '1/A', subject: 'Beden Eğitimi ve Oyun', teacherName: 'Selim AKSOY', roomName: 'Kapalı Spor Salonu', color: 'orange', isSmartBoardActive: false },

  // Salı (6)
  { id: 'sc-1a-tue-1', orgId: 30, day: 'tue', period: 1, classCode: '1/A', subject: 'Türkçe', teacherName: 'Özlem ZOR', roomName: '1. Kat · Derslik 101', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-1a-tue-2', orgId: 30, day: 'tue', period: 2, classCode: '1/A', subject: 'Türkçe', teacherName: 'Özlem ZOR', roomName: '1. Kat · Derslik 101', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-1a-tue-3', orgId: 30, day: 'tue', period: 3, classCode: '1/A', subject: 'Matematik', teacherName: 'Özlem ZOR', roomName: '1. Kat · Derslik 101', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-1a-tue-4', orgId: 30, day: 'tue', period: 4, classCode: '1/A', subject: 'Hayat Bilgisi', teacherName: 'Özlem ZOR', roomName: '1. Kat · Derslik 101', color: 'teal', isSmartBoardActive: true },
  { id: 'sc-1a-tue-5', orgId: 30, day: 'tue', period: 5, classCode: '1/A', subject: 'Yabancı Dil (İngilizce)', teacherName: 'Canan YILDIRIM', roomName: '1. Kat · Derslik 101', color: 'purple', isSmartBoardActive: true },
  { id: 'sc-1a-tue-6', orgId: 30, day: 'tue', period: 6, classCode: '1/A', subject: 'Beden Eğitimi ve Oyun', teacherName: 'Selim AKSOY', roomName: 'Kapalı Spor Salonu', color: 'orange', isSmartBoardActive: false },

  // Çarşamba (6)
  { id: 'sc-1a-wed-1', orgId: 30, day: 'wed', period: 1, classCode: '1/A', subject: 'Türkçe', teacherName: 'Özlem ZOR', roomName: '1. Kat · Derslik 101', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-1a-wed-2', orgId: 30, day: 'wed', period: 2, classCode: '1/A', subject: 'Türkçe', teacherName: 'Özlem ZOR', roomName: '1. Kat · Derslik 101', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-1a-wed-3', orgId: 30, day: 'wed', period: 3, classCode: '1/A', subject: 'Matematik', teacherName: 'Özlem ZOR', roomName: '1. Kat · Derslik 101', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-1a-wed-4', orgId: 30, day: 'wed', period: 4, classCode: '1/A', subject: 'Hayat Bilgisi', teacherName: 'Özlem ZOR', roomName: '1. Kat · Derslik 101', color: 'teal', isSmartBoardActive: true },
  { id: 'sc-1a-wed-5', orgId: 30, day: 'wed', period: 5, classCode: '1/A', subject: 'Görsel Sanatlar', teacherName: 'Gülşah ÖZTÜRK', roomName: 'Görsel Sanatlar Atölyesi', color: 'pink', isSmartBoardActive: false },
  { id: 'sc-1a-wed-6', orgId: 30, day: 'wed', period: 6, classCode: '1/A', subject: 'Beden Eğitimi ve Oyun', teacherName: 'Selim AKSOY', roomName: 'Kapalı Spor Salonu', color: 'orange', isSmartBoardActive: false },

  // Perşembe (6)
  { id: 'sc-1a-thu-1', orgId: 30, day: 'thu', period: 1, classCode: '1/A', subject: 'Türkçe', teacherName: 'Özlem ZOR', roomName: '1. Kat · Derslik 101', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-1a-thu-2', orgId: 30, day: 'thu', period: 2, classCode: '1/A', subject: 'Türkçe', teacherName: 'Özlem ZOR', roomName: '1. Kat · Derslik 101', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-1a-thu-3', orgId: 30, day: 'thu', period: 3, classCode: '1/A', subject: 'Matematik', teacherName: 'Özlem ZOR', roomName: '1. Kat · Derslik 101', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-1a-thu-4', orgId: 30, day: 'thu', period: 4, classCode: '1/A', subject: 'Hayat Bilgisi', teacherName: 'Özlem ZOR', roomName: '1. Kat · Derslik 101', color: 'teal', isSmartBoardActive: true },
  { id: 'sc-1a-thu-5', orgId: 30, day: 'thu', period: 5, classCode: '1/A', subject: 'Müzik', teacherName: 'Müzik Zümresi', roomName: 'Müzik Odası', color: 'pink', isSmartBoardActive: true },
  { id: 'sc-1a-thu-6', orgId: 30, day: 'thu', period: 6, classCode: '1/A', subject: 'Beden Eğitimi ve Oyun', teacherName: 'Selim AKSOY', roomName: 'Kapalı Spor Salonu', color: 'orange', isSmartBoardActive: false },

  // Cuma (6)
  { id: 'sc-1a-fri-1', orgId: 30, day: 'fri', period: 1, classCode: '1/A', subject: 'Türkçe', teacherName: 'Özlem ZOR', roomName: '1. Kat · Derslik 101', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-1a-fri-2', orgId: 30, day: 'fri', period: 2, classCode: '1/A', subject: 'Türkçe', teacherName: 'Özlem ZOR', roomName: '1. Kat · Derslik 101', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-1a-fri-3', orgId: 30, day: 'fri', period: 3, classCode: '1/A', subject: 'Yabancı Dil (İngilizce)', teacherName: 'Canan YILDIRIM', roomName: '1. Kat · Derslik 101', color: 'purple', isSmartBoardActive: true },
  { id: 'sc-1a-fri-4', orgId: 30, day: 'fri', period: 4, classCode: '1/A', subject: 'Serbest Etkinlikler & Kodlama', teacherName: 'Özlem ZOR', roomName: '1. Kat · Derslik 101', color: 'cyan', isSmartBoardActive: true },
  { id: 'sc-1a-fri-5', orgId: 30, day: 'fri', period: 5, classCode: '1/A', subject: 'Serbest Etkinlikler & Kodlama', teacherName: 'Özlem ZOR', roomName: '1. Kat · Derslik 101', color: 'cyan', isSmartBoardActive: true },
  { id: 'sc-1a-fri-6', orgId: 30, day: 'fri', period: 6, classCode: '1/A', subject: 'Beden Eğitimi ve Oyun', teacherName: 'Selim AKSOY', roomName: 'Kapalı Spor Salonu', color: 'orange', isSmartBoardActive: false },
]

export const CANONICAL_9A_SCHEDULE_30: ScheduleEntry[] = CANONICAL_1A_SCHEDULE_30

/**
 * Returns the weekly class schedule configured by the school principal for the given class (defaults to 1/A).
 * Synchronizes from oxonom_admin_schedule_30 and other admin schedule stores with fallback to CANONICAL_1A_SCHEDULE_30.
 */
export function getSynchronizedClassWeeklySchedule(classCode: string = '1/A'): ScheduleEntry[] {
  let entries = CANONICAL_1A_SCHEDULE_30

  if (typeof window !== 'undefined') {
    try {
      const raw30 = localStorage.getItem('oxonom_admin_schedule_30')
      const rawSchedule = localStorage.getItem('oxonom_schedule_30')
      const raw1 = localStorage.getItem('oxonom_admin_schedule_1')
      if (raw30) {
        const parsed = JSON.parse(raw30)
        if (Array.isArray(parsed) && parsed.length > 0) entries = parsed
      } else if (rawSchedule) {
        const parsed = JSON.parse(rawSchedule)
        if (Array.isArray(parsed) && parsed.length > 0) entries = parsed
      } else if (raw1) {
        const parsed = JSON.parse(raw1)
        if (Array.isArray(parsed) && parsed.length > 0) entries = parsed
      } else {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.startsWith('oxonom_admin_schedule_') || key.startsWith('oxonom_schedule_')) && !key.includes('revisions')) {
            const raw = localStorage.getItem(key)
            if (raw) {
              const parsed = JSON.parse(raw)
              if (Array.isArray(parsed) && parsed.length > 0) {
                entries = parsed
                break
              }
            }
          }
        }
      }
    } catch (_) {}
  }

  const normTarget = classCode.replace(/[\/\-\s_]/g, '').toLowerCase()
  const filtered = entries.filter((e) => {
    const rawClass = String((e as any).classCode || (e as any).classroom || '')
    const normEntry = rawClass.replace(/[\/\-\s_]/g, '').toLowerCase()
    return (
      normEntry === normTarget ||
      normEntry.includes(normTarget) ||
      normTarget.includes(normEntry) ||
      (normTarget.startsWith('1') && normEntry.startsWith('1')) ||
      (normTarget.startsWith('9') && normEntry.startsWith('1'))
    )
  })

  return filtered.length > 0 ? filtered : CANONICAL_1A_SCHEDULE_30
}

/**
 * Returns homework assignments assigned by the teacher to 9-A or specifically to Erçil Uğurlu.
 */
export function getSynchronizedStudentAssignments(): SchoolAssignmentItem[] {
  let storedCustom: SchoolAssignmentItem[] = []
  let studentHomeworks: SchoolAssignmentItem[] = []
  const deletedIds = new Set<string>()

  if (typeof window !== 'undefined') {
    try {
      getDeletedHomeworkIds().forEach((id) => deletedIds.add(String(id)))
      const rawDel = localStorage.getItem('oxonom_deleted_homework_ids')
      if (rawDel) {
        const parsedDel = JSON.parse(rawDel)
        if (Array.isArray(parsedDel)) {
          parsedDel.forEach((id: string) => deletedIds.add(String(id)))
        }
      }
    } catch (_) {}

    try {
      storedCustom = getStoredCustomAssignments()
    } catch (_) {}
    try {
      const rawSh = localStorage.getItem('oxonom_student_homeworks_3001')
      if (rawSh) {
        const parsed = JSON.parse(rawSh)
        if (Array.isArray(parsed)) studentHomeworks = parsed
      }
    } catch (_) {}
  }

  // Teacher 9-A initial curriculum assignments
  const teacherDefaults: SchoolAssignmentItem[] = [
    {
      id: 1001,
      assignment_uuid: 'asg_dede_korkut_okuma',
      title: 'Dede Korkut Hikâyeleri Metin Tahlili & Karakter İncelemesi',
      description: 'Dede Korkut destanlarından "Dirse Han Oğlu Boğaç Han" boyunun ana fikri, olay örgüsü ve kültürel motiflerinin tahlili.',
      grade_level: '9. Sınıf',
      grade_category: 'Lise (9-12)',
      subject: 'Türk Dili ve Edebiyatı',
      tool_type: 'READING',
      classes: [{ id: 101, name: '9-A Şubesi', code: '9/A' }],
      due_date: '2026-10-18T23:59:00',
      max_score: 100,
      published: true,
      teacher_name: 'Ebru TEKNECİ',
      creation_date: '2026-10-06T09:00:00',
      tool_data: {
        readingBook: 'Dede Korkut Kitabı',
        readingPages: 'Sayfa 15-42',
        readingQuestions: '1) Boğaç Han boyunun teması nedir? 2) Dirse Han ve hatununun fedakarlığı neyi simgeler?',
      },
    },
    {
      id: 1002,
      assignment_uuid: 'asg_edebi_sanatlar_tahta',
      title: 'Edebi Sanatlar & Teşbih-Mecaz Kavram Haritası Çizimi',
      description: 'Divan ve Halk edebiyatında kullanılan teşbih, istiare ve mecaz-ı mürsel sanatlarını gösteren interaktif kavram haritası.',
      grade_level: '9. Sınıf',
      grade_category: 'Lise (9-12)',
      subject: 'Türk Dili ve Edebiyatı',
      tool_type: 'WHITEBOARD',
      board_uuid: 'board_edebi_sanatlar_9a',
      classes: [{ id: 101, name: '9-A Şubesi', code: '9/A' }],
      due_date: '2026-10-20T23:59:00',
      max_score: 100,
      published: true,
      teacher_name: 'Ebru TEKNECİ',
      creation_date: '2026-10-08T10:00:00',
      tool_data: {
        whiteboardTopic: 'Teşbih, İstiare ve Mecaz Sanatları Şeması',
        whiteboardCanvasType: 'İnteraktif Çizim Tuvali',
      },
    },
    {
      id: 1003,
      assignment_uuid: 'asg_paragraf_anlam_test',
      title: 'Sözcükte Anlam & Paragrafta Ana Düşünce Değerlendirme Quiz',
      description: 'Çoktan seçmeli, doğru-yanlış, eşleştirme ve kısa cevaplı sorular içeren interaktif tarama testi.',
      grade_level: '9. Sınıf',
      grade_category: 'Lise (9-12)',
      subject: 'Türk Dili ve Edebiyatı',
      tool_type: 'QUIZ',
      classes: [{ id: 101, name: '9-A Şubesi', code: '9/A' }],
      due_date: '2026-10-22T23:59:00',
      max_score: 100,
      published: true,
      teacher_name: 'Ebru TEKNECİ',
      creation_date: '2026-10-09T11:00:00',
      quiz_questions: [
        {
          id: 'q-1',
          questionNumber: 1,
          type: 'multiple_choice',
          prompt: '“Yazar, olayları bir kamera sessizliğiyle aktarmak yerine karakterlerinin iç dünyasındaki fırtınaları kelimelere dökmüştür.” Bu cümlede yazarın öne çıkan özelliği aşağıdakilerden hangisidir?',
          points: 25,
          options: [
            { id: 'A', label: 'A', text: 'Olayları kronolojik sırayla belgesel gibi aktarması' },
            { id: 'B', label: 'B', text: 'Ruhsal tahlil ve iç çatışmaları derinlemesine işlemesi' },
            { id: 'C', label: 'C', text: 'Sadece dış gözleme dayalı betimlemeler yapması' },
            { id: 'D', label: 'D', text: 'Mekân tasvirlerine odaklanıp insanı arka plana atması' },
          ],
          correctOptionId: 'B',
          explanation: 'Karakterlerin iç dünyasındaki fırtınalar, bireyin psikolojik ve ruhsal boyutunu derinlemesine ele almayı ifade eder.',
        },
        {
          id: 'q-2',
          questionNumber: 2,
          type: 'true_false',
          prompt: 'Dede Korkut Hikâyelerinde olağanüstü mitolojik motifler ile gerçekçi tarihsel unsurlar bir arada bulunur ve eser nazım-nesir (şiir-düzyazı) karışık olarak kaleme alınmıştır.',
          points: 25,
          correctBoolean: true,
          explanation: 'Dede Korkut destansı anlatılarında olaylar düzyazı, duygular şiir biçimindedir.',
        },
        {
          id: 'q-3',
          questionNumber: 3,
          type: 'matching',
          prompt: 'Aşağıdaki edebi sanatları uygun şiir dizeleriyle eşleştiriniz.',
          points: 25,
          matchingPairs: [
            { id: 'm-1', left: 'Teşbih (Benzetme)', right: 'Kükremiş sel gibiyim, bendimi çiğner aşarım.' },
            { id: 'm-2', left: 'Teşhis (Kişileştirme)', right: 'Rüzgâr hüzünle fısıldıyordu kırık penceremde.' },
            { id: 'm-3', left: 'Tezat (Karşıtlık)', right: 'Ağlarım çağlar gibi, gülerim güller gibi.' },
          ],
          explanation: 'Kükremiş sel benzetme, rüzgârın fısıldaması kişileştirme, ağlamak-gülmek tezattır.',
        },
        {
          id: 'q-4',
          questionNumber: 4,
          type: 'short_answer',
          prompt: 'Bir edebi metinde anlatıcının olayları her şeyi bilen, kahramanların geçmişini, geleceğini ve gizli düşüncelerini sezen bakış açısına ne ad verilir?',
          points: 25,
          sampleAnswer: 'İlahi (Hakim / Tanrısal) Bakış Açısı',
          explanation: 'Kahramanların aklından geçenleri ve geleceği bilen anlatıcı ilahi bakış açısına sahiptir.',
        },
      ],
      tool_data: {
        quizQuestionCount: 4,
        quizDifficulty: 'Orta',
      },
    },
    {
      id: 1004,
      assignment_uuid: 'asg_kumeler_mantik_calisma',
      title: 'Kümeler, Önermeler ve Mantık Çalışma Föyü',
      description: 'Doğruluk tabloları ve küme işlemleri içeren analitik matematik çalışma föyü.',
      grade_level: '9. Sınıf',
      grade_category: 'Lise (9-12)',
      subject: 'Matematik',
      tool_type: 'WORKSHEET',
      classes: [{ id: 101, name: '9-A Şubesi', code: '9/A' }],
      due_date: '2026-10-24T23:59:00',
      max_score: 100,
      published: true,
      teacher_name: 'Ebru TEKNECİ',
      creation_date: '2026-10-10T14:00:00',
      tool_data: {
        attachedFileName: '9A_Matematik_Mantık_ve_Kümeler_Çalışma_Föyü.pdf',
      },
    },
  ]

  // Filter teacherDefaults to remove deleted ones
  const activeTeacherDefaults = teacherDefaults.filter(
    (t) => !deletedIds.has(String(t.id)) && !deletedIds.has(String(t.assignment_uuid))
  )

  // Custom and updated assignments take highest precedence
  const pool = [
    ...storedCustom.filter((c) => !deletedIds.has(String(c.id)) && !deletedIds.has(String(c.assignment_uuid))),
    ...studentHomeworks.filter((s) => !deletedIds.has(String(s.id)) && !deletedIds.has(String(s.assignment_uuid))),
    ...activeTeacherDefaults,
  ]

  // Deduplicate pool by assignment_uuid or id
  const seenIds = new Set<string>()
  const uniquePool: SchoolAssignmentItem[] = []

  for (const asg of pool) {
    const key = String(asg.assignment_uuid || asg.id)
    if (!seenIds.has(key)) {
      seenIds.add(key)
      // Ensure quiz questions are accessible
      const qQuestions = asg.quiz_questions || asg.tool_data?.quizQuestions
      uniquePool.push({
        ...asg,
        quiz_questions: qQuestions || asg.quiz_questions,
      })
    }
  }

  // Filter for 9-A class or individual student Erçil Uğurlu
  return uniquePool.filter((asg: any) => {
    // Check if target is individual
    const targetType = asg.target_type || asg.tool_data?.targetType || 'CLASS'
    if (targetType === 'INDIVIDUAL') {
      const studentId = String(asg.target_student_id || asg.tool_data?.targetStudentId || '')
      const studentName = String(asg.target_student_name || asg.tool_data?.targetStudentName || '').toLowerCase()
      const isForErcil =
        studentId === 's-1' ||
        studentId === '101' ||
        studentName.includes('erçil') ||
        studentName.includes('ugurlu') ||
        studentName.includes('uğurlu')
      return isForErcil
    }

    // Class assignment targeted to 9-A or 9. Sınıf
    const classStr = String(asg.className || asg.grade_level || '').toLowerCase()
    const hasClassInClasses = asg.classes?.some((c: any) => {
      const cStr = String(c.code || c.name || '').toLowerCase()
      return cStr.includes('9-a') || cStr.includes('9/a') || cStr.includes('9a') || cStr.includes('9. sınıf')
    })

    if (
      classStr.includes('9-a') ||
      classStr.includes('9/a') ||
      classStr.includes('9a') ||
      classStr.includes('9. sınıf') ||
      hasClassInClasses
    ) {
      return true
    }

    // Exclude if explicitly targeted to other grades (1. Sınıf, 5-A, etc.)
    if (
      asg.grade_level &&
      (asg.grade_level.includes('1.') ||
        asg.grade_level.includes('5.') ||
        asg.grade_level.includes('6.') ||
        asg.grade_level.includes('7.') ||
        asg.grade_level.includes('8.'))
    ) {
      return false
    }

    // Fallback if no specific class defined and not excluded
    if (!asg.className && (!asg.classes || asg.classes.length === 0)) {
      return true
    }

    return false
  })
}


