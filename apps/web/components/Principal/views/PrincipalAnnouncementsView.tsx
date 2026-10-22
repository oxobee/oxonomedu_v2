'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Megaphone,
  Send,
  MessageSquare,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
  Plus,
  Trash2,
  Pin,
  FileText,
  AlertTriangle,
  Smartphone,
  ShieldCheck,
  Check,
  X,
  Tv,
  GraduationCap,
  Calendar,
  Building2,
  RefreshCw,
  Copy,
  ChevronRight,
  ExternalLink,
  Volume2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getStoredPrincipalProfile } from '@/lib/principal/principalProfileStorage'
import {
  saveSynchronizedStudentAnnouncement,
  resolveAnnouncementVariables,
  type StudentAnnouncement,
} from '@/lib/student/studentData'

export type AnnouncementPriority = 'low' | 'normal' | 'important' | 'emergency'

export interface TargetChannels {
  student: boolean
  teacher: boolean
  parent: boolean
  board: boolean
}

export interface AnnouncementItem {
  id: string
  title: string
  content: string
  author: string
  authorRole: string
  targetChannels: TargetChannels
  priority: AnnouncementPriority
  audienceLabel: string
  category: 'academic' | 'meeting' | 'administrative' | 'event' | 'emergency'
  categoryLabel: string
  date: string
  createdAt: number
  isPinned: boolean
  displayOnBoards: boolean
  smsSent: boolean
}

export interface SmsLogItem {
  id: string
  title: string
  message: string
  recipientGroup: string
  recipientCount: number
  status: 'delivered' | 'processing' | 'failed'
  sentAt: string
  costCredits: number
  senderHeader: string
}

// Web Audio API Synth Chime Bell
export function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    // Tone 1: C5 (523.25 Hz)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(523.25, now)
    gain1.gain.setValueAtTime(0.18, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.6)

    // Tone 2: G5 (783.99 Hz)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(783.99, now + 0.12)
    gain2.gain.setValueAtTime(0.22, now + 0.12)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.12)
    osc2.stop(now + 0.9)
  } catch (_) {}
}

// Dynamic Template Variable Replacer (delegating to unified resolver)
export function resolveTemplateTags(text: string, overrides?: any): string {
  return resolveAnnouncementVariables(text, overrides)
}

// MEB-Compliant SMS & Announcement Templates
export const MEB_SMS_TEMPLATES = [
  {
    id: 'tpl-1',
    title: 'Akademik Başarı & Sınıf Tebriği',
    category: 'Akademik',
    priority: 'important' as AnnouncementPriority,
    targetChannels: { student: true, teacher: true, parent: true, board: true },
    text: '{okul_adi} bünyesinde {sinif} şubemiz ve öğrencimiz {ogrenci_adi}, üstün gayret ve başarılarıyla tebrik edilmiştir. Sınıf öğretmenimiz {ogretmen_adi}\'a ve velimize teşekkür ederiz.',
  },
  {
    id: 'tpl-2',
    title: 'Veli Toplantısı Davetiyesi',
    category: 'Veli İletişimi',
    priority: 'important' as AnnouncementPriority,
    targetChannels: { student: false, teacher: true, parent: true, board: false },
    text: 'Sayın Velimiz; {sinif} şubesi 1. Dönem Veli-Öğretmen Toplantısı {tarih} günü saat {saat}\'te {okul_adi} yerleşkemizde yapılacaktır. Katılımınızı önemle rica ederiz.',
  },
  {
    id: 'tpl-3',
    title: 'Günlük Devamsızlık & Yoklama Bildirimi',
    category: 'Devamsızlık',
    priority: 'normal' as AnnouncementPriority,
    targetChannels: { student: false, teacher: false, parent: true, board: false },
    text: 'Sayın Velimiz; {ogrenci_adi} isimli öğrencimiz {tarih} tarihinde okul yoklamasında izin bildirilmeden derse katılamamıştır. Bilgilerinize rica olunur. {okul_adi} Müdürlüğü',
  },
  {
    id: 'tpl-4',
    title: 'Yeni Müfredat Föyleri ve Akıllı Tahta İçerikleri',
    category: 'Müfredat',
    priority: 'normal' as AnnouncementPriority,
    targetChannels: { student: true, teacher: true, parent: false, board: true },
    text: 'Değerli Öğretmenlerimiz ve Öğrencilerimiz; MEB Türkiye Yüzyılı Maarif Modeli ile uyumlu yeni dijital çalışma föyleri ve ders kitapları panellerinize yüklenmiştir.',
  },
  {
    id: 'tpl-5',
    title: 'Öğretmenler Kurulu ve Zümre Toplantısı',
    category: 'İdari',
    priority: 'normal' as AnnouncementPriority,
    targetChannels: { student: false, teacher: true, parent: false, board: false },
    text: 'Değerli Öğretmenlerimiz; {sinif} ve diğer şubelerin haftalık kazanım ilerlemesi {tarih} günü saat {saat}\'te Öğretmenler Odasında değerlendirilecektir. Zümre taslaklarıyla katılımınız rica olunur.',
  },
  {
    id: 'tpl-6',
    title: 'Olumsuz Hava Koşulları & Valilik Tatil Bildirisi',
    category: 'Acil Durum',
    priority: 'emergency' as AnnouncementPriority,
    targetChannels: { student: true, teacher: true, parent: true, board: true },
    text: 'Sayın Velilerimiz ve Öğrencilerimiz; Valilik kararıyla olumsuz hava şartları nedeniyle {tarih} tarihinde okulumuzda eğitime 1 gün ara verilmiştir. {okul_adi} Müdürlüğü',
  },
]

