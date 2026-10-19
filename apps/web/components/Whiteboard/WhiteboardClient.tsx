'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createQuickdraw } from './core/index.js'
import './core/quickdraw.css'
import {
  FolderOpen,
  Plus,
  Trash2,
} from 'lucide-react'

const INDEX_KEY = 'oxonom-whiteboard-files'
const THEME_KEY = 'oxonom-whiteboard-theme'
const fileKey = (id: string) => `oxonom-whiteboard-file:${id}`

interface WhiteboardFile {
  id: string
  boardNumber: number
  name: string
  updatedAt: number
}

interface WhiteboardIndex {
  current: string
  files: WhiteboardFile[]
}

const newId = () => `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

function normalizeIndex(raw: any): WhiteboardIndex {
  if (!raw || !Array.isArray(raw.files) || raw.files.length === 0) {
    const id = newId()
    return {
      current: id,
      files: [{ id, boardNumber: 1, name: 'Tahta 1', updatedAt: Date.now() }],
    }
  }

  let maxNum = 0
  const files: WhiteboardFile[] = raw.files.map((f: any, idx: number) => {
    const num = typeof f.boardNumber === 'number' && f.boardNumber > 0 ? f.boardNumber : idx + 1
    if (num > maxNum) maxNum = num
    return {
      id: String(f.id || newId()),
      boardNumber: num,
      name: String(f.name || `Tahta ${num}`),
      updatedAt: typeof f.updatedAt === 'number' ? f.updatedAt : Date.now(),
    }
  })

  const currentExists = files.some((f) => f.id === raw.current)
  return {
    current: currentExists ? raw.current : files[0].id,
    files,
  }
}

export default function WhiteboardClient() {
  const router = useRouter()
  const boardRef = useRef<HTMLDivElement>(null)
  const boardInstanceRef = useRef<any>(null)
  const saveTimerRef = useRef<any>(null)

  const [filesIndex, setFilesIndex] = useState<WhiteboardIndex>(() => {
    if (typeof window === 'undefined') {
      return { current: 'f1', files: [{ id: 'f1', boardNumber: 1, name: 'Tahta 1', updatedAt: Date.now() }] }
    }
    try {
      const saved = localStorage.getItem(INDEX_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        const normalized = normalizeIndex(parsed)
        localStorage.setItem(INDEX_KEY, JSON.stringify(normalized))
        return normalized
      }
    } catch {}
    const initialIndex = normalizeIndex(null)
    try {
      localStorage.setItem(INDEX_KEY, JSON.stringify(initialIndex))
    } catch {}
    return initialIndex
  })

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentFileName, setCurrentFileName] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const filesBtnRef = useRef<HTMLButtonElement>(null)

  const currentFile = useCallback(() => {
    return filesIndex.files.find((f) => f.id === filesIndex.current) || filesIndex.files[0]
  }, [filesIndex])

  // Save current document to localStorage
  const saveNow = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    const board = boardInstanceRef.current
    if (!board) return
    const file = currentFile()
    if (!file) return

    try {
      const snap = board.editor.store.getSnapshot()
      localStorage.setItem(fileKey(file.id), JSON.stringify(snap))
      file.updatedAt = Date.now()
      localStorage.setItem(INDEX_KEY, JSON.stringify(filesIndex))
    } catch (err) {
      console.warn('Whiteboard save skipped (storage limit)', err)
    }
  }, [currentFile, filesIndex])

  // Open file by id
  const openFile = useCallback((id: string, fit = true) => {
    const board = boardInstanceRef.current
    const target = filesIndex.files.find((f) => f.id === id)
    if (!target) return

    const newIdx = { ...filesIndex, current: target.id }
    setFilesIndex(newIdx)
    try {
      localStorage.setItem(INDEX_KEY, JSON.stringify(newIdx))
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        url.searchParams.set('id', String(target.boardNumber))
        window.history.replaceState({}, '', url.toString())
      }
    } catch {}

    if (board) {
      let snap = null
      try {
        const raw = localStorage.getItem(fileKey(target.id))
        if (raw) snap = JSON.parse(raw)
      } catch {
        localStorage.removeItem(fileKey(target.id))
      }

      board.editor.store.loadSnapshot(snap || { document: { store: {} } }, 'remote')
      board.editor.store.undos.length = 0
      board.editor.store.redos.length = 0
      if (fit && snap) {
        setTimeout(() => {
          board.editor.fitContent({ animate: 200 })
        }, 60)
      }
    }
    setCurrentFileName(target.name)
  }, [filesIndex])

  // Create new drawing file
  const handleCreateFile = () => {
    saveNow()
    const id = newId()
    const nextNumber = Math.max(0, ...filesIndex.files.map((f) => f.boardNumber || 0)) + 1
    const newFile: WhiteboardFile = {
      id,
      boardNumber: nextNumber,
      name: `Tahta ${nextNumber}`,
      updatedAt: Date.now(),
    }
    const newIdx: WhiteboardIndex = {
      current: id,
      files: [newFile, ...filesIndex.files],
    }
    setFilesIndex(newIdx)
    try {
      localStorage.setItem(INDEX_KEY, JSON.stringify(newIdx))
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        url.searchParams.set('id', String(nextNumber))
        window.history.replaceState({}, '', url.toString())
      }
    } catch {}

    const board = boardInstanceRef.current
    if (board) {
      board.editor.store.loadSnapshot({ document: { store: {} } }, 'remote')
      board.editor.store.undos.length = 0
      board.editor.store.redos.length = 0
    }
    setCurrentFileName(newFile.name)
    setIsMenuOpen(false)
  }

  // Delete file
  const handleDeleteFile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const target = filesIndex.files.find((f) => f.id === id)
    if (!target || filesIndex.files.length <= 1) return

    const confirmMsg = `“${target.name}” (ID: #${target.boardNumber}) tahtasını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
    if (!window.confirm(confirmMsg)) return

    const remaining = filesIndex.files.filter((f) => f.id !== id)
    let nextCurrent = filesIndex.current
    if (filesIndex.current === id) {
      nextCurrent = remaining[0].id
    }

    const newIdx: WhiteboardIndex = {
      current: nextCurrent,
      files: remaining,
    }
    setFilesIndex(newIdx)
    try {
      localStorage.removeItem(fileKey(id))
      localStorage.setItem(INDEX_KEY, JSON.stringify(newIdx))
    } catch {}

    if (filesIndex.current === id) {
      openFile(nextCurrent)
    }
  }

  // Rename commit
  const commitRename = (val: string) => {
    const cur = currentFile()
    if (!cur) return
    const trimmed = val.trim() || `Tahta ${cur.boardNumber}`

    cur.name = trimmed
    cur.updatedAt = Date.now()
    const newIdx = { ...filesIndex }
    setFilesIndex(newIdx)
    setCurrentFileName(trimmed)
    try {
      localStorage.setItem(INDEX_KEY, JSON.stringify(newIdx))
    } catch {}
  }

  // Lock html/body overflow and scrollbar-gutter to completely eliminate the right purple strip/gutter
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow
    const prevHtmlGutter = (html.style as any).scrollbarGutter
    const prevBodyGutter = (body.style as any).scrollbarGutter

    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    ;(html.style as any).scrollbarGutter = 'auto'
    ;(body.style as any).scrollbarGutter = 'auto'

    return () => {
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
      ;(html.style as any).scrollbarGutter = prevHtmlGutter
      ;(body.style as any).scrollbarGutter = prevBodyGutter
    }
  }, [])

  // Mount Board Engine
  useEffect(() => {
    if (!boardRef.current) return

    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
    const savedTheme = localStorage.getItem(THEME_KEY) || (prefersDark ? 'dark' : 'light')

    // Create board instance
    const board = createQuickdraw({
      container: boardRef.current,
      theme: savedTheme,
      grid: 'lines',
      watermark: false, // We use custom Oxonom logo & navigation
    })

    boardInstanceRef.current = board

    // Initial load of current file
    const cur = currentFile()
    if (cur) {
      setCurrentFileName(cur.name)
      let snap = null
      try {
        const raw = localStorage.getItem(fileKey(cur.id))
        if (raw) snap = JSON.parse(raw)
      } catch {}
      if (snap) {
        board.editor.store.loadSnapshot(snap, 'remote')
        board.editor.store.undos.length = 0
        board.editor.store.redos.length = 0
      }
    }

    // Debounced autosave
    const unsub = board.editor.store.listen(() => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        saveNow()
      }, 400)
    })

    // Theme sync
    const syncTheme = () => {
      const dark = board.editor.theme.id === 'dark'
      localStorage.setItem(THEME_KEY, board.editor.theme.id)
      document.documentElement.classList.toggle('dark', dark)
    }
    syncTheme()
    board.editor.on('theme', syncTheme)

    const handleBeforeUnload = () => {
      saveNow()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      unsub?.()
      board.destroy()
      boardInstanceRef.current = null
    }
  }, [])

  // Check URL query param ?id=... on initial mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const targetNum = parseInt(params.get('id') || params.get('tahta') || '', 10)
    if (targetNum && !isNaN(targetNum)) {
      const target = filesIndex.files.find((f) => f.boardNumber === targetNum)
      if (target && target.id !== filesIndex.current) {
        openFile(target.id, true)
      }
    }
  }, [])

  // Close files menu on outside click
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        filesBtnRef.current &&
        !filesBtnRef.current.contains(e.target as Node)
      ) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isMenuOpen])

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden select-none bg-[#fbf9f4] dark:bg-[#191713]">
      {/* ── WHITEBOARD CANVAS CONTAINER ── */}
      <div ref={boardRef} id="board" className="fixed inset-0 w-full h-full" />

      {/* ── TOP-LEFT CHROME: OXONOM LOGO & FILE BAR ── */}
      <div className="fixed top-2.5 left-2.5 z-60 flex items-center gap-2 font-sans">
        {/* Oxonom Logo Button -> Returns to /pano with only "OXONOM" text */}
        <Link
          href="/pano"
          title="Pano Ana Ekranına Dön"
          className="h-10 px-3.5 rounded-full bg-white/90 dark:bg-[#211729]/90 backdrop-blur-md border border-[#E8DFEB] dark:border-[#49364F] shadow-lg shadow-purple-950/10 flex items-center gap-2 text-[#241329] dark:text-[#FCF9FD] hover:bg-[#F0D8FA]/50 dark:hover:bg-[#2D2035] transition-all cursor-pointer group active:scale-95"
        >
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#4B075F] via-[#8D49A6] to-[#D914C8] flex items-center justify-center text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <circle cx="12" cy="12" r="3.5" fill="white" />
              <path
                d="M6 12C6 8.686 8.686 6 12 6C15.314 6 18 8.686 18 12C18 15.314 15.314 18 12 18"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeDasharray="18 5"
              />
            </svg>
          </div>
          <span className="text-xs sm:text-sm font-black tracking-wider leading-none text-[#241329] dark:text-[#FCF9FD]">
            OXONOM
          </span>
        </Link>

        {/* File Bar with Board ID */}
        <div className="h-10 px-2.5 rounded-full bg-white/90 dark:bg-[#211729]/90 backdrop-blur-md border border-[#E8DFEB] dark:border-[#49364F] shadow-lg shadow-purple-950/10 flex items-center gap-1.5">
          {/* Files List Dropdown Toggle */}
          <button
            ref={filesBtnRef}
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            title="Kayıtlı Tahtalar"
            aria-label="Kayıtlı Tahtalar"
            aria-expanded={isMenuOpen}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#514458] dark:text-[#D2C5D8] hover:bg-[#F0D8FA] dark:hover:bg-[#350444] hover:text-[#4B075F] dark:hover:text-[#F17AE6] transition-colors cursor-pointer"
          >
            <FolderOpen size={16} />
          </button>

          {/* New Board Button */}
          <button
            type="button"
            onClick={handleCreateFile}
            title="Yeni Tahta Ekle"
            aria-label="Yeni Tahta Ekle"
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#514458] dark:text-[#D2C5D8] hover:bg-[#F0D8FA] dark:hover:bg-[#350444] hover:text-[#4B075F] dark:hover:text-[#F17AE6] transition-colors cursor-pointer"
          >
            <Plus size={17} strokeWidth={2.4} />
          </button>

          {/* Board ID Badge */}
          <div
            title={`Tahta ID: #${currentFile()?.boardNumber ?? 1}`}
            className="px-2 py-0.5 rounded-lg text-[11px] font-black bg-gradient-to-r from-purple-100 to-fuchsia-100 dark:from-purple-950/70 dark:to-fuchsia-950/50 text-[#4B075F] dark:text-[#F17AE6] border border-purple-200/70 dark:border-purple-800/60 select-none shrink-0 flex items-center gap-1"
          >
            <span className="text-[9.5px] opacity-70">ID:</span>
            <span>#{currentFile()?.boardNumber ?? 1}</span>
          </div>

          {/* Current File Name Input */}
          <input
            type="text"
            value={currentFileName}
            onChange={(e) => setCurrentFileName(e.target.value)}
            onBlur={(e) => commitRename(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur()
              } else if (e.key === 'Escape') {
                setCurrentFileName(currentFile()?.name || `Tahta ${currentFile()?.boardNumber ?? 1}`)
                e.currentTarget.blur()
              }
              e.stopPropagation()
            }}
            placeholder={`Tahta ${currentFile()?.boardNumber ?? 1}`}
            title="Tahta adını değiştirmek için tıklayın"
            className="text-xs sm:text-sm font-bold text-[#241329] dark:text-[#FCF9FD] bg-transparent border-none outline-none px-2 py-1 max-w-[130px] sm:max-w-[180px] truncate hover:bg-black/5 dark:hover:bg-white/5 rounded-md focus:bg-black/5 dark:focus:bg-white/10 transition-colors"
          />
        </div>

        {/* Files Dropdown Menu */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute top-12 left-28 sm:left-32 w-72 max-h-[60vh] overflow-y-auto rounded-2xl bg-white/95 dark:bg-[#211729]/95 backdrop-blur-xl border border-[#E8DFEB] dark:border-[#49364F] shadow-2xl p-1.5 flex flex-col gap-1 z-70 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#716779] dark:text-[#B5A5BD] border-b border-[#E8DFEB]/60 dark:border-[#49364F]/60 flex items-center justify-between">
              <span>Kayıtlı Tahtalar</span>
              <span>{filesIndex.files.length} Tahta</span>
            </div>

            {filesIndex.files
              .slice()
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((file) => {
                const isCurrent = file.id === filesIndex.current
                return (
                  <div
                    key={file.id}
                    onClick={() => {
                      setIsMenuOpen(false)
                      if (file.id !== filesIndex.current) {
                        saveNow()
                        openFile(file.id)
                      }
                    }}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors group ${
                      isCurrent
                        ? 'bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#F17AE6] font-bold'
                        : 'text-[#241329] dark:text-[#FCF9FD] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isCurrent ? 'bg-[#D914C8] shadow-xs' : 'bg-transparent'
                        }`}
                      />
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-[#4B075F]/10 dark:bg-white/10 text-[#4B075F] dark:text-[#E9D5FF] shrink-0">
                        #{file.boardNumber}
                      </span>
                      <span className="truncate">{file.name}</span>
                    </div>

                    {filesIndex.files.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteFile(e, file.id)}
                        title={`“${file.name}” (#${file.boardNumber}) tahtasını sil`}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded-md transition-all cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                )
              })}

            <button
              type="button"
              onClick={handleCreateFile}
              className="mt-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand-gradient hover:opacity-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus size={14} strokeWidth={2.4} />
              <span>Yeni Tahta Ekle (#{Math.max(0, ...filesIndex.files.map((f) => f.boardNumber || 0)) + 1})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
