// Oxonom Edu — Necla Görer İlkokulu & Şair Fevzi Kutlu Kalkancı Ortaokulu
// Single Source of Truth for Schools, Classrooms, Teachers, Students & Homework

export interface SchoolOrg {
  id: number
  org_uuid: string
  name: string
  slug: string
  description: string
  about: string
  grades: string
  grade_levels: string[]
  level_type: 'PRIMARY' | 'MIDDLE'
  address: string
  phone: string
  email: string
  logo_text: string
  logo_image?: string
  accent_color: string
}

export const SCHOOL_ORGS: SchoolOrg[] = [
  {
    id: 10,
    org_uuid: 'org_necla_gorer_ilkokulu',
    name: 'Necla Görer İlkokulu',
    slug: 'neclagorer',
    description: '1, 2, 3 ve 4. Sınıflar — MEB Temel Eğitim & Akıllı İlkokul Portalı',
    about: 'Necla Görer İlkokulu resmi dijital eğitim kampüsü. 1. sınıftan 4. sınıfa kadar tüm şubeler, sınıf öğretmenleri, akıllı tahtalar ve ödev takip sistemi.',
    grades: '1 - 4. Sınıflar (İlkokul)',
    grade_levels: ['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf'],
    level_type: 'PRIMARY',
    address: 'Kavacık Mah. Fatih Sultan Mehmet Cad. No:14 Beykoz / İstanbul',
    phone: '+90 216 322 1020',
    email: 'neclagorer@oxonom.com',
    logo_text: 'NGİ',
    logo_image: '/meb_logo.svg',
    accent_color: 'emerald',
  },
  {
    id: 20,
    org_uuid: 'org_sfg_ortaokulu',
    name: 'Şair Fevzi Kutlu Kalkancı Ortaokulu',
    slug: 'fevzikalkanci',
    description: '5, 6, 7 ve 8. Sınıflar — LGS Hazırlık & Akıllı Ortaokul Portalı',
    about: 'Şair Fevzi Kutlu Kalkancı Ortaokulu resmi dijital eğitim kampüsü. 5. sınıftan 8. sınıfa kadar branş dersleri, LGS hazırlık denemeleri, akıllı tahtalar ve ödev platformu.',
    grades: '5 - 8. Sınıflar (Ortaokul)',
    grade_levels: ['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'],
    level_type: 'MIDDLE',
    address: 'Göztepe Mah. İnönü Cad. No:45 Kadıköy / İstanbul',
    phone: '+90 216 411 2030',
    email: 'fevzikalkanci@oxonom.com',
    logo_text: 'ŞFKO',
    logo_image: '/meb_logo.svg',
    accent_color: 'indigo',
  },
]

// Also expose as default/demo aliases
export const DEFAULT_SCHOOL_ALIAS_MAP: Record<string, SchoolOrg> = {
  'demo': SCHOOL_ORGS[0],
  'default': SCHOOL_ORGS[0],
  'neclagorer': SCHOOL_ORGS[0],
  'fevzikalkanci': SCHOOL_ORGS[1],
}

export interface TeacherDef {
  name: string
  className: string
  gradeLevel: string
  orgId: number
  email: string
  phone: string
  branch: string
}

export const TEACHER_RAW_LIST: { grade: string; orgId: number; teachers: { className: string; name: string }[] }[] = [
  {
    grade: '1. Sınıf',
    orgId: 10,
    teachers: [
      { className: '1-A', name: 'Özlem ZOR' },
      { className: '1-B', name: 'Beyzanur SALMANLI' },
      { className: '1-C', name: 'Özge KABA' },
      { className: '1-D', name: 'Gülbahar KARANFİL' },
      { className: '1-E', name: 'Emel İLHAN YAĞCI' },
      { className: '1-F', name: 'Fatma MARANGOZ' },
      { className: '1-G', name: 'Reyhan KADİROĞULLARI' },
    ],
  },
  {
    grade: '2. Sınıf',
    orgId: 10,
    teachers: [
      { className: '2-A', name: 'Zeliha EMAN' },
      { className: '2-B', name: 'Mehmet Akif YEŞİLYURT' },
      { className: '2-C', name: 'Çiğdem TINGIR' },
      { className: '2-D', name: 'Sebahat GÖL' },
      { className: '2-E', name: 'Uğur UZUN' },
      { className: '2-F', name: 'Şevval Feyza SAKCİ' },
      { className: '2-G', name: 'Sakine ZEYLEK' },
    ],
  },
  {
    grade: '3. Sınıf',
    orgId: 10,
    teachers: [
      { className: '3-A', name: 'Tansu ÜREK' },
      { className: '3-B', name: 'Meryem MACİT' },
      { className: '3-C', name: 'Hümeyra KARAALİOĞLU' },
      { className: '3-D', name: 'Kader AKSOY' },
      { className: '3-E', name: 'Hilal TÜRKAN' },
      { className: '3-F', name: 'Meral ÖZDEN' },
      { className: '3-G', name: 'İrem ÖZIŞIK' },
    ],
  },
  {
    grade: '4. Sınıf',
    orgId: 10,
    teachers: [
      { className: '4-A', name: 'Hivda SADAK' },
      { className: '4-B', name: 'Vildan GÜNEŞ' },
      { className: '4-C', name: 'Derya ÇOBAN' },
      { className: '4-D', name: 'Şevki ECDER' },
      { className: '4-E', name: 'Nihal İŞELİ' },
      { className: '4-F', name: 'Nursel YILDIZ' },
      { className: '4-G', name: 'Fatma SUCU' },
    ],
  },
  {
    grade: '5. Sınıf',
    orgId: 20,
    teachers: [
      { className: '5-A', name: 'Esin AKKAN' },
      { className: '5-B', name: 'Hatice CAN' },
      { className: '5-C', name: 'Bülent TURAN' },
      { className: '5-D', name: 'Beritan ŞENATEŞ' },
      { className: '5-E', name: 'Azime Nur IRMAK' },
      { className: '5-F', name: 'Orkun AYDIN' },
      { className: '5-G', name: 'Öznur KILDIR' },
    ],
  },
  {
    grade: '6. Sınıf',
    orgId: 20,
    teachers: [
      { className: '6-A', name: 'Murat ESEN' },
      { className: '6-B', name: 'Harun Reşit BARDAKÇI' },
      { className: '6-C', name: 'Recep ÇELİK' },
      { className: '6-D', name: 'Gülsüm MUTLU' },
      { className: '6-E', name: 'Ayşe Gözde KAYADELEN' },
      { className: '6-F', name: 'Ömer Faruk DAĞYAR' },
      { className: '6-G', name: 'Faysal KEZER' },
      { className: '6-H', name: 'Şeyda ÖZTÜRK' },
    ],
  },
  {
    grade: '7. Sınıf',
    orgId: 20,
    teachers: [
      { className: '7-A', name: 'Makbule YILDIRIM' },
      { className: '7-B', name: 'Hacer KUTLU' },
      { className: '7-C', name: 'Ali TORLAK' },
      { className: '7-D', name: 'Nil USTA EŞİM' },
      { className: '7-E', name: 'Emine VATANSEVER' },
      { className: '7-F', name: 'Merve Tuğçe KUCUR' },
      { className: '7-G', name: 'Aybüke ÇELİK' },
    ],
  },
  {
    grade: '8. Sınıf',
    orgId: 20,
    teachers: [
      { className: '8-A', name: 'Canan KAYA' },
      { className: '8-A', name: 'Gülümser ERMEZ' },
      { className: '8-B', name: 'Berna SERBEST' },
      { className: '8-C', name: 'İbrahim Halil EKİNCİ' },
      { className: '8-D', name: 'Merve ÖZDOĞAN' },
      { className: '8-E', name: 'Arzu ÇAĞIŞ' },
      { className: '8-F', name: 'Mehmet Ercan AĞTÜRK' },
      { className: '8-G', name: 'Aytül ERDOĞAN' },
      { className: '8-H', name: 'Emine DURMUŞ ÇETİN' },
    ],
  },
]

