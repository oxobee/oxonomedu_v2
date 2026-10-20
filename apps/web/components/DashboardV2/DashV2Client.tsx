'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronRight,
  Tv,
  BookOpenCheck,
  Users,
  FolderOpen,
  LayoutGrid,
  QrCode,
  LogOut,
  Sparkles,
  ExternalLink,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Gamepad2,
  Monitor,
  Settings,
  GraduationCap,
  Calendar,
  Layers,
  ArrowUpRight,
  FileText,
  Sun,
  Moon,
  User,
  CheckSquare,
  Home,
  Compass,
  Lock,
  Smartphone,
  RotateCw,
  Upload,
  ShieldCheck,
  FileCheck,
  X,
  BarChart3,
  Check,
  BookOpen,
  Image as ImageIcon,
  UploadCloud,
  FileQuestion,
  Trash2,
  HelpCircle,
  ArrowLeft,
  Send,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import MobileHeader from '@components/Mobile/MobileHeader'
import MobileFloatingDock from '@components/Mobile/MobileFloatingDock'
import { signOut, useAuth } from '@components/Contexts/AuthContext'
import { useOrg } from '@components/Contexts/OrgContext'
import {
  ALL_CLASSROOMS,
  ClassroomItem,
} from '@services/demo/schoolDirectory'
import { getClassroomBoards } from '@services/boards/boards'
import {
  getSchoolAssignments,
  SchoolAssignmentItem,
  formatDueDate,
} from '@services/school_assignments/school_assignments'
import ClassSelectorSheet from './ClassSelectorSheet'
import TeacherNotesModal from './TeacherNotesModal'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'
import {
  getAttendanceForClass,
  normalizeClassCode,
  AttendanceRecord,
} from '@services/demo/attendanceService'
import MockBadge from '@components/Common/MockBadge'
import LiveClassRadar from '@components/Common/LiveClassRadar'
import WeeklyCurriculumProgressWidget from '@components/Teacher/widgets/WeeklyCurriculumProgressWidget'

export interface DashV2ClientProps {
  hideDock?: boolean
  hideHeader?: boolean
  theme?: 'light' | 'dark'
  onToggleTheme?: () => void
}

