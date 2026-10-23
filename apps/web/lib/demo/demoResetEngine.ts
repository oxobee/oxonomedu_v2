/**
 * Demo Auto-Reset & Forward-Sync Engine for Oxonom EDU
 *
 * Guarantees:
 * 1. Automatic clean restoration of showcase demo data every 30 minutes.
 * 2. Instant forward-migration to the newest demo state whenever code or schema updates.
 * 3. Never stuck on stale mock data or leftover manual modifications.
 * 4. Cross-role synchronization between Principal, Teacher and Student.
 */

import {
  DEMO_SCHEMA_VERSION,
  DEMO_RESET_INTERVAL_MS,
  MASTER_PRINCIPAL_PROFILE,
  MASTER_TEACHER_PROFILE,
  MASTER_TEACHER_NOTES,
  MASTER_STUDENT_PROFILE,
  MASTER_9A_STUDENTS,
  MASTER_SCHEDULE,
  MASTER_ASSIGNMENTS,
  MASTER_STUDENT_SUBMISSIONS_RECORD,
  MASTER_TEACHER_SUBMISSIONS_DATA,
  MASTER_EXAMS,
  MASTER_PLANNER_TASKS,
  MASTER_STUDENT_NOTES,
  MASTER_ANNOUNCEMENTS,
} from './demoMasterData'

export const LAST_RESET_TIME_KEY = 'oxonom_demo_last_reset_time'
export const SCHEMA_VERSION_KEY = 'oxonom_demo_schema_version'

let watcherIntervalId: any = null

/**
 * Returns true if 30 minutes have elapsed OR the schema version has updated.
 */
export function isDemoResetDue(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const storedVersion = localStorage.getItem(SCHEMA_VERSION_KEY)
    if (storedVersion !== DEMO_SCHEMA_VERSION) {
      return true
    }

    const lastResetRaw = localStorage.getItem(LAST_RESET_TIME_KEY)
    if (!lastResetRaw) return true

    const lastResetTime = parseInt(lastResetRaw, 10)
    if (isNaN(lastResetTime)) return true

    const elapsed = Date.now() - lastResetTime
    return elapsed >= DEMO_RESET_INTERVAL_MS
  } catch (_) {
    return true
  }
}

/**
 * Returns the remaining time in milliseconds until the next 30-minute auto reset.
 */
export function getRemainingTimeToResetMs(): number {
  if (typeof window === 'undefined') return DEMO_RESET_INTERVAL_MS

  try {
    const lastResetRaw = localStorage.getItem(LAST_RESET_TIME_KEY)
    if (!lastResetRaw) return 0

    const lastResetTime = parseInt(lastResetRaw, 10)
    if (isNaN(lastResetTime)) return 0

    const elapsed = Date.now() - lastResetTime
    const remaining = DEMO_RESET_INTERVAL_MS - elapsed
    return Math.max(0, remaining)
  } catch (_) {
    return 0
  }
}

/**
 * Resets all demo data across Student, Teacher and Principal to the pristine master showcase state.
 */