const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-p-1',
    title: '1/A Şubesi Dönem Ortası Akademik Başarı ve Uyum Tebrik Bildirimi',
    content:
      '1/A şubemiz Türkçe, Matematik ve Hayat Bilgisi derslerindeki üstün performansıyla okulumuzun birinci şubesi olarak devam etmektedir. Sevgili öğrencimiz Erçil ve sınıf öğretmenimiz Özlem Hanımı tebrik eder, başarılarının devamını dilerim.',
    author: 'Dr. Uğur UĞURLU',
    authorRole: 'Okul Müdürü',
    targetChannels: { student: true, teacher: true, parent: true, board: true },
    priority: 'important',
    audienceLabel: 'Tüm Okul & Veliler',
    category: 'academic',
    categoryLabel: 'Akademik Başarı',
    date: 'Bugün, 09:30',
    createdAt: Date.now() - 3600000,
    isPinned: true,
    displayOnBoards: true,
    smsSent: true,
  },
  {
    id: 'ann-p-2',
    title: '2026-2027 Eğitim Öğretim Yılı 1. Dönem Veli Toplantısı',
    content:
      'Değerli Velilerimiz; 1. Dönem Veli-Öğretmen Değerlendirme Toplantısı 25 Ekim 2026 Cumartesi günü saat 13:00\'te okulumuz konferans salonunda gerçekleştirilecektir. Katılımınızı önemle rica ederiz.',
    author: 'Dr. Uğur UĞURLU',
    authorRole: 'Okul Müdürü',
    targetChannels: { student: false, teacher: true, parent: true, board: false },
    priority: 'important',
    audienceLabel: 'Tüm Sınıf Velileri',
    category: 'meeting',
    categoryLabel: 'Veli Toplantısı',
    date: '14 Ekim 2026, 11:00',
    createdAt: Date.now() - 86400000,
    isPinned: true,
    displayOnBoards: true,
    smsSent: true,
  },
  {
    id: 'ann-p-3',
    title: 'Öğretmenler Kurulu ve Zümre Başkanları Toplantısı',
    content:
      'Değerli Öğretmenlerimiz; Ara sınav öncesi soru hazırlama ve kazanım değerlendirme toplantısı yarın saat 16:30\'da Öğretmenler Odasında yapılacaktır. Taslak kazanım formlarıyla katılım rica olunur.',
    author: 'Dr. Uğur UĞURLU',
    authorRole: 'Okul Müdürü',
    targetChannels: { student: false, teacher: true, parent: false, board: false },
    priority: 'normal',
    audienceLabel: 'Öğretmenler & Kadro',
    category: 'administrative',
    categoryLabel: 'İdari & Kadro',
    date: '12 Ekim 2026, 14:20',
    createdAt: Date.now() - 172800000,
    isPinned: false,
    displayOnBoards: false,
    smsSent: false,
  },
  {
    id: 'ann-p-4',
    title: 'Akıllı Tahta ve Dijital Kütüphane 1. Sınıf Yeni Föyleri Eklendi',
    content:
      'Dersliklerimizde bulunan akıllı tahtalar ve öğrenci mobil uygulaması ile senkron çalışan yeni MEB uyumlu dijital çalışma föyleri ve ritmik sayma etkinlikleri kütüphaneye eklenmiştir.',
    author: 'Özlem ZOR',
    authorRole: '1/A Sınıf Öğretmeni',
    targetChannels: { student: true, teacher: true, parent: false, board: true },
    priority: 'normal',
    audienceLabel: '1/A Şubesi & Öğrenciler',
    category: 'academic',
    categoryLabel: 'Müfredat & Kitaplık',
    date: '11 Ekim 2026, 10:15',
    createdAt: Date.now() - 259200000,
    isPinned: false,
    displayOnBoards: true,
    smsSent: false,
  },
]

const INITIAL_SMS_LOGS: SmsLogItem[] = [
  {
    id: 'sms-log-1',
    title: 'Veli Toplantısı Daveti',
    message:
      'Sayin Velimiz; 1. Donem Veli Toplantisi 25 Ekim Cumartesi 13:00\'te okulumuzda yapilacaktir. Katiliminizi rica ederiz. Oxonom Okullari Mudurlugu',
    recipientGroup: 'Tüm Okul Velileri (124 Veli)',
    recipientCount: 124,
    status: 'delivered',
    sentAt: '14 Ekim 2026, 11:05',
    costCredits: 124,
    senderHeader: 'OXONOM-EDU',
  },
  {
    id: 'sms-log-2',
    title: '1/A Şubesi Başarı Tebriği',
    message:
      'Sayin Velimiz; 1-A subemiz aylik akademik basarisiyla okulumuz birincisi olmustur. Tebrik eder basarilar dileriz. Oxonom Okullari',
    recipientGroup: '1/A Şubesi Velileri (1 Veli)',
    recipientCount: 1,
    status: 'delivered',
    sentAt: '10 Ekim 2026, 10:00',
    costCredits: 1,
    senderHeader: 'OXONOM-EDU',
  },
]

