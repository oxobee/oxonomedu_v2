'use client'

import React, { useState, useEffect, useRef } from 'react'
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
}

export default function StudentCourseDetailView({ courseId }: StudentCourseDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'topics' | 'materials' | 'assessments' | 'books' | 'quizzes' | 'notes'>('topics')
  const [courses, setCourses] = useState<StudentCourse[]>(STUDENT_COURSES)
  const [assessments, setAssessments] = useState<StudentAssessment[]>([])
  const [profile, setProfile] = useState<StudentProfile>(getSynchronizedStudentProfile())

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
  const allCourseTopics = React.useMemo(() => {
    const base = course.topics || []
    const custom = (customCourseTopics || []).map((ct: any, idx: number) => ({
      id: ct.id,
      title: ct.title,
      completed: ct.completed || false,
      week: ct.week || (base.length + idx + 1),
    }))
    return [...base, ...custom]
  }, [course.topics, customCourseTopics])

  // Effective Active Topic (teacher selected, or user selected for quiz, or first unfinished)
  const effectiveActiveTopic = React.useMemo(() => {
    if (selectedTopicForQuiz) return selectedTopicForQuiz
    if (activeTopicId) {
      const found = allCourseTopics.find((t) => t.id === activeTopicId)
      if (found) return found
    }
    const firstUnfinished = allCourseTopics.find((t) => !completedTopicIds.includes(t.id))
    return firstUnfinished || allCourseTopics[0] || { id: 'top-1', title: 'Temel Ders Kazanımları', week: 1 }
  }, [selectedTopicForQuiz, activeTopicId, allCourseTopics, completedTopicIds])

  // Topics progress calculation based on synchronized topics
  const completedTopicsCount = allCourseTopics.filter((t) => completedTopicIds.includes(t.id)).length
  const totalTopicsCount = allCourseTopics.length
  const progressPercent = totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0

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

  // Open book at specific page from note
  const handleOpenBookAtPage = (bookId: number, pageNumber?: number) => {
    const foundBook = MEB_TEXTBOOKS_CATALOG.find((b) => b.id === bookId)
    if (foundBook) {
      setReaderInitialPage(pageNumber || 1)
      setReadingBook(foundBook)
    } else {
      toast.error('Kitap kataloğunda bulunamadı.')
    }
  }

  // Multi-type dynamic question generator based on active topic & MEB curriculum
  const currentQuizQuestions = React.useMemo(() => {
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

    if (norm.includes('hayat') || norm.includes('sosyal')) {
      return [
        {
          id: 'q1',
          type: 'single' as const,
          typeLabel: 'Çoktan Seçmeli',
          question: `"${topicTitle}" konusuna göre sınıfta söz alıp konuşmak istediğimizde ilk olarak ne yapmalıyız?`,
          options: [
            { key: 'A', text: 'Parmak kaldırıp öğretmenimizden söz istemeliyiz.' },
            { key: 'B', text: 'Ayağa fırlayıp yüksek sesle konuşmalıyız.' },
            { key: 'C', text: 'Arkadaşımızın sözünü kesmeliyiz.' },
            { key: 'D', text: 'Sıraya vurarak dikkat çekmeliyiz.' },
          ],
          correct: 'A',
          explanation: 'Sınıf içi nezaket kuralı olarak parmak kaldırılır.',
        },
        {
          id: 'q2',
          type: 'true_false' as const,
          typeLabel: 'Doğru / Yanlış',
          question: `Okulumuzdaki lavaboları, suyu ve lambaları tasarruflu kullanmak hepimizin sorumluluğudur.`,
          options: [
            { key: 'D', text: 'Doğru' },
            { key: 'Y', text: 'Yanlış' },
          ],
          correct: 'D',
          explanation: 'Tasarruf ve kaynak koruma yurttaşlık bilincidir.',
        },
        {
          id: 'q3',
          type: 'fill_in' as const,
          typeLabel: 'Kavram Doldurma',
          question: `Sabah okula geldiğimizde arkadaşlarımıza ve öğretmenimize ________ demeliyiz.`,
          options: [
            { key: 'A', text: 'Günaydın' },
            { key: 'B', text: 'İyi geceler' },
            { key: 'C', text: 'Görüşürüz' },
          ],
          correct: 'A',
          explanation: 'Sabah selamlaşması saygı ve sevginin ifadesidir.',
        },
        {
          id: 'q4',
          type: 'concept' as const,
          typeLabel: 'Davranış Kuralı',
          question: `Teneffüste okul koridorunda hareket ederken hangisi en doğrudur?`,
          options: [
            { key: 'A', text: 'Sakin ve dikkatli adımlarla sağdan yürümek' },
            { key: 'B', text: 'Koşarak diğer öğrencilere çarpmak' },
            { key: 'C', text: 'Merdiven korkuluklarından kaymak' },
            { key: 'D', text: 'Yüksek sesle bağırmak' },
          ],
          correct: 'A',
          explanation: 'Okul güvenliği için koridorlarda koşulmaz.',
        },
      ]
    }

    // Default dynamic questions
    return [
      {
        id: 'q1',
        type: 'single' as const,
        typeLabel: 'Çoktan Seçmeli',
        question: `"${topicTitle}" konusundaki temel bilgileri pekiştirmek için hangisi en etkilidir?`,
        options: [
          { key: 'A', text: 'Ders kitabını incelemek ve etkinlikleri dikkatle tamamlamak' },
          { key: 'B', text: 'Konuyu hiç tekrar etmemek' },
          { key: 'C', text: 'Ders materyallerini evde unutmak' },
          { key: 'D', text: 'Öğretmenin uyarılarını dinlememek' },
        ],
        correct: 'A',
        explanation: 'Düzenli tekrar ve çalışma başarıyı getirir.',
      },
      {
        id: 'q2',
        type: 'true_false' as const,
        typeLabel: 'Doğru / Yanlış',
        question: `"${topicTitle}" kazanımı bu haftanın temel müfredat hedefleri arasındadır.`,
        options: [
          { key: 'D', text: 'Doğru' },
          { key: 'Y', text: 'Yanlış' },
        ],
        correct: 'D',
        explanation: 'MEB Maarif Modeli çerçevesinde haftalık kazanımlar sıralıdır.',
      },
      {
        id: 'q3',
        type: 'fill_in' as const,
        typeLabel: 'Kavram Doldurma',
        question: `Başarılı bir öğrenci olmak için her gün derslerimizi düzenli olarak ________ etmeliyiz.`,
        options: [
          { key: 'A', text: 'Tekrar' },
          { key: 'B', text: 'İhmal' },
          { key: 'C', text: 'Ertesi güne terk' },
        ],
        correct: 'A',
        explanation: 'Tekrar bilginin kalıcı olmasını sağlar.',
      },
      {
        id: 'q4',
        type: 'concept' as const,
        typeLabel: 'Kazanım Analizi',
        question: `Bu derste işlenen "${topicTitle}" konusunun temel amacı nedir?`,
        options: [
          { key: 'A', text: 'Öğrenilen bilgiyi ve beceriyi günlük hayatta uygulayabilmek' },
          { key: 'B', text: 'Sadece sınavda puan alıp unutmak' },
          { key: 'C', text: 'Ders saatini doldurmak' },
          { key: 'D', text: 'Kitaptaki boşlukları rastgele doldurmak' },
        ],
        correct: 'A',
        explanation: 'Eğitimin amacı edinilen bilgiyi yaşam becerisine dönüştürmektir.',
      },
    ]
  }, [course.name, effectiveActiveTopic])

  // Handle Complete Quiz & Save Results
  const handleCompleteQuiz = () => {
    const total = currentQuizQuestions.length
    let correct = 0
    let wrong = 0
    let unanswered = 0

    currentQuizQuestions.forEach((q) => {
      const ans = quizAnswers[q.id]
      if (!ans) {
        unanswered++
      } else if (ans === q.correct) {
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
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* ── TOP BACK NAVIGATION ── */}
      <Link
        href="/student/courses"
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Tüm Derslerime Geri Dön</span>
      </Link>

      {/* ── COURSE HERO BANNER (THEME MATCHED & RESPONSIVE) ── */}
      <div className="p-6 lg:p-8 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-5 relative overflow-hidden">
        {/* Subtle decorative background gradient accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cyan-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 relative z-10">
          <div className="space-y-2.5 max-w-2xl">
            {/* Badges strip */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black px-2.5 py-1 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/50 dark:border-cyan-800/50">
                {course.code}
              </span>
              <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/40 dark:border-indigo-800/40">
                {profile.schoolName || 'Oxonom Okulları'}
              </span>
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <span>{profile.className} Şubesi</span>
                <span>•</span>
                <span>{profile.gradeLevel}</span>
              </span>
            </div>

            {/* Course Title */}
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {course.name}
            </h1>

            {/* Course Description */}
            <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {course.description}
            </p>

            {/* Progress Bar */}
            <div className="pt-2 max-w-md space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-gray-500 dark:text-gray-400">Dönem Kazanım İlerlemesi</span>
                <span className="text-cyan-600 dark:text-cyan-400">
                  %{progressPercent} ({completedTopicsCount}/{totalTopicsCount} Konu)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Teacher & Schedule Card */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 space-y-2.5 shrink-0 min-w-[240px]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-white font-black text-base flex items-center justify-center shrink-0 shadow-xs">
                {course.teacherName.slice(0, 1)}
              </div>
              <div>
                <div className="text-xs font-black text-gray-900 dark:text-white">
                  {course.teacherName}
                </div>
                <div className="text-[10px] text-gray-400 font-semibold">{course.teacherBranch}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200/60 dark:border-gray-800/60 space-y-1 text-[11px]">
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <Clock size={13} className="text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span className="font-bold">Haftada {course.weeklyHours} Saat</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <MapPin size={13} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>{course.roomType}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 6 CATEGORICAL TABS SWITCHER ── */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('topics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'topics'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Müfredat Konuları ({course.topics.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('materials')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'materials'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Ders Materyalleri ({courseMaterials.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('assessments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'assessments'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Sınavlar & Sonuçlar ({courseExams.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('books')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'books'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Müfredat Kitapları ({visibleBooks.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quizzes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'quizzes'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Testler & Etkinlikler
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Notlarım ({courseNotes.length})
          </button>
        </div>
      </div>

      {/* ── TAB 1: MÜFREDAT KONULARI ── */}
      {activeTab === 'topics' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Layers size={18} className="text-cyan-600 dark:text-cyan-400" />
                Haftalık Ders Kazanımları ve Konu İlerlemesi
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Öğretmeninizin belirlediği aktif konu ve tamamlanan üniteler renklerle belirtilmiştir.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/60 self-start sm:self-auto">
              <span>{completedTopicsCount} / {totalTopicsCount} Tamamlandı</span>
              <span>(%{progressPercent})</span>
            </div>
          </div>

          {/* Color legend guide */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 pb-1 text-[11px] font-semibold text-gray-500 border-b border-gray-100 dark:border-gray-800/80">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Geçilen Konular</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
              <span>En Son İşlenen (Aktif)</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
              <span>Gelecek Konular</span>
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {allCourseTopics.map((topic, index) => {
              const isCompleted = completedTopicIds.includes(topic.id)
              const isActive =
                topic.id === activeTopicId ||
                (!isCompleted && allCourseTopics.findIndex((t) => !completedTopicIds.includes(t.id)) === index)
              const isUpcoming = !isCompleted && !isActive

              let containerStyle = ''
              let badgeStyle = ''
              let badgeText = ''
              let iconNode = null

              if (isCompleted) {
                containerStyle = 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30'
                badgeStyle = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                badgeText = '✓ Geçilen / Tamamlandı'
                iconNode = <CheckCircle2 size={19} className="text-emerald-500 shrink-0" />
              } else if (isActive) {
                containerStyle =
                  'bg-cyan-500/10 dark:bg-cyan-950/30 border-cyan-500/60 ring-2 ring-cyan-500/30 shadow-xs'
                badgeStyle = 'bg-cyan-600 text-white shadow-xs'
                badgeText = '🎯 En Son İşlenen Konu'
                iconNode = <Sparkles size={19} className="text-cyan-600 dark:text-cyan-400 shrink-0 animate-pulse" />
              } else {
                containerStyle =
                  'bg-gray-50/70 dark:bg-[#131C31]/70 border-gray-200/60 dark:border-gray-800/60 opacity-80'
                badgeStyle = 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                badgeText = 'Sıradaki Konu'
                iconNode = <Circle size={19} className="text-gray-400 shrink-0" />
              }

              return (
                <div
                  key={topic.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${containerStyle}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {iconNode}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                          {topic.title}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${badgeStyle}`}>
                          {badgeText}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {topic.week ? `${topic.week}. Hafta Kazanımı · ` : ''}MEB Türkiye Yüzyılı Maarif Modeli
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTopicForQuiz(topic)
                        setActiveTab('quizzes')
                        setQuizSubTab('current')
                        setQuizSubmitted(false)
                        setQuizAnswers({})
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Sparkles size={13} />
                      <span>Test Yap</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── TAB 2: DERS MATERYALLERİ & DRAG-AND-DROP DOSYA SİSTEMİ ── */}
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
            className={`p-6 rounded-3xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-cyan-500 bg-cyan-500/10'
                : 'border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-[#131C31]/50 hover:border-cyan-500/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Upload size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                Çalışma veya Ödev Dosyası Yükle
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Dosyaları buraya sürükleyin veya seçmek için tıklayın (PDF, Word, Video)
              </p>
            </div>
          </div>

          {/* Filing System Filter Chips */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Ders Dosyaları & Paylaşılan Kaynaklar
              </h2>

              <div className="flex gap-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setMaterialFilter('all')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    materialFilter === 'all'
                      ? 'bg-white dark:bg-[#0E1526] text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-500'
                  }`}
                >
                  Tümü ({courseMaterials.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMaterialFilter('pdf')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    materialFilter === 'pdf'
                      ? 'bg-white dark:bg-[#0E1526] text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-500'
                  }`}
                >
                  PDF Föyleri
                </button>
                <button
                  type="button"
                  onClick={() => setMaterialFilter('doc')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    materialFilter === 'doc'
                      ? 'bg-white dark:bg-[#0E1526] text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-500'
                  }`}
                >
                  Çalışma Kağıtları
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredMaterials.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  Bu filtreye uygun ders materyali bulunamadı.
                </div>
              ) : (
                filteredMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                        {mat.type === 'video' ? <Video size={18} /> : <FileText size={18} />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {mat.title}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-2">
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
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0E1526] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-cyan-600 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
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

      {/* ── TAB 3: SINAVLAR VE NOTLAR ── */}
      {activeTab === 'assessments' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
              {course.name} Sınavları, Değerlendirmeleri ve Öğretmen Notları
            </h2>
          </div>

          <div className="space-y-3">
            {courseExams.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                Bu ders için planlanan veya girilen sınav kaydı bulunmamaktadır.
              </div>
            ) : (
              courseExams.map((exam) => (
                <div
                  key={exam.id}
                  className="p-5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        {exam.date}
                      </span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {exam.title}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        ({exam.examTypeLabel || 'Değerlendirme'})
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-3">
                      <span>Süre: {exam.durationMinutes} Dk</span>
                      <span>•</span>
                      <span>Yer: {exam.location}</span>
                      <span>•</span>
                      <span>Öğretmen: {exam.teacherName || course.teacherName}</span>
                    </div>

                    {exam.teacherFeedback && (
                      <div className="p-3 rounded-xl bg-white dark:bg-[#0E1526] border border-gray-200/60 dark:border-gray-800/60 mt-2">
                        <p className="text-[11px] text-gray-700 dark:text-gray-300 italic">
                          "{exam.teacherFeedback}"
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    {exam.isPublished && exam.score !== undefined ? (
                      <div className="space-y-1">
                        <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
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

      {/* ── TAB 4: MÜFREDAT KİTAPLARI (PDF OKUYUCU ENTEGRASYONU) ── */}
      {activeTab === 'books' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/20 border border-cyan-200/60 dark:border-cyan-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-gray-900 dark:text-white">
                  MEB Resmi Ders Kitapları & Öğretim Materyalleri
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Öğretmeniniz veya okul idaresi tarafından erişime açılan resmî MEB ders kitapları listelenmektedir.
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-cyan-700 dark:text-cyan-300 shrink-0">
              {visibleBooks.length} Kitap Mevcut
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleBooks.length === 0 ? (
              <div className="col-span-full p-8 text-center text-xs text-gray-400 bg-white dark:bg-[#0E1526] rounded-3xl border border-gray-200 dark:border-gray-800">
                Bu ders için öğretmeniniz tarafından henüz erişime açılmış bir kitap bulunmamaktadır.
              </div>
            ) : (
              visibleBooks.map((book) => (
                <div
                  key={book.id}
                  className="p-4 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex flex-col justify-between gap-4 hover:border-cyan-500/50 transition-colors"
                >
                  <div className="flex gap-3">
                    <img
                      src={book.imageUrl}
                      alt={book.title}
                      className="w-20 h-28 object-cover rounded-xl shadow-xs shrink-0 bg-gray-100 dark:bg-gray-800"
                      onError={(e) => {
                        ;(e.target as any).src =
                          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'
                      }}
                    />
                    <div className="min-w-0 space-y-1">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
                        {book.bookType} · {book.gradeLevel}. Sınıf
                      </span>
                      <h4 className="text-xs font-extrabold text-gray-900 dark:text-white leading-tight line-clamp-2">
                        {book.title}
                      </h4>
                      <p className="text-[10px] text-gray-400 line-clamp-1">{book.publisher}</p>
                      <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        {book.curriculumModel}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setReaderInitialPage(1)
                        setReadingBook(book)
                      }}
                      className="w-full h-9 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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

      {/* ── TAB 5: TESTLER & ETKİNLİKLER ── */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          {/* Hero Banner: Auto-generated quiz prompt based on last active topic */}
          <div className="p-5 lg:p-6 rounded-3xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black tracking-wide">
                  <Sparkles size={13} />
                  <span>Müfredat Pekiştirme & Günlük Test</span>
                </div>
                <h3 className="text-lg lg:text-xl font-black tracking-tight">
                  Bu derste en son "{effectiveActiveTopic.title}" konusunu işlediniz.
                </h3>
                <p className="text-xs text-white/90 leading-relaxed">
                  Aşağıda konu ile ilgili MEB Türkiye Yüzyılı Maarif Modeli'ne uygun denemeler ve çok yönlü soruları çözerek kendinizi test edebilirsiniz.
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
                  className="px-4 py-2 rounded-xl bg-white text-cyan-700 hover:bg-cyan-50 font-black text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <RefreshCw size={14} />
                  <span>Testi Sıfırla</span>
                </button>
              </div>
            </div>
          </div>

          {/* Subtabs: Günlük Test vs Geçmiş Testler */}
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
            <button
              type="button"
              onClick={() => setQuizSubTab('current')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                quizSubTab === 'current'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
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
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              <BarChart3 size={14} />
              <span>Geçmiş Testler & Denemeler ({pastQuizzes.length})</span>
            </button>
          </div>

          {/* SUBTAB 1: GÜNLÜK TEST */}
          {quizSubTab === 'current' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h4 className="text-sm font-black text-gray-900 dark:text-white">
                    {effectiveActiveTopic.title} — Kazanım Pekiştirme Soruları
                  </h4>
                  <p className="text-[11px] text-gray-400">
                    Çoktan seçmeli, doğru-yanlış ve kavram tamamlama türlerinde karma MEB soruları.
                  </p>
                </div>
                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                  {Object.keys(quizAnswers).length} / {currentQuizQuestions.length} Yanıtlandı
                </span>
              </div>

              <div className="space-y-5">
                {currentQuizQuestions.map((q, idx) => {
                  const isAnswered = !!quizAnswers[q.id]
                  const isCorrect = quizAnswers[q.id] === q.correct

                  return (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/70 dark:border-gray-800/70 space-y-3.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-cyan-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/50 dark:border-cyan-800/50">
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

                      <div className="text-xs lg:text-sm font-bold text-gray-900 dark:text-white leading-relaxed">
                        {q.question}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt) => {
                          const isSelected = quizAnswers[q.id] === opt.key
                          let optionClass =
                            'bg-white dark:bg-[#0E1526] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-cyan-500/60'

                          if (quizSubmitted) {
                            if (opt.key === q.correct) {
                              optionClass =
                                'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-black ring-1 ring-emerald-500/40'
                            } else if (isSelected && opt.key !== q.correct) {
                              optionClass =
                                'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-800 dark:text-rose-200 line-through'
                            } else {
                              optionClass = 'bg-white/50 dark:bg-[#0E1526]/50 border-gray-200 dark:border-gray-800 text-gray-400'
                            }
                          } else if (isSelected) {
                            optionClass =
                              'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500 text-cyan-800 dark:text-cyan-200 font-bold ring-2 ring-cyan-500/30'
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
                              <span className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 font-black text-[11px] flex items-center justify-center shrink-0">
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
                        <div className="p-3 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200/50 dark:border-cyan-800/50 text-[11px] text-cyan-900 dark:text-cyan-200 flex items-start gap-2">
                          <Sparkles size={14} className="text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
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
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-gray-500">
                  Toplam {currentQuizQuestions.length} sorudan {Object.keys(quizAnswers).length} tanesini işaretlediniz.
                </div>

                <div className="flex items-center gap-2">
                  {!quizSubmitted ? (
                    <button
                      type="button"
                      onClick={handleCompleteQuiz}
                      className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs shadow-md transition-colors cursor-pointer flex items-center gap-2"
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
                      <span>Grafiksel Sonuç Kartını Aç</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 2: GEÇMİŞ TESTLER & DENEMELER */}
          {quizSubTab === 'history' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-gray-900 dark:text-white">
                    {course.name} Çözülen Deneme & Test Geçmişi
                  </h4>
                  <p className="text-[11px] text-gray-400">
                    Öğrencinin tamamladığı testler, doğru-yanlış grafikleri ve başarı oranları.
                  </p>
                </div>
                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                  {pastQuizzes.length} Test Çözüldü
                </span>
              </div>

              {pastQuizzes.length === 0 ? (
                <div className="p-10 text-center text-xs text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl space-y-2">
                  <Sparkles size={24} className="mx-auto text-gray-300 dark:text-gray-600" />
                  <p>Bu ders için henüz tamamlanmış bir deneme veya günlük test kaydı bulunmuyor.</p>
                  <button
                    type="button"
                    onClick={() => setQuizSubTab('current')}
                    className="px-4 py-1.5 rounded-xl bg-cyan-600 text-white text-xs font-bold inline-flex items-center gap-1.5 mt-2 cursor-pointer"
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
                      className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Circular Score Ring */}
                        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-gray-200 dark:text-gray-700"
                              strokeWidth="3.5"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-cyan-500"
                              strokeDasharray={`${pq.percentage || 0}, 100`}
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <span className="absolute text-[11px] font-black text-gray-900 dark:text-white">
                            %{pq.percentage}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {pq.topicTitle}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-2">
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
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0E1526] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-cyan-600 transition-colors cursor-pointer"
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
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="w-full max-w-lg bg-white dark:bg-[#0E1526] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 lg:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <Trophy size={20} className="text-amber-500" />
                    <h3 className="text-base font-black text-gray-900 dark:text-white">
                      Test Değerlendirme & Başarı Raporu
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowResultModal(false)}
                    className="w-8 h-8 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="text-center space-y-3">
                  <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-100 dark:text-gray-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-cyan-500"
                        strokeDasharray={`${lastQuizStats.percentage}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <div className="text-2xl font-black text-gray-900 dark:text-white">
                        %{lastQuizStats.percentage}
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Başarı
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                      {lastQuizStats.topicTitle}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#131C31] text-center space-y-1">
                    <span className="text-[10px] font-bold text-gray-400">Toplam</span>
                    <div className="text-base font-black text-gray-900 dark:text-white">
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
                    className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-xs font-bold text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                  >
                    Tekrar Çöz
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResultModal(false)}
                    className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black transition-colors shadow-xs cursor-pointer"
                  >
                    Kapat & İncele
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 6: NOTLARIM (KİTAP NOTLARI & DEFTERİM ENTEGRASYONU) ── */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                  {course.name} Ders Notlarım ve Kitap İçi Kayıtlarım
                </h2>
                <p className="text-xs text-gray-400">
                  Bu ders kapsamında aldığınız notlar ve e-kitap okuyucuda kaydettiğiniz sayfa notları burada toplanır.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowNoteForm(!showNoteForm)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Plus size={15} />
                <span>Yeni Not Ekle</span>
              </button>
            </div>

            {/* Note Creation Form */}
            {showNoteForm && (
              <form onSubmit={handleCreateNote} className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 space-y-3">
                <input
                  type="text"
                  placeholder="Not Başlığı (Örn: Ritmik Sayma Kuralları Notum)"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#0E1526] border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden"
                />
                <textarea
                  rows={3}
                  placeholder="Not içeriğinizi buraya yazın..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white dark:bg-[#0E1526] border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNoteForm(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-500 cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-cyan-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Kaydet
                  </button>
                </div>
              </form>
            )}

            {/* Notes List */}
            <div className="space-y-3">
              {courseNotes.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                  Bu ders için henüz bir not almadınız. Yukarıdaki "Yeni Not Ekle" butonuna basarak veya e-kitap okuyucuda sayfaya not ekleyerek buraya kaydedebilirsiniz.
                </div>
              ) : (
                courseNotes.map((note) => {
                  const isBookNote = !!note.bookId
                  return (
                    <div
                      key={note.id}
                      className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isBookNote ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                              <BookOpen size={11} />
                              Kitap Notu · Sayfa {note.pageNumber}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                              Ders Notu
                            </span>
                          )}
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                            {note.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-gray-400">{note.date}</span>
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

                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>

                      {isBookNote && (
                        <div className="pt-2 flex items-center justify-between border-t border-gray-200/40 dark:border-gray-800/40">
                          <span className="text-[10px] text-gray-400 italic">
                            Kaynak: {note.bookTitle}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenBookAtPage(note.bookId, note.pageNumber)}
                            className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
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