export interface ClassroomItem {
  id: number
  usergroup_uuid: string
  name: string
  code: string
  join_code: string
  grade_level: string
  org_id: number
  school_name: string
  school_slug: string
  description: string
  teacher_name: string
  teacher_email: string
  student_count: number
  boards_count: number
}

// Generate all classrooms
export const ALL_CLASSROOMS: ClassroomItem[] = []
let classIdCounter = 100

TEACHER_RAW_LIST.forEach((g) => {
  const school = SCHOOL_ORGS.find((s) => s.id === g.orgId)!
  g.teachers.forEach((t) => {
    classIdCounter++
    const cleanCode = t.className.replace('-', '')
    const joinCode = `OKUL-${cleanCode}`
    ALL_CLASSROOMS.push({
      id: classIdCounter,
      usergroup_uuid: `usergroup_${cleanCode.toLowerCase()}_${school.slug}`,
      name: `${t.className} Şubesi`,
      code: t.className,
      join_code: joinCode,
      grade_level: g.grade,
      org_id: g.orgId,
      school_name: school.name,
      school_slug: school.slug,
      description: `Sınıf Öğretmeni: ${t.name} — ${school.name}`,
      teacher_name: t.name,
      teacher_email: `${t.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@oxonom.com`,
      student_count: 30,
      boards_count: 4,
    })
  })
})

// Demo Student profile: Erçil Evren UĞURLU
export const DEMO_STUDENT = {
  id: 1001,
  user_uuid: 'user_ercil_evren_ugurlu',
  studentNo: '2026-001',
  tcNo: '10000000146', // Valid TC by checksum
  name: 'Erçil Evren UĞURLU',
  first_name: 'Erçil Evren',
  last_name: 'UĞURLU',
  email: 'ogrenci@oxonom.com',
  username: 'ogrenci',
  gender: 'Erkek' as const,
  birthDate: '15.06.2017 (9 Yaşında)',
  bloodType: 'A Rh+',
  motherName: 'Ebru UĞURLU',
  motherPhone: '+90 532 999 1100',
  fatherName: 'Uğur UĞURLU',
  fatherPhone: '+90 532 999 2200',
  parentName: 'Uğur UĞURLU & Ebru UĞURLU',
  parentPhone: '+90 532 999 2200',
  parentRelation: 'Baba & Anne',
  parentOccupation: 'Yazılım Mühendisi / Mimar',
  secondParentName: 'Ebru UĞURLU (Anne)',
  secondParentPhone: '+90 532 999 1100',
  parents: [
    { name: 'Ebru UĞURLU', relation: 'Anne', phone: '+90 532 999 1100', occupation: 'Mimar', email: 'ebru.ugurlu@oxonom.com' },
    { name: 'Uğur UĞURLU', relation: 'Baba', phone: '+90 532 999 2200', occupation: 'Yazılım Mühendisi', email: 'ugur.ugurlu@oxonom.com' },
  ],
  address: 'Bağdat Cad. No:114 Kadıköy / İstanbul',
  emergencyContact: 'Uğur UĞURLU (Baba)',
  emergencyPhone: '+90 532 999 2200',
  status: 'active' as const,
  enrollmentDate: '15.09.2024',
  gpa: 98.5,
  attendanceRate: 100,
  excusedDays: 0,
  unexcusedDays: 0,
  assignmentsDone: 20,
  assignmentsTotal: 20,
  notes: 'Sınıf birincisi, kitap okuma, zeka oyunları ve kodlama atölyelerinde yüksek başarı.',
  specialHealthNote: 'Herhangi bir sağlık engeli, kronik rahatsızlığı veya alerjisi bulunmamaktadır.',
  disciplineStatus: 'Temiz Sicil — Örnek Öğrenci Üstün Başarı Belgesi',
  guidanceNotes: [
    {
      id: 'gn-demo-1',
      date: '28.09.2026',
      author: 'Psk. Dan. Rehberlik Servisi',
      category: 'Akademik' as const,
      content: 'Öğrencinin analitik düşünme, hızlı kavrama ve ders içi motivasyonu en üst düzeydedir.',
    },
    {
      id: 'gn-demo-2',
      date: '15.09.2026',
      author: 'Okul Yönetimi',
      category: 'Veli Görüşmesi' as const,
      content: 'Velisi Ebru Hanım ve Uğur Bey ile yapılan dönem başı tanışma ve eğitim planlama görüşmesi verimli tamamlandı.',
    },
  ],
  grades: [
    { courseName: 'Türkçe', teacherName: 'Özlem ZOR', exam1: 100, exam2: 98, performance: 100, average: 99.3 },
    { courseName: 'Matematik', teacherName: 'Özlem ZOR', exam1: 98, exam2: 100, performance: 100, average: 99.3 },
    { courseName: 'Hayat Bilgisi / Fen', teacherName: 'Özlem ZOR', exam1: 96, exam2: 98, performance: 100, average: 98.0 },
    { courseName: 'İngilizce', teacherName: 'Yabancı Dil', exam1: 100, exam2: 98, performance: 100, average: 99.3 },
  ],
  is_demo: true,
}

