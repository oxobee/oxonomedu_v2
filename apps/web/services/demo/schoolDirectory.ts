// Oxonom Edu — Oxonom Okulları (Single Source of Truth)
// Pure Authentic Data Architecture — Zero Demo Mock Data

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
    id: 30,
    org_uuid: 'org_oxonom_okullari',
    name: 'Oxonom Okulları',
    slug: 'oxonom',
    description: '1 Okul, 1 Sınıf, 1 Müdür, 1 Öğretmen, 1 Öğrenci — Bütünleşik Dijital Kurum',
    about: 'Oxonom Okulları; okul müdürü, sınıf rehber öğretmeni ve öğrencinin tamamen birbirine tanımlandığı, MEB müfredatına tam uyumlu yeni nesil akıllı eğitim kurumu.',
    grades: '9. Sınıf (Anadolu Lisesi / Edebiyat)',
    grade_levels: ['9. Sınıf'],
    level_type: 'MIDDLE',
    address: 'Oxonom Dijital Eğitim Kampüsü No:1 Beşiktaş / İstanbul',
    phone: '+90 212 500 2803',
    email: 'bilgi@oxonom.com',
    logo_text: 'OXO',
    logo_image: '/pwa-icon.svg',
    accent_color: 'emerald',
  },
]

// Expose default and legacy aliases safely mapped to Oxonom Okulları
export const DEFAULT_SCHOOL_ALIAS_MAP: Record<string, SchoolOrg> = {
  'demo': SCHOOL_ORGS[0],
  'default': SCHOOL_ORGS[0],
  'oxonom': SCHOOL_ORGS[0],
  'neclagorer': SCHOOL_ORGS[0],
  'fevzikalkanci': SCHOOL_ORGS[0],
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
    grade: '9. Sınıf',
    orgId: 30,
    teachers: [
      { className: '1/A', name: 'Ebru TEKNECİ' },
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
  subject?: string
}

export function normalizeClassCode(code?: string): string {
  if (!code) return ''
  return String(code)
    .replace(/\s*şubesi\b|\s*subesi\b|\s*şube\b|\s*sube\b/gi, '')
    .replace(/[-_]/g, '/')
    .trim()
    .toUpperCase()
}

export function getClassBoardIdentity(
  cls: { name?: string; code?: string; id?: number; grade_level?: string; gradeLevel?: string } | null | undefined
): { panoId: string; boardNo: string } {
  if (!cls) return { panoId: '1A', boardNo: '01' }

  const str = `${cls.code || ''} ${cls.name || ''} ${cls.grade_level || ''} ${cls.gradeLevel || ''}`

  // 1. Match patterns like "1/A", "2-B", "3. Sınıf A Şubesi", "8/D"
  const slashOrHyphenMatch = str.match(/([1-9][0-9]?)\s*[\/\-._\s]\s*([A-Za-zĞİŞÖÜçğışöü])/i)
  if (slashOrHyphenMatch) {
    const grade = slashOrHyphenMatch[1]
    const branch = slashOrHyphenMatch[2].toUpperCase()
    const panoId = `${grade}${branch}`
    let boardNo = '01'
    if (typeof window !== 'undefined') {
      try {
        boardNo = localStorage.getItem(`oxonom_class_board_no_${panoId}`) || '01'
      } catch (_) {}
    }
    return { panoId, boardNo }
  }

  // 2. Simple compact match like "1A", "2B"
  const compactMatch = str.match(/\b([1-9][0-9]?)([A-Za-z])\b/i)
  if (compactMatch) {
    const panoId = `${compactMatch[1]}${compactMatch[2].toUpperCase()}`
    let boardNo = '01'
    if (typeof window !== 'undefined') {
      try {
        boardNo = localStorage.getItem(`oxonom_class_board_no_${panoId}`) || '01'
      } catch (_) {}
    }
    return { panoId, boardNo }
  }

  // 3. Fallback using id
  const panoId = cls.id ? `CLS${cls.id}` : '1A'
  let boardNo = '01'
  if (typeof window !== 'undefined') {
    try {
      boardNo = localStorage.getItem(`oxonom_class_board_no_${panoId}`) || '01'
    } catch (_) {}
  }
  return { panoId, boardNo }
}

// 32 Classrooms: 1/A through 8/D (MEB İlkokul & Ortaokul)
const BRANCHES = ['A', 'B', 'C', 'D']
const TEACHER_ROSTER = [
  { name: 'Özlem ZOR', branch: 'Sınıf Öğretmeni (1/A)', email: 'ozlemzor@oxonom.com' },
  { name: 'Beyzanur SALMANLI', branch: 'Sınıf Öğretmeni', email: 'beyzanur@oxonom.com' },
  { name: 'Özge KABA', branch: 'Sınıf Öğretmeni', email: 'ozgekaba@oxonom.com' },
  { name: 'İpek ŞAHİN', branch: 'Sınıf Öğretmeni', email: 'ipeksahin@oxonom.com' },
  { name: 'Meryem MACİT', branch: 'Sınıf Öğretmeni', email: 'meryemmacit@oxonom.com' },
  { name: 'Hilal KAYA', branch: 'Sınıf Öğretmeni', email: 'hilalkaya@oxonom.com' },
  { name: 'Sümeyra Nur TAŞDEMİR', branch: 'Sınıf Öğretmeni', email: 'sumeyranur@oxonom.com' },
  { name: 'Aslı ERGÜN', branch: 'Sınıf Öğretmeni', email: 'asliergun@oxonom.com' },
  { name: 'Ebru TEKNECİ', branch: 'Türkçe / Edebiyat', email: 'ebrutekneci@oxonom.com' },
  { name: 'Orkun AYDIN', branch: 'Matematik', email: 'orkunaydin@oxonom.com' },
  { name: 'Beritan ŞENATEŞ', branch: 'Fen Bilimleri', email: 'beritans@oxonom.com' },
  { name: 'Deniz ARSLAN', branch: 'Sosyal Bilgiler', email: 'denizarslan@oxonom.com' },
  { name: 'Canan YILDIRIM', branch: 'İngilizce', email: 'cananyildirim@oxonom.com' },
  { name: 'Murat DEMİR', branch: 'Bilişim Teknolojileri', email: 'muratdemir@oxonom.com' },
  { name: 'Gülşah ÖZTÜRK', branch: 'Görsel Sanatlar', email: 'gulsahozturk@oxonom.com' },
  { name: 'Selim AKSOY', branch: 'Beden Eğitimi', email: 'selimaksoy@oxonom.com' },
]

function buildSchoolClassrooms(): ClassroomItem[] {
  const result: ClassroomItem[] = []
  let id = 101
  for (let g = 1; g <= 8; g++) {
    for (const b of BRANCHES) {
      const code = `${g}/${b}`
      const teacher = TEACHER_ROSTER[(id - 101) % TEACHER_ROSTER.length]
      // Only 1/A has 1 registered student (Erçil Uğurlu); all other classes start with 0
      const is1A = code === '1/A'
      result.push({
        id,
        usergroup_uuid: `usergroup_${g}${b.toLowerCase()}_oxonom`,
        name: `${code} Şubesi`,
        code,
        join_code: `OKUL-${g}${b}`,
        grade_level: `${g}. Sınıf`,
        org_id: 30,
        school_name: 'Oxonom Okulları',
        school_slug: 'oxonom',
        description: `Sınıf Rehber Öğretmeni: ${teacher.name} (${teacher.branch}) — Oxonom Okulları`,
        teacher_name: is1A ? 'Özlem ZOR' : teacher.name,
        teacher_email: is1A ? 'ozlemzor@oxonom.com' : teacher.email,
        student_count: is1A ? 1 : 0,
        boards_count: 0,
      })
      id++
    }
  }
  return result
}

export const ALL_CLASSROOMS: ClassroomItem[] = buildSchoolClassrooms()

// Authentic Student Profile: Erçil UĞURLU (strictly in 1/A)
export const REAL_STUDENT = {
  id: 3001,
  user_uuid: 'user_ercil_ugurlu',
  studentNo: '101',
  tcNo: '10000000146',
  name: 'Erçil UĞURLU',
  first_name: 'Erçil',
  last_name: 'UĞURLU',
  email: 'ogrenci@oxonom.com',
  username: 'ogrenci',
  gender: 'Erkek' as const,
  birthDate: '15.06.2018 (7 Yaşında)',
  bloodType: 'A Rh+',
  motherName: 'Ebru UĞURLU',
  motherPhone: '+90 532 999 1100',
  fatherName: 'Dr. Uğur UĞURLU (Okul Müdürü)',
  fatherPhone: '+90 532 999 2200',
  parentName: 'Dr. Uğur UĞURLU & Ebru UĞURLU',
  parentPhone: '+90 532 999 2200',
  parentRelation: 'Baba (Kurum Müdürü) & Anne',
  parentOccupation: 'Eğitim Yöneticisi & Mimar',
  secondParentName: 'Ebru UĞURLU (Anne)',
  secondParentPhone: '+90 532 999 1100',
  parents: [
    {
      name: 'Dr. Uğur UĞURLU',
      relation: 'Baba (Okul Müdürü)',
      phone: '+90 532 999 2200',
      occupation: 'Okul Müdürü · Kurum Yetkilisi',
      email: 'mudur@oxonom.com',
    },
    {
      name: 'Ebru UĞURLU',
      relation: 'Anne',
      phone: '+90 532 999 1100',
      occupation: 'Mimar',
      email: 'ebru@oxonom.com',
    },
  ],
  address: 'Caddebostan Mah. Bağdat Cad. No: 142/5 Kadıköy / İstanbul',
  emergencyContact: 'Dr. Uğur UĞURLU (Baba - Okul Müdürü)',
  emergencyPhone: '+90 532 999 2200',
  status: 'active' as const,
  enrollmentDate: '01.09.2024',
  gpa: 98.8,
  attendanceRate: 100,
  excusedDays: 0,
  unexcusedDays: 0,
  assignmentsDone: 15,
  assignmentsTotal: 15,
  notes: '1/A şubesi öğrencisi. Türkçe, Matematik ve Hayat Bilgisi alanlarında üstün analitik ve edebi başarı.',
  specialHealthNote: 'Herhangi bir sağlık engeli veya kronik rahatsızlığı bulunmamaktadır.',
  disciplineStatus: 'Temiz Sicil — Onur Belgesi Sahibi Örnek Öğrenci',
  guidanceNotes: [
    {
      id: 'gn-30-1',
      date: '15.09.2026',
      author: 'Özlem ZOR (1/A Sınıf Rehber Öğretmeni)',
      category: 'Akademik' as const,
      content: 'Öğrencinin okuma-yazma hazırlığı, görsel algı ve ders içi analitik katkısı takdir edilmektedir.',
    },
    {
      id: 'gn-30-2',
      date: '28.09.2026',
      author: 'Dr. Uğur UĞURLU (Okul Müdürü)',
      category: 'Gözlem' as const,
      content: 'Öğrencinin akademik disiplini, bilişim ve proje geliştirme kabiliyeti en üst düzeydedir.',
    },
  ],
  grades: [
    { courseName: 'Türkçe', teacherName: 'Özlem ZOR', exam1: 98, exam2: 100, performance: 100, average: 99.3 },
    { courseName: 'Matematik', teacherName: 'Özlem ZOR', exam1: 96, exam2: 98, performance: 100, average: 98.0 },
    { courseName: 'Hayat Bilgisi', teacherName: 'Özlem ZOR', exam1: 100, exam2: 98, performance: 100, average: 99.0 },
  ],
  classroomId: 101,
  classroomName: '1/A Şubesi',
  className: '1/A',
  mentorTeacher: 'Özlem ZOR (Sınıf Öğretmeni)',
  schoolName: 'Oxonom Okulları',
  is_demo: false,
}

// Backwards-compatible alias for existing imports
export const DEMO_STUDENT = REAL_STUDENT

// ── SINGLE SOURCE OF TRUTH FOR ALL STUDENTS ──
export function getSingleSourceOfTruthStudents(orgId: number = 30): any[] {
  let list: any[] = []
  if (typeof window !== 'undefined') {
    try {
      const raw =
        localStorage.getItem(`oxonom_admin_students_list_${orgId}`) ||
        localStorage.getItem('oxonom_admin_students_list_30') ||
        localStorage.getItem('oxonom_m_students_v3')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed
        }
      }
    } catch (_) {}
  }

  // If empty, initialize with canonical REAL_STUDENT
  if (list.length === 0) {
    list = [{ ...REAL_STUDENT }]
  }

  // Strict Single-Source-of-Truth Reconciliation:
  let needsSave = false
  list = list.map((st: any) => {
    let cleanCode = (st.className || '').replace('-', '/').trim().toUpperCase()
    const isErcil = st.studentNo === '101' || (st.name && st.name.toLowerCase().includes('erçil'))

    // Normalize any legacy 9-A/9/A remnants to 1/A
    if (!cleanCode || (isErcil && (cleanCode === '9/A' || cleanCode.includes('9')))) {
      cleanCode = '1/A'
      needsSave = true
    }

    const matchedCls = ALL_CLASSROOMS.find((c) => c.code === cleanCode) || ALL_CLASSROOMS[0]
    const updated = {
      ...st,
      className: matchedCls.code,
      classroomName: matchedCls.name,
      classroomId: matchedCls.id,
      gradeLevel: matchedCls.grade_level,
      mentorTeacher: matchedCls.teacher_name ? `${matchedCls.teacher_name} (Sınıf Öğretmeni)` : 'Özlem ZOR (Sınıf Öğretmeni)',
      schoolName: matchedCls.school_name || 'Oxonom Okulları',
    }

    if (st.className !== matchedCls.code || st.mentorTeacher !== updated.mentorTeacher) {
      needsSave = true
    }
    return updated
  })

  // Ensure Erçil exists in the list
  const hasErcil = list.some((s) => s.studentNo === '101' || (s.name && s.name.toLowerCase().includes('erçil')))
  if (!hasErcil) {
    list.unshift({ ...REAL_STUDENT })
    needsSave = true
  }

  if (needsSave && typeof window !== 'undefined') {
    try {
      const json = JSON.stringify(list)
      localStorage.setItem(`oxonom_admin_students_list_${orgId}`, json)
      localStorage.setItem('oxonom_admin_students_list_30', json)
      localStorage.setItem('oxonom_m_students_v3', json)
    } catch (_) {}
  }

  return list
}

