'use client'
import { useState, useCallback, useEffect } from 'react'
import useAdminStatus from './useAdminStatus'

export type OnboardingStep = {
  id: string
  title: string
  description: string
  // CTA label + where it goes. `hrefType: 'root'` targets the org's public site
  // (the shareable school), everything else is a /dash/* path.
  action: string
  href: string
  hrefType?: 'org' | 'root'
  // Steps with no navigable completion signal complete when their CTA is clicked.
  completeOnClick?: boolean
  // Regex (source string) on the pathname that auto-completes the step.
  completePath?: string
  completed: boolean
  requiredPlan?: string
  skipped?: boolean
}

type OnboardingState = {
  completedSteps: string[]
  skippedSteps: string[]
  minimized: boolean
  expanded: boolean
  showAllSteps: boolean
  dismissed: boolean
  welcomeSeen: boolean
}

const STORAGE_KEY = 'lh_onboarding'

// Outcome-framed onboarding: 6 milestones that ladder toward the north-star —
// your first enrolled learner — then retention. Each title is the WIN; the
// action is just the means. Every step delivers value on the free plan.
const DEFAULT_STEPS: Omit<OnboardingStep, 'completed'>[] = [
  {
    id: 'brand_school',
    title: 'Okul Kimliği & Bilgileri',
    description: 'Okulunuzun adı, logosu, kurumsal renkleri ve temel bilgilerini yapılandırın.',
    action: 'Okulu Yapılandır',
    href: '/dash/org/settings/general',
    completePath: '/dash/org/settings/(general|branding)',
  },
  {
    id: 'create_classes',
    title: 'Dönem ve Sınıfları Oluşturun',
    description: 'Okulunuzun sınıflarını (Örn: 1/A, 1/B) ve şubelerini sisteme tanımlayın.',
    action: 'Sınıf Ekle',
    href: '/dash/classrooms',
    completePath: '/dash/classrooms',
  },
  {
    id: 'add_teachers',
    title: 'Öğretmen Kadronuzu Tanımlayın',
    description: 'Öğretmenlerinizi sisteme dahil edin ve sınıflara ders görevlendirmelerini yapın.',
    action: 'Öğretmenleri Yönet',
    href: '/dash/teachers',
    completePath: '/dash/teachers',
  },
  {
    id: 'enroll_students',
    title: 'Öğrenci Kayıtlarını Tamamlayın',
    description: 'Öğrencilerinizi kaydedin, şubelere dağıtın ve sınıf listelerini oluşturun.',
    action: 'Öğrenci İşleri',
    href: '/dash/students',
    completePath: '/dash/students',
  },
]

export const STUDENT_STEPS: Omit<OnboardingStep, 'completed'>[] = [
  {
    id: 'student_profile',
    title: 'Öğrenci Profilinizi İnceleyin',
    description: 'Ad, soyad, sınıf ve okul bilgilerinizi kontrol ederek profilinizi doğrulayın.',
    action: 'Profili Gör',
    href: '/dash/users/settings/profile',
    completePath: '/dash/users/settings/profile',
  },
  {
    id: 'student_class_boards',
    title: 'Sınıf Ders Tahtalarınızı Keşfedin',
    description: 'Derslerinizde işlenen canlı akıllı tahta içeriklerine ve ders notlarına göz atın.',
    action: 'Panoları Aç',
    href: '/dash/boards',
    completePath: '/dash/boards',
  },
  {
    id: 'student_assignments',
    title: 'Ödev ve Etkinliklerinizi Kontrol Edin',
    description: 'Öğretmenlerinizin tanımladığı haftalık ödev ve etkinlikleri teslim edin.',
    action: 'Ödevlere Git',
    href: '/dash/assignments',
    completePath: '/dash/assignments',
  },
  {
    id: 'student_library',
    title: 'Dijital Kütüphaneye Erişin',
    description: 'Ders kitapları, soru bankaları ve video kaynaklarıyla derslerinizi pekiştirin.',
    action: 'Kütüphaneyi Aç',
    href: '/dash/library',
    completePath: '/dash/library',
  },
]

// Raw step definitions (incl. completion-path regexes) for the headless tracker.
export const ONBOARDING_STEP_DEFS = [...DEFAULT_STEPS, ...STUDENT_STEPS]

