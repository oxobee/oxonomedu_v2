'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  GraduationCap,
  Clock,
  MapPin,
  BookOpen,
  FileText,
  Download,
  CheckCircle2,
  Circle,
  Video,
  User,
  Calendar,
  Sparkles,
  Upload,
  Plus,
  Trash2,
  Award,
  ExternalLink,
  Layers,
  HelpCircle,
  Check,
  Bookmark,
  Share2,
  FileCheck,
  Send,
  RefreshCw,
  Trophy,
  BarChart3,
  AlertCircle,
  X,
  ChevronRight,
  Play,
  PenTool,
  MessageSquare,
  Compass,
  CheckSquare,
  SlidersHorizontal,
  BookmarkCheck,
} from 'lucide-react'
import {
  STUDENT_COURSES,
  getSynchronizedStudentCourses,
  getSynchronizedStudentAssessments,
  getSynchronizedStudentProfile,
  type StudentCourse,
  type StudentAssessment,
  type StudentProfile,
} from '@/lib/student/studentData'
import { MEB_TEXTBOOKS_CATALOG, type MebBookItem } from '@/lib/student/mebBooksData'
import {
  getStoredStudentNotes,
  saveBookNoteToDefterim,
  deleteBookNoteFromDefterim,
} from '@/lib/student/studentLibraryStorage'
import MobileBookReader from '@/components/Student/library/MobileBookReader'
import toast from 'react-hot-toast'

interface StudentCourseDetailViewProps {
  courseId: string
}

interface CustomCourseMaterial {
  id: string
  title: string
  type: 'pdf' | 'doc' | 'video'
  size: string
  target?: string
  dateAdded?: string
  description?: string
  category?: string
}

interface CourseUnitDef {
  id: string
  unitNumber: number
  title: string
  description: string
  learningPill: string
  topicIds: string[]
  suggestedBookPage?: number
}

// Dedicated Pedagogical Units for Turkish Course (1. Sınıf Türkçe)
const TURKCE_UNITS: CourseUnitDef[] = [
  {
    id: 'turkce-u1',
    unitNumber: 1,
    title: '1. Ünite: Sesler Dünyası ve Çizgi Yolculuğu',
    description: 'İlk okuma yazmaya hazırlık, doğru kalem tutuşu, el-göz koordinasyonu ve 1. ses grubu (A - N - E - T).',
    learningPill: 'MEB Kazanım: T.1.1 (Dinleme & Ses Bilgisi)',
    topicIds: ['t1', 't2', 't3'],
    suggestedBookPage: 12,
  },
  {
    id: 'turkce-u2',
    unitNumber: 2,
    title: '2. Ünite: Hece ve Kelime Fabrikası',
    description: 'Seslerden heceler, hecelerden anlamlı sözcükler üretme, açık-kapalı hece mantığı ve görsel kartlar.',
    learningPill: 'MEB Kazanım: T.1.2 (Heceleme & Söz Varlığı)',
    topicIds: ['t4'],
    suggestedBookPage: 48,
  },
  {
    id: 'turkce-u3',
    unitNumber: 3,
    title: '3. Ünite: Cümle Bilgisi ve İmla Kuralları',
    description: 'Anlamlı ve kurallı cümle kurma, büyük harfle başlama kuralı ve nokta (.) işareti kullanımı.',
    learningPill: 'MEB Kazanım: T.1.3 (Yazma & Noktalama)',
    topicIds: ['t5'],
    suggestedBookPage: 76,
  },
  {
    id: 'turkce-u4',
    unitNumber: 4,
    title: '4. Ünite: Anlama, Görsel Okuma ve Masallar',
    description: 'Görselleri yorumlama, dinlediği masalı anlatma, serbest okuma metinleri ve sözcük dağarcığı geliştirme.',
    learningPill: 'MEB Kazanım: T.1.4 (Görsel Okuma & Yorumlama)',
    topicIds: ['t6'],
    suggestedBookPage: 110,
  },
]

// 4 Core Competency Pillars for Turkish Language
const TURKCE_PILLARS = [
  {
    id: 'reading',
    title: 'Okuma & Anlama',
    desc: 'Ses tanıma, heceleme, ritmik okuma ve metin anlama',
    icon: BookOpen,
    badge: '312 MEB Kitabı Entegre',
  },
  {
    id: 'writing',
    title: 'Yazma & Dil Bilgisi',
    desc: 'Çizgi çalışmaları, harf yönleri, büyük harf ve nokta',
    icon: PenTool,
    badge: 'Yazı Defteri & Föyler',
  },
  {
    id: 'speaking',
    title: 'Dinleme & Konuşma',
    desc: 'Masal dinletileri, görsel yorumlama ve kendini ifade etme',
    icon: MessageSquare,
    badge: 'Etkileşimli İçerikler',
  },
  {
    id: 'assessment',
    title: 'Kazanım Değerlendirme',
    desc: 'Haftalık MEB zümre soru kalıpları ve deneme testleri',
    icon: Award,
    badge: 'Anında Geri Bildirim',
  },
]