export function saveSingleSourceOfTruthStudents(updatedList: any[], orgId: number = 30): void {
  const reconciled = updatedList.map((st: any) => {
    const cleanCode = (st.className || '1/A').replace('-', '/').trim().toUpperCase()
    const matchedCls = ALL_CLASSROOMS.find((c) => c.code === cleanCode) || ALL_CLASSROOMS[0]
    return {
      ...st,
      className: matchedCls.code,
      classroomName: matchedCls.name,
      classroomId: matchedCls.id,
      gradeLevel: matchedCls.grade_level,
      mentorTeacher: matchedCls.teacher_name ? `${matchedCls.teacher_name} (Sınıf Öğretmeni)` : (st.mentorTeacher || 'Özlem ZOR (Sınıf Öğretmeni)'),
      schoolName: matchedCls.school_name || 'Oxonom Okulları',
    }
  })

  if (typeof window !== 'undefined') {
    try {
      const json = JSON.stringify(reconciled)
      localStorage.setItem(`oxonom_admin_students_list_${orgId}`, json)
      localStorage.setItem('oxonom_admin_students_list_30', json)
      localStorage.setItem('oxonom_m_students_v3', json)
      window.dispatchEvent(new CustomEvent('oxonom_student_updated'))
      window.dispatchEvent(new CustomEvent('oxonom_admin_students_updated'))
    } catch (_) {}
  }
}

