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

import {
  MASTER_STUDENT_PROFILE,
  MASTER_ASSIGNMENTS,
  MASTER_EXAMS,
  MASTER_PLANNER_TASKS,
  MASTER_STUDENT_NOTES,
  MASTER_SCHEDULE,
} from '@/lib/demo/demoMasterData'

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
  parentEmail?: string
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

export const DEFAULT_STUDENT_PROFILE: StudentProfile = MASTER_STUDENT_PROFILE as StudentProfile

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
    teacherName: 'Bahar ÇETİN',
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
    teacherName: 'Bahar ÇETİN',
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
    teacherName: 'Bahar ÇETİN',
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
    teacherName: 'Bahar ÇETİN',
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

export const GRADE_9_COURSES: StudentCourse[] = [
  {
    id: 'turkce',
    code: 'EDE-901',
    name: 'Türk Dili ve Edebiyatı',
    teacherName: 'Bahar ÇETİN',
    teacherBranch: 'Türk Dili ve Edebiyatı · Rehberlik',
    weeklyHours: 5,
    classroom: '9-A',
    roomType: 'Derslik 101 (9-A)',
    color: 'blue',
    gradient: 'from-blue-600 to-indigo-700',
    description: 'Giriş Ünitesi, Edebiyatın Sanatlarla İlişkisi, İletişim Ögeleri, Hikâye Tahlili (Dede Korkut, Ömer Seyfettin), Şiir ve Edebi Sanatlar, Masal-Fabl.',
    topics: [
      { id: 't1', title: 'Giriş: Edebiyatın Tanımı, Güzel Sanatlarla İlişkisi ve Metinlerin Sınıflandırılması', completed: true, week: 1 },
      { id: 't2', title: 'Dilin İşlevleri ve İletişim Ögeleri (Gönderici, Alıcı, İleti, Kanal, Dönüt)', completed: true, week: 2 },
      { id: 't3', title: 'Hikâye (Öykü): Olay ve Durum Hikâyesi Ayrımı, Dede Korkut Hikâyeleri Tahlili', completed: true, week: 3 },
      { id: 't4', title: 'Şiir Bilgisi: Nazım Birimi, Ölçü (Aruz/Hece), Uyak ve Redif Çeşitleri', completed: false, week: 4 },
      { id: 't5', title: 'Edebi Sanatlar: Teşbih, İstiare, Mecaz-ı Mürsel, Tezat ve Telmih', completed: false, week: 5 },
      { id: 't6', title: 'Masal ve Fabl: Yapı Unsurları, Dünya ve Türk Edebiyatında Örnekler', completed: false, week: 6 },
    ],
    materials: [
      { id: 'm1', title: '9. Sınıf Edebiyat ve Hikâye Tahlili Çalışma Föyü (PDF)', type: 'pdf', size: '3.4 MB' },
      { id: 'm2', title: 'Edebi Sanatlar ve Aruz Ölçüsü Kavram Haritası', type: 'doc', size: '1.2 MB' },
      { id: 'm3', title: 'Dede Korkut Boğaç Han Boyu Canlandırma Videosu', type: 'video', size: '48 MB' },
    ],
  },
  {
    id: 'matematik',
    code: 'MAT-901',
    name: 'Matematik',
    teacherName: 'Bahar ÇETİN',
    teacherBranch: 'Matematik',
    weeklyHours: 6,
    classroom: '9-A',
    roomType: 'Derslik 101 (9-A)',
    color: 'indigo',
    gradient: 'from-indigo-600 to-purple-700',
    description: 'Mantık ve Önermeler, Bileşik Önermeler, Kümeler ve Kümelerde İşlemler, Birinci ve İkinci Dereceden Denklemler, Eşitsizlikler, Üçgenler.',
    topics: [
      { id: 't1', title: 'Önermeler, Doğruluk Değerleri ve Bileşik Önermeler (Ve, Veya, İse, Ancak ve Ancak)', completed: true, week: 1 },
      { id: 't2', title: 'Açık Önermeler, Niceleyiciler ve Tanım-Aksiyom-Teorem Kavramları', completed: true, week: 2 },
      { id: 't3', title: 'Kümeler: Alt Küme, Kümelerde Kesişim, Birleşim, Fark ve Tümleme İşlemleri', completed: true, week: 3 },
      { id: 't4', title: 'Gerçek Sayılar, Aralık Kavramı ve Birinci Dereceden Denklemler', completed: false, week: 4 },
      { id: 't5', title: 'İkinci Dereceden Bir Bilinmeyenli Denklemler ve Diskriminant (Delta) Çözümü', completed: false, week: 5 },
      { id: 't6', title: 'Üçgenlerde Açılar, Kenar-Açı Bağıntıları ve Pisagor Teoremi', completed: false, week: 6 },
    ],
    materials: [
      { id: 'm1', title: '9. Sınıf Mantık ve Kümeler MEB Çalışma Kitabı (PDF)', type: 'pdf', size: '4.8 MB' },
      { id: 'm2', title: 'İkinci Dereceden Denklemler Soru Bankası ve Formül Föyü', type: 'doc', size: '2.1 MB' },
    ],
  },
  {
    id: 'fizik',
    code: 'FIZ-901',
    name: 'Fizik & Fen Bilimleri',
    teacherName: 'Beritan ŞENATEŞ',
    teacherBranch: 'Fizik & Fen Bilimleri',
    weeklyHours: 2,
    classroom: '9-A',
    roomType: 'Fen & Teknoloji Laboratuvarı',
    color: 'emerald',
    gradient: 'from-emerald-600 to-teal-700',
    description: 'Fizik Bilimine Giriş, Madde ve Özellikleri, Özkütle, Hareket ve Kuvvet, Newton Yasaları, Enerji ve Verim.',
    topics: [
      { id: 't1', title: 'Fiziğin Alt Dalları ve Fiziksel Büyüklüklerin Sınıflandırılması', completed: true, week: 1 },
      { id: 't2', title: 'Madde ve Özkütle: Kütle-Hacim Grafikleri ve Karışımların Özkütlesi', completed: true, week: 2 },
      { id: 't3', title: 'Dayanıklılık, Adezyon, Kohezyon ve Yüzey Gerilimi', completed: false, week: 3 },
      { id: 't4', title: 'Doğrusal Hareket: Konum, Alınan Yol, Yer Değiştirme, Hız ve Sürat', completed: false, week: 4 },
      { id: 't5', title: 'Newton’un Hareket Yasaları ve Sürtünme Kuvveti', completed: false, week: 5 },
    ],
    materials: [
      { id: 'm1', title: 'Fizik Laboratuvar Deney Kılavuzu ve Rapor Şablonu (PDF)', type: 'pdf', size: '2.9 MB' },
    ],
  },
  {
    id: 'bilisim',
    code: 'BIL-901',
    name: 'Bilişim & Yazılım',
    teacherName: 'Murat DEMİR',
    teacherBranch: 'Bilişim Teknolojileri',
    weeklyHours: 2,
    classroom: '9-A',
    roomType: 'Bilişim & Kodlama Atölyesi',
    color: 'cyan',
    gradient: 'from-cyan-600 to-blue-700',
    description: 'Algoritmik Düşünme, Akış Şemaları, Python ile Programlamaya Giriş, Değişkenler, Koşullu İfadeler ve Döngüler.',
    topics: [
      { id: 't1', title: 'Problem Çözme Süreci, Algoritma Mantığı ve Akış Şeması Sembolleri', completed: true, week: 1 },
      { id: 't2', title: 'Python Geliştirme Ortamı Kurulumu ve print/input Fonksiyonları', completed: true, week: 2 },
      { id: 't3', title: 'Veri Tipleri (int, float, str, bool) ve Aritmetik Operatörler', completed: true, week: 3 },
      { id: 't4', title: 'Koşullu Durumlar: if - elif - else Blokları', completed: false, week: 4 },
      { id: 't5', title: 'Döngüler: for ve while ile Liste İşlemleri', completed: false, week: 5 },
    ],
    materials: [
      { id: 'm1', title: 'Python Temelleri ve Algoritma Örnekleri Kitapçığı (PDF)', type: 'pdf', size: '5.2 MB' },
    ],
  },
  {
    id: 'ingilizce',
    code: 'ING-901',
    name: 'Yabancı Dil (İngilizce)',
    teacherName: 'Canan YILDIRIM',
    teacherBranch: 'İngilizce',
    weeklyHours: 4,
    classroom: '9-A',
    roomType: 'Derslik 101 (9-A)',
    color: 'purple',
    gradient: 'from-purple-600 to-violet-700',
    description: 'Studying Abroad, My Environment, Movies and Books, Human in Nature, Inspirational People.',
    topics: [
      { id: 't1', title: 'Unit 1: Studying Abroad - Introductions, Nationalities and Present Simple', completed: true, week: 1 },
      { id: 't2', title: 'Unit 1: Asking for and Giving Directions in Campus', completed: true, week: 2 },
      { id: 't3', title: 'Unit 2: My Environment - Describing Places, Comparatives and Superlatives', completed: false, week: 3 },
      { id: 't4', title: 'Unit 2: Expressing Likes/Dislikes and Writing a Neighborhood Review', completed: false, week: 4 },
    ],
    materials: [
      { id: 'm1', title: 'B1 English Vocabulary and Reading Pack (PDF)', type: 'pdf', size: '3.1 MB' },
    ],
  },
  {
    id: 'tarih',
    code: 'TAR-901',
    name: 'Tarih',
    teacherName: 'Deniz ARSLAN',
    teacherBranch: 'Tarih',
    weeklyHours: 2,
    classroom: '9-A',
    roomType: 'Derslik 101 (9-A)',
    color: 'amber',
    gradient: 'from-amber-600 to-orange-700',
    description: 'Tarih ve Zaman, İnsanlığın İlk Dönemleri, Orta Çağ’da Dünya, İlk ve Orta Çağlarda Türk Dünyası.',
    topics: [
      { id: 't1', title: 'Tarih Biliminin Konusu, Yöntemi ve Kaynakların Sınıflandırılması', completed: true, week: 1 },
      { id: 't2', title: 'Zamanın Taksimi ve Takvim Çeşitleri (Güneş ve Ay Yılı Takvimleri)', completed: true, week: 2 },
      { id: 't3', title: 'İlk Çağ Medeniyetleri: Mezopotamya, Anadolu, Mısır ve Ege Medeniyetleri', completed: false, week: 3 },
    ],
    materials: [
      { id: 'm1', title: 'İlk Çağ Medeniyetleri Haritası ve Kronoloji Tablosu', type: 'pdf', size: '2.5 MB' },
    ],
  },
  {
    id: 'cografya',
    code: 'COG-901',
    name: 'Coğrafya',
    teacherName: 'Zeynep GÜLER',
    teacherBranch: 'Coğrafya',
    weeklyHours: 2,
    classroom: '9-A',
    roomType: 'Derslik 101 (9-A)',
    color: 'teal',
    gradient: 'from-teal-600 to-emerald-700',
    description: 'Doğa ve İnsan, Coğrafyanın Konusu, Harita Bilgisi ve Coğrafi Koordinat Sistemi, Atmosfer ve İklim.',
    topics: [
      { id: 't1', title: 'Doğal Sistemler ve İnsan Etkileşimi, Coğrafyanın Bölümleri', completed: true, week: 1 },
      { id: 't2', title: 'Harita Bilgisi, Projeksiyon Tipleri ve Ölçek Hesaplamaları', completed: true, week: 2 },
      { id: 't3', title: 'Dünya’nın Şekli, Günlük ve Yıllık Hareketlerinin Sonuçları', completed: false, week: 3 },
    ],
    materials: [
      { id: 'm1', title: '9. Sınıf Coğrafi Bilgi Sistemleri ve Harita Rehberi', type: 'pdf', size: '4.0 MB' },
    ],
  },
  {
    id: 'beden',
    code: 'BED-901',
    name: 'Beden Eğitimi & Spor',
    teacherName: 'Selim AKSOY',
    teacherBranch: 'Beden Eğitimi',
    weeklyHours: 2,
    classroom: '9-A',
    roomType: 'Kapalı Spor Salonu',
    color: 'orange',
    gradient: 'from-orange-500 to-amber-600',
    description: 'Temel Isınma, Takım Sporları Kuralları (Voleybol, Basketbol, Hentbol), Fiziksel Uygunluk ve Sağlıklı Yaşam.',
    topics: [
      { id: 't1', title: 'Fiziksel Uygunluk Testleri (Mekik, Şınav, Esneklik)', completed: true, week: 1 },
      { id: 't2', title: 'Voleybol Temel Teknikleri: Parmak Pas ve Manşet Pas', completed: false, week: 2 },
    ],
    materials: [
      { id: 'm1', title: 'Takım Sporları Oyun Kuralları Kılavuzu', type: 'doc', size: '850 KB' },
    ],
  },
  {
    id: 'gorsel-sanatlar',
    code: 'GOR-901',
    name: 'Görsel Sanatlar & Atölye',
    teacherName: 'Gülşah ÖZTÜRK',
    teacherBranch: 'Görsel Sanatlar',
    weeklyHours: 1,
    classroom: '9-A',
    roomType: 'Sanat Atölyesi',
    color: 'pink',
    gradient: 'from-pink-500 to-rose-600',
    description: 'Perspektif Çizimi, Işık ve Gölge, Renk Teorisi, Geleneksel Türk Sanatları (Ebru, Minyatür).',
    topics: [
      { id: 't1', title: 'Tek ve Çift Kaçışlı Perspektif Çizim Teknikleri', completed: true, week: 1 },
      { id: 't2', title: 'Karakalem Tonlama ve Obje Etüdü', completed: false, week: 2 },
    ],
    materials: [
      { id: 'm1', title: 'Perspektif ve Desen Çizim Föyü', type: 'pdf', size: '2.7 MB' },
    ],
  },
  {
    id: 'muzik',
    code: 'MUZ-901',
    name: 'Müzik & Sahne Sanatları',
    teacherName: 'Hande EREZ',
    teacherBranch: 'Müzik',
    weeklyHours: 1,
    classroom: '9-A',
    roomType: 'Müzik Odası',
    color: 'rose',
    gradient: 'from-rose-500 to-pink-600',
    description: 'Müzik Kültürü, Türk Sanat ve Halk Müziği Makamları, Klasik Batı Müziği Dönemleri, Ritim ve Koro.',
    topics: [
      { id: 't1', title: 'Temel Müzik Yazısı, Notalar ve Süre Değerleri', completed: true, week: 1 },
      { id: 't2', title: 'Türk Halk Müziği Türleri ve Çalgı Grupları', completed: false, week: 2 },
    ],
    materials: [
      { id: 'm1', title: 'Makamlar ve Ritim Egzersizleri Notasyonu', type: 'pdf', size: '1.9 MB' },
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
    teacherFeedback: 'Bahar ÇETİN: Harika ses tanıma ve heceleme becerisi. Tebrikler!',
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
    teacherFeedback: 'Bahar ÇETİN: Ritmik sayma ve şekil eşleştirmede üstün başarı.',
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
    teacherFeedback: 'Bahar ÇETİN: Sınıf kurallarına uyum ve arkadaşlık ilişkilerinde örnek davranış.',
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
    scope: 'Colors (Red, Blue, Yellow), Numbers 1-10, Greetings',
    teacherName: 'Selin YILDIRIM',
    className: '1/A',
  },
  {
    id: 'as-5',
    title: '1. Dönem 1. Okuma-Yazma Süreç Değerlendirmesi',
    courseName: 'Türkçe',
    type: 'exam',
    date: '30 Ekim 2026',
    time: '09:25',
    durationMinutes: 40,
    location: '1. Kat · Derslik 101 (1/A)',
    maxScore: 100,
    score: undefined,
    isGraded: false,
    isPublished: true,
    status: 'upcoming',
    scope: '1. Ses Grubu (A-N-E-T), Ses Tanıma, Hece ve Kelime Oluşturma',
    teacherName: 'Bahar ÇETİN',
    className: '1/A',
  },
  {
    id: 'as-6',
    title: '1-20 Doğal Sayılar ve Ritmik Sayma Etkinliği',
    courseName: 'Matematik',
    type: 'exam',
    date: '02 Kasım 2026',
    time: '10:20',
    durationMinutes: 40,
    location: '1. Kat · Derslik 101 (1/A)',
    maxScore: 100,
    score: undefined,
    isGraded: false,
    isPublished: true,
    status: 'upcoming',
    scope: '1-20 Arası Sayıları Tanıma, Ritmik Sayma ve Nesne Eşleme',
    teacherName: 'Bahar ÇETİN',
    className: '1/A',
  },
  {
    id: 'as-7',
    title: 'Okulumuzda Hayat ve Güvenli Yaşam Değerlendirmesi',
    courseName: 'Hayat Bilgisi',
    type: 'performance',
    date: '06 Kasım 2026',
    time: '11:15',
    durationMinutes: 40,
    location: '1. Kat · Derslik 101 (1/A)',
    maxScore: 100,
    score: undefined,
    isGraded: false,
    isPublished: true,
    status: 'upcoming',
    scope: 'Okulumuzdaki Bölümler, Sınıf Kuralları, Nezaket İfadeleri',
    teacherName: 'Bahar ÇETİN',
    className: '1/A',
  },
  {
    id: 'as-8',
    title: '1. Sınıflar Kurumsal Genel Kazanım Değerlendirmesi',
    courseName: 'Tüm Dersler',
    type: 'exam',
    date: '15 Kasım 2026',
    time: '09:00',
    durationMinutes: 60,
    location: 'Okul Konferans Salonu',
    maxScore: 100,
    score: undefined,
    isGraded: false,
    isPublished: true,
    status: 'upcoming',
    scope: '1. Sınıf 1. Çeyrek Tüm Temel Kazanımlar',
    teacherName: 'Ölçme & Değerlendirme Zümresi',
    className: '1/A',
  },
  {
    id: 'as-9',
    title: 'Blok Tabanlı Kodlama & Mantık Değerlendirmesi',
    courseName: 'Bilişim & Kodlama',
    type: 'exam',
    date: '24 Kasım 2026',
    time: '13:30',
    durationMinutes: 40,
    location: 'Bilgisayar Laboratuvarı 1',
    maxScore: 100,
    score: undefined,
    isGraded: false,
    isPublished: true,
    status: 'upcoming',
    scope: 'Yön algoritmaları, labirent tamamlama ve karakter blokları',
    teacherName: 'Bahar ÇETİN',
    className: '1/A',
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
    author: 'Kemal SOYSAL',
    authorRole: 'Okul Müdürü',
    date: 'Bugün, 09:30',
    category: 'academic',
    priority: 'important',
    isPinned: true,
    content: '1/A şubemiz Türkçe, Matematik ve Hayat Bilgisi derslerindeki örnek sınıf düzeni ve üstün performansıyla okulumuzun gururu olmuştur. Sevgili öğrencimiz Ali Yağız ve sınıf öğretmenimiz Özlem Hanımı tebrik eder, başarılarının devamını dilerim.',
  },
  {
    id: 'ann-2',
    title: 'Akıllı Tahta ve Dijital Kütüphane 1. Sınıf Yeni Föyleri Eklendi',
    author: 'Bahar ÇETİN',
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

  let mentorTeacher = String(profile?.mentorTeacher || 'Bahar ÇETİN')
  if (mentorTeacher.includes('(')) {
    mentorTeacher = mentorTeacher.split('(')[0].trim()
  }

  const ctx = {
    studentName: String(customContext?.studentName || customContext?.ogrenci_adi || profile?.name || 'Ali Yağız DEMİREL'),
    parentName: String(customContext?.parentName || customContext?.veli_adi || profile?.parentName || 'Ebru UĞURLU'),
    className: String(customContext?.className || customContext?.sinif || profile?.className || '1/A'),
    teacherName: String(customContext?.teacherName || customContext?.ogretmen_adi || mentorTeacher || 'Bahar ÇETİN'),
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

export const INITIAL_PLANNER_TASKS: PlannerTask[] = MASTER_PLANNER_TASKS as PlannerTask[]

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
          // Ali Yağız DEMİREL (student ID s-1, No 101, class 9-A)
          studentRecord =
            parsed.find(
              (s: MStudentItem) =>
                s.id === 's-1' ||
                s.studentNo === '101' ||
                (s.name && s.name.toLowerCase().includes('erçil'))
            ) ||
            parsed.find(
              (s: MStudentItem) =>
                s.className?.includes('1-A') || s.className?.includes('1/A')
            ) ||
            parsed[0]
        }
      } catch (_) {}
    }

    if (!studentRecord) {
      studentRecord = ALL_INITIAL_STUDENTS[0] || (DEFAULT_STUDENT_PROFILE as any)
    }

    if (studentRecord) {
      const isDemoStudent =
        (studentRecord.name && (studentRecord.name.toLowerCase().includes('ali') || studentRecord.name.toLowerCase().includes('demirel'))) ||
        studentRecord.studentNo === '101' ||
        (studentRecord.name && studentRecord.name.toLowerCase().includes('erçil'))
      if (isDemoStudent) {
        studentRecord.className = '1/A'
        ;(studentRecord as any).gradeLevel = '1. Sınıf'
        studentRecord.mentorTeacher = 'Bahar ÇETİN (Sınıf Öğretmeni)'
        if (!studentRecord.gpa || Number(studentRecord.gpa) < 50) {
          studentRecord.gpa = 98.2
        }
        if (!studentRecord.grades || studentRecord.grades.length === 0) {
          studentRecord.grades = MASTER_STUDENT_PROFILE.grades
        }
      }
    }

    // 2. Mentor Teacher synchronization from active teacher's profile
    let mentorTeacher = studentRecord.mentorTeacher || 'Bahar ÇETİN (Türk Dili ve Edebiyatı)'
    const rawTeacher = localStorage.getItem('oxonom_teacher_profile')
    if (rawTeacher) {
      try {
        const teacherObj = JSON.parse(rawTeacher)
        const tName = `${teacherObj.firstName || teacherObj.name || 'Ebru'} ${teacherObj.lastName || 'TEKNECİ'}`.trim()
        const tBranch = teacherObj.branch || 'Türk Dili ve Edebiyatı · Rehberlik'
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
          : 'Bahar ÇETİN',
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

    const nameParts = (studentRecord.name || 'Ali Yağız DEMİREL').split(' ')
    const firstName = nameParts[0] || 'Ali Yağız'
    const lastName = nameParts.slice(1).join(' ') || 'UĞURLU'

    return {
      id: studentRecord.id || 's-1',
      name: studentRecord.name || 'Ali Yağız DEMİREL',
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
      mentorTeacher: mentorTeacher || 'Bahar ÇETİN (Sınıf Öğretmeni)',
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
      secondParentName: studentRecord.secondParentName || 'Kemal SOYSAL',
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
        teacherName: ce.teacherName || courseGrade?.teacherName || 'Bahar ÇETİN',
        className: ce.className,
      })
    })
  } catch (err) {
    console.warn('Error in getSynchronizedStudentAssessments:', err)
  }

  if (assessments.length === 0) {
    return STUDENT_ASSESSMENTS
  }

  // Ensure upcoming assessments are always available for the student dashboard & planner
  const hasUpcoming = assessments.some((a) => a.status === 'upcoming')
  if (!hasUpcoming) {
    const fallbackUpcoming = STUDENT_ASSESSMENTS.filter((a) => a.status === 'upcoming')
    assessments.push(...fallbackUpcoming)
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
      author: 'Bahar ÇETİN (1/A Sınıf Öğretmeni)',
      content:
        'Öğrencinin ilk okuma yazma hazırlık sürecindeki motivasyonu, sesleri fark etme ve arkadaşlarıyla uyumu mükemmel düzeydedir.',
    },
    {
      id: 'gn-2',
      date: '15.09.2026',
      author: 'Kemal SOYSAL (Okul Müdürü)',
      content:
        'Velisi Ebru Hanım ile 1. sınıf oryantasyon ve okula uyum süreci görüşmesi başarıyla gerçekleştirildi.',
    },
  ]
}

