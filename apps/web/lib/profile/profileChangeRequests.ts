// apps/web/lib/profile/profileChangeRequests.ts
'use client'

export interface ProfileChangeDiff {
  fieldKey: string
  fieldLabel: string
  oldValue: string
  newValue: string
}

export interface ProfileChangeRequest {
  id: string
  targetRole: 'teacher' | 'student'
  requesterId: string
  requesterName: string
  requesterIdentifier: string // e.g. "1/A Sınıf Öğretmeni" or "1/A · No: 101"
  requestDate: string
  status: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  reviewDate?: string
  changes: ProfileChangeDiff[]
  payload: Record<string, any>
}

export const INITIAL_CHANGE_REQUESTS: ProfileChangeRequest[] = [
  {
    id: 'req-tch-1',
    targetRole: 'teacher',
    requesterId: 'teacher-1',
    requesterName: 'Bahar ÇETİN',
    requesterIdentifier: '1/A Sınıf Öğretmeni',
    requestDate: 'Bugün, 08:45',
    status: 'pending',
    changes: [
      {
        fieldKey: 'phone',
        fieldLabel: 'Telefon Numarası',
        oldValue: '+90 (532) 111 22 33',
        newValue: '+90 (533) 444 55 66',
      },
      {
        fieldKey: 'address',
        fieldLabel: 'İkametgâh Adresi',
        oldValue: 'Kadıköy / Moda Mah. No: 12',
        newValue: 'Ataşehir / Barbaros Mah. Çiğdem Sk. No: 8/4',
      },
    ],
    payload: {
      phone: '+90 (533) 444 55 66',
      address: 'Ataşehir / Barbaros Mah. Çiğdem Sk. No: 8/4',
    },
  },
  {
    id: 'req-stu-1',
    targetRole: 'student',
    requesterId: 's-1',
    requesterName: 'Ali Yağız DEMİREL',
    requesterIdentifier: '1/A Şubesi · No: 101',
    requestDate: 'Dün, 16:30',
    status: 'pending',
    changes: [
      {
        fieldKey: 'parentPhone',
        fieldLabel: 'Veli Cep Telefonu',
        oldValue: '+90 (530) 222 33 44',
        newValue: '+90 (535) 999 88 77',
      },
      {
        fieldKey: 'parentEmail',
        fieldLabel: 'Veli E-Posta',
        oldValue: 'veli.demirel@gmail.com',
        newValue: 'selim.demirel@kurumsal.com',
      },
    ],
    payload: {
      parentPhone: '+90 (535) 999 88 77',
      parentEmail: 'selim.demirel@kurumsal.com',
    },
  },
]

export function getProfileChangeRequests(): ProfileChangeRequest[] {
  if (typeof window === 'undefined') return INITIAL_CHANGE_REQUESTS
  try {
    const raw = localStorage.getItem('oxonom_profile_change_requests')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
    // Seed initial
    localStorage.setItem('oxonom_profile_change_requests', JSON.stringify(INITIAL_CHANGE_REQUESTS))
    return INITIAL_CHANGE_REQUESTS
  } catch (_) {
    return INITIAL_CHANGE_REQUESTS
  }
}

export function saveProfileChangeRequests(requests: ProfileChangeRequest[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('oxonom_profile_change_requests', JSON.stringify(requests))
    window.dispatchEvent(new CustomEvent('oxonom_profile_requests_updated'))
  } catch (_) {}
}

export function submitProfileChangeRequest(
  data: Omit<ProfileChangeRequest, 'id' | 'requestDate' | 'status'>
): ProfileChangeRequest {
  const current = getProfileChangeRequests()
  const newReq: ProfileChangeRequest = {
    ...data,
    id: `req-${Date.now()}`,
    requestDate:
      'Bugün, ' +
      new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    status: 'pending',
  }

  const updated = [newReq, ...current]
  saveProfileChangeRequests(updated)
  return newReq
}

export function approveProfileChangeRequest(id: string): boolean {
  const current = getProfileChangeRequests()
  const target = current.find((r) => r.id === id)
  if (!target) return false

  target.status = 'approved'
  target.reviewDate =
    'Bugün, ' +
    new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })

  // Apply changes to target user storage
  if (typeof window !== 'undefined') {
    try {
      if (target.targetRole === 'teacher') {
        const rawTeacher = localStorage.getItem('oxonom_teacher_profile')
        const teacherProfile = rawTeacher ? JSON.parse(rawTeacher) : {}
        const merged = { ...teacherProfile, ...target.payload }
        localStorage.setItem('oxonom_teacher_profile', JSON.stringify(merged))
        window.dispatchEvent(new CustomEvent('oxonom_teacher_profile_updated'))
      } else if (target.targetRole === 'student') {
        const rawStudent = localStorage.getItem('oxonom_student_profile')
        const studentProfile = rawStudent ? JSON.parse(rawStudent) : {}
        const merged = { ...studentProfile, ...target.payload }
        localStorage.setItem('oxonom_student_profile', JSON.stringify(merged))
        window.dispatchEvent(new CustomEvent('oxonom_student_profile_updated'))
      }
    } catch (_) {}
  }

  saveProfileChangeRequests(current)
  return true
}

export function rejectProfileChangeRequest(id: string, reason?: string): boolean {
  const current = getProfileChangeRequests()
  const target = current.find((r) => r.id === id)
  if (!target) return false

  target.status = 'rejected'
  target.rejectionReason = reason || 'Müdürlük tarafından uygun görülmedi.'
  target.reviewDate =
    'Bugün, ' +
    new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })

  saveProfileChangeRequests(current)
  return true
}
