'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Bell,
  Clock,
  Plus,
  Trash2,
  Check,
  X,
  Sparkles,
  AlertCircle,
  FileText,
  CalendarCheck2,
} from 'lucide-react'
import toast from 'react-hot-toast'

export interface CalendarDayEntry {
  dateKey: string // YYYY-MM-DD
  note: string
  hasReminder: boolean
  reminderTime?: string // HH:mm
  reminderTitle?: string
  notified?: boolean
  createdAt: string
  updatedAt: string
}

interface CalendarReminderWidgetProps {
  storageKey: string
  role?: 'teacher' | 'student'
  compactMode?: boolean
  title?: string
  description?: string
  accentColor?: string
}

function playReminderChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.18) // A5
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7)
    osc.start()
    osc.stop(ctx.currentTime + 0.7)
  } catch (_) {}
}

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
]
const DAY_NAMES = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
const DAY_NAMES_SHORT = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz']

function formatDateKey(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

function getTodayKey(): string {
  const now = new Date()
  return formatDateKey(now.getFullYear(), now.getMonth(), now.getDate())
}

export default function CalendarReminderWidget({
  storageKey,
  role = 'teacher',
  compactMode = false,
  title = 'Ajanda & Hatırlatıcı Takvimi',
  description = 'Günlere özel ders/çalışma notları ve zaman ayarlı sesli hatırlatıcılar',
  accentColor = '#8D49A6',
}: CalendarReminderWidgetProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [entries, setEntries] = useState<Record<string, CalendarDayEntry>>({})
  const [selectedDateKey, setSelectedDateKey] = useState<string>(() => getTodayKey())
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [activeAlert, setActiveAlert] = useState<CalendarDayEntry | null>(null)

  // Edit form state
  const [formNote, setFormNote] = useState('')
  const [formHasReminder, setFormHasReminder] = useState(false)
  const [formReminderTime, setFormReminderTime] = useState('09:00')
  const [formReminderTitle, setFormReminderTitle] = useState('')

  // Load entries from localStorage
  const loadEntries = useCallback(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        setEntries(JSON.parse(raw))
      } else {
        // Initialize sample reminder for Demo preview if empty
        const today = getTodayKey()
        const initialSample: Record<string, CalendarDayEntry> = {
          [today]: {
            dateKey: today,
            note: role === 'teacher' ? '1/A Sınıfı zümre toplantısı ve haftalık ders değerlendirmesi' : 'Matematik 3. Ünite testleri tamamlanacak',
            hasReminder: true,
            reminderTime: '14:30',
            reminderTitle: role === 'teacher' ? 'Zümre Değerlendirmesi' : 'Ders Çalışma Saati',
            notified: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        }
        localStorage.setItem(storageKey, JSON.stringify(initialSample))
        setEntries(initialSample)
      }
    } catch (_) {}
  }, [storageKey, role])

  useEffect(() => {
    loadEntries()
    const handleStorage = () => loadEntries()
    window.addEventListener(`${storageKey}_updated`, handleStorage)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener(`${storageKey}_updated`, handleStorage)
      window.removeEventListener('storage', handleStorage)
    }
  }, [loadEntries, storageKey])

  // Reminder Checker Interval: checks if any reminder has reached its time
  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkReminders = () => {
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth()
      const currentDay = now.getDate()
      const todayKey = formatDateKey(currentYear, currentMonth, currentDay)
      const currentHours = now.getHours()
      const currentMinutes = now.getMinutes()
      const nowMinutes = currentHours * 60 + currentMinutes

      const currentEntries = { ...entries }
      let updated = false

      Object.values(currentEntries).forEach((entry) => {
        if (!entry.hasReminder || entry.notified || !entry.reminderTime) return

        // Check if date matches or is past due for today
        if (entry.dateKey === todayKey) {
          const [rHours, rMins] = entry.reminderTime.split(':').map(Number)
          const reminderMinutes = rHours * 60 + rMins

          // Fire if within current minute or slightly passed within the day
          if (nowMinutes >= reminderMinutes) {
            playReminderChime()
            setActiveAlert(entry)
            entry.notified = true
            updated = true
          }
        }
      })

      if (updated) {
        setEntries(currentEntries)
        localStorage.setItem(storageKey, JSON.stringify(currentEntries))
        window.dispatchEvent(new Event(`${storageKey}_updated`))
      }
    }

    checkReminders()
    const timer = setInterval(checkReminders, 10000)
    return () => clearInterval(timer)
  }, [entries, storageKey])

  // Calendar calculations
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate()
  }, [year, month])

  const firstDayIndex = useMemo(() => {
    // 0 = Sunday, 1 = Monday ... convert to Monday-first (0 = Monday, 6 = Sunday)
    const day = new Date(year, month, 1).getDay()
    return day === 0 ? 6 : day - 1
  }, [year, month])

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const jumpToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDateKey(getTodayKey())
  }

  const openEditModal = (dateKey: string) => {
    setSelectedDateKey(dateKey)
    const existing = entries[dateKey]
    if (existing) {
      setFormNote(existing.note || '')
      setFormHasReminder(!!existing.hasReminder)
      setFormReminderTime(existing.reminderTime || '09:00')
      setFormReminderTitle(existing.reminderTitle || '')
    } else {
      setFormNote('')
      setFormHasReminder(false)
      setFormReminderTime('09:00')
      setFormReminderTitle('')
    }
    setIsEditModalOpen(true)
  }

  const saveEntry = () => {
    if (!formNote.trim() && !formHasReminder) {
      toast.error('Lütfen en az bir not yazın veya hatırlatıcı oluşturun.')
      return
    }

    const updatedEntries = { ...entries }
    const nowIso = new Date().toISOString()

    updatedEntries[selectedDateKey] = {
      dateKey: selectedDateKey,
      note: formNote.trim(),
      hasReminder: formHasReminder,
      reminderTime: formHasReminder ? formReminderTime : undefined,
      reminderTitle: formHasReminder ? (formReminderTitle.trim() || 'Hatırlatıcı') : undefined,
      notified: false, // reset notified flag so edited reminder can trigger
      createdAt: entries[selectedDateKey]?.createdAt || nowIso,
      updatedAt: nowIso,
    }

    setEntries(updatedEntries)
    localStorage.setItem(storageKey, JSON.stringify(updatedEntries))
    window.dispatchEvent(new Event(`${storageKey}_updated`))
    setIsEditModalOpen(false)
    toast.success('Günün notu ve hatırlatıcı başarıyla kaydedildi! 📅')
  }

  const deleteEntry = (dateKey: string) => {
    const updatedEntries = { ...entries }
    delete updatedEntries[dateKey]
    setEntries(updatedEntries)
    localStorage.setItem(storageKey, JSON.stringify(updatedEntries))
    window.dispatchEvent(new Event(`${storageKey}_updated`))
    setIsEditModalOpen(false)
    toast.success('Not ve hatırlatıcı silindi.')
  }

  const todayKey = getTodayKey()
  const activeSelectedEntry = entries[selectedDateKey]

  // Count upcoming active reminders
  const activeRemindersList = useMemo(() => {
    return Object.values(entries)
      .filter((e) => e.hasReminder && e.dateKey >= todayKey)
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
  }, [entries, todayKey])

  return (
    <div className={`w-full max-w-full rounded-2xl sm:rounded-3xl bg-white dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#49364F] shadow-sm overflow-hidden flex flex-col transition-all min-w-0 ${compactMode ? 'p-3 sm:p-4' : 'p-3.5 sm:p-5 lg:p-6'}`}>
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-[#E8DFEB]/80 dark:border-[#49364F]/80 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-500/10 text-[#8D49A6] dark:text-[#C58ADB] flex items-center justify-center shrink-0">
              <CalendarIcon size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-base font-black text-[#241329] dark:text-white leading-tight truncate">
                {title}
              </h3>
              {!compactMode && (
                <p className="text-[10px] sm:text-[11px] text-[#716779] dark:text-[#B5A5BD] mt-0.5 truncate hidden sm:block">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Month Switcher & Today button */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={jumpToToday}
            className="px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-bold rounded-lg bg-[#F7F0FA] dark:bg-[#2D2035] hover:bg-[#F0D8FA] dark:hover:bg-[#49364F] text-[#4B075F] dark:text-[#F0D8FA] transition-colors cursor-pointer"
          >
            Bugün
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevMonth}
              className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#F7F0FA] dark:bg-[#2D2035] hover:bg-[#F0D8FA] dark:hover:bg-[#49364F] text-[#514458] dark:text-[#D2C5D8] cursor-pointer"
              title="Önceki Ay"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-xs sm:text-sm font-black text-[#241329] dark:text-white min-w-[85px] sm:min-w-[110px] text-center">
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#F7F0FA] dark:bg-[#2D2035] hover:bg-[#F0D8FA] dark:hover:bg-[#49364F] text-[#514458] dark:text-[#D2C5D8] cursor-pointer"
              title="Sonraki Ay"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className={`pt-3 sm:pt-4 min-w-0 w-full ${compactMode ? 'flex flex-col gap-4' : 'grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6'}`}>
        {/* Left: Interactive Calendar Grid */}
        <div className={`w-full min-w-0 ${compactMode ? '' : 'lg:col-span-8'}`}>
          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5 w-full min-w-0">
            {DAY_NAMES.map((name, i) => (
              <div
                key={name}
                className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider py-1 truncate min-w-0 ${
                  i >= 5 ? 'text-[#D914C8] dark:text-[#F0D8FA]' : 'text-[#716779] dark:text-[#B5A5BD]'
                }`}
              >
                <span className="hidden sm:inline">{name}</span>
                <span className="sm:hidden">{DAY_NAMES_SHORT[i]}</span>
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 md:gap-2 w-full min-w-0">
            {/* Empty prefix cells */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="min-w-0 w-full h-11 sm:h-13 md:h-15 rounded-xl sm:rounded-2xl bg-[#FCF9FD]/40 dark:bg-black/10 border border-transparent opacity-30" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateKey = formatDateKey(year, month, day)
              const entry = entries[dateKey]
              const isToday = dateKey === todayKey
              const isSelected = dateKey === selectedDateKey
              const hasNote = !!entry?.note
              const hasReminder = !!entry?.hasReminder

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => openEditModal(dateKey)}
                  className={`relative group min-w-0 w-full overflow-hidden h-11 sm:h-13 md:h-15 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl flex flex-col justify-between items-start text-left transition-all cursor-pointer border ${
                    hasReminder
                      ? 'bg-gradient-to-br from-[#FDF2FF] via-[#FAF0FC] to-[#F3D5FA] dark:from-[#381045] dark:via-[#2b0c36] dark:to-[#4a145c] border-[#D914C8] dark:border-[#D914C8] shadow-[0_0_12px_rgba(217,20,200,0.22)] ring-1.5 sm:ring-2 ring-[#D914C8]/30 dark:ring-[#D914C8]/40 animate-pulse'
                      : isSelected
                      ? 'bg-[#F0D8FA] dark:bg-[#4B075F]/50 border-[#8D49A6] dark:border-[#8D49A6] shadow-xs'
                      : isToday
                      ? 'bg-[#FAF7FC] dark:bg-[#281a33] border-[#8D49A6]/50 dark:border-[#8D49A6]/60 font-bold'
                      : 'bg-white dark:bg-[#261b30] border-[#E8DFEB] dark:border-[#49364F]/60 hover:border-[#8D49A6]/50 hover:bg-[#FAF7FC] dark:hover:bg-[#2D2035]'
                  }`}
                >
                  {/* Top Bar: Date Number + Indicators */}
                  <div className="w-full flex items-center justify-between min-w-0">
                    <span
                      className={`text-[11px] sm:text-xs md:text-sm font-black leading-none truncate ${
                        hasReminder
                          ? 'text-[#D914C8] dark:text-[#FF84F5]'
                          : isToday
                          ? 'text-[#8D49A6] dark:text-[#E8A5FF]'
                          : 'text-[#241329] dark:text-white'
                      }`}
                    >
                      {day}
                    </span>

                    {/* Attention-grabbing reminder bell */}
                    {hasReminder && (
                      <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#D914C8] text-white flex items-center justify-center shadow-xs shrink-0">
                        <Bell size={8} className="fill-white animate-bounce" />
                      </span>
                    )}
                  </div>

                  {/* Bottom: Note teaser or reminder label */}
                  <div className="w-full truncate min-w-0 mt-0.5">
                    {hasReminder ? (
                      <span className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-[#8D49A6] dark:text-[#F0D8FA] truncate block leading-tight">
                        <span className="sm:hidden">⏰</span>
                        <span className="hidden sm:inline">⏰ {entry.reminderTime}</span>
                      </span>
                    ) : hasNote ? (
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8D49A6] shrink-0" />
                        <span className="text-[8px] sm:text-[9px] text-[#716779] dark:text-[#B5A5BD] truncate hidden sm:inline">
                          {entry.note}
                        </span>
                      </div>
                    ) : (
                      <span className="opacity-0 group-hover:opacity-100 text-[8px] text-[#8D49A6] transition-opacity hidden sm:inline">
                        + Ekle
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right / Bottom: Selected Day Detail & Active Reminders */}
        <div className={`w-full min-w-0 ${compactMode ? 'pt-2 border-t border-[#E8DFEB] dark:border-[#49364F]' : 'lg:col-span-4 flex flex-col gap-4'}`}>
          {/* Quick Active Reminders Pill Box */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#FAF7FC] to-[#F5ECF8] dark:from-[#261B30] dark:to-[#1F1426] border border-[#E8DFEB] dark:border-[#49364F]">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Bell size={14} className="text-[#D914C8]" />
                <span className="text-xs font-black text-[#241329] dark:text-white">
                  Yaklaşan Hatırlatıcılar
                </span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#D914C8]/10 text-[#D914C8]">
                {activeRemindersList.length} Aktif
              </span>
            </div>

            {activeRemindersList.length === 0 ? (
              <p className="text-[11px] text-[#716779] dark:text-[#B5A5BD]">
                Planlanmış aktif hatırlatıcı bulunmuyor. Takvimden bir güne tıklayarak anında hatırlatma kurabilirsiniz.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-none">
                {activeRemindersList.slice(0, 4).map((rem) => (
                  <div
                    key={rem.dateKey}
                    onClick={() => openEditModal(rem.dateKey)}
                    className="p-2.5 rounded-xl bg-white dark:bg-[#2D2035] border border-[#D914C8]/30 dark:border-[#D914C8]/40 hover:border-[#D914C8] transition-all cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-black text-[#241329] dark:text-white truncate">
                        {rem.reminderTitle || 'Hatırlatıcı'}
                      </div>
                      <div className="text-[10px] text-[#716779] dark:text-[#B5A5BD] truncate">
                        {rem.note || 'Özel not eklenmemiş'}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] font-black text-[#D914C8]">
                        {rem.reminderTime}
                      </div>
                      <div className="text-[9px] text-gray-400">
                        {rem.dateKey.split('-').reverse().slice(0, 2).join('.')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Button to Add/Edit Note for Selected Date */}
          <button
            type="button"
            onClick={() => openEditModal(selectedDateKey)}
            className="w-full py-2.5 px-3 rounded-xl bg-brand-gradient text-white text-xs font-black shadow-sm flex items-center justify-center gap-1.5 hover:opacity-95 transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Seçili Güne Not / Hatırlatıcı Ekle</span>
          </button>
        </div>
      </div>

      {/* ── POPUP ALERT MODAL (Triggered when reminder time arrives!) ── */}
      <AnimatePresence>
        {activeAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full max-w-md rounded-2xl sm:rounded-3xl bg-white dark:bg-[#211729] border-2 border-[#D914C8] shadow-[0_20px_60px_rgba(217,20,200,0.35)] p-5 sm:p-6 relative overflow-hidden text-center max-h-[92vh] overflow-y-auto"
            >
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#D914C8] to-[#8D49A6] text-white mx-auto flex items-center justify-center shadow-lg shadow-[#D914C8]/30 mb-4 animate-bounce">
                <Bell size={32} className="fill-white" />
              </div>

              <div className="inline-block px-3 py-1 rounded-full bg-[#D914C8]/10 text-[#D914C8] text-xs font-black uppercase tracking-wider mb-2">
                🔔 Hatırlatma Zamanı Geldi!
              </div>

              <h3 className="text-xl font-black text-[#241329] dark:text-white mb-2">
                {activeAlert.reminderTitle || 'Planlanmış Hatırlatıcı'}
              </h3>

              <div className="flex items-center justify-center gap-3 text-xs font-bold text-[#716779] dark:text-[#B5A5BD] mb-4">
                <span className="flex items-center gap-1">
                  <CalendarIcon size={14} className="text-[#8D49A6]" />
                  {activeAlert.dateKey}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={14} className="text-[#D914C8]" />
                  {activeAlert.reminderTime}
                </span>
              </div>

              {activeAlert.note && (
                <div className="p-3.5 rounded-2xl bg-[#F7F0FA] dark:bg-[#2D2035] border border-[#E8DFEB] dark:border-[#49364F] text-xs text-[#514458] dark:text-[#D2C5D8] text-left leading-relaxed mb-6 font-medium">
                  {activeAlert.note}
                </div>
              )}

              <button
                type="button"
                onClick={() => setActiveAlert(null)}
                className="w-full py-3 px-4 rounded-2xl bg-brand-gradient text-white text-sm font-black shadow-md shadow-[#4B075F]/20 hover:opacity-95 transition-all cursor-pointer"
              >
                Tamam, Anladım
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── EDIT / ADD NOTE & REMINDER MODAL ── */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl sm:rounded-3xl bg-white dark:bg-[#211729] border border-[#E8DFEB] dark:border-[#49364F] shadow-2xl p-4 sm:p-6 overflow-hidden max-h-[92vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E8DFEB] dark:border-[#49364F] mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-[#8D49A6] flex items-center justify-center">
                    <CalendarCheck2 size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#241329] dark:text-white">
                      Gün Notu & Hatırlatıcı
                    </h3>
                    <p className="text-xs font-bold text-[#8D49A6] dark:text-[#C58ADB]">
                      📅 {selectedDateKey}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F7F0FA] dark:bg-[#2D2035] flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Body */}
              <div className="space-y-4">
                {/* Day Note Textarea */}
                <div>
                  <label className="block text-xs font-black text-[#241329] dark:text-white mb-1.5">
                    Günün Notu / Yapılacaklar:
                  </label>
                  <textarea
                    rows={3}
                    value={formNote}
                    onChange={(e) => setFormNote(e.target.value)}
                    placeholder="Bu gün için ders planı, sınav kağıtları veya özel çalışma notunuz..."
                    className="w-full p-3 rounded-2xl bg-[#FAF7FC] dark:bg-[#281A33] border border-[#E8DFEB] dark:border-[#49364F] text-xs text-[#241329] dark:text-white focus:outline-none focus:border-[#8D49A6] transition-colors resize-none"
                  />
                </div>

                {/* Reminder Toggle */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FAF0FC] to-[#F5E6F8] dark:from-[#351442] dark:to-[#2A0E35] border border-[#D914C8]/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-[#D914C8]" />
                      <div>
                        <div className="text-xs font-black text-[#241329] dark:text-white">
                          Zaman Ayarlı Hatırlatıcı Kur
                        </div>
                        <div className="text-[10px] text-[#716779] dark:text-[#D2C5D8]">
                          Tarih ve saat geldiğinde ekranda popup uyarı verir
                        </div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formHasReminder}
                        onChange={(e) => setFormHasReminder(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D914C8]" />
                    </label>
                  </div>

                  {formHasReminder && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-[#D914C8]/20 grid grid-cols-1 sm:grid-cols-2 gap-3"
                    >
                      <div>
                        <label className="block text-[11px] font-bold text-[#241329] dark:text-white mb-1">
                          Hatırlatma Saati:
                        </label>
                        <input
                          type="time"
                          value={formReminderTime}
                          onChange={(e) => setFormReminderTime(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E1126] border border-[#D914C8]/40 text-xs text-[#241329] dark:text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#241329] dark:text-white mb-1">
                          Hatırlatma Başlığı:
                        </label>
                        <input
                          type="text"
                          value={formReminderTitle}
                          onChange={(e) => setFormReminderTitle(e.target.value)}
                          placeholder="Örn: Sınavı Başlat"
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E1126] border border-[#D914C8]/40 text-xs text-[#241329] dark:text-white"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-5 border-t border-[#E8DFEB] dark:border-[#49364F] mt-5">
                {entries[selectedDateKey] ? (
                  <button
                    type="button"
                    onClick={() => deleteEntry(selectedDateKey)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Sil</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="button"
                    onClick={saveEntry}
                    className="px-5 py-2 rounded-xl bg-brand-gradient text-white text-xs font-black shadow-sm hover:opacity-95 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Check size={14} />
                    <span>Kaydet</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
