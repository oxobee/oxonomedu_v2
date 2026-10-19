'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileText,
  Calendar,
  Sparkles,
  BookOpen,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  List,
  Check,
  Save,
  Trash2,
  ExternalLink,
  Layers,
  HelpCircle,
  X,
  Share2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { MebBookItem } from '@/lib/student/mebBooksData'
import {
  getBookReadingProgress,
  saveBookReadingProgress,
  getBookBookmarks,
  togglePageBookmark,
  getBookNotes,
  saveBookNoteToDefterim,
  deleteBookNoteFromDefterim,
  addReadingGoalToPlanner,
  type BookBookmark,
} from '@/lib/student/studentLibraryStorage'
import type { StudentNote } from '@/components/Student/views/StudentPlannerView'

interface MobileBookReaderProps {
  book: MebBookItem
  initialPage?: number
  onClose: () => void
}

export default function MobileBookReader({
  book,
  initialPage,
  onClose,
}: MobileBookReaderProps) {
  // Reading Mode: Clean PDF View by default (User Rule: Normal PDF Kitap, no pen/drawing clutter)
  const hasInteractive = !!book.etkilesimliKitapUrl
  const [readingMode, setReadingMode] = useState<'interactive' | 'pdf'>('pdf')

  // Reading Theme: 'dark' | 'light' | 'sepia'
  const [readerTheme, setReaderTheme] = useState<'dark' | 'light' | 'sepia'>('dark')

  // Progress State
  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (initialPage && initialPage > 0) return initialPage
    if (typeof window !== 'undefined') {
      const saved = getBookReadingProgress(book.id)
      if (saved && saved.currentPage > 0) return saved.currentPage
    }
    return 1
  })
  const [totalPages, setTotalPages] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = getBookReadingProgress(book.id)
      if (saved && saved.totalPages > 0) return saved.totalPages
    }
    return 180 // Default realistic textbook page count
  })

  // Zoom scale for PDF mode
  const [zoomLevel, setZoomLevel] = useState<number>(1)

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Overlay Drawers / Modals
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false)
  const [isNotesOpen, setIsNotesOpen] = useState(false)
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false)
  const [isPlannerOpen, setIsPlannerOpen] = useState(false)
  const [isJumpModalOpen, setIsJumpModalOpen] = useState(false)
  const [jumpPageInput, setJumpPageInput] = useState<string>('')

  // Bookmarks & Notes lists
  const [bookmarks, setBookmarks] = useState<BookBookmark[]>([])
  const [notes, setNotes] = useState<StudentNote[]>([])

  // Form states for adding note
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')

  // Form states for planner goal
  const [planPageStart, setPlanPageStart] = useState<number>(currentPage)
  const [planPageEnd, setPlanPageEnd] = useState<number>(Math.min(currentPage + 10, totalPages))
  const [planDateLabel, setPlanDateLabel] = useState('Yarın')

  // Load bookmarks and notes
  const reloadData = useCallback(() => {
    setBookmarks(getBookBookmarks(book.id))
    setNotes(getBookNotes(book.id))
  }, [book.id])

  useEffect(() => {
    reloadData()
  }, [reloadData])

  // Sync progress on page change
  useEffect(() => {
    saveBookReadingProgress(book.id, currentPage, totalPages)
  }, [book.id, currentPage, totalPages])

  // Is current page bookmarked?
  const isCurrentPageBookmarked = bookmarks.some((b) => b.pageNumber === currentPage)

  // Handle page navigation
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1)
    } else {
      toast('Kitabın ilk sayfasındasınız', { icon: 'ℹ️' })
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((p) => p + 1)
    } else {
      toast.success('Tebrikler! Kitabın son sayfasına ulaştınız.', { icon: '🎉' })
    }
  }

  const handleJumpToPage = (e: React.FormEvent) => {
    e.preventDefault()
    const target = parseInt(jumpPageInput, 10)
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      setCurrentPage(target)
      setIsJumpModalOpen(false)
      setJumpPageInput('')
      toast.success(`Sayfa ${target}'e geçildi.`)
    } else {
      toast.error(`Lütfen 1 ile ${totalPages} arasında geçerli bir sayfa giriniz.`)
    }
  }

  // Toggle bookmark on current page
  const handleToggleBookmark = () => {
    const isNowBookmarked = togglePageBookmark(book.id, book.title, currentPage)
    reloadData()
    if (isNowBookmarked) {
      toast.success(`Sayfa ${currentPage} yer işaretlerine eklendi!`, { icon: '🔖' })
    } else {
      toast(`Sayfa ${currentPage} yer işaretlerinden çıkarıldı.`, { icon: '🗑️' })
    }
  }

  // Save new note to Defterim
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteContent.trim()) {
      toast.error('Lütfen not içeriği yazınız.')
      return
    }

    saveBookNoteToDefterim({
      bookId: book.id,
      bookTitle: book.title,
      course: book.subject,
      pageNumber: currentPage,
      title: noteTitle.trim() || `${book.title} (S. ${currentPage})`,
      content: noteContent.trim(),
    })

    setNoteTitle('')
    setNoteContent('')
    setIsAddNoteOpen(false)
    reloadData()
    toast.success('Notunuz kaydedildi ve Defterim modülüne eklendi!', { icon: '📝' })
  }

  // Save reading goal to Planlayıcım
  const handleSavePlanGoal = (e: React.FormEvent) => {
    e.preventDefault()
    addReadingGoalToPlanner({
      bookId: book.id,
      bookTitle: book.title,
      course: book.subject,
      pageStart: Number(planPageStart) || currentPage,
      pageEnd: Number(planPageEnd) || currentPage + 5,
      dueDateLabel: planDateLabel,
    })

    setIsPlannerOpen(false)
    toast.success('Okuma hedefi kaydedildi ve Planlayıcım ajandasına eklendi!', { icon: '📅' })
  }

  // Toggle fullscreen
  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen()
          setIsFullscreen(true)
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
          setIsFullscreen(false)
        }
      }
    } catch {
      // Fallback for iOS Safari which doesn't support requestFullscreen on div
      setIsFullscreen(!isFullscreen)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNextPage()
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrevPage()
      } else if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPage, totalPages])

  // Touch Swipe navigation on reader body
  const touchStartX = useRef<number>(0)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current
    if (diff > 60) {
      handlePrevPage()
    } else if (diff < -60) {
      handleNextPage()
    }
  }

  // PDF stream proxy URL
  const pdfProxyUrl = book.pdfUrl
    ? `/api/books/pdf-proxy?url=${encodeURIComponent(book.pdfUrl)}#page=${currentPage}`
    : null

  // Calculate reading progress percentage
  const readingPercent = Math.min(100, Math.round((currentPage / totalPages) * 100))

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col w-full h-full select-none overflow-hidden transition-colors duration-200 ${
        readerTheme === 'dark'
          ? 'bg-[#0B0F19] text-white'
          : readerTheme === 'sepia'
          ? 'bg-[#F4ECD8] text-[#3D332A]'
          : 'bg-[#F8FAFC] text-gray-900'
      }`}
    >
      {/* ── TOP APP BAR (Compact & Mobile-friendly) ── */}
      <header
        className={`shrink-0 flex items-center justify-between px-3 sm:px-5 h-14 border-b z-20 backdrop-blur-md transition-colors ${
          readerTheme === 'dark'
            ? 'bg-[#0B0F19]/90 border-white/10 text-white'
            : readerTheme === 'sepia'
            ? 'bg-[#EBDDC3]/95 border-[#D8C7A5] text-[#3D332A]'
            : 'bg-white/95 border-gray-200 text-gray-900'
        }`}
      >
        {/* Left: Back / Close & Book Metadata */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={onClose}
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer ${
              readerTheme === 'dark'
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-black/5 hover:bg-black/10 text-gray-800'
            }`}
            title="Kitaplığa Geri Dön"
          >
            <ArrowLeft size={18} strokeWidth={2.4} />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#F0D8FA] text-[#4B075F] border border-[#D5C5DC]">
                {book.gradeName}
              </span>
              <span className="text-[10px] font-bold opacity-75 truncate hidden sm:inline">
                {book.subject}
              </span>
            </div>
            <h1 className="text-xs sm:text-sm font-black truncate leading-tight mt-0.5">
              {book.title}
            </h1>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Quick Bookmark Button */}
          <button
            type="button"
            onClick={handleToggleBookmark}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
              isCurrentPageBookmarked
                ? 'bg-amber-500 text-white shadow-sm'
                : readerTheme === 'dark'
                ? 'bg-white/10 hover:bg-white/15 text-white'
                : 'bg-black/5 hover:bg-black/10 text-gray-700'
            }`}
            title={isCurrentPageBookmarked ? 'Yer işaretini kaldır' : 'Bu sayfayı işaretle'}
          >
            {isCurrentPageBookmarked ? (
              <BookmarkCheck size={17} strokeWidth={2.4} />
            ) : (
              <Bookmark size={17} strokeWidth={2} />
            )}
          </button>

          {/* Add Note Button */}
          <button
            type="button"
            onClick={() => setIsAddNoteOpen(true)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
              readerTheme === 'dark'
                ? 'bg-white/10 hover:bg-white/15 text-white'
                : 'bg-black/5 hover:bg-black/10 text-gray-700'
            }`}
            title="Bu sayfaya not ekle (Defterim ile eşitlenir)"
          >
            <FileText size={17} strokeWidth={2} />
          </button>

          {/* Add Planner Goal Button */}
          <button
            type="button"
            onClick={() => setIsPlannerOpen(true)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
              readerTheme === 'dark'
                ? 'bg-white/10 hover:bg-white/15 text-white'
                : 'bg-black/5 hover:bg-black/10 text-gray-700'
            }`}
            title="Okuma hedefi oluştur (Planlayıcım ile eşitlenir)"
          >
            <Calendar size={17} strokeWidth={2} />
          </button>

          {/* Theme switcher */}
          <button
            type="button"
            onClick={() => {
              if (readerTheme === 'dark') setReaderTheme('light')
              else if (readerTheme === 'light') setReaderTheme('sepia')
              else setReaderTheme('dark')
            }}
            className={`hidden sm:flex w-9 h-9 rounded-xl items-center justify-center transition-all cursor-pointer text-xs font-black ${
              readerTheme === 'dark'
                ? 'bg-white/10 text-white'
                : 'bg-black/5 text-gray-700'
            }`}
            title="Okuma teması değiştir (Koyu / Açık / Sepya)"
          >
            {readerTheme === 'dark' ? '🌙' : readerTheme === 'sepia' ? '📜' : '☀️'}
          </button>

          {/* Fullscreen toggle (Mobile & Desktop) */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className={`flex w-9 h-9 rounded-xl items-center justify-center transition-all cursor-pointer active:scale-95 ${
              readerTheme === 'dark'
                ? 'bg-white/10 hover:bg-white/15 text-white'
                : 'bg-black/5 hover:bg-black/10 text-gray-700'
            }`}
            title="Tam Ekran"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </header>

      {/* ── PROGRESS BAR (Top hairline indicator) ── */}
      <div className="w-full h-1 bg-gray-200 dark:bg-white/10 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#4B075F] to-[#D914C8]"
          style={{ width: `${readingPercent}%` }}
          initial={false}
          animate={{ width: `${readingPercent}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* ── MAIN READER VIEWPORT (Edge-to-Edge Clean PDF Reading Experience) ── */}
      <main
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="flex-1 relative w-full h-full overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-900"
      >
        {/* Floating Mobile Page Switcher (Left: Previous Page) */}
        <button
          type="button"
          onClick={handlePrevPage}
          disabled={currentPage <= 1}
          className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/65 backdrop-blur-md text-white flex items-center justify-center shadow-2xl active:scale-90 transition-all border border-white/20 disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
          aria-label="Önceki Sayfa"
        >
          <ChevronLeft size={24} strokeWidth={2.8} />
        </button>

        {/* Floating Mobile Page Switcher (Right: Next Page) */}
        <button
          type="button"
          onClick={handleNextPage}
          disabled={currentPage >= totalPages}
          className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/65 backdrop-blur-md text-white flex items-center justify-center shadow-2xl active:scale-90 transition-all border border-white/20 disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
          aria-label="Sonraki Sayfa"
        >
          <ChevronRight size={24} strokeWidth={2.8} />
        </button>

        {/* PDF Document Viewport */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden p-0">
          {pdfProxyUrl ? (
            <div
              className="w-full h-full flex items-center justify-center transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
            >
              <iframe
                src={pdfProxyUrl}
                title={`${book.title} — Sayfa ${currentPage}`}
                className="w-full h-full border-0 bg-white"
                allow="fullscreen"
              />
            </div>
          ) : book.etkilesimliKitapUrl ? (
            <iframe
              src={book.etkilesimliKitapUrl}
              title={book.title}
              className="w-full h-full border-0 bg-transparent"
              allow="fullscreen"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 p-8 text-center max-w-sm">
              <BookOpen size={48} className="text-gray-400 opacity-60" />
              <h3 className="text-base font-extrabold">PDF Kaynağı Hazırlanıyor</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Bu kitap için dijital PDF akış bağlantısı kuruluyor.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* ── BOTTOM THUMB-FRIENDLY ACTION BAR (Mobile-First Navigation) ── */}
      <footer
        className={`shrink-0 flex items-center justify-between px-3 sm:px-6 h-16 border-t z-20 backdrop-blur-md transition-colors ${
          readerTheme === 'dark'
            ? 'bg-[#0B0F19]/95 border-white/10 text-white'
            : readerTheme === 'sepia'
            ? 'bg-[#EBDDC3]/95 border-[#D8C7A5] text-[#3D332A]'
            : 'bg-white/95 border-gray-200 text-gray-900'
        }`}
      >
        {/* Sol: Önceki Sayfa */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className={`h-10 px-3 sm:px-4 rounded-xl flex items-center gap-1 font-extrabold text-xs transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${
              readerTheme === 'dark'
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-black/5 hover:bg-black/10 text-gray-800'
            }`}
          >
            <ChevronLeft size={18} strokeWidth={2.4} />
            <span className="hidden sm:inline">Önceki</span>
          </button>

          {/* Yer İşaretleri Listesi Butonu */}
          <button
            type="button"
            onClick={() => setIsBookmarksOpen(true)}
            className={`h-10 px-2.5 rounded-xl flex items-center gap-1.5 font-bold text-xs transition-all cursor-pointer ${
              readerTheme === 'dark'
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-black/5 hover:bg-black/10 text-gray-800'
            }`}
            title="Yer işaretli sayfaları listele"
          >
            <Bookmark size={15} />
            <span className="hidden md:inline">İşaretler</span>
            {bookmarks.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black">
                {bookmarks.length}
              </span>
            )}
          </button>
        </div>

        {/* Orta: Sayfa Göstergesi & Hızlı Sayfaya Git */}
        <button
          type="button"
          onClick={() => {
            setJumpPageInput(String(currentPage))
            setIsJumpModalOpen(true)
          }}
          className={`h-10 px-3 sm:px-4 rounded-xl flex items-center gap-2 border font-extrabold text-xs transition-all cursor-pointer shadow-xs active:scale-95 ${
            readerTheme === 'dark'
              ? 'bg-white/15 border-white/20 text-white hover:bg-white/25'
              : 'bg-black/5 border-black/10 text-gray-900 hover:bg-black/10'
          }`}
          title="Sayfa numarasına dokunarak doğrudan sayfaya atlayın"
        >
          <span className="text-[#4B075F] dark:text-[#C58ADB] font-black">{currentPage}</span>
          <span className="opacity-50">/</span>
          <span>{totalPages}</span>
          <span className="text-[10px] opacity-70 hidden sm:inline">(%{readingPercent})</span>
        </button>

        {/* Sağ: Yakınlaştırma & Sonraki Sayfa */}
        <div className="flex items-center gap-1.5">
          {/* Zoom Controls for PDF mode */}
          {readingMode === 'pdf' && (
            <div className="hidden sm:flex items-center gap-1 mr-1">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
                title="Uzaklaştır"
              >
                <ZoomOut size={14} />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="px-2 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold flex items-center justify-center cursor-pointer"
                title="Sıfırla"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.15))}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
                title="Yakınlaştır"
              >
                <ZoomIn size={14} />
              </button>
            </div>
          )}

          {/* Notlarım Listesi Butonu */}
          <button
            type="button"
            onClick={() => setIsNotesOpen(true)}
            className={`h-10 px-2.5 rounded-xl flex items-center gap-1.5 font-bold text-xs transition-all cursor-pointer ${
              readerTheme === 'dark'
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-black/5 hover:bg-black/10 text-gray-800'
            }`}
            title="Bu kitaba ait aldığınız notlar (Defterim)"
          >
            <FileText size={15} />
            <span className="hidden md:inline">Notlarım</span>
            {notes.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#4B075F] text-white text-[10px] font-black">
                {notes.length}
              </span>
            )}
          </button>

          {/* Sonraki Sayfa Butonu */}
          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="h-10 px-3 sm:px-4 rounded-xl flex items-center gap-1 bg-[#4B075F] hover:bg-[#620B79] text-white font-extrabold text-xs transition-all cursor-pointer shadow-md shadow-purple-900/25 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
          >
            <span className="hidden sm:inline">Sonraki</span>
            <ChevronRight size={18} strokeWidth={2.4} />
          </button>
        </div>
      </footer>

      {/* ── MODAL 1: SAYFAYA ATLA (Jump to Page Modal) ── */}
      <AnimatePresence>
        {isJumpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsJumpModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xs bg-white dark:bg-[#111624] text-gray-900 dark:text-white rounded-3xl p-5 shadow-2xl z-10 border border-gray-200 dark:border-white/10"
            >
              <h3 className="text-base font-extrabold mb-1">Sayfaya Git</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                1 ile {totalPages} arasında bir sayfa numarası girin:
              </p>
              <form onSubmit={handleJumpToPage} className="space-y-3">
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  autoFocus
                  value={jumpPageInput}
                  onChange={(e) => setJumpPageInput(e.target.value)}
                  placeholder={`Örn: ${currentPage}`}
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 text-sm font-bold text-center outline-hidden focus:border-[#4B075F]"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsJumpModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-xs font-bold cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#4B075F] text-white text-xs font-bold cursor-pointer shadow-md"
                  >
                    Sayfayı Aç
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: NOT EKLE (Add Note <-> Defterim Sync) ── */}
      <AnimatePresence>
        {isAddNoteOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddNoteOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-w-md bg-white dark:bg-[#111624] text-gray-900 dark:text-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl z-10 border border-gray-200 dark:border-white/10 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#4B075F] dark:text-[#C58ADB] tracking-wider">
                    Defterim Entegrasyonu
                  </span>
                  <h3 className="text-base font-extrabold mt-0.5">
                    Sayfa {currentPage} İçin Not Al
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddNoteOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                Bu not doğrudan öğrenci profilinizdeki <strong>Defterim</strong> alanına kaydedilecek ve kitap sayfa referansını koruyacaktır.
              </p>

              <form onSubmit={handleSaveNote} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Not Başlığı (İsteğe Bağlı)
                  </label>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder={`${book.title} — Önemli Nokta`}
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 text-xs font-medium outline-hidden focus:border-[#4B075F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Kişisel Çalışma Notunuz *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Bu sayfada dikkat çeken konu, tanım, formül veya soru çözüm ipucunu yazın..."
                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 text-xs font-medium outline-hidden focus:border-[#4B075F] resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddNoteOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-xs font-bold cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#4B075F] text-white text-xs font-bold cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Save size={14} />
                    <span>Defterime Kaydet</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 3: YER İŞARETLERİ ÇEKMECESİ (Bookmarks Drawer) ── */}
      <AnimatePresence>
        {isBookmarksOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBookmarksOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-w-md bg-white dark:bg-[#111624] text-gray-900 dark:text-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl z-10 border border-gray-200 dark:border-white/10 max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <Bookmark className="text-amber-500" size={18} />
                  <h3 className="text-base font-extrabold">Kayıtlı Yer İşaretleri</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBookmarksOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 space-y-2 pr-0.5">
                {bookmarks.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-xs rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                    Bu kitapta henüz bir yer işareti eklenmemiş. Okurken üstteki yer işareti butonuna basarak sayfayı kaydedebilirsiniz.
                  </div>
                ) : (
                  bookmarks.map((bm) => (
                    <div
                      key={bm.id}
                      className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200/70 dark:border-white/10 flex items-center justify-between gap-3 hover:border-amber-400/60 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentPage(bm.pageNumber)
                          setIsBookmarksOpen(false)
                          toast.success(`Sayfa ${bm.pageNumber}'e geçildi.`)
                        }}
                        className="flex-1 text-left cursor-pointer min-w-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-300 text-xs font-black">
                            Sayfa {bm.pageNumber}
                          </span>
                          <span className="text-[11px] text-gray-400 font-medium">
                            {bm.createdAt}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-1 truncate">
                          {bm.title}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          togglePageBookmark(book.id, book.title, bm.pageNumber)
                          reloadData()
                          toast('Yer işareti silindi.')
                        }}
                        className="text-gray-400 hover:text-rose-500 p-1 cursor-pointer"
                        title="İşareti Sil"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 4: KİTAP NOTLARI ÇEKMECESİ (Defterim Notes List) ── */}
      <AnimatePresence>
        {isNotesOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotesOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-w-md bg-white dark:bg-[#111624] text-gray-900 dark:text-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl z-10 border border-gray-200 dark:border-white/10 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <FileText className="text-[#8D49A6]" size={18} />
                  <h3 className="text-base font-extrabold">Kitap Notlarım (Defterim)</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotesOpen(false)
                      setIsAddNoteOpen(true)
                    }}
                    className="px-2.5 py-1 rounded-xl bg-[#4B075F] text-white text-xs font-bold cursor-pointer"
                  >
                    + Yeni Not
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNotesOpen(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 space-y-2.5 pr-0.5">
                {notes.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-xs rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                    Bu kitaba ait henüz bir ders notu almadınız.
                  </div>
                ) : (
                  notes.map((n: any) => (
                    <div
                      key={n.id}
                      className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200/70 dark:border-white/10 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-[#4B075F] dark:text-[#C58ADB]">
                          Sayfa {n.pageNumber || '—'} Notu
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 font-medium">
                            {n.date}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              deleteBookNoteFromDefterim(n.id)
                              reloadData()
                              toast('Not Defterimden silindi.')
                            }}
                            className="text-gray-400 hover:text-rose-500 cursor-pointer"
                            title="Notu Sil"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                        {n.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {n.content}
                      </p>
                      {n.pageNumber && (
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentPage(n.pageNumber)
                            setIsNotesOpen(false)
                            toast.success(`Sayfa ${n.pageNumber}'e geçildi.`)
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4B075F] dark:text-[#C58ADB] hover:underline cursor-pointer pt-1"
                        >
                          <span>Bu sayfaya git</span>
                          <ChevronRight size={12} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 5: PLANLAYICIM HEDEFİ EKLE (Reading Goal <-> Planlayıcım Sync) ── */}
      <AnimatePresence>
        {isPlannerOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPlannerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-w-md bg-white dark:bg-[#111624] text-gray-900 dark:text-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl z-10 border border-gray-200 dark:border-white/10"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#4B075F] dark:text-[#C58ADB] tracking-wider">
                    Planlayıcım Entegrasyonu
                  </span>
                  <h3 className="text-base font-extrabold mt-0.5">
                    Okuma Hedefi Oluştur
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPlannerOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                Bu okuma görevi ajandanıza eklenir. Planlayıcım ekranınızdan tek dokunuşla kitaba ve ilgili sayfaya geri dönebilirsiniz.
              </p>

              <form onSubmit={handleSavePlanGoal} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Başlangıç Sayfası
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={planPageStart}
                      onChange={(e) => setPlanPageStart(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 text-xs font-bold outline-hidden focus:border-[#4B075F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Bitiş Sayfası
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={planPageEnd}
                      onChange={(e) => setPlanPageEnd(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 text-xs font-bold outline-hidden focus:border-[#4B075F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Hedef Tarihi / Zamanı
                  </label>
                  <select
                    value={planDateLabel}
                    onChange={(e) => setPlanDateLabel(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 text-xs font-bold outline-hidden focus:border-[#4B075F] cursor-pointer"
                  >
                    <option value="Bugün">Bugün</option>
                    <option value="Yarın">Yarın</option>
                    <option value="Bu Hafta Sonu">Bu Hafta Sonu</option>
                    <option value="Pazartesi">Pazartesi</option>
                    <option value="Gelecek Hafta">Gelecek Hafta</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-[#F0D8FA]/50 dark:bg-[#2D2035] border border-[#D5C5DC]/60 dark:border-[#49364F] text-[11px] text-[#4B075F] dark:text-[#C58ADB] font-medium">
                  Görev: “{book.title}, {planPageStart}–{planPageEnd}. sayfaları oku ({planDateLabel})”
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPlannerOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-xs font-bold cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#4B075F] text-white text-xs font-bold cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Calendar size={14} />
                    <span>Planlayıcıma Ekle</span>
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