export default function DashV2Client({
  hideDock = false,
  hideHeader = false,
  theme: propTheme,
  onToggleTheme: propToggleTheme,
}: DashV2ClientProps = {}) {
  const router = useRouter()
  const { signOut: authSignOut } = useAuth()
  const org = useOrg() as any
  const session = useLHSession() as any
  const user = session?.data?.user
  const token = session?.data?.tokens?.access_token

  // Synchronized Mobile Theme State: 'light' | 'dark'
  const { theme: internalTheme, toggleTheme: internalToggleTheme } = useMobileTheme()
  const theme = propTheme || internalTheme
  const toggleTheme = propToggleTheme || internalToggleTheme

  // Prevent pinch-to-zoom and gesture-based zooming on mobile/trackpads
  useEffect(() => {
    const preventMultiTouch = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }
    const preventGesture = (e: Event) => {
      e.preventDefault()
    }
    document.addEventListener('touchmove', preventMultiTouch, { passive: false })
    document.addEventListener('gesturestart', preventGesture)
    document.addEventListener('gesturechange', preventGesture)
    return () => {
      document.removeEventListener('touchmove', preventMultiTouch)
      document.removeEventListener('gesturestart', preventGesture)
      document.removeEventListener('gesturechange', preventGesture)
    }
  }, [])

  // Active Classroom State (Default to 1/A matching the authentic school structure)
  const [selectedClass, setSelectedClass] = useState<ClassroomItem>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oxonom_selected_class')
        if (saved) {
          const parsed = JSON.parse(saved)
          const found = ALL_CLASSROOMS.find((c) => c.id === parsed.id || c.code === parsed.code)
          if (found) return found
        }
      } catch (_) {}
    }
    return ALL_CLASSROOMS[0] || { id: 1, name: '1/A Şubesi', code: '1/A', grade_level: 1, branch: 'A', student_count: 1 }
  })

  // Modal Dialog States
  const [isClassSheetOpen, setIsClassSheetOpen] = useState(false)
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false)

  const handleSelectClass = (cls: ClassroomItem) => {
    setSelectedClass(cls)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('oxonom_selected_class', JSON.stringify(cls))
        window.dispatchEvent(new CustomEvent('oxonom_class_changed', { detail: cls }))
      } catch (_) {}
    }
  }

  // Reactively synchronize with external class changes
  useEffect(() => {
    const handleClassChanged = (e: any) => {
      if (e?.detail) {
        const detail = e.detail
        const found = ALL_CLASSROOMS.find((c) => c.id === detail.id || c.code === detail.code || c.name === detail.name)
        if (found) {
          setSelectedClass(found)
        }
      }
    }
    window.addEventListener('oxonom_class_changed', handleClassChanged)
    return () => window.removeEventListener('oxonom_class_changed', handleClassChanged)
  }, [])

  // Real Classroom Daily Attendance Synchronization
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord | null>(() => {
    return getAttendanceForClass(normalizeClassCode(selectedClass?.code || '1/A'))
  })

  useEffect(() => {
    const refreshAttendance = () => {
      const data = getAttendanceForClass(normalizeClassCode(selectedClass?.code || '1/A'))
      setAttendanceData(data)
    }

    refreshAttendance()

    const handleAttendanceUpdated = (e: any) => {
      const updatedCode = normalizeClassCode(e?.detail?.classCode)
      const currentCode = normalizeClassCode(selectedClass?.code || '1/A')
      if (!e?.detail?.classCode || updatedCode === currentCode) {
        if (e?.detail?.record) {
          setAttendanceData(e.detail.record)
        } else {
          refreshAttendance()
        }
      }
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key && e.key.includes('oxonom_daily_attendance')) {
        refreshAttendance()
      }
    }

    window.addEventListener('oxonom_attendance_updated', handleAttendanceUpdated)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('oxonom_attendance_updated', handleAttendanceUpdated)
      window.removeEventListener('storage', handleStorage)
    }
  }, [selectedClass?.code])

  // Teacher Profile state (Synced from local storage & custom events)
  const [teacherProfile, setTeacherProfile] = useState<{
    firstName?: string
    lastName?: string
    email?: string
    bio?: string
    tcNo?: string
    phone?: string
    branch?: string
    isFirstLogin?: boolean
    profileCompleted?: boolean
    avatarUrl?: string
    avatarImage?: string
  } | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const readTeacherProfile = () => {
        try {
          const raw = localStorage.getItem('oxonom_teacher_profile')
          if (raw) {
            setTeacherProfile(JSON.parse(raw))
          }
        } catch (_) {}
      }
      readTeacherProfile()

      const handleTeacherUpdate = (e?: any) => {
        if (e?.detail) {
          setTeacherProfile((prev) => ({ ...prev, ...e.detail }))
        } else {
          readTeacherProfile()
        }
      }

      window.addEventListener('oxonom_teacher_profile_updated', handleTeacherUpdate)
      window.addEventListener('storage', handleTeacherUpdate)
      return () => {
        window.removeEventListener('oxonom_teacher_profile_updated', handleTeacherUpdate)
        window.removeEventListener('storage', handleTeacherUpdate)
      }
    }
  }, [])

  // Teacher Name (Always prioritizes edited profile so it never reverts)
  const teacherName = useMemo(() => {
    if (teacherProfile?.firstName) {
      return `${teacherProfile.firstName} Öğretmen`
    }
    if (user?.first_name) {
      return `${user.first_name} Öğretmen`
    }
    if (selectedClass?.teacher_name) {
      const first = selectedClass.teacher_name.split(' ')[0]
      return `${first} Öğretmen`
    }
    return 'Ebru Öğretmen'
  }, [teacherProfile, user, selectedClass])

  // Full teacher name for account link & avatar
  const teacherFullName = useMemo(() => {
    if (teacherProfile?.firstName) {
      return `${teacherProfile.firstName} ${teacherProfile.lastName || ''}`.trim()
    }
    if (user?.full_name) {
      return user.full_name
    }
    return selectedClass?.teacher_name || 'Ebru TEKNECİ'
  }, [teacherProfile, user, selectedClass])

  const teacherInitials = useMemo(() => {
    return teacherFullName
      .split(' ')
      .map((p: string) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }, [teacherFullName])

  // First-Login Profile Completion Modal state
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3 | 4>(1)
  const [onboardingFirstName, setOnboardingFirstName] = useState('')
  const [onboardingLastName, setOnboardingLastName] = useState('')
  const [onboardingTcNo, setOnboardingTcNo] = useState('')
  const [onboardingPhone, setOnboardingPhone] = useState('')
  const [onboardingBirthDate, setOnboardingBirthDate] = useState('14.05.1990')
  const [onboardingBloodType, setOnboardingBloodType] = useState('A Rh+')
  const [onboardingAddress, setOnboardingAddress] = useState('')
  const [onboardingEmergencyContact, setOnboardingEmergencyContact] = useState('')
  const [onboardingEmergencyPhone, setOnboardingEmergencyPhone] = useState('')
  const [onboardingUniversity, setOnboardingUniversity] = useState('Boğaziçi Üniversitesi Eğitim Fakültesi')
  const [onboardingGraduationYear, setOnboardingGraduationYear] = useState('2016')
  const [onboardingBranch, setOnboardingBranch] = useState('Türk Dili ve Edebiyatı')
  const [onboardingSicilNo, setOnboardingSicilNo] = useState('')
  const [onboardingBankName, setOnboardingBankName] = useState('Vakıfbank')
  const [onboardingIban, setOnboardingIban] = useState('')
  const [onboardingNewPass, setOnboardingNewPass] = useState('')
  const [onboardingNewPassConfirm, setOnboardingNewPassConfirm] = useState('')
  const [onboardingKvkkAccepted, setOnboardingKvkkAccepted] = useState(false)

  // Uploaded docs state
  const [uploadedDocs, setUploadedDocs] = useState<{
    diploma: boolean
    sicil: boolean
    saglik: boolean
    ikametgah: boolean
  }>({
    diploma: false,
    sicil: false,
    saglik: false,
    ikametgah: false,
  })

  // ── AKILLI TAHTAYA GÖNDER ÇOK AŞAMALI İŞLEM STATE'LERİ ──
  const [isSendToBoardModalOpen, setIsSendToBoardModalOpen] = useState(false)
  const [sendBoardTargetId, setSendBoardTargetId] = useState('1A-01')
  const [sendModalStep, setSendModalStep] = useState<'select' | 'exam' | 'file'>('select')
  const [isSendingToBoard, setIsSendingToBoard] = useState(false)

  // 1. Pano Sınav Oluşturma State'i
  const [examTitle, setExamTitle] = useState('1/A Sınıfı Mini Değerlendirme Sınavı')
  const [examQuestions, setExamQuestions] = useState<
    {
      id: string
      text: string
      options: { id: string; text: string }[]
      correctOptionId: string
      points?: number
    }[]
  >([
    {
      id: 'q1',
      text: 'Aşağıdaki sayılardan hangisi 4 basamaklı en küçük çift doğal sayıdır?',
      options: [
        { id: 'A', text: '1000' },
        { id: 'B', text: '1002' },
        { id: 'C', text: '1001' },
        { id: 'D', text: '1020' },
      ],
      correctOptionId: 'A',
      points: 25,
    },
    {
      id: 'q2',
      text: 'Güneş Sistemi’ndeki yaşam barındırdığı bilinen tek gezegen hangisidir?',
      options: [
        { id: 'A', text: 'Mars' },
        { id: 'B', text: 'Dünya' },
        { id: 'C', text: 'Jüpiter' },
        { id: 'D', text: 'Venüs' },
      ],
      correctOptionId: 'B',
      points: 25,
    },
  ])

  // 2. Tahtaya Dosya / Görsel State'i
  const [selectedFile, setSelectedFile] = useState<{
    name: string
    size: number
    type: string
    previewUrl: string
  } | null>(null)
  const [fileNote, setFileNote] = useState('')
  const [isDraggingFile, setIsDraggingFile] = useState(false)

  // 3. Sevimli Başarı / Bilgi Popup Modalı
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean
    type: 'success' | 'error'
    title: string
    message: string
    badge?: string
    targetUrl?: string
    actionLabel?: string
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  })

  // Soru Ekleme
  const handleAddQuestion = () => {
    const nextNum = examQuestions.length + 1
    setExamQuestions((prev) => [
      ...prev,
      {
        id: `q_${Date.now()}_${nextNum}`,
        text: '',
        options: [
          { id: 'A', text: '' },
          { id: 'B', text: '' },
          { id: 'C', text: '' },
          { id: 'D', text: '' },
        ],
        correctOptionId: 'A',
        points: 25,
      },
    ])
  }

  // Soru Silme
  const handleRemoveQuestion = (index: number) => {
    if (examQuestions.length <= 1) {
      toast.error('Sınavda en az 1 soru bulunmalıdır.')
      return
    }
    setExamQuestions((prev) => prev.filter((_, i) => i !== index))
  }

  // Soru Metni Güncelleme
  const handleUpdateQuestionText = (index: number, text: string) => {
    setExamQuestions((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], text }
      return copy
    })
  }

  // Şık Metni Güncelleme
  const handleUpdateOptionText = (qIndex: number, optId: string, text: string) => {
    setExamQuestions((prev) => {
      const copy = [...prev]
      copy[qIndex] = {
        ...copy[qIndex],
        options: copy[qIndex].options.map((opt) => (opt.id === optId ? { ...opt, text } : opt)),
      }
      return copy
    })
  }

  // Doğru Şıkkı Belirleme
  const handleSelectCorrectOption = (qIndex: number, optId: string) => {
    setExamQuestions((prev) => {
      const copy = [...prev]
      copy[qIndex] = { ...copy[qIndex], correctOptionId: optId }
      return copy
    })
  }

  // Örnek Sorularla Doldur
  const handleFillSampleQuestions = () => {
    setExamTitle(`${selectedClass?.name || '1/A'} Genel Değerlendirme Testi`)
    setExamQuestions([
      {
        id: 'q1',
        text: 'Aşağıdaki sayılardan hangisi 4 basamaklı en küçük çift doğal sayıdır?',
        options: [
          { id: 'A', text: '1000' },
          { id: 'B', text: '1002' },
          { id: 'C', text: '1001' },
          { id: 'D', text: '1020' },
        ],
        correctOptionId: 'A',
        points: 25,
      },
      {
        id: 'q2',
        text: 'Bir dikdörtgenin kısa kenarı 6 cm, uzun kenarı 12 cm ise çevresi kaç cm\'dir?',
        options: [
          { id: 'A', text: '18 cm' },
          { id: 'B', text: '36 cm' },
          { id: 'C', text: '72 cm' },
          { id: 'D', text: '24 cm' },
        ],
        correctOptionId: 'B',
        points: 25,
      },
      {
        id: 'q3',
        text: 'Güneş Sistemi’ndeki yaşam barındırdığı bilinen gezegen hangisidir?',
        options: [
          { id: 'A', text: 'Mars' },
          { id: 'B', text: 'Dünya' },
          { id: 'C', text: 'Jüpiter' },
          { id: 'D', text: 'Venüs' },
        ],
        correctOptionId: 'B',
        points: 25,
      },
      {
        id: 'q4',
        text: 'Aşağıdaki cümlelerin hangisinde mecaz anlamlı bir sözcük kullanılmıştır?',
        options: [
          { id: 'A', text: 'Bugün hava oldukça sıcaktı.' },
          { id: 'B', text: 'Sözleriyle kalbimi kırdı.' },
          { id: 'C', text: 'Kitabın kapağı yırtılmış.' },
          { id: 'D', text: 'Bahçedeki ağaçlar çiçek açtı.' },
        ],
        correctOptionId: 'B',
        points: 25,
      },
    ])
    toast.success('Örnek sınav soruları yüklendi!', { icon: '✨' })
  }

  // Görsel Dosyası İşleme
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Geçersiz Dosya Formatı',
        message: 'Lütfen tahtaya aktarmak için geçerli bir görsel dosyası (PNG, JPG, WEBP, SVG) seçin.',
      })
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Dosya Boyutu Çok Büyük',
        message: 'Görsel dosya boyutu 8MB\'dan küçük olmalıdır.',
      })
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setSelectedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl: reader.result as string,
      })
      toast.success(`"${file.name}" yüklendi.`, { icon: '🖼️' })
    }
    reader.readAsDataURL(file)
  }

  // Sınavı Panoya Gönder
  const handleSendExamToBoard = () => {
    const cleanTarget = sendBoardTargetId.trim().toUpperCase()
    if (!cleanTarget) {
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Tahta ID Belirtilmedi',
        message: 'Lütfen sınavın gönderileceği Akıllı Tahta ID\'sini girin (Örn: 1A-01).',
      })
      return
    }

    // Soruların doğrulaması
    for (let i = 0; i < examQuestions.length; i++) {
      const q = examQuestions[i]
      if (!q.text.trim()) {
        setFeedbackModal({
          isOpen: true,
          type: 'error',
          title: 'Eksik Soru Metni',
          message: `Lütfen ${i + 1}. sorunun metnini yazınız.`,
        })
        return
      }
      const emptyOpt = q.options.find((opt) => !opt.text.trim())
      if (emptyOpt) {
        setFeedbackModal({
          isOpen: true,
          type: 'error',
          title: 'Eksik Şık Bilgisi',
          message: `Lütfen ${i + 1}. sorunun ${emptyOpt.id} şıkkının metnini doldurunuz.`,
        })
        return
      }
      if (!q.correctOptionId) {
        setFeedbackModal({
          isOpen: true,
          type: 'error',
          title: 'Doğru Cevap Seçilmedi',
          message: `Lütfen ${i + 1}. sorunun doğru cevabını şıklar arasından işaretleyiniz.`,
        })
        return
      }
    }

    setIsSendingToBoard(true)
    setTimeout(() => {
      setIsSendingToBoard(false)
      const examPayload = {
        id: `exam_${Date.now()}`,
        title: examTitle.trim() || 'Haftalık Değerlendirme Sınavı',
        boardId: cleanTarget,
        createdAt: Date.now(),
        teacherName: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Ders Öğretmeni',
        questions: examQuestions.map((q, idx) => ({
          id: q.id || `q_${idx + 1}`,
          text: q.text.trim(),
          options: q.options.map((opt) => ({ id: opt.id, text: opt.text.trim() })),
          correctOptionId: q.correctOptionId,
          points: q.points || 25,
        })),
      }

      try {
        localStorage.setItem(`oxonom_pano_exam_${cleanTarget}`, JSON.stringify(examPayload))
        localStorage.setItem('oxonom_pano_active_exam', JSON.stringify(examPayload))
        window.dispatchEvent(new CustomEvent('oxonom_pano_exam_updated', { detail: examPayload }))
      } catch (e) {
        console.warn('Storage save skipped', e)
      }

      setIsSendToBoardModalOpen(false)
      setFeedbackModal({
        isOpen: true,
        type: 'success',
        title: '🎉 Sınav Başarıyla Gönderildi!',
        message: `${cleanTarget} nolu akıllı tahtanın "Sınav" menüsüne ${examPayload.questions.length} soruluk interaktif sınav aktarıldı. Akıllı tahtadan öğrencilerle anında başlatılabilir.`,
        badge: cleanTarget,
        targetUrl: `/pano/${encodeURIComponent(cleanTarget)}`,
        actionLabel: 'Panoyu Canlı Aç 🚀',
      })
    }, 600)
  }

  // Görseli Akıllı Tahtaya Gönder
  const handleSendFileToBoard = () => {
    const cleanTarget = sendBoardTargetId.trim().toUpperCase()
    if (!cleanTarget) {
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Tahta ID Belirtilmedi',
        message: 'Lütfen görselin aktarılacağı Akıllı Tahta ID\'sini girin (Örn: 1A-01).',
      })
      return
    }
    if (!selectedFile) {
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Görsel Seçilmedi',
        message: 'Lütfen tahtaya aktarmak için bir görsel seçin veya sürükleyip bırakın.',
      })
      return
    }

    setIsSendingToBoard(true)
    setTimeout(() => {
      setIsSendingToBoard(false)
      const filePayload = {
        id: `file_${Date.now()}`,
        boardId: cleanTarget,
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        url: selectedFile.previewUrl,
        uploadedAt: Date.now(),
        sender: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Ders Öğretmeni',
        note: fileNote.trim(),
      }

      try {
        const existing = JSON.parse(localStorage.getItem(`oxonom_pano_files_${cleanTarget}`) || '[]')
        localStorage.setItem(`oxonom_pano_files_${cleanTarget}`, JSON.stringify([filePayload, ...existing]))
        localStorage.setItem('oxonom_pano_latest_file', JSON.stringify(filePayload))
        localStorage.setItem(`oxonom_whiteboard_incoming_${cleanTarget}`, JSON.stringify(filePayload))
        window.dispatchEvent(new CustomEvent('oxonom_pano_file_shared', { detail: filePayload }))

        // Multi-tab BroadcastChannel for real-time cross-tab delivery
        try {
          const bc = new BroadcastChannel('oxonom_pano_channel')
          bc.postMessage({ type: 'oxonom_pano_file_shared', payload: filePayload })
          bc.close()
        } catch (_) {}
      } catch (e) {
        console.warn('File storage skipped', e)
      }

      setIsSendToBoardModalOpen(false)
      setSelectedFile(null)
      setFileNote('')
      setFeedbackModal({
        isOpen: true,
        type: 'success',
        title: '🎨 Görsel Akıllı Tahtaya Gönderildi!',
        message: `"${filePayload.name}" materyali ${cleanTarget} Akıllı Tahtasına aktarıldı ve çizim tahtasında kullanıma hazırlandı.`,
        badge: cleanTarget,
        targetUrl: `/pano/${encodeURIComponent(cleanTarget)}/tahta`,
        actionLabel: 'Akıllı Tahtayı Aç 🎨',
      })
    }, 600)
  }

  // Check if profile completion is needed on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const isCompleted = localStorage.getItem('oxonom_teacher_profile_completed')
        const rawProfile = localStorage.getItem('oxonom_teacher_profile')
        let profileObj: any = null
        if (rawProfile) profileObj = JSON.parse(rawProfile)

        if (isCompleted === 'false' || profileObj?.isFirstLogin === true || profileObj?.profileCompleted === false) {
          setIsOnboardingModalOpen(true)
          if (profileObj?.firstName) setOnboardingFirstName(profileObj.firstName)
          if (profileObj?.lastName) setOnboardingLastName(profileObj.lastName)
          if (profileObj?.tcNo) setOnboardingTcNo(profileObj.tcNo)
          if (profileObj?.phone) setOnboardingPhone(profileObj.phone)
          if (profileObj?.branch) setOnboardingBranch(profileObj.branch)
        }
      } catch (_) {}
    }
  }, [])

  const handleSimulateUpload = (docKey: 'diploma' | 'sicil' | 'saglik' | 'ikametgah') => {
    toast.loading('Belge sisteme yükleniyor ve doğrulanıyor...', { id: `upload-${docKey}` })
    setTimeout(() => {
      setUploadedDocs((prev) => ({ ...prev, [docKey]: true }))
      toast.success('Belge başarıyla yüklendi ve e-Devlet doğrulaması alındı!', { id: `upload-${docKey}` })
    }, 800)
  }

  const handleCompleteOnboarding = (e: React.FormEvent) => {
    e.preventDefault()
    if (!onboardingFirstName.trim()) {
      toast.error('Lütfen adınızı giriniz.')
      setOnboardingStep(1)
      return
    }
    if (!onboardingTcNo.trim() || onboardingTcNo.length < 11) {
      toast.error('Lütfen 11 haneli TC Kimlik numaranızı doğrulayınız.')
      setOnboardingStep(1)
      return
    }
    if (!uploadedDocs.diploma || !uploadedDocs.sicil) {
      toast.error('Lütfen en az Diploma ve Adli Sicil belgelerinizi yükleyiniz.')
      setOnboardingStep(3)
      return
    }
    if (onboardingNewPass && onboardingNewPass !== onboardingNewPassConfirm) {
      toast.error('Yeni şifreler birbiriyle uyuşmuyor.')
      setOnboardingStep(4)
      return
    }
    if (!onboardingKvkkAccepted) {
      toast.error('Lütfen KVKK ve Kurumsal Aydınlatma Metnini onaylayınız.')
      setOnboardingStep(4)
      return
    }

    if (typeof window !== 'undefined') {
      try {
        const rawProfile = localStorage.getItem('oxonom_teacher_profile')
        const prev = rawProfile ? JSON.parse(rawProfile) : {}
        const updated = {
          ...prev,
          firstName: onboardingFirstName.trim(),
          lastName: onboardingLastName.trim(),
          tcNo: onboardingTcNo.trim(),
          phone: onboardingPhone.trim(),
          address: onboardingAddress.trim(),
          university: onboardingUniversity.trim(),
          graduationYear: onboardingGraduationYear.trim(),
          branch: onboardingBranch.trim(),
          sicilNo: onboardingSicilNo.trim(),
          bankName: onboardingBankName.trim(),
          iban: onboardingIban.trim(),
          bio: `${onboardingBranch || 'Öğretmen'} · Oxonom Okulları`,
          isFirstLogin: false,
          profileCompleted: true,
        }
        localStorage.setItem('oxonom_teacher_profile', JSON.stringify(updated))
        localStorage.setItem('oxonom_teacher_profile_completed', 'true')

        // Update in admin teachers list
        const adminTeachersRaw = localStorage.getItem('oxonom_admin_teachers_30')
        if (adminTeachersRaw) {
          const teachers = JSON.parse(adminTeachersRaw)
          const updatedTeachers = teachers.map((t: any) => {
            if (t.email?.toLowerCase() === updated.email?.toLowerCase() || t.id === updated.id) {
              return {
                ...t,
                name: `${updated.firstName} ${updated.lastName}`.trim(),
                tcNo: updated.tcNo,
                phone: updated.phone,
                branch: updated.branch,
                isFirstLogin: false,
                profileCompleted: true,
                documents: [
                  { id: 'doc-dip', name: 'Lisans_Mezuniyet_Diplomasi.pdf', type: 'Lisans Diploması', uploadDate: 'Bugün', fileSize: '2.4 MB' },
                  { id: 'doc-sic', name: 'e-Devlet_Adli_Sicil_Kaydi.pdf', type: 'Adli Sicil Kaydı', uploadDate: 'Bugün', fileSize: '1.1 MB' },
                  ...(uploadedDocs.saglik ? [{ id: 'doc-sag', name: 'Saglik_Kurulu_Raporu.pdf', type: 'Sağlık Raporu', uploadDate: 'Bugün', fileSize: '1.8 MB' }] : []),
                  ...(uploadedDocs.ikametgah ? [{ id: 'doc-ika', name: 'Yerlesim_Yeri_Belgesi.pdf', type: 'İkametgah Belgesi', uploadDate: 'Bugün', fileSize: '0.9 MB' }] : []),
                ],
              }
            }
            return t
          })
          localStorage.setItem('oxonom_admin_teachers_30', JSON.stringify(updatedTeachers))
        }

        window.dispatchEvent(new CustomEvent('oxonom_teacher_profile_updated', { detail: updated }))
        setTeacherProfile(updated)
      } catch (_) {}
    }

    setIsOnboardingModalOpen(false)
    toast.success('Tebrikler! Profiliniz ve resmi evraklarınız başarıyla tamamlandı.', { duration: 5000, icon: '🎉' })
  }

  // Helper to load and merge all saved boards (both mobile & Pano classroom boards)
  const loadMergedBoards = useCallback(() => {
    if (typeof window === 'undefined') return []
    const results: any[] = []
    const seenIds = new Set<string>()

    // 1. Read mobile boards (oxonom_m_boards)
    try {
      const rawM = localStorage.getItem('oxonom_m_boards')
      if (rawM) {
        const parsed = JSON.parse(rawM)
        if (Array.isArray(parsed)) {
          for (const b of parsed) {
            const bId = String(b.id || b.board_uuid || '')
            if (bId && !seenIds.has(bId)) {
              seenIds.add(bId)
              results.push(b)
            }
          }
        }
      }
    } catch (_) {}

    // 2. Read Pano custom boards (oxonom_custom_boards)
    try {
      const rawC = localStorage.getItem('oxonom_custom_boards')
      if (rawC) {
        const parsed = JSON.parse(rawC)
        if (Array.isArray(parsed)) {
          for (const c of parsed) {
            const cId = String(c.board_uuid || c.id || '')
            if (cId && !seenIds.has(cId)) {
              seenIds.add(cId)
              results.push({
                id: cId,
                title: c.name || c.title || 'Ders Tahtası',
                className: c.className || selectedClass?.name || 'Sınıf',
                usergroupId: c.usergroup_id,
                date: c.date || c.board_date || 'Bugün',
                time: c.time || '10:30',
                description: `${c.className || selectedClass?.name || 'Sınıf'} akıllı tahtasında kaydedilen ders çizimleri`,
                url: `/board/${cId}`,
                createdAt: c.createdAt || Date.now(),
                lastOpenedAt: c.lastOpenedAt || c.createdAt || Date.now(),
                isOpen: false,
                isPublic: true,
              })
            }
          }
        }
      }
    } catch (_) {}

    return results
  }, [selectedClass?.name])

  // Boards for selected class (Synced from local storage / demo)
  const [localBoards, setLocalBoards] = useState<any[]>([])

  useEffect(() => {
    setLocalBoards(loadMergedBoards())
    const handleSync = () => {
      setLocalBoards(loadMergedBoards())
    }
    window.addEventListener('oxonom_pano_sync', handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener('oxonom_pano_sync', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [loadMergedBoards, selectedClass?.code])

  // Filter and sort so the most recently opened & saved board is displayed FIRST in Quick Access
  const classBoards = useMemo(() => {
    const code = selectedClass?.code?.toLowerCase() || ''
    const cName = selectedClass?.name?.toLowerCase() || ''
    const cId = selectedClass?.id

    const matched = localBoards.filter((b) => {
      const bClass = (b.className || '').toLowerCase()
      const bTitle = (b.title || '').toLowerCase()
      const matchId = cId && (Number(b.usergroupId) === Number(cId) || Number(b.usergroup_id) === Number(cId))
      const matchCode = code && (bClass.includes(code) || bTitle.includes(code))
      const matchName = cName && (bClass.includes(cName) || bTitle.includes(cName))
      const matchPanosu = bTitle.includes('sınıf panosu')
      return matchId || matchCode || matchName || matchPanosu
    })

    // Sort descending: most recently opened & saved board comes first
    return matched.sort((a, b) => {
      const timeA = a.lastOpenedAt || a.createdAt || (a.date ? new Date(a.date).getTime() : 0) || 0
      const timeB = b.lastOpenedAt || b.createdAt || (b.date ? new Date(b.date).getTime() : 0) || 0
      return timeB - timeA
    })
  }, [localBoards, selectedClass?.code, selectedClass?.name, selectedClass?.id])

  const latestClassBoard = classBoards.length > 0 ? classBoards[0] : null

  // Fetch Classroom Assignments
  const { data: assignmentsData } = useQuery({
    queryKey: ['classroom-assignments-v2', selectedClass?.id],
    queryFn: () =>
      getSchoolAssignments(
        org?.id || 10,
        { usergroup_id: selectedClass?.id },
        token || ''
      ),
    staleTime: 30_000,
  })
  const assignments: SchoolAssignmentItem[] = Array.isArray(assignmentsData) ? assignmentsData : []

  // Check Active Paired QR Smart Boards
  const [lockingSessionId, setLockingSessionId] = useState<string | null>(null)
  const [loggingOutSessionId, setLoggingOutSessionId] = useState<string | null>(null)

  const {
    data: activeBoardsData,
    refetch: refetchActiveBoards,
  } = useQuery({
    queryKey: ['pano-active-boards-v2', user?.id, user?.email],
    queryFn: async () => {
      try {
        const storedSessionId =
          typeof window !== 'undefined'
            ? localStorage.getItem('oxonom_pano_active_session_id') ||
              sessionStorage.getItem('oxonom_pano_active_session_id') ||
              ''
            : ''

        const params = new URLSearchParams()
        if (user?.id) params.set('teacherId', String(user.id))
        else params.set('teacherId', '2')

        if (user?.email) params.set('email', user.email)
        else params.set('email', 'ogretmen@oxonom.com')

        if (storedSessionId) params.set('sessionId', storedSessionId)

        const res = await fetch(`/api/pano/pair/active-boards?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          const list = Array.isArray(data.boards)
            ? data.boards
            : Array.isArray(data.activeBoards)
            ? data.activeBoards
            : []
          if (list.length === 0 && storedSessionId && typeof window !== 'undefined') {
            localStorage.removeItem('oxonom_pano_active_session_id')
            sessionStorage.removeItem('oxonom_pano_active_session_id')
          }
          return list
        }
      } catch (_) {}
      return []
    },
    refetchInterval: 2500,
  })

  const activeQrBoards: any[] = Array.isArray(activeBoardsData) ? activeBoardsData : []
  const pairedBoard = activeQrBoards.length > 0 ? activeQrBoards[0] : null
  const isBoardConnected = Boolean(pairedBoard)

  // Listen to pairing events & localStorage updates
  useEffect(() => {
    const handleSync = () => {
      refetchActiveBoards()
    }
    window.addEventListener('oxonom_pano_sync', handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener('oxonom_pano_sync', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [refetchActiveBoards])

  // Remote Lock Handler
  const handleLockBoard = async (sessId: string) => {
    setLockingSessionId(sessId)
    try {
      const phoneToken =
        typeof window !== 'undefined'
          ? localStorage.getItem('oxonom_pano_device_token') || ''
          : ''
      const res = await fetch('/api/remote/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessId,
          action: 'LOCK',
          token: phoneToken || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Akıllı tahta kilitlendi!')
      } else {
        toast.error(data.error || 'Tahta kilitlenemedi.')
      }
    } catch (_) {
      toast.error('Bağlantı hatası.')
    } finally {
      setLockingSessionId(null)
    }
  }

  // Remote Logout Handler
  const handleLogoutBoard = async (sessId: string) => {
    if (!confirm('Bu akıllı tahtadaki oturumunuzu kapatmak istediğinize emin misiniz?')) {
      return
    }
    setLoggingOutSessionId(sessId)
    try {
      const res = await fetch('/api/pano/pair/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessId,
          role: 'phone',
          target: 'board_only',
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Akıllı tahta oturumu kapatıldı.')
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('oxonom_pano_active_session_id')
          if (stored === sessId) {
            localStorage.removeItem('oxonom_pano_active_session_id')
            sessionStorage.removeItem('oxonom_pano_active_session_id')
          }
        }
        refetchActiveBoards()
      } else {
        toast.error(data.error || 'Çıkış yapılamadı.')
      }
    } catch (_) {
      toast.error('Bağlantı hatası.')
    } finally {
      setLoggingOutSessionId(null)
      refetchActiveBoards()
    }
  }

  // Sibling Classrooms (1-A, 1-B, 1-C)
  const siblingClassrooms = useMemo(() => {
    return ALL_CLASSROOMS.filter((c) => c.grade_level === selectedClass.grade_level).slice(0, 3)
  }, [selectedClass])

  // Logout Handler
  const handleSignOut = async () => {
    toast.loading('Oturum kapatılıyor...', { id: 'dashv2-logout' })
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('oxonom_pano_paired_session')
        localStorage.removeItem('oxonom_pano_active_session_id')
        localStorage.removeItem('oxonom_pano_device_token')
        localStorage.removeItem('oxonom_pano_device_type')
        localStorage.removeItem('oxonom_selected_class')
        localStorage.removeItem('oxonom_pano_selected_class_id')
        sessionStorage.clear()
      }
      await authSignOut({ redirect: true, callbackUrl: '/m-login' })
    } catch {
      await signOut({ redirect: true, callbackUrl: '/m-login' })
    }
  }

  // Stagger animation variants
  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  }

  const itemVariants: any = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] } },
  }

  const pageContent = (
    <div className="flex flex-col flex-1 w-full">

        {/* ── MAIN CONTENT CONTAINER (Spacious, Staggered entrance from Left) ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full"
        >
          {/* ── HERO ALANI (Oxonom Corporate Purple & Orchid Premium Glow) ── */}
          <motion.section
            variants={itemVariants}
            className="w-full bg-gradient-to-br from-[#241329] via-[#4B075F] to-[#8D49A6] dark:from-[#17101C] dark:via-[#211729] dark:to-[#350444] rounded-[30px] p-5 sm:p-6 space-y-4 sm:space-y-5 text-white shadow-[0_16px_45px_rgba(75,7,95,0.22)] border border-[#8D49A6]/30 dark:border-[#49364F] relative overflow-hidden"
          >
            {/* Animated Background Subtle Concentric Circles */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none opacity-25">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 42, repeat: Infinity, ease: 'linear' }}
                className="w-full h-full relative"
              >
                <div className="absolute inset-0 rounded-full border border-[#D914C8]/40" />
                <div className="absolute inset-6 rounded-full border border-white/20 border-dashed" />
                <div className="absolute inset-12 rounded-full border border-[#F0D8FA]/30" />
              </motion.div>
            </div>

            {/* Subtle gradient sheen behind hero */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#D914C8]/20 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* Top Row: Tag & Greetings on Left + Prominent Clickable Account Link on Right */}
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="space-y-1.5 min-w-0 flex-1">
                <span className="text-[11px] font-extrabold tracking-widest text-[#F0D8FA] uppercase block">
                  ÖĞRETMEN ÇALIŞMA ALANI
                </span>
                <div className="text-xs sm:text-sm text-[#F0D8FA]/90 font-medium leading-none pt-0.5">
                  Hoş Geldiniz,
                </div>
                <h1 className="text-[24px] sm:text-[28px] font-bold text-white tracking-tight leading-tight font-serif-display truncate">
                  {teacherName}
                </h1>
                <p className="text-[11px] text-[#F0D8FA]/80 font-medium truncate">
                  {teacherProfile?.branch || 'Türk Dili ve Edebiyatı'} · Oxonom Okulları
                </p>
              </div>

              {/* Prominent, Clearly Noticeable & Clickable Account / Profile Button */}
              <Link
                href="/teacher/settings"
                className="group flex items-center gap-2.5 p-2 sm:p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 backdrop-blur-md transition-all shadow-md shrink-0 cursor-pointer"
                title="Hesap ve Profil Ayarları"
              >
                <div className="relative">
                  {teacherProfile?.avatarUrl || teacherProfile?.avatarImage ? (
                    <img
                      src={teacherProfile.avatarUrl || teacherProfile.avatarImage}
                      alt={teacherName}
                      className="w-10 h-10 rounded-xl object-cover border border-[#D914C8]/60 shadow-sm group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-white text-[#4B075F] flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
                      {teacherInitials}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#D914C8] border-2 border-[#4B075F]" />
                </div>
                <div className="text-left hidden xs:block sm:block pr-1">
                  <div className="text-[10px] text-[#F0D8FA] font-bold uppercase tracking-wider flex items-center gap-1">
                    <span>Hesabım</span>
                    <Settings size={11} className="text-[#D914C8] group-hover:rotate-45 transition-transform" />
                  </div>
                  <div className="text-xs font-bold text-white group-hover:text-[#F0D8FA] transition-colors flex items-center gap-0.5">
                    <span>Profil</span>
                    <ChevronRight size={13} className="text-[#F0D8FA] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>

            {/* Incomplete Profile Alert Banner (If profile completion is pending) */}
            {teacherProfile?.profileCompleted === false && (
              <div className="relative z-10 p-3 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-200 flex items-center justify-center shrink-0">
                    <AlertCircle size={16} />
                  </span>
                  <div className="min-w-0">
                    <div className="font-extrabold text-white">
                      Profil & Evrak Tamamlama Bekleniyor
                    </div>
                    <div className="text-[11px] text-[#F0D8FA] truncate">
                      MEB resmi kaydınız için evraklarınızı yükleyin
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOnboardingModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F0D8FA] text-[#4B075F] font-black text-xs shrink-0 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  Tamamla
                </button>
              </div>
            )}

            {/* Sınıf Dropdown, Akıllı Tahtaya Gönder & Notlar Butonları */}
            <div className="flex items-center gap-2 pt-1 relative z-10 flex-wrap sm:flex-nowrap">
              {/* Sınıf Dropdown Pill */}
              <button
                type="button"
                onClick={() => setIsClassSheetOpen(true)}
                className="flex-1 min-w-[120px] bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl py-2 px-3 flex items-center justify-between text-left cursor-pointer active:scale-[0.98] transition-all shadow-inner group h-[48px]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <GraduationCap size={16} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] text-[#F0D8FA] block leading-tight font-medium">
                      Sınıf
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white block leading-tight truncate">
                      {selectedClass.code}
                    </span>
                  </div>
                </div>
                <ChevronDown size={14} className="text-[#F0D8FA] shrink-0 group-hover:text-white transition-colors" />
              </button>

              {/* Akıllı Tahtaya Gönder Butonu */}
              <button
                type="button"
                onClick={() => {
                  const autoBoard = selectedClass.code ? `${selectedClass.code.replace(/[^A-Za-z0-9]/g, '')}-01` : '1A-01'
                  setSendBoardTargetId(autoBoard)
                  setIsSendToBoardModalOpen(true)
                }}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-md shadow-emerald-950/20 shrink-0 h-[48px]"
                title="Ders içeriğini doğrudan akıllı tahtaya gönder"
              >
                <Tv size={16} className="text-white shrink-0" />
                <span className="whitespace-nowrap">Tahtaya Gönder</span>
              </button>

              {/* Notlar Butonu */}
              <button
                type="button"
                onClick={() => setIsNotesModalOpen(true)}
                className="bg-white hover:bg-[#FCE8FA] text-[#4B075F] font-bold text-xs sm:text-sm px-3.5 py-2 rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-md shrink-0 h-[48px]"
              >
                <FileText size={15} strokeWidth={2.5} className="text-[#D914C8]" />
                <span>Notlar</span>
              </button>
            </div>
          </motion.section>

          {/* ══════════════════════════════════════════════════════════════════════════
              CANLI DERS TAKİP RADARI & ZAMAN AKIŞI (ÖĞRETMEN)
          ══════════════════════════════════════════════════════════════════════════ */}
          <motion.div variants={itemVariants}>
            <LiveClassRadar
              role="teacher"
              initialClassCode={selectedClass.code || '1/A'}
            />
          </motion.div>

          {/* ══════════════════════════════════════════════════════════════════════════
              HAFTALIK DERS KAZANIMLARI VE KONU İLERLEME PANELİ (ÖĞRETMEN WİDGETI)
          ══════════════════════════════════════════════════════════════════════════ */}
          <motion.div variants={itemVariants}>
            <WeeklyCurriculumProgressWidget selectedClass={selectedClass} />
          </motion.div>

          {/* ══════════════════════════════════════════════════════════════════════════
              KATEGORİ 1: GÜNLÜK SINIF VE DEVAM YÖNETİMİ
          ══════════════════════════════════════════════════════════════════════════ */}
          <motion.div variants={itemVariants} className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-[11px] tracking-wider uppercase border border-indigo-500/20">
                KATEGORİ 1
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                Günlük Sınıf ve Devam Yönetimi
              </h2>
              <div className="flex-1 h-[1px] bg-gray-200/80 dark:bg-gray-800" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Kart 1A: Sınıf Rehberliği & Genel Durum */}
              <div className="bg-white dark:bg-[#121826] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col justify-between gap-4 group hover:border-indigo-500/30 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Users size={19} />
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
                      Rehberlik Sınıfı
                    </span>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-gray-900 dark:text-white">
                        {selectedClass.student_count || 1}
                      </span>
                      <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                        Aktif Öğrenci
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1">
                      {selectedClass.code} Şubesi · Türk Dili ve Edebiyatı
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                      Erçil UĞURLU (No: 101)
                    </p>
                  </div>
                </div>

                <Link
                  href={`/teacher/classes?class=${encodeURIComponent(selectedClass.code)}`}
                  className="w-full py-2 px-3 rounded-xl bg-gray-50 hover:bg-indigo-50 dark:bg-gray-800/60 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Sınıf Listesini Görüntüle</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              {/* Kart 1B: Canlı Günlük Yoklama Takibi */}
              <div className="bg-white dark:bg-[#121826] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col justify-between gap-4 group hover:border-emerald-500/30 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CheckSquare size={19} />
                    </div>
                    {attendanceData?.taken ? (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 border border-emerald-200/60 dark:border-emerald-800/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        Tamamlandı • {attendanceData.updatedAt}
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center gap-1 border border-amber-200/60 dark:border-amber-800/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping inline-block" />
                        Yoklama Bekliyor
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        Günlük Sınıf Yoklaması
                      </h3>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {selectedClass.code} Şubesi için bugünkü devam kaydı
                    </p>
                  </div>

                  {attendanceData?.taken ? (
                    <div className="space-y-2 pt-1">
                      <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                        <div
                          style={{
                            width: `${
                              ((attendanceData.presentCount || 0) /
                                (attendanceData.totalCount || selectedClass.student_count || 1)) *
                              100
                            }%`,
                          }}
                          className="h-full bg-emerald-500 rounded-l-full"
                        />
                        <div
                          style={{
                            width: `${
                              ((attendanceData.absentCount || 0) /
                                (attendanceData.totalCount || selectedClass.student_count || 1)) *
                              100
                            }%`,
                          }}
                          className="h-full bg-rose-500 rounded-r-full"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50 text-center">
                          {attendanceData.presentCount} Mevcut
                        </div>
                        <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/50 text-center">
                          {attendanceData.absentCount} Eksik
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-300/60 dark:border-amber-700/60 text-xs space-y-1">
                      <div className="font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <AlertCircle size={14} className="animate-pulse" />
                        <span>Bugünkü yoklama henüz alınmadı</span>
                      </div>
                      <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                        Dersi başlatmadan önce lütfen yoklamayı tamamlayınız.
                      </p>
                    </div>
                  )}
                </div>

                <Link
                  href={`/teacher/attendance?class=${encodeURIComponent(selectedClass.code)}`}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    attendanceData?.taken
                      ? 'bg-gray-50 hover:bg-emerald-50 dark:bg-gray-800/60 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500 hover:bg-amber-600 text-black shadow-xs'
                  }`}
                >
                  <span>{attendanceData?.taken ? 'Yoklama Detaylarını Aç' : 'Yoklama Al'}</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              {/* Kart 1C: Bugünkü Canlı Ders Akışı */}
              <div className="bg-white dark:bg-[#121826] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col justify-between gap-4 group hover:border-sky-500/30 transition-all md:col-span-2 lg:col-span-1">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                      <Calendar size={19} />
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/50 dark:border-sky-800/50">
                      Bugünkü Dersler
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Ders Programı Akışı
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Haftalık ders dağılımına göre planlanan saatler
                    </p>
                  </div>

                  <div className="space-y-2 pt-0.5">
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                      <div className="space-y-0.5 min-w-0">
                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>1. Ders · Türk Dili ve Edebiyatı</span>
                        </div>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 block truncate">
                          {selectedClass.code} Şubesi · Derslik: {selectedClass.code}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md shrink-0">
                        09:00 - 09:40
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                      <div className="space-y-0.5 min-w-0">
                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-400" />
                          <span>2. Ders · Türk Dili ve Edebiyatı</span>
                        </div>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 block truncate">
                          {selectedClass.code} Şubesi · Derslik: {selectedClass.code}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md shrink-0">
                        09:50 - 10:30
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/teacher/schedule"
                  className="w-full py-2 px-3 rounded-xl bg-gray-50 hover:bg-sky-50 dark:bg-gray-800/60 dark:hover:bg-sky-950/40 text-sky-600 dark:text-sky-400 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Haftalık Programın Tamamı</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* ══════════════════════════════════════════════════════════════════════════
              KATEGORİ 2: ÖDEVLER, DOSYALAR VE HIZLI ARAÇLAR
          ══════════════════════════════════════════════════════════════════════════ */}
          <motion.div variants={itemVariants} className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-black text-[11px] tracking-wider uppercase border border-purple-500/20">
                KATEGORİ 2
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                Ödevler, Dosyalar ve Hızlı Araçlar
              </h2>
              <div className="flex-1 h-[1px] bg-gray-200/80 dark:bg-gray-800" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Kart 3A: Verilen Ödevler */}
              <div className="bg-white dark:bg-[#121826] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col justify-between gap-4 group hover:border-purple-500/30 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <BookOpen size={19} />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/50">
                      {assignments.length > 0 ? `${assignments.length} Aktif Ödev` : 'Ödev Havuzu'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        Verilen Ödevler ve Değerlendirme
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {selectedClass.code} Şubesi · Erçil UĞURLU için verilen ödevler, teslim durumları ve puanlama ekranı.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Son Durum:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {assignments.length > 0 ? `${assignments.length} ödev yayında` : 'Yeni ödev oluşturmaya hazır'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href="/teacher/assignments"
                    className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <CheckSquare size={14} />
                    <span>Ödevlere Git</span>
                  </Link>
                </div>
              </div>

              {/* Kart 3B: Dosyalarım ve Paylaşımlar */}
              <div className="bg-white dark:bg-[#121826] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col justify-between gap-4 group hover:border-sky-500/30 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                      <FolderOpen size={19} />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/50 dark:border-sky-800/50">
                      Materyal Havuzu
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Dosyalarım ve Paylaşımlar
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Ders sunumları, PDF çalışma föyleri, tahta çizim çıktıları ve ders arşivi.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Bulut Depolama:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      Aktif ve Erişilebilir
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href="/teacher/files"
                    className="flex-1 py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FolderOpen size={14} />
                    <span>Dosyaları Görüntüle</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* 4'lü Hızlı Araç ve Kısayol Kartları */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <Link
                href="/teacher/schedule"
                className="p-3.5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-100 dark:border-gray-800 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col items-center text-center gap-2 group active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Calendar size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white block">
                    Ders Programı
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    Haftalık Saatler
                  </span>
                </div>
              </Link>

              <Link
                href="/teacher/reports"
                className="p-3.5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-100 dark:border-gray-800 shadow-xs hover:border-[#8D49A6] dark:hover:border-[#8D49A6] transition-all flex flex-col items-center text-center gap-2 group active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-[#4B075F]/10 dark:bg-[#4B075F]/30 text-[#8D49A6] dark:text-[#D914C8] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white block">
                    Sınıf Raporları
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    Devam & Başarı
                  </span>
                </div>
              </Link>

              <Link
                href="/teacher/smartboard"
                className="p-3.5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-100 dark:border-gray-800 shadow-xs hover:border-[#8D49A6] dark:hover:border-[#8D49A6] transition-all flex flex-col items-center text-center gap-2 group active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-[#4B075F]/10 dark:bg-[#4B075F]/30 text-[#8D49A6] dark:text-[#D914C8] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Tv size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white block">
                    Akıllı Tahta
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    Ders Çizimleri
                  </span>
                </div>
              </Link>

              <Link
                href="/teacher/settings"
                className="p-3.5 rounded-2xl bg-white dark:bg-[#121826] border border-gray-100 dark:border-gray-800 shadow-xs hover:border-amber-400 dark:hover:border-amber-600 transition-all flex flex-col items-center text-center gap-2 group active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Settings size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white block">
                    Profil & Ayarlar
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    MEB Özlük & Hesap
                  </span>
                </div>
              </Link>
            </div>
          </motion.div>

          {/* ── FOOTER: OTURUMU KAPAT ── */}
          <footer className="pt-1 pb-1 flex flex-col items-center justify-center text-center">
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-rose-500 active:text-rose-600 transition-colors cursor-pointer rounded-xl"
            >
              <LogOut size={14} />
              <span>Oturumu Kapat</span>
            </button>
          </footer>
        </motion.div>

      {/* ── DIALOGS & DRAWERS (Theme-aware) ── */}
      <ClassSelectorSheet
        isOpen={isClassSheetOpen}
        onClose={() => setIsClassSheetOpen(false)}
        classrooms={ALL_CLASSROOMS}
        selectedClass={selectedClass}
        onSelect={handleSelectClass}
        theme={theme}
      />

      <TeacherNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        classNameCode={selectedClass.code}
        theme={theme}
      />

      {/* ── POPUP: AKILLI TAHTAYA İÇERİK GÖNDERME MODALI (ÇOK AŞAMALI AKIŞ) ── */}
      <AnimatePresence>
        {isSendToBoardModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.25 }}
              className={`w-full ${
                sendModalStep === 'exam' ? 'sm:max-w-2xl' : 'sm:max-w-lg'
              } bg-white dark:bg-[#121826] rounded-t-[32px] sm:rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden relative transition-all duration-300`}
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shrink-0">
                    {sendModalStep === 'exam' ? (
                      <FileQuestion size={20} />
                    ) : sendModalStep === 'file' ? (
                      <UploadCloud size={20} />
                    ) : (
                      <Tv size={20} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <span>
                        {sendModalStep === 'exam'
                          ? 'Pano Sınavı Hazırla'
                          : sendModalStep === 'file'
                          ? 'Tahtaya Görsel / Dosya Yansıt'
                          : 'Akıllı Tahtaya Gönder'}
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        {sendBoardTargetId || '1A-01'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {sendModalStep === 'exam'
                        ? 'Soru ve şıkları oluşturup doğru cevabı belirleyin, tahta Sınav menüsüne gönderin'
                        : sendModalStep === 'file'
                        ? 'Cihazınızdan görsel seçin veya sürükleyip bırakarak tahtada yayınlayın'
                        : 'Tahta ID seçin ve göndermek istediğiniz işlemi belirleyin'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsSendToBoardModalOpen(false)
                    setSendModalStep('select')
                  }}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* ──────────────────────────────────────────────────────── */}
              {/* ADIM 1: TAHTA NO SEÇİMİ VE İŞLEM TÜRÜ (SINAV / DOSYA)   */}
              {/* ──────────────────────────────────────────────────────── */}
              {sendModalStep === 'select' && (
                <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
                  {/* Tahta No Seçimi */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      1. Hedef Tahta No Seçiniz
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={sendBoardTargetId}
                        onChange={(e) => setSendBoardTargetId(e.target.value.toUpperCase())}
                        placeholder="Örn: 1A-01"
                        className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 font-mono font-bold text-sm text-gray-900 dark:text-white outline-hidden focus:border-emerald-500 transition-colors uppercase tracking-wider"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        Tahta No
                      </span>
                    </div>

                    {/* Quick Suggestions Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-bold text-gray-400">Hızlı Seçim:</span>
                      {['1A-01', '1B-01', '2A-01', '3A-01', '4A-01', 'LAB-01'].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setSendBoardTargetId(chip)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-extrabold transition-all cursor-pointer ${
                            sendBoardTargetId === chip
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* İşlem Seçenekleri: Pano Sınav vs Tahtaya Dosya */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      2. Göndermek İstediğiniz İşlemi Seçiniz
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* SEÇENEK 1: PANO SINAV */}
                      <div
                        onClick={() => setSendModalStep('exam')}
                        className="p-4 rounded-2xl border-2 border-[#8D49A6]/30 hover:border-[#8D49A6] bg-gradient-to-br from-[#FAF5FC] to-white dark:from-[#261730]/60 dark:to-[#17101C] hover:shadow-lg hover:shadow-purple-950/10 transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div className="space-y-2.5">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4B075F] to-[#8D49A6] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                            <FileQuestion size={24} />
                          </div>
                          <div>
                            <span className="text-xs font-black text-[#8D49A6] dark:text-[#E9D5FF] uppercase tracking-wider">
                              İnteraktif Değerlendirme
                            </span>
                            <h4 className="text-base font-black text-gray-900 dark:text-white mt-0.5">
                              Pano Sınav
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                              Soru ve şıkları hazırlayın, doğru cevabı belirleyin ve akıllı tahtadaki Sınav menüsüne gönderin.
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-purple-100 dark:border-purple-950/60 flex items-center justify-between text-xs font-bold text-[#8D49A6] dark:text-[#F17AE6]">
                          <span>Sınav Hazırla</span>
                          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                      {/* SEÇENEK 2: TAHTAYA DOSYA */}
                      <div
                        onClick={() => setSendModalStep('file')}
                        className="p-4 rounded-2xl border-2 border-emerald-500/30 hover:border-emerald-500 bg-gradient-to-br from-[#F0FDF4] to-white dark:from-[#06241C]/60 dark:to-[#121826] hover:shadow-lg hover:shadow-emerald-950/10 transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div className="space-y-2.5">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                            <UploadCloud size={24} />
                          </div>
                          <div>
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                              Canlı Görsel / Materyal
                            </span>
                            <h4 className="text-base font-black text-gray-900 dark:text-white mt-0.5">
                              Tahtaya Dosya
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                              Cihazınızdan çalışma kağıdı veya soru görseli yükleyin ya da sürükleyip bırakarak tahtada açın.
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-emerald-100 dark:border-emerald-950/60 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <span>Görsel Yükle</span>
                          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ──────────────────────────────────────────────────────── */}
              {/* ADIM 2A: PANO SINAV OLUŞTURMA EKRANI                     */}
              {/* ──────────────────────────────────────────────────────── */}
              {sendModalStep === 'exam' && (
                <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
                  {/* Top Bar: Back & Sample questions */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={() => setSendModalStep('select')}
                      className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                    >
                      <ArrowLeft size={14} />
                      <span>Geri (Tahta & Mod Seçimi)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleFillSampleQuestions}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-[#8D49A6] dark:text-[#E9D5FF] border border-purple-200 dark:border-purple-800 text-[11px] font-bold hover:bg-purple-100 transition-colors cursor-pointer"
                    >
                      <Sparkles size={12} />
                      <span>Örnek Sorularla Doldur</span>
                    </button>
                  </div>

                  {/* Sınav Başlığı */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Sınav Başlığı
                    </label>
                    <input
                      type="text"
                      value={examTitle}
                      onChange={(e) => setExamTitle(e.target.value)}
                      placeholder="Örn: 1A Matematik Değerlendirme Sınavı"
                      className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-xs sm:text-sm text-gray-900 dark:text-white outline-hidden focus:border-[#8D49A6]"
                    />
                  </div>

                  {/* Sorular Listesi */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Sorular ({examQuestions.length} Soru)
                      </span>
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-gradient text-white text-xs font-bold shadow-xs hover:opacity-95 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Yeni Soru Ekle</span>
                      </button>
                    </div>

                    {examQuestions.map((question, qIdx) => (
                      <div
                        key={question.id}
                        className="p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#4B075F] text-white text-xs font-black">
                            Soru #{qIdx + 1}
                          </span>

                          {examQuestions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(qIdx)}
                              className="w-7 h-7 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center justify-center transition-colors cursor-pointer"
                              title="Soruyu Sil"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>

                        {/* Soru Metni */}
                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">
                            Soru Cümlesi / Metni:
                          </label>
                          <textarea
                            value={question.text}
                            onChange={(e) => handleUpdateQuestionText(qIdx, e.target.value)}
                            placeholder="Örn: Aşağıdaki sayılardan hangisi en büyük basamak değerine sahiptir?"
                            rows={2}
                            className="w-full p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white outline-hidden focus:border-[#8D49A6]"
                          />
                        </div>

                        {/* Şıklar ve Doğru Cevap Seçimi */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400">
                            <span>Şıklar (Doğru cevaba dokunup yeşil yapın):</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                              Seçili Doğru: {question.correctOptionId}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {question.options.map((opt) => {
                              const isCorrect = question.correctOptionId === opt.id
                              return (
                                <div
                                  key={opt.id}
                                  className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                                    isCorrect
                                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20'
                                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                                  }`}
                                >
                                  {/* Doğru Seçim Butonu */}
                                  <button
                                    type="button"
                                    onClick={() => handleSelectCorrectOption(qIdx, opt.id)}
                                    className={`w-7 h-7 rounded-lg font-black text-xs shrink-0 flex items-center justify-center cursor-pointer transition-all ${
                                      isCorrect
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                                    }`}
                                    title={`${opt.id} şıkkını doğru cevap yap`}
                                  >
                                    {isCorrect ? '✓ ' + opt.id : opt.id}
                                  </button>

                                  <input
                                    type="text"
                                    value={opt.text}
                                    onChange={(e) => handleUpdateOptionText(qIdx, opt.id, e.target.value)}
                                    placeholder={`${opt.id} Şıkkı Cevap Metni`}
                                    className="flex-1 min-w-0 bg-transparent text-xs font-semibold text-gray-900 dark:text-white outline-hidden"
                                  />
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ──────────────────────────────────────────────────────── */}
              {/* ADIM 2B: TAHTAYA DOSYA / GÖRSEL YÜKLEME EKRANI           */}
              {/* ──────────────────────────────────────────────────────── */}
              {sendModalStep === 'file' && (
                <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
                  {/* Top Bar: Back */}
                  <div className="pb-2 border-b border-gray-100 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={() => setSendModalStep('select')}
                      className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                    >
                      <ArrowLeft size={14} />
                      <span>Geri (Tahta & Mod Seçimi)</span>
                    </button>
                  </div>

                  {/* Masaüstünde Sürükle Bırak Alanı */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Görsel Seçimi (Sürükle-Bırak veya Dosya Seç)
                    </label>

                    <div
                      onDragOver={(e) => {
                        e.preventDefault()
                        setIsDraggingFile(true)
                      }}
                      onDragLeave={() => setIsDraggingFile(false)}
                      onDrop={(e) => {
                        e.preventDefault()
                        setIsDraggingFile(false)
                        const files = e.dataTransfer.files
                        if (files && files[0]) {
                          processImageFile(files[0])
                        }
                      }}
                      className={`relative rounded-3xl border-2 border-dashed p-6 sm:p-8 text-center transition-all cursor-pointer ${
                        isDraggingFile
                          ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]'
                          : selectedFile
                          ? 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : 'border-gray-300 dark:border-gray-700 hover:border-emerald-500/60 bg-gray-50/60 dark:bg-gray-800/40'
                      }`}
                      onClick={() => {
                        const fileInput = document.getElementById('board-image-file-input')
                        if (fileInput) fileInput.click()
                      }}
                    >
                      <input
                        id="board-image-file-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const files = e.target.files
                          if (files && files[0]) {
                            processImageFile(files[0])
                          }
                        }}
                      />

                      {selectedFile ? (
                        <div className="space-y-3">
                          <div className="relative mx-auto max-w-[200px] max-h-[160px] rounded-2xl overflow-hidden border border-emerald-500/30 shadow-md">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={selectedFile.previewUrl}
                              alt={selectedFile.name}
                              className="w-full h-full object-cover max-h-[160px]"
                            />
                          </div>

                          <div>
                            <span className="text-xs font-black text-gray-900 dark:text-white block truncate max-w-xs mx-auto">
                              {selectedFile.name}
                            </span>
                            <span className="text-[11px] text-gray-400 font-semibold">
                              {(selectedFile.size / 1024).toFixed(1)} KB • Görsel Seçildi
                            </span>
                          </div>

                          <div className="flex items-center justify-center gap-2">
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 rounded-full">
                              ✓ Değiştirmek için tıklayın veya yeni sürükleyin
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-inner">
                            <ImageIcon size={28} />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-gray-900 dark:text-white">
                              Görseli buraya sürükleyin veya dosya seçin
                            </h4>
                            <p className="text-xs text-gray-400 mt-1">
                              PNG, JPG, WEBP, SVG dosyaları desteklenir (Maks: 8MB)
                            </p>
                          </div>
                          <button
                            type="button"
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Upload size={14} />
                            <span>Cihazdan Görsel Seç</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Öğretmen Notu / Açıklama */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      Öğretmen Açıklama Notu (Opsiyonel)
                    </label>
                    <input
                      type="text"
                      value={fileNote}
                      onChange={(e) => setFileNote(e.target.value)}
                      placeholder="Örn: Sayfa 28 alıştırmalarını akıllı tahtada birlikte çözelim."
                      className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-900 dark:text-white outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* ──────────────────────────────────────────────────────── */}
              {/* FOOTER ACTIONS                                           */}
              {/* ──────────────────────────────────────────────────────── */}
              <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (sendModalStep !== 'select') {
                      setSendModalStep('select')
                    } else {
                      setIsSendToBoardModalOpen(false)
                    }
                  }}
                  className="flex-1 h-11 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  {sendModalStep === 'select' ? 'Vazgeç' : '← Geri'}
                </button>

                {sendModalStep === 'exam' && (
                  <button
                    type="button"
                    onClick={handleSendExamToBoard}
                    disabled={isSendingToBoard}
                    className="flex-2 h-11 rounded-xl bg-brand-gradient hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-950/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSendingToBoard ? (
                      <>
                        <RotateCw size={14} className="animate-spin text-white" />
                        <span>Sınav Panoya Aktarılıyor...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Panoya Gönder ({sendBoardTargetId})</span>
                      </>
                    )}
                  </button>
                )}

                {sendModalStep === 'file' && (
                  <button
                    type="button"
                    onClick={handleSendFileToBoard}
                    disabled={isSendingToBoard || !selectedFile}
                    className="flex-2 h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSendingToBoard ? (
                      <>
                        <RotateCw size={14} className="animate-spin text-white" />
                        <span>Tahtaya Yansıtılıyor...</span>
                      </>
                    ) : (
                      <>
                        <Tv size={15} />
                        <span>Tahtaya Gönder ({sendBoardTargetId})</span>
                      </>
                    )}
                  </button>
                )}

                {sendModalStep === 'select' && (
                  <button
                    type="button"
                    onClick={() => {
                      toast('Lütfen yukarıdaki Pano Sınav veya Tahtaya Dosya kartlarından birini seçin.', { icon: '👆' })
                    }}
                    className="flex-2 h-11 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 text-xs font-bold cursor-not-allowed"
                  >
                    İşlem Seçiniz
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── POPUP: SEVİMLİ İŞLEM SONUCU BİLDİRİMİ (BAŞARILI / BAŞARISIZ) ── */}
      <AnimatePresence>
        {feedbackModal.isOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 15 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="w-full max-w-sm rounded-[28px] bg-white dark:bg-[#161D2E] border border-gray-200 dark:border-gray-800 shadow-2xl p-6 text-center space-y-4 relative overflow-hidden"
            >
              {/* Background ambient glow */}
              <div
                className={`absolute top-0 left-1/2 -translate-x-1/2 -mt-12 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-40 ${
                  feedbackModal.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />

              <div className="relative z-10 flex flex-col items-center">
                {/* Cute Icon with subtle float */}
                <div
                  className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg mb-2 ${
                    feedbackModal.type === 'success'
                      ? 'bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-emerald-500/30'
                      : 'bg-gradient-to-br from-rose-400 to-red-600 text-white shadow-rose-500/30'
                  }`}
                >
                  {feedbackModal.type === 'success' ? (
                    <CheckCircle2 size={32} />
                  ) : (
                    <AlertCircle size={32} />
                  )}
                </div>

                {feedbackModal.badge && (
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 mb-2">
                    🖥️ {feedbackModal.badge}
                  </span>
                )}

                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  {feedbackModal.title}
                </h3>

                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mt-1">
                  {feedbackModal.message}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="relative z-10 flex flex-col gap-2 pt-2">
                {feedbackModal.badge && feedbackModal.type === 'success' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        const target =
                          feedbackModal.targetUrl ||
                          `/pano/${encodeURIComponent(feedbackModal.badge || '')}`
                        window.open(target, '_blank')
                      }
                      setFeedbackModal({ ...feedbackModal, isOpen: false })
                    }}
                    className="w-full h-11 rounded-xl bg-brand-gradient hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-950/20 cursor-pointer"
                  >
                    <span>{feedbackModal.actionLabel || 'Tahtayı Canlı Aç 🚀'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                  className="w-full h-11 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  {feedbackModal.type === 'success' ? 'Tamam, Harika!' : 'Kapat & Tekrar Dene'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: İLK GİRİŞ PROFİL TAMAMLAMA & EVRAK YÜKLEME ── */}
      <AnimatePresence>
        {isOnboardingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.25 }}
              className="w-full sm:max-w-lg bg-white dark:bg-[#121826] rounded-t-[32px] sm:rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden relative"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 bg-gradient-to-r from-[#4B075F]/15 via-[#8D49A6]/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-gradient text-white flex items-center justify-center shadow-md shrink-0">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <span>İlk Giriş: Profil & Evrak Tamamlama</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#4B075F]/15 dark:bg-[#4B075F]/40 text-[#8D49A6] dark:text-[#D914C8]">
                        Zorunlu MEB Kaydı
                      </span>
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Oxonom Okulları kadrosundaki resmi kaydınızı ve evraklarınızı onaylayın
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOnboardingModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Stepper Tabs */}
              <div className="px-4 pt-3 shrink-0">
                <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-gray-800/80 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(1)}
                    className={`py-2 rounded-xl transition-all cursor-pointer ${
                      onboardingStep === 1
                        ? 'bg-brand-gradient text-white shadow-sm font-black'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    1. Kimlik
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(2)}
                    className={`py-2 rounded-xl transition-all cursor-pointer ${
                      onboardingStep === 2
                        ? 'bg-brand-gradient text-white shadow-sm font-black'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    2. Akademik
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(3)}
                    className={`py-2 rounded-xl transition-all cursor-pointer ${
                      onboardingStep === 3
                        ? 'bg-brand-gradient text-white shadow-sm font-black'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    3. Belgeler
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(4)}
                    className={`py-2 rounded-xl transition-all cursor-pointer ${
                      onboardingStep === 4
                        ? 'bg-brand-gradient text-white shadow-sm font-black'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    4. Şifre & Onay
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCompleteOnboarding} className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* ── ADIM 1: KİMLİK & İLETİŞİM ── */}
                {onboardingStep === 1 && (
                  <div className="space-y-3.5">
                    <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/50 dark:border-purple-800/40 text-xs text-[#4B075F] dark:text-purple-200">
                      Sayın Öğretmenimiz, müdürlük tarafından oluşturulan temel bilgilerinizi teyit ediniz ve eksik iletişim bilgilerinizi tamamlayınız.
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Adınız <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={onboardingFirstName}
                          onChange={(e) => setOnboardingFirstName(e.target.value)}
                          placeholder="Adınız"
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white outline-hidden focus:border-[#8D49A6]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Soyadınız <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={onboardingLastName}
                          onChange={(e) => setOnboardingLastName(e.target.value)}
                          placeholder="Soyadınız"
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white outline-hidden focus:border-[#8D49A6]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          TC Kimlik No <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={11}
                          value={onboardingTcNo}
                          onChange={(e) => setOnboardingTcNo(e.target.value.replace(/\D/g, ''))}
                          placeholder="11 haneli TC No"
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-mono font-bold text-gray-900 dark:text-white outline-hidden focus:border-[#8D49A6]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Cep Telefonu
                        </label>
                        <input
                          type="text"
                          value={onboardingPhone}
                          onChange={(e) => setOnboardingPhone(e.target.value)}
                          placeholder="+90 532 ..."
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white outline-hidden focus:border-[#8D49A6]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Doğum Tarihi
                        </label>
                        <input
                          type="text"
                          value={onboardingBirthDate}
                          onChange={(e) => setOnboardingBirthDate(e.target.value)}
                          placeholder="GG.AA.YYYY"
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white outline-hidden focus:border-[#8D49A6]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Kan Grubu
                        </label>
                        <select
                          value={onboardingBloodType}
                          onChange={(e) => setOnboardingBloodType(e.target.value)}
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white outline-hidden focus:border-[#8D49A6]"
                        >
                          <option value="A Rh+">A Rh+</option>
                          <option value="A Rh-">A Rh-</option>
                          <option value="B Rh+">B Rh+</option>
                          <option value="B Rh-">B Rh-</option>
                          <option value="AB Rh+">AB Rh+</option>
                          <option value="AB Rh-">AB Rh-</option>
                          <option value="0 Rh+">0 Rh+</option>
                          <option value="0 Rh-">0 Rh-</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        İkametgah Adresi
                      </label>
                      <input
                        type="text"
                        value={onboardingAddress}
                        onChange={(e) => setOnboardingAddress(e.target.value)}
                        placeholder="İlçe / İl (Örn: Beşiktaş / İstanbul)"
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-900 dark:text-white outline-hidden focus:border-[#8D49A6]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Acil Durum Yakını
                        </label>
                        <input
                          type="text"
                          value={onboardingEmergencyContact}
                          onChange={(e) => setOnboardingEmergencyContact(e.target.value)}
                          placeholder="Eşi / Babası"
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-900 dark:text-white outline-hidden focus:border-[#8D49A6]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Acil Durum Tel
                        </label>
                        <input
                          type="text"
                          value={onboardingEmergencyPhone}
                          onChange={(e) => setOnboardingEmergencyPhone(e.target.value)}
                          placeholder="+90 532 ..."
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-900 dark:text-white outline-hidden focus:border-[#8D49A6]"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setOnboardingStep(2)}
                        className="w-full h-11 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        <span>Sonraki: Akademik Bilgiler</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── ADIM 2: AKADEMİK & ÖZLÜK ── */}
                {onboardingStep === 2 && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Mezun Olunan Üniversite & Fakülte <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={onboardingUniversity}
                        onChange={(e) => setOnboardingUniversity(e.target.value)}
                        placeholder="Örn: Boğaziçi Üniversitesi Eğitim Fakültesi"
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white outline-hidden focus:border-[#8D49A6]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Mezuniyet Yılı
                        </label>
                        <input
                          type="text"
                          value={onboardingGraduationYear}
                          onChange={(e) => setOnboardingGraduationYear(e.target.value)}
                          placeholder="2016"
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white outline-hidden focus:border-[#8D49A6]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Branş / Alan
                        </label>
                        <input
                          type="text"
                          value={onboardingBranch}
                          onChange={(e) => setOnboardingBranch(e.target.value)}
                          placeholder="Türk Dili ve Edebiyatı"
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-[#8D49A6] dark:text-[#D914C8] outline-hidden focus:border-[#8D49A6]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        MEB Sicil / Sertifika No
                      </label>
                      <input
                        type="text"
                        value={onboardingSicilNo}
                        onChange={(e) => setOnboardingSicilNo(e.target.value)}
                        placeholder="MEB-34019284"
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-mono font-bold text-gray-900 dark:text-white outline-hidden focus:border-[#8D49A6]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Maaş Bankası
                        </label>
                        <input
                          type="text"
                          value={onboardingBankName}
                          onChange={(e) => setOnboardingBankName(e.target.value)}
                          placeholder="Vakıfbank"
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white outline-hidden focus:border-[#8D49A6]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          IBAN Numarası
                        </label>
                        <input
                          type="text"
                          value={onboardingIban}
                          onChange={(e) => setOnboardingIban(e.target.value)}
                          placeholder="TR..."
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-mono font-bold text-blue-600 dark:text-blue-400 outline-hidden focus:border-[#8D49A6]"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setOnboardingStep(3)}
                        className="w-full h-11 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        <span>Sonraki: Zorunlu Belgeleri Yükle</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── ADIM 3: RESMİ BELGELERİN YÜKLENMESİ ── */}
                {onboardingStep === 3 && (
                  <div className="space-y-3.5">
                    <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/50 dark:border-purple-800/40 text-xs text-[#4B075F] dark:text-purple-200">
                      Milli Eğitim Bakanlığı mevzuatı gereği kurumumuza ibraz edilmesi gereken resmi evrakları lütfen yükleyiniz. (PDF / JPG formatında)
                    </div>

                    {/* Belge 1: Lisans / Mezuniyet Diploması */}
                    <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-700/80 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                          uploadedDocs.diploma
                            ? 'bg-brand-gradient text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
                        }`}>
                          {uploadedDocs.diploma ? <CheckCircle2 size={20} /> : <FileText size={20} />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-gray-900 dark:text-white truncate">
                            1. Lisans / Mezuniyet Diploması
                          </div>
                          <div className="text-[10.5px] text-gray-500 dark:text-gray-400">
                            {uploadedDocs.diploma ? 'Yüklendi (2.4 MB · MEB Onaylı)' : 'Zorunlu Belge (PDF/Görsel)'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSimulateUpload('diploma')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 active:scale-95 transition-all cursor-pointer ${
                          uploadedDocs.diploma
                            ? 'bg-[#4B075F]/10 dark:bg-[#4B075F]/30 text-[#8D49A6] dark:text-[#D914C8] border border-purple-300/40'
                            : 'bg-brand-gradient text-white hover:opacity-90 shadow-xs'
                        }`}
                      >
                        {uploadedDocs.diploma ? 'Değiştir' : 'Belge Yükle'}
                      </button>
                    </div>

                    {/* Belge 2: e-Devlet Adli Sicil Kaydı */}
                    <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-700/80 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                          uploadedDocs.sicil
                            ? 'bg-brand-gradient text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
                        }`}>
                          {uploadedDocs.sicil ? <CheckCircle2 size={20} /> : <ShieldCheck size={20} />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-gray-900 dark:text-white truncate">
                            2. e-Devlet Adli Sicil Belgesi
                          </div>
                          <div className="text-[10.5px] text-gray-500 dark:text-gray-400">
                            {uploadedDocs.sicil ? 'Yüklendi (1.1 MB · Barkodlu Doğrulandı)' : 'Zorunlu Belge (Barkodlu PDF)'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSimulateUpload('sicil')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 active:scale-95 transition-all cursor-pointer ${
                          uploadedDocs.sicil
                            ? 'bg-[#4B075F]/10 dark:bg-[#4B075F]/30 text-[#8D49A6] dark:text-[#D914C8] border border-purple-300/40'
                            : 'bg-brand-gradient text-white hover:opacity-90 shadow-xs'
                        }`}
                      >
                        {uploadedDocs.sicil ? 'Değiştir' : 'Belge Yükle'}
                      </button>
                    </div>

                    {/* Belge 3: Sağlık Kurulu Raporu */}
                    <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-700/80 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                          uploadedDocs.saglik
                            ? 'bg-brand-gradient text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
                        }`}>
                          {uploadedDocs.saglik ? <CheckCircle2 size={20} /> : <FileCheck size={20} />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-gray-900 dark:text-white truncate">
                            3. Sağlık Kurulu Raporu
                          </div>
                          <div className="text-[10.5px] text-gray-500 dark:text-gray-400">
                            {uploadedDocs.saglik ? 'Yüklendi (1.8 MB · Sağlık Raporu)' : 'Öğretmenlik Görevine Uygunluk'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSimulateUpload('saglik')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 active:scale-95 transition-all cursor-pointer ${
                          uploadedDocs.saglik
                            ? 'bg-[#4B075F]/10 dark:bg-[#4B075F]/30 text-[#8D49A6] dark:text-[#D914C8] border border-purple-300/40'
                            : 'bg-brand-gradient text-white hover:opacity-90 shadow-xs'
                        }`}
                      >
                        {uploadedDocs.saglik ? 'Değiştir' : 'Belge Yükle'}
                      </button>
                    </div>

                    {/* Belge 4: İkametgah / Yerleşim Yeri Belgesi */}
                    <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-700/80 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                          uploadedDocs.ikametgah
                            ? 'bg-brand-gradient text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
                        }`}>
                          {uploadedDocs.ikametgah ? <CheckCircle2 size={20} /> : <FileText size={20} />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-gray-900 dark:text-white truncate">
                            4. İkametgah / Yerleşim Yeri Belgesi
                          </div>
                          <div className="text-[10.5px] text-gray-500 dark:text-gray-400">
                            {uploadedDocs.ikametgah ? 'Yüklendi (0.9 MB · e-Devlet)' : 'e-Devlet Barkodlu İkametgah'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSimulateUpload('ikametgah')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 active:scale-95 transition-all cursor-pointer ${
                          uploadedDocs.ikametgah
                            ? 'bg-[#4B075F]/10 dark:bg-[#4B075F]/30 text-[#8D49A6] dark:text-[#D914C8] border border-purple-300/40'
                            : 'bg-brand-gradient text-white hover:opacity-90 shadow-xs'
                        }`}
                      >
                        {uploadedDocs.ikametgah ? 'Değiştir' : 'Belge Yükle'}
                      </button>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setOnboardingStep(4)}
                        className="w-full h-11 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        <span>Sonraki: Kalıcı Şifre & Onay</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── ADIM 4: GÜVENLİK, ŞİFRE & ONAY ── */}
                {onboardingStep === 4 && (
                  <div className="space-y-3.5">
                    <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/50 dark:border-purple-800/40 text-xs text-[#4B075F] dark:text-purple-200">
                      İlk girişinizde okul idaresi tarafından size tanımlanan geçici şifrenin yerine kalıcı ve güvenli şifrenizi belirleyiniz.
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Yeni Kalıcı Şifre (En az 6 karakter)
                      </label>
                      <input
                        type="password"
                        value={onboardingNewPass}
                        onChange={(e) => setOnboardingNewPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white outline-hidden focus:border-[#8D49A6]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Yeni Kalıcı Şifre (Tekrar)
                      </label>
                      <input
                        type="password"
                        value={onboardingNewPassConfirm}
                        onChange={(e) => setOnboardingNewPassConfirm(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white outline-hidden focus:border-[#8D49A6]"
                      />
                    </div>

                    {/* KVKK & Taahhütname */}
                    <div className="pt-2">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={onboardingKvkkAccepted}
                          onChange={(e) => setOnboardingKvkkAccepted(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded-md text-[#8D49A6] accent-[#8D49A6] cursor-pointer"
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-300 leading-snug">
                          <span className="font-bold">KVKK ve Kurumsal Aydınlatma Metni</span>'ni okudum. Yüklediğim belgelerin ve beyan ettiğim bilgilerin doğruluğunu, Oxonom Okulları bünyesinde öğretmenlik yetkisiyle kullanacağımı taahhüt ederim.
                        </span>
                      </label>
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                      <button
                        type="submit"
                        className="w-full h-12 rounded-2xl bg-brand-gradient hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all cursor-pointer"
                      >
                        <CheckCircle2 size={18} />
                        <span>Profili ve Belgeleri Tamamla & Onayla</span>
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )

  if (hideHeader) {
    return pageContent
  }

  return (
    <div className={`${theme} min-h-[100dvh] w-full bg-[#0A0D15] sm:bg-[#E2E8F0] sm:dark:bg-[#06090F] flex justify-center selection:bg-[#8D49A6]/30 selection:text-white transition-colors duration-300 font-jakarta overscroll-none`}>
      {/* ── 390px MOBILE APP FIRST FRAME CONTAINER ── */}
      <div
        className="w-full sm:max-w-[390px] min-h-[100dvh] bg-[#F8FAFC] dark:bg-[#0A0D15] sm:shadow-2xl relative flex flex-col pb-20 sm:border-x border-gray-200/60 dark:border-gray-800/80 overflow-x-hidden overscroll-y-none"
      >
        <MobileHeader theme={theme} onToggleTheme={toggleTheme} />
        {pageContent}
        {!hideDock && <MobileFloatingDock activeTab="home" />}
      </div>
    </div>
  )
}