// Generate 30 mock students for a classroom
const TURKISH_FIRST_NAMES_BOY = [
  'Ahmet', 'Mehmet', 'Mustafa', 'Emir', 'Ali', 'Yusuf', 'Kerem', 'Efe',
  'Ömer', 'Burak', 'Can', 'Deniz', 'Baran', 'Mert', 'Arda', 'Kaan', 'Doruk', 'Poyraz',
  'Rüzgar', 'Boran', 'Yiğit', 'Alp', 'Cem', 'Umut', 'Tuna', 'Batu', 'Serdar', 'Onur'
]
const TURKISH_FIRST_NAMES_GIRL = [
  'Zeynep', 'Elif', 'Defne', 'Duru', 'Azra', 'Asya', 'Nehir', 'Eylül',
  'Yağmur', 'Miray', 'İrem', 'Ada', 'Selin', 'Melis', 'Derin', 'Beren', 'Güneş', 'Ece',
  'Ela', 'Nil', 'Naz', 'Ceren', 'Damla', 'Bahar', 'Su', 'Lara', 'Simge', 'Begüm'
]
const TURKISH_LAST_NAMES = [
  'Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Yıldırım', 'Öztürk',
  'Aydın', 'Özdemir', 'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara',
  'Koç', 'Kurt', 'Özkan', 'Şimşek', 'Polat', 'Korkmaz', 'Erdoğan', 'Yavuz', 'Güler'
]

