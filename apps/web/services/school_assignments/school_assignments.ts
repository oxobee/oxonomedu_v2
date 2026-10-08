import { getAPIUrl } from '@services/config/config'
import {
  RequestBodyWithAuthHeader,
  errorHandling,
  getResponseMetadata,
} from '@services/utils/ts/requests'
import {
  generateAssignmentSubmissionsData,
  ALL_CLASSROOMS,
  generateClassroomAssignments,
} from '@services/demo/schoolDirectory'
import { createBoard } from '@services/boards/boards'

export const CUSTOM_ASSIGNMENTS_STORAGE_KEY = 'oxonom_custom_school_assignments_v2'

export function getStoredCustomAssignments(orgId?: number): SchoolAssignmentItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CUSTOM_ASSIGNMENTS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch (e) {
    return []
  }
}

export function saveStoredCustomAssignment(asg: SchoolAssignmentItem): void {
  if (typeof window === 'undefined') return
  try {
    const current = getStoredCustomAssignments()
    const filtered = current.filter(
      (a) => a.assignment_uuid !== asg.assignment_uuid && String(a.id) !== String(asg.id)
    )
    const updated = [asg, ...filtered]
    localStorage.setItem(CUSTOM_ASSIGNMENTS_STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('oxonom_assignments_updated', { detail: asg }))
  } catch (e) {
    console.warn('Failed to save custom assignment to storage:', e)
  }
}

