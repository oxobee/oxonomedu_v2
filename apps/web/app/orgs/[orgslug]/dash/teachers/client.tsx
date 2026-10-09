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
  ChalkboardTeacher,
  Plus,
  MagnifyingGlass,
  GraduationCap,
  Briefcase,
  Phone,
  EnvelopeSimple,
  CheckCircle,
  X,
  UserPlus,
  NotePencil,
  Eye,
  FileText,
  UploadSimple,
  Calendar,
  CalendarCheck,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  Check,
  Trash,
  DownloadSimple,
  ArrowsLeftRight,
  Sparkle,
} from '@phosphor-icons/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { searchMatchesAny } from '@/lib/search/normalize'
import { getOrgTeachers, validateTcKimlik } from '@services/demo/schoolDirectory'

export interface TeacherDocument {
  id: string
  name: string
  type: 'Lisans Diploması' | 'Pedagojik Formasyon' | 'Adli Sicil Kaydı' | 'Sözleşme' | 'Sertifika' | 'Sağlık Raporu' | 'Diğer Belge'
  uploadDate: string
  fileSize: string
}

export interface TeacherLeave {
  id: string
  type: 'Yıllık İzin' | 'Mazeret İzni' | 'Raporlu (Hastalık)' | 'İdari İzin' | 'Eğitim & Seminer'
  startDate: string
  endDate: string
  daysCount: number
  status: 'Onaylandı' | 'Beklemede' | 'Reddedildi'
  reason: string
}

export interface TeacherRecord {
  id: number
  name: string
  tcNo: string
  email: string
  phone: string
  branch: string
  university: string
  graduationYear: string
  birthDate: string
  address: string
  emergencyContact: string
  emergencyPhone: string
  status: 'active' | 'leave'
  isClassMentor: boolean
  mentorClass?: string
  assignedClasses: string[]
  workingHours: string
  weeklyHours: number
  employmentType: 'Kadrolu' | 'Sözleşmeli' | 'Ücretli'
  documents: TeacherDocument[]
  leaves: TeacherLeave[]
}

const INITIAL_TEACHERS: TeacherRecord[] = [
  {
    id: 1,
    name: 'Ahmet Hakan (Demo Hesap)',
    tcNo: '29182736450',
    email: 'ogretmen@oxonom.com',
    branch: 'Matematik & Geometri',
    phone: '+90 532 999 8877',
    university: 'ODTÜ Matematik Öğretmenliği',
    graduationYear: '2016',
    birthDate: '12.05.1991 (35 Yaşında)',
    address: 'Çankaya Mah. Barış Cad. No:8/3 Çankaya / Ankara',
    emergencyContact: 'Gül Hakan (Eşi)',
    emergencyPhone: '+90 532 111 4455',
    isClassMentor: true,
    mentorClass: '9-A',
    assignedClasses: ['9-A', '9-B', '10-A'],
    status: 'active',
    workingHours: '08:30 - 16:30 (Pazartesi - Cuma)',
    weeklyHours: 24,
    employmentType: 'Kadrolu',
    documents: [
      {
        id: 'doc-1',
        name: 'ODTU_Matematik_Lisans_Diplomasi.pdf',
        type: 'Lisans Diploması',
        uploadDate: '15.09.2023',
        fileSize: '2.4 MB',
      },
      {
        id: 'doc-2',
        name: 'Pedagojik_Formasyon_Sertifikasi.pdf',
        type: 'Pedagojik Formasyon',
        uploadDate: '15.09.2023',
        fileSize: '1.2 MB',
      },
      {
        id: 'doc-3',
        name: 'Adli_Sicil_Kaydi_2026.pdf',
        type: 'Adli Sicil Kaydı',
        uploadDate: '01.09.2026',
        fileSize: '480 KB',
      },
    ],
    leaves: [
      {
        id: 'lv-1',
        type: 'Yıllık İzin',
        startDate: '2026-06-15',
        endDate: '2026-06-25',
        daysCount: 10,
        status: 'Onaylandı',
        reason: 'Yaz tatili dönemi yıllık izin kullanımı',
      },
      {
        id: 'lv-2',
        type: 'Mazeret İzni',
        startDate: '2026-10-12',
        endDate: '2026-10-13',
        daysCount: 2,
        status: 'Beklemede',
        reason: 'Ailevi mazeret dolayısıyla',
      },
    ],
  },
  {
    id: 2,
    name: 'Selin Yıldız',
    tcNo: '48291038472',
    email: 'selin.yildiz@okul.com',
    branch: 'Türk Dili ve Edebiyatı',
    phone: '+90 533 888 7766',
    university: 'Ankara Üniversitesi Dil ve Tarih Coğrafya Fakültesi',
    graduationYear: '2018',
    birthDate: '24.08.1994 (32 Yaşında)',
    address: 'Kavaklıdere Mah. Tunalı Cad. No:45/12 Ankara',
    emergencyContact: 'Kemal Yıldız (Babası)',
    emergencyPhone: '+90 533 222 3344',
    isClassMentor: true,
    mentorClass: '9-B',
    assignedClasses: ['9-B', '10-B'],
    status: 'active',
    workingHours: '08:30 - 16:30 (Pazartesi - Cuma)',
    weeklyHours: 22,
    employmentType: 'Kadrolu',
    documents: [
      {
        id: 'doc-21',
        name: 'Ankara_Uni_Edebiyat_Diplomasi.pdf',
        type: 'Lisans Diploması',
        uploadDate: '01.10.2024',
        fileSize: '3.1 MB',
      },
      {
        id: 'doc-22',
        name: 'Milli_Egitim_Hizmet_Sozlesmesi.pdf',
        type: 'Sözleşme',
        uploadDate: '01.09.2025',
        fileSize: '850 KB',
      },
    ],
    leaves: [
      {
        id: 'lv-21',
        type: 'Raporlu (Hastalık)',
        startDate: '2026-02-10',
        endDate: '2026-02-12',
        daysCount: 3,
        status: 'Onaylandı',
        reason: 'Grip enfeksiyonu sebebiyle hekim raporu',
      },
    ],
  },
  {
    id: 3,
    name: 'Hakan Çetin',
    tcNo: '58192039481',
    email: 'hakan.cetin@okul.com',
    branch: 'Fizik & Fen Bilimleri',
    phone: '+90 534 777 6655',
    university: 'Hacettepe Üniversitesi Fizik Mühendisliği / Pedagoji',
    graduationYear: '2015',
    birthDate: '19.11.1990 (36 Yaşında)',
    address: 'Bahçelievler 7. Cad. No:20/4 Çankaya / Ankara',
    emergencyContact: 'Derya Çetin (Eşi)',
    emergencyPhone: '+90 534 555 7788',
    isClassMentor: false,
    assignedClasses: ['9-A', '10-A', '10-B'],
    status: 'active',
    workingHours: '08:30 - 16:30 (Pazartesi - Cuma)',
    weeklyHours: 26,
    employmentType: 'Kadrolu',
    documents: [
      {
        id: 'doc-31',
        name: 'Hacettepe_Fizik_Diplomasi.pdf',
        type: 'Lisans Diploması',
        uploadDate: '10.09.2023',
        fileSize: '1.9 MB',
      },
      {
        id: 'doc-32',
        name: 'Tubitak_Danismanlik_Sertifikasi.pdf',
        type: 'Sertifika',
        uploadDate: '15.01.2025',
        fileSize: '1.4 MB',
      },
    ],
    leaves: [],
  },
  {
    id: 4,
    name: 'Ayşe Doğan',
    tcNo: '37281940291',
    email: 'ayse.dogan@okul.com',
    branch: 'İngilizce (Yabancı Dil)',
    phone: '+90 535 666 5544',
    university: 'Boğaziçi Üniversitesi İngiliz Dili ve Edebiyatı',
    graduationYear: '2019',
    birthDate: '05.03.1995 (31 Yaşında)',
    address: 'Ümitköy Mah. 2432. Cad. No:15 Yenimahalle / Ankara',
    emergencyContact: 'Fatma Doğan (Annesi)',
    emergencyPhone: '+90 535 444 3322',
    isClassMentor: false,
    assignedClasses: ['9-A', '9-B'],
    status: 'active',
    workingHours: '08:30 - 16:30 (Pazartesi - Cuma)',
    weeklyHours: 20,
    employmentType: 'Sözleşmeli',
    documents: [
      {
        id: 'doc-41',
        name: 'Bogazici_Ingilizce_Diplomasi.pdf',
        type: 'Lisans Diploması',
        uploadDate: '05.09.2024',
        fileSize: '2.7 MB',
      },
      {
        id: 'doc-42',
        name: 'CELTA_Uluslararasi_Ogretmenlik.pdf',
        type: 'Sertifika',
        uploadDate: '10.10.2024',
        fileSize: '1.8 MB',
      },
    ],
    leaves: [],
  },
]

