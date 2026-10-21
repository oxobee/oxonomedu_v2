'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Presentation,
  Search,
  ArrowUpDown,
  Download,
  X,
  Maximize2,
  Calendar,
  BookOpen,
  User,
  Filter,
  Sparkles,
} from 'lucide-react'
import {
  getSavedBoardNotes,
  deleteBoardNote,
  type SavedBoardNote,
} from '@/lib/board/boardNotesStorage'
import { getSynchronizedStudentProfile } from '@/lib/student/studentData'

export default function StudentBoardNotesPage() {
  const [notes, setNotes] = useState<SavedBoardNote[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [activeModalNote, setActiveModalNote] = useState<SavedBoardNote | null>(null)
  const [studentClass, setStudentClass] = useState('1/A')

  // Load student profile & board notes
  useEffect(() => {
    const sync = () => {
      const prof = getSynchronizedStudentProfile()
      const cls = prof?.className || '1/A'
      setStudentClass(cls)
      setNotes(getSavedBoardNotes(cls))
    }

    sync()
    window.addEventListener('oxonom_board_notes_updated', sync)
    window.addEventListener('oxonom_student_updated', sync)
    window.addEventListener('storage', sync)

    return () => {
      window.removeEventListener('oxonom_board_notes_updated', sync)
      window.removeEventListener('oxonom_student_updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModalNote) {
        setActiveModalNote(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeModalNote])

  // Extract unique courses for filtering
  const courseOptions = useMemo(() => {
    const set = new Set<string>()
    notes.forEach((n) => {
      if (n.courseName) set.add(n.courseName)
    })
    return ['all', ...Array.from(set)]
  }, [notes])

  // Filtered & Sorted Notes
  const filteredNotes = useMemo(() => {
    let result = [...notes]

    if (selectedCourse !== 'all') {
      result = result.filter((n) => n.courseName === selectedCourse)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.courseName.toLowerCase().includes(q) ||
          n.dateStr.toLowerCase().includes(q) ||
          (n.teacherName && n.teacherName.toLowerCase().includes(q))
      )
    }

    result.sort((a, b) => {
      if (sortOrder === 'newest') {
        return (b.timestamp || 0) - (a.timestamp || 0)
      } else {
        return (a.timestamp || 0) - (b.timestamp || 0)
      }
    })

    return result
  }, [notes, selectedCourse, searchQuery, sortOrder])

  // Download image handler
  const handleDownload = (note: SavedBoardNote, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const link = document.createElement('a')
    link.href = note.imageUrl
    const safeName = note.title.replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ_\- ]/g, '').replace(/\s+/g, '_')
    link.download = `${safeName}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-jakarta select-none">
      {/* ── HEADER BANNER ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs"
      >
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0D8FA] dark:bg-[#2D2035] text-[#4B075F] dark:text-[#C58ADB] text-xs font-bold">
            <Presentation size={14} />
            <span>Akıllı Tahta Arşivi • {studentClass}</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Akıllı Tahta Notları
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Öğretmenlerinizin derste akıllı tahtaya çizdiği ve profilinize gönderdiği ders notları.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="px-3.5 py-1.5 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200/60 dark:border-purple-800/60 text-xs font-extrabold text-[#4B075F] dark:text-[#C58ADB]">
            {filteredNotes.length} Kayıtlı Tahta Notu
          </span>
        </div>
      </motion.div>

      {/* ── SEARCH & FILTER CONTROLS (100% RESPONSIVE) ── */}
      <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ders adı veya tarih ile ara (örn: Türkçe, 21 Ekim)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8D49A6] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Sort order toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50 text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
            >
              <ArrowUpDown size={14} className="text-[#8D49A6]" />
              <span>
                {sortOrder === 'newest' ? 'Yeniden Eskiye' : 'Eskiden Yeniye'}
              </span>
            </button>
          </div>
        </div>

        {/* Course Filter Pills */}
        {courseOptions.length > 2 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            {courseOptions.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCourse(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedCourse === c
                    ? 'bg-[#4B075F] text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {c === 'all' ? 'Tüm Dersler' : c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── NOTES GRID (MOCKUP CARDS FORMATTED AS: "DERS ADI - TARİH") ── */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredNotes.map((note) => (
            <motion.div
              key={note.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              onClick={() => setActiveModalNote(note)}
              className="group cursor-pointer rounded-2xl sm:rounded-3xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#121826] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
            >
              {/* Image Mockup Container */}
              <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={note.imageUrl}
                  alt={note.title}
                  className="w-full h-full object-contain group-hover:scale-102 transition-transform duration-300"
                />

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-xl bg-white/90 text-gray-900 text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
                    <Maximize2 size={13} />
                    <span>Tam Ekran Aç</span>
                  </span>
                </div>

                {/* Badge: Course tag */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                    {note.courseName}
                  </span>
                </div>
              </div>

              {/* Card Meta Footer */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  {/* Strict naming template: {Ders Adı} - {Tarih} */}
                  <h3 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white group-hover:text-[#8D49A6] transition-colors line-clamp-1">
                    {note.title}
                  </h3>

                  <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-[#8D49A6]" />
                      <span>{note.dateStr}</span>
                    </span>
                    {note.teacherName && (
                      <span className="flex items-center gap-1 truncate">
                        <User size={13} className="text-gray-400" />
                        <span className="truncate">{note.teacherName}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-[#4B075F] dark:text-[#C58ADB]">
                    {note.classCodes?.join(', ') || '1/A'}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleDownload(note, e)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Görseli İndir"
                  >
                    <Download size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 text-center space-y-3">
          <Presentation size={36} className="text-gray-300 dark:text-gray-600 mx-auto" />
          <div className="text-sm font-extrabold text-gray-800 dark:text-gray-200">
            Aradığınız kritere uygun akıllı tahta notu bulunamadı.
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Öğretmenleriniz akıllı tahtadan çizimleri kaydettiğinde burada otomatik olarak görünecektir.
          </p>
        </div>
      )}

      {/* ── FULL SCREEN ELASTIC SPRING MODAL ── */}
      <AnimatePresence>
        {activeModalNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md">
            {/* Backdrop click to close */}
            <div
              className="absolute inset-0"
              onClick={() => setActiveModalNote(null)}
            />

            {/* Elastic Spring Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              className="relative z-10 w-full max-w-5xl max-h-[94vh] bg-[#121826] border border-gray-700/60 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Top Bar (Minimal, subtle, not eye-straining) */}
              <div className="px-4 py-3 sm:px-6 bg-[#161F32] border-b border-gray-700/60 flex items-center justify-between gap-3 text-white">
                <div className="min-w-0 flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                  <div className="truncate">
                    <h2 className="text-sm sm:text-base font-extrabold truncate">
                      {activeModalNote.title}
                    </h2>
                    <span className="text-[11px] text-gray-400">
                      {activeModalNote.teacherName || 'Ders Öğretmeni'} • Sınıf: {activeModalNote.classCodes?.join(', ')}
                    </span>
                  </div>
                </div>

                {/* Subtle Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownload(activeModalNote)}
                    className="px-3 py-1.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-xs font-bold text-gray-200 flex items-center gap-1.5 transition-colors border border-gray-700 cursor-pointer"
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">İndir</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModalNote(null)}
                    className="px-3 py-1.5 rounded-xl bg-gray-800/80 hover:bg-rose-900/60 text-xs font-bold text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors border border-gray-700 cursor-pointer"
                    title="Kapat (Esc)"
                  >
                    <X size={14} />
                    <span className="hidden sm:inline">Kapat</span>
                  </button>
                </div>
              </div>

              {/* Fullscreen Canvas Viewer */}
              <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center bg-black/60 min-h-[300px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeModalNote.imageUrl}
                  alt={activeModalNote.title}
                  className="max-w-full max-h-[78vh] object-contain rounded-xl shadow-lg"
                />
              </div>

              {/* Bottom Info Bar */}
              <div className="px-4 py-2.5 sm:px-6 bg-[#161F32]/80 border-t border-gray-700/60 flex items-center justify-between text-[11px] text-gray-400">
                <span>Tam ekran akıllı tahta çizim görüntüsü</span>
                <span>ESC tuşu veya arka plana tıklayarak kapatabilirsiniz</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
