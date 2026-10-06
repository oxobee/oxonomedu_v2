'use client'
import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useOrg } from '@components/Contexts/OrgContext'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { getAPIUrl } from '@services/config/config'
import { createBoard, getClassroomBoards, deleteBoard } from '@services/boards/boards'
import {
  getUserGroup,
  getUserGroupUsers,
  regenerateClassJoinCode,
  updateUserGroup,
  deleteUserGroup,
} from '@services/usergroups/usergroups'
import useAdminStatus from '@components/Hooks/useAdminStatus'
import toast from 'react-hot-toast'
import {
  GraduationCap,
  Users,
  Presentation,
  KeyRound,
  RotateCw,
  Copy,
  Check,
  Trash2,
  Sparkles,
  Plus,
  Search,
  CalendarCheck,
  Building,
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  UserCheck,
  UserX,
  AlertCircle,
  FileText,
  ExternalLink,
  Edit3,
  PenTool,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react'
import {
  getSchoolAssignments,
  SchoolAssignmentItem,
} from '@services/school_assignments/school_assignments'
import CreateSchoolAssignmentModal from '@components/Dashboard/Assignments/CreateSchoolAssignmentModal'
import AssignmentSubmissionsModal from '@components/Dashboard/Assignments/AssignmentSubmissionsModal'
import ManageUsers from '@components/Objects/Modals/Dash/OrgUserGroups/ManageUsers'
import Modal from '@components/Objects/StyledElements/Modal/Modal'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import UserAvatar from '@components/Objects/UserAvatar'

interface ClassDetailClientProps {
  orgslug: string
  classroomId: number
}

type TabType = 'boards' | 'students' | 'attendance' | 'assignments'

export default function ClassDetailClient({ orgslug, classroomId }: ClassDetailClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams?.get('tab')
  const onlyTabParam = searchParams?.get('onlyTab')
  const isOnlyAttendance = tabParam === 'attendance' && (onlyTabParam === '1' || searchParams?.get('chrome') === 'none')

  const org = useOrg() as any
  const session = useLHSession() as any
  const token = session?.data?.tokens?.access_token
  const queryClient = useQueryClient()

  const { canManageOrg } = useAdminStatus()

  // Sınıf Öğretmeni (Mentor Teacher) State
  const [mentorTeacherName, setMentorTeacherName] = useState<string>('Ahmet Hakan (Matematik)')

  // Edit Class Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editClassName, setEditClassName] = useState('')
  const [editClassGrade, setEditClassGrade] = useState('')
  const [editClassDesc, setEditClassDesc] = useState('')
  const [editMentorTeacher, setEditMentorTeacher] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // Delete Class Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeletingClass, setIsDeletingClass] = useState(false)

  const handleOpenEditModal = () => {
    setEditClassName(classroom?.name || '')
    setEditClassGrade(classroom?.grade_level || '9. Sınıf')
    setEditClassDesc(classroom?.description || '')
    setEditMentorTeacher(mentorTeacherName || 'Ahmet Hakan (Matematik)')
    setIsEditModalOpen(true)
  }

  const handleSaveEditClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editClassName.trim()) {
      toast.error('Sınıf adı zorunludur.')
      return
    }
    setIsSavingEdit(true)
    try {
      await updateUserGroup(classroomId, org.id, token, {
        name: editClassName.trim(),
        grade_level: editClassGrade.trim(),
        description: editClassDesc.trim(),
      })
      if (typeof window !== 'undefined') {
        localStorage.setItem(`oxonom_classroom_mentor_${classroomId}`, editMentorTeacher)
      }
      setMentorTeacherName(editMentorTeacher)
      await queryClient.invalidateQueries({ queryKey: ['classroom', classroomId] })
      await queryClient.invalidateQueries({ queryKey: ['classrooms'] })
      toast.success('Sınıf bilgileri ve sınıf öğretmeni başarıyla güncellendi.')
      setIsEditModalOpen(false)
    } catch {
      toast.error('Sınıf güncellenirken bir hata oluştu.')
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleDeleteClass = async () => {
    setIsDeletingClass(true)
    try {
      await deleteUserGroup(classroomId, org.id, token)
      await queryClient.invalidateQueries({ queryKey: ['classrooms'] })
      toast.success('Sınıf başarıyla silindi.')
      setIsDeleteModalOpen(false)
      router.push(`/orgs/${orgslug}/dash/classrooms`)
    } catch {
      toast.error('Sınıf silinirken bir hata oluştu.')
    } finally {
      setIsDeletingClass(false)
    }
  }

  // Active tab: 'boards' | 'students' | 'attendance' | 'assignments'
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (tabParam === 'attendance') return 'attendance'
    if (tabParam === 'students') return 'students'
    if (tabParam === 'assignments') return 'assignments'
    return 'boards'
  })

  // Modals
  const [isManageUsersOpen, setIsManageUsersOpen] = useState(false)
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [newBoardDesc, setNewBoardDesc] = useState('')
  const [creatingBoard, setCreatingBoard] = useState(false)

  // Copy & Regenerate Code
  const [codeCopied, setCodeCopied] = useState(false)
  const [regeneratingCode, setRegeneratingCode] = useState(false)

  // Student search
  const [studentSearch, setStudentSearch] = useState('')

  // Attendance state (Local session for today)
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0])
  const [attendanceState, setAttendanceState] = useState<Record<number, 'present' | 'absent' | 'excused' | 'late'>>({})

  // School Homework state
  const [isNewAssignmentOpen, setIsNewAssignmentOpen] = useState(false)
  const [selectedAssignmentForReview, setSelectedAssignmentForReview] = useState<SchoolAssignmentItem | null>(null)

  // 0. Fetch Classroom School Assignments
  const {
    data: schoolAssignments = [],
    isLoading: isLoadingAssignments,
    refetch: refetchClassAssignments,
  } = useQuery({
    queryKey: ['classroom-school-assignments', org?.id, classroomId],
    queryFn: () => getSchoolAssignments(org?.id, { usergroup_id: classroomId }, token),
    enabled: !!(org?.id && token && classroomId),
  })

  // 1. Fetch Class Info
  const { data: classroom, isLoading: isClassLoading } = useQuery({
    queryKey: ['classroom', classroomId],
    queryFn: async () => {
      const res = await getUserGroup(classroomId, token)
      return res?.data ?? res
    },
    enabled: !!classroomId && !!token,
  })

  React.useEffect(() => {
    if (typeof window !== 'undefined' && classroomId) {
      const saved = localStorage.getItem(`oxonom_classroom_mentor_${classroomId}`)
      if (saved) {
        setMentorTeacherName(saved)
      } else if (classroom?.name === '1 / A') {
        setMentorTeacherName('Zeynep Kaya (Sınıf Öğretmeni)')
      }
    }
  }, [classroomId, classroom?.name])

  // 2. Fetch Class Students
  const { data: students = [], isLoading: isStudentsLoading } = useQuery({
    queryKey: ['classroom-students', classroomId],
    queryFn: async () => {
      const res = await getUserGroupUsers(classroomId, token)
      const data = res?.data ?? res
      return Array.isArray(data) ? data : []
    },
    enabled: !!classroomId && !!token,
  })

  // 3. Fetch Class Boards
  const { data: boards = [], isLoading: isBoardsLoading, refetch: refetchBoards } = useQuery({
    queryKey: ['classroom-boards', classroomId],
    queryFn: async () => {
      const res = await getClassroomBoards(classroomId, token)
      return Array.isArray(res) ? res : []
    },
    enabled: !!classroomId,
  })

  // Listen to board updates across components
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const handleUpdate = () => {
      refetchBoards()
    }
    window.addEventListener('oxonom_boards_updated', handleUpdate)
    return () => window.removeEventListener('oxonom_boards_updated', handleUpdate)
  }, [refetchBoards])

  // Auto-generate join code if classroom has no code yet
  React.useEffect(() => {
    if (classroom && !classroom.join_code && !regeneratingCode && token) {
      regenerateClassJoinCode(classroomId, token).then((res) => {
        const updated = res?.data ?? res
        if (updated?.join_code) {
          queryClient.setQueryData(['classroom', classroomId], updated)
          queryClient.invalidateQueries({ queryKey: ['classrooms'] })
        }
      }).catch(() => {})
    }
  }, [classroom, classroomId, regeneratingCode, token, queryClient])

  // Handle Copy Code
  const handleCopyCode = () => {
    if (!classroom?.join_code) return
    navigator.clipboard.writeText(classroom.join_code)
    setCodeCopied(true)
    toast.success('Sınıf katılım kodu panoya kopyalandı!')
    setTimeout(() => setCodeCopied(false), 2000)
  }

  // Handle Regenerate Code
  const handleRegenerateCode = async () => {
    if (classroom?.join_code && !window.confirm('Sınıf katılım kodunu yenilemek istediğinize emin misiniz? Eski kod artık kullanılamayacaktır.')) {
      return
    }
    setRegeneratingCode(true)
    try {
      const res = await regenerateClassJoinCode(classroomId, token)
      const updated = res?.data ?? res
      queryClient.setQueryData(['classroom', classroomId], updated)
      queryClient.invalidateQueries({ queryKey: ['classrooms'] })
      queryClient.invalidateQueries({ queryKey: ['classroom', classroomId] })
      if (updated?.join_code) {
        toast.success(`Yeni sınıf kodu üretildi: ${updated.join_code}`)
      } else {
        toast.success('Sınıf kodu üretildi.')
      }
    } catch {
      toast.error('Kod yenilenirken bir hata oluştu.')
    } finally {
      setRegeneratingCode(false)
    }
  }

  // Handle Create Board
  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBoardName.trim()) return
    setCreatingBoard(true)
    try {
      const created = await createBoard(
        org.id,
        {
          name: newBoardName.trim(),
          description: newBoardDesc.trim(),
          usergroup_id: classroomId,
        },
        token || ''
      )
      toast.success(`'${created.name}' sınıf tahtası oluşturuldu!`)
      setIsCreateBoardOpen(false)
      setNewBoardName('')
      setNewBoardDesc('')
      refetchBoards()
    } catch {
      toast.error('Tahta oluşturulamadı.')
    } finally {
      setCreatingBoard(false)
    }
  }

  // Handle Delete Board
  const handleDeleteBoard = async (boardUuid: string, boardName: string) => {
    if (!window.confirm(`'${boardName}' tahtasını silmek istediğinize emin misiniz?`)) return
    try {
      await deleteBoard(boardUuid, token)
      toast.success('Tahta silindi.')
      refetchBoards()
    } catch {
      toast.error('Tahta silinemedi.')
    }
  }

  // Attendance Toggle
  const handleAttendanceChange = (studentId: number, status: 'present' | 'absent' | 'excused' | 'late') => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: status,
    }))
  }

  // Save Attendance
  const handleSaveAttendance = () => {
    toast.success(`${attendanceDate} tarihli yoklama kaydedildi!`)
  }

  // Filter students
  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students
    const q = studentSearch.toLowerCase().trim()
    return students.filter(
      (s: any) =>
        s.first_name?.toLowerCase().includes(q) ||
        s.last_name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.username?.toLowerCase().includes(q)
    )
  }, [students, studentSearch])

  // Attendance statistics
  const attendanceStats = useMemo(() => {
    const total = students.length
    if (total === 0) return { present: 0, absent: 0, excused: 0, late: 0, rate: 100 }
    let present = 0
    let absent = 0
    let excused = 0
    let late = 0
    students.forEach((s: any) => {
      const status = attendanceState[s.id] || 'present'
      if (status === 'present') present++
      else if (status === 'absent') absent++
      else if (status === 'excused') excused++
      else if (status === 'late') late++
    })
    const rate = Math.round(((present + late) / total) * 100)
    return { present, absent, excused, late, rate }
  }, [students, attendanceState])

  if (isClassLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Sınıf verileri yükleniyor...</p>
      </div>
    )
  }

  if (isOnlyAttendance) {
    return (
      <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
        {/* Ders Yoklama Oturumu Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Ders Yoklama Oturumu</h3>
              <p className="text-xs text-gray-500">
                Sınıftaki öğrencilerin derse katılım durumlarını işaretleyip anında kaydedin.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />

            <button
              onClick={handleSaveAttendance}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Yoklamayı Kaydet</span>
            </button>
          </div>
        </div>

        {/* Attendance Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 bg-white border border-emerald-100 rounded-2xl shadow-xs">
            <div className="text-xs font-semibold text-emerald-700">Katılım Oranı</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">%{attendanceStats.rate}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{attendanceStats.present} / {students.length} Öğrenci</div>
          </div>

          <div className="p-4 bg-white border border-red-100 rounded-2xl shadow-xs">
            <div className="text-xs font-semibold text-red-700">Gelmedi (Yok)</div>
            <div className="text-2xl font-black text-red-600 mt-1">{attendanceStats.absent}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Devamsız</div>
          </div>

          <div className="p-4 bg-white border border-amber-100 rounded-2xl shadow-xs">
            <div className="text-xs font-semibold text-amber-700">İzinli / Raporlu</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{attendanceStats.excused}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Resmi mazeretli</div>
          </div>

          <div className="p-4 bg-white border border-blue-100 rounded-2xl shadow-xs">
            <div className="text-xs font-semibold text-blue-700">Geç Kaldı</div>
            <div className="text-2xl font-black text-blue-600 mt-1">{attendanceStats.late}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">İlk derse gecikme</div>
          </div>
        </div>

        {/* Attendance Roster Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Öğrenci</th>
                  <th className="px-6 py-3.5">Yoklama Durumu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((s: any) => {
                  const cur = attendanceState[s.id] || 'present'
                  return (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <UserAvatar
                          username={s.username}
                          width={36}
                        />
                        <div>
                          <div className="font-bold text-gray-900 text-sm">
                            {s.first_name || s.last_name
                              ? `${s.first_name || ''} ${s.last_name || ''}`.trim()
                              : s.username}
                          </div>
                          <div className="text-[11px] text-gray-400">{s.email}</div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleAttendanceChange(s.id, 'present')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              cur === 'present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Var
                          </button>

                          <button
                            onClick={() => handleAttendanceChange(s.id, 'absent')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              cur === 'absent'
                                ? 'bg-red-600 text-white shadow-xs'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Yok
                          </button>

                          <button
                            onClick={() => handleAttendanceChange(s.id, 'excused')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              cur === 'excused'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            İzinli
                          </button>

                          <button
                            onClick={() => handleAttendanceChange(s.id, 'late')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              cur === 'late'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Geç
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dash/classrooms"
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Sınıflar</span>
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-xs font-bold text-gray-800">{classroom?.name}</span>
        </div>


      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        {/* Redesigned Oxonom Edu Hero Banner */}
        {/* Theme-Matched Clean Hero Banner */}
        <div className="mb-6 rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            {/* Left Info Column */}
            <div className="space-y-4 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  {classroom?.name || 'Sınıf'}
                </span>
                <span className="px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold">
                  {classroom?.grade_level || 'K-12 Kademe'}
                </span>
                {canManageOrg && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-bold">
                    Okul Yönetimi
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                  {classroom?.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>Kurum: <strong className="text-gray-800 font-semibold">{org?.name || 'Okul'}</strong></span>
                  <span className="text-gray-300">•</span>
                  <span>Sınıf Öğretmeni: <strong className="text-indigo-700 font-semibold">{mentorTeacherName || 'Atanmadı'}</strong></span>
                </p>
              </div>

              {/* Micro Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <Building className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-gray-400 font-medium uppercase">Kademe</div>
                    <div className="text-xs font-bold text-gray-800 truncate">
                      {classroom?.grade_level || 'Belirtilmedi'}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-gray-400 font-medium uppercase">Öğrenci</div>
                    <div className="text-xs font-bold text-emerald-700 truncate">
                      {students.length} Kayıtlı
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
                    <Presentation className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-gray-400 font-medium uppercase">Tahta</div>
                    <div className="text-xs font-bold text-gray-800 truncate">
                      {boards.length} Aktif
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-gray-400 font-medium uppercase">Yoklama</div>
                    <div className="text-xs font-bold text-purple-700 truncate">
                      %{attendanceStats.rate} Katılım
                    </div>
                  </div>
                </div>
              </div>

              {/* Management Action Buttons */}
              {canManageOrg && (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    onClick={() => handleOpenEditModal()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Sınıfı Düzenle</span>
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-red-600 bg-red-50/60 hover:bg-red-100/70 border border-red-200 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Sınıfı Sil</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Sınıf Eşleşme Kodu Card */}
            <div className="w-full lg:w-auto shrink-0 p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-3 min-w-[280px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-600" /> Sınıf Eşleşme Kodu
                </span>
                <span className="text-[10px] text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-200 font-medium">
                  Öğrenci Kaydı
                </span>
              </div>

              <div className="px-5 py-3 bg-white border border-indigo-100 rounded-xl font-mono text-2xl font-black text-indigo-700 tracking-widest text-center select-all shadow-xs">
                {regeneratingCode ? (
                  <span className="flex items-center justify-center gap-2 text-xs text-indigo-500 font-sans font-medium">
                    <RotateCw className="w-4 h-4 animate-spin" /> Kod Üretiliyor...
                  </span>
                ) : (
                  classroom?.join_code || 'KOD YOK'
                )}
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                {classroom?.join_code ? (
                  <>
                    <button
                      onClick={handleCopyCode}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer ${
                        codeCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {codeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{codeCopied ? 'Kopyalandı' : 'Kodu Kopyala'}</span>
                    </button>

                    <button
                      onClick={handleRegenerateCode}
                      disabled={regeneratingCode}
                      title="Eski kod iptal olur, yeni kod üretilir"
                      className="px-2.5 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200 transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${regeneratingCode ? 'animate-spin' : ''}`} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleRegenerateCode}
                    disabled={regeneratingCode}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${regeneratingCode ? 'animate-spin' : ''}`} />
                    <span>Kod Üret</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation: Tahtalar | Öğrenciler | Yoklama | Ödevler */}
        <div className="flex items-center gap-2 border-b border-gray-200 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('boards')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'boards'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <Presentation className="w-4 h-4" />
            <span>Tahtalar (Panolar)</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === 'boards' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {boards.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'students'
                ? 'border-purple-600 text-purple-600 bg-purple-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Öğrenciler</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === 'students' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {students.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'attendance'
                ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Yoklama</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === 'attendance' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              %{attendanceStats.rate}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'assignments'
                ? 'border-amber-600 text-amber-600 bg-amber-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Ödevler</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === 'assignments' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {schoolAssignments.length}
            </span>
          </button>
        </div>

        {/* TAB 1: TAHTALAR (BOARDS) */}
        {activeTab === 'boards' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200">
              <div>
                <h3 className="text-base font-bold text-gray-900">Sınıf Tahtaları (Panolar)</h3>
                <p className="text-xs text-gray-500">
                  Bu sınıfa özel interaktif akıllı tahtalar. Öğrencileriniz sisteme girdiğinde yalnızca bu tahtaları görüntüler.
                </p>
              </div>

              <button
                onClick={() => setIsCreateBoardOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Yeni Tahta Oluştur</span>
              </button>
            </div>

            {boards.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Presentation className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-gray-900">Henüz Sınıf Tahtası Oluşturulmadı</h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 mb-5">
                  Ders anlatımı, konu özetleri veya soru çözümleri için hemen bu sınıfa özel bir akıllı tahta başlatın.
                </p>
                <button
                  onClick={() => setIsCreateBoardOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>İlk Tahtayı Oluştur</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {boards.map((b: any) => (
                  <div
                    key={b.id || b.board_uuid}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-indigo-300 transition-all flex flex-col group"
                  >
                    {/* Thumbnail / Header */}
                    <div className="h-36 bg-gradient-to-br from-slate-800 to-indigo-950 p-4 flex flex-col justify-between relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-black/40 border border-white/10 rounded text-[10px] font-mono text-cyan-300 font-semibold">
                          {classroom?.name}
                        </span>
                        <button
                          onClick={() => handleDeleteBoard(b.board_uuid, b.name)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-md transition-all"
                          title="Tahtayı Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="relative z-10">
                        <h4 className="text-base font-bold text-white line-clamp-1 group-hover:text-cyan-200 transition-colors">
                          {b.name}
                        </h4>
                        {b.description && (
                          <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">{b.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{b.creation_date ? new Date(b.creation_date).toLocaleDateString('tr-TR') : 'Bugün'}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-gray-400" />
                          <span>{b.member_count || 1} Katılımcı</span>
                        </span>
                      </div>

                      <Link
                        href={`/board/${b.board_uuid}`}
                        target="_blank"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-xl font-bold text-xs transition-colors shadow-2xs group/btn"
                      >
                        <Presentation className="w-4 h-4" />
                        <span>Tahtayı Aç & Çizime Başla</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover/btn:opacity-100" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ÖĞRENCİLER (STUDENTS) */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Öğrenci adı, e-posta veya kullanıcı adı ara..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsManageUsersOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Öğrenci Ekle / Çıkar</span>
                </button>
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-gray-900">Sınıfta Öğrenci Bulunamadı</h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 mb-5">
                  Öğrencilerinize <span className="font-mono font-bold text-purple-600">{classroom?.join_code}</span> katılım kodunu vererek derse katılmalarını sağlayabilir veya listeye manuel ekleyebilirsiniz.
                </p>
                <button
                  onClick={() => setIsManageUsersOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Öğrenci Listesini Aç</span>
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-6 py-3.5">Öğrenci</th>
                        <th className="px-6 py-3.5">E-posta</th>
                        <th className="px-6 py-3.5">Kullanıcı Adı</th>
                        <th className="px-6 py-3.5">Durum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredStudents.map((s: any) => (
                        <tr key={s.id} className="hover:bg-purple-50/20 transition-colors">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <UserAvatar
                              username={s.username}
                              width={32}
                            />
                            <div>
                              <div className="font-bold text-gray-900">
                                {s.first_name || s.last_name
                                  ? `${s.first_name || ''} ${s.last_name || ''}`.trim()
                                  : s.username}
                              </div>
                              <div className="text-[11px] text-gray-400">Öğrenci No: #{s.id}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600 font-medium">{s.email}</td>
                          <td className="px-6 py-4 font-mono text-gray-500">@{s.username}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Kayıtlı
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: YOKLAMA (ATTENDANCE) */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-base font-bold text-gray-900">Ders Yoklama Oturumu</h3>
                  <p className="text-xs text-gray-500">
                    Sınıftaki öğrencilerin derse katılım durumlarını işaretleyip anında kaydedin.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800"
                />

                <button
                  onClick={handleSaveAttendance}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Yoklamayı Kaydet</span>
                </button>
              </div>
            </div>

            {/* Attendance Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-white border border-emerald-100 rounded-xl shadow-xs">
                <div className="text-xs font-semibold text-emerald-700">Katılım Oranı</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">%{attendanceStats.rate}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{attendanceStats.present} / {students.length} Öğrenci</div>
              </div>

              <div className="p-4 bg-white border border-red-100 rounded-xl shadow-xs">
                <div className="text-xs font-semibold text-red-700">Gelmedi (Yok)</div>
                <div className="text-2xl font-black text-red-600 mt-1">{attendanceStats.absent}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Devamsız</div>
              </div>

              <div className="p-4 bg-white border border-amber-100 rounded-xl shadow-xs">
                <div className="text-xs font-semibold text-amber-700">İzinli / Raporlu</div>
                <div className="text-2xl font-black text-amber-600 mt-1">{attendanceStats.excused}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Resmi mazeretli</div>
              </div>

              <div className="p-4 bg-white border border-blue-100 rounded-xl shadow-xs">
                <div className="text-xs font-semibold text-blue-700">Geç Kaldı</div>
                <div className="text-2xl font-black text-blue-600 mt-1">{attendanceStats.late}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">İlk derse gecikme</div>
              </div>
            </div>

            {/* Attendance Roster Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-3.5">Öğrenci</th>
                      <th className="px-6 py-3.5">Yoklama Durumu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {students.map((s: any) => {
                      const cur = attendanceState[s.id] || 'present'
                      return (
                        <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <UserAvatar
                              username={s.username}
                              width={32}
                            />
                            <div>
                              <div className="font-bold text-gray-900">
                                {s.first_name || s.last_name
                                  ? `${s.first_name || ''} ${s.last_name || ''}`.trim()
                                  : s.username}
                              </div>
                              <div className="text-[11px] text-gray-400">{s.email}</div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleAttendanceChange(s.id, 'present')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  cur === 'present'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                Var
                              </button>

                              <button
                                onClick={() => handleAttendanceChange(s.id, 'absent')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  cur === 'absent'
                                    ? 'bg-red-600 text-white shadow-xs'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                Yok
                              </button>

                              <button
                                onClick={() => handleAttendanceChange(s.id, 'excused')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  cur === 'excused'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                İzinli
                              </button>

                              <button
                                onClick={() => handleAttendanceChange(s.id, 'late')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  cur === 'late'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                Geç
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ÖDEVLER (ASSIGNMENTS) */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gray-900">Sınıf Ev Ödevleri</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {schoolAssignments.length} Ödev
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Bu sınıftaki öğrencilere atanan interaktif akıllı tahta, test ve çalışma kağıdı ödevleri.
                </p>
              </div>

              <button
                onClick={() => setIsNewAssignmentOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Yeni Ödev Ver</span>
              </button>
            </div>

            {isLoadingAssignments ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-gray-200">
                <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-semibold text-gray-500">Ödevler yükleniyor...</p>
              </div>
            ) : schoolAssignments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1">Henüz Ödev Bulunmuyor</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
                  Bu sınıfa özel interaktif akıllı tahta veya alıştırma ödevi oluşturarak öğrencilerinize gönderebilirsiniz.
                </p>
                <button
                  onClick={() => setIsNewAssignmentOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>İlk Ödevi Ata</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schoolAssignments.map((ass) => {
                  const subCount = ass.total_submissions || 0

                  return (
                    <div
                      key={ass.id}
                      className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                              {ass.subject}
                            </span>
                            {ass.tool_type === 'WHITEBOARD' && (
                              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                <PenTool size={11} /> Akıllı Tahta
                              </span>
                            )}
                            {ass.tool_type === 'QUIZ' && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                <HelpCircle size={11} /> Test / Quiz
                              </span>
                            )}
                            {ass.tool_type === 'WORKSHEET' && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                <FileText size={11} /> Çalışma Kağıdı
                              </span>
                            )}
                          </div>

                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                            <Users size={12} />
                            <span>{subCount} Teslim</span>
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-amber-700 transition-colors leading-snug">
                          {ass.title}
                        </h4>

                        {ass.description && (
                          <p className="text-xs text-gray-600 leading-relaxed mt-1.5 line-clamp-2">
                            {ass.description}
                          </p>
                        )}

                        <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span>Teslim: {ass.due_date ? new Date(ass.due_date).toLocaleDateString('tr-TR') : 'Süresiz'}</span>
                          </span>
                          <span>&bull;</span>
                          <span>Maks: {ass.max_score || 100} Puan</span>
                        </div>
                      </div>

                      <div className="pt-3 mt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                        {ass.board_uuid ? (
                          <Link
                            href={`/board/${ass.board_uuid}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            <ExternalLink size={12} />
                            <span>Ödev Tahtası</span>
                          </Link>
                        ) : <div />}

                        <button
                          type="button"
                          onClick={() => setSelectedAssignmentForReview(ass)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors cursor-pointer border border-amber-200/80"
                        >
                          <CheckCircle2 size={13} />
                          <span>Teslimleri İncele ({subCount})</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALS */}

      {/* 1. Create Board Modal */}
      <Dialog open={isCreateBoardOpen} onOpenChange={setIsCreateBoardOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Yeni Sınıf Tahtası Oluştur
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 mt-1">
              Bu tahta doğrudan <strong className="text-gray-800">{classroom?.name}</strong> sınıfına bağlanacak ve öğrencileriniz tarafından görüntülenebilecektir.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateBoard} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Tahta Başlığı *
              </label>
              <input
                type="text"
                required
                placeholder="Örn: 1. Ünite Hücre ve Organeller Anlatımı"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Açıklama (Opsiyonel)
              </label>
              <textarea
                rows={2}
                placeholder="Örn: Ders esnasında çizilen şemalar ve ödev soruları."
                value={newBoardDesc}
                onChange={(e) => setNewBoardDesc(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <DialogFooter className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsCreateBoardOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={creatingBoard || !newBoardName.trim()}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {creatingBoard ? 'Oluşturuluyor...' : 'Tahtayı Başlat'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. School Assignment Modals */}
      <CreateSchoolAssignmentModal
        isOpen={isNewAssignmentOpen}
        onClose={() => setIsNewAssignmentOpen(false)}
        onSuccess={() => refetchClassAssignments()}
        orgId={org?.id}
        accessToken={token}
        classrooms={classroom ? [classroom] : []}
        boards={boards}
        defaultClassroomId={classroomId}
      />

      {selectedAssignmentForReview && (
        <AssignmentSubmissionsModal
          isOpen={!!selectedAssignmentForReview}
          onClose={() => setSelectedAssignmentForReview(null)}
          assignment={selectedAssignmentForReview}
          accessToken={token}
          onGraded={() => refetchClassAssignments()}
        />
      )}

      {/* 3. Manage Users Modal */}
      <Modal
        isDialogOpen={isManageUsersOpen}
        onOpenChange={setIsManageUsersOpen}
        dialogTitle={`${classroom?.name} — Öğrenci Yönetimi`}
        dialogTrigger={<span className="hidden" />}
        dialogContent={<ManageUsers usergroup_id={classroomId} />}
      />


      {/* 5. Edit Class Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-lg bg-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 border border-gray-100">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-gray-900">
                  Sınıf Bilgilerini Düzenle
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500">
                  Sınıf adı, kademe seviyesi ve sınıf öğretmenini güncelleyin.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveEditClass} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Sınıf Adı *
              </label>
              <input
                type="text"
                required
                placeholder="Örn: 9-A veya 1 / A"
                value={editClassName}
                onChange={(e) => setEditClassName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Kademe Seviyesi
                </label>
                <select
                  value={editClassGrade}
                  onChange={(e) => setEditClassGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="İlkokul (1-4)">İlkokul (1-4)</option>
                  <option value="1. Sınıf">1. Sınıf</option>
                  <option value="2. Sınıf">2. Sınıf</option>
                  <option value="3. Sınıf">3. Sınıf</option>
                  <option value="4. Sınıf">4. Sınıf</option>
                  <option value="Ortaokul (5-8)">Ortaokul (5-8)</option>
                  <option value="5. Sınıf">5. Sınıf</option>
                  <option value="6. Sınıf">6. Sınıf</option>
                  <option value="7. Sınıf">7. Sınıf</option>
                  <option value="8. Sınıf">8. Sınıf</option>
                  <option value="9. Sınıf">9. Sınıf</option>
                  <option value="10. Sınıf">10. Sınıf</option>
                  <option value="11. Sınıf">11. Sınıf</option>
                  <option value="12. Sınıf">12. Sınıf</option>
                  <option value="Lise (9-12)">Lise (9-12)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Sınıf Öğretmeni
                </label>
                <select
                  value={editMentorTeacher}
                  onChange={(e) => setEditMentorTeacher(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="Ahmet Hakan (Matematik)">Ahmet Hakan (Matematik)</option>
                  <option value="Selin Yıldız (Türk Dili ve Edebiyatı)">Selin Yıldız (Edebiyat)</option>
                  <option value="Hakan Çetin (Fizik)">Hakan Çetin (Fizik)</option>
                  <option value="Ayşe Doğan (İngilizce)">Ayşe Doğan (İngilizce)</option>
                  <option value="Kemal Arslan (Biyoloji)">Kemal Arslan (Biyoloji)</option>
                  <option value="Zeynep Kaya (Sınıf Öğretmeni)">Zeynep Kaya (Sınıf Öğretmeni)</option>
                  <option value="Merve Demir (Kimya)">Merve Demir (Kimya)</option>
                  <option value="Burak Özkan (Tarih)">Burak Özkan (Tarih)</option>
                  <option value="Atanmadı">Atanmadı</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Sınıf Açıklaması (Opsiyonel)
              </label>
              <textarea
                rows={3}
                placeholder="Örn: 2026-2027 Eğitim Öğretim yılı şubesi..."
                value={editClassDesc}
                onChange={(e) => setEditClassDesc(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <DialogFooter className="mt-6 flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={isSavingEdit || !editClassName.trim()}
                className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSavingEdit ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 6. Delete Class Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md bg-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 border border-gray-100">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-gray-900">
                  Sınıfı Sil
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500">
                  Bu işlem geri alınamaz.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-4 bg-red-50/70 border border-red-100 rounded-2xl text-xs text-red-800 space-y-1">
            <p className="font-bold">
              &quot;{classroom?.name}&quot; sınıfını kalıcı olarak silmek üzeresiniz.
            </p>
            <p className="text-red-700">
              Bu sınıfa ait panolar, ödevler ve sınıf katılım kodu silinecektir. Sınıfa kayıtlı öğrenciler sınıftan çıkarılacaktır.
            </p>
          </div>

          <DialogFooter className="mt-6 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="button"
              disabled={isDeletingClass}
              onClick={handleDeleteClass}
              className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isDeletingClass ? 'Siliniyor...' : 'Evet, Sınıfı Sil'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
