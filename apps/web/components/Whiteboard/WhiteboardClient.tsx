'use client'

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { createQuickdraw } from './core/index.js'
import './core/quickdraw.css'
import {
  FolderOpen,
  Plus,
  Trash2,
  UploadCloud,
  X,
  Image as ImageIcon,
  CheckCircle2,
  Save,
  Check,
  Loader2,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import { saveBoardNote } from '@/lib/board/boardNotesStorage'

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
  const searchParams = useSearchParams()
  const params = useParams() as any
  const boardRef = useRef<HTMLDivElement>(null)
  const boardInstanceRef = useRef<any>(null)
  const saveTimerRef = useRef<any>(null)

  // Hardware board identity (supports short clean path /pano/1A-01/tahta or query ?id=1A-01)
  const routeBoardId = (params?.boardId as string) || (params?.id as string) || ''
  const rawId = routeBoardId || searchParams?.get('id') || searchParams?.get('boardId') || ''
  const pId = searchParams?.get('panoId') || ''
  const tId = searchParams?.get('tahtaId') || searchParams?.get('boardNo') || ''

  const boardInfo = useMemo(() => {
    let pano = '1A'
    let board = '01'
    const candidate = rawId || (typeof window !== 'undefined' ? localStorage.getItem('oxonom_active_board_id') : '') || '1A-01'
    const clean = decodeURIComponent(candidate).trim().toUpperCase()

    if (clean.includes('-')) {
      const parts = clean.split('-').filter(Boolean)
      if (parts.length >= 3 && /^[1-9][0-9]?$/.test(parts[0]) && /^[A-Z]$/.test(parts[1])) {
        pano = `${parts[0]}${parts[1]}`
        board = parts.slice(2).join('-') || '01'
      } else if (parts.length === 2 && /^[1-9][0-9]?$/.test(parts[0]) && /^[A-Z]$/.test(parts[1])) {
        pano = `${parts[0]}${parts[1]}`
        board = '01'
      } else if (parts.length >= 2) {
        pano = parts[0]
        board = parts.slice(1).join('-') || '01'
      } else {
        pano = parts[0] || '1A'
        board = '01'
      }
    } else {
      const matchWithNum = clean.match(/^([1-9][0-9]?[A-Z])([0-9]{2})$/)
      if (matchWithNum) {
        pano = matchWithNum[1]
        board = matchWithNum[2]
      } else {
        pano = clean || '1A'
        board = '01'
      }
    }

    if (pId) pano = pId.trim().toUpperCase()
    if (tId) board = tId.trim().toUpperCase()

    const fullId = `${pano}-${board}`
    const scopeKey = `${pano}_${board}`.replace(/[^A-Za-z0-9_]/g, '_')
    return { pano, board, fullId, scopeKey }
  }, [rawId, pId, tId])

  // Partitioned storage keys strictly isolated by classroom and board ID
  const indexKey = `oxonom-whiteboard-files:${boardInfo.scopeKey}`
  const themeKey = `oxonom-whiteboard-theme:${boardInfo.scopeKey}`
  const getFileKey = useCallback((id: string) => `oxonom-whiteboard-file:${boardInfo.scopeKey}:${id}`, [boardInfo.scopeKey])

  // Local scoped board theme (never pollutes global website documentElement)
  const [boardTheme, setBoardTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    try {
      const saved = localStorage.getItem(themeKey)
      if (saved === 'dark' || saved === 'light') return saved
    } catch {}
    return 'light'
  })

  const [filesIndex, setFilesIndex] = useState<WhiteboardIndex>(() => {
    if (typeof window === 'undefined') {
      return { current: 'f1', files: [{ id: 'f1', boardNumber: 1, name: 'Tahta 1', updatedAt: Date.now() }] }
    }
    try {
      const saved = localStorage.getItem(indexKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        const normalized = normalizeIndex(parsed)
        localStorage.setItem(indexKey, JSON.stringify(normalized))
        return normalized
      }
    } catch {}
    const initialIndex = normalizeIndex(null)
    try {
      localStorage.setItem(indexKey, JSON.stringify(initialIndex))
    } catch {}
    return initialIndex
  })

  // Synchronize index if scopeKey changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem(indexKey)
      if (saved) {
        setFilesIndex(normalizeIndex(JSON.parse(saved)))
        return
      }
    } catch {}
    const initialIndex = normalizeIndex(null)
    try {
      localStorage.setItem(indexKey, JSON.stringify(initialIndex))
    } catch {}
    setFilesIndex(initialIndex)
  }, [indexKey])

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
      localStorage.setItem(getFileKey(file.id), JSON.stringify(snap))
      file.updatedAt = Date.now()
      localStorage.setItem(indexKey, JSON.stringify(filesIndex))
    } catch (err) {
      console.warn('Whiteboard save skipped (storage limit)', err)
    }
  }, [currentFile, filesIndex, getFileKey, indexKey])

  // ── INCOMING LIVE MATERIAL FROM TEACHER ──
  const [incomingBanner, setIncomingBanner] = useState<{
    name: string
    sender: string
    note?: string
  } | null>(null)
  const incomingBannerTimerRef = useRef<any>(null)

  // ── SAVE BOARD TO STUDENT PROFILES STATE ──
  const ALL_SCHOOL_CLASSES = useMemo(() => ['1/A', '1/B', '1/C', '1/D', '2/A', '2/B', '2/C', '2/D', '3/A', '3/B', '4/A', '4/B'], [])
  const ALL_COURSES = useMemo(() => ['Türkçe', 'Matematik', 'Fen Bilimleri', 'Sosyal Bilgiler', 'Hayat Bilgisi', 'İngilizce', 'Bilişim Teknolojileri', 'Görsel Sanatlar'], [])

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const defaultClassCode = useMemo(() => {
    const raw = boardInfo.pano || '1A'
    if (raw.length === 2 && /^[1-9][A-Z]$/i.test(raw)) {
      return `${raw[0]}/${raw[1].toUpperCase()}`
    }
    return '1/A'
  }, [boardInfo.pano])

  const [selectedClasses, setSelectedClasses] = useState<string[]>([defaultClassCode])
  const [selectedCourse, setSelectedCourse] = useState('Türkçe')
  const [isSavingBoard, setIsSavingBoard] = useState(false)
  const [saveStatusToast, setSaveStatusToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const openSaveModal = useCallback(() => {
    setSelectedClasses([defaultClassCode])
    setIsSaveModalOpen(true)
  }, [defaultClassCode])

  // Play pleasant notification audio chime
  const playAudioChime = useCallback(() => {
    if (typeof window === 'undefined') return
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const now = audioCtx.currentTime
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(523.25, now) // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12) // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.25) // G5
      gain.gain.setValueAtTime(0.25, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start(now)
      osc.stop(now + 0.55)
    } catch (_) {}
  }, [])

  const handleConfirmSaveBoard = useCallback(async () => {
    if (selectedClasses.length === 0) return
    setIsSavingBoard(true)
    try {
      saveNow()
      const editor = boardInstanceRef.current?.editor
      if (!editor) throw new Error('Editor bulunamadı')

      const blob = await editor.exportImage({ background: true, scale: 2, margin: 32 })
      if (!blob) throw new Error('Görsel oluşturulamadı')

      const reader = new FileReader()
      const dataUrl: string = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })

      saveBoardNote({
        courseName: selectedCourse,
        classCodes: selectedClasses,
        imageUrl: dataUrl,
        teacherName: 'Ders Öğretmeni',
        boardInfo: boardInfo.fullId,
      })

      playAudioChime()

      setSaveStatusToast({
        type: 'success',
        message: 'Harika, seçtiğiniz sınıfa ait tüm öğrencilere gönderildi!',
      })
      setIsSaveModalOpen(false)

      setTimeout(() => {
        setSaveStatusToast(null)
      }, 5000)
    } catch (err) {
      console.error('Board export failed:', err)
      setSaveStatusToast({
        type: 'error',
        message: 'Kayıt işlemi sırasında bir hata oluştu, lütfen tekrar deneyin.',
      })
      setTimeout(() => {
        setSaveStatusToast(null)
      }, 5000)
    } finally {
      setIsSavingBoard(false)
    }
  }, [selectedClasses, saveNow, selectedCourse, boardInfo.fullId, playAudioChime])

  // Helper to convert dataUrl or remote url to Blob for native whiteboard placement
  const urlToBlob = async (url: string): Promise<Blob> => {
    if (url.startsWith('data:')) {
      try {
        const arr = url.split(',')
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
        const bstr = atob(arr[1])
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n)
        }
        return new Blob([u8arr], { type: mime })
      } catch (_) {
        return new Blob([], { type: 'image/jpeg' })
      }
    }
    const res = await fetch(url)
    return await res.blob()
  }

  // Insert image directly onto the drawing canvas
  const insertIncomingMaterial = useCallback(
    async (material: {
      id?: string
      name?: string
      url: string
      sender?: string
      note?: string
    }) => {
      if (!material || !material.url) return
      const board = boardInstanceRef.current
      if (!board || !board.editor) {
        // If whiteboard engine is still initializing, retry after short delay
        setTimeout(() => insertIncomingMaterial(material), 350)
        return
      }

      try {
        const blob = await urlToBlob(material.url)
        if (blob && blob.size > 0) {
          if (typeof board.editor.importImageBlobs === 'function') {
            await board.editor.importImageBlobs([blob])
          } else {
            // Fallback manual store insertion
            const img = new Image()
            img.onload = () => {
              try {
                const w = img.naturalWidth || 800
                const h = img.naturalHeight || 600
                const vp = board.editor.viewportPageBounds?.() || {
                  x: 0,
                  y: 0,
                  w: typeof window !== 'undefined' ? window.innerWidth : 1200,
                  h: typeof window !== 'undefined' ? window.innerHeight : 800,
                }
                const scale = Math.min(1, (vp.w * 0.65) / w, (vp.h * 0.65) / h)
                const pw = Math.max(120, Math.round(w * scale))
                const ph = Math.max(120, Math.round(h * scale))
                const cx = vp.x + vp.w / 2
                const cy = vp.y + vp.h / 2
                const assetId = `asset:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
                const shapeId = `shape:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
                board.editor.store.transact(() => {
                  board.editor.store.put({ id: assetId, typeName: 'asset', src: material.url, w, h })
                  board.editor.store.put({
                    id: shapeId,
                    typeName: 'shape',
                    type: 'image',
                    x: cx - pw / 2,
                    y: cy - ph / 2,
                    rot: 0,
                    z: (board.editor.store.maxZ?.() || 10) + 1,
                    props: { w: pw, h: ph, assetId },
                  })
                })
              } catch (_) {}
            }
            img.src = material.url
          }

          board.editor.setTool?.('select')
          board.editor.requestRender?.()
          setTimeout(() => saveNow(), 200)

          playAudioChime()

          setIncomingBanner({
            name: material.name || 'Ders Görseli',
            sender: material.sender || 'Ders Öğretmeni',
            note: material.note || '',
          })

          if (incomingBannerTimerRef.current) clearTimeout(incomingBannerTimerRef.current)
          incomingBannerTimerRef.current = setTimeout(() => {
            setIncomingBanner(null)
          }, 8000)
        }
      } catch (err) {
        console.error('Error inserting material to whiteboard', err)
      }
    },
    [saveNow, playAudioChime]
  )

  // Open file by id
  const openFile = useCallback((id: string, fit = true) => {
    const board = boardInstanceRef.current
    const target = filesIndex.files.find((f) => f.id === id)
    if (!target) return

    const newIdx = { ...filesIndex, current: target.id }
    setFilesIndex(newIdx)
    try {
      localStorage.setItem(indexKey, JSON.stringify(newIdx))
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        url.searchParams.set('sheet', String(target.boardNumber))
        url.searchParams.set('id', boardInfo.fullId)
        url.searchParams.set('panoId', boardInfo.pano)
        url.searchParams.set('tahtaId', boardInfo.board)
        window.history.replaceState({}, '', url.toString())
      }
    } catch {}

    if (board) {
      let snap = null
      try {
        const raw = localStorage.getItem(getFileKey(target.id))
        if (raw) snap = JSON.parse(raw)
      } catch {
        localStorage.removeItem(getFileKey(target.id))
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
  }, [filesIndex, getFileKey, indexKey, boardInfo])

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
      localStorage.setItem(indexKey, JSON.stringify(newIdx))
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        url.searchParams.set('sheet', String(nextNumber))
        url.searchParams.set('id', boardInfo.fullId)
        url.searchParams.set('panoId', boardInfo.pano)
        url.searchParams.set('tahtaId', boardInfo.board)
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
      localStorage.removeItem(getFileKey(id))
      localStorage.setItem(indexKey, JSON.stringify(newIdx))
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
      localStorage.setItem(indexKey, JSON.stringify(newIdx))
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

    // Immediately ensure document.documentElement is NOT set to dark (protecting the rest of the site)
    document.documentElement.classList.remove('dark')

    const savedTheme = localStorage.getItem(themeKey) || boardTheme || 'light'

    // Create board instance
    const board = createQuickdraw({
      container: boardRef.current,
      theme: savedTheme,
      grid: 'lines',
      watermark: false, // We use custom Oxonom logo & navigation
      onSaveBoard: openSaveModal,
    })

    boardInstanceRef.current = board

    // Initial load of current file
    const cur = currentFile()
    if (cur) {
      setCurrentFileName(cur.name)
      let snap = null
      try {
        const raw = localStorage.getItem(getFileKey(cur.id))
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

    // Theme sync - ONLY update local boardTheme state, NEVER toggle document.documentElement.classList!
    const syncTheme = () => {
      const isDark = board.editor.theme.id === 'dark'
      setBoardTheme(isDark ? 'dark' : 'light')
      localStorage.setItem(themeKey, board.editor.theme.id)
      document.documentElement.classList.remove('dark')
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
      // Ensure dark mode class is never left lingering on global documentElement
      document.documentElement.classList.remove('dark')
    }
  }, [indexKey, themeKey, getFileKey])

  // Check URL query param ?sheet=... or fallback ?tahta=... on initial mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const targetNum = parseInt(params.get('sheet') || params.get('tahta') || '', 10)
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

  // Listen for materials sent to this smartboard
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handlePayload = (payload: any) => {
      if (!payload || !payload.url) return
      const target = (payload.boardId || '').toUpperCase()
      const currentFull = boardInfo.fullId.toUpperCase()
      const currentPano = boardInfo.pano.toUpperCase()

      if (target === currentFull || target === currentPano) {
        insertIncomingMaterial(payload)
      }
    }

    // 1. BroadcastChannel (cross-tab real-time sync)
    let bc: BroadcastChannel | null = null
    try {
      bc = new BroadcastChannel('oxonom_pano_channel')
      bc.onmessage = (event) => {
        if (event.data?.type === 'oxonom_pano_file_shared') {
          handlePayload(event.data.payload)
        }
      }
    } catch (_) {}

    // 2. CustomEvent on window
    const handleCustomEvent = (e: any) => {
      handlePayload(e.detail)
    }
    window.addEventListener('oxonom_pano_file_shared', handleCustomEvent)

    // 3. Storage event
    const handleStorage = (e: StorageEvent) => {
      if (
        (e.key === 'oxonom_pano_latest_file' ||
          e.key === `oxonom_whiteboard_incoming_${boardInfo.fullId}`) &&
        e.newValue
      ) {
        try {
          handlePayload(JSON.parse(e.newValue))
        } catch (_) {}
      }
    }
    window.addEventListener('storage', handleStorage)

    // 4. Initial check for recently sent file on tab mount or explicit ?import= query
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const hasImportParam = urlParams.get('import') === 'latest' || !!urlParams.get('import')
      const rawLatest =
        localStorage.getItem(`oxonom_whiteboard_incoming_${boardInfo.fullId}`) ||
        localStorage.getItem('oxonom_pano_latest_file')
      if (rawLatest) {
        const parsed = JSON.parse(rawLatest)
        const target = (parsed.boardId || '').toUpperCase()
        const currentFull = boardInfo.fullId.toUpperCase()
        const currentPano = boardInfo.pano.toUpperCase()

        if (target === currentFull || target === currentPano || hasImportParam) {
          const ageMs = Date.now() - (parsed.uploadedAt || 0)
          const sessionKey = `oxonom_wb_inserted_${parsed.id || 'latest'}`
          if (hasImportParam || (ageMs < 10 * 60 * 1000 && !sessionStorage.getItem(sessionKey))) {
            sessionStorage.setItem(sessionKey, '1')
            setTimeout(() => {
              insertIncomingMaterial(parsed)
            }, 450)
            if (hasImportParam) {
              const cleanUrl = new URL(window.location.href)
              cleanUrl.searchParams.delete('import')
              window.history.replaceState({}, '', cleanUrl.toString())
            }
          }
        }
      }
    } catch (_) {}

    return () => {
      bc?.close()
      window.removeEventListener('oxonom_pano_file_shared', handleCustomEvent)
      window.removeEventListener('storage', handleStorage)
      if (incomingBannerTimerRef.current) clearTimeout(incomingBannerTimerRef.current)
    }
  }, [boardInfo.fullId, boardInfo.pano, insertIncomingMaterial])

  return (
    <div className={`fixed inset-0 w-full h-full overflow-hidden select-none bg-[#fbf9f4] dark:bg-[#191713] ${boardTheme === 'dark' ? 'dark' : ''}`}>
      {/* ── WHITEBOARD CANVAS CONTAINER ── */}
      <div ref={boardRef} id="board" className="fixed inset-0 w-full h-full" />

      {/* ── FLOATING BANNER: INCOMING MATERIAL FROM TEACHER ── */}
      {incomingBanner && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-70 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-[#211729]/95 backdrop-blur-md border border-emerald-500/50 shadow-2xl shadow-emerald-950/20 text-[#241329] dark:text-[#FCF9FD] animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <UploadCloud size={16} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-[320px]">
                {incomingBanner.name}
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800">
                ✓ Tahtaya Eklendi
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Gönderen: {incomingBanner.sender} {incomingBanner.note ? `• "${incomingBanner.note}"` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIncomingBanner(null)}
            className="w-6 h-6 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors ml-1 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── TOP-LEFT CHROME: OXONOM LOGO & FILE BAR ── */}
      <div className="fixed top-2.5 left-2.5 z-60 flex items-center gap-2 font-sans">
        {/* Oxonom Logo Button -> Returns to exact short clean /pano URL */}
        <Link
          href={`/pano/${encodeURIComponent(boardInfo.fullId)}`}
          title={`${boardInfo.fullId} Panosuna Geri Dön`}
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
          <span className="inline-flex items-center gap-1 pl-1 text-[11px] font-bold text-[#8D49A6] dark:text-[#F17AE6]">
            ← Pano ({boardInfo.fullId})
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

          {/* Class & Board ID Badge */}
          <div
            title={`Sınıf: ${defaultClassCode} • Tahta ID: #${currentFile()?.boardNumber ?? 1}`}
            className="px-2.5 py-0.5 rounded-lg text-[11px] font-black bg-gradient-to-r from-purple-100 to-fuchsia-100 dark:from-purple-950/70 dark:to-fuchsia-950/50 text-[#4B075F] dark:text-[#F17AE6] border border-purple-200/70 dark:border-purple-800/60 select-none shrink-0 flex items-center gap-1.5"
          >
            <span className="font-extrabold text-[#8D49A6] dark:text-[#E9D5FF]">{defaultClassCode}</span>
            <span className="text-purple-300 dark:text-purple-700">|</span>
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

        {/* Tahtayı Kaydet Button */}
        <button
          type="button"
          onClick={openSaveModal}
          title="Tahtayı Kaydet & Sınıflara Gönder"
          className="h-10 px-3.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/20 flex items-center gap-1.5 text-xs font-black transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Save size={15} />
          <span className="hidden sm:inline">Tahtayı Kaydet</span>
        </button>

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

      {/* ── TOAST NOTIFICATION: SAVE BOARD STATUS ── */}
      {saveStatusToast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-90 flex items-center gap-3 px-5 py-3 rounded-2xl backdrop-blur-md shadow-2xl text-white animate-in fade-in slide-in-from-top-3 duration-300 ${
            saveStatusToast.type === 'success'
              ? 'bg-emerald-600/95 border border-emerald-400/50 shadow-emerald-950/30'
              : 'bg-rose-600/95 border border-rose-400/50 shadow-rose-950/30'
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            {saveStatusToast.type === 'success' ? (
              <Check size={16} strokeWidth={2.8} />
            ) : (
              <AlertCircle size={16} strokeWidth={2.8} />
            )}
          </div>
          <span className="text-xs sm:text-sm font-black">
            {saveStatusToast.message}
          </span>
          <button
            type="button"
            onClick={() => setSaveStatusToast(null)}
            className="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white ml-1 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── CLASS SELECTION MODAL ("TAHTAYI KAYDET") ── */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-80 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => !isSavingBoard && setIsSaveModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-lg bg-white dark:bg-[#181F30] border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl overflow-hidden p-5 sm:p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200 text-gray-900 dark:text-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Save size={18} />
                  </div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight">
                    Tahtayı Kaydet
                  </h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tahtadaki çizimler seçilen sınıflardaki tüm öğrencilerin profiline görsel olarak aktarılır.
                </p>
              </div>

              <button
                type="button"
                disabled={isSavingBoard}
                onClick={() => setIsSaveModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Course Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
                Ders Seçimi
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ALL_COURSES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCourse(c)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all truncate border cursor-pointer ${
                      selectedCourse === c
                        ? 'bg-[#4B075F] text-white border-[#4B075F] shadow-xs'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Classrooms Multi-Select */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Gönderilecek Sınıf(lar) ({selectedClasses.length} Seçili)
                </label>

                <div className="flex items-center gap-2 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setSelectedClasses([...ALL_SCHOOL_CLASSES])}
                    className="text-[#8D49A6] dark:text-[#C58ADB] hover:underline cursor-pointer"
                  >
                    Tümünü Seç
                  </button>
                  <span className="text-gray-300 dark:text-gray-700">•</span>
                  <button
                    type="button"
                    onClick={() => setSelectedClasses([defaultClassCode])}
                    className="text-gray-500 hover:underline cursor-pointer"
                  >
                    Sadece Mevcut
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[160px] overflow-y-auto p-1 custom-scrollbar">
                {ALL_SCHOOL_CLASSES.map((cls) => {
                  const isChecked = selectedClasses.includes(cls)
                  const isDefault = cls === defaultClassCode

                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setSelectedClasses(selectedClasses.filter((c) => c !== cls))
                        } else {
                          setSelectedClasses([...selectedClasses, cls])
                        }
                      }}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                          : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{cls}</span>
                        {isDefault && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-purple-100 dark:bg-purple-900/60 text-[#4B075F] dark:text-[#C58ADB]">
                            Mevcut
                          </span>
                        )}
                      </div>
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-emerald-600 text-white' : 'border border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {isChecked && <Check size={11} strokeWidth={3} />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Note title preview */}
            <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60 text-xs text-gray-600 dark:text-gray-300 space-y-1">
              <div className="text-[11px] font-bold text-gray-400 uppercase">
                Kayıt Başlığı Şablonu:
              </div>
              <div className="font-extrabold text-[#4B075F] dark:text-[#C58ADB]">
                {selectedCourse} - {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                disabled={isSavingBoard}
                onClick={() => setIsSaveModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              >
                Vazgeç
              </button>

              <button
                type="button"
                disabled={isSavingBoard || selectedClasses.length === 0}
                onClick={handleConfirmSaveBoard}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-emerald-950/20 cursor-pointer"
              >
                {isSavingBoard ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Öğrencilere Gönder & Kaydet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
