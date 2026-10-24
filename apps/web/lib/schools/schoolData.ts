// apps/web/lib/schools/schoolData.ts

export interface SchoolPrincipal {
  name: string
  title: string
  tcNo: string
  phone: string
  email: string
  appointmentDate: string
  avatarUrl?: string
  status: 'active' | 'leave' | 'transferred'
}

export interface SchoolStaffMember {
  id: string
  name: string
  role: string
  category: 'yonetim' | 'pdr' | 'idari' | 'destek'
  phone: string
  email: string
  shift: string
  status: 'active' | 'on_leave'
}

export interface SchoolTeacher {
  id: string
  name: string
  branch: string
  classroom?: string
  phone: string
  email: string
  lessonCount: number
  lastLogin: string
  status: 'active' | 'passive'
}

export interface SchoolStudent {
  id: string
  studentNumber: string
  name: string
  grade: string // e.g. "4-A"
  parentName: string
  parentPhone: string
  attendanceRate: number // e.g. 98.2
  gpa: number // e.g. 88.5
  status: 'active' | 'transferred' | 'suspended'
}

export interface SchoolClassroom {
  grade: string
  level: string
  studentCount: number
  headTeacher: string
  averageScore: number
}

export interface SchoolActivityLog {
  id: string
  action: string
  actor: string
  role: string
  timestamp: string
  category: 'not_girisi' | 'yoklama' | 'sinav' | 'kullanici' | 'sistem' | 'lisans'
  status: 'success' | 'warning' | 'info'
}

export interface SchoolModules {
  gameStudio: boolean
  aiExamEngine: boolean
  liveClassroom: boolean
  smartBoard: boolean
  parentPortal: boolean
  mebSync: boolean
  analyticsPro: boolean
}

export interface SchoolDetail {
  id: string
  code: string // Benzersiz Kurum / MEB Kodu
  name: string
  shortName: string
  type: string // "Devlet Okulu (MEB)", "Özel K-12 Koleji", vb.
  level: string // "İlkokul (1-4)", "Ortaokul (5-8)", "K-12"
  city: string
  district: string
  address: string
  phone: string
  email: string
  website: string
  status: 'active' | 'pending' | 'suspended'
  licensePlan: 'Enterprise Pro' | 'Standart Okul' | 'Deneme Lisansı (14 Gün)'
  licenseStart: string
  licenseExpires: string
  createdAt: string

  // Yetkili & Kadro
  principal: SchoolPrincipal
  staff: SchoolStaffMember[]
  teachers: SchoolTeacher[]
  students: SchoolStudent[]
  classrooms: SchoolClassroom[]

  // İstatistikler
  stats: {
    totalStudents: number
    activeStudents: number
    maleStudents: number
    femaleStudents: number
    totalTeachers: number
    activeTeachers: number
    totalStaff: number
    attendanceRate: number
    academicAverage: number
    weeklyActiveUsers: number
    completedLessonsThisMonth: number
    storageUsedMb: number
    storageLimitMb: number
    aiTokensUsed: number
    aiTokensLimit: number
  }

  // Modüller & Lisanslar
  modules: SchoolModules

  // İşlem Logları
  activityLogs: SchoolActivityLog[]
}

