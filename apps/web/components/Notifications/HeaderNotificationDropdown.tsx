'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Check,
  CheckCheck,
  Volume2,
  VolumeX,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Calendar,
  AlertCircle,
  X,
  Radio,
  BookOpen,
} from 'lucide-react'
import toast from 'react-hot-toast'

export interface NotificationItem {
  id: string
  title: string
  message: string
  time: string
  isRead: boolean
  category: 'attendance' | 'announcement' | 'system' | 'board'
  link?: string
}

const STORAGE_KEY = 'oxonom_notifications_v1'
const SOUND_KEY = 'oxonom_notification_sound_enabled'

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: '1/A Şubesi Günlük Yoklama Onaylandı',
    message: 'Bahar ÇETİN 1/A sınıfı sabah yoklamasını tamamladı. 24 öğrenci mevcut, 0 devamsız.',
    time: '5 dk önce',
    isRead: false,
    category: 'attendance',
    link: '/principal/classes',
  },
  {
    id: 'notif-2',
    title: 'Akıllı Tahta Canlı Eşleşmesi Aktif',
    message: 'Ana Giriş Panosu ve 1/A Derslik Tahtası canlı yayın akışına bağlandı.',
    time: '18 dk önce',
    isRead: false,
    category: 'board',
    link: '/principal/boards',
  },
  {
    id: 'notif-3',
    title: '2026-2027 MEB Müfredat Föyleri Eklendi',
    message: 'Öğretmen ve öğrenci çalışma merkezlerine yeni dijital föyler tanımlandı.',
    time: '1 saat önce',
    isRead: false,
    category: 'announcement',
    link: '/principal/announcements',
  },
  {
    id: 'notif-4',
    title: 'Haftalık Ders Dağılım Çizelgesi Güncellendi',
    message: 'Bahar ÇETİN ve sınıf öğretmenleri zümre çalışma saatleri eşitlendi.',
    time: '3 saat önce',
    isRead: true,
    category: 'system',
    link: '/principal/curriculum',
  },
]

/**
 * Web Audio API synthesizer for zero-dependency high-fidelity chime sound
 */
export function playNotificationChime() {
  if (typeof window === 'undefined') return
  const isEnabled = localStorage.getItem(SOUND_KEY) !== 'false'
  if (!isEnabled) return

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    // Pleasant high-end double chime: D5 (587.33Hz) -> A5 (880Hz)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, now)
    gain1.gain.setValueAtTime(0.12, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.25)

    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(880, now + 0.09)
    gain2.gain.setValueAtTime(0.16, now + 0.09)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.09)
    osc2.stop(now + 0.42)
  } catch (_) {}
}

interface HeaderNotificationDropdownProps {
  theme?: string
  communicationRoute?: string
}