// Canonical 30-hour (6 periods/day x 5 days) schedule for 1/A matching the Principal's 1. Sınıf curriculum
export const CANONICAL_1A_SCHEDULE_30: ScheduleEntry[] = [
  // Pazartesi (6)
  { id: 'sc-1a-mon-1', orgId: 30, day: 'mon', period: 1, classCode: '1/A', subject: 'Türkçe', teacherName: 'Bahar ÇETİN', roomName: '1. Kat · Derslik 101', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-1a-mon-2', orgId: 30, day: 'mon', period: 2, classCode: '1/A', subject: 'Türkçe', teacherName: 'Bahar ÇETİN', roomName: '1. Kat · Derslik 101', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-1a-mon-3', orgId: 30, day: 'mon', period: 3, classCode: '1/A', subject: 'Matematik', teacherName: 'Bahar ÇETİN', roomName: '1. Kat · Derslik 101', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-1a-mon-4', orgId: 30, day: 'mon', period: 4, classCode: '1/A', subject: 'Matematik', teacherName: 'Bahar ÇETİN', roomName: '1. Kat · Derslik 101', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-1a-mon-5', orgId: 30, day: 'mon', period: 5, classCode: '1/A', subject: 'Hayat Bilgisi', teacherName: 'Bahar ÇETİN', roomName: '1. Kat · Derslik 101', color: 'teal', isSmartBoardActive: true },
  { id: 'sc-1a-mon-6', orgId: 30, day: 'mon', period: 6, classCode: '1/A', subject: 'Beden Eğitimi ve Oyun', teacherName: 'Selim AKSOY', roomName: 'Kapalı Spor Salonu', color: 'orange', isSmartBoardActive: false },

  // Salı (6)
  { id: 'sc-1a-tue-1', orgId: 30, day: 'tue', period: 1, classCode: '1/A', subject: 'Türkçe', teacherName: 'Bahar ÇETİN', roomName: '1. Kat · Derslik 101', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-1a-tue-2', orgId: 30, day: 'tue', period: 2, classCode: '1/A', subject: 'Türkçe', teacherName: 'Bahar ÇETİN', roomName: '1. Kat · Derslik 101', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-1a-tue-3', orgId: 30, day: 'tue', period: 3, classCode: '1/A', subject: 'Matematik', teacherName: 'Bahar ÇETİN', roomName: '1. Kat · Derslik 101', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-1a-tue-4', orgId: 30, day: 'tue', period: 4, classCode: '1/A', subject: 'Hayat Bilgisi', teacherName: 'Bahar ÇETİN', roomName: '1. Kat · Derslik 101', color: 'teal', isSmartBoardActive: true },
  { id: 'sc-1a-tue-5', orgId: 30, day: 'tue', period: 5, classCode: '1/A', subject: 'Yabancı Dil (İngilizce)', teacherName: 'Canan YILDIRIM', roomName: '1. Kat · Derslik 101', color: 'purple', isSmartBoardActive: true },
  { id: 'sc-1a-tue-6', orgId: 30, day: 'tue', period: 6, classCode: '1/A', subject: 'Beden Eğitimi ve Oyun', teacherName: 'Selim AKSOY', roomName: 'Kapalı Spor Salonu', color: 'orange', isSmartBoardActive: false },

  // Çarşamba (6)
  { id: 'sc-1a-wed-1', orgId: 30, day: 'wed', period: 1, classCode: '1/A', subject: 'Türkçe', teacherName: 'Bahar ÇETİN', roomName: '1. Kat · Derslik 101', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-1a-wed-2', orgId: 30, day: 'wed', period: 2, classCode: '1/A', subject: 'Türkçe', teacherName: 'Bahar ÇETİN', roomName: '1. Kat · Derslik 101', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-1a-wed-3', orgId: 30, day: 'wed', period: 3, classCode: '1/A', subject: 'Matematik', teacherName: 'Bahar ÇETİN', roomName: '1. Kat · Derslik 101', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-1a-wed-4', orgId: 30, day: 'wed', period: 4, classCode: '1/A', subject: 'Hayat Bilgisi', teacherName: 'Bahar ÇETİN', roomName: '1. Kat · Derslik 101', color: 'teal', isSmartBoardActive: true },
  { id: 'sc-1a-wed-5', orgId: 30, day: 'wed', period: 5, classCode: '1/A', subject: 'Görsel Sanatlar', teacherName: 'Gülşah ÖZTÜRK', roomName: 'Görsel Sanatlar Atölyesi', color: 'pink', isSmartBoardActive: false },
  { id: 'sc-1a-wed-6', orgId: 30, day: 'wed', period: 6, classCode: '1/A', subject: 'Beden Eğitimi ve Oyun', teacherName: 'Selim AKSOY', roomName: 'Kapalı Spor Salonu', color: 'orange', isSmartBoardActive: false },

  // Perşembe (6)
  { id: 'sc-1a-thu-1', orgId: 30, day: 'thu', period: 1, classCode: '1/A', subject: 'Türkçe', teacherName: 'Bahar ÇETİN', roomName: '1. Kat · Derslik 101', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-1a-thu-2', orgId: 30, day: 'thu', period: 2, classCode: '1/A', subject: 'Türkçe', teacherName: 'Bahar ÇETİN', roomName: '1. Kat · Derslik 101', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-1a-thu-3', orgId: 30, day: 'thu', period: 3, classCode: '1/A', subject: 'Matematik', teacherName: 'Bahar ÇETİN', roomName: '1. Kat · Derslik 101', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-1a-thu-4', orgId: 30, day: 'thu', period: 4, classCode: '1/A', subject: 'Hayat Bilgisi', teacherName: 'Bahar ÇETİN', roomName: '1. Kat · Derslik 101', color: 'teal', isSmartBoardActive: true },
  { id: 'sc-1a-thu-5', orgId: 30, day: 'thu', period: 5, classCode: '1/A', subject: 'Müzik', teacherName: 'Müzik Zümresi', roomName: 'Müzik Odası', color: 'pink', isSmartBoardActive: true },
  { id: 'sc-1a-thu-6', orgId: 30, day: 'thu', period: 6, classCode: '1/A', subject: 'Beden Eğitimi ve Oyun', teacherName: 'Selim AKSOY', roomName: 'Kapalı Spor Salonu', color: 'orange', isSmartBoardActive: false },

  // Cuma (6)
  { id: 'sc-1a-fri-1', orgId: 30, day: 'fri', period: 1, classCode: '1/A', subject: 'Türkçe', teacherName: 'Bahar ÇETİN', roomName: '1. Kat · Derslik 101', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-1a-fri-2', orgId: 30, day: 'fri', period: 2, classCode: '1/A', subject: 'Türkçe', teacherName: 'Bahar ÇETİN', roomName: '1. Kat · Derslik 101', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-1a-fri-3', orgId: 30, day: 'fri', period: 3, classCode: '1/A', subject: 'Yabancı Dil (İngilizce)', teacherName: 'Canan YILDIRIM', roomName: '1. Kat · Derslik 101', color: 'purple', isSmartBoardActive: true },
  { id: 'sc-1a-fri-4', orgId: 30, day: 'fri', period: 4, classCode: '1/A', subject: 'Serbest Etkinlikler & Kodlama', teacherName: 'Bahar ÇETİN', roomName: '1. Kat · Derslik 101', color: 'cyan', isSmartBoardActive: true },
  { id: 'sc-1a-fri-5', orgId: 30, day: 'fri', period: 5, classCode: '1/A', subject: 'Serbest Etkinlikler & Kodlama', teacherName: 'Bahar ÇETİN', roomName: '1. Kat · Derslik 101', color: 'cyan', isSmartBoardActive: true },
  { id: 'sc-1a-fri-6', orgId: 30, day: 'fri', period: 6, classCode: '1/A', subject: 'Beden Eğitimi ve Oyun', teacherName: 'Selim AKSOY', roomName: 'Kapalı Spor Salonu', color: 'orange', isSmartBoardActive: false },
]

export const CANONICAL_9A_SCHEDULE_30: ScheduleEntry[] = MASTER_SCHEDULE as unknown as ScheduleEntry[]

/**
 * Returns the weekly class schedule configured by the school principal for the given class (defaults to 9-A).
 * Synchronizes from oxonom_canonical_schedule_9a and other admin schedule stores with fallback to CANONICAL_9A_SCHEDULE_30.
 */
export function getSynchronizedClassWeeklySchedule(classCode: string = '9-A'): ScheduleEntry[] {
  let entries = CANONICAL_9A_SCHEDULE_30

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
 * Returns homework assignments assigned by the teacher to 9-A or specifically to Ali Yağız Demirel.
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

  // Teacher 9-A canonical showcase curriculum assignments
  const teacherDefaults: SchoolAssignmentItem[] = MASTER_ASSIGNMENTS as unknown as SchoolAssignmentItem[]

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

  // Filter for 1/A class or demo student Ali Yağız Demirel
  return uniquePool.filter((asg: any) => {
    // Check if target is individual
    const targetType = asg.target_type || asg.tool_data?.targetType || 'CLASS'
    if (targetType === 'INDIVIDUAL') {
      const studentId = String(asg.target_student_id || asg.tool_data?.targetStudentId || '')
      const studentName = String(asg.target_student_name || asg.tool_data?.targetStudentName || '').toLowerCase()
      const isForDemoStudent =
        studentId === 's-1' ||
        studentId === '101' ||
        studentName.includes('ali') ||
        studentName.includes('demirel') ||
        studentName.includes('erçil')
      return isForDemoStudent
    }

    // Class assignment targeted to 1/A or 1. Sınıf
    const classStr = String(asg.className || asg.grade_level || '').toLowerCase()
    const hasClassInClasses = asg.classes?.some((c: any) => {
      const cStr = String(c.code || c.name || '').toLowerCase()
      return cStr.includes('1-a') || cStr.includes('1/a') || cStr.includes('1a') || cStr.includes('1. sınıf')
    })

    if (
      classStr.includes('1-a') ||
      classStr.includes('1/a') ||
      classStr.includes('1a') ||
      classStr.includes('1. sınıf') ||
      hasClassInClasses
    ) {
      return true
    }

    // Exclude if explicitly targeted to other grades (2. Sınıf, 5-A, etc.)
    if (
      asg.grade_level &&
      (asg.grade_level.includes('2.') ||
        asg.grade_level.includes('3.') ||
        asg.grade_level.includes('4.') ||
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


