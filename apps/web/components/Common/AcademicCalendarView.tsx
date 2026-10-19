'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar as CalendarIcon,
  Table as TableIcon,
  List as ListIcon,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  Plus,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  Edit3,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  AcademicCalendarEvent,
  ACADEMIC_CATEGORIES,
  AcademicEventCategory,
  getStoredAcademicEvents,
  saveStoredAcademicEvents,
  addAcademicEvent,
  updateAcademicEvent,
  deleteAcademicEvent,
  syncAcademicEventsFromServer,
} from '@/lib/calendar/academicCalendarStorage'

export interface AcademicCalendarViewProps {
  role?: 'student' | 'teacher' | 'principal'
}

type ViewMode = 'calendar' | 'table' | 'list'

const MONTH_NAMES = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
]

const DAY_NAMES = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

export default function AcademicCalendarView({
  role = 'student',
}: AcademicCalendarViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [events, setEvents] = useState<AcademicCalendarEvent[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Calendar Month State (Defaults to current academic year focus: Ekim 2026)
  const [currentYear, setCurrentYear] = useState(2026)
  const [currentMonth, setCurrentMonth] = useState(9) // 0-indexed: 9 = Ekim

  // Modal State
  const [selectedEvent, setSelectedEvent] = useState<AcademicCalendarEvent | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // New Event Form State (For Principal)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState<AcademicEventCategory>('activity')
  const [newStartDate, setNewStartDate] = useState('2026-11-05')
  const [newEndDate, setNewEndDate] = useState('')
  const [newTime, setNewTime] = useState('10:00 - 15:30')
  const [newTarget, setNewTarget] = useState('Tüm Okul')
  const [newLocation, setNewLocation] = useState('Okul Konferans Salonu')
  const [newDescription, setNewDescription] = useState('')

  // Edit Event Form State (For Principal)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editCategory, setEditCategory] = useState<AcademicEventCategory>('activity')
  const [editStartDate, setEditStartDate] = useState('')
  const [editEndDate, setEditEndDate] = useState('')
  const [editTime, setEditTime] = useState('')
  const [editTarget, setEditTarget] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editDescription, setEditDescription] = useState('')

  // Sync events
  const sync = () => {
    setEvents(getStoredAcademicEvents())
  }

  useEffect(() => {
    sync()
    syncAcademicEventsFromServer().then((srvEvents) => {
      if (srvEvents) setEvents(srvEvents)
    })
    window.addEventListener('oxonom_academic_calendar_updated', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('oxonom_academic_calendar_updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (selectedCategory !== 'all' && ev.category !== selectedCategory) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          ev.title.toLowerCase().includes(q) ||
          ev.description.toLowerCase().includes(q) ||
          ev.location.toLowerCase().includes(q) ||
          ev.targetAudience.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [events, selectedCategory, searchQuery])

  // Calendar Grid Calculation
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)

    // In JS, getDay() returns 0 for Sunday. Convert to Monday=0
    let startDayOfWeek = firstDay.getDay() - 1
    if (startDayOfWeek === -1) startDayOfWeek = 6

    const totalDays = lastDay.getDate()
    const daysArray: Array<{
      dayNumber: number | null
      dateString: string | null
      isToday: boolean
      events: AcademicCalendarEvent[]
    }> = []

    // Empty cells before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      daysArray.push({ dayNumber: null, dateString: null, isToday: false, events: [] })
    }

    // Days of the month
    const todayStr = '2026-10-14' // Simulated current project date
    for (let d = 1; d <= totalDays; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0')
      const dayStr = String(d).padStart(2, '0')
      const dateString = `${currentYear}-${monthStr}-${dayStr}`

      const dayEvents = filteredEvents.filter((ev) => {
        if (ev.endDate) {
          return dateString >= ev.startDate && dateString <= ev.endDate
        }
        return ev.startDate === dateString
      })

      daysArray.push({
        dayNumber: d,
        dateString,
        isToday: dateString === todayStr,
        events: dayEvents,
      })
    }

    return daysArray
  }, [currentYear, currentMonth, filteredEvents])

  // Navigation for months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  // Days until calculation helper
  const getDaysUntilText = (startDateStr: string, endDateStr?: string) => {
    const today = new Date('2026-10-14')
    const start = new Date(startDateStr)
    const end = endDateStr ? new Date(endDateStr) : start

    const diffTime = start.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (today >= start && today <= end) {
      return { text: 'Bugün Aktif', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60' }
    }
    if (diffDays > 0) {
      return { text: `${diffDays} Gün Kaldı`, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60' }
    }
    return { text: 'Tamamlandı', color: 'text-gray-400 bg-gray-100 dark:bg-gray-800' }
  }

  // Principal Add Event
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) {
      toast.error('Lütfen etkinlik başlığı girin.')
      return
    }

    const catObj = ACADEMIC_CATEGORIES.find((c) => c.id === newCategory)
    const categoryLabel = catObj?.label || 'Etkinlik'

    const newEv: AcademicCalendarEvent = {
      id: `ev-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      categoryLabel,
      startDate: newStartDate,
      endDate: newEndDate.trim() ? newEndDate : undefined,
      time: newTime.trim() || 'Tam Gün',
      targetAudience: newTarget.trim() || 'Tüm Okul',
      location: newLocation.trim() || 'Okul Kampüsü',
      description: newDescription.trim() || 'Müdürlük tarafından eklenen kurumsal etkinlik.',
      isOfficialMeb: false,
      color: catObj?.color || 'indigo',
      createdAt: new Date().toISOString(),
    }

    const updated = addAcademicEvent(newEv)
    setEvents(updated)
    toast.success(`🎉 "${newTitle}" takvime eklendi ve tüm profillere yansıtıldı!`)
    setIsAddModalOpen(false)
    setNewTitle('')
    setNewDescription('')
  }

  // Principal Open Edit Modal
  const handleOpenEditModal = (ev: AcademicCalendarEvent) => {
    setEditingEventId(ev.id)
    setEditTitle(ev.title)
    setEditCategory(ev.category)
    setEditStartDate(ev.startDate)
    setEditEndDate(ev.endDate || '')
    setEditTime(ev.time || 'Tam Gün')
    setEditTarget(ev.targetAudience || 'Tüm Okul')
    setEditLocation(ev.location || 'Okul Kampüsü')
    setEditDescription(ev.description || '')
    setIsEditModalOpen(true)
  }

  // Principal Save Edited Event
  const handleSaveEditEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEventId || !editTitle.trim()) {
      toast.error('Lütfen etkinlik başlığı girin.')
      return
    }

    const catObj = ACADEMIC_CATEGORIES.find((c) => c.id === editCategory)
    const categoryLabel = catObj?.label || 'Etkinlik'

    const updated = updateAcademicEvent(editingEventId, {
      title: editTitle.trim(),
      category: editCategory,
      categoryLabel,
      startDate: editStartDate,
      endDate: editEndDate.trim() ? editEndDate : undefined,
      time: editTime.trim() || 'Tam Gün',
      targetAudience: editTarget.trim() || 'Tüm Okul',
      location: editLocation.trim() || 'Okul Kampüsü',
      description: editDescription.trim(),
      color: catObj?.color || 'indigo',
    })

    setEvents(updated)
    if (selectedEvent && selectedEvent.id === editingEventId) {
      setSelectedEvent(updated.find((ev) => ev.id === editingEventId) || null)
    }
    toast.success(`✏️ "${editTitle}" etkinliği güncellendi ve tüm profillere yansıtıldı!`)
    setIsEditModalOpen(false)
  }

  // Principal Delete Event
  const handleDeleteEvent = (id: string, title: string) => {
    if (!confirm(`"${title}" etkinliğini takvimden kaldırmak istediğinize emin misiniz?`)) return
    const updated = deleteAcademicEvent(id)
    setEvents(updated)
    setSelectedEvent(null)
    toast.success('Etkinlik takvimden kaldırıldı.')
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-jakarta space-y-6">
      {/* ── HEADER BANNER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-2">
            <CalendarDays size={14} />
            <span>MEB 2026–2027 Resmi Çalışma Takvimi</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Akademik Takvim & Yaklaşan Etkinlikler
            </h1>
          </div>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Bakanlık ara tatilleri, ülke geneli ortak sınav haftaları, resmi tatiller ve okul etkinlikleri.
          </p>
        </div>

        {/* Action Controls: View Switcher & Principal Add Button */}
        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-[#0E1526] text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <CalendarIcon size={14} />
              <span>Takvim</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-[#0E1526] text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <TableIcon size={14} />
              <span>Tablo</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-[#0E1526] text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <ListIcon size={14} />
              <span>Liste</span>
            </button>
          </div>

          {/* Principal Add Event Button */}
          {role === 'principal' && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>Yeni Etkinlik Ekle</span>
            </button>
          )}
        </div>
      </div>

      {/* ── FILTER & SEARCH BAR ── */}
      <div className="p-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar flex-1">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              Tüm Etkinlikler ({events.length})
            </button>

            {ACADEMIC_CATEGORIES.map((cat) => {
              const count = events.filter((e) => e.category === cat.id).length
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
                  <span>
                    {cat.label} ({count})
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Takvimde ara..."
              className="w-full h-9 pl-8 pr-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* ── 1. TAKVİM GÖRÜNÜMÜ (MONTHLY INTERACTIVE CALENDAR) ── */}
      {viewMode === 'calendar' && (
        <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h3>
              <span className="text-xs font-semibold text-gray-400 hidden sm:inline-block">
                • MEB 2026-2027 Dönemi
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setCurrentYear(2026)
                  setCurrentMonth(9) // Ekim 2026
                }}
                className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-xs font-bold text-gray-700 dark:text-gray-300 transition-colors cursor-pointer mr-1"
              >
                Bugün
              </button>

              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                onClick={handleNextMonth}
                className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Calendar Grid Header: Weekdays */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold text-gray-400 pb-1">
            {DAY_NAMES.map((name, i) => (
              <div
                key={name}
                className={`py-1.5 ${i >= 5 ? 'text-rose-500/80 font-black' : ''}`}
              >
                {name}
              </div>
            ))}
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((cell, idx) => {
              if (cell.dayNumber === null) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[90px] sm:min-h-[105px] rounded-2xl bg-gray-50/40 dark:bg-gray-800/20 border border-transparent opacity-30"
                  />
                )
              }

              return (
                <div
                  key={`day-${cell.dateString}`}
                  className={`min-h-[90px] sm:min-h-[105px] p-1.5 sm:p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                    cell.isToday
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 shadow-xs ring-2 ring-indigo-500/20'
                      : 'bg-white dark:bg-[#161D2E] border-gray-200/60 dark:border-gray-800/60 hover:border-indigo-300 dark:hover:border-indigo-700'
                  }`}
                >
                  {/* Day Number Header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center ${
                        cell.isToday
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {cell.events.length > 0 && (
                      <span className="text-[10px] font-bold text-gray-400">
                        {cell.events.length}
                      </span>
                    )}
                  </div>

                  {/* Day Events Chips (Clickable -> Opens Modal) */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {cell.events.slice(0, 2).map((ev) => {
                      const cat = ACADEMIC_CATEGORIES.find((c) => c.id === ev.category)
                      return (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={() => setSelectedEvent(ev)}
                          title={`${ev.title} (${ev.categoryLabel})`}
                          className={`w-full text-left px-1.5 py-1 rounded-lg text-[10px] font-bold truncate flex items-center gap-1 transition-all cursor-pointer ${
                            cat?.badgeBg || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${cat?.dot || 'bg-gray-400'}`}
                          />
                          <span className="truncate">{ev.title}</span>
                        </button>
                      )
                    })}

                    {cell.events.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setSelectedEvent(cell.events[0])}
                        className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 hover:underline block text-center cursor-pointer"
                      >
                        +{cell.events.length - 2} daha...
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── 2. TABLO GÖRÜNÜMÜ (TABLE VIEW) ── */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
              Akademik Takvim & Önemli Günler Tablosu ({filteredEvents.length})
            </h3>
            <span className="text-xs text-gray-400">
              Detayları görmek için herhangi bir satıra tıklayınız
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 font-bold">
                  <th className="pb-3">Tarih / Aralık</th>
                  <th className="pb-3">Etkinlik & Önemli Gün</th>
                  <th className="pb-3">Kategori</th>
                  <th className="pb-3">Kapsam / Hedef Kitle</th>
                  <th className="pb-3">Konum</th>
                  <th className="pb-3 text-right">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-semibold">
                {filteredEvents.map((ev) => {
                  const cat = ACADEMIC_CATEGORIES.find((c) => c.id === ev.category)
                  const daysMeta = getDaysUntilText(ev.startDate, ev.endDate)

                  return (
                    <tr
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className="hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-colors cursor-pointer group"
                    >
                      {/* Tarih */}
                      <td className="py-4 font-mono font-bold text-gray-900 dark:text-white whitespace-nowrap">
                        {ev.startDate}
                        {ev.endDate && ` — ${ev.endDate}`}
                      </td>

                      {/* Başlık */}
                      <td className="py-4 font-extrabold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors max-w-xs">
                        <div className="flex items-center gap-1.5">
                          {ev.isOfficialMeb && (
                            <span
                              title="MEB Resmi Takvimi"
                              className="text-[9px] font-black px-1 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                            >
                              MEB
                            </span>
                          )}
                          <span className="truncate">{ev.title}</span>
                        </div>
                      </td>

                      {/* Kategori */}
                      <td className="py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black border ${cat?.badgeBg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cat?.dot}`} />
                          <span>{cat?.label}</span>
                        </span>
                      </td>

                      {/* Hedef Kitle */}
                      <td className="py-4 text-gray-500 dark:text-gray-400 max-w-[150px] truncate">
                        {ev.targetAudience}
                      </td>

                      {/* Konum */}
                      <td className="py-4 text-gray-500 dark:text-gray-400 max-w-[130px] truncate">
                        {ev.location}
                      </td>

                      {/* Durum / Kalan Gün */}
                      <td className="py-4 text-right whitespace-nowrap">
                        <span
                          className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-xl ${daysMeta.color}`}
                        >
                          {daysMeta.text}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 3. LİSTE GÖRÜNÜMÜ (TIMELINE CARDS VIEW) ── */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
              Zaman Çizelgesi & Etkinlik Akışı ({filteredEvents.length})
            </h3>
            <span className="text-xs text-gray-400">
              Kronolojik olarak listelenmektedir
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.map((ev) => {
              const cat = ACADEMIC_CATEGORIES.find((c) => c.id === ev.category)
              const daysMeta = getDaysUntilText(ev.startDate, ev.endDate)

              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className="p-5 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
                >
                  <div className="space-y-3">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${cat?.badgeBg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${cat?.dot}`} />
                        <span>{cat?.label}</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        {role === 'principal' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenEditModal(ev)
                            }}
                            className="p-1 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                            title="Etkinliği Düzenle"
                          >
                            <Edit3 size={13} />
                          </button>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-xl ${daysMeta.color}`}
                        >
                          {daysMeta.text}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                        {ev.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                        {ev.description}
                      </p>
                    </div>

                    {/* Metadata Box */}
                    <div className="p-3 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                        <span className="flex items-center gap-1.5 text-gray-400">
                          <CalendarIcon size={13} />
                          Tarih:
                        </span>
                        <span className="font-extrabold text-gray-900 dark:text-white font-mono">
                          {ev.startDate}
                          {ev.endDate && ` — ${ev.endDate}`}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                        <span className="flex items-center gap-1.5 text-gray-400">
                          <Clock size={13} />
                          Saat:
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {ev.time || 'Tam Gün'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                        <span className="flex items-center gap-1.5 text-gray-400">
                          <Users size={13} />
                          Kitle:
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[170px]">
                          {ev.targetAudience}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    <span>Detaylı Bilgiyi Görüntüle</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── MODAL: ETKİNLİK DETAY MODALI (TÜM PROFİLLER İÇİN) ── */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-jakarta">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0E1526] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 z-10 space-y-4 max-h-[92vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                        ACADEMIC_CATEGORIES.find((c) => c.id === selectedEvent.category)?.badgeBg
                      }`}
                    >
                      {selectedEvent.categoryLabel}
                    </span>

                    {selectedEvent.isOfficialMeb && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                        MEB Resmi Takvimi
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-snug">
                    {selectedEvent.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 cursor-pointer shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Countdown Pill */}
              {(() => {
                const daysMeta = getDaysUntilText(selectedEvent.startDate, selectedEvent.endDate)
                return (
                  <div className={`p-3 rounded-2xl flex items-center gap-2.5 text-xs font-bold ${daysMeta.color}`}>
                    <Clock size={16} />
                    <span>Etkinlik Zamanı: <strong>{daysMeta.text}</strong></span>
                  </div>
                )
              })()}

              {/* Event Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/50 dark:border-gray-700/50 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">Başlangıç Tarihi</span>
                  <strong className="text-gray-900 dark:text-white font-mono">{selectedEvent.startDate}</strong>
                </div>

                {selectedEvent.endDate && (
                  <div>
                    <span className="text-[10px] text-gray-400 block font-bold uppercase">Bitiş Tarihi</span>
                    <strong className="text-gray-900 dark:text-white font-mono">{selectedEvent.endDate}</strong>
                  </div>
                )}

                <div>
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">Saat / Zaman Aralığı</span>
                  <strong className="text-gray-900 dark:text-white">{selectedEvent.time || 'Tam Gün'}</strong>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">Konum / Yer</span>
                  <strong className="text-gray-900 dark:text-white">{selectedEvent.location}</strong>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">Hedef Kitle / Katılımcılar</span>
                  <strong className="text-gray-900 dark:text-white">{selectedEvent.targetAudience}</strong>
                </div>
              </div>

              {/* Description Body */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                  Etkinlik & Mevzuat Detayları
                </h4>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200/60 dark:border-gray-800">
                  {selectedEvent.description}
                </p>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 gap-2 flex-wrap">
                {role === 'principal' ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleOpenEditModal(selectedEvent)
                        setSelectedEvent(null)
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-800"
                    >
                      <Edit3 size={13} />
                      <span>Etkinliği Düzenle</span>
                    </button>

                    {!selectedEvent.isOfficialMeb && (
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(selectedEvent.id, selectedEvent.title)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trash2 size={13} />
                        <span>Sil</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-[11px] text-gray-400">
                    {selectedEvent.isOfficialMeb
                      ? 'Milli Eğitim Bakanlığı Resmi Genelgesi'
                      : 'Okul Müdürlüğü Tarafından Eklenen Etkinlik'}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-xs font-bold text-gray-700 dark:text-gray-300 transition-colors cursor-pointer ml-auto"
                >
                  Kapat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: MÜDÜR YENİ ETKİNLİK EKLEME MODALI ── */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-jakarta">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0E1526] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 z-10 space-y-4 max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white">
                    Yeni Akademik Etkinlik / Önemli Gün Ekle
                  </h3>
                  <p className="text-xs text-gray-400">
                    Öğrenci ve öğretmenlerin akademik takviminde görüntülenecektir
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddEvent} className="space-y-4 text-xs">
                {/* 1. Başlık */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">
                    Etkinlik / Önemli Gün Başlığı:
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Örn: 1. Dönem Veli Toplantısı veya TÜBİTAK Bilim Şenliği"
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* 2. Kategori */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">Kategori:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {ACADEMIC_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Başlangıç ve Bitiş Tarihi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700 dark:text-gray-300">Başlangıç Tarihi:</label>
                    <input
                      type="date"
                      required
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700 dark:text-gray-300">Bitiş Tarihi (İsteğe Bağlı):</label>
                    <input
                      type="date"
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* 4. Saat ve Konum */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700 dark:text-gray-300">Saat / Zaman Aralığı:</label>
                    <input
                      type="text"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      placeholder="Örn: 10:00 - 14:00 veya Tam Gün"
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700 dark:text-gray-300">Konum / Yer:</label>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="Örn: Konferans Salonu"
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* 5. Hedef Kitle */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">Hedef Kitle / Katılımcılar:</label>
                  <input
                    type="text"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    placeholder="Örn: Tüm Okul, 9-A Şubesi, Öğretmenler"
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* 6. Açıklama */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">Etkinlik Açıklaması:</label>
                  <textarea
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Etkinlik hakkında detaylar, duyuru notları veya veli bilgilendirmesi..."
                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    Vazgeç
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md shadow-indigo-600/30 cursor-pointer"
                  >
                    Takvime Kaydet & Yayınla
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: MÜDÜR ETKİNLİK GÜNCELLEME MODALI ── */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-jakarta">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0E1526] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 z-10 space-y-4 max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Edit3 size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900 dark:text-white">
                      Akademik Etkinliği Güncelle
                    </h3>
                    <p className="text-xs text-gray-400">
                      Yapılan değişiklikler anında öğretmen ve öğrenci takvimlerine yansıtılır
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveEditEvent} className="space-y-4 text-xs">
                {/* 1. Başlık */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">
                    Etkinlik / Önemli Gün Başlığı:
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Örn: 1. Dönem Veli Toplantısı"
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* 2. Kategori */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">Kategori:</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {ACADEMIC_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Başlangıç ve Bitiş Tarihi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700 dark:text-gray-300">Başlangıç Tarihi:</label>
                    <input
                      type="date"
                      required
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700 dark:text-gray-300">Bitiş Tarihi (İsteğe Bağlı):</label>
                    <input
                      type="date"
                      value={editEndDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* 4. Saat ve Konum */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700 dark:text-gray-300">Saat / Zaman Aralığı:</label>
                    <input
                      type="text"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      placeholder="Örn: 10:00 - 14:00 veya Tam Gün"
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700 dark:text-gray-300">Konum / Yer:</label>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      placeholder="Örn: Konferans Salonu"
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* 5. Hedef Kitle */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">Hedef Kitle / Katılımcılar:</label>
                  <input
                    type="text"
                    value={editTarget}
                    onChange={(e) => setEditTarget(e.target.value)}
                    placeholder="Örn: Tüm Okul, 9-A Şubesi, Öğretmenler"
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* 6. Açıklama */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">Etkinlik Açıklaması:</label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Etkinlik hakkında detaylar..."
                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    Vazgeç
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md shadow-indigo-600/30 cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit3 size={14} />
                    <span>Güncellemeyi Kaydet</span>
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