function loadState(): OnboardingState {
  if (typeof window === 'undefined') {
    return { completedSteps: [], skippedSteps: [], minimized: false, expanded: false, showAllSteps: false, dismissed: false, welcomeSeen: false }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        completedSteps: parsed.completedSteps || [],
        skippedSteps: parsed.skippedSteps || [],
        minimized: parsed.minimized || false,
        expanded: parsed.expanded || false,
        showAllSteps: parsed.showAllSteps || false,
        dismissed: parsed.dismissed || false,
        welcomeSeen: parsed.welcomeSeen || false,
      }
    }
  } catch {
    /* ignore */
  }
  return { completedSteps: [], skippedSteps: [], minimized: false, expanded: false, showAllSteps: false, dismissed: false, welcomeSeen: false }
}

function saveState(state: OnboardingState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    window.dispatchEvent(new Event('lh_onboarding_change'))
  } catch {
    /* ignore */
  }
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(loadState)

  const applyLocalChange = useCallback(
    (updater: (_prev: OnboardingState) => OnboardingState) => {
      setState((prev) => {
        const next = updater(prev)
        if (next !== prev) {
          saveState(next)
        }
        return next
      })
    },
    []
  )

  // Listen for changes from other instances of this hook
  useEffect(() => {
    const handler = () => {
      setState((prev) => {
        const loaded = loadState()
        if (JSON.stringify(loaded) === JSON.stringify(prev)) return prev
        return loaded
      })
    }
    window.addEventListener('lh_onboarding_change', handler)
    return () => window.removeEventListener('lh_onboarding_change', handler)
  }, [])

  const { isStudent } = useAdminStatus()
  const activeStepDefs = isStudent ? STUDENT_STEPS : DEFAULT_STEPS

  const steps: OnboardingStep[] = activeStepDefs.map((s) => ({
    ...s,
    completed: state.completedSteps.includes(s.id) || state.skippedSteps.includes(s.id),
    skipped: state.skippedSteps.includes(s.id),
  }))

  const currentStepIndex = steps.findIndex((s) => !s.completed)
  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null
  const allCompleted = steps.every((s) => s.completed)
  const progress = steps.length > 0 ? steps.filter((s) => s.completed).length / steps.length : 0

  const completeStep = useCallback((stepId: string) => {
    applyLocalChange((prev) => {
      if (prev.completedSteps.includes(stepId)) return prev
      return { ...prev, completedSteps: [...prev.completedSteps, stepId] }
    })
  }, [applyLocalChange])

  const toggleMinimized = useCallback(() => {
    applyLocalChange((prev) => ({ ...prev, minimized: !prev.minimized }))
  }, [applyLocalChange])

  const toggleExpanded = useCallback(() => {
    applyLocalChange((prev) => ({ ...prev, expanded: !prev.expanded }))
  }, [applyLocalChange])

  const toggleShowAllSteps = useCallback(() => {
    applyLocalChange((prev) => ({ ...prev, showAllSteps: !prev.showAllSteps }))
  }, [applyLocalChange])

  const dismiss = useCallback(() => {
    applyLocalChange((prev) => (prev.dismissed ? prev : { ...prev, dismissed: true }))
  }, [applyLocalChange])

  const markWelcomeSeen = useCallback(() => {
    applyLocalChange((prev) => (prev.welcomeSeen ? prev : { ...prev, welcomeSeen: true }))
  }, [applyLocalChange])

  const skipStep = useCallback((stepId: string) => {
    applyLocalChange((prev) => {
      if (prev.skippedSteps.includes(stepId)) return prev
      return { ...prev, skippedSteps: [...prev.skippedSteps, stepId] }
    })
  }, [applyLocalChange])

  const reset = useCallback(() => {
    applyLocalChange(() => ({ completedSteps: [], skippedSteps: [], minimized: false, expanded: false, showAllSteps: false, dismissed: false, welcomeSeen: false }))
  }, [applyLocalChange])

  return {
    steps,
    currentStep,
    currentStepIndex,
    allCompleted,
    progress,
    minimized: state.minimized,
    expanded: state.expanded,
    showAllSteps: state.showAllSteps,
    dismissed: state.dismissed,
    welcomeSeen: state.welcomeSeen,
    completeStep,
    dismiss,
    markWelcomeSeen,
    toggleMinimized,
    toggleExpanded,
    toggleShowAllSteps,
    skipStep,
    reset,
  }
}