export function resetAllDemoData(options?: { force?: boolean; notify?: boolean }): void {
  if (typeof window === 'undefined') return

  try {
    // 1. Purge stale / legacy cache keys
    const keysToRemove = [
      'oxonom_deleted_homework_ids',
      'oxonom_deleted_exam_ids',
      'oxonom_admin_teachers_list',
      'oxonom_admin_classes_list',
      'oxonom_teacher_schedule',
      'oxonom_course_progress_turkce',
      'oxonom_course_progress_matematik',
      'oxonom_student_homeworks_3001',
      'oxonom_student_homeworks_101',
      'oxonom_student_submissions_ercil',
      'oxonom_student_planner_tasks_ercil',
      'oxonom_student_notes_ercil',
    ]
    keysToRemove.forEach((key) => {
      try {
        localStorage.removeItem(key)
      } catch (_) {}
    })

    // 2. Write pristine Master Showcase records
    localStorage.setItem('oxonom_principal_profile', JSON.stringify(MASTER_PRINCIPAL_PROFILE))
    localStorage.setItem('oxonom_teacher_profile', JSON.stringify(MASTER_TEACHER_PROFILE))
    localStorage.setItem('oxonom_teacher_profile_completed', 'true')
    localStorage.setItem('oxonom_teacher_notes', JSON.stringify(MASTER_TEACHER_NOTES))
    localStorage.setItem('oxonom_student_profile', JSON.stringify(MASTER_STUDENT_PROFILE))
    localStorage.setItem('oxonom_m_students_v3', JSON.stringify(MASTER_9A_STUDENTS))
    localStorage.setItem('oxonom_admin_students_list_30', JSON.stringify(MASTER_9A_STUDENTS))
    localStorage.setItem('oxonom_custom_school_assignments_v2', JSON.stringify(MASTER_ASSIGNMENTS))
    localStorage.setItem('oxonom_student_submissions_ali_yagiz', JSON.stringify(MASTER_STUDENT_SUBMISSIONS_RECORD))
    localStorage.setItem('oxonom_student_submissions_ercil', JSON.stringify(MASTER_STUDENT_SUBMISSIONS_RECORD))
    localStorage.setItem('m_homework_submissions_v2', JSON.stringify(MASTER_TEACHER_SUBMISSIONS_DATA))
    localStorage.setItem('oxonom_school_exam_calendar', JSON.stringify(MASTER_EXAMS))
    localStorage.setItem('oxonom_student_planner_tasks_ali_yagiz', JSON.stringify(MASTER_PLANNER_TASKS))
    localStorage.setItem('oxonom_student_planner_tasks_ercil', JSON.stringify(MASTER_PLANNER_TASKS))
    localStorage.setItem('oxonom_student_notes_ali_yagiz', JSON.stringify(MASTER_STUDENT_NOTES))
    localStorage.setItem('oxonom_student_notes_ercil', JSON.stringify(MASTER_STUDENT_NOTES))
    localStorage.setItem('oxonom_school_announcements', JSON.stringify(MASTER_ANNOUNCEMENTS))
    localStorage.setItem('oxonom_canonical_schedule_1a', JSON.stringify(MASTER_SCHEDULE))
    localStorage.setItem('oxonom_canonical_schedule_9a', JSON.stringify(MASTER_SCHEDULE))

    // 3. Update reset timestamp and schema version
    const now = Date.now()
    localStorage.setItem(LAST_RESET_TIME_KEY, now.toString())
    localStorage.setItem(SCHEMA_VERSION_KEY, DEMO_SCHEMA_VERSION)

    // 4. Notify all components and views
    const eventsToDispatch = [
      'oxonom_demo_reset',
      'oxonom_student_updated',
      'oxonom_teacher_profile_updated',
      'oxonom_assignments_updated',
      'oxonom_student_homeworks_updated',
      'oxonom_student_submission_updated',
      'oxonom_exam_calendar_updated',
      'oxonom_attendance_updated',
      'oxonom_school_announcements_updated',
      'oxonom_principal_profile_updated',
      'storage',
    ]

    eventsToDispatch.forEach((evtName) => {
      try {
        window.dispatchEvent(new CustomEvent(evtName, { detail: { timestamp: now, version: DEMO_SCHEMA_VERSION } }))
      } catch (_) {}
    })

    if (options?.notify) {
      import('react-hot-toast').then(({ default: toast }) => {
        toast.success('Demo verileri 30 dakikalık periyotla güncel durumuna sıfırlandı.', {
          id: 'demo-reset-toast',
          duration: 3500,
          icon: '✨',
        })
      }).catch(() => {})
    }
  } catch (err) {
    console.error('[DemoResetEngine] Error resetting demo data:', err)
  }
}

/**
 * Initializes the background watcher that checks every 15 seconds
 * whether 30 minutes have passed or the schema version has changed.
 */
export function startDemoAutoResetWatcher(): () => void {
  if (typeof window === 'undefined') return () => {}

  // Expose global helper for manual evaluator reset
  try {
    ;(window as any).resetOxonomDemo = () => {
      resetAllDemoData({ force: true, notify: true })
    }
  } catch (_) {}

  // Initial check on page load
  if (isDemoResetDue()) {
    resetAllDemoData({ notify: false })
  }

  // Prevent multiple overlapping intervals
  if (watcherIntervalId !== null) {
    clearInterval(watcherIntervalId)
  }

  watcherIntervalId = setInterval(() => {
    if (isDemoResetDue()) {
      resetAllDemoData({ notify: true })
    }
  }, 15000)

  return () => {
    if (watcherIntervalId !== null) {
      clearInterval(watcherIntervalId)
      watcherIntervalId = null
    }
  }
}
