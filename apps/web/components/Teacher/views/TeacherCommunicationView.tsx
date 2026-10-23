'use client'

import React, { useState, useEffect } from 'react'
import {
  Megaphone,
  Send,
  MessageSquare,
  Users,
  CheckCircle2,
  Clock,
  Pin,
  Sparkles,
  Search,
  Plus,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  resolveAnnouncementVariables,
  saveSynchronizedStudentAnnouncement,
} from '@/lib/student/studentData'

interface TeacherAnnouncement {
  id: string
  title: string
  content: string
  author: string
  authorRole: string
  date: string
  priority?: 'low' | 'normal' | 'important' | 'emergency'
  isPinned?: boolean
}

const DEFAULT_TEACHER_ANNOUNCEMENTS: TeacherAnnouncement[] = [
  {
    id: 'ann-t-1',
    title: 'Öğretmenler Kurulu ve 1. Dönem Zümre Değerlendirmesi',
    content:
      'Değerli Öğretmenlerimiz; Ara sınav öncesi soru hazırlama ve kazanım değerlendirme toplantısı yarın saat 16:30\'da Öğretmenler Odasında yapılacaktır. Taslak kazanım formlarıyla katılım rica olunur.',
    author: 'Kemal SOYSAL',
    authorRole: 'Okul Müdürü',
    date: 'Bugün, 09:30',
    priority: 'important',
    isPinned: true,
  },
  {
    id: 'ann-t-2',
    title: '1/A Şubesi Dönem Ortası Akademik Başarı ve Uyum Tebrik Bildirimi',
    content:
      '1/A şubemiz Türkçe, Matematik ve Hayat Bilgisi derslerindeki üstün performansıyla okulumuzun birinci şubesi olarak devam etmektedir. Sınıf öğretmenimiz Özlem Hanımı tebrik eder, başarılarının devamını dilerim.',
    author: 'Kemal SOYSAL',
    authorRole: 'Okul Müdürü',
    date: 'Dün, 14:20',
    priority: 'normal',
    isPinned: false,
  },
  {
    id: 'ann-t-3',
    title: 'MEB Yeni Maarif Modeli Dijital Föyleri ve Akıllı Tahta Güncellemesi',
    content:
      'Dersliklerimizde bulunan akıllı tahtalar ve mobil uygulamaya yeni çalışma föyleri ve ders kitapları yüklenmiştir. Derslerinizde kullanabilirsiniz.',
    author: 'Oxonom Bilim Koordinatörlüğü',
    authorRole: 'Akademik Koordinatörlük',
    date: '11 Ekim 2026',
    priority: 'normal',
    isPinned: false,
  },
]