export default function TeachersClient({ orgslug }: { orgslug: string }) {
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

  const availableClassNames = useMemo(() => {
    if (rawClasses.length > 0) {
      return rawClasses.map((c: any) => c.name)
    }
    return []
  }, [rawClasses])

  const orgId = org?.id || 30
  const defaultOrgTeachers = useMemo(() => getOrgTeachers(orgId) as TeacherRecord[], [orgId])

  const [teachers, setTeachers] = useState<TeacherRecord[]>(() => {
    const id = org?.id || 30
    return getOrgTeachers(id) as TeacherRecord[]
  })

  // Synchronize teachers with real available classes and persist
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const key = `oxonom_teachers_${orgId}`
    const saved = localStorage.getItem(key)
    let currentList: TeacherRecord[] = saved ? JSON.parse(saved) : defaultOrgTeachers

    // If saved list had outdated mock teachers, refresh to current school teachers
    if (currentList.length > 0 && currentList[0].name.includes('Ahmet Hakan')) {
      currentList = defaultOrgTeachers
    }

    if (rawClasses.length > 0) {
      const realClassNames = new Set(rawClasses.map((c: any) => c.name))
      const classList = rawClasses.map((c: any) => c.name)

      currentList = currentList.map((t, idx) => {
        let validAssigned = (t.assignedClasses || []).filter((cn) => realClassNames.has(cn))
        if (validAssigned.length === 0 && classList.length > 0) {
          validAssigned = [classList[idx % classList.length]]
        }
        let validMentor = t.mentorClass && realClassNames.has(t.mentorClass)
          ? t.mentorClass
          : (t.isClassMentor && classList.length > 0 ? classList[idx % classList.length] : undefined)

        return {
          ...t,
          assignedClasses: validAssigned,
          mentorClass: validMentor,
        }
      })
    }
    setTeachers(currentList)
  }, [rawClasses, orgId, defaultOrgTeachers])

  const saveTeachersList = (updated: TeacherRecord[]) => {
    setTeachers(updated)
    if (typeof window !== 'undefined') {
      const key = `oxonom_teachers_${orgId}`
      localStorage.setItem(key, JSON.stringify(updated))
    }
  }
  const [search, setSearch] = useState('')
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('all')

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [assigningTeacher, setAssigningTeacher] = useState<TeacherRecord | null>(null)
  const [selectedClassesForAssign, setSelectedClassesForAssign] = useState<string[]>([])
  const [selectedMentorClass, setSelectedMentorClass] = useState<string>('')
  const [selectedTeacherForDetail, setSelectedTeacherForDetail] = useState<TeacherRecord | null>(null)
  const [detailTab, setDetailTab] = useState<'kimlik' | 'gorev' | 'belgeler' | 'izinler'>('kimlik')

  // Drag & drop state for file uploads
  const [isDragOver, setIsDragOver] = useState(false)
  const [addFormDocuments, setAddFormDocuments] = useState<TeacherDocument[]>([])

  // Leave modal state
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [newLeaveType, setNewLeaveType] = useState<TeacherLeave['type']>('Yıllık İzin')
  const [newLeaveStart, setNewLeaveStart] = useState('')
  const [newLeaveEnd, setNewLeaveEnd] = useState('')
  const [newLeaveDays, setNewLeaveDays] = useState(1)
  const [newLeaveReason, setNewLeaveReason] = useState('')

  // Teacher Form State (Used for both Add and Edit)
  const DEFAULT_TEACHER_FORM = {
    name: '',
    tcNo: '',
    email: '',
    phone: '',
    branch: '',
    university: '',
    graduationYear: '2020',
    birthDate: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    workingHours: '08:30 - 16:30 (Pazartesi - Cuma)',
    weeklyHours: 24,
    employmentType: 'Kadrolu' as 'Kadrolu' | 'Sözleşmeli' | 'Ücretli',
    assignedClasses: [] as string[],
    mentorClass: '',
  }

  const [teacherForm, setTeacherForm] = useState(DEFAULT_TEACHER_FORM)
  const [editingTeacher, setEditingTeacher] = useState<TeacherRecord | null>(null)

  // Branches
  const branches = useMemo(() => {
    const set = new Set<string>()
    teachers.forEach((t) => set.add(t.branch))
    return Array.from(set)
  }, [teachers])

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchesSearch =
        !search.trim() ||
        searchMatchesAny([t.name, t.email, t.branch, t.tcNo, t.university, ...t.assignedClasses], search)
      const matchesBranch =
        selectedBranchFilter === 'all' || t.branch === selectedBranchFilter
      return matchesSearch && matchesBranch
    })
  }, [teachers, search, selectedBranchFilter])

  // Open assignment modal
  const openAssignModal = (teacher: TeacherRecord) => {
    setAssigningTeacher(teacher)
    setSelectedClassesForAssign([...teacher.assignedClasses])
    setSelectedMentorClass(teacher.mentorClass || '')
  }

  // Save assignment
  const handleSaveAssignment = () => {
    if (!assigningTeacher) return
    setTeachers((prev) =>
      prev.map((t) =>
        t.id === assigningTeacher.id
          ? {
              ...t,
              assignedClasses: selectedClassesForAssign,
              isClassMentor: !!selectedMentorClass,
              mentorClass: selectedMentorClass || undefined,
            }
          : t
      )
    )
    if (selectedTeacherForDetail && selectedTeacherForDetail.id === assigningTeacher.id) {
      setSelectedTeacherForDetail((prev) =>
        prev
          ? {
              ...prev,
              assignedClasses: selectedClassesForAssign,
              isClassMentor: !!selectedMentorClass,
              mentorClass: selectedMentorClass || undefined,
            }
          : null
      )
    }
    toast.success(`${assigningTeacher.name} için sınıf görevlendirmeleri güncellendi.`)
    setAssigningTeacher(null)
  }

  const toggleClassAssignment = (className: string) => {
    setSelectedClassesForAssign((prev) =>
      prev.includes(className)
        ? prev.filter((c) => c !== className)
        : [...prev, className]
    )
  }

  const toggleFormClassAssignment = (className: string) => {
    setTeacherForm((prev) => ({
      ...prev,
      assignedClasses: prev.assignedClasses.includes(className)
        ? prev.assignedClasses.filter((c) => c !== className)
        : [...prev.assignedClasses, className],
    }))
  }

  // Open Add Teacher Modal
  const openAddTeacherModal = () => {
    setTeacherForm(DEFAULT_TEACHER_FORM)
    setAddFormDocuments([])
    setIsAddOpen(true)
  }

  // Open Edit Teacher Modal
  const openEditTeacherModal = (teacher: TeacherRecord) => {
    setEditingTeacher(teacher)
    setTeacherForm({
      name: teacher.name,
      tcNo: teacher.tcNo,
      email: teacher.email,
      phone: teacher.phone,
      branch: teacher.branch,
      university: teacher.university,
      graduationYear: teacher.graduationYear,
      birthDate: teacher.birthDate,
      address: teacher.address,
      emergencyContact: teacher.emergencyContact,
      emergencyPhone: teacher.emergencyPhone,
      workingHours: teacher.workingHours,
      weeklyHours: teacher.weeklyHours,
      employmentType: teacher.employmentType,
      assignedClasses: [...teacher.assignedClasses],
      mentorClass: teacher.mentorClass || '',
    })
    setIsEditOpen(true)
  }

  // Handle Drag and Drop for Add Modal
  const handleDropFiles = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newDocs: TeacherDocument[] = Array.from(e.dataTransfer.files).map((file, i) => ({
        id: `doc-${Date.now()}-${i}`,
        name: file.name,
        type: file.name.toLowerCase().includes('diploma')
          ? 'Lisans Diploması'
          : file.name.toLowerCase().includes('formasyon')
          ? 'Pedagojik Formasyon'
          : file.name.toLowerCase().includes('sicil')
          ? 'Adli Sicil Kaydı'
          : 'Sertifika',
        uploadDate: new Date().toLocaleDateString('tr-TR'),
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      }))
      setAddFormDocuments((prev) => [...prev, ...newDocs])
      toast.success(`${newDocs.length} belge yüklendi.`)
    }
  }

  // Handle Drag and Drop inside Teacher Profile Dossier
  const handleDropFilesToTeacher = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    if (!selectedTeacherForDetail) return

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newDocs: TeacherDocument[] = Array.from(e.dataTransfer.files).map((file, i) => ({
        id: `doc-${Date.now()}-${i}`,
        name: file.name,
        type: file.name.toLowerCase().includes('diploma')
          ? 'Lisans Diploması'
          : file.name.toLowerCase().includes('formasyon')
          ? 'Pedagojik Formasyon'
          : file.name.toLowerCase().includes('sicil')
          ? 'Adli Sicil Kaydı'
          : 'Sertifika',
        uploadDate: new Date().toLocaleDateString('tr-TR'),
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      }))

      const updated = {
        ...selectedTeacherForDetail,
        documents: [...selectedTeacherForDetail.documents, ...newDocs],
      }
      setTeachers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      setSelectedTeacherForDetail(updated)
      toast.success(`${newDocs.length} yeni belge ${updated.name} dosyasına eklendi.`)
    }
  }

  // Add teacher submit
  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault()
    if (!teacherForm.name.trim() || !teacherForm.branch.trim()) {
      toast.error('Lütfen öğretmen adı ve branşını giriniz.')
      return
    }

    const newTeacher: TeacherRecord = {
      id: Date.now(),
      name: teacherForm.name.trim(),
      tcNo: teacherForm.tcNo.trim() || `${Math.floor(10000000000 + Math.random() * 90000000000)}`,
      email: teacherForm.email.trim() || `${teacherForm.name.toLowerCase().replace(/\s+/g, '.')}@okul.com`,
      phone: teacherForm.phone.trim() || '+90 5XX XXX XX XX',
      branch: teacherForm.branch.trim(),
      university: teacherForm.university.trim() || 'Üniversite Belirtilmedi',
      graduationYear: teacherForm.graduationYear || '2020',
      birthDate: teacherForm.birthDate || 'Belirtilmedi',
      address: teacherForm.address || 'Adres belirtilmedi',
      emergencyContact: teacherForm.emergencyContact || 'Belirtilmedi',
      emergencyPhone: teacherForm.emergencyPhone || '—',
      isClassMentor: !!teacherForm.mentorClass,
      mentorClass: teacherForm.mentorClass || undefined,
      assignedClasses: teacherForm.assignedClasses,
      status: 'active',
      workingHours: teacherForm.workingHours,
      weeklyHours: Number(teacherForm.weeklyHours) || 24,
      employmentType: teacherForm.employmentType,
      documents: addFormDocuments.length > 0 ? addFormDocuments : [
        {
          id: `doc-${Date.now()}`,
          name: `${teacherForm.name.replace(/\s+/g, '_')}_Lisans_Diplomasi.pdf`,
          type: 'Lisans Diploması',
          uploadDate: new Date().toLocaleDateString('tr-TR'),
          fileSize: '2.1 MB',
        },
      ],
      leaves: [],
    }

    setTeachers((prev) => [newTeacher, ...prev])
    toast.success(`${newTeacher.name} başarıyla okul kadrosuna eklendi.`)
    setIsAddOpen(false)
    setTeacherForm(DEFAULT_TEACHER_FORM)
    setAddFormDocuments([])
  }

  // Save Edit Teacher
  const handleSaveEditTeacher = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTeacher) return
    if (!teacherForm.name.trim() || !teacherForm.branch.trim()) {
      toast.error('Lütfen öğretmen adı ve branşını giriniz.')
      return
    }

    const updated: TeacherRecord = {
      ...editingTeacher,
      name: teacherForm.name.trim(),
      tcNo: teacherForm.tcNo.trim() || editingTeacher.tcNo,
      email: teacherForm.email.trim() || editingTeacher.email,
      phone: teacherForm.phone.trim() || editingTeacher.phone,
      branch: teacherForm.branch.trim(),
      university: teacherForm.university.trim() || editingTeacher.university,
      graduationYear: teacherForm.graduationYear || editingTeacher.graduationYear,
      birthDate: teacherForm.birthDate || editingTeacher.birthDate,
      address: teacherForm.address || editingTeacher.address,
      emergencyContact: teacherForm.emergencyContact || editingTeacher.emergencyContact,
      emergencyPhone: teacherForm.emergencyPhone || editingTeacher.emergencyPhone,
      workingHours: teacherForm.workingHours,
      weeklyHours: Number(teacherForm.weeklyHours) || editingTeacher.weeklyHours,
      employmentType: teacherForm.employmentType,
      assignedClasses: teacherForm.assignedClasses,
      isClassMentor: !!teacherForm.mentorClass,
      mentorClass: teacherForm.mentorClass || undefined,
    }

    setTeachers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    if (selectedTeacherForDetail && selectedTeacherForDetail.id === updated.id) {
      setSelectedTeacherForDetail(updated)
    }
    toast.success(`${updated.name} öğretmeninin bilgileri güncellendi.`)
    setIsEditOpen(false)
    setEditingTeacher(null)
  }

  // Handle Leave Request Submission
  const handleAddLeave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeacherForDetail || !newLeaveStart || !newLeaveEnd) {
      toast.error('Lütfen başlangıç ve bitiş tarihlerini giriniz.')
      return
    }

    const newLeave: TeacherLeave = {
      id: `lv-${Date.now()}`,
      type: newLeaveType,
      startDate: newLeaveStart,
      endDate: newLeaveEnd,
      daysCount: Number(newLeaveDays) || 1,
      status: 'Onaylandı',
      reason: newLeaveReason.trim() || 'İdare tarafından tanımlanan izin',
    }

    const updated = {
      ...selectedTeacherForDetail,
      leaves: [newLeave, ...selectedTeacherForDetail.leaves],
    }

    setTeachers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    setSelectedTeacherForDetail(updated)
    toast.success('İzin kaydı başarıyla eklendi.')
    setIsLeaveModalOpen(false)
    setNewLeaveStart('')
    setNewLeaveEnd('')
    setNewLeaveDays(1)
    setNewLeaveReason('')
  }

  // Toggle Leave Status
  const handleToggleLeaveStatus = (leaveId: string, newStatus: 'Onaylandı' | 'Reddedildi') => {
    if (!selectedTeacherForDetail) return
    const updatedLeaves = selectedTeacherForDetail.leaves.map((lv) =>
      lv.id === leaveId ? { ...lv, status: newStatus } : lv
    )
    const updated = {
      ...selectedTeacherForDetail,
      leaves: updatedLeaves,
    }
    setTeachers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    setSelectedTeacherForDetail(updated)
    toast.success(`İzin durumu '${newStatus}' olarak güncellendi.`)
  }

  return (
    <div className="h-full w-full bg-[#f8f8f8]">
      <div className="px-4 sm:px-10 pt-8 pb-16 max-w-[1600px] mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ChalkboardTeacher size={22} weight="duotone" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Öğretmenler & Kadro Yönetimi</h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Öğretmen kadronuzu listeleyin, kimlik ve diploma belgelerini inceleyin, ders görevlendirmeleri, mesai ve izin taleplerini yönetin.
            </p>
          </div>

          <button
            onClick={openAddTeacherModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <UserPlus size={16} weight="bold" />
            <span>Yeni Öğretmen Ekle</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedBranchFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                selectedBranchFilter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tüm Branşlar ({teachers.length})
            </button>
            {branches.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBranchFilter(b)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  selectedBranchFilter === b
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <MagnifyingGlass className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Öğretmen adı, branş, T.C. veya üniversite..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs ps-9 pe-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white rounded-2xl p-5 border border-gray-100 nice-shadow hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header with avatar */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">
                      {teacher.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">{teacher.name}</h3>
                      <div className="text-[11px] text-indigo-600 font-semibold">{teacher.branch}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {teacher.isClassMentor && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        {teacher.mentorClass} Rehberi
                      </span>
                    )}
                  </div>
                </div>

                {/* Info row */}
                <div className="mt-3.5 space-y-1.5 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5 truncate">
                    <EnvelopeSimple size={13} className="text-gray-400 shrink-0" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone size={13} className="text-gray-400 shrink-0" />
                    <span>{teacher.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Briefcase size={13} className="text-gray-400 shrink-0" />
                    <span className="truncate">{teacher.university}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-gray-400 shrink-0" />
                    <span>Haftalık {teacher.weeklyHours} Saat Ders</span>
                  </div>
                </div>

                {/* Assigned Classes */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <GraduationCap size={13} /> Görevli Şubeler
                    </span>
                    <span className="text-[10px] text-indigo-600 font-bold">{teacher.assignedClasses.length} Sınıf</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {teacher.assignedClasses.length === 0 ? (
                      <span className="text-xs text-gray-400 italic">Henüz sınıf atanmadı</span>
                    ) : (
                      teacher.assignedClasses.map((cls) => (
                        <span
                          key={cls}
                          className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800"
                        >
                          {cls}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedTeacherForDetail(teacher)
                    setDetailTab('kimlik')
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Eye size={15} weight="bold" />
                  <span>Profil & Belgeler</span>
                </button>

                <button
                  onClick={() => openEditTeacherModal(teacher)}
                  title="Öğretmen Bilgilerini Düzenle"
                  className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-100 transition-colors"
                >
                  <NotePencil size={15} weight="bold" />
                </button>

                <button
                  onClick={() => openAssignModal(teacher)}
                  title="Sınıflara Görevlendir"
                  className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-indigo-600 border border-gray-100 transition-colors"
                >
                  <GraduationCap size={15} weight="bold" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 1. Modal: KAPSAMLI ÖĞRETMEN DOSYASI (DOSSIER) */}
      <Dialog
        open={!!selectedTeacherForDetail}
        onOpenChange={(open) => !open && setSelectedTeacherForDetail(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl space-y-6">
          {selectedTeacherForDetail && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-gray-900 via-neutral-900 to-indigo-950 text-white nice-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-2xl flex items-center justify-center shrink-0 shadow-lg">
                    {selectedTeacherForDetail.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold text-white">{selectedTeacherForDetail.name}</h2>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-500/40">
                        {selectedTeacherForDetail.branch}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white">
                        {selectedTeacherForDetail.employmentType}
                      </span>
                      {selectedTeacherForDetail.isClassMentor && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {selectedTeacherForDetail.mentorClass} Rehber Öğretmeni
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white/70 mt-1 flex items-center gap-3 flex-wrap">
                      <span>TC: <strong className="text-white font-mono">{selectedTeacherForDetail.tcNo}</strong></span>
                      <span>Mezuniyet: <strong className="text-white">{selectedTeacherForDetail.university}</strong></span>
                      <span>Ders Yükü: <strong className="text-white font-mono">{selectedTeacherForDetail.weeklyHours} Saat/Hafta</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEditTeacherModal(selectedTeacherForDetail)}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <NotePencil size={15} weight="bold" />
                    <span>Bilgileri Düzenle</span>
                  </button>
                  <button
                    onClick={() => openAssignModal(selectedTeacherForDetail)}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <GraduationCap size={15} weight="bold" />
                    <span>Sınıf Görevlendir</span>
                  </button>
                </div>
              </div>

              {/* 4 KPI Metric Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl p-3.5 border border-gray-100 nice-shadow">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
                    <Clock size={14} className="text-indigo-500" />
                    <span>Ders Yükü</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900 mt-1">{selectedTeacherForDetail.weeklyHours} Saat</div>
                  <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">Haftalık Müfredat</div>
                </div>

                <div className="bg-white rounded-xl p-3.5 border border-gray-100 nice-shadow">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
                    <GraduationCap size={14} className="text-emerald-500" />
                    <span>Görevli Sınıflar</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900 mt-1">{selectedTeacherForDetail.assignedClasses.length} Şube</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{selectedTeacherForDetail.assignedClasses.join(', ') || 'Atanmadı'}</div>
                </div>

                <div className="bg-white rounded-xl p-3.5 border border-gray-100 nice-shadow">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
                    <CalendarCheck size={14} className="text-amber-500" />
                    <span>İzin Durumu</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900 mt-1">
                    {selectedTeacherForDetail.leaves.filter((l) => l.status === 'Onaylandı').reduce((acc, curr) => acc + curr.daysCount, 0)} Gün
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Kullanılan İzin</div>
                </div>

                <div className="bg-white rounded-xl p-3.5 border border-gray-100 nice-shadow">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
                    <FileText size={14} className="text-blue-500" />
                    <span>Diploma & Belgeler</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900 mt-1">{selectedTeacherForDetail.documents.length} Belge</div>
                  <div className="text-[10px] text-blue-600 font-semibold mt-0.5">Onaylı Evrak</div>
                </div>
              </div>

              {/* Tabs navigation */}
              <div className="flex items-center gap-1 border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setDetailTab('kimlik')}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                    detailTab === 'kimlik'
                      ? 'border-indigo-600 text-indigo-700'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <User size={15} />
                  <span>Kimlik & İletişim</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetailTab('gorev')}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                    detailTab === 'gorev'
                      ? 'border-indigo-600 text-indigo-700'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Briefcase size={15} />
                  <span>Görev & Mesai Saatleri</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetailTab('belgeler')}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                    detailTab === 'belgeler'
                      ? 'border-indigo-600 text-indigo-700'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <FileText size={15} />
                  <span>Diploma & Belgeler ({selectedTeacherForDetail.documents.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetailTab('izinler')}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                    detailTab === 'izinler'
                      ? 'border-indigo-600 text-indigo-700'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Calendar size={15} />
                  <span>İzin Talepleri & Geçmişi ({selectedTeacherForDetail.leaves.length})</span>
                </button>
              </div>

              {/* Tab Content 1: Kimlik & İletişim */}
              {detailTab === 'kimlik' && (
                <div className="space-y-4 text-xs">
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 nice-shadow space-y-3">
                    <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                      <User size={16} className="text-gray-600" />
                      <span>Kişisel & Akademik Bilgiler</span>
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-gray-700">
                      <div>
                        <span className="text-gray-400 block text-[11px]">T.C. Kimlik No</span>
                        <span className="font-mono font-semibold">{selectedTeacherForDetail.tcNo}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Doğum Tarihi</span>
                        <span className="font-semibold">{selectedTeacherForDetail.birthDate}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Mezun Olduğu Üniversite</span>
                        <span className="font-semibold">{selectedTeacherForDetail.university}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Mezuniyet Yılı</span>
                        <span className="font-semibold font-mono">{selectedTeacherForDetail.graduationYear}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">E-posta Adresi</span>
                        <span className="font-semibold truncate">{selectedTeacherForDetail.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Telefon Numarası</span>
                        <span className="font-semibold font-mono">{selectedTeacherForDetail.phone}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Acil Durum Kişisi</span>
                        <span className="font-semibold">{selectedTeacherForDetail.emergencyContact}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Acil Durum Telefonu</span>
                        <span className="font-semibold font-mono">{selectedTeacherForDetail.emergencyPhone}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-gray-400 block text-[11px] mb-0.5">İkametgâh & Ev Adresi</span>
                      <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                        <MapPin size={14} className="text-gray-500 shrink-0" />
                        <span>{selectedTeacherForDetail.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content 2: Görev & Mesai Saatleri */}
              {detailTab === 'gorev' && (
                <div className="space-y-4 text-xs">
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 nice-shadow space-y-4">
                    <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                      <Briefcase size={16} className="text-indigo-600" />
                      <span>Görevlendirme & Mesai Detayları</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="text-gray-400 block text-[11px]">Branş / Uzmanlık</span>
                        <span className="font-bold text-gray-900 text-sm">{selectedTeacherForDetail.branch}</span>
                      </div>

                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="text-gray-400 block text-[11px]">İstihdam & Statü</span>
                        <span className="font-bold text-indigo-700 text-sm">{selectedTeacherForDetail.employmentType} Öğretmen</span>
                      </div>

                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="text-gray-400 block text-[11px]">Haftalık Ders Yükü</span>
                        <span className="font-bold text-gray-900 text-sm">{selectedTeacherForDetail.weeklyHours} Saat / Hafta</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock size={18} className="text-indigo-600" />
                        <div>
                          <div className="font-bold text-indigo-950">Günlük Mesai Saatleri</div>
                          <div className="text-indigo-700 text-xs mt-0.5">{selectedTeacherForDetail.workingHours}</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800">
                        Haftalık 40 Saat Mesai
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-gray-900 block mb-2">Atandığı ve Ders Verdiği Şubeler</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedTeacherForDetail.assignedClasses.map((cls) => (
                          <div
                            key={cls}
                            className="px-3 py-1.5 rounded-xl bg-gray-100 border border-gray-200 text-gray-800 font-bold flex items-center gap-1.5"
                          >
                            <GraduationCap size={15} className="text-indigo-600" />
                            <span>{cls} Şubesi</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content 3: Diploma & Belgeler (Sürükle-Bırak Alanı ile) */}
              {detailTab === 'belgeler' && (
                <div className="space-y-4 text-xs">
                  {/* Drag and Drop Zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsDragOver(true)
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDropFilesToTeacher}
                    className={`p-6 border-2 border-dashed rounded-2xl text-center transition-all ${
                      isDragOver
                        ? 'border-indigo-500 bg-indigo-50/70 scale-[1.01]'
                        : 'border-gray-200 hover:border-indigo-400 bg-gray-50/50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2.5">
                      <UploadSimple size={24} weight="bold" />
                    </div>
                    <h5 className="font-bold text-sm text-gray-900">Diploma ve Belgeleri Buraya Sürükleyin</h5>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, JPG veya PNG formatındaki lisans diploması, formasyon veya adli sicil evraklarını bırakabilirsiniz.
                    </p>
                    <label className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs">
                      <UploadSimple size={14} weight="bold" />
                      <span>Dosya Seçin</span>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            const newDocs: TeacherDocument[] = Array.from(e.target.files).map((file, i) => ({
                              id: `doc-${Date.now()}-${i}`,
                              name: file.name,
                              type: 'Lisans Diploması',
                              uploadDate: new Date().toLocaleDateString('tr-TR'),
                              fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                            }))
                            const updated = {
                              ...selectedTeacherForDetail,
                              documents: [...selectedTeacherForDetail.documents, ...newDocs],
                            }
                            setTeachers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
                            setSelectedTeacherForDetail(updated)
                            toast.success(`${newDocs.length} belge yüklendi.`)
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Document List */}
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 nice-shadow space-y-3">
                    <h5 className="font-bold text-sm text-gray-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FileText size={16} className="text-indigo-600" /> Kayıtlı Evrak ve Sertifikalar
                      </span>
                      <span className="text-xs font-normal text-gray-400">{selectedTeacherForDetail.documents.length} Belge Kayıtlı</span>
                    </h5>

                    <div className="divide-y divide-gray-100">
                      {selectedTeacherForDetail.documents.map((doc) => (
                        <div key={doc.id} className="py-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                              <FileText size={18} weight="duotone" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{doc.name}</div>
                              <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
                                <span className="font-medium text-indigo-600">{doc.type}</span>
                                <span>•</span>
                                <span>{doc.uploadDate}</span>
                                <span>•</span>
                                <span>{doc.fileSize}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => toast.success(`'${doc.name}' dosyası indiriliyor...`)}
                              className="p-2 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Belgeyi İndir"
                            >
                              <DownloadSimple size={16} weight="bold" />
                            </button>
                            <button
                              onClick={() => {
                                const updatedDocs = selectedTeacherForDetail.documents.filter((d) => d.id !== doc.id)
                                const updated = { ...selectedTeacherForDetail, documents: updatedDocs }
                                setTeachers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
                                setSelectedTeacherForDetail(updated)
                                toast.success('Belge silindi.')
                              }}
                              className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Belgeyi Sil"
                            >
                              <Trash size={16} weight="bold" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content 4: İzin Talepleri & İzin Detayları Tablosu */}
              {detailTab === 'izinler' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">İzin Talepleri ve Kullanım Geçmişi</h4>
                      <p className="text-gray-400 text-xs">Öğretmenin yıllık, mazeret ve sağlık izin kayıtları.</p>
                    </div>

                    <button
                      onClick={() => setIsLeaveModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-xs"
                    >
                      <Plus size={14} weight="bold" />
                      <span>Yeni İzin Girişi Ekle</span>
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 nice-shadow overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase">
                        <tr>
                          <th className="px-4 py-3">İzin Türü</th>
                          <th className="px-4 py-3">Tarih Aralığı</th>
                          <th className="px-4 py-3 text-center">Gün</th>
                          <th className="px-4 py-3">Gerekçe / Açıklama</th>
                          <th className="px-4 py-3 text-center">Durum</th>
                          <th className="px-4 py-3 text-end">Yönetim Onayı</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedTeacherForDetail.leaves.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                              Henüz kayıtlı bir izin talebi veya kullanımı bulunmamaktadır.
                            </td>
                          </tr>
                        ) : (
                          selectedTeacherForDetail.leaves.map((leave) => (
                            <tr key={leave.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-4 py-3.5 font-bold text-gray-900">{leave.type}</td>
                              <td className="px-4 py-3.5 text-gray-600 font-mono">
                                {leave.startDate} → {leave.endDate}
                              </td>
                              <td className="px-4 py-3.5 text-center font-bold text-gray-900">
                                {leave.daysCount} Gün
                              </td>
                              <td className="px-4 py-3.5 text-gray-600 max-w-xs truncate">{leave.reason}</td>
                              <td className="px-4 py-3.5 text-center">
                                <span
                                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                    leave.status === 'Onaylandı'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : leave.status === 'Beklemede'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : 'bg-red-50 text-red-700 border border-red-200'
                                  }`}
                                >
                                  {leave.status}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-end">
                                {leave.status === 'Beklemede' ? (
                                  <div className="inline-flex items-center gap-1.5">
                                    <button
                                      onClick={() => handleToggleLeaveStatus(leave.id, 'Onaylandı')}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition-colors"
                                    >
                                      Onayla
                                    </button>
                                    <button
                                      onClick={() => handleToggleLeaveStatus(leave.id, 'Reddedildi')}
                                      className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] transition-colors"
                                    >
                                      Reddet
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-[11px]">Tamamlandı</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 2. Modal: Yeni Öğretmen Ekle (Kapsamlı Sürükle-Bırak Alanı ile) */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl space-y-6">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <UserPlus size={22} weight="duotone" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Yeni Öğretmen Ekle
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 mt-0.5">
                  Öğretmen kimlik, branş, çalışma saatleri ve diplomalarını eksiksiz olarak tanımlayın.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleAddTeacher} className="space-y-5">
            {/* Kart 1: Kimlik & İletişim Bilgileri */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 uppercase tracking-wider">
                <User size={15} className="text-indigo-600" />
                <span>Kimlik & İletişim Bilgileri</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Ad Soyad *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Mehmet Özkan"
                    value={teacherForm.name}
                    onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">T.C. Kimlik No *</label>
                  <input
                    type="text"
                    maxLength={11}
                    required
                    placeholder="11 haneli T.C."
                    value={teacherForm.tcNo}
                    onChange={(e) => setTeacherForm({ ...teacherForm, tcNo: e.target.value.replace(/\D/g, '') })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Doğum Tarihi</label>
                  <input
                    type="text"
                    placeholder="Örn: 10.04.1989"
                    value={teacherForm.birthDate}
                    onChange={(e) => setTeacherForm({ ...teacherForm, birthDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">E-posta Adresi</label>
                  <input
                    type="email"
                    placeholder="mehmet@okul.com"
                    value={teacherForm.email}
                    onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Telefon Numarası *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+90 532 000 0000"
                    value={teacherForm.phone}
                    onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Mezun Olduğu Üniversite & Fakülte</label>
                  <input
                    type="text"
                    placeholder="Örn: Boğaziçi Üniversitesi Eğitim Fakültesi"
                    value={teacherForm.university}
                    onChange={(e) => setTeacherForm({ ...teacherForm, university: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Mezuniyet Yılı</label>
                  <input
                    type="text"
                    placeholder="2018"
                    value={teacherForm.graduationYear}
                    onChange={(e) => setTeacherForm({ ...teacherForm, graduationYear: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">İkametgâh Adresi</label>
                  <input
                    type="text"
                    placeholder="Mahalle, Cadde, Sokak, İlçe / İl"
                    value={teacherForm.address}
                    onChange={(e) => setTeacherForm({ ...teacherForm, address: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Kart 2: Branş, Görev & Mesai Saatleri */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 uppercase tracking-wider">
                <Briefcase size={15} className="text-indigo-600" />
                <span>Branş, Görev & Mesai Detayları</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Branş / Alan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Biyoloji, Matematik, Tarih..."
                    value={teacherForm.branch}
                    onChange={(e) => setTeacherForm({ ...teacherForm, branch: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">İstihdam Türü</label>
                  <select
                    value={teacherForm.employmentType}
                    onChange={(e) => setTeacherForm({ ...teacherForm, employmentType: e.target.value as any })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Kadrolu">Kadrolu</option>
                    <option value="Sözleşmeli">Sözleşmeli</option>
                    <option value="Ücretli">Ücretli</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Haftalık Ders Saati</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={teacherForm.weeklyHours}
                    onChange={(e) => setTeacherForm({ ...teacherForm, weeklyHours: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Günlük Mesai Saatleri</label>
                  <input
                    type="text"
                    value={teacherForm.workingHours}
                    onChange={(e) => setTeacherForm({ ...teacherForm, workingHours: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Sınıf Rehberliği (Opsiyonel)</label>
                  <select
                    value={teacherForm.mentorClass}
                    onChange={(e) => setTeacherForm({ ...teacherForm, mentorClass: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Rehber Öğretmen Değil</option>
                    {availableClassNames.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls} Rehber Öğretmeni
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1.5">
                    Ders Vereceği Şubeler (Birden fazla seçilebilir):
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableClassNames.map((cls) => {
                      const isSelected = teacherForm.assignedClasses.includes(cls)
                      return (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => toggleFormClassAssignment(cls)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span>{cls}</span>
                          {isSelected && <Check size={14} weight="bold" className="text-indigo-600" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Kart 3: Diploma & Belgeleri (Sürükle-Bırak Alanı) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 uppercase tracking-wider">
                <FileText size={15} className="text-indigo-600" />
                <span>Diploma ve Belgeleri (Sürükle - Bırak)</span>
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragOver(true)
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDropFiles}
                className={`p-5 border-2 border-dashed rounded-2xl text-center transition-all ${
                  isDragOver
                    ? 'border-indigo-500 bg-indigo-50/70 scale-[1.01]'
                    : 'border-gray-200 hover:border-indigo-400 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                  <UploadSimple size={20} weight="bold" />
                </div>
                <div className="text-xs font-bold text-gray-900">Belgeleri Buraya Sürükleyin</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Lisans Diploması, Pedagojik Formasyon, Adli Sicil vb.</div>
                <label className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors cursor-pointer">
                  <span>Dosya Seç</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const newDocs: TeacherDocument[] = Array.from(e.target.files).map((file, i) => ({
                          id: `doc-${Date.now()}-${i}`,
                          name: file.name,
                          type: 'Lisans Diploması',
                          uploadDate: new Date().toLocaleDateString('tr-TR'),
                          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                        }))
                        setAddFormDocuments((prev) => [...prev, ...newDocs])
                      }
                    }}
                  />
                </label>
              </div>

              {addFormDocuments.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {addFormDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-800"
                    >
                      <CheckCircle size={15} className="text-emerald-600" weight="fill" />
                      <span>{doc.name}</span>
                      <button
                        type="button"
                        onClick={() => setAddFormDocuments((prev) => prev.filter((d) => d.id !== doc.id))}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
              >
                Öğretmeni Kaydet
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. Modal: Öğretmen Bilgilerini Düzenle */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl space-y-6">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <NotePencil size={22} weight="duotone" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Öğretmen Bilgilerini Düzenle
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 mt-0.5">
                  {editingTeacher?.name} öğretmeninin kimlik, branş ve mesai detaylarını güncelleyin.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveEditTeacher} className="space-y-5">
            {/* Kart 1: Kimlik & İletişim Bilgileri */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 uppercase tracking-wider">
                <User size={15} className="text-indigo-600" />
                <span>Kimlik & İletişim Bilgileri</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Ad Soyad *</label>
                  <input
                    type="text"
                    required
                    value={teacherForm.name}
                    onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">T.C. Kimlik No</label>
                  <input
                    type="text"
                    maxLength={11}
                    value={teacherForm.tcNo}
                    onChange={(e) => setTeacherForm({ ...teacherForm, tcNo: e.target.value.replace(/\D/g, '') })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Doğum Tarihi</label>
                  <input
                    type="text"
                    value={teacherForm.birthDate}
                    onChange={(e) => setTeacherForm({ ...teacherForm, birthDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">E-posta Adresi</label>
                  <input
                    type="email"
                    value={teacherForm.email}
                    onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Telefon Numarası</label>
                  <input
                    type="tel"
                    value={teacherForm.phone}
                    onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Mezun Olduğu Üniversite & Fakülte</label>
                  <input
                    type="text"
                    value={teacherForm.university}
                    onChange={(e) => setTeacherForm({ ...teacherForm, university: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Mezuniyet Yılı</label>
                  <input
                    type="text"
                    value={teacherForm.graduationYear}
                    onChange={(e) => setTeacherForm({ ...teacherForm, graduationYear: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">İkametgâh Adresi</label>
                  <input
                    type="text"
                    value={teacherForm.address}
                    onChange={(e) => setTeacherForm({ ...teacherForm, address: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Kart 2: Branş, Görev & Mesai Saatleri */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 uppercase tracking-wider">
                <Briefcase size={15} className="text-indigo-600" />
                <span>Branş, Görev & Mesai Detayları</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Branş / Alan *</label>
                  <input
                    type="text"
                    required
                    value={teacherForm.branch}
                    onChange={(e) => setTeacherForm({ ...teacherForm, branch: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">İstihdam Türü</label>
                  <select
                    value={teacherForm.employmentType}
                    onChange={(e) => setTeacherForm({ ...teacherForm, employmentType: e.target.value as any })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Kadrolu">Kadrolu</option>
                    <option value="Sözleşmeli">Sözleşmeli</option>
                    <option value="Ücretli">Ücretli</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Haftalık Ders Saati</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={teacherForm.weeklyHours}
                    onChange={(e) => setTeacherForm({ ...teacherForm, weeklyHours: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Günlük Mesai Saatleri</label>
                  <input
                    type="text"
                    value={teacherForm.workingHours}
                    onChange={(e) => setTeacherForm({ ...teacherForm, workingHours: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Sınıf Rehberliği</label>
                  <select
                    value={teacherForm.mentorClass}
                    onChange={(e) => setTeacherForm({ ...teacherForm, mentorClass: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Rehber Öğretmen Değil</option>
                    {availableClassNames.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls} Rehber Öğretmeni
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1.5">
                    Ders Vereceği Şubeler:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableClassNames.map((cls) => {
                      const isSelected = teacherForm.assignedClasses.includes(cls)
                      return (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => toggleFormClassAssignment(cls)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span>{cls}</span>
                          {isSelected && <Check size={14} weight="bold" className="text-indigo-600" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
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

      {/* 4. Modal: Sınıf Ata / Görevlendir */}
      <Dialog open={!!assigningTeacher} onOpenChange={(open) => !open && setAssigningTeacher(null)}>
        <DialogContent className="max-w-md p-6 sm:p-8 rounded-3xl space-y-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap size={20} className="text-indigo-600" />
              <span>Sınıf Görevlendirmesi</span>
            </DialogTitle>
            <DialogDescription>
              {assigningTeacher?.name} öğretmeninin ders vereceği sınıfları ve sınıf rehberliğini belirleyin.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-2">
                Ders Vereceği Şubeler (Birden fazla seçilebilir):
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availableClassNames.map((clsName) => {
                  const isChecked = selectedClassesForAssign.includes(clsName)
                  return (
                    <button
                      key={clsName}
                      type="button"
                      onClick={() => toggleClassAssignment(clsName)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-colors ${
                        isChecked
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{clsName} Sınıfı</span>
                      {isChecked && <CheckCircle size={15} weight="fill" className="text-indigo-600" />}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Sınıf Rehber Öğretmenliği (Opsiyonel):
              </label>
              <select
                value={selectedMentorClass}
                onChange={(e) => setSelectedMentorClass(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Rehber Öğretmen Değil</option>
                {availableClassNames.map((clsName) => (
                  <option key={clsName} value={clsName}>
                    {clsName} Sınıf Rehber Öğretmeni
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setAssigningTeacher(null)}
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleSaveAssignment}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
            >
              Görevlendirmeyi Kaydet
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 5. Modal: Yeni İzin Girişi Ekle */}
      <Dialog open={isLeaveModalOpen} onOpenChange={setIsLeaveModalOpen}>
        <DialogContent className="max-w-md p-6 sm:p-8 rounded-3xl space-y-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarCheck size={20} className="text-indigo-600" />
              <span>Yeni İzin Kaydı / Talebi</span>
            </DialogTitle>
            <DialogDescription>
              {selectedTeacherForDetail?.name} için izin türü ve tarih aralığını belirleyin.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddLeave} className="space-y-3.5 py-1">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">İzin Türü *</label>
              <select
                value={newLeaveType}
                onChange={(e) => setNewLeaveType(e.target.value as any)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Yıllık İzin">Yıllık İzin</option>
                <option value="Mazeret İzni">Mazeret İzni</option>
                <option value="Raporlu (Hastalık)">Raporlu (Hastalık)</option>
                <option value="İdari İzin">İdari İzin</option>
                <option value="Eğitim & Seminer">Eğitim & Seminer</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Başlangıç Tarihi *</label>
                <input
                  type="date"
                  required
                  value={newLeaveStart}
                  onChange={(e) => setNewLeaveStart(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Bitiş Tarihi *</label>
                <input
                  type="date"
                  required
                  value={newLeaveEnd}
                  onChange={(e) => setNewLeaveEnd(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Toplam Gün Sayısı</label>
              <input
                type="number"
                min={1}
                max={60}
                value={newLeaveDays}
                onChange={(e) => setNewLeaveDays(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">İzin Nedeni / Açıklama</label>
              <textarea
                rows={2}
                placeholder="İzin kullanım amacı veya hekim rapor bilgisi..."
                value={newLeaveReason}
                onChange={(e) => setNewLeaveReason(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <DialogFooter className="pt-2">
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
              >
                İzni Kaydet & Onayla
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