export function deleteStoredCustomAssignment(assignmentUuid: string): void {
  if (typeof window === 'undefined') return
  try {
    const current = getStoredCustomAssignments()
    const updated = current.filter(
      (a) => a.assignment_uuid !== assignmentUuid && String(a.id) !== assignmentUuid
    )
    localStorage.setItem(CUSTOM_ASSIGNMENTS_STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(
      new CustomEvent('oxonom_assignments_updated', {
        detail: { assignment_uuid: assignmentUuid },
      })
    )
  } catch (e) {
    console.warn('Failed to delete custom assignment from storage:', e)
  }
}

export interface SchoolAssignmentItem {
  id: number
  assignment_uuid: string
  title: string
  description?: string
  grade_level: string
  grade_category: string
  subject: string
  tool_type: 'WHITEBOARD' | 'WORKSHEET' | 'QUIZ' | 'READING' | 'PROJECT'
  tool_data?: Record<string, any>
  board_uuid?: string
  usergroup_ids?: number[]
  classes?: { id: number; name: string; code?: string }[]
  due_date?: string
  max_score: number
  published: boolean
  created_by?: number
  teacher_name?: string
  creation_date?: string
  total_submissions?: number
  graded_submissions?: number
  average_score?: number | null
  submission?: {
    id: number | null
    status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'LATE'
    submission_date?: string | null
    student_content?: Record<string, any>
    score?: number | null
    teacher_feedback?: string | null
    graded_at?: string | null
    is_late?: boolean
    late_duration_text?: string
  }
}

export interface StudentSubmissionRow {
  user_id: number
  name: string
  username: string
  avatar_image?: string
  classroom_name: string
  classroom_id: number
  submission_id?: number | null
  status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'LATE'
  submission_date?: string | null
  student_content?: Record<string, any>
  score?: number | null
  teacher_feedback?: string | null
  graded_at?: string | null
  is_late?: boolean
  late_duration_text?: string
}

export function formatDueDate(dateStr?: string | null): string {
  if (!dateStr) return 'Süresiz'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day}.${month}.${year} ${hours}:${minutes}`
}

export function formatLateDuration(diffMs: number): string {
  if (diffMs <= 0) return 'Zamanında Teslim'
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    const remHours = diffHours % 24
    return remHours > 0 ? `${diffDays} gün ${remHours} saat geç` : `${diffDays} gün geç`
  }
  if (diffHours > 0) {
    const remMinutes = diffMinutes % 60
    return remMinutes > 0 ? `${diffHours} saat ${remMinutes} dk geç` : `${diffHours} saat geç`
  }
  return `${Math.max(1, diffMinutes)} dakika geç`
}

export interface SubmissionsResponse {
  assignment: SchoolAssignmentItem
  total_students: number
  submitted_count: number
  graded_count: number
  students: StudentSubmissionRow[]
}

export async function createSchoolAssignment(
  orgId: number,
  data: {
    title: string
    description?: string
    grade_level: string
    grade_category: string
    subject: string
    tool_type: string
    tool_data?: Record<string, any>
    board_uuid?: string
    create_new_board?: boolean
    new_board_name?: string
    usergroup_ids: number[]
    due_date?: string
    max_score?: number
    published?: boolean
  },
  accessToken: string
) {
  let createdAssignment: SchoolAssignmentItem | null = null
  let boardUuid = data.board_uuid

  // If interactive whiteboard is requested and a new board should be created
  if (data.tool_type === 'WHITEBOARD' && (data.create_new_board || !boardUuid)) {
    try {
      const newBoard = await createBoard(
        orgId || 1,
        {
          name: data.new_board_name || `${data.title} — Ödev Tahtası`,
          description: data.description || 'Ödev için hazırlanan interaktif akıllı tahta.',
          usergroup_id: data.usergroup_ids?.[0],
        },
        accessToken || ''
      )
      if (newBoard?.board_uuid) {
        boardUuid = newBoard.board_uuid
      }
    } catch (_e) {}
  }

  const payload = {
    ...data,
    board_uuid: boardUuid,
  }

  try {
    const targetOrgId = orgId || 1
    const result = await fetch(
      `${getAPIUrl()}school_assignments/org/${targetOrgId}`,
      RequestBodyWithAuthHeader('POST', payload, null, accessToken || '')
    )
    if (result.ok) {
      const resData = await errorHandling(result)
      if (resData && (resData.assignment_uuid || resData.id)) {
        createdAssignment = resData
      }
    }
  } catch (err) {
    console.warn('API call failed in createSchoolAssignment, falling back to local creation:', err)
  }

  if (!createdAssignment || !createdAssignment.assignment_uuid) {
    const uniqueId = Date.now()
    createdAssignment = {
      id: uniqueId,
      assignment_uuid: `sch_asg_${uniqueId}_${Math.random().toString(36).substring(2, 7)}`,
      title: data.title,
      description: data.description || '',
      grade_level: data.grade_level,
      grade_category: data.grade_category,
      subject: data.subject,
      tool_type: data.tool_type as any,
      tool_data: data.tool_data || {},
      board_uuid: boardUuid,
      usergroup_ids: data.usergroup_ids,
      classes: data.usergroup_ids?.map((id) => ({ id, name: `${id}. Sınıf` })) || [],
      due_date: data.due_date || undefined,
      max_score: data.max_score || 100,
      published: data.published ?? true,
      teacher_name: 'Öğretmen',
      creation_date: new Date().toISOString(),
      total_submissions: 0,
      graded_submissions: 0,
      average_score: null,
      submission: {
        id: null,
        status: 'PENDING',
      },
    }
  }

  // Prepend in-memory so any immediate sync renders it
  const filteredDefaults = DEFAULT_SCHOOL_ASSIGNMENTS.filter(
    (a) => a.assignment_uuid !== createdAssignment!.assignment_uuid && a.id !== createdAssignment!.id
  )
  DEFAULT_SCHOOL_ASSIGNMENTS.length = 0
  DEFAULT_SCHOOL_ASSIGNMENTS.push(createdAssignment, ...filteredDefaults)

  // Persist to localStorage
  saveStoredCustomAssignment(createdAssignment)

  return createdAssignment
}

export const DEFAULT_SCHOOL_ASSIGNMENTS: SchoolAssignmentItem[] = [
  {
    id: 101,
    assignment_uuid: 'asg_ritmik_sayma_01',
    title: '1-A Matematik: Ritmik Sayma & Sayı Doğrusu Etkinliği',
    description: '1’er ve 2’şer ileriye doğru ritmik sayma kurallarını sayı doğrusunda zıplayarak tamamlayınız.',
    grade_level: '1. Sınıf',
    grade_category: 'İlkokul',
    subject: 'Matematik',
    tool_type: 'WHITEBOARD',
    board_uuid: 'board_6be7ebed-4c00-4243-9a9b-ffef9933803b',
    usergroup_ids: [101],
    classes: [{ id: 101, name: '1-A Şubesi', code: '1-A' }],
    due_date: '2026-10-15T23:59:00',
    max_score: 100,
    published: true,
    teacher_name: 'Özlem ZOR',
    total_submissions: 0,
    graded_submissions: 0,
    average_score: null,
    submission: {
      id: null,
      status: 'PENDING',
      score: null,
    },
  },
  {
    id: 102,
    assignment_uuid: 'asg_hizli_okuma_02',
    title: '1-A Türkçe: 1 Dk Hızlı Okuma & Kelime Sayacı Çalışması',
    description: 'Verilen metni 1 dakika boyunca sesli okuyarak kelime sayacını başlatınız ve puanınızı kaydediniz.',
    grade_level: '1. Sınıf',
    grade_category: 'İlkokul',
    subject: 'Türkçe',
    tool_type: 'READING',
    usergroup_ids: [101],
    classes: [{ id: 101, name: '1-A Şubesi', code: '1-A' }],
    due_date: '2026-10-16T23:59:00',
    max_score: 100,
    published: true,
    teacher_name: 'Özlem ZOR',
    total_submissions: 0,
    graded_submissions: 0,
    average_score: null,
    submission: {
      id: null,
      status: 'PENDING',
      score: null,
    },
  },
  {
    id: 103,
    assignment_uuid: 'asg_harf_cizgi_03',
    title: '1-A Türkçe: Harf Çizgi & Yazılış Yönü Atölyesi (Dik Temel Harfler)',
    description: 'MEB standart dik temel harfleri ok yönlerini takip ederek tamamlayınız.',
    grade_level: '1. Sınıf',
    grade_category: 'İlkokul',
    subject: 'Türkçe',
    tool_type: 'WORKSHEET',
    usergroup_ids: [101],
    classes: [{ id: 101, name: '1-A Şubesi', code: '1-A' }],
    due_date: '2026-10-18T23:59:00',
    max_score: 100,
    published: true,
    teacher_name: 'Özlem ZOR',
    total_submissions: 0,
    graded_submissions: 0,
    average_score: null,
    submission: {
      id: null,
      status: 'PENDING',
      score: null,
    },
  },
  {
    id: 104,
    assignment_uuid: 'asg_kesirler_ortaokul_04',
    title: '5-A Matematik: Kesirler ve Sayı Doğrusu Modellemesi',
    description: 'Basit ve bileşik kesirleri pasta dilimi ve sayı doğrusu modelleriyle eşleştiriniz.',
    grade_level: '5. Sınıf',
    grade_category: 'Ortaokul',
    subject: 'Matematik',
    tool_type: 'WHITEBOARD',
    board_uuid: 'board_2aa88e1a-dcc0-451b-9924-4b075f3f8e2e',
    usergroup_ids: [201],
    classes: [{ id: 201, name: '5-A Şubesi', code: '5-A' }],
    due_date: '2026-10-20T23:59:00',
    max_score: 100,
    published: true,
    teacher_name: 'Esin AKKAN',
    total_submissions: 0,
    graded_submissions: 0,
    average_score: null,
    submission: {
      id: null,
      status: 'PENDING',
      score: null,
    },
  },
  {
    id: 105,
    assignment_uuid: 'asg_gunes_sistemi_05',
    title: '6-A Fen Bilimleri: Güneş Sistemi ve Gezegenler Simülasyonu',
    description: '3D gezegen simülasyonunu inceleyerek gezegenlerin Güneş’e yakınlık sıralamasını belirleyiniz.',
    grade_level: '6. Sınıf',
    grade_category: 'Ortaokul',
    subject: 'Fen Bilimleri',
    tool_type: 'QUIZ',
    usergroup_ids: [202],
    classes: [{ id: 202, name: '6-A Şubesi', code: '6-A' }],
    due_date: '2026-10-22T23:59:00',
    max_score: 100,
    published: true,
    teacher_name: 'Murat ESEN',
    total_submissions: 0,
    graded_submissions: 0,
    average_score: null,
    submission: {
      id: null,
      status: 'PENDING',
      score: null,
    },
  },
  {
    id: 106,
    assignment_uuid: 'asg_osmanli_tarih_06',
    title: '7-A Sosyal Bilgiler: Osmanlı Devleti Kuruluş Dönemi Kavram Haritası',
    description: 'Beylikten devlete geçiş sürecindeki önemli savaşlar ve hükümdarlar kronolojisi.',
    grade_level: '7. Sınıf',
    grade_category: 'Ortaokul',
    subject: 'Sosyal Bilgiler',
    tool_type: 'WHITEBOARD',
    board_uuid: 'board_93a22f1c-4071-4fbc-b42a-82411a2a9faf',
    usergroup_ids: [203],
    classes: [{ id: 203, name: '7-A Şubesi', code: '7-A' }],
    due_date: '2026-10-25T23:59:00',
    max_score: 100,
    published: true,
    teacher_name: 'Makbule YILDIRIM',
    total_submissions: 0,
    graded_submissions: 0,
    average_score: null,
    submission: {
      id: null,
      status: 'PENDING',
      score: null,
    },
  },
  {
    id: 107,
    assignment_uuid: 'asg_lgs_carpanlar_07',
    title: '8-A LGS Matematik: Çarpanlar ve Katlar Yeni Nesil Soru Çözümü',
    description: 'EBOB-EKOK problemleri ve MEB örnek soruları üzerinden akıllı tahta çözümleri.',
    grade_level: '8. Sınıf',
    grade_category: 'Ortaokul',
    subject: 'Matematik',
    tool_type: 'WHITEBOARD',
    board_uuid: 'board_2ec16e01-3744-4a40-93dc-228016b8a937',
    usergroup_ids: [204],
    classes: [{ id: 204, name: '8-A Şubesi', code: '8-A' }],
    due_date: '2026-10-26T23:59:00',
    max_score: 100,
    published: true,
    teacher_name: 'Gülümser ERMEZ',
    total_submissions: 0,
    graded_submissions: 0,
    average_score: null,
    submission: {
      id: null,
      status: 'PENDING',
      score: null,
    },
  },
]

export async function getSchoolAssignments(
  orgId: number,
  filters: {
    usergroup_id?: number | null
    grade_level?: string | null
    grade_category?: string | null
    subject?: string | null
    tool_type?: string | null
  },
  accessToken: string
): Promise<SchoolAssignmentItem[]> {
  let list: SchoolAssignmentItem[] = []
  try {
    const params = new URLSearchParams()
    if (filters.usergroup_id) params.set('usergroup_id', String(filters.usergroup_id))
    if (filters.grade_level && filters.grade_level !== 'all') params.set('grade_level', filters.grade_level)
    if (filters.grade_category && filters.grade_category !== 'all') params.set('grade_category', filters.grade_category)
    if (filters.subject && filters.subject !== 'all') params.set('subject', filters.subject)
    if (filters.tool_type && filters.tool_type !== 'all') params.set('tool_type', filters.tool_type)

    const targetOrgId = orgId || 1
    const url = `${getAPIUrl()}school_assignments/org/${targetOrgId}${params.toString() ? '?' + params.toString() : ''}`
    const result = await fetch(url, RequestBodyWithAuthHeader('GET', null, null, accessToken || ''))
    if (result.ok) {
      const data = await errorHandling(result)
      if (Array.isArray(data) && data.length > 0) {
        list = data
      }
    }
  } catch (_e) {}

  if (list.length === 0) {
    if (filters.usergroup_id) {
      const targetClass = ALL_CLASSROOMS.find((c) => c.id === filters.usergroup_id)
      if (targetClass) {
        list = generateClassroomAssignments(targetClass) as any
      } else {
        list = DEFAULT_SCHOOL_ASSIGNMENTS.filter((a) => !a.usergroup_ids || a.usergroup_ids.includes(filters.usergroup_id!))
      }
    } else {
      list = [...DEFAULT_SCHOOL_ASSIGNMENTS]
    }
  }

  // Merge client-side stored custom assignments
  const stored = getStoredCustomAssignments(orgId)
  const existingUuids = new Set(list.map((a) => a.assignment_uuid))
  const newFromStored = stored.filter((a) => !existingUuids.has(a.assignment_uuid))
  list = [...newFromStored, ...list]

  // Filter default/fetched assignments based on criteria
  return list.filter((a) => {
    if (filters.usergroup_id && a.usergroup_ids && a.usergroup_ids.length > 0 && !a.usergroup_ids.includes(filters.usergroup_id)) return false
    if (filters.grade_category && filters.grade_category !== 'all' && a.grade_category && a.grade_category !== filters.grade_category) return false
    if (filters.grade_level && filters.grade_level !== 'all' && a.grade_level && a.grade_level !== filters.grade_level) return false
    if (filters.subject && filters.subject !== 'all' && a.subject !== filters.subject) return false
    if (filters.tool_type && filters.tool_type !== 'all' && a.tool_type !== filters.tool_type) return false
    return true
  })
}

export async function getSchoolAssignmentDetail(
  assignmentUuid: string,
  accessToken: string
): Promise<SchoolAssignmentItem> {
  const stored = getStoredCustomAssignments()
  const storedMatch = stored.find((a) => a.assignment_uuid === assignmentUuid || String(a.id) === assignmentUuid)
  if (storedMatch) return storedMatch

  try {
    const result = await fetch(
      `${getAPIUrl()}school_assignments/${assignmentUuid}`,
      RequestBodyWithAuthHeader('GET', null, null, accessToken || '')
    )
    if (result.ok) {
      return await errorHandling(result)
    }
  } catch (_e) {}

  const match = DEFAULT_SCHOOL_ASSIGNMENTS.find((a) => a.assignment_uuid === assignmentUuid || String(a.id) === assignmentUuid)
  return match || DEFAULT_SCHOOL_ASSIGNMENTS[0]
}

export async function getStudentAssignments(
  orgId: number,
  accessToken: string,
  usergroupId?: number | null
): Promise<SchoolAssignmentItem[]> {
  let list = DEFAULT_SCHOOL_ASSIGNMENTS
  try {
    const targetOrgId = orgId || 1
    const param = usergroupId ? `&usergroup_id=${usergroupId}` : ''
    const result = await fetch(
      `${getAPIUrl()}school_assignments/student/my_assignments?org_id=${targetOrgId}${param}`,
      RequestBodyWithAuthHeader('GET', null, null, accessToken || '')
    )
    if (result.ok) {
      const data = await errorHandling(result)
      if (Array.isArray(data) && data.length > 0) list = data
    }
  } catch (_e) {}

  if (usergroupId) {
    const targetClass = ALL_CLASSROOMS.find((c) => c.id === usergroupId)
    if (targetClass) {
      list = generateClassroomAssignments(targetClass) as any
    } else {
      list = DEFAULT_SCHOOL_ASSIGNMENTS.filter((a) => !a.usergroup_ids || a.usergroup_ids.includes(usergroupId))
    }
  }

  // Merge stored custom assignments
  const stored = getStoredCustomAssignments(orgId)
  const filteredStored = usergroupId
    ? stored.filter((a) => !a.usergroup_ids || a.usergroup_ids.length === 0 || a.usergroup_ids.includes(usergroupId))
    : stored
  const existingUuids = new Set(list.map((a) => a.assignment_uuid))
  const newFromStored = filteredStored.filter((a) => !existingUuids.has(a.assignment_uuid))
  list = [...newFromStored, ...list]

  if (typeof window !== 'undefined') {
    try {
      list = list.map((asg) => {
        let sub = asg.submission
        const saved = localStorage.getItem(`oxonom_submission_${asg.assignment_uuid}`)
        if (saved) {
          const parsed = JSON.parse(saved)
          sub = {
            id: parsed.submission_id || 501,
            status: parsed.status || (parsed.is_late ? 'LATE' : 'SUBMITTED'),
            submission_date: parsed.submission_date,
            is_late: Boolean(parsed.is_late),
            late_duration_text: parsed.late_duration_text || '',
            student_content: parsed.student_content,
            score: asg.submission?.score ?? null,
            teacher_feedback: asg.submission?.teacher_feedback ?? null,
          }
        }
        // Also check teacher grade
        const savedGrades = localStorage.getItem(`oxonom_grades_${asg.assignment_uuid}`)
        if (savedGrades) {
          const parsedG = JSON.parse(savedGrades)
          const myGrade = parsedG[1001] || parsedG['ogrenci']
          if (myGrade && typeof myGrade.score === 'number') {
            sub = {
              ...(sub || { id: 501 }),
              status: 'GRADED',
              score: myGrade.score,
              teacher_feedback: myGrade.teacher_feedback || null,
              graded_at: myGrade.graded_at || null,
            }
          }
        }
        return {
          ...asg,
          submission: sub,
        }
      })
    } catch {}
  }

  return list
}

export async function submitSchoolAssignment(
  assignmentUuid: string,
  payload: {
    student_content: Record<string, any>
    usergroup_id?: number
  },
  accessToken: string
) {
  const now = new Date()
  const allKnown = [...getStoredCustomAssignments(), ...DEFAULT_SCHOOL_ASSIGNMENTS]
  const match = allKnown.find(
    (a) => a.assignment_uuid === assignmentUuid || String(a.id) === assignmentUuid
  )
  let isLate = false
  let lateDurationText = ''
  if (match?.due_date) {
    const dueTime = new Date(match.due_date).getTime()
    if (now.getTime() > dueTime) {
      isLate = true
      lateDurationText = formatLateDuration(now.getTime() - dueTime)
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const record = {
        submission_id: Date.now(),
        status: isLate ? 'LATE' : 'SUBMITTED',
        is_late: isLate,
        late_duration_text: lateDurationText,
        submission_date: now.toISOString(),
        student_content: payload.student_content,
      }
      localStorage.setItem(`oxonom_submission_${assignmentUuid}`, JSON.stringify(record))
      window.dispatchEvent(new CustomEvent('oxonom_assignments_updated', { detail: { assignmentUuid } }))
    } catch {}
  }

  try {
    const result = await fetch(
      `${getAPIUrl()}school_assignments/${assignmentUuid}/submit`,
      RequestBodyWithAuthHeader('POST', payload, null, accessToken || '')
    )
    return await errorHandling(result)
  } catch (_e) {
    return {
      success: true,
      message: isLate ? 'Ödev geç teslim edildi.' : 'Ödev zamanında teslim edildi.',
      is_late: isLate,
      status: isLate ? 'LATE' : 'SUBMITTED',
    }
  }
}

export async function getAssignmentSubmissions(
  assignmentUuid: string,
  usergroupId: number | null,
  accessToken: string
): Promise<SubmissionsResponse> {
  const allKnown = [...getStoredCustomAssignments(), ...DEFAULT_SCHOOL_ASSIGNMENTS]
  const match = allKnown.find(
    (a) => a.assignment_uuid === assignmentUuid || String(a.id) === assignmentUuid
  ) || DEFAULT_SCHOOL_ASSIGNMENTS[0]

  const targetClass = usergroupId ? ALL_CLASSROOMS.find((c) => c.id === usergroupId) : undefined

  let studentsData: StudentSubmissionRow[] = []
  let totalStudents = 30
  let submittedCount = 0
  let gradedCount = 0

  try {
    const param = usergroupId ? `?usergroup_id=${usergroupId}` : ''
    const result = await fetch(
      `${getAPIUrl()}school_assignments/${assignmentUuid}/submissions${param}`,
      RequestBodyWithAuthHeader('GET', null, null, accessToken)
    )
    if (result.ok) {
      const data = await errorHandling(result)
      if (data && Array.isArray(data.students) && data.students.length > 0) {
        studentsData = data.students
        totalStudents = data.total_students || 30
        submittedCount = data.submitted_count || data.students.filter((s: any) => s.status !== 'PENDING').length
        gradedCount = data.graded_count || data.students.filter((s: any) => s.status === 'GRADED').length
      }
    }
  } catch (_e) {}

  if (studentsData.length === 0) {
    const fallbackData = generateAssignmentSubmissionsData(assignmentUuid, targetClass, match?.due_date)
    studentsData = fallbackData.students as any
    totalStudents = fallbackData.total_students
    submittedCount = fallbackData.submitted_count
    gradedCount = fallbackData.graded_count
  }

  // Merge any browser submitted assignment
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(`oxonom_submission_${assignmentUuid}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        studentsData = studentsData.map((s) => {
          if (s.user_id === 1001 || s.username === 'demo_ogrenci' || s.name.includes('Erçil')) {
            return {
              ...s,
              submission_id: parsed.submission_id || 501,
              status: parsed.status || (parsed.is_late ? 'LATE' : 'SUBMITTED'),
              is_late: Boolean(parsed.is_late),
              late_duration_text: parsed.late_duration_text || '',
              submission_date: parsed.submission_date,
              student_content: parsed.student_content || s.student_content,
            }
          }
          return s
        })
      }
    } catch {}

    // Merge any browser teacher grades
    try {
      const gradesRaw = localStorage.getItem(`oxonom_grades_${assignmentUuid}`)
      if (gradesRaw) {
        const parsedGrades = JSON.parse(gradesRaw)
        studentsData = studentsData.map((s) => {
          const g = parsedGrades[s.user_id] || parsedGrades[s.username]
          if (g && typeof g.score === 'number') {
            return {
              ...s,
              status: 'GRADED',
              score: g.score,
              teacher_feedback: g.teacher_feedback || null,
              submission_id: g.submission_id || s.submission_id || 500 + s.user_id,
              submission_date: g.graded_at || s.submission_date || new Date().toISOString(),
            }
          }
          return s
        })
      }
    } catch {}
  }

  submittedCount = studentsData.filter((s) => s.status !== 'PENDING').length
  gradedCount = studentsData.filter((s) => s.status === 'GRADED').length

  return {
    assignment: match,
    total_students: totalStudents,
    submitted_count: submittedCount,
    graded_count: gradedCount,
    students: studentsData,
  }
}

export async function gradeSubmission(
  submissionId: number,
  payload: {
    score: number
    teacher_feedback?: string
    assignment_uuid?: string
    user_id?: number
  },
  accessToken: string
) {
  if (typeof window !== 'undefined' && payload.assignment_uuid && payload.user_id) {
    try {
      const key = `oxonom_grades_${payload.assignment_uuid}`
      const existing = JSON.parse(localStorage.getItem(key) || '{}')
      existing[payload.user_id] = {
        score: payload.score,
        teacher_feedback: payload.teacher_feedback || null,
        submission_id: submissionId,
        graded_at: new Date().toISOString(),
      }
      localStorage.setItem(key, JSON.stringify(existing))
      window.dispatchEvent(
        new CustomEvent('oxonom_assignments_updated', {
          detail: { assignmentUuid: payload.assignment_uuid, userId: payload.user_id },
        })
      )
    } catch (_) {}
  }

  try {
    const result = await fetch(
      `${getAPIUrl()}school_assignments/submissions/${submissionId}/grade`,
      RequestBodyWithAuthHeader('POST', payload, null, accessToken)
    )
    return await errorHandling(result)
  } catch (_e) {
    return { success: true, message: 'Not ve değerlendirme başarıyla kaydedildi.' }
  }
}