export const INITIAL_SCHOOLS: SchoolDetail[] = [
  {
    id: 'sch-1',
    code: '741295',
    name: 'Necla Görer İlkokulu & Ortaokulu',
    shortName: 'Necla Görer K12',
    type: 'MEB Resmi İlkokulu & Ortaokulu',
    level: 'İlkokul (1-4) & Ortaokul (5-8)',
    city: 'İstanbul',
    district: 'Kadıköy',
    address: 'Fenerbahçe Mah. Lale Sk. No:14 Kadıköy / İstanbul',
    phone: '+90 (216) 414 10 20',
    email: 'bilgi@neclagorer.k12.tr',
    website: 'https://neclagorer.k12.tr',
    status: 'active',
    licensePlan: 'Enterprise Pro',
    licenseStart: '01.09.2024',
    licenseExpires: '31.12.2027',
    createdAt: '12.08.2024',
    principal: {
      name: 'Kemal SOYSAL',
      title: 'Okul Müdürü · Kurum Baş Yetkilisi',
      tcNo: '10000000001',
      phone: '+90 (532) 999 22 00',
      email: 'mudur@oxonom.com',
      appointmentDate: '15.08.2022',
      status: 'active',
    },
    staff: [
      {
        id: 'stf-1',
        name: 'Mustafa KAYA',
        role: 'Müdür Başyardımcısı (Öğrenci İşleri)',
        category: 'yonetim',
        phone: '+90 (533) 120 44 11',
        email: 'm.kaya@neclagorer.k12.tr',
        shift: '08:00 - 17:00',
        status: 'active',
      },
      {
        id: 'stf-2',
        name: 'Selin ŞAHİN',
        role: 'Müdür Yardımcısı (Eğitim & Müfredat)',
        category: 'yonetim',
        phone: '+90 (535) 980 12 33',
        email: 's.sahin@neclagorer.k12.tr',
        shift: '08:00 - 17:00',
        status: 'active',
      },
      {
        id: 'stf-3',
        name: 'Pelin ARSLAN',
        role: 'Rehberlik & Psikolojik Danışman (PDR)',
        category: 'pdr',
        phone: '+90 (536) 441 50 60',
        email: 'pdr@neclagorer.k12.tr',
        shift: '08:30 - 16:30',
        status: 'active',
      },
      {
        id: 'stf-4',
        name: 'Hakan ÇETİN',
        role: 'Bilgi İşlem & Akıllı Tahta Sorumlusu',
        category: 'idari',
        phone: '+90 (542) 770 19 20',
        email: 'it@neclagorer.k12.tr',
        shift: '08:00 - 17:30',
        status: 'active',
      },
      {
        id: 'stf-5',
        name: 'Fatma YILDIZ',
        role: 'Okul Memuru & Yazı İşleri',
        category: 'idari',
        phone: '+90 (216) 414 10 21',
        email: 'memur@neclagorer.k12.tr',
        shift: '08:00 - 17:00',
        status: 'active',
      },
      {
        id: 'stf-6',
        name: 'Dursun POLAT',
        role: 'Güvenlik Amiri',
        category: 'destek',
        phone: '+90 (544) 630 11 00',
        email: 'guvenlik@neclagorer.k12.tr',
        shift: '07:30 - 18:00',
        status: 'active',
      },
    ],
    teachers: [
      {
        id: 'tch-1',
        name: 'Ayşe DEMİR',
        branch: 'Sınıf Öğretmenliği',
        classroom: '4-A',
        phone: '+90 (530) 111 22 33',
        email: 'a.demir@neclagorer.k12.tr',
        lessonCount: 30,
        lastLogin: '10 dk önce',
        status: 'active',
      },
      {
        id: 'tch-2',
        name: 'Canan ÖZTÜRK',
        branch: 'Sınıf Öğretmenliği',
        classroom: '4-B',
        phone: '+90 (530) 222 33 44',
        email: 'c.ozturk@neclagorer.k12.tr',
        lessonCount: 28,
        lastLogin: '32 dk önce',
        status: 'active',
      },
      {
        id: 'tch-3',
        name: 'Burak AKSOY',
        branch: 'Matematik',
        classroom: '6-A, 7-B, 8-A',
        phone: '+90 (530) 333 44 55',
        email: 'b.aksoy@neclagorer.k12.tr',
        lessonCount: 24,
        lastLogin: '1 saat önce',
        status: 'active',
      },
      {
        id: 'tch-4',
        name: 'Elif KORKMAZ',
        branch: 'Fen Bilimleri',
        classroom: '5-A, 6-B, 7-A',
        phone: '+90 (530) 444 55 66',
        email: 'e.korkmaz@neclagorer.k12.tr',
        lessonCount: 22,
        lastLogin: 'Bugün, 09:15',
        status: 'active',
      },
      {
        id: 'tch-5',
        name: 'Serkan TEKİN',
        branch: 'Bilişim Teknolojileri & Kodlama',
        classroom: 'Tüm Kademeler',
        phone: '+90 (530) 555 66 77',
        email: 's.tekin@neclagorer.k12.tr',
        lessonCount: 20,
        lastLogin: 'Dün, 16:45',
        status: 'active',
      },
      {
        id: 'tch-6',
        name: 'Gülşah YILMAZ',
        branch: 'İngilizce',
        classroom: '3-A, 4-A, 4-B',
        phone: '+90 (530) 666 77 88',
        email: 'g.yilmaz@neclagorer.k12.tr',
        lessonCount: 26,
        lastLogin: 'Bugün, 08:50',
        status: 'active',
      },
      {
        id: 'tch-7',
        name: 'Emre GÜNEŞ',
        branch: 'Türkçe',
        classroom: '5-B, 6-A, 8-B',
        phone: '+90 (530) 777 88 99',
        email: 'e.gunes@neclagorer.k12.tr',
        lessonCount: 26,
        lastLogin: 'Bugün, 10:20',
        status: 'active',
      },
    ],
    students: [
      {
        id: 'stu-101',
        studentNumber: '101',
        name: 'Deniz ARSLAN',
        grade: '4-A',
        parentName: 'Tolga ARSLAN (Baba)',
        parentPhone: '+90 (532) 400 11 22',
        attendanceRate: 98.6,
        gpa: 94.5,
        status: 'active',
      },
      {
        id: 'stu-102',
        studentNumber: '102',
        name: 'Ece KARACA',
        grade: '4-A',
        parentName: 'Berna KARACA (Anne)',
        parentPhone: '+90 (533) 500 22 33',
        attendanceRate: 97.2,
        gpa: 91.0,
        status: 'active',
      },
      {
        id: 'stu-103',
        studentNumber: '103',
        name: 'Kaan YILDIZ',
        grade: '4-A',
        parentName: 'Murat YILDIZ (Baba)',
        parentPhone: '+90 (535) 600 33 44',
        attendanceRate: 95.8,
        gpa: 86.4,
        status: 'active',
      },
      {
        id: 'stu-104',
        studentNumber: '104',
        name: 'Zeynep Su DURMAZ',
        grade: '4-B',
        parentName: 'Hülya DURMAZ (Anne)',
        parentPhone: '+90 (536) 700 44 55',
        attendanceRate: 99.1,
        gpa: 97.8,
        status: 'active',
      },
      {
        id: 'stu-105',
        studentNumber: '105',
        name: 'Ali Emre BOZ',
        grade: '4-B',
        parentName: 'Serhat BOZ (Baba)',
        parentPhone: '+90 (537) 800 55 66',
        attendanceRate: 92.4,
        gpa: 82.0,
        status: 'active',
      },
      {
        id: 'stu-106',
        studentNumber: '201',
        name: 'Defne ŞENGÜL',
        grade: '6-A',
        parentName: 'Özlem ŞENGÜL (Anne)',
        parentPhone: '+90 (538) 900 66 77',
        attendanceRate: 96.5,
        gpa: 89.2,
        status: 'active',
      },
      {
        id: 'stu-107',
        studentNumber: '301',
        name: 'Kerem TÜRKOĞLU',
        grade: '8-A',
        parentName: 'Cengiz TÜRKOĞLU (Baba)',
        parentPhone: '+90 (539) 100 77 88',
        attendanceRate: 97.8,
        gpa: 92.3,
        status: 'active',
      },
    ],
    classrooms: [
      { grade: '1-A', level: '1. Sınıf', studentCount: 28, headTeacher: 'Sevda KOÇ', averageScore: 92.4 },
      { grade: '1-B', level: '1. Sınıf', studentCount: 27, headTeacher: 'Ahmet ÇELİK', averageScore: 90.8 },
      { grade: '2-A', level: '2. Sınıf', studentCount: 30, headTeacher: 'Nermin KURT', averageScore: 89.5 },
      { grade: '2-B', level: '2. Sınıf', studentCount: 29, headTeacher: 'Mehmet POLAT', averageScore: 88.2 },
      { grade: '3-A', level: '3. Sınıf', studentCount: 31, headTeacher: 'Berna TAŞ', averageScore: 87.9 },
      { grade: '3-B', level: '3. Sınıf', studentCount: 30, headTeacher: 'Oğuzhan BULUT', averageScore: 86.4 },
      { grade: '4-A', level: '4. Sınıf', studentCount: 32, headTeacher: 'Ayşe DEMİR', averageScore: 93.1 },
      { grade: '4-B', level: '4. Sınıf', studentCount: 31, headTeacher: 'Canan ÖZTÜRK', averageScore: 91.5 },
      { grade: '5-A', level: '5. Sınıf', studentCount: 33, headTeacher: 'Elif KORKMAZ', averageScore: 85.3 },
      { grade: '6-A', level: '6. Sınıf', studentCount: 32, headTeacher: 'Burak AKSOY', averageScore: 86.0 },
      { grade: '7-A', level: '7. Sınıf', studentCount: 34, headTeacher: 'Emre GÜNEŞ', averageScore: 84.7 },
      { grade: '8-A', level: '8. Sınıf (LGS)', studentCount: 35, headTeacher: 'Serkan TEKİN', averageScore: 88.9 },
    ],
    stats: {
      totalStudents: 720,
      activeStudents: 712,
      maleStudents: 374,
      femaleStudents: 346,
      totalTeachers: 42,
      activeTeachers: 40,
      totalStaff: 12,
      attendanceRate: 96.8,
      academicAverage: 88.4,
      weeklyActiveUsers: 684,
      completedLessonsThisMonth: 1420,
      storageUsedMb: 14850,
      storageLimitMb: 51200,
      aiTokensUsed: 18240,
      aiTokensLimit: 50000,
    },
    modules: {
      gameStudio: true,
      aiExamEngine: true,
      liveClassroom: true,
      smartBoard: true,
      parentPortal: true,
      mebSync: true,
      analyticsPro: true,
    },
    activityLogs: [
      {
        id: 'act-1',
        action: '4-A sınıfı Matematik 2. Ara Sınavı puanları sisteme girildi ve onaylandı',
        actor: 'Ayşe DEMİR',
        role: 'Sınıf Öğretmeni',
        timestamp: '12 dakika önce',
        category: 'not_girisi',
        status: 'success',
      },
      {
        id: 'act-2',
        action: 'Günlük yoklama bildirimleri 682 veliye SMS ve mobil bildirim ile iletildi',
        actor: 'Sistem Otomasyonu',
        role: 'Otomatik Süreç',
        timestamp: '48 dakika önce',
        category: 'yoklama',
        status: 'info',
      },
      {
        id: 'act-3',
        action: '8-A sınıfı için MEB müfredatı uyumlu LGS Deneme Sınavı oluşturuldu',
        actor: 'Burak AKSOY',
        role: 'Matematik Zümre Bşk.',
        timestamp: '2 saat önce',
        category: 'sinav',
        status: 'success',
      },
      {
        id: 'act-4',
        action: 'Yeni Rehberlik ve PDR görüşme takvimi sisteme tanımlandı',
        actor: 'Pelin ARSLAN',
        role: 'PDR Uzmanı',
        timestamp: 'Bugün, 09:30',
        category: 'kullanici',
        status: 'info',
      },
      {
        id: 'act-5',
        action: 'Kurumsal Akıllı Tahta lisansı v2.4 güncellemesi tamamlandı',
        actor: 'Hakan ÇETİN',
        role: 'Bilgi İşlem',
        timestamp: 'Dün, 17:15',
        category: 'sistem',
        status: 'success',
      },
      {
        id: 'act-6',
        action: 'Yıllık Enterprise Pro lisans kotası yenilendi (+50.000 AI Soru Kredisi)',
        actor: 'Kemal SOYSAL',
        role: 'Okul Müdürü',
        timestamp: '20.10.2026',
        category: 'lisans',
        status: 'success',
      },
    ],
  },
  {
    id: 'sch-2',
    code: '741302',
    name: 'Kadıköy Atatürk İlkokulu',
    shortName: 'Atatürk İlkokulu',
    type: 'MEB Resmi İlkokulu',
    level: 'İlkokul (1-4. Sınıflar)',
    city: 'İstanbul',
    district: 'Kadıköy',
    address: 'Moda Cad. Caferağa Mah. No:38 Kadıköy / İstanbul',
    phone: '+90 (216) 345 10 20',
    email: 'kadikoy.ataturk@meb.k12.tr',
    website: 'https://kadikoyataturk.meb.k12.tr',
    status: 'active',
    licensePlan: 'Standart Okul',
    licenseStart: '01.09.2024',
    licenseExpires: '30.06.2027',
    createdAt: '01.09.2024',
    principal: {
      name: 'Selim AKTAŞ',
      title: 'Okul Müdürü',
      tcNo: '10000000002',
      phone: '+90 (532) 345 22 10',
      email: 'selim.aktas@meb.k12.tr',
      appointmentDate: '01.09.2021',
      status: 'active',
    },
    staff: [
      {
        id: 'stf-21',
        name: 'Halil İbrahim KOÇ',
        role: 'Müdür Yardımcısı',
        category: 'yonetim',
        phone: '+90 (533) 220 33 44',
        email: 'h.koc@meb.k12.tr',
        shift: '08:00 - 17:00',
        status: 'active',
      },
      {
        id: 'stf-22',
        name: 'Derya ÇAKIR',
        role: 'Rehber Öğretmen (PDR)',
        category: 'pdr',
        phone: '+90 (535) 440 55 66',
        email: 'd.cakir@meb.k12.tr',
        shift: '08:30 - 16:30',
        status: 'active',
      },
    ],
    teachers: [
      {
        id: 'tch-21',
        name: 'Sevgi YILDIZ',
        branch: 'Sınıf Öğretmenliği',
        classroom: '2-A',
        phone: '+90 (530) 999 11 22',
        email: 'sevgi.yildiz@meb.k12.tr',
        lessonCount: 30,
        lastLogin: '45 dk önce',
        status: 'active',
      },
      {
        id: 'tch-22',
        name: 'Hüseyin ŞEN',
        branch: 'Sınıf Öğretmenliği',
        classroom: '3-B',
        phone: '+90 (530) 888 22 33',
        email: 'huseyin.sen@meb.k12.tr',
        lessonCount: 30,
        lastLogin: '2 saat önce',
        status: 'active',
      },
    ],
    students: [
      {
        id: 'stu-201',
        studentNumber: '201',
        name: 'Kerem AKAN',
        grade: '3-B',
        parentName: 'Cem AKAN',
        parentPhone: '+90 (532) 777 88 99',
        attendanceRate: 97.4,
        gpa: 89.0,
        status: 'active',
      },
    ],
    classrooms: [
      { grade: '1-A', level: '1. Sınıf', studentCount: 30, headTeacher: 'Fatma KÖSE', averageScore: 91.2 },
      { grade: '2-A', level: '2. Sınıf', studentCount: 28, headTeacher: 'Sevgi YILDIZ', averageScore: 88.5 },
      { grade: '3-B', level: '3. Sınıf', studentCount: 29, headTeacher: 'Hüseyin ŞEN', averageScore: 87.0 },
      { grade: '4-A', level: '4. Sınıf', studentCount: 31, headTeacher: 'Mehmet YALÇIN', averageScore: 90.1 },
    ],
    stats: {
      totalStudents: 540,
      activeStudents: 532,
      maleStudents: 280,
      femaleStudents: 260,
      totalTeachers: 32,
      activeTeachers: 31,
      totalStaff: 8,
      attendanceRate: 95.4,
      academicAverage: 86.8,
      weeklyActiveUsers: 510,
      completedLessonsThisMonth: 1050,
      storageUsedMb: 9200,
      storageLimitMb: 25600,
      aiTokensUsed: 9800,
      aiTokensLimit: 25000,
    },
    modules: {
      gameStudio: true,
      aiExamEngine: true,
      liveClassroom: false,
      smartBoard: true,
      parentPortal: true,
      mebSync: true,
      analyticsPro: false,
    },
    activityLogs: [
      {
        id: 'act-21',
        action: 'Haftalık e-yoklama çizelgeleri idareye teslim edildi',
        actor: 'Hüseyin ŞEN',
        role: 'Öğretmen',
        timestamp: '1 saat önce',
        category: 'yoklama',
        status: 'success',
      },
    ],
  },
  {
    id: 'sch-3',
    code: '741819',
    name: 'Çankaya Bilim ve Sanat Koleji',
    shortName: 'Çankaya Bilim K12',
    type: 'Özel K-12 Eğitim Kurumu',
    level: 'K-12 (İlkokul, Ortaokul, Lise)',
    city: 'Ankara',
    district: 'Çankaya',
    address: 'Turan Güneş Bulvarı No:142 Çankaya / Ankara',
    phone: '+90 (312) 440 80 90',
    email: 'iletisim@cankayabilim.k12.tr',
    website: 'https://cankayabilim.k12.tr',
    status: 'active',
    licensePlan: 'Enterprise Pro',
    licenseStart: '15.09.2024',
    licenseExpires: '15.09.2027',
    createdAt: '15.09.2024',
    principal: {
      name: 'Zeynep YILMAZ',
      title: 'Genel Müdür & Kurucu Temsilcisi',
      tcNo: '10000000003',
      phone: '+90 (532) 440 90 99',
      email: 'zeynep.yilmaz@cankayabilim.k12.tr',
      appointmentDate: '10.06.2020',
      status: 'active',
    },
    staff: [
      {
        id: 'stf-31',
        name: 'Tarık SOYLU',
        role: 'Lise & Ortaokul Müdürü',
        category: 'yonetim',
        phone: '+90 (533) 900 11 22',
        email: 't.soylu@cankayabilim.k12.tr',
        shift: '08:00 - 18:00',
        status: 'active',
      },
      {
        id: 'stf-32',
        name: 'Buse KARATAŞ',
        role: 'PDR Koordinatörü',
        category: 'pdr',
        phone: '+90 (535) 600 77 88',
        email: 'buse.pdr@cankayabilim.k12.tr',
        shift: '08:30 - 17:00',
        status: 'active',
      },
    ],
    teachers: [
      {
        id: 'tch-31',
        name: 'Cemil ÖZ',
        branch: 'Robotik & Kodlama',
        classroom: 'Teknoloji Laboratuvarı',
        phone: '+90 (530) 123 45 67',
        email: 'c.oz@cankayabilim.k12.tr',
        lessonCount: 24,
        lastLogin: '15 dk önce',
        status: 'active',
      },
    ],
    students: [
      {
        id: 'stu-301',
        studentNumber: '801',
        name: 'Bora TANYEL',
        grade: '7-A',
        parentName: 'Engin TANYEL',
        parentPhone: '+90 (532) 111 44 55',
        attendanceRate: 98.9,
        gpa: 96.2,
        status: 'active',
      },
    ],
    classrooms: [
      { grade: '4-A', level: '4. Sınıf', studentCount: 22, headTeacher: 'Nesrin AK', averageScore: 94.2 },
      { grade: '7-A', level: '7. Sınıf', studentCount: 20, headTeacher: 'Cemil ÖZ', averageScore: 92.8 },
      { grade: '8-A', level: '8. Sınıf', studentCount: 24, headTeacher: 'Kemal VAROL', averageScore: 95.1 },
    ],
    stats: {
      totalStudents: 960,
      activeStudents: 955,
      maleStudents: 495,
      femaleStudents: 465,
      totalTeachers: 58,
      activeTeachers: 58,
      totalStaff: 18,
      attendanceRate: 98.4,
      academicAverage: 92.6,
      weeklyActiveUsers: 940,
      completedLessonsThisMonth: 2180,
      storageUsedMb: 24300,
      storageLimitMb: 102400,
      aiTokensUsed: 38400,
      aiTokensLimit: 100000,
    },
    modules: {
      gameStudio: true,
      aiExamEngine: true,
      liveClassroom: true,
      smartBoard: true,
      parentPortal: true,
      mebSync: true,
      analyticsPro: true,
    },
    activityLogs: [
      {
        id: 'act-31',
        action: 'Robotics & STEM Atölyesi yeni 3D baskı ders modülleri öğrencilere açıldı',
        actor: 'Cemil ÖZ',
        role: 'STEM Zümre Bşk.',
        timestamp: '35 dakika önce',
        category: 'sistem',
        status: 'success',
      },
    ],
  },
  {
    id: 'sch-4',
    code: '742110',
    name: 'Nilüfer Gelişim Akademisi İlkokulu',
    shortName: 'Nilüfer Akademi',
    type: 'Özel İlkokul',
    level: 'İlkokul (1-4. Sınıflar)',
    city: 'Bursa',
    district: 'Nilüfer',
    address: 'İhsaniye Mah. Barış Cad. No:19 Nilüfer / Bursa',
    phone: '+90 (224) 211 44 55',
    email: 'bursa@nilufergelisim.com',
    website: 'https://nilufergelisim.com',
    status: 'pending',
    licensePlan: 'Deneme Lisansı (14 Gün)',
    licenseStart: '18.10.2026',
    licenseExpires: '01.11.2026',
    createdAt: '18.10.2026',
    principal: {
      name: 'Murat ERDOĞAN',
      title: 'Okul Müdürü & Kurucu',
      tcNo: '10000000004',
      phone: '+90 (532) 211 00 99',
      email: 'murat@nilufergelisim.com',
      appointmentDate: '01.09.2023',
      status: 'active',
    },
    staff: [
      {
        id: 'stf-41',
        name: 'Banu DEMİREL',
        role: 'Müdür Yardımcısı',
        category: 'yonetim',
        phone: '+90 (533) 444 77 88',
        email: 'b.demirel@nilufergelisim.com',
        shift: '08:30 - 17:30',
        status: 'active',
      },
    ],
    teachers: [
      {
        id: 'tch-41',
        name: 'Okan ŞAHİN',
        branch: 'Sınıf Öğretmenliği',
        classroom: '1-A',
        phone: '+90 (530) 777 99 00',
        email: 'okan@nilufergelisim.com',
        lessonCount: 26,
        lastLogin: '3 saat önce',
        status: 'active',
      },
    ],
    students: [
      {
        id: 'stu-401',
        studentNumber: '501',
        name: 'Can BERK',
        grade: '1-A',
        parentName: 'Sedat BERK',
        parentPhone: '+90 (532) 888 33 22',
        attendanceRate: 96.0,
        gpa: 91.5,
        status: 'active',
      },
    ],
    classrooms: [
      { grade: '1-A', level: '1. Sınıf', studentCount: 24, headTeacher: 'Okan ŞAHİN', averageScore: 91.5 },
      { grade: '2-A', level: '2. Sınıf', studentCount: 22, headTeacher: 'Sema GÜL', averageScore: 89.0 },
    ],
    stats: {
      totalStudents: 380,
      activeStudents: 375,
      maleStudents: 195,
      femaleStudents: 185,
      totalTeachers: 24,
      activeTeachers: 24,
      totalStaff: 6,
      attendanceRate: 96.2,
      academicAverage: 89.4,
      weeklyActiveUsers: 360,
      completedLessonsThisMonth: 640,
      storageUsedMb: 4100,
      storageLimitMb: 10240,
      aiTokensUsed: 3100,
      aiTokensLimit: 10000,
    },
    modules: {
      gameStudio: true,
      aiExamEngine: true,
      liveClassroom: false,
      smartBoard: true,
      parentPortal: false,
      mebSync: false,
      analyticsPro: false,
    },
    activityLogs: [
      {
        id: 'act-41',
        action: 'Okul 14 günlük deneme sürümü aktivasyonu tamamlandı',
        actor: 'Murat ERDOĞAN',
        role: 'Kurucu Müdür',
        timestamp: '18.10.2026',
        category: 'lisans',
        status: 'info',
      },
    ],
  },
  {
    id: 'sch-5',
    code: '743550',
    name: 'İzmir Karşıyaka Bilim Koleji',
    shortName: 'Karşıyaka Bilim',
    type: 'Özel İlkokul & Ortaokul',
    level: 'İlkokul (1-4) & Ortaokul (5-8)',
    city: 'İzmir',
    district: 'Karşıyaka',
    address: 'Bostanlı Mah. Cemal Gürsel Cad. No:88 Karşıyaka / İzmir',
    phone: '+90 (232) 368 50 60',
    email: 'info@karsiyakabilim.k12.tr',
    website: 'https://karsiyakabilim.k12.tr',
    status: 'active',
    licensePlan: 'Enterprise Pro',
    licenseStart: '01.09.2024',
    licenseExpires: '01.09.2027',
    createdAt: '01.09.2024',
    principal: {
      name: 'Ebru TAŞKIN',
      title: 'Okul Müdürü',
      tcNo: '10000000005',
      phone: '+90 (532) 368 77 11',
      email: 'ebru.taskin@karsiyakabilim.k12.tr',
      appointmentDate: '01.09.2022',
      status: 'active',
    },
    staff: [
      {
        id: 'stf-51',
        name: 'Sinan POLAT',
        role: 'Müdür Yardımcısı',
        category: 'yonetim',
        phone: '+90 (533) 670 12 90',
        email: 's.polat@karsiyakabilim.k12.tr',
        shift: '08:00 - 17:30',
        status: 'active',
      },
    ],
    teachers: [
      {
        id: 'tch-51',
        name: 'Vildan ŞENOL',
        branch: 'Matematik',
        classroom: '5-A, 6-A',
        phone: '+90 (530) 412 88 00',
        email: 'vildan@karsiyakabilim.k12.tr',
        lessonCount: 26,
        lastLogin: '25 dk önce',
        status: 'active',
      },
    ],
    students: [
      {
        id: 'stu-501',
        studentNumber: '601',
        name: 'Egehan DENİZ',
        grade: '5-A',
        parentName: 'Tayfun DENİZ',
        parentPhone: '+90 (532) 999 12 34',
        attendanceRate: 98.0,
        gpa: 93.4,
        status: 'active',
      },
    ],
    classrooms: [
      { grade: '1-A', level: '1. Sınıf', studentCount: 26, headTeacher: 'Tuğba AY', averageScore: 92.0 },
      { grade: '5-A', level: '5. Sınıf', studentCount: 28, headTeacher: 'Vildan ŞENOL', averageScore: 90.5 },
    ],
    stats: {
      totalStudents: 610,
      activeStudents: 604,
      maleStudents: 312,
      femaleStudents: 298,
      totalTeachers: 38,
      activeTeachers: 38,
      totalStaff: 10,
      attendanceRate: 97.1,
      academicAverage: 89.8,
      weeklyActiveUsers: 590,
      completedLessonsThisMonth: 1280,
      storageUsedMb: 11200,
      storageLimitMb: 40960,
      aiTokensUsed: 14500,
      aiTokensLimit: 40000,
    },
    modules: {
      gameStudio: true,
      aiExamEngine: true,
      liveClassroom: true,
      smartBoard: true,
      parentPortal: true,
      mebSync: true,
      analyticsPro: true,
    },
    activityLogs: [
      {
        id: 'act-51',
        action: 'Oxonom Game Studio Akıl Oyunları turnuvası okullar arası eşleşmesi başlatıldı',
        actor: 'Ebru TAŞKIN',
        role: 'Okul Müdürü',
        timestamp: 'Bugün, 11:00',
        category: 'sistem',
        status: 'success',
      },
    ],
  },
]

