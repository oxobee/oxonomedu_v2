'use client'
import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import { useOrg } from '@components/Contexts/OrgContext'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { getAPIUrl } from '@services/config/config'
import { apiFetch, asArray } from '@services/utils/ts/requests'
import toast from 'react-hot-toast'
import {
  Student,
  Users,
  MagnifyingGlass,
  Plus,
  ArrowsLeftRight,
  PauseCircle,
  PlayCircle,
  Eye,
  GraduationCap,
  Phone,
  EnvelopeSimple,
  Calendar,
  CheckCircle,
  WarningCircle,
  X,
  FileText,
  MapPin,
  Heartbeat,
  ShieldCheck,
  Trophy,
  Books,
  NotePencil,
  Clock,
  Sparkle,
  PlusCircle,
  User,
  CalendarCheck,
} from '@phosphor-icons/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import ToolTip from '@components/Objects/StyledElements/Tooltip/Tooltip'
import { searchMatchesAny } from '@/lib/search/normalize'
import {
  generateClassStudents,
  validateTcKimlik,
  lookupTcRecord,
  ALL_CLASSROOMS,
  DEMO_STUDENT,
} from '@services/demo/schoolDirectory'

export interface GuidanceNote {
  id: string
  date: string
  author: string
  category: 'Akademik' | 'Davranış' | 'Rehberlik Görüşmesi' | 'Veli Görüşmesi' | 'Sağlık'
  content: string
}

export interface CourseGrade {
  courseName: string
  teacherName: string
  exam1: number
  exam2: number
  performance: number
  average: number
}

export interface ParentContact {
  id?: string
  name: string
  relation: string
  phone: string
  occupation?: string
  email?: string
}

export interface StudentRecord {
  id: number
  studentNo: string
  tcNo: string
  name: string
  email: string
  gender: 'Kız' | 'Erkek'
  birthDate: string
  bloodType: string
  address: string
  classroomId: number
  classroomName: string
  mentorTeacher: string
  status: 'active' | 'frozen' | 'graduated'
  freezeReason?: string
  freezeDate?: string
  parentName: string
  parentPhone: string
  parentRelation: string
  parentOccupation: string
  secondParentName?: string
  secondParentPhone?: string
  parents?: ParentContact[]
  emergencyContact: string
  emergencyPhone: string
  enrollmentDate: string
  gpa: number
  attendanceRate: number
  excusedDays: number
  unexcusedDays: number
  assignmentsDone: number
  assignmentsTotal: number
  notes: string // Genel idari not
  specialHealthNote?: string
  disciplineStatus: string
  guidanceNotes: GuidanceNote[]
  grades: CourseGrade[]
}

