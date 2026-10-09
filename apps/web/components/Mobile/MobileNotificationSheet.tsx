'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  CheckCheck,
  Clock,
  BookOpen,
  Tv,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  MessageSquare,
} from 'lucide-react'
import toast from 'react-hot-toast'

export interface NotificationItem {
  id: string
  title: string
  description: string
  time: string
  category: 'assignments' | 'boards' | 'announcements' | 'system'
  isRead: boolean
  actionUrl?: string
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Yeni Ödev Teslimi Yapıldı',
    description: 'Ahmet Yılmaz (1-A), "Okuma & Anlama ve Cümle Bilgisi" ödevini tamamlayıp teslim etti.',
    time: '12 dk önce',
    category: 'assignments',
    isRead: false,
    actionUrl: '/m-homework',
  },
  {
    id: 'notif-2',
    title: 'Akıllı Tahta Senkronizasyonu',
    description: '1-B Şubesi Matematik panosu akıllı tahtaya başarıyla aktarıldı.',
    time: '45 dk önce',
    category: 'boards',
    isRead: false,
    actionUrl: '/m-boards',
  },
  {
    id: 'notif-3',
    title: 'Yeni Okul Duyurusu',
    description: 'Pazartesi günü saat 10:00\'da öğretmenler kurulu ara değerlendirme toplantısı yapılacaktır.',
    time: '2 saat önce',
    category: 'announcements',
    isRead: false,
  },
  {
    id: 'notif-4',
    title: 'Haftalık Devamsızlık Özeti',
    description: 'Sınıfınızdaki öğrencilerin bu haftaki devamlılık oranı %96.4 olarak kaydedildi.',
    time: 'Dün, 16:30',
    category: 'system',
    isRead: true,
    actionUrl: '/m-student',
  },
  {
    id: 'notif-5',
    title: 'Sesli Okuma Ödevi Eklendi',
    description: 'Ayşe Demir ödevine 42 saniyelik ses kaydı yanıtı iliştirdi.',
    time: 'Dün, 11:20',
    category: 'assignments',
    isRead: true,
    actionUrl: '/m-homework',
  },
]

interface MobileNotificationSheetProps {
  isOpen: boolean
  onClose: () => void
  theme?: 'light' | 'dark'
}

export default function MobileNotificationSheet({
  isOpen,
  onClose,
  theme = 'light',
}: MobileNotificationSheetProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS)
  const [activeCategory, setActiveCategory] = useState<'all' | 'assignments' | 'boards' | 'announcements'>('all')

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    toast.success('Tüm bildirimler okundu olarak işaretlendi', {
      icon: '✓',
      duration: 2000,
    })
  }

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    )
    if (item.actionUrl) {
      onClose()
      window.location.href = item.actionUrl
    }
  }

  const filteredNotifications = notifications.filter((item) => {
    if (activeCategory === 'all') return true
    return item.category === activeCategory
  })

  const getCategoryIcon = (category: NotificationItem['category']) => {
    switch (category) {
      case 'assignments':
        return <BookOpen size={17} className="text-emerald-500" />
      case 'boards':
        return <Tv size={17} className="text-blue-500" />
      case 'announcements':
        return <AlertCircle size={17} className="text-amber-500" />
      case 'system':
      default:
        return <Sparkles size={17} className="text-purple-500" />
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`${theme} fixed inset-0 z-50 flex items-end justify-center font-jakarta selection:bg-[#34D399]/30`}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer / Sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-[430px] bg-white dark:bg-[#0E1526] text-gray-900 dark:text-white rounded-t-[32px] shadow-2xl border-t border-gray-200/80 dark:border-white/10 max-h-[85vh] flex flex-col z-10 overflow-hidden pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          >
            {/* Top Drag Indicator */}
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-11 h-1.2 rounded-full bg-gray-300 dark:bg-gray-700" />
            </div>

            {/* Header */}
            <div className="px-5 py-3 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-[#059669] dark:text-[#34D399] flex items-center justify-center">
                  <Bell size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold tracking-tight">Bildirimler</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white">
                        {unreadCount} yeni
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                    Sınıf ve ödev aktiviteleri
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    title="Tümünü okundu işaretle"
                    className="p-1.5 rounded-lg text-xs font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck size={16} />
                    <span className="hidden sm:inline">Okundu</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="px-5 pt-3 pb-2 flex gap-1.5 overflow-x-auto scrollbar-hide">
              {[
                { id: 'all', label: 'Tümü' },
                { id: 'assignments', label: 'Ödevler' },
                { id: 'boards', label: 'Akıllı Tahta' },
                { id: 'announcements', label: 'Duyurular' },
              ].map((cat) => {
                const isActive = activeCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-950 shadow-sm'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {cat.label}
                  </button>
                )
              })}
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto px-5 py-2 space-y-2.5">
              {filteredNotifications.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs">
                  Bu kategoride bildirim bulunmuyor.
                </div>
              ) : (
                filteredNotifications.map((item) => (
                  <motion.div
                    key={item.id}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      item.isRead
                        ? 'bg-gray-50/70 dark:bg-white/[0.02] border-gray-100 dark:border-white/5 opacity-80'
                        : 'bg-white dark:bg-[#141E33] border-emerald-500/30 dark:border-emerald-500/20 shadow-xs'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      {getCategoryIcon(item.category)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-tight truncate">
                          {item.title}
                        </h4>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-gray-400 font-medium">
                        <Clock size={11} />
                        <span>{item.time}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