export default function TeacherCommunicationView() {
  const [announcements, setAnnouncements] = useState<TeacherAnnouncement[]>(DEFAULT_TEACHER_ANNOUNCEMENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')

  const syncTeacherAnnouncements = () => {
    try {
      const raw = localStorage.getItem('oxonom_teacher_announcements')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const resolved = parsed.map((item: any) => ({
            ...item,
            title: resolveAnnouncementVariables(item.title || ''),
            content: resolveAnnouncementVariables(item.content || ''),
          }))
          setAnnouncements(resolved)
          return
        }
      }
    } catch (_) {}
    setAnnouncements(DEFAULT_TEACHER_ANNOUNCEMENTS)
  }

  useEffect(() => {
    syncTeacherAnnouncements()
    window.addEventListener('oxonom_teacher_announcements_updated', syncTeacherAnnouncements)
    window.addEventListener('storage', syncTeacherAnnouncements)
    return () => {
      window.removeEventListener('oxonom_teacher_announcements_updated', syncTeacherAnnouncements)
      window.removeEventListener('storage', syncTeacherAnnouncements)
    }
  }, [])

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim() || !formContent.trim()) {
      toast.error('Lütfen başlık ve metin giriniz.')
      return
    }

    const resolvedTitle = resolveAnnouncementVariables(formTitle.trim())
    const resolvedContent = resolveAnnouncementVariables(formContent.trim())

    const newAnn: TeacherAnnouncement = {
      id: `ann-t-${Date.now()}`,
      title: resolvedTitle,
      content: resolvedContent,
      author: 'Bahar ÇETİN',
      authorRole: '1/A Sınıf Öğretmeni',
      date: 'Bugün, ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      priority: 'normal',
      isPinned: false,
    }

    const updated = [newAnn, ...announcements]
    setAnnouncements(updated)
    try {
      localStorage.setItem('oxonom_teacher_announcements', JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('oxonom_teacher_announcements_updated'))
    } catch (_) {}

    // Also sync to Student Portal
    try {
      saveSynchronizedStudentAnnouncement({
        id: `ann-s-${Date.now()}`,
        title: resolvedTitle,
        author: 'Bahar ÇETİN',
        authorRole: '1/A Sınıf Öğretmeni',
        date: 'Bugün, ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        category: 'general',
        priority: 'normal',
        content: resolvedContent,
        isPinned: false,
      })
    } catch (_) {}

    toast.success('Duyurunuz başarıyla yayınlandı!')
    setFormTitle('')
    setFormContent('')
    setShowNewModal(false)
  }

  const filtered = announcements.filter((a) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q) || a.author.toLowerCase().includes(q)
  })

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-jakarta">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black mb-2">
            <Users size={14} />
            <span>Öğretmen İletişim & Duyuru Merkezi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Okul İçi Duyurular & Bilgilendirmeler
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Okul müdürlüğünden gelen idari duyurular, zümre kararları ve sınıf içi bilgilendirmeler.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-gradient hover:opacity-95 text-white font-bold text-xs shadow-md shadow-purple-950/20 transition-all cursor-pointer self-start sm:self-center"
        >
          <Plus size={16} />
          <span>Sınıfa Duyuru Yayınla</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Duyurularda ara..."
          className="w-full h-10 pl-9 pr-3 rounded-2xl bg-white dark:bg-[#0E1526] border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filtered.map((ann) => {
          let priorityBadge = null
          if (ann.priority === 'emergency') {
            priorityBadge = (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                🚨 Acil / Kritik
              </span>
            )
          } else if (ann.priority === 'important') {
            priorityBadge = (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                ⚠️ Önemli
              </span>
            )
          } else if (ann.priority === 'normal') {
            priorityBadge = (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                ✓ Normal
              </span>
            )
          } else {
            priorityBadge = (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                ℹ️ Bilgi
              </span>
            )
          }

          return (
            <div
              key={ann.id}
              className={`p-6 rounded-3xl bg-white dark:bg-[#0E1526] border transition-all shadow-xs space-y-3 ${
                ann.isPinned
                  ? 'border-emerald-500/40 ring-1 ring-emerald-500/20'
                  : 'border-gray-200/80 dark:border-gray-800/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    {ann.author.slice(0, 1)}
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-gray-900 dark:text-white">
                      {ann.author}
                    </div>
                    <div className="text-[10px] text-gray-400">{ann.authorRole}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {priorityBadge}
                  {ann.isPinned && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Pin size={10} />
                      Sabitli
                    </span>
                  )}
                  <span className="text-[11px] text-gray-400">{ann.date}</span>
                </div>
              </div>

              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                {resolveAnnouncementVariables(ann.title)}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {resolveAnnouncementVariables(ann.content)}
              </p>
            </div>
          )
        })}
      </div>

      {/* Modal for Teacher to create Classroom Announcement */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#0E1526] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-black text-gray-900 dark:text-white">
              1/A Sınıfına Yeni Duyuru Yayınla
            </h3>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Duyuru Başlığı:
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Örn: Yarınki Matematik Etkinliği Hakkında"
                  className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Duyuru Metni:
                </label>
                <textarea
                  rows={4}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Duyuru içeriğini yazın..."
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 font-bold cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4B075F] hover:bg-[#620B79] text-white font-bold cursor-pointer transition-colors shadow-xs shadow-purple-950/20"
                >
                  Yayınla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