const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: 101,
    studentNo: '2026-101',
    tcNo: '10928374652',
    name: 'Ali Yılmaz',
    email: 'ali.yilmaz@okul.com',
    gender: 'Erkek',
    birthDate: '14.03.2010 (16 Yaşında)',
    bloodType: 'A Rh+',
    address: 'Atatürk Mah. Karanfil Cad. No:14/5 Çankaya / Ankara',
    classroomId: 1,
    classroomName: '9-A',
    mentorTeacher: 'Ahmet Hakan (Matematik)',
    status: 'active',
    parentName: 'Mehmet Yılmaz',
    parentPhone: '+90 532 111 2233',
    parentRelation: 'Baba',
    parentOccupation: 'İnşaat Mühendisi',
    secondParentName: 'Ayşe Yılmaz (Anne - Öğretmen)',
    secondParentPhone: '+90 532 999 1122',
    emergencyContact: 'Mehmet Yılmaz (Baba)',
    emergencyPhone: '+90 532 111 2233',
    enrollmentDate: '15.09.2025',
    gpa: 89.4,
    attendanceRate: 96,
    excusedDays: 2,
    unexcusedDays: 1,
    assignmentsDone: 19,
    assignmentsTotal: 20,
    notes: 'Matematik ve Fen derslerinde başarılı. Okul basketbol takımı kaptanı.',
    specialHealthNote: 'Polen ve toz alerjisi mevcuttur. Beden eğitimi dersinde inhaler sprey taşımasına izin verilmiştir.',
    disciplineStatus: 'Temiz Sicil - Herhangi bir disiplin işlemi bulunmamaktadır. Onur Kurulu Takdir Belgesi mevcuttur.',
    guidanceNotes: [
      {
        id: 'gn-1',
        date: '24.09.2026',
        author: 'Psk. Dan. Fatma Yıldız',
        category: 'Rehberlik Görüşmesi',
        content: 'YKS / LGS sonrası uyum süreci değerlendirildi. Çalışma planı oluşturuldu, motivasyonu gayet yüksek.',
      },
      {
        id: 'gn-2',
        date: '18.09.2026',
        author: 'Ahmet Hakan (Sınıf Rehber Öğretmeni)',
        category: 'Akademik',
        content: 'Matematik olimpiyatları hazırlık grubuna davet edildi. Aile bilgilendirildi ve onay alındı.',
      },
      {
        id: 'gn-3',
        date: '10.09.2026',
        author: 'Psk. Dan. Fatma Yıldız',
        category: 'Veli Görüşmesi',
        content: 'Velisi Mehmet Bey ile görüşüldü; ders dışı spor faaliyetleri ile akademik program dengelendi.',
      },
    ],
    grades: [
      { courseName: 'Matematik', teacherName: 'Ahmet Hakan', exam1: 88, exam2: 92, performance: 95, average: 91.6 },
      { courseName: 'Fizik', teacherName: 'Hakan Çetin', exam1: 82, exam2: 86, performance: 90, average: 86.0 },
      { courseName: 'Türk Dili ve Edebiyatı', teacherName: 'Selin Yıldız', exam1: 90, exam2: 94, performance: 95, average: 93.0 },
      { courseName: 'İngilizce', teacherName: 'Ayşe Doğan', exam1: 95, exam2: 98, performance: 100, average: 97.6 },
      { courseName: 'Biyoloji', teacherName: 'Kemal Arslan', exam1: 80, exam2: 78, performance: 85, average: 81.0 },
    ],
  },
  {
    id: 102,
    studentNo: '2026-102',
    tcNo: '28475619283',
    name: 'Zeynep Kaya',
    email: 'zeynep.kaya@okul.com',
    gender: 'Kız',
    birthDate: '22.07.2010 (16 Yaşında)',
    bloodType: '0 Rh+',
    address: 'Kavaklıdere Mah. Tunalı Hilmi Cad. No:88/12 Çankaya / Ankara',
    classroomId: 1,
    classroomName: '9-A',
    mentorTeacher: 'Ahmet Hakan (Matematik)',
    status: 'active',
    parentName: 'Fatma Kaya',
    parentPhone: '+90 533 222 3344',
    parentRelation: 'Anne',
    parentOccupation: 'Doktor',
    secondParentName: 'Ali Kaya (Baba - Avukat)',
    secondParentPhone: '+90 533 111 4455',
    emergencyContact: 'Fatma Kaya (Anne)',
    emergencyPhone: '+90 533 222 3344',
    enrollmentDate: '15.09.2025',
    gpa: 94.8,
    attendanceRate: 98,
    excusedDays: 1,
    unexcusedDays: 0,
    assignmentsDone: 20,
    assignmentsTotal: 20,
    notes: 'Sınıf başkanı, münazara kulübü üyesi. Akademik performansı çok yüksek.',
    specialHealthNote: 'Bilinen herhangi bir kronik sağlık sorunu veya alerjisi yoktur.',
    disciplineStatus: 'Temiz Sicil - Üstün Başarı ve İftihar Belgesi sahibidir.',
    guidanceNotes: [
      {
        id: 'gn-4',
        date: '26.09.2026',
        author: 'Psk. Dan. Fatma Yıldız',
        category: 'Akademik',
        content: 'Münazara yarışması il elemeleri hazırlık süreci takip ediliyor. Zaman yönetiminde oldukça başarılı.',
      },
    ],
    grades: [
      { courseName: 'Matematik', teacherName: 'Ahmet Hakan', exam1: 95, exam2: 96, performance: 100, average: 97.0 },
      { courseName: 'Fizik', teacherName: 'Hakan Çetin', exam1: 92, exam2: 90, performance: 95, average: 92.3 },
      { courseName: 'Türk Dili ve Edebiyatı', teacherName: 'Selin Yıldız', exam1: 98, exam2: 96, performance: 100, average: 98.0 },
      { courseName: 'İngilizce', teacherName: 'Ayşe Doğan', exam1: 96, exam2: 98, performance: 100, average: 98.0 },
      { courseName: 'Biyoloji', teacherName: 'Kemal Arslan', exam1: 89, exam2: 92, performance: 95, average: 92.0 },
    ],
  },
  {
    id: 103,
    studentNo: '2026-103',
    tcNo: '39485726154',
    name: 'Can Demir',
    email: 'can.demir@okul.com',
    gender: 'Erkek',
    birthDate: '05.11.2010 (15 Yaşında)',
    bloodType: 'B Rh+',
    address: 'Yıldız Mah. Turan Güneş Blv. No:20/4 Çankaya / Ankara',
    classroomId: 2,
    classroomName: '9-B',
    mentorTeacher: 'Selin Yıldız (Türkçe)',
    status: 'active',
    parentName: 'Ahmet Demir',
    parentPhone: '+90 534 333 4455',
    parentRelation: 'Baba',
    parentOccupation: 'Yazılım Mimarı',
    secondParentName: 'Banu Demir (Anne)',
    secondParentPhone: '+90 534 999 0011',
    emergencyContact: 'Ahmet Demir (Baba)',
    emergencyPhone: '+90 534 333 4455',
    enrollmentDate: '16.09.2025',
    gpa: 87.2,
    attendanceRate: 92,
    excusedDays: 3,
    unexcusedDays: 1,
    assignmentsDone: 18,
    assignmentsTotal: 20,
    notes: 'TÜBİTAK yazılım ve robotik projesinde görev alıyor. Kodlama kabiliyeti ileri düzeyde.',
    specialHealthNote: 'Göz kusuru (Miyop) bulunmaktadır. Ön sıralarda oturması tavsiye edilir.',
    disciplineStatus: 'Temiz Sicil - Disiplin cezası bulunmamaktadır.',
    guidanceNotes: [
      {
        id: 'gn-5',
        date: '20.09.2026',
        author: 'Selin Yıldız',
        category: 'Rehberlik Görüşmesi',
        content: 'Robotik kulübü yarışma takvimi ile ders saatleri koordine edildi.',
      },
    ],
    grades: [
      { courseName: 'Matematik', teacherName: 'Ahmet Hakan', exam1: 84, exam2: 88, performance: 90, average: 87.3 },
      { courseName: 'Fizik', teacherName: 'Hakan Çetin', exam1: 90, exam2: 92, performance: 95, average: 92.3 },
      { courseName: 'Türk Dili ve Edebiyatı', teacherName: 'Selin Yıldız', exam1: 80, exam2: 82, performance: 85, average: 82.3 },
      { courseName: 'İngilizce', teacherName: 'Ayşe Doğan', exam1: 92, exam2: 94, performance: 95, average: 93.6 },
      { courseName: 'Biyoloji', teacherName: 'Kemal Arslan', exam1: 78, exam2: 82, performance: 85, average: 81.6 },
    ],
  },
  {
    id: 104,
    studentNo: '2026-104',
    tcNo: '48392019482',
    name: 'Elif Şahin',
    email: 'elif.sahin@okul.com',
    gender: 'Kız',
    birthDate: '12.01.2009 (17 Yaşında)',
    bloodType: 'AB Rh+',
    address: 'Ümitköy Mah. 2432. Cad. No:11/2 Etimesgut / Ankara',
    classroomId: 3,
    classroomName: '10-A',
    mentorTeacher: 'Hakan Çetin (Fizik)',
    status: 'frozen',
    parentName: 'Selin Şahin',
    parentPhone: '+90 535 444 5566',
    parentRelation: 'Anne',
    parentOccupation: 'Öğretim Görevlisi',
    secondParentName: 'Rıza Şahin (Baba)',
    secondParentPhone: '+90 535 777 8899',
    emergencyContact: 'Selin Şahin (Anne)',
    emergencyPhone: '+90 535 444 5566',
    enrollmentDate: '10.09.2024',
    gpa: 82.5,
    attendanceRate: 75,
    excusedDays: 14,
    unexcusedDays: 2,
    assignmentsDone: 10,
    assignmentsTotal: 20,
    notes: 'Sağlık mazereti (ortopedik cerrahi) sebebiyle 1. dönem kaydı dondurulmuştur.',
    specialHealthNote: 'Fizik tedavi süreci devam etmektedir. Okul içi merdiven kullanımında refakat önerilir.',
    disciplineStatus: 'Temiz Sicil - Herhangi bir disiplin kaydı yoktur.',
    guidanceNotes: [
      {
        id: 'gn-6',
        date: '15.09.2026',
        author: 'Psk. Dan. Fatma Yıldız',
        category: 'Sağlık',
        content: 'Resmi heyet raporu idareye teslim edildi. 1. dönem dondurma işlemi okul yönetim kurulu kararıyla onaylandı.',
      },
    ],
    grades: [
      { courseName: 'Matematik', teacherName: 'Ahmet Hakan', exam1: 80, exam2: 82, performance: 85, average: 82.3 },
      { courseName: 'Fizik', teacherName: 'Hakan Çetin', exam1: 85, exam2: 80, performance: 85, average: 83.3 },
      { courseName: 'Türk Dili ve Edebiyatı', teacherName: 'Selin Yıldız', exam1: 85, exam2: 85, performance: 90, average: 86.6 },
      { courseName: 'İngilizce', teacherName: 'Ayşe Doğan', exam1: 90, exam2: 92, performance: 95, average: 92.3 },
      { courseName: 'Biyoloji', teacherName: 'Kemal Arslan', exam1: 75, exam2: 78, performance: 80, average: 77.6 },
    ],
  },
  {
    id: 105,
    studentNo: '2026-105',
    tcNo: '59483726150',
    name: 'Merve Çelik (Demo Öğrenci)',
    email: 'ogrenci@oxonom.com',
    gender: 'Kız',
    birthDate: '18.09.2010 (16 Yaşında)',
    bloodType: 'A Rh-',
    address: 'Çayyolu Mah. Park Cad. No:50/8 Çankaya / Ankara',
    classroomId: 1,
    classroomName: '9-A',
    mentorTeacher: 'Ahmet Hakan (Matematik)',
    status: 'active',
    parentName: 'Murat Çelik',
    parentPhone: '+90 537 666 7788',
    parentRelation: 'Baba',
    parentOccupation: 'Finans Yöneticisi',
    secondParentName: 'Gül Çelik (Anne - Eczacı)',
    secondParentPhone: '+90 537 111 9900',
    emergencyContact: 'Murat Çelik (Baba)',
    emergencyPhone: '+90 537 666 7788',
    enrollmentDate: '01.09.2025',
    gpa: 92.5,
    attendanceRate: 100,
    excusedDays: 0,
    unexcusedDays: 0,
    assignmentsDone: 20,
    assignmentsTotal: 20,
    notes: 'Demo Öğrenci Hesabı - Tüm eğitim modüllerinde tam yetki ve aktif katılım.',
    specialHealthNote: 'Sağlık durumu gayet iyi, herhangi bir alerjik durumu yoktur.',
    disciplineStatus: 'Temiz Sicil - Örnek Öğrenci Teşekkür Belgesi.',
    guidanceNotes: [
      {
        id: 'gn-7',
        date: '28.09.2026',
        author: 'Psk. Dan. Fatma Yıldız',
        category: 'Rehberlik Görüşmesi',
        content: 'Demo öğrenci profili kapsamlı test edildi. Dijital panolar ve veli forumu etkileşimi mükemmel.',
      },
      {
        id: 'gn-8',
        date: '22.09.2026',
        author: 'Ahmet Hakan',
        category: 'Veli Görüşmesi',
        content: 'Veli toplantısında öğrencinin sınıf içi liderlik yetenekleri paylaşıldı.',
      },
    ],
    grades: [
      { courseName: 'Matematik', teacherName: 'Ahmet Hakan', exam1: 90, exam2: 95, performance: 95, average: 93.3 },
      { courseName: 'Fizik', teacherName: 'Hakan Çetin', exam1: 88, exam2: 90, performance: 95, average: 91.0 },
      { courseName: 'Türk Dili ve Edebiyatı', teacherName: 'Selin Yıldız', exam1: 94, exam2: 96, performance: 100, average: 96.6 },
      { courseName: 'İngilizce', teacherName: 'Ayşe Doğan', exam1: 96, exam2: 98, performance: 100, average: 98.0 },
      { courseName: 'Biyoloji', teacherName: 'Kemal Arslan', exam1: 85, exam2: 88, performance: 90, average: 87.6 },
    ],
  },
]