export default function HeaderNotificationDropdown({
  communicationRoute = '/principal/announcements',
}: HeaderNotificationDropdownProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load notifications and sound settings
  useEffect(() => {
    if (typeof window === 'undefined') return

    const soundSetting = localStorage.getItem(SOUND_KEY) !== 'false'
    setSoundEnabled(soundSetting)

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setNotifications(parsed)
          return
        }
      }
    } catch (_) {}

    setNotifications(INITIAL_NOTIFICATIONS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS))
  }, [])

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isOpen])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  // Save changes to localStorage & trigger custom event
  const persistNotifications = (updated: NotificationItem[]) => {
    setNotifications(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('oxonom_notifications_updated', { detail: updated }))
    } catch (_) {}
  }

  // Toggle single notification read / unread
  const handleToggleRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    persistNotifications(updated)
  }

  // Mark all as read
  const handleMarkAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }))
    persistNotifications(updated)
    toast.success('Tüm bildirimler okundu olarak işaretlendi.', { icon: '✅' })
  }

  // Toggle sound chime
  const handleToggleSound = () => {
    const nextState = !soundEnabled
    setSoundEnabled(nextState)
    localStorage.setItem(SOUND_KEY, nextState ? 'true' : 'false')
    if (nextState) {
      playNotificationChime()
      toast.success('Bildirim sesi açıldı.', { icon: '🔔' })
    } else {
      toast('Bildirim sesi kapatıldı.', { icon: '🔕' })
    }
  }

  // Badge formatted string: If 0 -> empty, if > 99 -> "99+", else number
  const badgeLabel = unreadCount > 99 ? '99+' : unreadCount > 0 ? String(unreadCount) : null

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* ── BELL ICON TRIGGER BUTTON ── */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
        type="button"
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen && unreadCount > 0) {
            playNotificationChime()
          }
        }}
        aria-label="Bildirimler"
        aria-expanded={isOpen}
        className={`w-9 h-9 rounded-xl relative flex items-center justify-center transition-all cursor-pointer border ${
          isOpen
            ? 'bg-[#4B075F] text-white border-[#8D49A6] shadow-sm shadow-[#4B075F]/30'
            : 'bg-[#F7F0FA] dark:bg-[#2D2035] hover:bg-[#F0D8FA] dark:hover:bg-[#350444] text-[#514458] dark:text-[#D2C5D8] border-[#E8DFEB] dark:border-[#49364F]'
        }`}
      >
        <Bell size={16} className={unreadCount > 0 ? 'text-[#D914C8] dark:text-[#F0D8FA]' : ''} />

        {/* Unread Badge (0 -> gizli, 1-99 -> sayı, 99+ -> 99+) */}
        {badgeLabel && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-[#D914C8] to-[#990099] text-white text-[9.5px] font-black flex items-center justify-center shadow-md border border-white dark:border-[#211729] animate-pulse">
            {badgeLabel}
          </span>
        )}
      </motion.button>

      {/* ── ELASTİK AÇILAN BİLDİRİM AÇILIR PENCERESİ (POPUP) ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: -12 }}
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 26,
              mass: 0.8,
            }}
            className="absolute right-0 mt-2 w-[340px] sm:w-[390px] rounded-3xl bg-white/95 dark:bg-[#1E1126]/95 backdrop-blur-2xl border border-[#E8DFEB] dark:border-[#49364F] shadow-2xl shadow-purple-950/20 z-50 overflow-hidden select-none"
          >
            {/* Header */}
            <div className="p-4 border-b border-[#E8DFEB] dark:border-[#3D2548] flex items-center justify-between bg-gradient-to-r from-purple-50/50 to-transparent dark:from-[#2A1635]/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-gradient flex items-center justify-center text-white shadow-xs">
                  <Bell size={13} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#241329] dark:text-white leading-none">
                    Bildirimler
                  </h3>
                  <span className="text-[10px] font-semibold text-[#8D49A6] dark:text-[#C58ADB]">
                    {unreadCount > 0 ? `${unreadCount} yeni okunmamış bildirim` : 'Tüm bildirimler okundu'}
                  </span>
                </div>
              </div>

              {/* Header Actions: Ses Aç/Kapa & Tümünü Oku */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleToggleSound}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    soundEnabled
                      ? 'bg-purple-100 dark:bg-purple-900/40 text-[#4B075F] dark:text-[#F0D8FA]'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}
                  title={soundEnabled ? 'Bildirim sesini kapat' : 'Bildirim sesini aç'}
                >
                  {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                </button>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="px-2 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/40 hover:bg-purple-200 text-[#4B075F] dark:text-[#F0D8FA] text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                    title="Tümünü okundu işaretle"
                  >
                    <CheckCheck size={12} />
                    <span>Tümü Okundu</span>
                  </button>
                )}
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-100 dark:divide-[#2F1B3B] scrollbar-thin">
              {notifications.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-[#8D49A6] flex items-center justify-center mx-auto mb-2">
                    <Bell size={18} />
                  </div>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Henüz bildiriminiz yok</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Sistem ve okul duyuruları burada görünecektir.</p>
                </div>
              ) : (
                notifications.slice(0, 5).map((item) => {
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (item.link) {
                          setIsOpen(false)
                          router.push(item.link)
                        }
                      }}
                      className={`p-3.5 transition-colors cursor-pointer group flex items-start gap-3 relative ${
                        !item.isRead
                          ? 'bg-purple-50/70 dark:bg-[#281533]/80 hover:bg-purple-100/60 dark:hover:bg-[#321B40]'
                          : 'hover:bg-gray-50 dark:hover:bg-[#24132B]/60'
                      }`}
                    >
                      {/* Left Category Icon */}
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-105 ${
                          item.category === 'attendance'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : item.category === 'board'
                            ? 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300'
                            : item.category === 'announcement'
                            ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                            : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                        }`}
                      >
                        {item.category === 'attendance' && <Check size={14} />}
                        {item.category === 'board' && <Radio size={14} />}
                        {item.category === 'announcement' && <Sparkles size={14} />}
                        {item.category === 'system' && <BookOpen size={14} />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className={`text-xs font-bold truncate ${
                              !item.isRead
                                ? 'text-[#241329] dark:text-white font-black'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {item.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          {item.message}
                        </p>
                        <span className="text-[9.5px] font-semibold text-gray-400 dark:text-gray-500 mt-1 block">
                          {item.time}
                        </span>
                      </div>

                      {/* Read / Unread Toggle Dot Button */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleRead(item.id, e)}
                        className="absolute right-3 top-3.5 p-1 rounded-md text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors cursor-pointer"
                        title={item.isRead ? 'Okunmadı yap' : 'Okundu yap'}
                      >
                        {!item.isRead ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#D914C8] block shadow-xs ring-2 ring-white dark:ring-[#281533]" />
                        ) : (
                          <Check size={13} className="text-gray-400 opacity-60" />
                        )}
                      </button>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer with "Tümünü Gör" Button */}
            <div className="p-3 bg-gray-50/80 dark:bg-[#160B1C]/90 border-t border-[#E8DFEB] dark:border-[#3D2548] text-center">
              <Link
                href={communicationRoute}
                onClick={() => setIsOpen(false)}
                className="w-full py-2 px-3 rounded-xl bg-brand-gradient hover:opacity-95 active:scale-[0.98] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm shadow-[#4B075F]/30 transition-all cursor-pointer"
              >
                <span>Tüm Bildirimleri & Duyuruları Gör</span>
                <ExternalLink size={13} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