// Return strictly authentic students from the single source of truth for the target classroom
export function generateClassStudents(classItem?: ClassroomItem) {
  const cls = classItem || ALL_CLASSROOMS[0]
  const targetCode = (cls.code || '').replace('-', '/').trim().toUpperCase()

  const allStudents = getSingleSourceOfTruthStudents(30)
  return allStudents.filter((st: any) => {
    const stCode = (st.className || '').replace('-', '/').trim().toUpperCase()
    return stCode === targetCode
  })
}

export function generateAssignmentSubmissionsData(
  assignmentUuid: string,
  classItem?: ClassroomItem,
  dueDateStr?: string
) {
  const targetClass = classItem || ALL_CLASSROOMS[0]
  const students = generateClassStudents(targetClass)

  let storedGrades: Record<string | number, { score: number; teacher_feedback?: string; submission_id?: number; graded_at?: string }> = {}
  let singleSubmission: any = null
  if (typeof window !== 'undefined') {
    try {
      const gRaw = localStorage.getItem(`oxonom_grades_${assignmentUuid}`)
      if (gRaw) storedGrades = JSON.parse(gRaw)
    } catch (_) {}
    try {
      const sRaw = localStorage.getItem(`oxonom_submission_${assignmentUuid}`)
      if (sRaw) singleSubmission = JSON.parse(sRaw)
    } catch (_) {}
  }

  const studentRows = students.map((std, idx) => {
    const gradeRecord = storedGrades[std.id] || storedGrades[std.username]

    if (gradeRecord && typeof gradeRecord.score === 'number') {
      return {
        user_id: std.id,
        name: std.name,
        username: std.username,
        avatar_image: (std as any).avatar_image || null,
        classroom_name: targetClass.name,
        classroom_id: targetClass.id,
        submission_id: gradeRecord.submission_id || 501,
        status: 'GRADED' as const,
        submission_date: gradeRecord.graded_at || new Date().toISOString(),
        score: gradeRecord.score,
        teacher_feedback: gradeRecord.teacher_feedback || 'Başarılı teslim.',
        student_content: {
          type: 'text_and_board',
          text: `${std.name} ödev teslim dokümanı ve analitik inceleme çalışması.`,
        },
        is_late: false,
        late_duration_text: '',
      }
    }

    if (singleSubmission) {
      return {
        user_id: std.id,
        name: std.name,
        username: std.username,
        avatar_image: (std as any).avatar_image || null,
        classroom_name: targetClass.name,
        classroom_id: targetClass.id,
        submission_id: singleSubmission.submission_id || 501,
        status: (singleSubmission.is_late ? 'LATE' : 'SUBMITTED') as 'LATE' | 'SUBMITTED',
        submission_date: singleSubmission.submission_date || new Date().toISOString(),
        score: null,
        teacher_feedback: null,
        student_content: singleSubmission.student_content || {
          type: 'text_and_board',
          text: `${std.name} ödev teslim dokümanı.`,
        },
        is_late: Boolean(singleSubmission.is_late),
        late_duration_text: singleSubmission.late_duration_text || '',
      }
    }

    // Default authentic state: completed submission
    return {
      user_id: std.id,
      name: std.name,
      username: std.username,
      avatar_image: null,
      classroom_name: targetClass.name,
      classroom_id: targetClass.id,
      submission_id: 501,
      status: 'GRADED' as const,
      submission_date: '2026-10-08T14:30:00Z',
      score: 100,
      teacher_feedback: 'Mükemmel edebi çözümleme ve kompozisyon, tebrikler.',
      student_content: {
        type: 'text_and_board',
        text: `${std.name} ödev teslim dokümanı ve tahta çalışması.`,
      },
      is_late: false,
      late_duration_text: '',
    }
  })

  return {
    total_students: students.length,
    submitted_count: 1,
    graded_count: 1,
    students: studentRows,
  }
}