const STORAGE_KEY = 'oxonom_superadmin_schools_v2'

export function getAllSchools(): SchoolDetail[] {
  if (typeof window === 'undefined') return INITIAL_SCHOOLS

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (_) {}

  // Initialize storage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SCHOOLS))
  } catch (_) {}

  return INITIAL_SCHOOLS
}

export function getSchoolById(idOrCode: string): SchoolDetail | undefined {
  const all = getAllSchools()
  const clean = decodeURIComponent(idOrCode).trim().toLowerCase()
  return all.find(
    (s) => s.id.toLowerCase() === clean || s.code.toLowerCase() === clean
  )
}

export function saveAllSchools(schools: SchoolDetail[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schools))
  } catch (err) {
    console.error('Failed to save schools to localStorage:', err)
  }
}

export function addNewSchool(data: {
  name: string
  code: string
  city: string
  district: string
  address?: string
  level: string
  type?: string
  principalName: string
  principalPhone: string
  principalEmail: string
  phone?: string
  email?: string
  website?: string
  planType: 'Enterprise Pro' | 'Standart Okul' | 'Deneme Lisansı (14 Gün)'
  studentCount?: number
  teacherCount?: number
}): SchoolDetail {
  const all = getAllSchools()

  const id = `sch-${Date.now()}`
  const now = new Date()
  const formattedDate = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`
  const expireYear = data.planType.includes('Deneme') ? now.getFullYear() : now.getFullYear() + 3
  const formattedExpire = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${expireYear}`

  const studentCount = data.studentCount || 240
  const teacherCount = data.teacherCount || 16

  const newSchool: SchoolDetail = {
    id,
    code: data.code.trim(),
    name: data.name.trim(),
    shortName: data.name.trim().split(' ').slice(0, 2).join(' '),
    type: data.type || 'MEB Resmi İlkokulu',
    level: data.level,
    city: data.city,
    district: data.district,
    address: data.address || `${data.district} / ${data.city}`,
    phone: data.phone || data.principalPhone,
    email: data.email || data.principalEmail,
    website: data.website || `https://${data.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.k12.tr`,
    status: 'active',
    licensePlan: data.planType,
    licenseStart: formattedDate,
    licenseExpires: formattedExpire,
    createdAt: formattedDate,
    principal: {
      name: data.principalName.trim(),
      title: 'Okul Müdürü · Kurum Baş Yetkilisi',
      tcNo: '10000000099',
      phone: data.principalPhone.trim(),
      email: data.principalEmail.trim(),
      appointmentDate: formattedDate,
      status: 'active',
    },
    staff: [
      {
        id: `stf-${Date.now()}-1`,
        name: 'Müdür Yardımcısı',
        role: 'Müdür Yardımcısı (Öğrenci İşleri)',
        category: 'yonetim',
        phone: data.principalPhone,
        email: data.principalEmail,
        shift: '08:00 - 17:00',
        status: 'active',
      },
      {
        id: `stf-${Date.now()}-2`,
        name: 'Rehberlik Servisi',
        role: 'PDR Koordinatörü',
        category: 'pdr',
        phone: data.principalPhone,
        email: data.principalEmail,
        shift: '08:30 - 16:30',
        status: 'active',
      },
    ],
    teachers: [
      {
        id: `tch-${Date.now()}-1`,
        name: `${data.principalName.split(' ')[0]} Bey Öğretmen`,
        branch: 'Sınıf Öğretmenliği',
        classroom: '1-A',
        phone: data.principalPhone,
        email: data.principalEmail,
        lessonCount: 28,
        lastLogin: 'Yeni Kayıt',
        status: 'active',
      },
      {
        id: `tch-${Date.now()}-2`,
        name: 'Matematik Zümre Bşk.',
        branch: 'Matematik',
        classroom: 'Tüm Sınıflar',
        phone: data.principalPhone,
        email: data.principalEmail,
        lessonCount: 24,
        lastLogin: 'Yeni Kayıt',
        status: 'active',
      },
    ],
    students: [
      {
        id: `stu-${Date.now()}-1`,
        studentNumber: '101',
        name: 'Örnek Öğrenci',
        grade: '1-A',
        parentName: 'Veli Bilgisi',
        parentPhone: data.principalPhone,
        attendanceRate: 100.0,
        gpa: 95.0,
        status: 'active',
      },
    ],
    classrooms: [
      { grade: '1-A', level: '1. Sınıf', studentCount: Math.round(studentCount / 4), headTeacher: 'Sınıf Öğretmeni', averageScore: 90.0 },
      { grade: '2-A', level: '2. Sınıf', studentCount: Math.round(studentCount / 4), headTeacher: 'Sınıf Öğretmeni', averageScore: 89.0 },
      { grade: '3-A', level: '3. Sınıf', studentCount: Math.round(studentCount / 4), headTeacher: 'Sınıf Öğretmeni', averageScore: 88.0 },
      { grade: '4-A', level: '4. Sınıf', studentCount: Math.round(studentCount / 4), headTeacher: 'Sınıf Öğretmeni', averageScore: 89.5 },
    ],
    stats: {
      totalStudents: studentCount,
      activeStudents: studentCount,
      maleStudents: Math.round(studentCount / 2),
      femaleStudents: Math.round(studentCount / 2),
      totalTeachers: teacherCount,
      activeTeachers: teacherCount,
      totalStaff: 4,
      attendanceRate: 97.0,
      academicAverage: 89.0,
      weeklyActiveUsers: Math.round(studentCount * 0.9),
      completedLessonsThisMonth: 120,
      storageUsedMb: 1200,
      storageLimitMb: 20480,
      aiTokensUsed: 500,
      aiTokensLimit: 25000,
    },
    modules: {
      gameStudio: true,
      aiExamEngine: true,
      liveClassroom: true,
      smartBoard: true,
      parentPortal: true,
      mebSync: true,
      analyticsPro: true,
    },
    activityLogs: [
      {
        id: `act-${Date.now()}-init`,
        action: `Okul kurulumu tamamlandı ve sisteme başarıyla kaydedildi`,
        actor: 'Süper Admin',
        role: 'Sistem Yöneticisi',
        timestamp: 'Az önce',
        category: 'sistem',
        status: 'success',
      },
    ],
  }

  const updated = [newSchool, ...all]
  saveAllSchools(updated)
  return newSchool
}