export default function StudentCourseDetailView({ courseId }: StudentCourseDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'topics' | 'materials' | 'assessments' | 'books' | 'quizzes' | 'notes'>('topics')
  const [courses, setCourses] = useState<StudentCourse[]>(STUDENT_COURSES)
  const [assessments, setAssessments] = useState<StudentAssessment[]>([])
  const [profile, setProfile] = useState<StudentProfile>(getSynchronizedStudentProfile())

  // Unit filter for topics view
  const [selectedUnitId, setSelectedUnitId] = useState<string>('all')

  // Reader state for MEB textbooks
  const [readingBook, setReadingBook] = useState<MebBookItem | null>(null)
  const [readerInitialPage, setReaderInitialPage] = useState<number | undefined>(undefined)

  // Teacher hidden books filter
  const [teacherHiddenBookIds, setTeacherHiddenBookIds] = useState<number[]>([])
  const [principalHiddenBookIds, setPrincipalHiddenBookIds] = useState<number[]>([])

  // Course materials (including teacher-added custom ones)
  const [courseMaterials, setCourseMaterials] = useState<CustomCourseMaterial[]>([])
  const [materialFilter, setMaterialFilter] = useState<'all' | 'pdf' | 'doc' | 'video'>('all')

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Course notes from Defterim (including book notes taken in textbooks)
  const [courseNotes, setCourseNotes] = useState<any[]>([])
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newNoteContent, setNewNoteContent] = useState('')
  const [showNoteForm, setShowNoteForm] = useState(false)

  // Synchronized Topic Progress State
  const [completedTopicIds, setCompletedTopicIds] = useState<string[]>([])
  const [activeTopicId, setActiveTopicId] = useState<string>('')
  const [customCourseTopics, setCustomCourseTopics] = useState<any[]>([])

  // Interactive Quiz State
  const [quizSubTab, setQuizSubTab] = useState<'current' | 'history'>('current')
  const [selectedTopicForQuiz, setSelectedTopicForQuiz] = useState<any>(null)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [pastQuizzes, setPastQuizzes] = useState<any[]>([])
  const [lastQuizStats, setLastQuizStats] = useState<{
    total: number
    correct: number
    wrong: number
    unanswered: number
    percentage: number
    topicTitle: string
    date: string
  } | null>(null)

  const syncAll = () => {
    const prof = getSynchronizedStudentProfile()
    setProfile(prof)
    const crss = getSynchronizedStudentCourses()
    setCourses(crss)
    setAssessments(getSynchronizedStudentAssessments())

    // Hidden books
    try {
      const tRaw = localStorage.getItem('oxonom_teacher_hidden_books')
      if (tRaw) setTeacherHiddenBookIds(JSON.parse(tRaw))
      const pRaw = localStorage.getItem('oxonom_principal_hidden_book_ids')
      if (pRaw) setPrincipalHiddenBookIds(JSON.parse(pRaw))
    } catch (_) {}

    // Course materials
    try {
      const crs = crss.find((c) => c.id === courseId) || crss[0]
      const rawMat = localStorage.getItem(`oxonom_course_materials_${crs.id}`)
      if (rawMat) {
        setCourseMaterials(JSON.parse(rawMat))
      } else {
        setCourseMaterials(crs.materials || [])
      }
    } catch (_) {}

    // Topic progress synchronization
    try {
      const rawProgress = localStorage.getItem(`oxonom_course_progress_${courseId}`)
      if (rawProgress) {
        const parsed = JSON.parse(rawProgress)
        if (Array.isArray(parsed.completedTopicIds)) setCompletedTopicIds(parsed.completedTopicIds)
        if (parsed.activeTopicId) setActiveTopicId(parsed.activeTopicId)
      } else {
        const crs = crss.find((c) => c.id === courseId) || crss[0]
        const defCompleted = crs.topics.filter((t) => t.completed).map((t) => t.id)
        const defActive = crs.topics.find((t) => !t.completed)?.id || crs.topics[0]?.id || ''
        setCompletedTopicIds(defCompleted)
        setActiveTopicId(defActive)
      }

      const rawCustom = localStorage.getItem('oxonom_course_custom_topics')
      if (rawCustom) {
        const customMap = JSON.parse(rawCustom)
        setCustomCourseTopics(customMap[courseId] || [])
      }

      const rawPast = localStorage.getItem(`oxonom_past_quizzes_${courseId}`)
      if (rawPast) {
        setPastQuizzes(JSON.parse(rawPast))
      }
    } catch (_) {}

    // Synchronize Defterim notes matching course
    try {
      const allNotes = getStoredStudentNotes()
      const crs = crss.find((c) => c.id === courseId) || crss[0]
      const filteredNotes = allNotes.filter(
        (n: any) =>
          (n.course && (n.course.toLowerCase().includes(crs.name.toLowerCase()) || crs.name.toLowerCase().includes(n.course.toLowerCase()))) ||
          (n.bookTitle && n.bookTitle.toLowerCase().includes(crs.name.toLowerCase()))
      )
      setCourseNotes(filteredNotes)
    } catch (_) {}
  }

  useEffect(() => {
    syncAll()

    window.addEventListener('oxonom_student_updated', syncAll)
    window.addEventListener('oxonom_teacher_profile_updated', syncAll)
    window.addEventListener('oxonom_student_notes_updated', syncAll)
    window.addEventListener('oxonom_teacher_hidden_books_updated', syncAll)
    window.addEventListener('oxonom_course_progress_updated', syncAll)
    window.addEventListener('storage', syncAll)

    return () => {
      window.removeEventListener('oxonom_student_updated', syncAll)
      window.removeEventListener('oxonom_teacher_profile_updated', syncAll)
      window.removeEventListener('oxonom_student_notes_updated', syncAll)
      window.removeEventListener('oxonom_teacher_hidden_books_updated', syncAll)
      window.removeEventListener('oxonom_course_progress_updated', syncAll)
      window.removeEventListener('storage', syncAll)
    }
  }, [courseId])

  const course = courses.find((c) => c.id === courseId) || courses[0] || STUDENT_COURSES[0]
  const isTurkceCourse = course.id === 'turkce' || course.name.toLowerCase().includes('türkçe')

  const courseExams = assessments.filter(
    (a) =>
      a.courseName.toLowerCase().includes(course.name.toLowerCase()) ||
      course.name.toLowerCase().includes(a.courseName.toLowerCase())
  )

  // Filter MEB Textbooks for this course (Grade 1 default or student's grade level)
  const studentGradeNum = parseInt((profile.gradeLevel || '1').charAt(0)) || 1
  const hiddenIdsSet = new Set([...teacherHiddenBookIds, ...principalHiddenBookIds])

  const visibleBooks = MEB_TEXTBOOKS_CATALOG.filter((book) => {
    if (hiddenIdsSet.has(book.id)) return false
    if (book.gradeLevel !== studentGradeNum) return false

    const normCourse = course.name.toLowerCase()
    const normSubj = book.subject.toLowerCase()
    const normTitle = book.title.toLowerCase()

    if (normCourse.includes('türkçe') && (normSubj.includes('türkçe') || normTitle.includes('türkçe') || normTitle.includes('okuma'))) return true
    if (normCourse.includes('matematik') && (normSubj.includes('matematik') || normTitle.includes('matematik'))) return true
    if (normCourse.includes('hayat bilgisi') && (normSubj.includes('hayat bilgisi') || normTitle.includes('hayat bilgisi'))) return true
    if (normCourse.includes('beden') && (normSubj.includes('beden') || normTitle.includes('beden') || normTitle.includes('oyun'))) return true
    if (normCourse.includes('görsel') && (normSubj.includes('görsel') || normTitle.includes('görsel'))) return true
    if (normCourse.includes('müzik') && (normSubj.includes('müzik') || normTitle.includes('müzik'))) return true
    if (normCourse.includes('ingilizce') && (normSubj.includes('ingilizce') || normTitle.includes('ingilizce'))) return true
    if (normCourse.includes('serbest') && (normTitle.includes('oyun') || normTitle.includes('etkinlik'))) return true
    return false
  })

  // Topics list combining standard and teacher-added custom topics
  const allCourseTopics = useMemo(() => {
    const base = course.topics || []
    const custom = (customCourseTopics || []).map((ct: any, idx: number) => ({
      id: ct.id,
      title: ct.title,
      completed: ct.completed || false,
      week: ct.week || (base.length + idx + 1),
    }))
    return [...base, ...custom]
  }, [course.topics, customCourseTopics])

  // Effective Active Topic
  const effectiveActiveTopic = useMemo(() => {
    if (selectedTopicForQuiz) return selectedTopicForQuiz
    if (activeTopicId) {
      const found = allCourseTopics.find((t) => t.id === activeTopicId)
      if (found) return found
    }
    const firstUnfinished = allCourseTopics.find((t) => !completedTopicIds.includes(t.id))
    return firstUnfinished || allCourseTopics[0] || { id: 'top-1', title: 'Temel Ders Kazanımları', week: 1 }
  }, [selectedTopicForQuiz, activeTopicId, allCourseTopics, completedTopicIds])

  // Topics progress calculation
  const completedTopicsCount = allCourseTopics.filter((t) => completedTopicIds.includes(t.id)).length
  const totalTopicsCount = allCourseTopics.length
  const progressPercent = totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0

  // Defined Units
  const definedUnits: CourseUnitDef[] = useMemo(() => {
    if (isTurkceCourse) {
      return TURKCE_UNITS
    }

    // Generic grouping for other courses
    const chunkSize = 2
    const generated: CourseUnitDef[] = []
    for (let i = 0; i < allCourseTopics.length; i += chunkSize) {
      const uNum = Math.floor(i / chunkSize) + 1
      const slice = allCourseTopics.slice(i, i + chunkSize)
      generated.push({
        id: `gen-unit-${uNum}`,
        unitNumber: uNum,
        title: `${uNum}. Ünite: ${slice[0]?.title || 'Ders Kazanımları'}`,
        description: `${course.name} müfredatı ${uNum}. ünite konu ve kazanımları.`,
        learningPill: `Kazanım Grubu ${uNum}`,
        topicIds: slice.map((t) => t.id),
        suggestedBookPage: uNum * 25,
      })
    }
    return generated
  }, [isTurkceCourse, allCourseTopics, course.name])

  // Filtered Units based on selectedUnitId
  const displayedUnits = useMemo(() => {
    if (selectedUnitId === 'all') return definedUnits
    return definedUnits.filter((u) => u.id === selectedUnitId)
  }, [definedUnits, selectedUnitId])

  // File Download Handler
  const handleDownload = (materialTitle: string) => {
    toast.success(`"${materialTitle}" başarıyla indiriliyor...`)
  }

  // Handle Drag & Drop / File Upload
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    const ext = file.name.split('.').pop()?.toLowerCase()
    const type: 'pdf' | 'doc' | 'video' =
      ext === 'mp4' || ext === 'mov' ? 'video' : ext === 'pdf' ? 'pdf' : 'doc'
    const size = `${(file.size / (1024 * 1024)).toFixed(1)} MB`

    const newMaterial: CustomCourseMaterial = {
      id: `mat-${Date.now()}`,
      title: file.name,
      type,
      size,
      dateAdded: new Date().toLocaleDateString('tr-TR'),
      description: 'Öğrenci tarafından yüklenen çalışma dosyası',
    }

    const updated = [newMaterial, ...courseMaterials]
    setCourseMaterials(updated)
    try {
      localStorage.setItem(`oxonom_course_materials_${course.id}`, JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('oxonom_student_updated'))
      toast.success(`"${file.name}" başarıyla yüklendi!`)
    } catch (_) {}
  }

  // Handle Note Creation for this course
  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      toast.error('Lütfen not başlığı ve içeriği girin.')
      return
    }

    try {
      const allNotes = getStoredStudentNotes()
      const now = new Date()
      const dateStr = `${now.getDate()} ${now.toLocaleString('tr-TR', { month: 'long' })} ${now.getFullYear()}`

      const newNote = {
        id: `note-${Date.now()}`,
        title: newNoteTitle.trim(),
        course: course.name,
        date: dateStr,
        content: newNoteContent.trim(),
      }

      const updated = [newNote, ...allNotes]
      localStorage.setItem('oxonom_student_notes_ercil', JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('oxonom_student_notes_updated', { detail: updated }))
      toast.success('Ders notunuz Defterim klasörüne kaydedildi!')
      setNewNoteTitle('')
      setNewNoteContent('')
      setShowNoteForm(false)
      syncAll()
    } catch (_) {}
  }

  // Handle Note Delete
  const handleDeleteNote = (noteId: string) => {
    deleteBookNoteFromDefterim(noteId)
    toast.success('Not silindi.')
    syncAll()
  }

  // Open book at specific page
  const handleOpenBookAtPage = (bookId: number, pageNumber?: number) => {
    const foundBook = MEB_TEXTBOOKS_CATALOG.find((b) => b.id === bookId)
    if (foundBook) {
      setReaderInitialPage(pageNumber || 1)
      setReadingBook(foundBook)
    } else if (visibleBooks.length > 0) {
      setReaderInitialPage(pageNumber || 1)
      setReadingBook(visibleBooks[0])
    } else {
      toast.error('Kitap bulunamadı.')
    }
  }

  // Open First Available Book
  const handleOpenMainBook = (suggestedPage?: number) => {
    if (visibleBooks.length > 0) {
      setReaderInitialPage(suggestedPage || 1)
      setReadingBook(visibleBooks[0])
    } else {
      setActiveTab('books')
    }
  }

  // Multi-type dynamic question generator based on active topic & MEB curriculum
  const currentQuizQuestions = useMemo(() => {
    const topicTitle = effectiveActiveTopic.title || 'Temel Kazanım'
    const norm = course.name.toLowerCase()

    if (norm.includes('türkçe') || norm.includes('okuma')) {
      return [
        {
          id: 'q1',
          type: 'single' as const,
          typeLabel: 'Çoktan Seçmeli',
          question: `"${topicTitle}" konusunda harfleri ve sesleri öğrenirken aşağıdakilerden hangisine en çok dikkat etmeliyiz?`,
          options: [
            { key: 'A', text: 'Harfin ağzımızdan çıkış sesine ve doğru yazılış yönüne' },
            { key: 'B', text: 'Sadece sayfayı olabildiğince acele bitirmeye' },
            { key: 'C', text: 'Satır çizgilerini dikkate almadan yazmaya' },
            { key: 'D', text: 'Kitabın örnek görsellerine hiç bakmamaya' },
          ],
          correct: 'A',
          explanation: '1. Sınıf Türkçe müfredatında sesin doğru kavranması ve satır çizgilerine uygun yazım esastır.',
        },
        {
          id: 'q2',
          type: 'true_false' as const,
          typeLabel: 'Doğru / Yanlış',
          question: `"${topicTitle}" konusunda öğrendiğimiz heceleri birleştirerek yeni ve anlamlı kelimeler oluşturabiliriz.`,
          options: [
            { key: 'D', text: 'Doğru' },
            { key: 'Y', text: 'Yanlış' },
          ],
          correct: 'D',
          explanation: 'Seslerden heceler, hecelerden anlamlı sözcükler türetilir.',
        },
        {
          id: 'q3',
          type: 'fill_in' as const,
          typeLabel: 'Kavram Doldurma',
          question: `Bir cümlenin ilk harfi her zaman ________ harfle başlar ve sonuna nokta konur.`,
          options: [
            { key: 'A', text: 'Büyük' },
            { key: 'B', text: 'Küçük' },
            { key: 'C', text: 'Noktalı' },
          ],
          correct: 'A',
          explanation: 'Türkçede tüm cümleler büyük harfle başlar.',
        },
        {
          id: 'q4',
          type: 'concept' as const,
          typeLabel: 'Kavram Analizi',
          question: `Aşağıdaki kelimelerden hangisi "${topicTitle}" çalışmalarında 2 heceli olarak okunur?`,
          options: [
            { key: 'A', text: 'O-kul (2 Hece)' },
            { key: 'B', text: 'Ka-lem-lik (3 Hece)' },
            { key: 'C', text: 'Sil-gi-ler-den (4 Hece)' },
            { key: 'D', text: 'Kü-tüp-ha-ne (4 Hece)' },
          ],
          correct: 'A',
          explanation: 'O-kul sözcüğü iki ses grubundan oluşur.',
        },
      ]
    }

    if (norm.includes('matematik')) {
      return [
        {
          id: 'q1',
          type: 'single' as const,
          typeLabel: 'Çoktan Seçmeli',
          question: `"${topicTitle}" kapsamında 1'den 10'a kadar birer ritmik sayarken 4'ten sonra hangi sayı gelir?`,
          options: [
            { key: 'A', text: '5' },
            { key: 'B', text: '3' },
            { key: 'C', text: '6' },
            { key: 'D', text: '2' },
          ],
          correct: 'A',
          explanation: 'İleriye doğru birer ritmik saymada: 1, 2, 3, 4, 5 gelir.',
        },
        {
          id: 'q2',
          type: 'true_false' as const,
          typeLabel: 'Doğru / Yanlış',
          question: `Toplama işleminde 0 (sıfır) sayısı etkisiz elemandır ve sayının değerini değiştirmez.`,
          options: [
            { key: 'D', text: 'Doğru' },
            { key: 'Y', text: 'Yanlış' },
          ],
          correct: 'D',
          explanation: 'Örneğin 5 + 0 = 5 olur.',
        },
        {
          id: 'q3',
          type: 'fill_in' as const,
          typeLabel: 'İşlem Tamamlama',
          question: `Elimizde 3 elma vardı, öğretmenimiz 2 elma daha verdi. Toplamda ________ elmamız olur. (3 + 2 = ?)`,
          options: [
            { key: 'A', text: '5 elma' },
            { key: 'B', text: '4 elma' },
            { key: 'C', text: '6 elma' },
          ],
          correct: 'A',
          explanation: '3 + 2 = 5 eder.',
        },
        {
          id: 'q4',
          type: 'concept' as const,
          typeLabel: 'Geometrik Kavram',
          question: `Köşesi ve kenarı olmayan, madeni para veya tabak gibi yuvarlak olan şekil hangisidir?`,
          options: [
            { key: 'A', text: 'Çember / Daire' },
            { key: 'B', text: 'Kare' },
            { key: 'C', text: 'Üçgen' },
            { key: 'D', text: 'Dikdörtgen' },
          ],
          correct: 'A',
          explanation: 'Daire yuvarlak olup köşesi bulunmaz.',
        },
      ]
    }

    return [
      {
        id: 'q1',
        type: 'single' as const,
        typeLabel: 'Çoktan Seçmeli',
        question: `"${topicTitle}" konusunda öğrendiklerimizi günlük hayatımızda nasıl uygularız?`,
        options: [
          { key: 'A', text: 'Öğrendiğimiz kurallara uyarak ve düzenli pratik yaparak' },
          { key: 'B', text: 'Konuyu hemen unutup tekrar etmeyerek' },
          { key: 'C', text: 'Sadece sınav günü hatırlamaya çalışarak' },
          { key: 'D', text: 'Ders kitaplarını hiç açmayarak' },
        ],
        correct: 'A',
        explanation: 'Düzenli tekrar ve uygulama bilginin kalıcılığını sağlar.',
      },
    ]
  }, [effectiveActiveTopic, course.name])

  // Handle Complete Quiz
  const handleCompleteQuiz = () => {
    let total = currentQuizQuestions.length
    let correct = 0
    let wrong = 0
    let unanswered = 0

    currentQuizQuestions.forEach((q) => {
      const userAns = quizAnswers[q.id]
      if (!userAns) {
        unanswered++
      } else if (userAns === q.correct) {
        correct++
      } else {
        wrong++
      }
    })

    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0
    const now = new Date()
    const dateStr = `${now.getDate()} ${now.toLocaleString('tr-TR', { month: 'long' })} ${now.getFullYear()}, ${now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`

    const statsObj = {
      id: `quiz-run-${Date.now()}`,
      date: dateStr,
      topicId: effectiveActiveTopic.id,
      topicTitle: effectiveActiveTopic.title,
      week: effectiveActiveTopic.week || 1,
      total,
      correct,
      wrong,
      unanswered,
      percentage,
    }

    setLastQuizStats(statsObj)
    setQuizSubmitted(true)
    setShowResultModal(true)

    const updatedPast = [statsObj, ...pastQuizzes]
    setPastQuizzes(updatedPast)
    try {
      localStorage.setItem(`oxonom_past_quizzes_${courseId}`, JSON.stringify(updatedPast))
    } catch (_) {}

    toast.success(`Test tamamlandı! Başarı Oranınız: %${percentage}`)
  }

  const filteredMaterials = courseMaterials.filter((m) => {
    if (materialFilter === 'all') return true
    return m.type === materialFilter
  })

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6 font-jakarta">
      {/* ── TOP BACK NAVIGATION ── */}
      <Link
        href="/student/courses"
        className="inline-flex items-center gap-2 text-xs font-bold text-[#514458] hover:text-[#4B075F] dark:text-[#D2C5D8] dark:hover:text-[#F17AE6] transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Tüm Derslerime Geri Dön</span>
      </Link>

      {/* ── BRAND THEMED COURSE HERO BANNER ── */}
      <div className="p-6 lg:p-8 rounded-[30px] bg-white dark:bg-[#1A1122] border border-[#E8DFEB] dark:border-[#3A2845] shadow-sm space-y-5 relative overflow-hidden">
        {/* Subtle decorative ambient radial glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#8D49A6]/15 via-[#D914C8]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 relative z-10">
          <div className="space-y-3 max-w-2xl">
            {/* Badges strip */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black px-2.5 py-1 rounded-xl bg-[#FCE8FA] dark:bg-[#350444] text-[#8D49A6] dark:text-[#F17AE6] border border-[#D914C8]/30">
                {course.code}
              </span>
              <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-xl bg-[#F0D8FA] dark:bg-[#2D1B36] text-[#4B075F] dark:text-[#D2C5D8] border border-[#8D49A6]/30">
                {profile.schoolName || 'Oxonom Okulları'}
              </span>
              <span className="text-[11px] font-bold text-[#716779] dark:text-[#B5A5BD] flex items-center gap-1">
                <span>{profile.className} Şubesi</span>
                <span>•</span>
                <span>{profile.gradeLevel}</span>
              </span>
            </div>

            {/* Course Title */}
            <h1 className="text-2xl lg:text-3xl font-black text-[#241329] dark:text-white tracking-tight flex items-center gap-3">
              <span>{course.name}</span>
              {isTurkceCourse && (
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-brand-gradient text-white shadow-xs">
                  MEB Maarif Modeli
                </span>
              )}
            </h1>

            {/* Course Description */}
            <p className="text-xs lg:text-sm text-[#514458] dark:text-[#D2C5D8] leading-relaxed font-medium">
              {course.description}
            </p>

            {/* Progress Bar */}
            <div className="pt-1 max-w-md space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-[#716779] dark:text-[#B5A5BD]">Dönem Kazanım İlerlemesi</span>
                <span className="text-[#8D49A6] dark:text-[#F17AE6] font-black">
                  %{progressPercent} ({completedTopicsCount}/{totalTopicsCount} Konu)
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[#F7F0FA] dark:bg-[#251830] overflow-hidden border border-[#E8DFEB] dark:border-[#3A2845]">
                <div
                  className="h-full rounded-full bg-brand-gradient transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenMainBook()}
                className="px-3.5 py-1.5 rounded-xl bg-brand-gradient hover:opacity-95 text-white text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen size={14} />
                <span>Ders Kitabını Aç (Flipbook)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('quizzes')
                  setQuizSubTab('current')
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#F7F0FA] hover:bg-[#F0D8FA] dark:bg-[#251830] dark:hover:bg-[#350444] text-[#4B075F] dark:text-[#F17AE6] text-xs font-bold transition-all border border-[#E8DFEB] dark:border-[#49364F] flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={14} />
                <span>Kazanım Testi Çöz</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('notes')
                  setShowNoteForm(true)
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#FCF9FD] dark:bg-[#1F1429] hover:bg-[#F7F0FA] text-[#514458] dark:text-[#D2C5D8] text-xs font-bold transition-all border border-[#E8DFEB] dark:border-[#3A2845] flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span>Not Ekle</span>
              </button>
            </div>
          </div>

          {/* Teacher & Schedule Card */}
          <div className="p-4.5 rounded-2xl bg-[#FCF9FD] dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#3A2845] space-y-3 shrink-0 min-w-[240px]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-gradient text-white font-black text-base flex items-center justify-center shrink-0 shadow-sm">
                {course.teacherName.slice(0, 1)}
              </div>
              <div>
                <div className="text-xs font-black text-[#241329] dark:text-white">
                  {course.teacherName}
                </div>
                <div className="text-[10px] text-[#716779] dark:text-[#B5A5BD] font-semibold">{course.teacherBranch}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E8DFEB] dark:border-[#3A2845] space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2 text-[#514458] dark:text-[#D2C5D8]">
                <Clock size={13} className="text-[#8D49A6] dark:text-[#F17AE6] shrink-0" />
                <span className="font-bold">Haftada {course.weeklyHours} Ders Saati</span>
              </div>
              <div className="flex items-center gap-2 text-[#514458] dark:text-[#D2C5D8]">
                <MapPin size={13} className="text-[#4B075F] dark:text-[#D2C5D8] shrink-0" />
                <span>{course.roomType}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4 MINIMAL & ICON-DRIVEN CATEGORIZED DASHBOARD CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-[#E8DFEB] dark:border-[#2D1B36]">
          {/* Card 1: Üniteler */}
          <button
            type="button"
            onClick={() => setActiveTab('topics')}
            className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
              activeTab === 'topics'
                ? 'bg-gradient-to-br from-[#8D49A6]/10 to-[#D914C8]/10 border-[#8D49A6] dark:border-[#F17AE6] shadow-md ring-2 ring-[#8D49A6]/20'
                : 'bg-white dark:bg-[#1A1122] border-[#E8DFEB] dark:border-[#3A2845] hover:border-[#8D49A6]/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black">
                <BookOpen size={18} />
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                {allCourseTopics.length} Konu
              </span>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">Üniteler & Konular</div>
              <div className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 line-clamp-1">Müfredat ve haftalık kazanımlar</div>
            </div>
          </button>

          {/* Card 2: Kitaplar & Materyaller */}
          <button
            type="button"
            onClick={() => setActiveTab('materials')}
            className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
              activeTab === 'materials' || activeTab === 'books'
                ? 'bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-indigo-500 dark:border-indigo-400 shadow-md ring-2 ring-indigo-500/20'
                : 'bg-white dark:bg-[#1A1122] border-[#E8DFEB] dark:border-[#3A2845] hover:border-indigo-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
                <Layers size={18} />
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                {visibleBooks.length + courseMaterials.length} Kaynak
              </span>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">Kitaplar & Materyaller</div>
              <div className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 line-clamp-1">MEB flipbook ve çalışma föyleri</div>
            </div>
          </button>

          {/* Card 3: Testler & Sınavlar */}
          <button
            type="button"
            onClick={() => setActiveTab('quizzes')}
            className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
              activeTab === 'quizzes' || activeTab === 'assessments'
                ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500 dark:border-amber-400 shadow-md ring-2 ring-amber-500/20'
                : 'bg-white dark:bg-[#1A1122] border-[#E8DFEB] dark:border-[#3A2845] hover:border-amber-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
                <Sparkles size={18} />
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                {courseExams.length} Sınav
              </span>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">Ödevler & Sınavlar</div>
              <div className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 line-clamp-1">Bölüm testleri ve yazılılar</div>
            </div>
          </button>

          {/* Card 4: Başarım & Notlarım */}
          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
              activeTab === 'notes'
                ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500 dark:border-emerald-400 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-white dark:bg-[#1A1122] border-[#E8DFEB] dark:border-[#3A2845] hover:border-emerald-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                <Award size={18} />
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                {courseNotes.length} Not
              </span>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">Başarı & Notlarım</div>
              <div className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 line-clamp-1">Ders notları ve kazanım durumu</div>
            </div>
          </button>
        </div>
      </div>

      {/* ── TÜRKÇE DERSİ İÇİN 4 TEMEL DİL ALANI KATEGORİZASYON KARTLARI ── */}
      {isTurkceCourse && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {TURKCE_PILLARS.map((p) => {
            const Icon = p.icon
            return (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#1A1122] border border-[#E8DFEB] dark:border-[#3A2845] space-y-2 shadow-xs transition-all hover:border-[#8D49A6]/40"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#F17AE6] flex items-center justify-center shrink-0">
                    <Icon size={16} />
                  </div>
                  <span className="text-[9.5px] font-black px-2 py-0.5 rounded-full bg-[#FCF9FD] dark:bg-[#211729] text-[#8D49A6] dark:text-[#D2C5D8] border border-[#E8DFEB] dark:border-[#3A2845]">
                    {p.badge}
                  </span>
                </div>

                <div className="text-xs font-black text-[#241329] dark:text-white">
                  {p.title}
                </div>
                <div className="text-[11px] text-[#514458] dark:text-[#D2C5D8] leading-tight">
                  {p.desc}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── TAB 1: MÜFREDAT & KATEGORİZE ÜNİTELER ── */}
      {activeTab === 'topics' && (
        <div className="space-y-5">
          {/* Unit Filter Strip */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1A1122] border border-[#E8DFEB] dark:border-[#3A2845] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={15} className="text-[#8D49A6] dark:text-[#F17AE6]" />
              <span className="text-xs font-black text-[#241329] dark:text-white uppercase tracking-wider">
                Ünite Filtreleme:
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedUnitId('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedUnitId === 'all'
                    ? 'bg-brand-gradient text-white shadow-xs'
                    : 'bg-[#FCF9FD] dark:bg-[#211729] text-[#514458] dark:text-[#D2C5D8] hover:text-[#241329] border border-[#E8DFEB] dark:border-[#3A2845]'
                }`}
              >
                Tüm Üniteler ({definedUnits.length})
              </button>

              {definedUnits.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedUnitId(u.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedUnitId === u.id
                      ? 'bg-brand-gradient text-white shadow-xs'
                      : 'bg-[#FCF9FD] dark:bg-[#211729] text-[#514458] dark:text-[#D2C5D8] hover:text-[#241329] border border-[#E8DFEB] dark:border-[#3A2845]'
                  }`}
                >
                  {u.unitNumber}. Ünite
                </button>
              ))}
            </div>
          </div>

          {/* Categorized Units Listing */}
          <div className="space-y-5">
            {displayedUnits.map((unit) => {
              const unitTopics = allCourseTopics.filter((t) => unit.topicIds.includes(t.id))
              const unitCompletedCount = unitTopics.filter((t) => completedTopicIds.includes(t.id)).length
              const unitTotalCount = unitTopics.length
              const unitPercent = unitTotalCount > 0 ? Math.round((unitCompletedCount / unitTotalCount) * 100) : 0

              return (
                <div
                  key={unit.id}
                  className="rounded-[26px] bg-white dark:bg-[#1A1122] border border-[#E8DFEB] dark:border-[#3A2845] shadow-xs p-5 sm:p-6 space-y-4"
                >
                  {/* Unit Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8DFEB] dark:border-[#2D1B36]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#4B075F] to-[#8D49A6] text-white font-black text-xs flex items-center justify-center shrink-0">
                          {unit.unitNumber}
                        </span>
                        <h2 className="text-base font-black text-[#241329] dark:text-white">
                          {unit.title}
                        </h2>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#FCE8FA] dark:bg-[#350444] text-[#8D49A6] dark:text-[#F17AE6]">
                          {unit.learningPill}
                        </span>
                      </div>
                      <p className="text-xs text-[#514458] dark:text-[#D2C5D8]">
                        {unit.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <span className="text-xs font-bold text-[#16805D] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-500/20">
                        %{unitPercent} Tamamlandı ({unitCompletedCount}/{unitTotalCount})
                      </span>

                      {unit.suggestedBookPage && visibleBooks.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleOpenMainBook(unit.suggestedBookPage)}
                          className="px-3 py-1 rounded-xl bg-[#F0D8FA] hover:bg-[#E2B9F4] dark:bg-[#2D1B36] text-[#4B075F] dark:text-[#F17AE6] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <BookOpen size={13} />
                          <span>s. {unit.suggestedBookPage}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Topics in this Unit */}
                  <div className="space-y-2.5">
                    {unitTopics.length === 0 ? (
                      <div className="text-xs text-[#716779] dark:text-[#B5A5BD] py-2">
                        Bu ünite için henüz tanımlı bir konu bulunmamaktadır.
                      </div>
                    ) : (
                      unitTopics.map((topic, index) => {
                        const isCompleted = completedTopicIds.includes(topic.id)
                        const isActive =
                          topic.id === activeTopicId ||
                          (!isCompleted && allCourseTopics.findIndex((t) => !completedTopicIds.includes(t.id)) === index)

                        let containerStyle = ''
                        let badgeStyle = ''
                        let badgeText = ''
                        let iconNode = null

                        if (isCompleted) {
                          containerStyle = 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/30'
                          badgeStyle = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                          badgeText = '✓ Tamamlandı'
                          iconNode = <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                        } else if (isActive) {
                          containerStyle =
                            'bg-[#FCE8FA]/60 dark:bg-[#2A1633] border-[#D914C8]/50 ring-1 ring-[#D914C8]/30 shadow-xs'
                          badgeStyle = 'bg-brand-gradient text-white shadow-xs'
                          badgeText = '🎯 En Son İşlenen Konu'
                          iconNode = <Sparkles size={18} className="text-[#D914C8] dark:text-[#F17AE6] shrink-0" />
                        } else {
                          containerStyle =
                            'bg-[#FCF9FD] dark:bg-[#211729]/70 border-[#E8DFEB] dark:border-[#3A2845] opacity-85'
                          badgeStyle = 'bg-[#F0D8FA]/50 dark:bg-[#2D1B36] text-[#716779] dark:text-[#B5A5BD]'
                          badgeText = 'Sıradaki Konu'
                          iconNode = <Circle size={18} className="text-[#A998B3] shrink-0" />
                        }

                        return (
                          <div
                            key={topic.id}
                            className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${containerStyle}`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {iconNode}
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-[#241329] dark:text-white leading-tight">
                                    {topic.title}
                                  </span>
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${badgeStyle}`}>
                                    {badgeText}
                                  </span>
                                </div>
                                <div className="text-[10px] text-[#716779] dark:text-[#B5A5BD] mt-0.5">
                                  {topic.week ? `${topic.week}. Hafta Kazanımı · ` : ''}MEB Maarif Modeli Uyumlu
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              {visibleBooks.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenMainBook(unit.suggestedBookPage)}
                                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#1A1122] border border-[#E8DFEB] dark:border-[#3A2845] text-[#514458] dark:text-[#D2C5D8] hover:text-[#4B075F] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Kitapta Konuyu Aç"
                                >
                                  <BookOpen size={13} />
                                  <span>Kitapta Aç</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTopicForQuiz(topic)
                                  setActiveTab('quizzes')
                                  setQuizSubTab('current')
                                  setQuizSubmitted(false)
                                  setQuizAnswers({})
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-brand-gradient hover:opacity-95 text-white font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                              >
                                <Sparkles size={13} />
                                <span>Test Yap</span>
                              </button>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── TAB 2: DERS MATERYALLERİ & ÇALIŞMA DOSYALARI ── */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          {/* Interactive Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              handleFileUpload(e.dataTransfer.files)
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 rounded-[28px] border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-[#D914C8] bg-[#FCE8FA]/40 dark:bg-[#350444]/30'
                : 'border-[#E8DFEB] dark:border-[#3A2845] bg-[#FCF9FD] dark:bg-[#1A1122] hover:border-[#8D49A6]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
            <div className="w-12 h-12 rounded-2xl bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#F17AE6] flex items-center justify-center">
              <Upload size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#241329] dark:text-white">
                Çalışma veya Ödev Dosyası Yükle
              </p>
              <p className="text-[11px] text-[#716779] dark:text-[#B5A5BD] mt-0.5">
                Dosyaları buraya sürükleyin veya seçmek için tıklayın (PDF, Word, Video)
              </p>
            </div>
          </div>

          {/* Categorized Filter Chips */}
          <div className="p-6 rounded-[28px] bg-white dark:bg-[#1A1122] border border-[#E8DFEB] dark:border-[#3A2845] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-black text-[#241329] dark:text-white">
                Ders Dosyaları & Paylaşılan Kaynaklar
              </h2>

              <div className="flex gap-1.5 bg-[#FCF9FD] dark:bg-[#211729] p-1 rounded-xl shrink-0 border border-[#E8DFEB] dark:border-[#3A2845]">
                <button
                  type="button"
                  onClick={() => setMaterialFilter('all')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-black transition-colors cursor-pointer ${
                    materialFilter === 'all'
                      ? 'bg-brand-gradient text-white shadow-xs'
                      : 'text-[#716779] dark:text-[#B5A5BD]'
                  }`}
                >
                  Tümü ({courseMaterials.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMaterialFilter('pdf')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-black transition-colors cursor-pointer ${
                    materialFilter === 'pdf'
                      ? 'bg-brand-gradient text-white shadow-xs'
                      : 'text-[#716779] dark:text-[#B5A5BD]'
                  }`}
                >
                  PDF Föyleri
                </button>
                <button
                  type="button"
                  onClick={() => setMaterialFilter('doc')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-black transition-colors cursor-pointer ${
                    materialFilter === 'doc'
                      ? 'bg-brand-gradient text-white shadow-xs'
                      : 'text-[#716779] dark:text-[#B5A5BD]'
                  }`}
                >
                  Çalışma Kağıtları
                </button>
                <button
                  type="button"
                  onClick={() => setMaterialFilter('video')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-black transition-colors cursor-pointer ${
                    materialFilter === 'video'
                      ? 'bg-brand-gradient text-white shadow-xs'
                      : 'text-[#716779] dark:text-[#B5A5BD]'
                  }`}
                >
                  Videolar
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredMaterials.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#716779] dark:text-[#B5A5BD]">
                  Bu filtreye uygun ders materyali bulunamadı.
                </div>
              ) : (
                filteredMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-4 rounded-2xl bg-[#FCF9FD] dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#3A2845] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#F17AE6] flex items-center justify-center shrink-0">
                        {mat.type === 'video' ? <Video size={18} /> : <FileText size={18} />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#241329] dark:text-white truncate">
                          {mat.title}
                        </div>
                        <div className="text-[10px] text-[#716779] dark:text-[#B5A5BD] mt-0.5 flex items-center gap-2">
                          <span>{mat.size}</span>
                          {mat.dateAdded && (
                            <>
                              <span>•</span>
                              <span>{mat.dateAdded}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownload(mat.title)}
                      className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#1A1122] border border-[#E8DFEB] dark:border-[#3A2845] text-xs font-bold text-[#514458] dark:text-[#D2C5D8] hover:text-[#4B075F] dark:hover:text-[#F17AE6] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Download size={14} />
                      <span>İndir</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: MÜFREDAT KİTAPLARI (MEB FLIPBOOK READER ENTEGRASYONU) ── */}
      {activeTab === 'books' && (
        <div className="space-y-4">
          <div className="p-4.5 rounded-2xl bg-[#FCE8FA]/60 dark:bg-[#211729] border border-[#D914C8]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-gradient text-white flex items-center justify-center shrink-0 shadow-xs">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="text-xs font-black text-[#241329] dark:text-white">
                  MEB Resmi Ders Kitapları & Etkileşimli Flipbook
                </h3>
                <p className="text-[11px] text-[#514458] dark:text-[#D2C5D8]">
                  Öğretmeniniz ve okul idaresi tarafından onaylanan resmî MEB ders kitapları listelenmektedir.
                </p>
              </div>
            </div>

            <span className="text-xs font-black text-[#8D49A6] dark:text-[#F17AE6] shrink-0">
              {visibleBooks.length} Kitap Mevcut
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleBooks.length === 0 ? (
              <div className="col-span-full p-8 text-center text-xs text-[#716779] dark:text-[#B5A5BD] bg-white dark:bg-[#1A1122] rounded-3xl border border-[#E8DFEB] dark:border-[#3A2845]">
                Bu ders için henüz erişime açılmış bir ders kitabı bulunmamaktadır.
              </div>
            ) : (
              visibleBooks.map((book) => (
                <div
                  key={book.id}
                  className="p-4.5 rounded-[26px] bg-white dark:bg-[#1A1122] border border-[#E8DFEB] dark:border-[#3A2845] shadow-xs flex flex-col justify-between gap-4 hover:border-[#8D49A6]/50 transition-colors"
                >
                  <div className="flex gap-3.5">
                    <img
                      src={book.imageUrl}
                      alt={book.title}
                      className="w-20 h-28 object-cover rounded-xl shadow-xs shrink-0 bg-gray-100 dark:bg-gray-800 border border-[#E8DFEB] dark:border-[#3A2845]"
                      onError={(e) => {
                        ;(e.target as any).src =
                          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'
                      }}
                    />
                    <div className="min-w-0 space-y-1">
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-[#FCE8FA] dark:bg-[#350444] text-[#8D49A6] dark:text-[#F17AE6]">
                        {book.bookType} · {book.gradeLevel}. Sınıf
                      </span>
                      <h4 className="text-xs font-black text-[#241329] dark:text-white leading-tight line-clamp-2">
                        {book.title}
                      </h4>
                      <p className="text-[10px] text-[#716779] dark:text-[#B5A5BD] line-clamp-1">{book.publisher}</p>
                      <p className="text-[9.5px] text-[#16805D] dark:text-emerald-400 font-bold">
                        {book.curriculumModel}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E8DFEB] dark:border-[#2D1B36] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setReaderInitialPage(1)
                        setReadingBook(book)
                      }}
                      className="w-full h-9 rounded-xl bg-brand-gradient hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <BookOpen size={14} />
                      <span>Kitabı Aç & Oku</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── TAB 4: TESTLER & ETKİNLİKLER ── */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          {/* Hero Banner */}
          <div className="p-6 rounded-[28px] bg-brand-gradient text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black tracking-wide">
                  <Sparkles size={13} />
                  <span>Müfredat Pekiştirme & Günlük Test</span>
                </div>
                <h3 className="text-lg lg:text-xl font-black tracking-tight">
                  Bu derste en son "{effectiveActiveTopic.title}" konusunu işlediniz.
                </h3>
                <p className="text-xs text-white/90 leading-relaxed font-medium">
                  Aşağıda konu ile ilgili MEB Maarif Modeli'ne uygun denemeler ve çok yönlü soruları çözerek kendinizi test edebilirsiniz.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setQuizAnswers({})
                    setQuizSubmitted(false)
                    setShowResultModal(false)
                  }}
                  className="px-4 py-2 rounded-xl bg-white text-[#4B075F] hover:bg-white/90 font-black text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <RefreshCw size={14} />
                  <span>Testi Sıfırla</span>
                </button>
              </div>
            </div>
          </div>

          {/* Subtabs: Günlük Test vs Geçmiş Testler */}
          <div className="flex items-center gap-2 border-b border-[#E8DFEB] dark:border-[#2D1B36] pb-2">
            <button
              type="button"
              onClick={() => setQuizSubTab('current')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                quizSubTab === 'current'
                  ? 'bg-brand-gradient text-white shadow-xs'
                  : 'bg-[#FCF9FD] dark:bg-[#211729] text-[#514458] dark:text-[#D2C5D8] border border-[#E8DFEB] dark:border-[#3A2845]'
              }`}
            >
              <Sparkles size={14} />
              <span>Günlük Konu Testi ({currentQuizQuestions.length} Soru)</span>
            </button>

            <button
              type="button"
              onClick={() => setQuizSubTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                quizSubTab === 'history'
                  ? 'bg-brand-gradient text-white shadow-xs'
                  : 'bg-[#FCF9FD] dark:bg-[#211729] text-[#514458] dark:text-[#D2C5D8] border border-[#E8DFEB] dark:border-[#3A2845]'
              }`}
            >
              <BarChart3 size={14} />
              <span>Geçmiş Testler & Denemeler ({pastQuizzes.length})</span>
            </button>
          </div>

          {/* SUBTAB 1: GÜNLÜK TEST */}
          {quizSubTab === 'current' && (
            <div className="p-6 rounded-[28px] bg-white dark:bg-[#1A1122] border border-[#E8DFEB] dark:border-[#3A2845] shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DFEB] dark:border-[#2D1B36]">
                <div>
                  <h4 className="text-sm font-black text-[#241329] dark:text-white">
                    {effectiveActiveTopic.title} — Kazanım Pekiştirme Soruları
                  </h4>
                  <p className="text-[11px] text-[#716779] dark:text-[#B5A5BD]">
                    Çoktan seçmeli, doğru-yanlış ve kavram tamamlama türlerinde karma MEB soruları.
                  </p>
                </div>
                <span className="text-xs font-black text-[#8D49A6] dark:text-[#F17AE6]">
                  {Object.keys(quizAnswers).length} / {currentQuizQuestions.length} Yanıtlandı
                </span>
              </div>

              <div className="space-y-4">
                {currentQuizQuestions.map((q, idx) => {
                  const isAnswered = !!quizAnswers[q.id]
                  const isCorrect = quizAnswers[q.id] === q.correct

                  return (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl bg-[#FCF9FD] dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#3A2845] space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-brand-gradient text-white font-black text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FCE8FA] dark:bg-[#350444] text-[#8D49A6] dark:text-[#F17AE6] border border-[#D914C8]/30">
                            {q.typeLabel}
                          </span>
                        </div>
                        {quizSubmitted && (
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                              isCorrect
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {isCorrect ? '✓ Doğru Yanıt' : isAnswered ? '✗ Hatalı Yanıt' : 'Boş Bırakıldı'}
                          </span>
                        )}
                      </div>

                      <div className="text-xs lg:text-sm font-bold text-[#241329] dark:text-white leading-relaxed">
                        {q.question}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt) => {
                          const isSelected = quizAnswers[q.id] === opt.key
                          let optionClass =
                            'bg-white dark:bg-[#1A1122] border-[#E8DFEB] dark:border-[#3A2845] text-[#514458] dark:text-[#D2C5D8] hover:border-[#8D49A6]'

                          if (quizSubmitted) {
                            if (opt.key === q.correct) {
                              optionClass =
                                'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-black'
                            } else if (isSelected && opt.key !== q.correct) {
                              optionClass =
                                'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-800 dark:text-rose-200 line-through'
                            } else {
                              optionClass = 'bg-white/50 dark:bg-[#1A1122]/50 border-gray-200 dark:border-gray-800 text-gray-400'
                            }
                          } else if (isSelected) {
                            optionClass =
                              'bg-[#FCE8FA] dark:bg-[#350444]/60 border-[#D914C8] text-[#4B075F] dark:text-[#F17AE6] font-black ring-1 ring-[#D914C8]/40'
                          }

                          return (
                            <button
                              key={opt.key}
                              type="button"
                              disabled={quizSubmitted}
                              onClick={() => {
                                setQuizAnswers((prev) => ({ ...prev, [q.id]: opt.key }))
                              }}
                              className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center gap-3 cursor-pointer ${optionClass}`}
                            >
                              <span className="w-6 h-6 rounded-lg bg-[#F7F0FA] dark:bg-[#2D1B36] font-black text-[11px] flex items-center justify-center shrink-0">
                                {opt.key}
                              </span>
                              <span className="flex-1 leading-snug">{opt.text}</span>
                              {quizSubmitted && opt.key === q.correct && (
                                <Check size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                              )}
                            </button>
                          )
                        })}
                      </div>

                      {quizSubmitted && q.explanation && (
                        <div className="p-3 rounded-xl bg-[#FCE8FA]/60 dark:bg-[#2D1B36] border border-[#D914C8]/30 text-[11px] text-[#4B075F] dark:text-[#F17AE6] flex items-start gap-2">
                          <Sparkles size={14} className="shrink-0 mt-0.5" />
                          <span>
                            <strong>Kazanım Notu:</strong> {q.explanation}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-[#E8DFEB] dark:border-[#2D1B36] flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-[#716779] dark:text-[#B5A5BD]">
                  Toplam {currentQuizQuestions.length} sorudan {Object.keys(quizAnswers).length} tanesini işaretlediniz.
                </div>

                <div className="flex items-center gap-2">
                  {!quizSubmitted ? (
                    <button
                      type="button"
                      onClick={handleCompleteQuiz}
                      className="px-6 py-2.5 rounded-xl bg-brand-gradient hover:opacity-95 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Trophy size={14} />
                      <span>Testi Tamamla ve Sonuçları Göster</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowResultModal(true)}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <BarChart3 size={14} />
                      <span>Sonuç Kartını Aç</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 2: GEÇMİŞ TESTLER & DENEMELER */}
          {quizSubTab === 'history' && (
            <div className="p-6 rounded-[28px] bg-white dark:bg-[#1A1122] border border-[#E8DFEB] dark:border-[#3A2845] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-[#241329] dark:text-white">
                    {course.name} Çözülen Deneme & Test Geçmişi
                  </h4>
                  <p className="text-[11px] text-[#716779] dark:text-[#B5A5BD]">
                    Öğrencinin tamamladığı testler, doğru-yanlış dökümleri ve başarı oranları.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#8D49A6] dark:text-[#F17AE6]">
                  {pastQuizzes.length} Test Çözüldü
                </span>
              </div>

              {pastQuizzes.length === 0 ? (
                <div className="p-10 text-center text-xs text-[#716779] dark:text-[#B5A5BD] border border-dashed border-[#E8DFEB] dark:border-[#3A2845] rounded-2xl space-y-2">
                  <Sparkles size={24} className="mx-auto text-[#A998B3]" />
                  <p>Bu ders için henüz tamamlanmış bir test kaydı bulunmuyor.</p>
                  <button
                    type="button"
                    onClick={() => setQuizSubTab('current')}
                    className="px-4 py-1.5 rounded-xl bg-brand-gradient text-white text-xs font-bold inline-flex items-center gap-1.5 mt-2 cursor-pointer"
                  >
                    <span>Hemen Günlük Testi Çöz</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {pastQuizzes.map((pq: any, pIdx: number) => (
                    <div
                      key={pq.id || pIdx}
                      className="p-4 rounded-2xl bg-[#FCF9FD] dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#3A2845] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-brand-gradient text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                          %{pq.percentage}
                        </div>

                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#241329] dark:text-white truncate">
                            {pq.topicTitle}
                          </div>
                          <div className="text-[10px] text-[#716779] dark:text-[#B5A5BD] mt-0.5 flex items-center gap-2">
                            <span>{pq.date}</span>
                            <span>•</span>
                            <span>{pq.week ? `${pq.week}. Hafta` : 'Kazanım Testi'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            {pq.correct} D
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400">
                            {pq.wrong} Y
                          </span>
                          {pq.unanswered > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-gray-200 dark:bg-gray-800 text-gray-500">
                              {pq.unanswered} B
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setLastQuizStats(pq)
                            setShowResultModal(true)
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1A1122] border border-[#E8DFEB] dark:border-[#3A2845] text-xs font-bold text-[#514458] dark:text-[#D2C5D8] hover:text-[#4B075F] dark:hover:text-[#F17AE6] transition-colors cursor-pointer"
                        >
                          İncele
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── GRAPHICAL POST-TEST COMPLETION MODAL ── */}
          {showResultModal && lastQuizStats && (
            <div className="fixed inset-0 z-50 bg-[#0E0617]/75 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-lg bg-white dark:bg-[#1A1122] rounded-[30px] border border-[#E8DFEB] dark:border-[#3A2845] shadow-2xl p-6 lg:p-8 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8DFEB] dark:border-[#2D1B36]">
                  <div className="flex items-center gap-2">
                    <Trophy size={20} className="text-amber-500" />
                    <h3 className="text-base font-black text-[#241329] dark:text-white">
                      Test Değerlendirme & Başarı Raporu
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowResultModal(false)}
                    className="w-8 h-8 rounded-xl text-[#716779] hover:text-[#241329] dark:hover:text-white flex items-center justify-center cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="text-center space-y-3">
                  <div className="w-20 h-20 rounded-full bg-brand-gradient text-white flex flex-col items-center justify-center mx-auto shadow-lg shadow-[#4B075F]/30">
                    <div className="text-2xl font-black">
                      %{lastQuizStats.percentage}
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-wider">
                      Başarı
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-[#241329] dark:text-white">
                      {lastQuizStats.topicTitle}
                    </h4>
                    <p className="text-xs text-[#514458] dark:text-[#D2C5D8] mt-1 font-medium">
                      {lastQuizStats.percentage >= 80
                        ? '🌟 Harika Bir Performans! Takdir Düzeyinde Başarı.'
                        : lastQuizStats.percentage >= 50
                        ? '👍 İyi İlerleme! Eksik soruları tekrar ederek tam puan alabilirsiniz.'
                        : '💡 Konuyu kitaptan tekrar okumanız ve testi yeniden denemeniz tavsiye edilir.'}
                    </p>
                  </div>
                </div>

                {/* 4 Stat Cards */}
                <div className="grid grid-cols-4 gap-2 pt-2">
                  <div className="p-3 rounded-2xl bg-[#FCF9FD] dark:bg-[#211729] text-center space-y-1 border border-[#E8DFEB] dark:border-[#3A2845]">
                    <span className="text-[10px] font-bold text-[#716779] dark:text-[#B5A5BD]">Toplam</span>
                    <div className="text-base font-black text-[#241329] dark:text-white">
                      {lastQuizStats.total}
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-center space-y-1 border border-emerald-500/20">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Doğru</span>
                    <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                      {lastQuizStats.correct}
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-center space-y-1 border border-rose-500/20">
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">Yanlış</span>
                    <div className="text-base font-black text-rose-600 dark:text-rose-400">
                      {lastQuizStats.wrong}
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-center space-y-1">
                    <span className="text-[10px] font-bold text-gray-400">Boş</span>
                    <div className="text-base font-black text-gray-600 dark:text-gray-300">
                      {lastQuizStats.unanswered}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResultModal(false)
                      setQuizAnswers({})
                      setQuizSubmitted(false)
                    }}
                    className="px-4 py-2 rounded-xl bg-[#F7F0FA] dark:bg-[#211729] text-xs font-bold text-[#514458] dark:text-[#D2C5D8] transition-colors cursor-pointer"
                  >
                    Tekrar Çöz
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResultModal(false)}
                    className="px-5 py-2 rounded-xl bg-brand-gradient text-white text-xs font-black transition-all shadow-xs cursor-pointer"
                  >
                    Kapat & İncele
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 5: YAZILI SINAVLAR VE NOTLAR ── */}
      {activeTab === 'assessments' && (
        <div className="p-6 rounded-[28px] bg-white dark:bg-[#1A1122] border border-[#E8DFEB] dark:border-[#3A2845] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-[#241329] dark:text-white">
              {course.name} Sınavları ve Öğretmen Değerlendirmeleri
            </h2>
          </div>

          <div className="space-y-3">
            {courseExams.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#716779] dark:text-[#B5A5BD]">
                Bu ders için planlanan veya girilen sınav kaydı bulunmamaktadır.
              </div>
            ) : (
              courseExams.map((exam) => (
                <div
                  key={exam.id}
                  className="p-5 rounded-2xl bg-[#FCF9FD] dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#3A2845] flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FCE8FA] dark:bg-[#350444] text-[#8D49A6] dark:text-[#F17AE6]">
                        {exam.date}
                      </span>
                      <span className="text-xs font-black text-[#241329] dark:text-white">
                        {exam.title}
                      </span>
                      <span className="text-[10px] text-[#716779] dark:text-[#B5A5BD]">
                        ({exam.examTypeLabel || 'Değerlendirme'})
                      </span>
                    </div>

                    <div className="text-[11px] text-[#514458] dark:text-[#D2C5D8] flex items-center gap-3">
                      <span>Süre: {exam.durationMinutes} Dk</span>
                      <span>•</span>
                      <span>Yer: {exam.location}</span>
                      <span>•</span>
                      <span>Öğretmen: {exam.teacherName || course.teacherName}</span>
                    </div>

                    {exam.teacherFeedback && (
                      <div className="p-3 rounded-xl bg-white dark:bg-[#1A1122] border border-[#E8DFEB] dark:border-[#3A2845] mt-2">
                        <p className="text-[11px] text-[#241329] dark:text-[#FCF9FD] italic">
                          "{exam.teacherFeedback}"
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    {exam.isPublished && exam.score !== undefined ? (
                      <div className="space-y-1">
                        <div className="text-xl font-black text-[#16805D] dark:text-emerald-400">
                          {exam.score} / {exam.maxScore}
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600">
                          Değerlendirildi
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 px-3 py-1 rounded-xl bg-amber-500/10">
                        Yaklaşan Sınav
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── TAB 6: NOTLARIM (KİTAP NOTLARI & DEFTERİM ENTEGRASYONU) ── */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="p-6 rounded-[28px] bg-white dark:bg-[#1A1122] border border-[#E8DFEB] dark:border-[#3A2845] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-[#241329] dark:text-white">
                  {course.name} Ders Notlarım ve Kitap İçi Kayıtlarım
                </h2>
                <p className="text-xs text-[#716779] dark:text-[#B5A5BD]">
                  Bu ders kapsamında aldığınız notlar ve e-kitap okuyucuda kaydettiğiniz sayfa notları burada toplanır.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowNoteForm(!showNoteForm)}
                className="px-4 py-2 rounded-xl bg-brand-gradient hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <Plus size={15} />
                <span>Yeni Not Ekle</span>
              </button>
            </div>

            {/* Note Creation Form */}
            {showNoteForm && (
              <form onSubmit={handleCreateNote} className="p-4.5 rounded-2xl bg-[#FCF9FD] dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#3A2845] space-y-3">
                <input
                  type="text"
                  placeholder="Not Başlığı (Örn: Çizgi Yönleri ve Harf Birleştirme Notum)"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-white dark:bg-[#1A1122] border border-[#E8DFEB] dark:border-[#3A2845] text-xs text-[#241329] dark:text-white placeholder:text-[#A998B3] focus:outline-hidden"
                />
                <textarea
                  rows={3}
                  placeholder="Not içeriğinizi buraya yazın..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-white dark:bg-[#1A1122] border border-[#E8DFEB] dark:border-[#3A2845] text-xs text-[#241329] dark:text-white placeholder:text-[#A998B3] focus:outline-hidden resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNoteForm(false)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#716779] dark:text-[#B5A5BD] cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-brand-gradient text-white text-xs font-bold cursor-pointer"
                  >
                    Kaydet
                  </button>
                </div>
              </form>
            )}

            {/* Notes List */}
            <div className="space-y-3">
              {courseNotes.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#716779] dark:text-[#B5A5BD] border border-dashed border-[#E8DFEB] dark:border-[#3A2845] rounded-2xl">
                  Bu ders için henüz bir not almadınız. Yukarıdaki "Yeni Not Ekle" butonuna basarak veya e-kitap okuyucuda sayfaya not ekleyerek buraya kaydedebilirsiniz.
                </div>
              ) : (
                courseNotes.map((note) => {
                  const isBookNote = !!note.bookId
                  return (
                    <div
                      key={note.id}
                      className="p-4 rounded-2xl bg-[#FCF9FD] dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#3A2845] space-y-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isBookNote ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FCE8FA] dark:bg-[#350444] text-[#8D49A6] dark:text-[#F17AE6] flex items-center gap-1">
                              <BookOpen size={11} />
                              Kitap Notu · Sayfa {note.pageNumber}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F0D8FA] dark:bg-[#2D1B36] text-[#4B075F] dark:text-[#D2C5D8]">
                              Ders Notu
                            </span>
                          )}
                          <h4 className="text-xs font-bold text-[#241329] dark:text-white">
                            {note.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-[#716779] dark:text-[#B5A5BD]">{note.date}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note.id)}
                            className="w-7 h-7 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center transition-colors cursor-pointer"
                            title="Notu Sil"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-[#514458] dark:text-[#D2C5D8] leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>

                      {isBookNote && (
                        <div className="pt-2 flex items-center justify-between border-t border-[#E8DFEB] dark:border-[#3A2845]">
                          <span className="text-[10px] text-[#716779] dark:text-[#B5A5BD] italic">
                            Kaynak: {note.bookTitle}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenBookAtPage(note.bookId, note.pageNumber)}
                            className="text-[11px] font-bold text-[#8D49A6] dark:text-[#F17AE6] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>Kitapta Sayfaya Git (s. {note.pageNumber})</span>
                            <ExternalLink size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── FULLSCREEN DISTRACTION-FREE MEB BOOK READER MODAL ── */}
      {readingBook && (
        <MobileBookReader
          book={readingBook}
          initialPage={readerInitialPage}
          onClose={() => {
            setReadingBook(null)
            setReaderInitialPage(undefined)
            syncAll()
          }}
        />
      )}
    </div>
  )
}