export default function PrincipalAnnouncementsView() {
  const [activeTab, setActiveTab] = useState<'board' | 'sms_history' | 'templates'>('board')
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Principal profile identity
  const [principalName, setPrincipalName] = useState('Dr. Uğur UĞURLU')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const p = getStoredPrincipalProfile()
        if (p?.name) setPrincipalName(p.name)
      } catch (_) {}
    }
  }, [])

  // Announcements State
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oxonom_principal_announcements')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Cleanse stale references and resolve template variables
            return parsed.map((item: any) => {
              let updated = { ...item }
              if (updated.title && updated.title.includes('9-A')) {
                updated.title = updated.title.replace(/9-A/g, '1/A')
              }
              if (updated.content && updated.content.includes('9-A')) {
                updated.content = updated.content.replace(/9-A/g, '1/A')
              }
              if (updated.title) {
                updated.title = resolveAnnouncementVariables(updated.title)
              }
              if (updated.content) {
                updated.content = resolveAnnouncementVariables(updated.content)
              }
              if (!updated.priority) updated.priority = 'normal'
              if (!updated.targetChannels) {
                updated.targetChannels = { student: true, teacher: true, parent: false, board: true }
              }
              return updated
            })
          }
        }
      } catch (_) {}
    }
    return INITIAL_ANNOUNCEMENTS
  })

  // SMS Logs State
  const [smsLogs, setSmsLogs] = useState<SmsLogItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oxonom_principal_sms_logs')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      } catch (_) {}
    }
    return INITIAL_SMS_LOGS
  })

  // SMS Credit balance
  const [smsCredits, setSmsCredits] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oxonom_principal_sms_credits')
        if (saved) return parseInt(saved, 10)
      } catch (_) {}
    }
    return 8520
  })

  // Persist helpers
  const persistAnnouncements = (list: AnnouncementItem[]) => {
    setAnnouncements(list)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('oxonom_principal_announcements', JSON.stringify(list))
        localStorage.setItem('oxonom_school_announcements_index', JSON.stringify(list))
        window.dispatchEvent(new CustomEvent('oxonom_announcements_updated', { detail: list }))
      } catch (_) {}
    }
  }

  const persistSmsLogs = (logs: SmsLogItem[], newCredit: number) => {
    setSmsLogs(logs)
    setSmsCredits(newCredit)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('oxonom_principal_sms_logs', JSON.stringify(logs))
        localStorage.setItem('oxonom_principal_sms_credits', String(newCredit))
      } catch (_) {}
    }
  }

  // Modals state
  const [isNewAnnouncementModalOpen, setIsNewAnnouncementModalOpen] = useState(false)
  const [isNewSmsModalOpen, setIsNewSmsModalOpen] = useState(false)

  // New Announcement Form State
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formPriority, setFormPriority] = useState<AnnouncementPriority>('normal')
  const [formCategory, setFormCategory] = useState<'academic' | 'meeting' | 'administrative' | 'event' | 'emergency'>('academic')
  const [formIsPinned, setFormIsPinned] = useState(false)

  // Channels state
  const [targetStudent, setTargetStudent] = useState(true)
  const [targetTeacher, setTargetTeacher] = useState(true)
  const [targetParent, setTargetParent] = useState(false)
  const [targetBoard, setTargetBoard] = useState(false)

  // Direct SMS Form State
  const [smsTargetGroup, setSmsTargetGroup] = useState('Tüm Okul Velileri (124 Veli)')
  const [smsTitle, setSmsTitle] = useState('')
  const [smsMessage, setSmsMessage] = useState('')

  // Filtered Announcements
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      if (selectedPriorityFilter !== 'all' && item.priority !== selectedPriorityFilter) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          item.title.toLowerCase().includes(q) ||
          item.content.toLowerCase().includes(q) ||
          item.author.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [announcements, selectedPriorityFilter, searchQuery])

  // Create Announcement Handler
  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim() || !formContent.trim()) {
      toast.error('Lütfen duyuru başlığı ve metnini giriniz.')
      return
    }

    if (!targetStudent && !targetTeacher && !targetParent && !targetBoard) {
      toast.error('Lütfen en az bir gönderim paneli veya kanalı seçiniz.')
      return
    }

    // Play notification chime bell!
    playNotificationChime()

    const channels: TargetChannels = {
      student: targetStudent,
      teacher: targetTeacher,
      parent: targetParent,
      board: targetBoard,
    }

    const categoryLabels: Record<string, string> = {
      academic: 'Akademik Başarı',
      meeting: 'Veli Toplantısı',
      administrative: 'İdari & Kadro',
      event: 'Etkinlik & Fuar',
      emergency: 'Acil Durum Bildirisi',
    }

    const channelNames: string[] = []
    if (targetStudent) channelNames.push('Öğrenci Paneli')
    if (targetTeacher) channelNames.push('Öğretmen Paneli')
    if (targetParent) channelNames.push('Veli Paneli (SMS)')
    if (targetBoard) channelNames.push('Akıllı Tahta')

    const resolvedTitle = resolveAnnouncementVariables(formTitle.trim())
    const resolvedContent = resolveAnnouncementVariables(formContent.trim())

    const newAnn: AnnouncementItem = {
      id: `ann-p-${Date.now()}`,
      title: resolvedTitle,
      content: resolvedContent,
      author: principalName,
      authorRole: 'Okul Müdürü',
      targetChannels: channels,
      priority: formPriority,
      audienceLabel: channelNames.join(', '),
      category: formCategory,
      categoryLabel: categoryLabels[formCategory] || 'Genel',
      date: 'Bugün, ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now(),
      isPinned: formIsPinned,
      displayOnBoards: targetBoard,
      smsSent: targetParent,
    }

    const updated = [newAnn, ...announcements]
    persistAnnouncements(updated)

    // 1. Sync to Student Portal if targetStudent checked
    if (targetStudent) {
      const studentAnn: StudentAnnouncement = {
        id: `ann-s-${Date.now()}`,
        title: resolvedTitle,
        author: principalName,
        authorRole: 'Okul Müdürü',
        date: 'Bugün, ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        category: formCategory === 'emergency' ? 'emergency' : formCategory === 'academic' ? 'academic' : 'general',
        priority: formPriority,
        content: resolvedContent,
        isPinned: formIsPinned,
      }
      saveSynchronizedStudentAnnouncement(studentAnn)
    }

    // 2. Sync to Teacher Portal if targetTeacher checked
    if (targetTeacher) {
      try {
        const rawTeacher = localStorage.getItem('oxonom_teacher_announcements')
        const currentTeacherAnn = rawTeacher ? JSON.parse(rawTeacher) : []
        const newTeacherAnn = {
          id: `ann-t-${Date.now()}`,
          title: resolvedTitle,
          content: resolvedContent,
          author: principalName,
          authorRole: 'Okul Müdürü',
          date: 'Bugün, ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          priority: formPriority,
          isPinned: formIsPinned,
        }
        localStorage.setItem('oxonom_teacher_announcements', JSON.stringify([newTeacherAnn, ...currentTeacherAnn]))
        window.dispatchEvent(new CustomEvent('oxonom_teacher_announcements_updated'))
      } catch (_) {}
    }

    // 3. Log to SMS history if targetParent checked
    if (targetParent) {
      const recipientCount = 124
      const newSms: SmsLogItem = {
        id: `sms-log-${Date.now()}`,
        title: resolvedTitle,
        message: resolvedContent.substring(0, 155),
        recipientGroup: 'Veli Paneli (SMS Bildirimi)',
        recipientCount,
        status: 'delivered',
        sentAt: 'Bugün, ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        costCredits: recipientCount,
        senderHeader: 'OXONOM-EDU',
      }
      persistSmsLogs([newSms, ...smsLogs], Math.max(0, smsCredits - recipientCount))
    }

    toast.success('Duyuru yayınlandı ve ilgili panellere anında iletildi!')

    // Reset Form
    setFormTitle('')
    setFormContent('')
    setFormPriority('normal')
    setFormIsPinned(false)
    setTargetStudent(true)
    setTargetTeacher(true)
    setTargetParent(false)
    setTargetBoard(false)
    setIsNewAnnouncementModalOpen(false)
  }

  // Send Direct SMS Handler
  const handleSendDirectSms = (e: React.FormEvent) => {
    e.preventDefault()
    if (!smsTitle.trim() || !smsMessage.trim()) {
      toast.error('Lütfen SMS başlığı ve mesaj metnini yazınız.')
      return
    }

    playNotificationChime()

    let count = 124
    if (smsTargetGroup.includes('1/A')) count = 1
    if (smsTargetGroup.includes('Öğretmen')) count = 18
    if (smsTargetGroup.includes('Devamsız')) count = 4

    const resolvedSmsTitle = resolveAnnouncementVariables(smsTitle.trim())
    const resolvedSmsContent = resolveAnnouncementVariables(smsMessage.trim())

    const newLog: SmsLogItem = {
      id: `sms-log-${Date.now()}`,
      title: resolvedSmsTitle,
      message: resolvedSmsContent,
      recipientGroup: smsTargetGroup,
      recipientCount: count,
      status: 'delivered',
      sentAt: 'Bugün, ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      costCredits: count,
      senderHeader: 'OXONOM-EDU',
    }

    persistSmsLogs([newLog, ...smsLogs], Math.max(0, smsCredits - count))
    toast.success(`${count} alıcıya Toplu SMS başarıyla iletildi!`)

    setSmsTitle('')
    setSmsMessage('')
    setIsNewSmsModalOpen(false)
  }

  // Toggle Pin
  const handleTogglePin = (id: string) => {
    const updated = announcements.map((a) => (a.id === id ? { ...a, isPinned: !a.isPinned } : a))
    persistAnnouncements(updated)
    toast.success('Duyuru sabitleme durumu güncellendi.')
  }

  // Toggle Smartboard
  const handleToggleBoard = (id: string) => {
    const updated = announcements.map((a) =>
      a.id === id
        ? {
            ...a,
            displayOnBoards: !a.displayOnBoards,
            targetChannels: { ...a.targetChannels, board: !a.displayOnBoards },
          }
        : a
    )
    persistAnnouncements(updated)
    toast.success('Akıllı tahta görünürlüğü güncellendi.')
  }

  // Delete Announcement
  const handleDeleteAnnouncement = (id: string) => {
    if (confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) {
      const updated = announcements.filter((a) => a.id !== id)
      persistAnnouncements(updated)
      toast.success('Duyuru yayından kaldırıldı.')
    }
  }

  // Apply Template into Announcement Form
  const handleApplyTemplateToAnnouncement = (tpl: typeof MEB_SMS_TEMPLATES[0]) => {
    setFormTitle(tpl.title)
    setFormContent(tpl.text)
    setFormPriority(tpl.priority)
    setTargetStudent(tpl.targetChannels.student)
    setTargetTeacher(tpl.targetChannels.teacher)
    setTargetParent(tpl.targetChannels.parent)
    setTargetBoard(tpl.targetChannels.board)
    setIsNewAnnouncementModalOpen(true)
    toast.success(`"${tpl.title}" şablonu yüklendi!`)
  }

  // Apply Template to Direct SMS modal
  const handleApplyTemplateToSms = (tpl: typeof MEB_SMS_TEMPLATES[0]) => {
    setSmsTitle(tpl.title)
    setSmsMessage(resolveTemplateTags(tpl.text))
    setIsNewSmsModalOpen(true)
  }

  // Priority Badge Helper
  const renderPriorityBadge = (priority: AnnouncementPriority) => {
    switch (priority) {
      case 'emergency':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10.5px] font-black border border-rose-500/30">
            🚨 Acil / Kritik
          </span>
        )
      case 'important':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10.5px] font-black border border-amber-500/30">
            ⚠️ Önemli
          </span>
        )
      case 'normal':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10.5px] font-black border border-emerald-500/30">
            ✓ Standart
          </span>
        )
      case 'low':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10.5px] font-black border border-blue-500/30">
            ℹ️ Bilgi
          </span>
        )
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-jakarta">
      {/* ── 1. HEADER SECTION ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-xs font-black mb-2 border border-cyan-500/20">
            <Megaphone size={14} />
            <span>Okul Yönetim & İletişim Merkezi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Duyurular & İletişim Merkezi
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
            Öğrenci, öğretmen ve veli panellerine anlık duyuru yayınlama, renkli önem aşamaları, sesli bildirimler ve MEB SMS şablonları.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={playNotificationChime}
            title="Bildirim Zilini Test Et"
            className="w-10 h-10 rounded-2xl bg-white dark:bg-[#121826] border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:text-cyan-600 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
          >
            <Volume2 size={16} />
          </button>

          <button
            type="button"
            onClick={() => setIsNewSmsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#121826] hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200/90 dark:border-gray-800 text-gray-800 dark:text-gray-200 text-xs font-black shadow-xs cursor-pointer transition-all"
          >
            <Smartphone size={16} className="text-blue-500" />
            <span>Hızlı SMS</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewAnnouncementModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-cyan-500/20 cursor-pointer transition-all active:scale-98"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Yeni Duyuru Yayınla</span>
          </button>
        </div>
      </div>

      {/* ── 2. KPI İSTATİSTİK ŞERİDİ ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
            <Megaphone size={22} />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              {announcements.length}
            </div>
            <div className="text-xs font-semibold text-gray-400 mt-0.5">
              Yayındaki Duyurular
            </div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <GraduationCap size={22} />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              {announcements.filter((a) => a.targetChannels.student).length}
            </div>
            <div className="text-xs font-semibold text-gray-400 mt-0.5">
              Öğrenci Paneli İletisi
            </div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              {announcements.filter((a) => a.targetChannels.teacher).length}
            </div>
            <div className="text-xs font-semibold text-gray-400 mt-0.5">
              Öğretmen Paneli İletisi
            </div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Smartphone size={22} />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
              {smsCredits.toLocaleString('tr-TR')}
            </div>
            <div className="text-xs font-semibold text-gray-400 mt-0.5">
              SMS Kredisi
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. VIEW SWITCHER & SEARCH ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 rounded-2xl bg-gray-100 dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('board')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'board'
                ? 'bg-white dark:bg-[#1F2937] text-cyan-700 dark:text-cyan-300 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Megaphone size={14} />
            <span>Duyuru Panosu ({filteredAnnouncements.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'templates'
                ? 'bg-white dark:bg-[#1F2937] text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FileText size={14} />
            <span>MEB SMS & Duyuru Şablonları</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sms_history')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'sms_history'
                ? 'bg-white dark:bg-[#1F2937] text-blue-700 dark:text-blue-300 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Send size={14} />
            <span>SMS İletim Geçmişi ({smsLogs.length})</span>
          </button>
        </div>

        {/* Search */}
        {activeTab === 'board' && (
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Duyurularda ara..."
              className="w-full h-8 pl-8 pr-3 rounded-xl bg-white dark:bg-[#1A2234] border border-gray-200 dark:border-gray-700/80 text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        )}
      </div>

      {/* ── 4. DUYURU PANOSU TAB ── */}
      {activeTab === 'board' && (
        <div className="space-y-4">
          {/* Önem Aşaması Filtreleri */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
            <span className="font-bold text-gray-400 flex items-center gap-1 shrink-0 mr-1">
              <Filter size={13} />
              <span>Önem Derecesi:</span>
            </span>

            {[
              { id: 'all', label: 'Tümü' },
              { id: 'emergency', label: '🚨 Acil / Kritik' },
              { id: 'important', label: '⚠️ Önemli' },
              { id: 'normal', label: '✓ Standart' },
              { id: 'low', label: 'ℹ️ Bilgi' },
            ].map((chip) => {
              const isSelected = selectedPriorityFilter === chip.id
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setSelectedPriorityFilter(chip.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'bg-white dark:bg-[#121826] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {chip.label}
                </button>
              )
            })}
          </div>

          {/* Duyuru Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className={`p-5 rounded-3xl bg-white dark:bg-[#121826] border transition-all shadow-xs flex flex-col justify-between ${
                  ann.priority === 'emergency'
                    ? 'border-rose-400/60 dark:border-rose-500/40 bg-rose-50/10'
                    : ann.isPinned
                    ? 'border-cyan-500/40 dark:border-cyan-500/30 ring-1 ring-cyan-500/10'
                    : 'border-gray-200/90 dark:border-gray-800'
                }`}
              >
                <div className="space-y-3">
                  {/* Üst Satır: Önem Rozeti & Kanallar */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {renderPriorityBadge(ann.priority)}

                      {/* Channels badge */}
                      {ann.targetChannels.student && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200/40">
                          <GraduationCap size={11} />
                          <span>Öğrenci</span>
                        </span>
                      )}
                      {ann.targetChannels.teacher && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200/40">
                          <Users size={11} />
                          <span>Öğretmen</span>
                        </span>
                      )}
                      {ann.targetChannels.parent && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-200/40">
                          <Smartphone size={11} />
                          <span>Veli (SMS)</span>
                        </span>
                      )}
                      {ann.targetChannels.board && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold border border-cyan-200/40">
                          <Tv size={11} />
                          <span>Tahta</span>
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTogglePin(ann.id)}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        ann.isPinned
                          ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300'
                          : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      title={ann.isPinned ? 'Sabitlemeyi Kaldır' : 'Panoya Sabitle'}
                    >
                      <Pin size={13} className={ann.isPinned ? 'fill-current' : ''} />
                    </button>
                  </div>

                  {/* Başlık */}
                  <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white leading-snug">
                    {resolveAnnouncementVariables(ann.title)}
                  </h3>

                  {/* İçerik */}
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {resolveAnnouncementVariables(ann.content)}
                  </p>
                </div>

                {/* Alt Satır: Yazar, Tarih ve İşlem Butonları */}
                <div className="pt-3 mt-4 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {ann.author}
                    </span>
                    <span>·</span>
                    <span className="text-[11px] text-gray-400">{ann.date}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="w-7 h-7 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center cursor-pointer transition-colors"
                      title="Duyuruyu Sil"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredAnnouncements.length === 0 && (
              <div className="col-span-full p-8 text-center rounded-3xl bg-white dark:bg-[#121826] border border-gray-200 dark:border-gray-800 text-gray-400 space-y-2">
                <Megaphone size={32} className="mx-auto text-gray-400/60" />
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Bu önem seviyesinde duyuru bulunamadı.
                </p>
                <p className="text-xs text-gray-400">
                  Yeni bir duyuru ekleyebilir veya filtre seçimini değiştirebilirsiniz.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 5. MEB HAZIR ŞABLONLAR TAB ── */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-cyan-50/60 dark:bg-cyan-950/20 border border-cyan-200/60 dark:border-cyan-900/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <div className="font-black text-gray-900 dark:text-white">
                  Milli Eğitim Bakanlığı Standart Şablonları & Değişkenler
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  Antiparantez içindeki <code>{'{ogrenci_adi}'}</code>, <code>{'{sinif}'}</code>, <code>{'{veli_adi}'}</code> gibi değişkenler gönderim esnasında otomatik çözümlenir.
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MEB_SMS_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-[10.5px] font-black border border-cyan-200/40">
                      {tpl.category}
                    </span>
                    {renderPriorityBadge(tpl.priority)}
                  </div>

                  <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">
                    {tpl.title}
                  </h4>

                  <p className="text-xs text-gray-600 dark:text-gray-300 font-mono bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 mt-2 leading-relaxed">
                    {tpl.text}
                  </p>

                  <div className="mt-2 text-[11px] text-gray-400">
                    <strong>Canlı Örnek:</strong> {resolveTemplateTags(tpl.text)}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => handleApplyTemplateToAnnouncement(tpl)}
                    className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Megaphone size={12} />
                    <span>Duyuru Olarak Yayınla</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplateToSms(tpl)}
                    className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    title="SMS Olarak Gönder"
                  >
                    <Smartphone size={12} />
                    <span>SMS</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 6. SMS İLETİM GEÇMİŞİ TAB ── */}
      {activeTab === 'sms_history' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                <Smartphone size={20} />
              </div>
              <div>
                <div className="font-black text-gray-900 dark:text-white">
                  MEB Alfanumerik SMS Başlığı: <strong>OXONOM-EDU</strong>
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  Veli ve öğretmen telefon numaralarına gönderilen SMS raporları.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsNewSmsModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs cursor-pointer shadow-xs"
            >
              Hızlı SMS Gönder
            </button>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121826]">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 font-bold border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="p-3.5 pl-5">Gönderim Başlığı & Mesaj</th>
                  <th className="p-3.5">Hedef Kitle</th>
                  <th className="p-3.5">Alıcı</th>
                  <th className="p-3.5">Durum</th>
                  <th className="p-3.5">Tarih</th>
                  <th className="p-3.5 pr-5 text-right">Kredi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                {smsLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="p-3.5 pl-5 max-w-sm">
                      <div className="font-black text-gray-900 dark:text-white">{log.title}</div>
                      <div className="text-gray-500 truncate mt-0.5">{log.message}</div>
                    </td>
                    <td className="p-3.5 text-gray-700 dark:text-gray-300 font-bold">
                      {log.recipientGroup}
                    </td>
                    <td className="p-3.5 text-gray-700 dark:text-gray-300">
                      {log.recipientCount} Kişi
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-[11px] border border-emerald-500/20">
                        <CheckCircle2 size={12} />
                        <span>İletildi</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-400 whitespace-nowrap">{log.sentAt}</td>
                    <td className="p-3.5 pr-5 text-right font-black text-blue-600 dark:text-blue-400">
                      -{log.costCredits}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL 1: YENİ DUYURU YAYINLA ── */}
      <AnimatePresence>
        {isNewAnnouncementModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-jakarta">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewAnnouncementModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full sm:max-w-xl rounded-3xl bg-white dark:bg-[#121826] border border-gray-200 dark:border-gray-800 shadow-2xl p-5 sm:p-6 z-10 text-gray-900 dark:text-white space-y-4 max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <Megaphone size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black">Yeni Kurumsal Duyuru Yayınla</h3>
                    <p className="text-xs text-gray-400">Öğrenci, öğretmen ve veli panellerine anlık senkronizasyon</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNewAnnouncementModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-500 flex items-center justify-center cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs font-semibold">
                {/* 1. GÖNDERİM KANALLARI (CHECKBOXES) */}
                <div className="space-y-1.5">
                  <label className="block text-gray-700 dark:text-gray-300 font-black">
                    Duyuru Gönderme Seçenekleri (Kanallar):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <label
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        targetStudent
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-black ring-1 ring-indigo-500/30'
                          : 'bg-gray-50 dark:bg-[#131C31] border-gray-200 dark:border-gray-800 text-gray-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={targetStudent}
                        onChange={(e) => setTargetStudent(e.target.checked)}
                        className="hidden"
                      />
                      <GraduationCap size={18} />
                      <span className="text-[11px] text-center">Öğrenci Paneli</span>
                      {targetStudent && <Check size={12} className="text-indigo-600" />}
                    </label>

                    <label
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        targetTeacher
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-black ring-1 ring-emerald-500/30'
                          : 'bg-gray-50 dark:bg-[#131C31] border-gray-200 dark:border-gray-800 text-gray-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={targetTeacher}
                        onChange={(e) => setTargetTeacher(e.target.checked)}
                        className="hidden"
                      />
                      <Users size={18} />
                      <span className="text-[11px] text-center">Öğretmen Paneli</span>
                      {targetTeacher && <Check size={12} className="text-emerald-600" />}
                    </label>

                    <label
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        targetParent
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-700 dark:text-amber-300 font-black ring-1 ring-amber-500/30'
                          : 'bg-gray-50 dark:bg-[#131C31] border-gray-200 dark:border-gray-800 text-gray-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={targetParent}
                        onChange={(e) => setTargetParent(e.target.checked)}
                        className="hidden"
                      />
                      <Smartphone size={18} />
                      <span className="text-[11px] text-center">Veli Paneli (SMS)</span>
                      {targetParent && <Check size={12} className="text-amber-600" />}
                    </label>

                    <label
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        targetBoard
                          ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500 text-cyan-700 dark:text-cyan-300 font-black ring-1 ring-cyan-500/30'
                          : 'bg-gray-50 dark:bg-[#131C31] border-gray-200 dark:border-gray-800 text-gray-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={targetBoard}
                        onChange={(e) => setTargetBoard(e.target.checked)}
                        className="hidden"
                      />
                      <Tv size={18} />
                      <span className="text-[11px] text-center">Akıllı Tahtalar</span>
                      {targetBoard && <Check size={12} className="text-cyan-600" />}
                    </label>
                  </div>
                </div>

                {/* 2. DUYURU ÖNEM AŞAMALARI (RENKLİ) */}
                <div className="space-y-1.5">
                  <label className="block text-gray-700 dark:text-gray-300 font-black">
                    Duyuru Önem Aşaması:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { key: 'low' as const, label: 'ℹ️ Bilgi', style: 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' },
                      { key: 'normal' as const, label: '✓ Standart', style: 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
                      { key: 'important' as const, label: '⚠️ Önemli', style: 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
                      { key: 'emergency' as const, label: '🚨 Acil / Kritik', style: 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' },
                    ].map((p) => {
                      const isSelected = formPriority === p.key
                      return (
                        <button
                          key={p.key}
                          type="button"
                          onClick={() => setFormPriority(p.key)}
                          className={`py-2 px-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                            isSelected
                              ? `${p.style} ring-2 ring-offset-1 shadow-xs`
                              : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-500'
                          }`}
                        >
                          {p.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 3. BAŞLIK & KATEGORİ */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                      Duyuru Başlığı:
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Örn: 1. Dönem Veli-Öğretmen Buluşması"
                      className="w-full h-10 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                      Kategori:
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white"
                    >
                      <option value="academic">Akademik Başarı</option>
                      <option value="meeting">Veli Toplantısı</option>
                      <option value="administrative">İdari & Kadro</option>
                      <option value="event">Etkinlik & Bilim Fuarı</option>
                      <option value="emergency">Acil Durum & Tatil</option>
                    </select>
                  </div>
                </div>

                {/* 4. ANTİPARANTEZ DEĞİŞKEN CHİPLERİ */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-gray-700 dark:text-gray-300 font-bold">
                      Hızlı Değişken Ekle (MEB Standart):
                    </label>
                    <span className="text-[10px] text-gray-400">Tıklandığında metne ekler</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { tag: '{ogrenci_adi}', label: '{ogrenci_adi}' },
                      { tag: '{veli_adi}', label: '{veli_adi}' },
                      { tag: '{sinif}', label: '{sinif}' },
                      { tag: '{ogretmen_adi}', label: '{ogretmen_adi}' },
                      { tag: '{okul_adi}', label: '{okul_adi}' },
                      { tag: '{tarih}', label: '{tarih}' },
                      { tag: '{saat}', label: '{saat}' },
                    ].map((t) => (
                      <button
                        key={t.tag}
                        type="button"
                        onClick={() => setFormContent((prev) => (prev ? `${prev} ${t.tag}` : t.tag))}
                        className="px-2 py-0.5 rounded-lg bg-gray-100 hover:bg-cyan-50 hover:text-cyan-700 dark:bg-gray-800 dark:hover:bg-cyan-950/40 text-[10.5px] font-mono text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer"
                      >
                        + {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. METİN ALANI */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                    Duyuru Metni:
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Duyuru metnini yazınız..."
                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 leading-relaxed font-mono"
                  />
                </div>

                {/* CANLI ÖNİZLEME KUTUSU (ANTİPARANTEZLER ÇÖZÜMLENMİŞ HALİ) */}
                {formContent.includes('{') && (
                  <div className="p-3 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200/50 dark:border-cyan-800/50 text-[11px] text-cyan-950 dark:text-cyan-200 space-y-1">
                    <span className="font-black text-cyan-700 dark:text-cyan-300 flex items-center gap-1">
                      <Sparkles size={12} />
                      Canlı Çözümlenmiş Önizleme (Örnek Öğrenci: Erçil UĞURLU - 1/A):
                    </span>
                    <p className="whitespace-pre-wrap leading-relaxed italic">
                      "{resolveTemplateTags(formContent)}"
                    </p>
                  </div>
                )}

                {/* SABİTLEME */}
                <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={formIsPinned}
                    onChange={(e) => setFormIsPinned(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Duyuruyu panonun en üstüne sabitle
                  </span>
                </label>

                {/* MODAL ACTIONS */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewAnnouncementModalOpen(false)}
                    className="flex-1 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Vazgeç
                  </button>

                  <button
                    type="submit"
                    className="flex-1 h-11 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20 transition-all active:scale-98"
                  >
                    <Megaphone size={14} />
                    <span>Duyuruyu Yayınla</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: TOPLU SMS GÖNDER ── */}
      <AnimatePresence>
        {isNewSmsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-jakarta">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewSmsModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full sm:max-w-md rounded-3xl bg-white dark:bg-[#121826] border border-gray-200 dark:border-gray-800 shadow-2xl p-5 sm:p-6 z-10 text-gray-900 dark:text-white space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black">Toplu SMS Gönderimi</h3>
                    <p className="text-xs text-gray-400">MEB onaylı alfanumerik SMS başlığı</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNewSmsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-500 flex items-center justify-center cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSendDirectSms} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                    Alıcı Hedef Grubu:
                  </label>
                  <select
                    value={smsTargetGroup}
                    onChange={(e) => setSmsTargetGroup(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white"
                  >
                    <option value="Tüm Okul Velileri (124 Veli)">Tüm Okul Velileri (124 Veli)</option>
                    <option value="1/A Şubesi Velileri (1 Veli)">1/A Şubesi Velileri (1 Veli)</option>
                    <option value="Tüm Öğretmen Kadrosu (18 Öğretmen)">Tüm Öğretmen Kadrosu (18 Öğretmen)</option>
                    <option value="Bugün Devamsız Olan Öğrenci Velileri (4 Veli)">
                      Bugün Devamsız Olan Öğrenci Velileri (4 Veli)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                    SMS Başlığı (Kayıt İçin):
                  </label>
                  <input
                    type="text"
                    required
                    value={smsTitle}
                    onChange={(e) => setSmsTitle(e.target.value)}
                    placeholder="Örn: Veli Bilgilendirme SMS"
                    className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-gray-700 dark:text-gray-300 font-bold">
                      SMS Metni:
                    </label>
                    <span className="text-[11px] font-bold text-gray-400">
                      {smsMessage.length} / 160 Karakter ({Math.ceil(smsMessage.length / 160) || 1} SMS)
                    </span>
                  </div>
                  <textarea
                    required
                    rows={4}
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    placeholder="Gönderilecek SMS metnini giriniz..."
                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed font-mono"
                  />
                </div>

                {/* Sender ID info */}
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-gray-500 font-semibold">Gönderici Başlığı:</span>
                  <span className="font-black text-blue-600 dark:text-blue-400">OXONOM-EDU</span>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewSmsModalOpen(false)}
                    className="flex-1 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs cursor-pointer transition-colors"
                  >
                    İptal
                  </button>

                  <button
                    type="submit"
                    className="flex-1 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20 transition-all active:scale-98"
                  >
                    <Send size={14} />
                    <span>SMS Gönderimini Başlat</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