export default function StudentsClient({ orgslug }: { orgslug: string }) {
  const org = useOrg() as any
  const session = useLHSession() as any
  const token = session?.data?.tokens?.access_token

  // Fetch real classrooms from backend
  const { data: rawClasses = [] } = useQuery({
    queryKey: queryKeys.usergroups.list(org?.id),
    queryFn: () => apiFetch(`${getAPIUrl()}usergroups/org/${org.id}?org_id=${org.id}`, token),
    select: (res: any) => asArray<any>(res),
    enabled: !!org?.id && !!token,
    staleTime: 30_000,
  })

  const [students, setStudents] = useState<StudentRecord[]>(() => {
    const targetOrgId = org?.id || 30
    const schoolClasses = ALL_CLASSROOMS.filter((c) => c.org_id === targetOrgId)
    return (schoolClasses.length > 0
      ? schoolClasses.flatMap((cls) => generateClassStudents(cls))
      : generateClassStudents(ALL_CLASSROOMS[0])) as StudentRecord[]
  })
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'frozen'>('all')
  const [search, setSearch] = useState('')

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null)
  const [selectedStudentForTransfer, setSelectedStudentForTransfer] = useState<StudentRecord | null>(null)
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<StudentRecord | null>(null)
  const [detailTab, setDetailTab] = useState<'kimlik' | 'akademik' | 'devamsizlik' | 'rehberlik'>('kimlik')

  // Comprehensive Student Form (Used for both Add and Edit)
  // Comprehensive Student Form (Used for both Add and Edit)
  const DEFAULT_STUDENT_FORM = {
    name: '',
    tcNo: '',
    studentNo: '',
    classroomId: '',
    gender: 'Kız' as 'Kız' | 'Erkek',
    birthDate: '',
    bloodType: 'A Rh+',
    email: '',
    parentName: '',
    parentRelation: 'Anne',
    parentPhone: '',
    parentOccupation: '',
    secondParentName: '',
    secondParentPhone: '',
    parents: [
      { name: '', relation: 'Anne', phone: '', occupation: '', email: '' },
    ] as ParentContact[],
    emergencyContact: '',
    emergencyPhone: '',
    address: '',
    specialHealthNote: '',
    initialGuidanceNote: '',
  }

  const [studentForm, setStudentForm] = useState(DEFAULT_STUDENT_FORM)

  // Freeze Modal State
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false)
  const [selectedStudentForFreeze, setSelectedStudentForFreeze] = useState<StudentRecord | null>(null)
  const [freezeCategory, setFreezeCategory] = useState('Sağlık Mazereti / Heyet Raporu')
  const [freezeDetail, setFreezeDetail] = useState('')
  const [freezeDuration, setFreezeDuration] = useState('1 Dönem')

  // Transfer Form State
  const [targetClassId, setTargetClassId] = useState<string>('')

  // New Guidance Note State inside detail modal
  const [newNoteCategory, setNewNoteCategory] = useState<GuidanceNote['category']>('Rehberlik Görüşmesi')
  const [newNoteAuthor, setNewNoteAuthor] = useState('Okul Yönetimi')
  const [newNoteContent, setNewNoteContent] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)

  // Strictly sync available classes with rawClasses (no mock/ghost classes)
  const availableClasses = useMemo(() => {
    if (rawClasses.length > 0) {
      return rawClasses.map((c: any) => ({ id: c.id, name: c.name }))
    }
    return []
  }, [rawClasses])

  // Synchronize students with real availableClasses and persist to localStorage
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const targetOrgId = org?.id || 30
    const schoolClasses = ALL_CLASSROOMS.filter((c) => c.org_id === targetOrgId)
    const defaultRoster = (schoolClasses.length > 0
      ? schoolClasses.flatMap((cls) => generateClassStudents(cls))
      : generateClassStudents(ALL_CLASSROOMS[0])) as StudentRecord[]

    const key = `oxonom_students_${targetOrgId}`
    const saved = localStorage.getItem(key)
    let currentList: StudentRecord[] = saved ? JSON.parse(saved) : defaultRoster

    // If saved list had outdated mock students (e.g. Merve Çelik or old high school 9-A), reset to Erçil Evren UĞURLU and class students
    if (currentList.length > 0 && (currentList[0].name.includes('Merve') || currentList[0].name.includes('Ali Yılmaz') || currentList[0].classroomName?.includes('9-A'))) {
      currentList = defaultRoster
    }

    if (rawClasses.length > 0) {
      const realClassMap = new Map(rawClasses.map((c: any) => [c.id, c.name]))
      const firstClass = rawClasses[0]

      currentList = currentList.map((st, idx) => {
        const existsByName = rawClasses.find((c: any) => c.name === st.classroomName)
        if (existsByName) {
          return { ...st, classroomId: existsByName.id, classroomName: existsByName.name }
        }
        if (realClassMap.has(st.classroomId)) {
          return { ...st, classroomName: realClassMap.get(st.classroomId)! }
        }
        const fallbackClass = rawClasses[idx % rawClasses.length] || firstClass
        return {
          ...st,
          classroomId: fallbackClass.id,
          classroomName: fallbackClass.name,
        }
      })
    }
    setStudents(currentList)
  }, [rawClasses, org?.id, orgslug])

  const saveStudentsList = (updated: StudentRecord[]) => {
    setStudents(updated)
    if (typeof window !== 'undefined') {
      const targetOrgId = org?.id || 30
      const key = `oxonom_students_${targetOrgId}`
      localStorage.setItem(key, JSON.stringify(updated))
    }
  }

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const searchTerms: Array<unknown> = [
        s.name,
        s.studentNo,
        s.email,
        s.classroomName,
        s.mentorTeacher,
        s.parentName,
        s.parentPhone,
        s.tcNo,
        s.secondParentName,
        s.secondParentPhone,
        s.emergencyContact,
        s.emergencyPhone,
      ]
      if (Array.isArray(s.parents)) {
        s.parents.forEach((p) => {
          if (p) {
            searchTerms.push(p.name, p.phone, p.relation, p.email, p.occupation)
          }
        })
      }

      const matchesSearch = !search.trim() || searchMatchesAny(searchTerms, search)
      const matchesClass =
        selectedClassFilter === 'all' || s.classroomName === selectedClassFilter
      const matchesStatus =
        statusFilter === 'all' || s.status === statusFilter
      return matchesSearch && matchesClass && matchesStatus
    })
  }, [students, search, selectedClassFilter, statusFilter])

  // Multi-Parent Helpers
  const handleAddParentField = () => {
    setStudentForm((prev) => ({
      ...prev,
      parents: [
        ...(prev.parents || []),
        { name: '', relation: 'Baba', phone: '', occupation: '', email: '' },
      ],
    }))
  }

  const handleRemoveParentField = (index: number) => {
    setStudentForm((prev) => {
      const nextParents = (prev.parents || []).filter((_, i) => i !== index)
      return {
        ...prev,
        parents: nextParents.length > 0 ? nextParents : [{ name: '', relation: 'Anne', phone: '', occupation: '', email: '' }],
      }
    })
  }

  const handleParentFieldChange = (index: number, field: keyof ParentContact, value: string) => {
    setStudentForm((prev) => {
      const nextParents = [...(prev.parents || [])]
      nextParents[index] = { ...nextParents[index], [field]: value }
      return {
        ...prev,
        parents: nextParents,
        ...(index === 0 && field === 'name' ? { parentName: value } : {}),
        ...(index === 0 && field === 'phone' ? { parentPhone: value } : {}),
        ...(index === 0 && field === 'relation' ? { parentRelation: value } : {}),
        ...(index === 0 && field === 'occupation' ? { parentOccupation: value } : {}),
        ...(index === 1 && field === 'name' ? { secondParentName: value } : {}),
        ...(index === 1 && field === 'phone' ? { secondParentPhone: value } : {}),
      }
    })
  }

  const handleToggleFreeze = (student: StudentRecord) => {
    if (student.status === 'active') {
      setSelectedStudentForFreeze(student)
      setFreezeCategory('Sağlık Mazereti / Heyet Raporu')
      setFreezeDetail('')
      setFreezeDuration('1 Dönem')
      setIsFreezeModalOpen(true)
    } else {
      if (window.confirm(`${student.name} öğrencisinin dondurulmuş kaydını tekrar aktif hale getirmek istediğinize emin misiniz?`)) {
        const updated = students.map((s) => {
          if (s.id === student.id) {
            const unfreezeNote: GuidanceNote = {
              id: `gn-${Date.now()}`,
              date: new Date().toLocaleDateString('tr-TR'),
              author: 'Okul Yönetimi',
              category: 'Akademik',
              content: 'Kayıt Yeniden Aktifleştirildi: Öğrencinin dondurulma süresi sona erdi ve eğitime devamı onaylandı.',
            }
            return {
              ...s,
              status: 'active' as const,
              freezeReason: undefined,
              freezeDate: undefined,
              guidanceNotes: [unfreezeNote, ...(s.guidanceNotes || [])],
            }
          }
          return s
        })
        saveStudentsList(updated)
        if (selectedStudentForDetail && selectedStudentForDetail.id === student.id) {
          setSelectedStudentForDetail(updated.find((s) => s.id === student.id) || null)
        }
        toast.success(`${student.name} öğrencisinin kaydı tekrar aktif edildi.`)
      }
    }
  }

  const handleConfirmFreeze = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudentForFreeze) return
    const fullReason = `${freezeCategory}: ${freezeDetail.trim() || 'Gerekçe belirtilmedi'} (${freezeDuration})`
    const freezeDateStr = new Date().toLocaleDateString('tr-TR')

    const freezeNote: GuidanceNote = {
      id: `gn-${Date.now()}`,
      date: freezeDateStr,
      author: 'Okul Yönetim Kurulu',
      category: 'Sağlık',
      content: `Kayıt Dondurma Kararı: ${fullReason}`,
    }

    const updated = students.map((s) => {
      if (s.id === selectedStudentForFreeze.id) {
        return {
          ...s,
          status: 'frozen' as const,
          freezeReason: fullReason,
          freezeDate: freezeDateStr,
          guidanceNotes: [freezeNote, ...(s.guidanceNotes || [])],
        }
      }
      return s
    })

    saveStudentsList(updated)
    if (selectedStudentForDetail && selectedStudentForDetail.id === selectedStudentForFreeze.id) {
      setSelectedStudentForDetail(updated.find((s) => s.id === selectedStudentForFreeze.id) || null)
    }
    toast.success(`${selectedStudentForFreeze.name} öğrencisinin kaydı donduruldu.`)
    setIsFreezeModalOpen(false)
    setSelectedStudentForFreeze(null)
  }

  const handleTransfer = () => {
    if (!selectedStudentForTransfer || !targetClassId) return
    const targetClass = availableClasses.find((c: any) => String(c.id) === String(targetClassId))
    if (!targetClass) return

    const updated = students.map((s) =>
      s.id === selectedStudentForTransfer.id
        ? { ...s, classroomId: targetClass.id, classroomName: targetClass.name }
        : s
    )
    saveStudentsList(updated)
    if (selectedStudentForDetail && selectedStudentForDetail.id === selectedStudentForTransfer.id) {
      setSelectedStudentForDetail((prev) => prev ? { ...prev, classroomId: targetClass.id, classroomName: targetClass.name } : null)
    }
    toast.success(`${selectedStudentForTransfer.name} başarıyla ${targetClass.name} sınıfına aktarıldı.`)
    setSelectedStudentForTransfer(null)
    setTargetClassId('')
  }

  // Open Add Student Modal
  const openAddModal = () => {
    setStudentForm({
      ...DEFAULT_STUDENT_FORM,
      studentNo: `2026-${Math.floor(100 + Math.random() * 900)}`,
      tcNo: `${Math.floor(10000000000 + Math.random() * 90000000000)}`,
      classroomId: availableClasses[0] ? String(availableClasses[0].id) : '',
      parents: [
        { name: '', relation: 'Anne', phone: '', occupation: '', email: '' },
      ],
    })
    setIsAddOpen(true)
  }

  // Open Edit Student Modal
  const openEditModal = (student: StudentRecord) => {
    setEditingStudent(student)
    const existingParents: ParentContact[] = student.parents && student.parents.length > 0
      ? student.parents
      : [
          {
            name: student.parentName || '',
            relation: student.parentRelation || 'Anne',
            phone: student.parentPhone || '',
            occupation: student.parentOccupation || '',
          },
          ...(student.secondParentName ? [{
            name: student.secondParentName,
            relation: 'Baba',
            phone: student.secondParentPhone || '',
            occupation: '',
          }] : []),
        ]

    setStudentForm({
      name: student.name || '',
      tcNo: student.tcNo || '',
      studentNo: student.studentNo || '',
      classroomId: String(student.classroomId || ''),
      gender: student.gender || 'Kız',
      birthDate: student.birthDate || '',
      bloodType: student.bloodType || 'A Rh+',
      email: student.email || '',
      parentName: student.parentName || '',
      parentRelation: student.parentRelation || 'Anne',
      parentPhone: student.parentPhone || '',
      parentOccupation: student.parentOccupation || '',
      secondParentName: student.secondParentName || '',
      secondParentPhone: student.secondParentPhone || '',
      parents: existingParents,
      emergencyContact: student.emergencyContact || '',
      emergencyPhone: student.emergencyPhone || '',
      address: student.address || '',
      specialHealthNote: student.specialHealthNote || '',
      initialGuidanceNote: '',
    })
    setIsEditOpen(true)
  }

  // Save Add Student
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentForm.name.trim() || !studentForm.classroomId) {
      toast.error('Lütfen öğrenci adı ve sınıfını seçiniz.')
      return
    }

    const targetClass = availableClasses.find((c: any) => String(c.id) === String(studentForm.classroomId))
    const primaryParent = studentForm.parents[0] || { name: '', relation: 'Veli', phone: '', occupation: '' }
    const secondParent = studentForm.parents[1]

    const newStudent: StudentRecord = {
      id: Date.now(),
      studentNo: studentForm.studentNo.trim() || `2026-${Math.floor(100 + Math.random() * 900)}`,
      tcNo: studentForm.tcNo.trim() || `${Math.floor(10000000000 + Math.random() * 90000000000)}`,
      name: studentForm.name.trim(),
      email: studentForm.email.trim() || `${studentForm.name.toLowerCase().replace(/\s+/g, '.')}@okul.com`,
      gender: studentForm.gender,
      birthDate: studentForm.birthDate.trim() || '2010 (16 Yaşında)',
      bloodType: studentForm.bloodType || 'A Rh+',
      address: studentForm.address.trim() || 'Adres bilgisi girilmedi',
      classroomId: targetClass?.id || (availableClasses[0]?.id || 1),
      classroomName: targetClass?.name || (availableClasses[0]?.name || 'Sınıf'),
      mentorTeacher: 'Atanmadı',
      status: 'active',
      parentName: primaryParent.name.trim() || studentForm.parentName.trim() || 'Veli Bilgisi Girilmedi',
      parentPhone: primaryParent.phone.trim() || studentForm.parentPhone.trim() || '—',
      parentRelation: primaryParent.relation || studentForm.parentRelation || 'Veli',
      parentOccupation: primaryParent.occupation?.trim() || studentForm.parentOccupation.trim() || 'Belirtilmedi',
      secondParentName: secondParent?.name.trim() || studentForm.secondParentName.trim() || undefined,
      secondParentPhone: secondParent?.phone.trim() || studentForm.secondParentPhone.trim() || undefined,
      parents: studentForm.parents,
      emergencyContact: studentForm.emergencyContact.trim() || primaryParent.name.trim() || 'Veli',
      emergencyPhone: studentForm.emergencyPhone.trim() || primaryParent.phone.trim() || '—',
      enrollmentDate: new Date().toLocaleDateString('tr-TR'),
      gpa: 85.0,
      attendanceRate: 100,
      excusedDays: 0,
      unexcusedDays: 0,
      assignmentsDone: 0,
      assignmentsTotal: 0,
      notes: 'Yeni kayıt yapıldı.',
      specialHealthNote: studentForm.specialHealthNote.trim() || undefined,
      disciplineStatus: 'Temiz Sicil',
      guidanceNotes: [
        {
          id: `gn-${Date.now()}`,
          date: new Date().toLocaleDateString('tr-TR'),
          author: 'Okul Yönetimi',
          category: 'Akademik',
          content: studentForm.initialGuidanceNote.trim() || 'Öğrencinin yeni okul kaydı başarıyla oluşturuldu ve şubesine atandı.',
        },
      ],
      grades: [],
    }

    const updated = [newStudent, ...students]
    saveStudentsList(updated)
    toast.success(`${newStudent.name} başarıyla ${newStudent.classroomName} sınıfına kaydedildi.`)
    setIsAddOpen(false)
    setStudentForm(DEFAULT_STUDENT_FORM)
  }

  // Save Edit Student
  const handleSaveEditStudent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStudent) return
    if (!studentForm.name.trim()) {
      toast.error('Lütfen öğrenci adını giriniz.')
      return
    }

    const targetClass = availableClasses.find((c: any) => String(c.id) === String(studentForm.classroomId))
    const primaryParent = studentForm.parents[0] || { name: '', relation: 'Veli', phone: '', occupation: '' }
    const secondParent = studentForm.parents[1]

    const updated: StudentRecord = {
      ...editingStudent,
      name: studentForm.name.trim(),
      tcNo: studentForm.tcNo.trim() || editingStudent.tcNo,
      studentNo: studentForm.studentNo.trim() || editingStudent.studentNo,
      email: studentForm.email.trim() || editingStudent.email,
      gender: studentForm.gender,
      birthDate: studentForm.birthDate.trim() || editingStudent.birthDate,
      bloodType: studentForm.bloodType,
      address: studentForm.address.trim() || editingStudent.address,
      classroomId: targetClass ? targetClass.id : editingStudent.classroomId,
      classroomName: targetClass ? targetClass.name : editingStudent.classroomName,
      parentName: primaryParent.name.trim() || studentForm.parentName.trim() || editingStudent.parentName,
      parentPhone: primaryParent.phone.trim() || studentForm.parentPhone.trim() || editingStudent.parentPhone,
      parentRelation: primaryParent.relation || studentForm.parentRelation || editingStudent.parentRelation,
      parentOccupation: primaryParent.occupation?.trim() || studentForm.parentOccupation.trim() || editingStudent.parentOccupation,
      secondParentName: secondParent?.name.trim() || studentForm.secondParentName.trim() || undefined,
      secondParentPhone: secondParent?.phone.trim() || studentForm.secondParentPhone.trim() || undefined,
      parents: studentForm.parents,
      emergencyContact: studentForm.emergencyContact.trim() || editingStudent.emergencyContact,
      emergencyPhone: studentForm.emergencyPhone.trim() || editingStudent.emergencyPhone,
      specialHealthNote: studentForm.specialHealthNote.trim() || undefined,
    }

    const nextList = students.map((s) => (s.id === updated.id ? updated : s))
    saveStudentsList(nextList)
    if (selectedStudentForDetail && selectedStudentForDetail.id === updated.id) {
      setSelectedStudentForDetail(updated)
    }
    toast.success(`${updated.name} öğrencisinin bilgileri güncellendi.`)
    setIsEditOpen(false)
    setEditingStudent(null)
  }

  // Add new guidance note to student
  const handleSaveGuidanceNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudentForDetail || !newNoteContent.trim()) {
      toast.error('Lütfen not içeriğini yazınız.')
      return
    }

    const newNote: GuidanceNote = {
      id: `gn-${Date.now()}`,
      date: new Date().toLocaleDateString('tr-TR'),
      author: newNoteAuthor.trim() || 'Okul İdaresi',
      category: newNoteCategory,
      content: newNoteContent.trim(),
    }

    const updatedStudent = {
      ...selectedStudentForDetail,
      guidanceNotes: [newNote, ...selectedStudentForDetail.guidanceNotes],
    }

    setStudents((prev) =>
      prev.map((s) => (s.id === selectedStudentForDetail.id ? updatedStudent : s))
    )
    setSelectedStudentForDetail(updatedStudent)
    setNewNoteContent('')
    setIsAddingNote(false)
    toast.success('Rehberlik & idari not başarıyla eklendi.')
  }

  return (
    <div className="h-full w-full bg-[#f8f8f8]">
      <div className="px-4 sm:px-10 pt-8 pb-16 max-w-[1600px] mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Student size={22} weight="duotone" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Öğrenci İşleri & Sınıf Dağılımı</h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Öğrencileri şubelerine göre listeleyin, nakil/sınıf değişikliği yapın, kayıt dondurma ve kapsamlı öğrenci dosyalarını yönetin.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <Plus size={16} weight="bold" />
            <span>Yeni Öğrenci Kaydet</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Sınıf Seçici Butonları */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedClassFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                selectedClassFilter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tüm Sınıflar ({students.length})
            </button>
            {availableClasses.map((cls: any) => {
              const count = students.filter((s) => s.classroomName === cls.name).length
              return (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClassFilter(cls.name)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                    selectedClassFilter === cls.name
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cls.name} ({count})
                </button>
              )
            })}
          </div>

          {/* Search & Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Yalnızca Aktifler</option>
              <option value="frozen">Dondurulmuş Kayıtlar</option>
            </select>

            <div className="relative w-full sm:w-72">
              <MagnifyingGlass className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Öğrenci no, ad, T.C., veli, telefon ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs ps-9 pe-8 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute end-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200/60 transition-colors"
                  title="Aramayı Temizle"
                >
                  <X size={13} weight="bold" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Student Table */}
        <div className="bg-white rounded-2xl border border-gray-100 nice-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Öğrenci</th>
                  <th className="px-5 py-3.5">No / T.C.</th>
                  <th className="px-5 py-3.5">Sınıf & Rehber</th>
                  <th className="px-5 py-3.5">Durum</th>
                  <th className="px-5 py-3.5" title="Öğrencinin Genel Not Ortalaması (GNO) ve Ders Devam Durumu">Akademik / Devam</th>
                  <th className="px-5 py-3.5">Veli İletişim</th>
                  <th className="px-5 py-3.5 text-end">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                      Arama kriterlerine uygun öğrenci kaydı bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-neutral-50/60 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{student.name}</div>
                            <div className="text-[11px] text-gray-400">{student.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* No / TC */}
                      <td className="px-5 py-3.5">
                        <div className="font-mono font-bold text-gray-800">{student.studentNo}</div>
                        <div className="text-[10px] text-gray-400 font-mono">TC: {student.tcNo}</div>
                      </td>

                      {/* Sınıf & Rehber */}
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                          {student.classroomName}
                        </span>
                        <div className="text-[10px] text-gray-400 mt-1 truncate max-w-[120px]">
                          {student.mentorTeacher}
                        </div>
                      </td>

                      {/* Durum */}
                      <td className="px-5 py-3.5">
                        {student.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <CheckCircle size={12} weight="fill" />
                            Aktif
                          </span>
                        ) : (
                          <div className="flex flex-col items-start gap-0.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              <PauseCircle size={12} weight="fill" />
                              Donduruldu
                            </span>
                            {student.freezeReason && (
                              <span className="text-[10px] text-amber-600 font-medium truncate max-w-[130px]" title={student.freezeReason}>
                                {student.freezeReason}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Akademik / Devam */}
                      <td className="px-5 py-3.5">
                        <ToolTip
                          side="top"
                          content={
                            <div className="py-1 px-1.5 max-w-[240px] text-left">
                              <div className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                                <Trophy size={14} className="text-amber-500" />
                                <span>Genel Not Ortalaması (GNO)</span>
                              </div>
                              <p className="text-[11px] text-gray-600 mt-1 leading-snug">
                                Öğrencinin tüm derslerdeki 100 üzerinden ağırlıklı başarı puanı ortalamasıdır.
                              </p>
                            </div>
                          }
                        >
                          <div
                            className="font-bold text-gray-900 inline-flex items-center gap-1 cursor-help group/gno"
                            title="Genel Not Ortalaması (GNO): Öğrencinin tüm derslerdeki 100 üzerinden ağırlıklı başarı notu ortalaması"
                          >
                            <Trophy size={13} className="text-amber-500 group-hover/gno:scale-110 transition-transform" />
                            <span className="border-b border-dotted border-gray-400 group-hover/gno:border-indigo-600 group-hover/gno:text-indigo-600 transition-colors">
                              GNO: {student.gpa}
                            </span>
                          </div>
                        </ToolTip>
                        <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                          Devam: %{student.attendanceRate}
                        </div>
                      </td>

                      {/* Veli */}
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-gray-800">{student.parentName}</div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Phone size={11} />
                          <span>{student.parentPhone}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-end">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Sınıf Değiştir */}
                          <button
                            onClick={() => {
                              setSelectedStudentForTransfer(student)
                              setTargetClassId(String(student.classroomId))
                            }}
                            title="Sınıfını Değiştir"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <ArrowsLeftRight size={16} weight="bold" />
                          </button>

                          {/* Dondur / Aktif Et */}
                          <button
                            onClick={() => handleToggleFreeze(student)}
                            title={student.status === 'active' ? 'Kaydı Dondur' : 'Kaydı Aktif Et'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              student.status === 'active'
                                ? 'text-gray-500 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-amber-600 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {student.status === 'active' ? (
                              <PauseCircle size={16} weight="bold" />
                            ) : (
                              <PlayCircle size={16} weight="bold" />
                            )}
                          </button>

                          {/* Düzenle */}
                          <button
                            onClick={() => openEditModal(student)}
                            title="Öğrenci Bilgilerini Düzenle"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          >
                            <NotePencil size={16} weight="bold" />
                          </button>

                          {/* Detay */}
                          <button
                            onClick={() => {
                              setSelectedStudentForDetail(student)
                              setDetailTab('kimlik')
                            }}
                            title="Detaylı Öğrenci Profili"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-semibold transition-colors"
                          >
                            <Eye size={14} weight="bold" />
                            <span>Profil</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 1. Modal: Yeni Öğrenci Kaydı (Kapsamlı) */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl space-y-6">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Student size={22} weight="duotone" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Yeni Öğrenci Kaydı
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 mt-0.5">
                  Öğrenci kimlik, veli iletişimi, sınıf ve sağlık bilgilerini eksiksiz olarak tanımlayın.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleAddStudent} className="space-y-5">
            {/* Kart 1: Öğrenci & Kimlik Bilgileri */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 uppercase tracking-wider">
                <User size={15} className="text-emerald-600" />
                <span>Öğrenci & Kimlik Bilgileri</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Öğrenci Adı Soyadı *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Mehmet Can Demir"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">T.C. Kimlik No *</label>
                  <input
                    type="text"
                    maxLength={11}
                    required
                    placeholder="11 haneli T.C."
                    value={studentForm.tcNo}
                    onChange={(e) => setStudentForm({ ...studentForm, tcNo: e.target.value.replace(/\D/g, '') })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Okul Numarası</label>
                  <input
                    type="text"
                    placeholder="Örn: 2026-105"
                    value={studentForm.studentNo}
                    onChange={(e) => setStudentForm({ ...studentForm, studentNo: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Sınıf / Şube *</label>
                  <select
                    required
                    value={studentForm.classroomId}
                    onChange={(e) => setStudentForm({ ...studentForm, classroomId: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    <option value="">Sınıf Seçiniz</option>
                    {availableClasses.map((cls: any) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Cinsiyet</label>
                  <select
                    value={studentForm.gender}
                    onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value as 'Kız' | 'Erkek' })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    <option value="Kız">Kız</option>
                    <option value="Erkek">Erkek</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Doğum Tarihi</label>
                  <input
                    type="text"
                    placeholder="Örn: 15.03.2010"
                    value={studentForm.birthDate}
                    onChange={(e) => setStudentForm({ ...studentForm, birthDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Kan Grubu</label>
                  <select
                    value={studentForm.bloodType}
                    onChange={(e) => setStudentForm({ ...studentForm, bloodType: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    {['A Rh+', 'B Rh+', 'AB Rh+', '0 Rh+', 'A Rh-', 'B Rh-', 'AB Rh-', '0 Rh-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Öğrenci E-posta Adresi</label>
                  <input
                    type="email"
                    placeholder="ogrenci@okul.com"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Kart 2: Veli & Aile İletişim Bilgileri (Birden Fazla Veli Desteği) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 uppercase tracking-wider">
                  <Phone size={15} className="text-emerald-600" />
                  <span>Veli & Aile İletişim Bilgileri</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddParentField}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus size={13} weight="bold" />
                  <span>+ Başka Bir Veli Ekle</span>
                </button>
              </div>

              {studentForm.parents.map((parent, pIdx) => (
                <div key={pIdx} className="p-3.5 rounded-xl bg-white border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center">
                        {pIdx + 1}
                      </span>
                      <span>{pIdx === 0 ? '1. Derece Veli' : `${pIdx + 1}. Veli`}</span>
                      <span className="text-[11px] font-normal text-gray-500">({parent.relation || 'Veli'})</span>
                    </span>
                    {studentForm.parents.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveParentField(pIdx)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline cursor-pointer"
                      >
                        Kaldır
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-gray-700 block mb-1">Veli Adı Soyadı *</label>
                      <input
                        type="text"
                        required={pIdx === 0}
                        placeholder="Örn: Ayşe Demir"
                        value={parent.name}
                        onChange={(e) => handleParentFieldChange(pIdx, 'name', e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-gray-700 block mb-1">Yakınlık Derecesi</label>
                      <select
                        value={parent.relation}
                        onChange={(e) => handleParentFieldChange(pIdx, 'relation', e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      >
                        <option value="Anne">Anne</option>
                        <option value="Baba">Baba</option>
                        <option value="Vasi">Vasi</option>
                        <option value="Büyükanne / Dede">Büyükanne / Dede</option>
                        <option value="Abla / Ağabey">Abla / Ağabey</option>
                        <option value="Diğer">Diğer</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-gray-700 block mb-1">Telefon Numarası *</label>
                      <input
                        type="tel"
                        required={pIdx === 0}
                        placeholder="+90 5XX XXX XX XX"
                        value={parent.phone}
                        onChange={(e) => handleParentFieldChange(pIdx, 'phone', e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-gray-700 block mb-1">Mesleği</label>
                      <input
                        type="text"
                        placeholder="Örn: Mimar, Öğretmen..."
                        value={parent.occupation || ''}
                        onChange={(e) => handleParentFieldChange(pIdx, 'occupation', e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-gray-700 block mb-1">E-posta (Opsiyonel)</label>
                      <input
                        type="email"
                        placeholder="veli@example.com"
                        value={parent.email || ''}
                        onChange={(e) => handleParentFieldChange(pIdx, 'email', e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Acil Durum & Adres */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Acil Durum Kişisi</label>
                  <input
                    type="text"
                    placeholder="Örn: Teyzesi (Fatma Yılmaz)"
                    value={studentForm.emergencyContact}
                    onChange={(e) => setStudentForm({ ...studentForm, emergencyContact: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Acil Durum Telefonu</label>
                  <input
                    type="tel"
                    placeholder="+90 5XX XXX XX XX"
                    value={studentForm.emergencyPhone}
                    onChange={(e) => setStudentForm({ ...studentForm, emergencyPhone: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">İkametgâh & Ev Adresi</label>
                  <input
                    type="text"
                    placeholder="Mahalle, Cadde, No, İlçe / İl"
                    value={studentForm.address}
                    onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Kart 3: Sağlık & Başlangıç Rehberlik Notu */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 uppercase tracking-wider">
                <Heartbeat size={15} className="text-red-500" />
                <span>Özel Sağlık Bilgisi & Giriş Notu</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Varsa Kronik Durum / Alerji veya Özel Not</label>
                  <input
                    type="text"
                    placeholder="Örn: Fıstık alerjisi var, gözlük kullanıyor vb."
                    value={studentForm.specialHealthNote}
                    onChange={(e) => setStudentForm({ ...studentForm, specialHealthNote: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">İlk Rehberlik / İdari Giriş Notu (Opsiyonel)</label>
                  <textarea
                    rows={2}
                    placeholder="Öğrencinin kayıt esnasındaki görüşme veya intibak notu..."
                    value={studentForm.initialGuidanceNote}
                    onChange={(e) => setStudentForm({ ...studentForm, initialGuidanceNote: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-5 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
              >
                Öğrenciyi Kaydet
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 1.5 Modal: Öğrenci Bilgilerini Düzenle */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl space-y-6">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <NotePencil size={22} weight="duotone" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Öğrenci Bilgilerini Düzenle
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 mt-0.5">
                  {editingStudent?.name} ({editingStudent?.studentNo}) öğrencisinin tüm idari ve veli bilgilerini güncelleyin.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveEditStudent} className="space-y-5">
            {/* Kart 1: Öğrenci & Kimlik Bilgileri */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 uppercase tracking-wider">
                <User size={15} className="text-indigo-600" />
                <span>Öğrenci & Kimlik Bilgileri</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Öğrenci Adı Soyadı *</label>
                  <input
                    type="text"
                    required
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">T.C. Kimlik No</label>
                  <input
                    type="text"
                    maxLength={11}
                    value={studentForm.tcNo}
                    onChange={(e) => setStudentForm({ ...studentForm, tcNo: e.target.value.replace(/\D/g, '') })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Okul Numarası</label>
                  <input
                    type="text"
                    value={studentForm.studentNo}
                    onChange={(e) => setStudentForm({ ...studentForm, studentNo: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Sınıf / Şube</label>
                  <select
                    value={studentForm.classroomId}
                    onChange={(e) => setStudentForm({ ...studentForm, classroomId: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    {availableClasses.map((cls: any) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Cinsiyet</label>
                  <select
                    value={studentForm.gender}
                    onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value as 'Kız' | 'Erkek' })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="Kız">Kız</option>
                    <option value="Erkek">Erkek</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Doğum Tarihi</label>
                  <input
                    type="text"
                    value={studentForm.birthDate}
                    onChange={(e) => setStudentForm({ ...studentForm, birthDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Kan Grubu</label>
                  <select
                    value={studentForm.bloodType}
                    onChange={(e) => setStudentForm({ ...studentForm, bloodType: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    {['A Rh+', 'B Rh+', 'AB Rh+', '0 Rh+', 'A Rh-', 'B Rh-', 'AB Rh-', '0 Rh-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Öğrenci E-posta Adresi</label>
                  <input
                    type="email"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Kart 2: Veli & Aile İletişim Bilgileri (Birden Fazla Veli Desteği) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 uppercase tracking-wider">
                  <Phone size={15} className="text-indigo-600" />
                  <span>Veli & Aile İletişim Bilgileri</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddParentField}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus size={13} weight="bold" />
                  <span>+ Başka Bir Veli Ekle</span>
                </button>
              </div>

              {studentForm.parents.map((parent, pIdx) => (
                <div key={pIdx} className="p-3.5 rounded-xl bg-white border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-black flex items-center justify-center">
                        {pIdx + 1}
                      </span>
                      <span>{pIdx === 0 ? '1. Derece Veli' : `${pIdx + 1}. Veli`}</span>
                      <span className="text-[11px] font-normal text-gray-500">({parent.relation || 'Veli'})</span>
                    </span>
                    {studentForm.parents.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveParentField(pIdx)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline cursor-pointer"
                      >
                        Kaldır
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-gray-700 block mb-1">Veli Adı Soyadı *</label>
                      <input
                        type="text"
                        required={pIdx === 0}
                        placeholder="Örn: Ayşe Demir"
                        value={parent.name}
                        onChange={(e) => handleParentFieldChange(pIdx, 'name', e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-gray-700 block mb-1">Yakınlık Derecesi</label>
                      <select
                        value={parent.relation}
                        onChange={(e) => handleParentFieldChange(pIdx, 'relation', e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      >
                        <option value="Anne">Anne</option>
                        <option value="Baba">Baba</option>
                        <option value="Vasi">Vasi</option>
                        <option value="Büyükanne / Dede">Büyükanne / Dede</option>
                        <option value="Abla / Ağabey">Abla / Ağabey</option>
                        <option value="Diğer">Diğer</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-gray-700 block mb-1">Telefon Numarası *</label>
                      <input
                        type="tel"
                        required={pIdx === 0}
                        placeholder="+90 5XX XXX XX XX"
                        value={parent.phone}
                        onChange={(e) => handleParentFieldChange(pIdx, 'phone', e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-gray-700 block mb-1">Mesleği</label>
                      <input
                        type="text"
                        placeholder="Örn: Mimar, Öğretmen..."
                        value={parent.occupation || ''}
                        onChange={(e) => handleParentFieldChange(pIdx, 'occupation', e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-gray-700 block mb-1">E-posta (Opsiyonel)</label>
                      <input
                        type="email"
                        placeholder="veli@example.com"
                        value={parent.email || ''}
                        onChange={(e) => handleParentFieldChange(pIdx, 'email', e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Acil Durum & Adres */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Acil Durum Kişisi</label>
                  <input
                    type="text"
                    placeholder="Örn: Teyzesi (Fatma Yılmaz)"
                    value={studentForm.emergencyContact}
                    onChange={(e) => setStudentForm({ ...studentForm, emergencyContact: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Acil Durum Telefonu</label>
                  <input
                    type="tel"
                    placeholder="+90 5XX XXX XX XX"
                    value={studentForm.emergencyPhone}
                    onChange={(e) => setStudentForm({ ...studentForm, emergencyPhone: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">İkametgâh & Ev Adresi</label>
                  <input
                    type="text"
                    placeholder="Mahalle, Cadde, No, İlçe / İl"
                    value={studentForm.address}
                    onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Kart 3: Sağlık Bilgisi */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 uppercase tracking-wider">
                <Heartbeat size={15} className="text-red-500" />
                <span>Özel Sağlık & Alerji Notu</span>
              </div>
              <input
                type="text"
                placeholder="Örn: Fıstık alerjisi var, gözlük kullanıyor vb."
                value={studentForm.specialHealthNote}
                onChange={(e) => setStudentForm({ ...studentForm, specialHealthNote: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <DialogFooter className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="px-5 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
              >
                Değişiklikleri Kaydet
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Modal: Sınıf Değiştir / Şube Nakli */}
      <Dialog
        open={!!selectedStudentForTransfer}
        onOpenChange={(open) => !open && setSelectedStudentForTransfer(null)}
      >
        <DialogContent className="max-w-md p-6 sm:p-8 rounded-3xl space-y-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowsLeftRight size={20} className="text-indigo-600" />
              <span>Sınıf Değiştir / Şube Nakli</span>
            </DialogTitle>
            <DialogDescription>
              {selectedStudentForTransfer?.name} öğrencisinin yeni sınıfını belirleyin.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
              <span className="text-gray-400">Mevcut Sınıf: </span>
              <span className="font-bold text-gray-900">{selectedStudentForTransfer?.classroomName}</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Yeni Şube Seçiniz *</label>
              <select
                value={targetClassId}
                onChange={(e) => setTargetClassId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Hedef Şube Seçin</option>
                {availableClasses.map((cls: any) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setSelectedStudentForTransfer(null)}
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleTransfer}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
            >
              Şubeyi Değiştir
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Modal: KAPSAMLI OXONOM EDU ÖĞRENCİ DETAY DOSYASI (DOSSIER) */}
      <Dialog
        open={!!selectedStudentForDetail}
        onOpenChange={(open) => !open && setSelectedStudentForDetail(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl space-y-6">
          {selectedStudentForDetail && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-gray-900 via-neutral-900 to-gray-800 text-white nice-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white font-bold text-2xl flex items-center justify-center shrink-0 shadow-lg">
                    {selectedStudentForDetail.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold text-white">{selectedStudentForDetail.name}</h2>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                        {selectedStudentForDetail.classroomName} Şubesi
                      </span>
                      {selectedStudentForDetail.status === 'active' ? (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Aktif Öğrenci
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Kayıt Donduruldu
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white/70 mt-1 flex items-center gap-3 flex-wrap">
                      <span>No: <strong className="text-white font-mono">{selectedStudentForDetail.studentNo}</strong></span>
                      <span>TC: <strong className="text-white font-mono">{selectedStudentForDetail.tcNo}</strong></span>
                      <span>Sınıf Rehber Öğretmeni: <strong className="text-white">{selectedStudentForDetail.mentorTeacher}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEditModal(selectedStudentForDetail)}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <NotePencil size={15} weight="bold" />
                    <span>Bilgileri Düzenle</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStudentForTransfer(selectedStudentForDetail)
                      setTargetClassId(String(selectedStudentForDetail.classroomId))
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <ArrowsLeftRight size={14} weight="bold" />
                    <span>Şube Nakli</span>
                  </button>
                  <button
                    onClick={() => handleToggleFreeze(selectedStudentForDetail)}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    {selectedStudentForDetail.status === 'active' ? (
                      <>
                        <PauseCircle size={14} weight="bold" />
                        <span>Dondur</span>
                      </>
                    ) : (
                      <>
                        <PlayCircle size={14} weight="bold" />
                        <span>Aktif Et</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Dondurulmuş Kayıt Uyarı Kartı */}
              {selectedStudentForDetail.status === 'frozen' && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900">
                  <PauseCircle size={20} weight="fill" className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1 text-xs">
                    <div className="font-bold flex items-center gap-2">
                      <span>Öğrencinin Kaydı Dondurulmuştur</span>
                      {selectedStudentForDetail.freezeDate && (
                        <span className="text-[11px] font-normal text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                          İşlem Tarihi: {selectedStudentForDetail.freezeDate}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-amber-800">
                      <strong>Dondurma Gerekçesi / Mazeret:</strong>{' '}
                      {selectedStudentForDetail.freezeReason || 'Sağlık / İdari Mazeret'}
                    </p>
                  </div>
                </div>
              )}

              {/* 4 KPI Metric Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div 
                  className="bg-white rounded-xl p-3.5 border border-gray-100 nice-shadow"
                  title="Genel Not Ortalaması (GNO): Öğrencinin tüm derslerdeki 100 üzerinden ağırlıklı başarı puanı ortalaması"
                >
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
                    <Trophy size={14} className="text-amber-500" />
                    <span>Genel Not Ortalaması (GNO)</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900 mt-1">{selectedStudentForDetail.gpa} / 100</div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Takdir Belgesi Adayı</div>
                </div>

                <div className="bg-white rounded-xl p-3.5 border border-gray-100 nice-shadow">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
                    <CalendarCheck size={14} className="text-emerald-500" />
                    <span>Devam Oranı</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900 mt-1">%{selectedStudentForDetail.attendanceRate}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {selectedStudentForDetail.excusedDays} gün özürlü, {selectedStudentForDetail.unexcusedDays} gün özürsüz
                  </div>
                </div>

                <div className="bg-white rounded-xl p-3.5 border border-gray-100 nice-shadow">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
                    <FileText size={14} className="text-indigo-500" />
                    <span>Ödev Teslimleri</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900 mt-1">
                    {selectedStudentForDetail.assignmentsDone} / {selectedStudentForDetail.assignmentsTotal}
                  </div>
                  <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">
                    %{Math.round((selectedStudentForDetail.assignmentsDone / (selectedStudentForDetail.assignmentsTotal || 1)) * 100)} Tamamlama
                  </div>
                </div>

                <div className="bg-white rounded-xl p-3.5 border border-gray-100 nice-shadow">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
                    <ShieldCheck size={14} className="text-blue-500" />
                    <span>Disiplin Durumu</span>
                  </div>
                  <div className="text-sm font-bold text-emerald-700 mt-1 truncate">Temiz Sicil</div>
                  <div className="text-[10px] text-gray-400 mt-0.5 truncate">0 İhtar / 0 Ceza</div>
                </div>
              </div>

              {/* Tabs navigation */}
              <div className="flex items-center gap-1 border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setDetailTab('kimlik')}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                    detailTab === 'kimlik'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <User size={15} />
                  <span>Kimlik & Veli Bilgileri</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetailTab('akademik')}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                    detailTab === 'akademik'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Books size={15} />
                  <span>Dersler & Notlar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetailTab('devamsizlik')}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                    detailTab === 'devamsizlik'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Calendar size={15} />
                  <span>Devamsızlık Çizelgesi</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetailTab('rehberlik')}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 relative ${
                    detailTab === 'rehberlik'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <NotePencil size={15} />
                  <span>Rehberlik & İdari Notlar</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ml-1" />
                </button>
              </div>

              {/* Tab 1: Kimlik & Veli Bilgileri */}
              {detailTab === 'kimlik' && (
                <div className="space-y-4 text-xs">
                  {/* Öğrenci Kişisel Bilgileri */}
                  <div className="bg-white rounded-xl p-4 border border-gray-100 nice-shadow space-y-3">
                    <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                      <User size={16} className="text-gray-600" />
                      <span>Kişisel Bilgiler & Kayıt Detayları</span>
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-gray-700">
                      <div>
                        <span className="text-gray-400 block text-[11px]">T.C. Kimlik No</span>
                        <span className="font-mono font-semibold">{selectedStudentForDetail.tcNo}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Doğum Tarihi</span>
                        <span className="font-semibold">{selectedStudentForDetail.birthDate}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Cinsiyet</span>
                        <span className="font-semibold">{selectedStudentForDetail.gender}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Kan Grubu</span>
                        <span className="font-bold text-red-600">{selectedStudentForDetail.bloodType}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Okul Numarası</span>
                        <span className="font-mono font-bold">{selectedStudentForDetail.studentNo}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Kayıt Tarihi</span>
                        <span className="font-semibold">{selectedStudentForDetail.enrollmentDate}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Şube Danışmanı</span>
                        <span className="font-semibold">{selectedStudentForDetail.mentorTeacher}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">E-posta Adresi</span>
                        <span className="font-semibold truncate">{selectedStudentForDetail.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Veli Bilgileri (Birden Fazla Veli Listesi) */}
                  <div className="bg-white rounded-xl p-4 border border-gray-100 nice-shadow space-y-3">
                    <h4 className="font-bold text-sm text-gray-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Phone size={16} className="text-emerald-600" />
                        <span>Kayıtlı Veli & Aile İletişim Bilgileri</span>
                      </span>
                      <span className="text-[11px] font-normal text-gray-400">
                        {(selectedStudentForDetail.parents && selectedStudentForDetail.parents.length > 0)
                          ? `${selectedStudentForDetail.parents.length} Veli Kayıtlı`
                          : '1. ve 2. Derece'}
                      </span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
                      {selectedStudentForDetail.parents && selectedStudentForDetail.parents.length > 0 ? (
                        selectedStudentForDetail.parents.map((p, pIdx) => (
                          <div key={pIdx} className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 space-y-1">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center">
                                  {pIdx + 1}
                                </span>
                                <span>{pIdx === 0 ? '1. Derece Veli' : `${pIdx + 1}. Veli`}</span>
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-700">
                                {p.relation || 'Veli'}
                              </span>
                            </div>
                            <div><strong>Ad Soyad:</strong> {p.name || 'Belirtilmedi'}</div>
                            <div className="flex items-center gap-1.5">
                              <strong>Telefon:</strong>
                              <a href={`tel:${p.phone}`} className="text-emerald-700 font-semibold hover:underline flex items-center gap-1">
                                {p.phone || '—'}
                              </a>
                            </div>
                            {p.occupation && <div><strong>Meslek:</strong> {p.occupation}</div>}
                            {p.email && <div><strong>E-posta:</strong> {p.email}</div>}
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 space-y-1">
                            <span className="text-xs font-bold text-gray-900 block mb-1">1. Derece Veli ({selectedStudentForDetail.parentRelation})</span>
                            <div><strong>Ad Soyad:</strong> {selectedStudentForDetail.parentName}</div>
                            <div><strong>Telefon:</strong> {selectedStudentForDetail.parentPhone}</div>
                            <div><strong>Meslek:</strong> {selectedStudentForDetail.parentOccupation}</div>
                          </div>

                          <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 space-y-1">
                            <span className="text-xs font-bold text-gray-900 block mb-1">2. Derece İletişim / Diğer Veli</span>
                            <div><strong>Ad Soyad:</strong> {selectedStudentForDetail.secondParentName || 'Kayıtlı Değil'}</div>
                            <div><strong>Telefon:</strong> {selectedStudentForDetail.secondParentPhone || '—'}</div>
                            <div><strong>Acil Durum Kişisi:</strong> {selectedStudentForDetail.emergencyContact} ({selectedStudentForDetail.emergencyPhone})</div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-gray-800">
                        <MapPin size={14} className="text-gray-400 shrink-0" />
                        <span><strong>Adres:</strong> {selectedStudentForDetail.address}</span>
                      </div>
                      <div className="text-gray-500">
                        Acil Durum: <strong className="text-gray-800">{selectedStudentForDetail.emergencyContact}</strong> ({selectedStudentForDetail.emergencyPhone})
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Dersler & Notlar */}
              {detailTab === 'akademik' && (
                <div className="space-y-4 text-xs">
                  <div className="bg-white rounded-xl border border-gray-100 nice-shadow overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase">
                        <tr>
                          <th className="px-4 py-3">Ders</th>
                          <th className="px-4 py-3">Branş Öğretmeni</th>
                          <th className="px-4 py-3 text-center">1. Yazılı</th>
                          <th className="px-4 py-3 text-center">2. Yazılı</th>
                          <th className="px-4 py-3 text-center">Performans</th>
                          <th className="px-4 py-3 text-end">Dönem Notu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {selectedStudentForDetail.grades.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                              Henüz girilmiş sınav notu bulunmuyor.
                            </td>
                          </tr>
                        ) : (
                          selectedStudentForDetail.grades.map((g, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-bold text-gray-900">{g.courseName}</td>
                              <td className="px-4 py-3 text-gray-500">{g.teacherName}</td>
                              <td className="px-4 py-3 text-center font-mono">{g.exam1}</td>
                              <td className="px-4 py-3 text-center font-mono">{g.exam2}</td>
                              <td className="px-4 py-3 text-center font-mono">{g.performance}</td>
                              <td className="px-4 py-3 text-end font-bold text-emerald-700 font-mono text-sm">
                                {g.average}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 3: Devamsızlık Çizelgesi */}
              {detailTab === 'devamsizlik' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-gray-400 block text-[11px]">Özürsüz Devamsızlık</span>
                      <div className="text-2xl font-bold text-gray-900 mt-1">{selectedStudentForDetail.unexcusedDays} Gün</div>
                      <span className="text-[10px] text-gray-500">Yasal hak: 10 gün</span>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-gray-400 block text-[11px]">Özürlü (Raporlu/İzinli)</span>
                      <div className="text-2xl font-bold text-gray-900 mt-1">{selectedStudentForDetail.excusedDays} Gün</div>
                      <span className="text-[10px] text-gray-500">Yasal hak: 20 gün</span>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                      <span className="text-emerald-700 font-semibold block text-[11px]">Toplam Katılım</span>
                      <div className="text-2xl font-bold text-emerald-800 mt-1">%{selectedStudentForDetail.attendanceRate}</div>
                      <span className="text-[10px] text-emerald-700">Devam durumu mükemmel</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-gray-100 space-y-2">
                    <h4 className="font-bold text-sm text-gray-900">Son Yoklama Hareketleri</h4>
                    <div className="space-y-2 text-gray-600">
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50">
                        <span className="font-medium">28 Eylül 2026 — Tüm Gün</span>
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle size={14} weight="fill" /> Derste Mevcut
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50">
                        <span className="font-medium">27 Eylül 2026 — Tüm Gün</span>
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle size={14} weight="fill" /> Derste Mevcut
                        </span>
                      </div>
                      {selectedStudentForDetail.excusedDays > 0 && (
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50">
                          <span className="font-medium">15 Eylül 2026 — Sağlık Raporu</span>
                          <span className="text-amber-700 font-semibold flex items-center gap-1">
                            <Clock size={14} weight="fill" /> Mazeretli İzinli
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: REHBERLİK & İDARİ NOTLAR (KULLANICININ ÖZELLİKLE İSTEDİĞİ ALAN) */}
              {detailTab === 'rehberlik' && (
                <div className="space-y-4 text-xs">
                  {/* İdari Not & Disiplin Özeti */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-white border border-gray-100 nice-shadow space-y-2">
                      <div className="font-bold text-gray-900 flex items-center gap-1.5">
                        <ShieldCheck size={16} className="text-emerald-600" />
                        <span>Disiplin & Sicil Durumu</span>
                      </div>
                      <p className="text-gray-600 leading-relaxed bg-emerald-50/70 p-3 rounded-lg border border-emerald-100/70">
                        {selectedStudentForDetail.disciplineStatus}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-gray-100 nice-shadow space-y-2">
                      <div className="font-bold text-gray-900 flex items-center gap-1.5">
                        <Heartbeat size={16} className="text-rose-500" />
                        <span>Özel Sağlık & Mazeret Notu</span>
                      </div>
                      <p className="text-gray-600 leading-relaxed bg-rose-50/60 p-3 rounded-lg border border-rose-100/60">
                        {selectedStudentForDetail.specialHealthNote || 'Herhangi bir kronik rahatsızlık veya sağlık mazereti belirtilmemiştir.'}
                      </p>
                    </div>
                  </div>

                  {/* Genel İdari Not */}
                  <div className="p-4 rounded-xl bg-white border border-gray-100 nice-shadow space-y-1.5">
                    <div className="font-bold text-gray-900 flex items-center gap-1.5">
                      <NotePencil size={16} className="text-gray-700" />
                      <span>Genel İdari & Akademik Değerlendirme</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {selectedStudentForDetail.notes}
                    </p>
                  </div>

                  {/* Rehberlik Görüşme Kayıtları Header & Action */}
                  <div className="bg-white rounded-xl p-4 border border-gray-100 nice-shadow space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                          <FileText size={16} className="text-indigo-600" />
                          <span>Rehberlik & Psikolojik Danışmanlık Görüşme Kayıtları</span>
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Öğrenci ve veli ile yapılan bireysel rehberlik görüşmeleri ve alınan aksiyonlar
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsAddingNote(!isAddingNote)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors"
                      >
                        <PlusCircle size={15} weight="bold" />
                        <span>{isAddingNote ? 'Vazgeç' : 'Yeni Not Ekle'}</span>
                      </button>
                    </div>

                    {/* New Guidance Note Form */}
                    {isAddingNote && (
                      <form onSubmit={handleSaveGuidanceNote} className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-gray-700 block mb-1">Görüşmeci / Ekleyen *</label>
                            <input
                              type="text"
                              required
                              value={newNoteAuthor}
                              onChange={(e) => setNewNoteAuthor(e.target.value)}
                              placeholder="Örn: Psk. Dan. Fatma Yıldız"
                              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white border border-gray-200"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-gray-700 block mb-1">Görüşme Kategorisi</label>
                            <select
                              value={newNoteCategory}
                              onChange={(e) => setNewNoteCategory(e.target.value as any)}
                              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white border border-gray-200"
                            >
                              <option value="Rehberlik Görüşmesi">Bireysel Rehberlik Görüşmesi</option>
                              <option value="Veli Görüşmesi">Veli Görüşmesi</option>
                              <option value="Akademik">Akademik Takip</option>
                              <option value="Davranış">Davranış & Uyum</option>
                              <option value="Sağlık">Sağlık & Mazeret</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-gray-700 block mb-1">Görüşme Notu & Kararlar *</label>
                          <textarea
                            rows={3}
                            required
                            placeholder="Görüşülen konular, tespitler ve takip edilecek adımları yazınız..."
                            value={newNoteContent}
                            onChange={(e) => setNewNoteContent(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-lg bg-white border border-gray-200"
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setIsAddingNote(false)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-200"
                          >
                            İptal
                          </button>
                          <button
                            type="submit"
                            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
                          >
                            Notu Kaydet
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Guidance notes list */}
                    <div className="space-y-2.5 pt-1">
                      {selectedStudentForDetail.guidanceNotes.length === 0 ? (
                        <div className="text-center py-6 text-gray-400">
                          Henüz eklenmiş rehberlik görüşme kaydı bulunmuyor.
                        </div>
                      ) : (
                        selectedStudentForDetail.guidanceNotes.map((gn) => (
                          <div
                            key={gn.id}
                            className="p-3.5 rounded-xl border border-gray-100 bg-neutral-50/70 hover:bg-white transition-colors space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{gn.author}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                                  {gn.category}
                                </span>
                              </div>
                              <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
                                <Calendar size={12} />
                                {gn.date}
                              </span>
                            </div>
                            <p className="text-gray-700 leading-relaxed text-xs">
                              {gn.content}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForDetail(null)}
                  className="px-5 py-2 text-xs font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-colors shadow-xs"
                >
                  Kapat
                </button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 5. Modal: Kayıt Dondurma Mazeret & İşlem Onayı */}
      <Dialog open={isFreezeModalOpen} onOpenChange={setIsFreezeModalOpen}>
        <DialogContent className="max-w-md bg-white p-6 sm:p-8 rounded-3xl space-y-6 border border-gray-100 shadow-xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <PauseCircle size={22} weight="fill" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-gray-900">
                  Öğrenci Kayıt Dondurma
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500">
                  Dondurma gerekçesi ve süresini belirleyin.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedStudentForFreeze && (
            <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs space-y-1">
              <div className="font-bold text-gray-900">{selectedStudentForFreeze.name}</div>
              <div className="text-gray-500">
                No: <span className="font-mono text-gray-800">{selectedStudentForFreeze.studentNo}</span> • Sınıf:{' '}
                <span className="font-semibold text-gray-800">{selectedStudentForFreeze.classroomName}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleConfirmFreeze} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Dondurma Mazereti / Sebebi *
              </label>
              <select
                value={freezeCategory}
                onChange={(e) => setFreezeCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="Sağlık Mazereti / Heyet Raporu">Sağlık Mazereti / Heyet Raporu</option>
                <option value="Ailevi / İkamet Değişikliği">Ailevi / İkamet Değişikliği</option>
                <option value="Yurt Dışı Eğitim / Değişim Programı">Yurt Dışı Eğitim / Değişim Programı</option>
                <option value="Maddi / Sosyal Gerekçe">Maddi / Sosyal Gerekçe</option>
                <option value="Disiplin / İdari Kurul Kararı">Disiplin / İdari Kurul Kararı</option>
                <option value="Diğer Mazeret">Diğer Mazeret</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Dondurma Süresi
              </label>
              <select
                value={freezeDuration}
                onChange={(e) => setFreezeDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="1 Dönem">1 Dönem (Yarıyıl)</option>
                <option value="2 Dönem (1 Eğitim-Öğretim Yılı)">2 Dönem (1 Eğitim-Öğretim Yılı)</option>
                <option value="Süresiz / Mazeret Bitişine Kadar">Süresiz / Mazeret Bitişine Kadar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Açıklama & Resmi Karar / Evrak Notu
              </label>
              <textarea
                rows={3}
                placeholder="Örn: 24.09.2026 tarihli tam teşekküllü devlet hastanesi heyet raporu teslim alınmıştır."
                value={freezeDetail}
                onChange={(e) => setFreezeDetail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <DialogFooter className="mt-6 flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsFreezeModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Kaydı Dondur
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