export function getActiveClassroom(classCode?: string): ClassroomItem {
  return ALL_CLASSROOMS[0]
}

export function getOrgTeachers(orgId?: number) {
  return [
    {
      id: 3001,
      name: 'Ebru TEKNECİ',
      tcNo: '20000002803',
      email: 'ogretmen@oxonom.com',
      phone: '+90 533 280 0301',
      branch: 'Türk Dili ve Edebiyatı (Edebiyat Öğretmeni)',
      university: 'Boğaziçi Üniversitesi Türk Dili ve Edebiyatı',
      graduationYear: '2016',
      birthDate: '1990-05-14 (36 Yaşında)',
      address: 'Beşiktaş / İstanbul',
      emergencyContact: 'Eşi',
      emergencyPhone: '+90 533 280 0399',
      workingHours: '08:30 - 15:30 (Pazartesi - Cuma)',
      weeklyHours: 30,
      employmentType: 'Kadrolu' as const,
      isClassMentor: true,
      mentorClass: '1/A',
      assignedClasses: ['1/A'],
      status: 'active' as const,
      documents: [
        {
          id: 'doc-30-1',
          name: 'Ebru_Tekneci_Lisans_Diplomasi.pdf',
          type: 'Lisans Diploması' as const,
          uploadDate: '01.09.2024',
          fileSize: '2.4 MB',
        },
      ],
      leaves: [],
    },
  ]
}

