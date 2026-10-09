// Oxonom EDU — Real Classroom Daily Attendance Service

export interface AttendanceRecord {
  date: string
  classCode: string
  taken: boolean
  updatedAt: string
  records: Record<string, 'present' | 'absent'>
  totalCount: number
  presentCount: number
  absentCount: number
}

const STORAGE_PREFIX = 'oxonom_daily_attendance_'

export function getTodayDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getAttendanceForClass(classCode: string, dateStr: string = getTodayDateString()): AttendanceRecord | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${classCode}_${dateStr}`)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (_) {
    return null
  }
}

export function saveAttendanceForClass(
  classCode: string,
  records: Record<string, 'present' | 'absent'>,
  totalStudents: number,
  dateStr: string = getTodayDateString()
): AttendanceRecord {
  let presentCount = 0
  let absentCount = 0

  Object.values(records).forEach((status) => {
    if (status === 'present') presentCount++
    else if (status === 'absent') absentCount++
  })

  // Any student not explicitly marked is counted as present by default if not set
  if (presentCount + absentCount < totalStudents) {
    presentCount = totalStudents - absentCount
  }

  const record: AttendanceRecord = {
    date: dateStr,
    classCode,
    taken: true,
    updatedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    records,
    totalCount: totalStudents,
    presentCount,
    absentCount,
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${classCode}_${dateStr}`, JSON.stringify(record))
      window.dispatchEvent(
        new CustomEvent('oxonom_attendance_updated', {
          detail: { classCode, date: dateStr, record },
        })
      )
    } catch (_) {}
  }

  return record
}
