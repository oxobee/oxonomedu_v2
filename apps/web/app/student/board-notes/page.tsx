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
  User,
  Trash2,
  Edit3,
  StickyNote,
  AlertTriangle,
  Sparkles,
  Check,
} from 'lucide-react'
import {
  getSavedBoardNotes,
  deleteBoardNote,
  updateStudentBoardNote,
  type SavedBoardNote,
} from '@/lib/board/boardNotesStorage'
import { getSynchronizedStudentProfile } from '@/lib/student/studentData'
import SmartBoardMockup from '@/components/Student/board/SmartBoardMockup'
import toast from 'react-hot-toast'

export default function StudentBoardNotesPage() {
  const [notes, setNotes] = useState<SavedBoardNote[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [activeModalNote, setActiveModalNote] = useState<SavedBoardNote | null>(null)
  const [studentClass, setStudentClass] = useState('1/A')

  // Note Add / Edit Modal State
  const [noteToEdit, setNoteToEdit] = useState<SavedBoardNote | null>(null)
  const [noteInputText, setNoteInputText] = useState('')

  // Cute Delete Confirmation Modal State
  const [noteToDelete, setNoteToDelete] = useState<SavedBoardNote | null>(null)

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

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (noteToDelete) {
          setNoteToDelete(null)
        } else if (noteToEdit) {
          setNoteToEdit(null)
        } else if (activeModalNote) {
          setActiveModalNote(null)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeModalNote, noteToEdit, noteToDelete])

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
          (n.studentNote && n.studentNote.toLowerCase().includes(q)) ||
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

  // Save student note handler
  const handleSaveStudentNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteToEdit) return

    updateStudentBoardNote(noteToEdit.id, noteInputText)

    if (activeModalNote?.id === noteToEdit.id) {
      setActiveModalNote({
        ...activeModalNote,
        studentNote: noteInputText.trim(),
        studentNoteUpdatedAt: Date.now(),
      })
    }

    toast.success('Harika! Notunuz kaydedildi ve Sınavlar ve Notlar ekranına eklendi ✨', {
      icon: '📝',
      duration: 3500,
    })

    setNoteToEdit(null)
  }

  // Delete note handler after confirmation
  const handleConfirmDelete = () => {
    if (!noteToDelete) return

    const deletedTitle = noteToDelete.title
    deleteBoardNote(noteToDelete.id)

    if (activeModalNote?.id === noteToDelete.id) {
      setActiveModalNote(null)
    }

    setNoteToDelete(null)
    toast.success(`"${deletedTitle}" arşivinizden başarıyla silindi.`, {
      icon: '🗑️',
      duration: 3000,
    })
  }

  // Quick note template tags
  const quickTags = [
    '🎯 1. Yazılıda Çıkacak!',
    '📐 Önemli Pisagor Formülü',
    '⭐ Sınav Öncesi Mutlaka Tekrar Et',
    '⚠️ Dikkat: Yüklem İlk Bulunur',
    '🪐 Gezegen Sıralaması Kodlaması',
  ]

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-jakarta select-none">
      {/* ── HEADER BANNER ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-xs"
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4B075F]/10 dark:bg-[#4B075F]/30 text-[#8D49A6] dark:text-[#D914C8] text-xs font-bold">
            <Presentation size={14} />
            <span>Akıllı Tahta Arşivi ({studentClass} Sınıfı)</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Akıllı Tahta Notları
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Öğretmenlerinizin derste akıllı tahtaya çizdiği ders notları. Kişisel çalışma notu ekleyebilir veya arşivinizi yönetebilirsiniz.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="px-3.5 py-1.5 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200/60 dark:border-purple-800/60 text-xs font-extrabold text-[#4B075F] dark:text-[#C58ADB]">
            {filteredNotes.length} Kayıtlı Tahta Notu
          </span>
        </div>
      </motion.div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
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
              placeholder="Ders adı, not içeriği veya tarih ile ara (örn: Matematik, Pisagor, 21 Ekim)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8D49A6] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
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
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50 text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
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

      {/* ── NOTES GRID (AUTHENTIC SMART BOARD MOCKUP CARDS) ── */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col space-y-3"
            >
              {/* Realistic Interactive Smart Board Frame Mockup */}
              <SmartBoardMockup
                imageUrl={note.imageUrl}
                title={note.title}
                courseName={note.courseName}
                dateStr={note.dateStr}
                studentNote={note.studentNote}
                onExpand={() => setActiveModalNote(note)}
                onAddNote={() => {
                  setNoteToEdit(note)
                  setNoteInputText(note.studentNote || '')
                }}
                onDownload={() => handleDownload(note)}
                onDelete={() => setNoteToDelete(note)}
              />

              {/* Card Meta & Personal Note Box */}
              <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white line-clamp-1">
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-2.5 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-[#8D49A6]" />
                        <span>{note.dateStr}</span>
                      </span>
                      {note.teacherName && (
                        <span className="flex items-center gap-1 truncate">
                          <User size={12} className="text-gray-400" />
                          <span className="truncate">{note.teacherName}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-[#4B075F] dark:text-[#C58ADB] shrink-0">
                    {note.classCodes?.join(', ') || '1/A'}
                  </span>
                </div>

                {/* Personal Study Note Sticky Preview */}
                {note.studentNote ? (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/60 flex items-start justify-between gap-2.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-800 dark:text-amber-300">
                        <StickyNote size={12} className="text-amber-600" />
                        <span>Sınav &amp; Çalışma Notum:</span>
                      </div>
                      <p className="text-xs text-gray-900 dark:text-gray-100 font-semibold mt-1 line-clamp-2 leading-relaxed">
                        {note.studentNote}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setNoteToEdit(note)
                        setNoteInputText(note.studentNote || '')
                      }}
                      className="p-1.5 rounded-lg text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors shrink-0 cursor-pointer"
                      title="Notu Düzenle"
                    >
                      <Edit3 size={13} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setNoteToEdit(note)
                      setNoteInputText('')
                    }}
                    className="w-full py-2 px-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:border-[#8D49A6] dark:hover:border-[#8D49A6] text-gray-500 hover:text-[#8D49A6] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-gray-50/50 dark:bg-gray-800/30"
                  >
                    <StickyNote size={13} />
                    <span>+ Sınav İçin Kişisel Not Ekle</span>
                  </button>
                )}

                {/* Bottom Actions Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setActiveModalNote(note)}
                    className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Maximize2 size={13} />
                    <span>Tam Ekran Aç</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleDownload(note, e)}
                      className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      title="Görseli İndir"
                    >
                      <Download size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoteToDelete(note)}
                      className="p-2 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Bu Tahtayı Sil"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md">
            {/* Backdrop click to close */}
            <div
              className="absolute inset-0"
              onClick={() => setActiveModalNote(null)}
            />

            {/* Elastic Spring Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              className="relative z-10 w-full max-w-5xl max-h-[95vh] bg-[#121826] border border-gray-700/60 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Top Bar */}
              <div className="px-4 py-3 sm:px-6 bg-[#161F32] border-b border-gray-700/60 flex items-center justify-between gap-3 text-white">
                <div className="min-w-0 flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] shrink-0" />
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
                    onClick={() => {
                      setNoteToEdit(activeModalNote)
                      setNoteInputText(activeModalNote.studentNote || '')
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors border border-amber-500/30 cursor-pointer"
                    title="Not Ekle veya Düzenle"
                  >
                    <Edit3 size={13} />
                    <span className="hidden sm:inline">
                      {activeModalNote.studentNote ? 'Notumu Düzenle' : 'Not Ekle'}
                    </span>
                  </button>

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
                    onClick={() => setNoteToDelete(activeModalNote)}
                    className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors border border-rose-800/50 cursor-pointer"
                    title="Tahtayı Sil"
                  >
                    <Trash2 size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModalNote(null)}
                    className="p-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer"
                    title="Kapat (Esc)"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Fullscreen Canvas Viewer */}
              <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center bg-black/70 min-h-[320px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeModalNote.imageUrl}
                  alt={activeModalNote.title}
                  className="max-w-full max-h-[72vh] object-contain rounded-xl shadow-2xl border border-slate-800"
                />
              </div>

              {/* Bottom Study Note Bar in Modal */}
              {activeModalNote.studentNote && (
                <div className="px-4 py-2.5 sm:px-6 bg-[#1A1F2C] border-t border-gray-700/60 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-amber-400 font-extrabold shrink-0 flex items-center gap-1">
                      <StickyNote size={14} />
                      <span>Çalışma Notun:</span>
                    </span>
                    <span className="text-slate-200 truncate font-semibold">
                      {activeModalNote.studentNote}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNoteToEdit(activeModalNote)
                      setNoteInputText(activeModalNote.studentNote || '')
                    }}
                    className="text-[#D914C8] hover:underline font-bold text-xs shrink-0 cursor-pointer"
                  >
                    Düzenle
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CUTE PERSONAL NOTE ADD/EDIT MODAL ── */}
      <AnimatePresence>
        {noteToEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              className="w-full max-w-lg bg-white dark:bg-[#161D2C] border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <StickyNote size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900 dark:text-white leading-tight">
                      Tahtaya Kişisel Çalışma Notu Ekle
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {noteToEdit.title}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setNoteToEdit(null)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Quick tags */}
              <div>
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block mb-1.5">
                  Hızlı Not Şablonları (Tıklayarak Ekle):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {quickTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setNoteInputText((prev) =>
                          prev ? `${prev} ${tag}` : tag
                        )
                      }}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSaveStudentNote} className="space-y-4">
                <div>
                  <textarea
                    rows={4}
                    value={noteInputText}
                    onChange={(e) => setNoteInputText(e.target.value)}
                    placeholder="Bu ders tahtası ile ilgili formülleri, sınavda çıkacak önemli noktaları veya öğretmeninin vurguladığı uyarıları buraya yaz..."
                    className="w-full p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8D49A6] transition-all resize-none font-medium leading-relaxed"
                    autoFocus
                  />
                  <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                    <span>💡 Eklediğin not &quot;Sınavlar ve Notlar&quot; ekranında da otomatik listelenir.</span>
                    <span>{noteInputText.length} karakter</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setNoteToEdit(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    Vazgeç
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-brand-gradient hover:opacity-95 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Check size={15} />
                    <span>Notu Kaydet &amp; Sınavlara Ekle ✨</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CUTE CONFIRMATION MODAL ("EMİN MİSİNİZ?") ── */}
      <AnimatePresence>
        {noteToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-[#161D2C] border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl p-6 text-center space-y-4"
            >
              {/* Cute Animated Trash Icon */}
              <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center shadow-inner">
                <Trash2 size={32} className="animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  Tahta Notunu Silmek İstiyor musunuz? 🗑️
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    &quot;{noteToDelete.title}&quot;
                  </span>{' '}
                  ders kaydı ve bu tahtaya eklediğin kişisel çalışma notların arşivinden kaldırılacaktır. Emin misin?
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setNoteToDelete(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Vazgeç, Kalsın
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-black shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Evet, Sil</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