export function generateClassStudents(classItem: ClassroomItem) {
  const students = []
  // Student #1 is ALWAYS Erçil Evren UĞURLU
  students.push({
    ...DEMO_STUDENT,
    classroomId: classItem.id,
    classroomName: classItem.name,
    mentorTeacher: classItem.teacher_name,
    schoolName: classItem.school_name,
  })

  // 29 other random students
  for (let i = 2; i <= 30; i++) {
    const isGirl = i % 2 === 0
    const firstName = isGirl
      ? TURKISH_FIRST_NAMES_GIRL[(i * 3 + classItem.id) % TURKISH_FIRST_NAMES_GIRL.length]
      : TURKISH_FIRST_NAMES_BOY[(i * 5 + classItem.id) % TURKISH_FIRST_NAMES_BOY.length]
    const lastName = TURKISH_LAST_NAMES[(i * 7 + classItem.id) % TURKISH_LAST_NAMES.length]
    const studentNo = `${classItem.code.replace('-', '')}-${String(i).padStart(2, '0')}`
    const parentRelation = isGirl ? 'Anne' : 'Baba'
    const parentName = `${isGirl ? 'Fatma' : 'Ahmet'} ${lastName}`
    const parentPhone = `+90 532 777 ${String(1000 + i).slice(1)}`

    students.push({
      id: classItem.id * 100 + i,
      user_uuid: `student_${classItem.id}_${i}`,
      studentNo,
      tcNo: `2${String(classItem.id).padStart(3, '0')}${String(i).padStart(3, '0')}102`,
      name: `${firstName} ${lastName}`,
      first_name: firstName,
      last_name: lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@okul.com`,
      username: `ogr_${cleanTr(firstName)}_${cleanTr(lastName)}_${i}`.toLowerCase(),
      gender: isGirl ? ('Kız' as const) : ('Erkek' as const),
      birthDate: classItem.org_id === 10 ? '2017-04-12 (9 Yaşında)' : '2013-05-18 (13 Yaşında)',
      bloodType: ['A Rh+', 'B Rh+', '0 Rh+', 'AB Rh+'][i % 4],
      motherName: `${TURKISH_FIRST_NAMES_GIRL[(i + 2) % TURKISH_FIRST_NAMES_GIRL.length]} ${lastName}`,
      motherPhone: `+90 532 555 ${String(1000 + i).slice(1)}`,
      fatherName: `${TURKISH_FIRST_NAMES_BOY[(i + 4) % TURKISH_FIRST_NAMES_BOY.length]} ${lastName}`,
      fatherPhone: `+90 532 666 ${String(1000 + i).slice(1)}`,
      parentName,
      parentPhone,
      parentRelation,
      parentOccupation: ['Mühendis', 'Öğretmen', 'Doktor', 'Esnaf', 'Muhasebeci', 'Mimar', 'Avukat', 'Bankacı'][i % 8],
      secondParentName: `${isGirl ? 'Ahmet' : 'Fatma'} ${lastName} (${isGirl ? 'Baba' : 'Anne'})`,
      secondParentPhone: `+90 532 888 ${String(1000 + i).slice(1)}`,
      parents: [
        { name: parentName, relation: parentRelation, phone: parentPhone, occupation: 'Özel Sektör' },
      ],
      emergencyContact: parentName,
      emergencyPhone: parentPhone,
      address: `Kadıköy / İstanbul`,
      classroomId: classItem.id,
      classroomName: classItem.name,
      mentorTeacher: classItem.teacher_name,
      schoolName: classItem.school_name,
      status: 'active' as const,
      enrollmentDate: '15.09.2024',
      gpa: Math.round((80 + (i % 19) + Math.random()) * 10) / 10,
      attendanceRate: 95 + (i % 5),
      excusedDays: (i % 3),
      unexcusedDays: (i % 2),
      assignmentsDone: 18 + (i % 3),
      assignmentsTotal: 20,
      notes: `${classItem.name} öğrencisi. Derslere aktif katılım sağlıyor.`,
      specialHealthNote: '',
      disciplineStatus: 'Temiz Sicil',
      guidanceNotes: [
        {
          id: `gn-${classItem.id}-${i}`,
          date: '20.09.2026',
          author: classItem.teacher_name,
          category: 'Akademik' as const,
          content: `${classItem.name} uyum süreci tamamlandı. Ders katılımı başarılı.`,
        },
      ],
      grades: [
        { courseName: 'Ders Başarısı', teacherName: classItem.teacher_name, exam1: 85 + (i % 15), exam2: 88 + (i % 12), performance: 90, average: 88 },
      ],
      is_demo: false,
    })
  }

  return students
}

export function generateAssignmentSubmissionsData(
  assignmentUuid: string,
  classItem?: ClassroomItem,
  dueDateStr?: string
) {
  const targetClass = classItem || ALL_CLASSROOMS[0]
  const students = generateClassStudents(targetClass)

  const dueDate = dueDateStr
    ? new Date(dueDateStr).getTime()
    : new Date('2026-10-15T23:59:00').getTime()

  const studentRows = students.map((std, idx) => {
    const isErcil = std.username === 'demo_ogrenci' || std.name.includes('Erçil')

    // Students 25..29 (5 students): NOT SUBMITTED (Teslim Etmeyenler)
    if (idx >= 25) {
      return {
        user_id: std.id,
        name: std.name,
        username: std.username,
        avatar_image: (std as any).avatar_image || null,
        classroom_name: targetClass.name,
        classroom_id: targetClass.id,
        submission_id: null,
        status: 'PENDING' as const,
        submission_date: null,
        score: null,
        teacher_feedback: null,
        student_content: null,
        is_late: false,
        late_duration_text: '',
      }
    }

    // Students 20..24 (5 students): LATE SUBMISSION (Geç Teslim)
    const isLateStudent = idx >= 20 && idx < 25
    let submissionDate: string
    let isLate = false
    let lateText = ''

    if (isLateStudent) {
      isLate = true
      const lateHours = [2, 14, 28, 49, 73][idx - 20] || (idx - 19) * 12
      const lateMs = lateHours * 3600 * 1000 + 15 * 60 * 1000
      submissionDate = new Date(dueDate + lateMs).toISOString()
      const diffDays = Math.floor(lateHours / 24)
      const remHours = lateHours % 24
      lateText = diffDays > 0
        ? (remHours > 0 ? `${diffDays} gün ${remHours} saat geç` : `${diffDays} gün geç`)
        : `${lateHours} saat geç`
    } else {
      // Delivered before due date (Zamanında Teslim)
      const earlyHours = (idx + 1) * 7 + 3
      submissionDate = new Date(dueDate - earlyHours * 3600 * 1000).toISOString()
    }

    const isGraded = idx < 16
    const score = isErcil ? 95 : (84 + (idx % 16))

    return {
      user_id: std.id,
      name: std.name,
      username: std.username,
      avatar_image: (std as any).avatar_image || null,
      classroom_name: targetClass.name,
      classroom_id: targetClass.id,
      submission_id: 500 + idx,
      status: (isGraded ? 'GRADED' : isLate ? 'LATE' : 'SUBMITTED') as 'GRADED' | 'LATE' | 'SUBMITTED',
      submission_date: submissionDate,
      score: isGraded ? score : null,
      is_late: isLate,
      late_duration_text: lateText,
      teacher_feedback: isErcil
        ? 'Harika bir çalışma Erçil Evren, tebrikler!'
        : isGraded
        ? (idx % 3 === 0 ? 'Özenli ve eksiksiz hazırlanmış, tebrikler.' : idx % 3 === 1 ? 'Adımlar ve çözümler gayet net ve başarılı.' : 'Ders içi gayretin ödeve çok güzel yansımış.')
        : null,
      student_content: {
        type: 'text_and_board',
        text: `${std.name} ödev teslim dokümanı ve tahta çalışması.`,
      },
    }
  })

  const submittedCount = studentRows.filter((s) => s.status !== 'PENDING').length
  const gradedCount = studentRows.filter((s) => s.status === 'GRADED').length

  return {
    total_students: 30,
    submitted_count: submittedCount,
    graded_count: gradedCount,
    students: studentRows,
  }
}

export function getActiveClassroom(classCode?: string): ClassroomItem {
  if (!classCode) return ALL_CLASSROOMS[0]
  const clean = classCode.trim().toUpperCase()
  return ALL_CLASSROOMS.find((c) => c.code === clean || c.name.startsWith(clean)) || ALL_CLASSROOMS[0]
}

export function getOrgTeachers(orgId: number) {
  const isMiddle = orgId === 20
  const targetOrgId = isMiddle ? 20 : 10
  return TEACHER_RAW_LIST
    .filter((g) => g.orgId === targetOrgId)
    .flatMap((g) => g.teachers.map((t, idx) => ({
      id: (targetOrgId * 100) + idx + 1,
      name: t.name,
      tcNo: `291827364${String(idx).padStart(2, '0')}`,
      email: `${cleanTr(t.name).toLowerCase().replace(/[^a-z0-9]/g, '')}@oxonom.com`,
      phone: `+90 532 999 ${String(1000 + idx).slice(1)}`,
      branch: g.orgId === 10 ? 'Sınıf Öğretmeni' : 'Branş Öğretmeni',
      university: g.orgId === 10 ? 'İstanbul Üniversitesi Sınıf Öğretmenliği' : 'Marmara Üniversitesi Eğitim Fakültesi',
      graduationYear: '2016',
      birthDate: '1989-05-14 (37 Yaşında)',
      address: 'Kadıköy / İstanbul',
      emergencyContact: 'Eşi',
      emergencyPhone: '+90 532 111 2233',
      workingHours: '08:30 - 15:30 (Pazartesi - Cuma)',
      weeklyHours: 24,
      employmentType: 'Kadrolu' as const,
      isClassMentor: true,
      mentorClass: t.className,
      assignedClasses: [t.className],
      status: 'active' as const,
      documents: [
        {
          id: `doc-${targetOrgId}-${idx}-1`,
          name: `${cleanTr(t.name)}_Lisans_Diplomasi.pdf`,
          type: 'Lisans Diploması' as const,
          uploadDate: '01.09.2023',
          fileSize: '2.1 MB',
        },
        {
          id: `doc-${targetOrgId}-${idx}-2`,
          name: 'Pedagojik_Formasyon_Belgesi.pdf',
          type: 'Pedagojik Formasyon' as const,
          uploadDate: '01.09.2023',
          fileSize: '1.4 MB',
        },
      ],
      leaves: [],
    })))
}

function cleanTr(str: string): string {
  return str
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'g')
    .replace(/ü/g, 'u').replace(/Ü/g, 'u')
    .replace(/ş/g, 's').replace(/Ş/g, 's')
    .replace(/ı/g, 'i').replace(/İ/g, 'i')
    .replace(/ö/g, 'o').replace(/Ö/g, 'o')
    .replace(/ç/g, 'c').replace(/Ç/g, 'c')
}

// Generate classroom boards based on grade level
export function generateClassroomBoards(classItem: ClassroomItem) {
  const isPrimary = classItem.org_id === 10
  if (isPrimary) {
    return [
      {
        id: classItem.id * 10 + 1,
        board_uuid: `board_${classItem.id}_turkce`,
        name: `${classItem.code} Türkçe: Okuma & Anlama ve Cümle Bilgisi`,
        description: `Öğretmen: ${classItem.teacher_name}. 5N1K etkinlikleri, harf-hece çalışmaları ve hızlı okuma tahtası.`,
        subject: 'Türkçe',
        date_tag: 'today',
        last_activity: 'Bugün, 09:30',
        usergroup_id: classItem.id,
        usergroup_name: classItem.name,
        teacher_name: classItem.teacher_name,
        class_code: classItem.code,
        grade_level: classItem.grade_level,
        member_count: classItem.student_count || 24,
        thumbnail_image: '',
        public: true,
      },
      {
        id: classItem.id * 10 + 2,
        board_uuid: `board_${classItem.id}_mat`,
        name: `${classItem.code} Matematik: Ritmik Sayma & Dört İşlem Atölyesi`,
        description: `Öğretmen: ${classItem.teacher_name}. Basamak değerleri, problem çözme stratejileri ve zihinden işlemler.`,
        subject: 'Matematik',
        date_tag: 'today',
        last_activity: 'Bugün, 11:15',
        usergroup_id: classItem.id,
        usergroup_name: classItem.name,
        teacher_name: classItem.teacher_name,
        class_code: classItem.code,
        grade_level: classItem.grade_level,
        member_count: classItem.student_count || 24,
        thumbnail_image: '',
        public: true,
      },
      {
        id: classItem.id * 10 + 3,
        board_uuid: `board_${classItem.id}_hayat`,
        name: `${classItem.code} Hayat Bilgisi: Dünyamız ve Canlılar`,
        description: `Öğretmen: ${classItem.teacher_name}. Mevsimler, doğa olayları, sağlıklı yaşam ve çevre bilinci.`,
        subject: 'Hayat Bilgisi',
        date_tag: 'this_week',
        last_activity: 'Dün, 14:00',
        usergroup_id: classItem.id,
        usergroup_name: classItem.name,
        teacher_name: classItem.teacher_name,
        class_code: classItem.code,
        grade_level: classItem.grade_level,
        member_count: classItem.student_count || 24,
        thumbnail_image: '',
        public: true,
      },
      {
        id: classItem.id * 10 + 4,
        board_uuid: `board_${classItem.id}_pano`,
        name: `${classItem.code} Sınıf Panosu & Haftalık Duyurular`,
        description: `${classItem.name} haftalık ders programı, ödül köşesi ve sınıf duyuruları.`,
        subject: 'Sınıf Panosu',
        date_tag: 'archive',
        last_activity: '3 gün önce',
        usergroup_id: classItem.id,
        usergroup_name: classItem.name,
        teacher_name: classItem.teacher_name,
        class_code: classItem.code,
        grade_level: classItem.grade_level,
        member_count: classItem.student_count || 24,
        thumbnail_image: '',
        public: true,
      },
    ]
  }

  // Middle School (5-8)
  return [
    {
      id: classItem.id * 10 + 1,
      board_uuid: `board_${classItem.id}_mat`,
      name: `${classItem.code} Matematik: Cebirsel İfadeler & Denklem Çözümü`,
      description: `Öğretmen: ${classItem.teacher_name}. Sayısal mantık, LGS tarzı yeni nesil sorular ve grafikler.`,
      subject: 'Matematik',
      date_tag: 'today',
      last_activity: 'Bugün, 10:00',
      usergroup_id: classItem.id,
      usergroup_name: classItem.name,
      teacher_name: classItem.teacher_name,
      class_code: classItem.code,
      grade_level: classItem.grade_level,
      member_count: classItem.student_count || 26,
      thumbnail_image: '',
      public: true,
    },
    {
      id: classItem.id * 10 + 2,
      board_uuid: `board_${classItem.id}_fen`,
      name: `${classItem.code} Fen Bilimleri: Kuvvet, Enerji ve Hücre Modelleri`,
      description: `Öğretmen: ${classItem.teacher_name}. Laboratuvar deney föyleri, simülasyonlar ve kavram haritaları.`,
      subject: 'Fen Bilimleri',
      date_tag: 'today',
      last_activity: 'Bugün, 13:45',
      usergroup_id: classItem.id,
      usergroup_name: classItem.name,
      teacher_name: classItem.teacher_name,
      class_code: classItem.code,
      grade_level: classItem.grade_level,
      member_count: classItem.student_count || 26,
      thumbnail_image: '',
      public: true,
    },
    {
      id: classItem.id * 10 + 3,
      board_uuid: `board_${classItem.id}_turkce`,
      name: `${classItem.code} Türkçe: Paragrafta Anlam & Sözel Mantık`,
      description: `Öğretmen: ${classItem.teacher_name}. Metin tahlili, dil bilgisi kuralları ve kompozisyon atölyesi.`,
      subject: 'Türkçe',
      date_tag: 'this_week',
      last_activity: 'Dün, 15:30',
      usergroup_id: classItem.id,
      usergroup_name: classItem.name,
      teacher_name: classItem.teacher_name,
      class_code: classItem.code,
      grade_level: classItem.grade_level,
      member_count: classItem.student_count || 26,
      thumbnail_image: '',
      public: true,
    },
    {
      id: classItem.id * 10 + 4,
      board_uuid: `board_${classItem.id}_lgs`,
      name: `${classItem.code} LGS Takip & Haftalık Rehberlik Panosu`,
      description: `${classItem.name} haftalık deneme netleri, çalışma çizelgeleri ve sınav takvimi.`,
      subject: 'Sınıf Panosu',
      date_tag: 'archive',
      last_activity: '4 gün önce',
      usergroup_id: classItem.id,
      usergroup_name: classItem.name,
      teacher_name: classItem.teacher_name,
      class_code: classItem.code,
      grade_level: classItem.grade_level,
      member_count: classItem.student_count || 26,
      thumbnail_image: '',
      public: true,
    },
  ]
}

// Export all classroom boards across all schools & branches
export const ALL_CLASSROOM_BOARDS = ALL_CLASSROOMS.flatMap((c) =>
  generateClassroomBoards(c).map((b) => ({
    ...b,
    is_demo: true,
    created_by: 2,
    org_id: c.org_id,
  }))
)

// Generate classroom homework (All assigned to Demo Student: Erçil Evren UĞURLU)
export function generateClassroomAssignments(classItem: ClassroomItem) {
  const isPrimary = classItem.org_id === 10
  if (isPrimary) {
    return [
      {
        id: classItem.id * 10 + 1,
        assignment_uuid: `asg_${classItem.id}_1`,
        title: `${classItem.code} Türkçe: 1 Dk Okuma & 5N1K Metin Değerlendirme`,
        description: `Sevgili öğrencimiz Erçil Evren UĞURLU, 60 saniyelik okuma metnini sesli oku ve metinle ilgili 3 soruyu cevapla.`,
        grade_level: classItem.grade_level,
        grade_category: 'İlkokul (1-4)',
        subject: 'Türkçe',
        tool_type: 'READING',
        due_date: '2026-10-10T23:59:00',
        max_score: 100,
        published: true,
        teacher_name: classItem.teacher_name,
        classes: [{ id: classItem.id, name: classItem.name, code: classItem.code }],
        usergroup_ids: [classItem.id],
        student_name: DEMO_STUDENT.name,
        student_no: DEMO_STUDENT.studentNo,
        total_submissions: 30,
        graded_submissions: 29,
        average_score: 95,
        submission: {
          id: 501,
          status: 'GRADED',
          score: 100,
          teacher_feedback: `Tebrikler Erçil Evren! Çok akıcı ve hatasız bir okuma gerçekleştirdin. — ${classItem.teacher_name}`,
          graded_at: '2026-10-02T14:30:00',
        },
      },
      {
        id: classItem.id * 10 + 2,
        assignment_uuid: `asg_${classItem.id}_2`,
        title: `${classItem.code} Matematik: Ritmik Sayma ve Zihinden Toplama`,
        description: `Akıllı tahtayı açarak verilen 5 toplama ve çıkarma işlemini basamak tablosunda çözünüz.`,
        grade_level: classItem.grade_level,
        grade_category: 'İlkokul (1-4)',
        subject: 'Matematik',
        tool_type: 'WHITEBOARD',
        board_uuid: `board_${classItem.id}_mat`,
        due_date: '2026-10-14T23:59:00',
        max_score: 100,
        published: true,
        teacher_name: classItem.teacher_name,
        classes: [{ id: classItem.id, name: classItem.name, code: classItem.code }],
        usergroup_ids: [classItem.id],
        student_name: DEMO_STUDENT.name,
        student_no: DEMO_STUDENT.studentNo,
        total_submissions: 30,
        graded_submissions: 28,
        average_score: 92,
        submission: {
          id: 502,
          status: 'SUBMITTED',
          score: null,
          teacher_feedback: null,
        },
      },
      {
        id: classItem.id * 10 + 3,
        assignment_uuid: `asg_${classItem.id}_3`,
        title: `${classItem.code} Hayat Bilgisi: Sağlıklı Yaşam ve Dengeli Beslenme Tablosu`,
        description: `Bir haftalık sağlıklı beslenme ve uyku günlüğünü hazırlayınız.`,
        grade_level: classItem.grade_level,
        grade_category: 'İlkokul (1-4)',
        subject: 'Hayat Bilgisi',
        tool_type: 'WORKSHEET',
        due_date: '2026-10-18T23:59:00',
        max_score: 100,
        published: true,
        teacher_name: classItem.teacher_name,
        classes: [{ id: classItem.id, name: classItem.name, code: classItem.code }],
        usergroup_ids: [classItem.id],
        student_name: DEMO_STUDENT.name,
        student_no: DEMO_STUDENT.studentNo,
        total_submissions: 30,
        graded_submissions: 25,
        average_score: 90,
        submission: {
          id: 503,
          status: 'PENDING',
          score: null,
        },
      },
    ]
  }

  // Middle School (5-8)
  return [
    {
      id: classItem.id * 10 + 1,
      assignment_uuid: `asg_${classItem.id}_1`,
      title: `${classItem.code} Matematik: Yeni Nesil LGS Sayısal Mantık Testi`,
      description: `Verilen 10 yeni nesil matematik problemini akıllı tahta üzerinde çözüm adımlarını göstererek tamamlayınız.`,
      grade_level: classItem.grade_level,
      grade_category: 'Ortaokul (5-8)',
      subject: 'Matematik',
      tool_type: 'WHITEBOARD',
      board_uuid: `board_${classItem.id}_mat`,
      due_date: '2026-10-12T23:59:00',
      max_score: 100,
      published: true,
      teacher_name: classItem.teacher_name,
      classes: [{ id: classItem.id, name: classItem.name, code: classItem.code }],
      usergroup_ids: [classItem.id],
      student_name: DEMO_STUDENT.name,
      student_no: DEMO_STUDENT.studentNo,
      total_submissions: 30,
      graded_submissions: 30,
      average_score: 88,
      submission: {
        id: 601,
        status: 'GRADED',
        score: 98,
        teacher_feedback: `Mükemmel mantık kurgusu Erçil Evren! — ${classItem.teacher_name}`,
        graded_at: '2026-10-02T15:00:00',
      },
    },
    {
      id: classItem.id * 10 + 2,
      assignment_uuid: `asg_${classItem.id}_2`,
      title: `${classItem.code} Fen Bilimleri: Laboratuvar Deney Raporu`,
      description: `Hücre bölünmeleri ve enerji dönüşümü konusundaki sanal deney sonuçlarını tabloya aktarınız.`,
      grade_level: classItem.grade_level,
      grade_category: 'Ortaokul (5-8)',
      subject: 'Fen Bilimleri',
      tool_type: 'WORKSHEET',
      due_date: '2026-10-16T23:59:00',
      max_score: 100,
      published: true,
      teacher_name: classItem.teacher_name,
      classes: [{ id: classItem.id, name: classItem.name, code: classItem.code }],
      usergroup_ids: [classItem.id],
      student_name: DEMO_STUDENT.name,
      student_no: DEMO_STUDENT.studentNo,
      total_submissions: 30,
      graded_submissions: 27,
      average_score: 86,
      submission: {
        id: 602,
        status: 'SUBMITTED',
        score: null,
      },
    },
    {
      id: classItem.id * 10 + 3,
      assignment_uuid: `asg_${classItem.id}_3`,
      title: `${classItem.code} Türkçe: Paragrafta Ana Fikir & Metin Tahlili`,
      description: `Okunan makaledeki ana düşünceyi ve yardımcı düşünceleri 150 kelimelik bir özetle açıklayınız.`,
      grade_level: classItem.grade_level,
      grade_category: 'Ortaokul (5-8)',
      subject: 'Türkçe',
      tool_type: 'READING',
      due_date: '2026-10-20T23:59:00',
      max_score: 100,
      published: true,
      teacher_name: classItem.teacher_name,
      classes: [{ id: classItem.id, name: classItem.name, code: classItem.code }],
      usergroup_ids: [classItem.id],
      student_name: DEMO_STUDENT.name,
      student_no: DEMO_STUDENT.studentNo,
      total_submissions: 30,
      graded_submissions: 24,
      average_score: 91,
      submission: {
        id: 603,
        status: 'PENDING',
        score: null,
      },
    },
  ]
}

// TC Kimlik No Algoritması & Otomatik Bilgi Tamamlama
export function validateTcKimlik(tc: string): { valid: boolean; message?: string } {
  if (!tc || typeof tc !== 'string') {
    return { valid: false, message: 'Lütfen T.C. Kimlik Numarası giriniz.' }
  }
  const clean = tc.trim()
  if (!/^\d{11}$/.test(clean)) {
    return { valid: false, message: 'T.C. Kimlik Numarası tam 11 rakamdan oluşmalıdır.' }
  }
  if (clean[0] === '0') {
    return { valid: false, message: 'T.C. Kimlik Numarası 0 ile başlayamaz.' }
  }

  const digits = clean.split('').map(Number)
  const d1_9_odd = digits[0] + digits[2] + digits[4] + digits[6] + digits[8]
  const d2_8_even = digits[1] + digits[3] + digits[5] + digits[7]
  const d10 = ((d1_9_odd * 7) - d2_8_even) % 10
  const adjustedD10 = d10 < 0 ? d10 + 10 : d10

  if (adjustedD10 !== digits[9]) {
    return { valid: false, message: 'Geçersiz T.C. Kimlik Numarası! Kontrol basamağı kuralına uymuyor.' }
  }

  const sum10 = digits.slice(0, 10).reduce((a, b) => a + b, 0)
  if (sum10 % 10 !== digits[10]) {
    return { valid: false, message: 'Geçersiz T.C. Kimlik Numarası! Sağlama toplamı hatalı.' }
  }

  return { valid: true }
}

// Known TC Registry for Automatic Name-Surname Lookup
export interface TcRecord {
  tcNo: string
  name: string
  first_name: string
  last_name: string
  role: 'Öğrenci' | 'Veli' | 'Öğretmen' | 'Okul Müdürü'
  gender?: 'Erkek' | 'Kadın'
  birthDate?: string
  birthYear?: number
  age?: number
  motherName?: string
  fatherName?: string
  spouseName?: string
  bloodType?: string
  address?: string
  school?: string
  classroom?: string
  is_verified?: boolean
  mernis_status?: string
  last_mernis_sync?: string
  parents?: Array<{
    name: string
    relation: string
    phone: string
    occupation?: string
    email?: string
  }>
}

export const KNOWN_TC_REGISTRY: Record<string, TcRecord> = {
  '64690186628': {
    tcNo: '64690186628',
    name: 'Uğur UĞURLU',
    first_name: 'Uğur',
    last_name: 'UĞURLU',
    role: 'Veli',
    gender: 'Erkek',
    bloodType: 'A Rh+',
    address: 'Caddebostan Mah. Bağdat Cad. No: 142/5 Kadıköy / İstanbul',
    school: 'Necla Görer İlkokulu',
    classroom: '1-A Velisi',
    is_verified: true,
    mernis_status: 'MERNİS Nüfus ve Vatandaşlık İşleri (NVİ) Aktif Kütük Kaydı',
    parents: [
      { name: 'Ebru UĞURLU', relation: 'Anne', phone: '+90 532 999 1100', occupation: 'Mimar', email: 'ebru.ugurlu@oxonom.com' },
      { name: 'Uğur UĞURLU', relation: 'Baba', phone: '+90 532 999 2200', occupation: 'Yazılım Mühendisi', email: 'ugur@oxonom.com' },
    ],
  },
  '10000000146': {
    tcNo: '10000000146',
    name: 'Erçil Evren UĞURLU',
    first_name: 'Erçil Evren',
    last_name: 'UĞURLU',
    role: 'Öğrenci',
    gender: 'Kadın',
    birthDate: '2018-04-12',
    birthYear: 2018,
    age: 8,
    motherName: 'Ebru UĞURLU',
    fatherName: 'Uğur UĞURLU',
    bloodType: 'A Rh+',
    address: 'Caddebostan Mah. Bağdat Cad. No: 142/5 Kadıköy / İstanbul',
    school: 'Necla Görer İlkokulu',
    classroom: '1-A',
    is_verified: true,
    mernis_status: 'MERNİS Nüfus ve Vatandaşlık İşleri (NVİ) Aktif Öğrenci Kütük Kaydı',
    parents: [
      { name: 'Ebru UĞURLU', relation: 'Anne', phone: '+90 532 999 1100', occupation: 'Mimar', email: 'ebru.ugurlu@oxonom.com' },
      { name: 'Uğur UĞURLU', relation: 'Baba', phone: '+90 532 999 2200', occupation: 'Yazılım Mühendisi', email: 'ugur@oxonom.com' },
    ],
  },
  '10928374652': {
    tcNo: '10928374652',
    name: 'Ali Demir',
    first_name: 'Ali',
    last_name: 'Demir',
    role: 'Öğrenci',
    gender: 'Erkek',
    birthDate: '2018-09-20',
    birthYear: 2018,
    age: 8,
    motherName: 'Zeynep Demir',
    fatherName: 'Mehmet Demir',
    bloodType: '0 Rh+',
    address: 'Fenerbahçe Mah. Dr. Faruk Ayanoğlu Cad. No: 12 Kadıköy / İstanbul',
    school: 'Necla Görer İlkokulu',
    classroom: '1-A',
    is_verified: true,
    mernis_status: 'MERNİS Aktif Kütük Kaydı',
    parents: [
      { name: 'Zeynep Demir', relation: 'Anne', phone: '+90 533 111 2233', occupation: 'Doktor', email: '' },
      { name: 'Mehmet Demir', relation: 'Baba', phone: '+90 533 444 5566', occupation: 'Avukat', email: '' },
    ],
  },
  '29182736450': {
    tcNo: '29182736450',
    name: 'Özlem ZOR',
    first_name: 'Özlem',
    last_name: 'ZOR',
    role: 'Öğretmen',
    gender: 'Kadın',
    birthDate: '1985-03-10',
    birthYear: 1985,
    age: 41,
    motherName: 'Fatma ZOR',
    fatherName: 'Ali ZOR',
    bloodType: 'A Rh-',
    school: 'Necla Görer İlkokulu',
    classroom: '1-A',
    is_verified: true,
  },
  '38291049582': {
    tcNo: '38291049582',
    name: 'Gülümser ERMEZ',
    first_name: 'Gülümser',
    last_name: 'ERMEZ',
    role: 'Öğretmen',
    gender: 'Kadın',
    birthDate: '1980-11-25',
    birthYear: 1980,
    age: 46,
    motherName: 'Ayşe ERMEZ',
    fatherName: 'Hüseyin ERMEZ',
    bloodType: 'B Rh+',
    school: 'Şair Fevzi Kutlu Kalkancı Ortaokulu',
    classroom: '8-A',
    is_verified: true,
  },
  '49201948572': {
    tcNo: '49201948572',
    name: 'Mehmet Özkan',
    first_name: 'Mehmet',
    last_name: 'Özkan',
    role: 'Okul Müdürü',
    gender: 'Erkek',
    birthDate: '1976-08-14',
    birthYear: 1976,
    age: 50,
    motherName: 'Hatice Özkan',
    fatherName: 'Mustafa Özkan',
    bloodType: '0 Rh+',
    school: 'Necla Görer İlkokulu',
    is_verified: true,
  },
}

const MERNIS_POOL_MALE = ['Kemal', 'Emre', 'Barış', 'Deniz', 'Can', 'Burak', 'Alp', 'Mert', 'Kaan', 'Murat', 'Oğuz', 'Serkan']
const MERNIS_POOL_FEMALE = ['Zeynep', 'Elif', 'Selin', 'Derya', 'Merve', 'Gamze', 'Büşra', 'Seda', 'İrem', 'Ece', 'Bahar', 'Deniz']
const MERNIS_POOL_SURNAMES = ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Yıldız', 'Yıldırım', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç']
const MERNIS_POOL_BLOOD = ['A Rh+', 'A Rh-', 'B Rh+', 'B Rh-', 'AB Rh+', 'AB Rh-', '0 Rh+', '0 Rh-']

function generateMernisCitizen(tc: string): TcRecord {
  const digits = tc.split('').map(Number)
  const seed = digits.reduce((acc, d, idx) => acc + d * (idx + 1), 0)
  const isMale = digits[9] % 2 === 0
  const firstName = isMale 
    ? MERNIS_POOL_MALE[seed % MERNIS_POOL_MALE.length] 
    : MERNIS_POOL_FEMALE[seed % MERNIS_POOL_FEMALE.length]
  const lastName = MERNIS_POOL_SURNAMES[(seed * 3) % MERNIS_POOL_SURNAMES.length]
  const motherName = MERNIS_POOL_FEMALE[(seed * 7) % MERNIS_POOL_FEMALE.length]
  const fatherName = MERNIS_POOL_MALE[(seed * 11) % MERNIS_POOL_MALE.length]
  const bloodType = MERNIS_POOL_BLOOD[seed % MERNIS_POOL_BLOOD.length]
  
  // Deterministic birth year (between 1978 and 2018)
  const isStudent = (digits[8] % 2 === 0)
  const birthYear = isStudent ? (2014 + (seed % 6)) : (1975 + (seed % 25))
  const birthMonth = String((seed % 12) + 1).padStart(2, '0')
  const birthDay = String((seed % 28) + 1).padStart(2, '0')
  const birthDate = `${birthYear}-${birthMonth}-${birthDay}`
  const currentYear = 2026
  const age = currentYear - birthYear

  const role: 'Öğrenci' | 'Veli' = isStudent ? 'Öğrenci' : 'Veli'

  return {
    tcNo: tc,
    name: `${firstName} ${lastName}`,
    first_name: firstName,
    last_name: lastName,
    role,
    gender: isMale ? 'Erkek' : 'Kadın',
    birthDate,
    birthYear,
    age,
    motherName: `${motherName} ${lastName}`,
    fatherName: `${fatherName} ${lastName}`,
    bloodType,
    address: 'Merkez Mah. Atatürk Cad. No: 18 Kadıköy / İstanbul',
    school: 'Necla Görer İlkokulu',
    classroom: isStudent ? '1-A Şubesi' : '1-A Velisi',
    is_verified: true,
    mernis_status: 'MERNİS Nüfus ve Vatandaşlık İşleri (NVİ) Doğrulanmış Kayıt',
    parents: [
      { name: `${motherName} ${lastName}`, relation: 'Anne', phone: '+90 532 ' + String(100 + (seed % 899)) + ' 1122', occupation: 'Serbest Meslek', email: '' },
      { name: `${fatherName} ${lastName}`, relation: 'Baba', phone: '+90 532 ' + String(200 + (seed % 799)) + ' 3344', occupation: 'Özel Sektör', email: '' },
    ],
  }
}

export function lookupTcRecord(tc: string): TcRecord | null {
  const clean = tc.trim()
  if (KNOWN_TC_REGISTRY[clean]) {
    return KNOWN_TC_REGISTRY[clean]
  }
  const check = validateTcKimlik(clean)
  if (check.valid) {
    return generateMernisCitizen(clean)
  }
  return null
}

export async function fetchMernisData(tc: string): Promise<{ success: boolean; record?: TcRecord; message: string }> {
  const clean = tc.trim()
  const check = validateTcKimlik(clean)
  if (!check.valid) {
    return { success: false, message: check.message || 'Geçersiz T.C. Kimlik Numarası' }
  }
  // Simulate network query to MERNİS / NVİ KPS (Nüfus ve Vatandaşlık İşleri)
  await new Promise((r) => setTimeout(r, 450))
  const record = lookupTcRecord(clean)
  if (!record) {
    return { success: false, message: 'MERNİS Nüfus Veritabanında eşleşen kayıt bulunamadı.' }
  }
  return {
    success: true,
    record: {
      ...record,
      last_mernis_sync: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    },
    message: `${record.name} (${record.role}) için güncel MERNİS nüfus verileri başarıyla çekildi.`,
  }
}