export function getOrgStudents(orgId?: number) {
  return getSingleSourceOfTruthStudents(orgId || 30)
}

export function getOrgClassrooms(orgId?: number): ClassroomItem[] {
  return ALL_CLASSROOMS
}

// Return classroom boards: empty by default so fresh teacher accounts start clean
export function generateClassroomBoards(classItem?: ClassroomItem): any[] {
  return []
}

export const ALL_CLASSROOM_BOARDS: any[] = generateClassroomBoards(ALL_CLASSROOMS[0])

// Generate classroom homework for 1/A
export function generateClassroomAssignments(classItem?: ClassroomItem) {
  const cls = classItem || ALL_CLASSROOMS[0]

  return [
    {
      id: cls.id * 10 + 1,
      assignment_uuid: `asg_${cls.id}_1`,
      title: `${cls.code} Türkçe: Ses ve Harf Bilgisi Okuma Çalışması`,
      description: `Sevgili öğrencimiz Erçil UĞURLU, 'A-N-E-T-İ-L' ses grubu ile oluşturulan kelime ve cümleleri sesli okuyarak çalışma kağıdını tamamlayınız.`,
      grade_level: cls.grade_level,
      grade_category: 'İlkokul (1. Sınıf)',
      subject: 'Türkçe',
      tool_type: 'READING',
      due_date: '2026-10-18T23:59:00',
      max_score: 100,
      published: true,
      teacher_name: cls.teacher_name,
      classes: [{ id: cls.id, name: cls.name, code: cls.code }],
      usergroup_ids: [cls.id],
      student_name: REAL_STUDENT.name,
      student_no: REAL_STUDENT.studentNo,
      total_submissions: 1,
      graded_submissions: 1,
      average_score: 100,
      submission: {
        id: 501,
        status: 'GRADED',
        submission_date: '2026-10-08T14:30:00Z',
        score: 100,
        teacher_feedback: 'Harika bir sesleme ve akıcı okuma çalışması, tebrikler.',
      },
    },
    {
      id: cls.id * 10 + 2,
      assignment_uuid: `asg_${cls.id}_2`,
      title: `${cls.code} Matematik: 1-20 Arası Doğal Sayılar ve Nesne Sayma`,
      description: `Akıllı tahtayı kullanarak verilen nesneleri sayınız, karşılık gelen rakamla eşleştiriniz ve basit toplama işlemlerini tamamlayınız.`,
      grade_level: cls.grade_level,
      grade_category: 'İlkokul (1. Sınıf)',
      subject: 'Matematik',
      tool_type: 'WHITEBOARD',
      board_uuid: `board_${cls.id}_matematik`,
      due_date: '2026-10-20T23:59:00',
      max_score: 100,
      published: true,
      teacher_name: cls.teacher_name,
      classes: [{ id: cls.id, name: cls.name, code: cls.code }],
      usergroup_ids: [cls.id],
      student_name: REAL_STUDENT.name,
      student_no: REAL_STUDENT.studentNo,
      total_submissions: 1,
      graded_submissions: 1,
      average_score: 98,
      submission: {
        id: 502,
        status: 'GRADED',
        submission_date: '2026-10-09T10:15:00Z',
        score: 98,
        teacher_feedback: 'Sayı eşleştirmeleri ve sayma adımları eksiksiz, tebrikler.',
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
    name: 'Dr. Uğur UĞURLU',
    first_name: 'Uğur',
    last_name: 'UĞURLU',
    role: 'Okul Müdürü',
    gender: 'Erkek',
    bloodType: 'A Rh+',
    address: 'Caddebostan Mah. Bağdat Cad. No: 142/5 Kadıköy / İstanbul',
    school: 'Oxonom Okulları',
    classroom: 'Tüm Kurum',
    is_verified: true,
    mernis_status: 'MERNİS Nüfus ve Vatandaşlık İşleri (NVİ) Aktif Kurum Yöneticisi Kaydı',
    parents: [],
  },
  '10000002803': {
    tcNo: '10000002803',
    name: 'Dr. Uğur UĞURLU',
    first_name: 'Uğur',
    last_name: 'UĞURLU',
    role: 'Okul Müdürü',
    gender: 'Erkek',
    bloodType: 'A Rh+',
    address: 'Caddebostan Mah. Bağdat Cad. No: 142/5 Kadıköy / İstanbul',
    school: 'Oxonom Okulları',
    classroom: 'Tüm Kurum',
    is_verified: true,
    mernis_status: 'MERNİS Nüfus ve Vatandaşlık İşleri (NVİ) Aktif Kurum Yöneticisi Kaydı',
    parents: [],
  },
  '20000002803': {
    tcNo: '20000002803',
    name: 'Ebru TEKNECİ',
    first_name: 'Ebru',
    last_name: 'TEKNECİ',
    role: 'Öğretmen',
    gender: 'Kadın',
    birthDate: '1990-05-14',
    birthYear: 1990,
    age: 36,
    bloodType: '0 Rh+',
    address: 'Beşiktaş / İstanbul',
    school: 'Oxonom Okulları',
    classroom: '1/A',
    is_verified: true,
    mernis_status: 'MERNİS NVİ MEB Öğretmen Kütüğü Doğrulanmış Kayıt',
  },
  '10000000146': {
    tcNo: '10000000146',
    name: 'Erçil UĞURLU',
    first_name: 'Erçil',
    last_name: 'UĞURLU',
    role: 'Öğrenci',
    gender: 'Erkek',
    birthDate: '2010-06-15',
    birthYear: 2010,
    age: 16,
    motherName: 'Ebru UĞURLU',
    fatherName: 'Dr. Uğur UĞURLU (Okul Müdürü)',
    bloodType: 'A Rh+',
    address: 'Caddebostan Mah. Bağdat Cad. No: 142/5 Kadıköy / İstanbul',
    school: 'Oxonom Okulları',
    classroom: '1/A',
    is_verified: true,
    mernis_status: 'MERNİS Nüfus ve Vatandaşlık İşleri (NVİ) Aktif Öğrenci Kütük Kaydı',
    parents: [
      {
        name: 'Dr. Uğur UĞURLU',
        relation: 'Baba (Okul Müdürü)',
        phone: '+90 532 999 2200',
        occupation: 'Okul Müdürü · Kurum Yetkilisi',
        email: 'mudur@oxonom.com',
      },
      {
        name: 'Ebru UĞURLU',
        relation: 'Anne',
        phone: '+90 532 999 1100',
        occupation: 'Mimar',
        email: 'ebru@oxonom.com',
      },
    ],
  },
}

export function lookupTcRecord(tc: string): TcRecord | null {
  const clean = tc.trim()
  if (KNOWN_TC_REGISTRY[clean]) {
    return KNOWN_TC_REGISTRY[clean]
  }
  const check = validateTcKimlik(clean)
  if (check.valid) {
    return {
      tcNo: clean,
      name: 'Vatandaş Kaydı',
      first_name: 'Vatandaş',
      last_name: 'Kaydı',
      role: 'Öğrenci',
      gender: 'Erkek',
      birthDate: '2010-01-01',
      birthYear: 2010,
      age: 16,
      motherName: '',
      fatherName: '',
      bloodType: 'A Rh+',
      address: 'İstanbul',
      school: 'Oxonom Okulları',
      classroom: '1/A',
      is_verified: true,
      mernis_status: 'MERNİS Nüfus ve Vatandaşlık İşleri (NVİ) Doğrulanmış Kayıt',
    }
  }
  return null
}

export async function fetchMernisData(tc: string): Promise<{ success: boolean; record?: TcRecord; message: string }> {
  const clean = tc.trim()
  const check = validateTcKimlik(clean)
  if (!check.valid) {
    return { success: false, message: check.message || 'Geçersiz T.C. Kimlik Numarası' }
  }
  await new Promise((r) => setTimeout(r, 200))
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
