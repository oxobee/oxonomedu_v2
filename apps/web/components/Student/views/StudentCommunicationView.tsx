'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  MessageSquare,
  Megaphone,
  Bell,
  User,
  Send,
  Calendar,
  CheckCircle2,
  Clock,
  Pin,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import {
  STUDENT_ANNOUNCEMENTS,
  getSynchronizedStudentAnnouncements,
  resolveAnnouncementVariables,
  type StudentAnnouncement,
} from '@/lib/student/studentData'
import toast from 'react-hot-toast'
import MockBadge from '@components/Common/MockBadge'

interface StudentCommunicationViewProps {
  initialTab?: 'all' | 'announcements' | 'messages' | 'notifications'
}

interface TeacherMessage {
  id: string
  sender: string
  senderRole: string
  date: string
  subject: string
  content: string
  isRead: boolean
}

const INITIAL_MESSAGES: TeacherMessage[] = [
  {
    id: 'msg-1',
    sender: 'Ebru TEKNECİ',
    senderRole: '9-A Rehber Öğretmeni & Edebiyat',
    date: 'Bugün, 11:20',
    subject: 'Şiir Tahlilleri Ödevi ve Geri Bildirim',
    content:
      'Sevgili Erçil, yüklediğin şiir tahlili çalışmanı detaylıca inceledim. Beyit açıklamaların ve edebi sanatlar analizin harika seviyede. Tebrik ederim, tam puanını sisteme girdim.',
    isRead: false,
  },
  {
    id: 'msg-2',
    sender: 'Dr. Uğur UĞURLU',
    senderRole: 'Okul Müdürü',
    date: 'Dün, 16:45',
    subject: 'Oxonom Bilim Şenliği Proje Koordinasyonu',
    content:
      'Erçil merhaba, bu dönem Bilişim ve Kodlama zümresi ile hazırlayacağınız akıllı okul yazılım projesi için bilim şenliği takvimimiz belirlendi. Danışman öğretmenin Ebru Hanım ile birlikte projeyi şekillendirebilirsiniz.',
    isRead: true,
  },
]

export default function StudentCommunicationView({
  initialTab = 'all',
}: StudentCommunicationViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'announcements' | 'messages' | 'notifications'>(initialTab)
  const [announcements, setAnnouncements] = useState<StudentAnnouncement[]>(STUDENT_ANNOUNCEMENTS)
  const [messages, setMessages] = useState<TeacherMessage[]>(INITIAL_MESSAGES)
  const [selectedMessage, setSelectedMessage] = useState<TeacherMessage | null>(null)
  const [replyText, setReplyText] = useState('')

  const syncAnnouncements = () => {
    try {
      setAnnouncements(getSynchronizedStudentAnnouncements())
    } catch (_) {}
  }

  React.useEffect(() => {
    syncAnnouncements()
    window.addEventListener('oxonom_student_announcements_updated', syncAnnouncements)
    window.addEventListener('oxonom_student_updated', syncAnnouncements)
    window.addEventListener('storage', syncAnnouncements)
    return () => {
      window.removeEventListener('oxonom_student_announcements_updated', syncAnnouncements)
      window.removeEventListener('oxonom_student_updated', syncAnnouncements)
      window.removeEventListener('storage', syncAnnouncements)
    }
  }, [])

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim()) return
    toast.success('Mesajınız ders öğretmeninize başarıyla iletildi.')
    setReplyText('')
  }

  const unreadCount = messages.filter((m) => !m.isRead).length

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold mb-2">
            <MessageSquare size={14} />
            <span>Okul İletişim Merkezi</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Mesajlar ve Duyurular
            </h1>
            <MockBadge label="Canlı Senkronize" />
          </div>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Resmi okul duyuruları, öğretmen mesajları ve akademik bilgilendirmeler.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-gray-100 dark:bg-[#131C31] border border-gray-200/80 dark:border-gray-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white dark:bg-[#0E1526] text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Tümü
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('announcements')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'announcements'
                ? 'bg-white dark:bg-[#0E1526] text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Duyurular ({announcements.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('messages')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'messages'
                ? 'bg-white dark:bg-[#0E1526] text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Öğretmen Mesajları {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Duyurular */}
        {(activeTab === 'all' || activeTab === 'announcements') && (
          <div className={`${activeTab === 'announcements' ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-4`}>
            <div className="flex items-center gap-2 text-base font-extrabold text-gray-900 dark:text-white">
              <Megaphone size={18} className="text-blue-500" />
              <h2>Okul ve Sınıf Duyuruları</h2>
            </div>

            <div className="space-y-4">
              {announcements.map((ann, idx) => {
                let priorityBadge = null
                const p = ann?.priority || 'normal'
                if (p === 'emergency') {
                  priorityBadge = (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                      🚨 Acil / Kritik
                    </span>
                  )
                } else if (p === 'important') {
                  priorityBadge = (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      ⚠️ Önemli
                    </span>
                  )
                } else if (p === 'normal') {
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

                const authorName = String(ann?.author || 'Oxonom Okulları')
                const authorInitial = authorName.charAt(0).toUpperCase() || 'O'
                const authorRole = String(ann?.authorRole || 'Okul Yönetimi')
                const annDate = String(ann?.date || 'Bugün')
                const cardId = ann?.id || `ann-item-${idx}`

                return (
                  <div
                    key={cardId}
                    className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {authorInitial}
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-gray-900 dark:text-white">
                            {authorName}
                          </div>
                          <div className="text-[10px] text-gray-400">{authorRole}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {priorityBadge}
                        {ann?.isPinned && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <Pin size={10} />
                            Sabitli
                          </span>
                        )}
                        <span className="text-[11px] text-gray-400">{annDate}</span>
                      </div>
                    </div>

                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                      {resolveAnnouncementVariables(ann?.title || '')}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {resolveAnnouncementVariables(ann?.content || '')}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* RIGHT COLUMN: Öğretmen Mesajları */}
        {(activeTab === 'all' || activeTab === 'messages') && (
          <div className={`${activeTab === 'messages' ? 'lg:col-span-3' : 'lg:col-span-1'} space-y-4`}>
            <div className="flex items-center gap-2 text-base font-extrabold text-gray-900 dark:text-white">
              <MessageSquare size={18} className="text-cyan-500" />
              <h2>Öğretmen Mesajları</h2>
            </div>

            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg)
                    setMessages((prev) =>
                      prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m))
                    )
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedMessage?.id === msg.id
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400/50'
                      : !msg.isRead
                      ? 'bg-white dark:bg-[#0E1526] border-blue-500/30 shadow-xs'
                      : 'bg-white dark:bg-[#0E1526] border-gray-200/80 dark:border-gray-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                    <span className="font-bold text-blue-600 dark:text-blue-400">{msg.sender}</span>
                    <span>{msg.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                    {msg.subject}
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick reply modal or inline box */}
            {selectedMessage && (
              <form
                onSubmit={handleSendReply}
                className="p-4 rounded-2xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-3 mt-4"
              >
                <div className="text-xs font-bold text-gray-900 dark:text-white">
                  {selectedMessage.sender} İçin Yanıt Yaz:
                </div>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Hocam, teşekkür ederim..."
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send size={13} />
                  <span>Mesajı İlet</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
