'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MessageCircle, Eye } from 'lucide-react'
import { FeedbackModal } from '@components/Objects/Modals/FeedbackModal'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import { HocuspocusProvider } from '@hocuspocus/provider'
import * as Y from 'yjs'
import { getCollabUrl } from '@services/config/config'
import { getDemoBoardInitialContent } from '@services/demo/demoBoardContents'
import BoardToolbar from './BoardToolbar'
import BoardTopBar from './BoardTopBar'
import BoardTopRight from './BoardTopRight'
import BoardZoomControls from './BoardZoomControls'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'next/navigation'
import { BoardCardExtension } from './Extensions/BoardCard'
import { TextBlockExtension } from './Extensions/TextBlock'
import { DrawingStrokeExtension } from './Extensions/DrawingStroke'
import { YouTubeBlockExtension } from './Extensions/YouTubeBlock'
import { PlaygroundBlockExtension } from './Extensions/PlaygroundBlock'
import { ActivityBlockExtension } from './Extensions/ActivityBlock'
import { EmbedBlockExtension } from './Extensions/EmbedBlock'
import { WebpageBlockExtension } from './Extensions/WebpageBlock'
import { StickerBlockExtension } from './Extensions/StickerBlock'
import { FrameBoxExtension } from './Extensions/FrameBox'
import { NoteBlockExtension } from './Extensions/NoteBlock'
import { TodoBlockExtension } from './Extensions/TodoBlock'
import { PodcastBlockExtension } from './Extensions/PodcastBlock'
import { getGeometricShapePath } from './WhiteboardCorrection'
import BoardTabBar, { BoardTab } from './BoardTabBar'
import toast from 'react-hot-toast'
import type { ShapeType, ToolMode } from './BoardToolbar'
import RemoteCursors from './RemoteCursors'
import {
  Square,
  YoutubeLogo,
  Sparkle,
  BookOpen,
  Code,
  Globe,
  Smiley,
  Note,
  FrameCorners,
  CheckSquare,
  Headphones,
  PencilSimple,
  Cube,
  Eraser,
  TextT,
  PenNib,
  Shapes,
  Trash,
} from '@phosphor-icons/react'
import { Extension } from '@tiptap/core'
import { BoardYjsProvider } from './BoardYjsContext'
import { BoardSelectionProvider } from './BoardSelectionContext'
import { useLHAnalytics, AnalyticsEvent } from '@services/analytics'
import useAdminStatus from '@components/Hooks/useAdminStatus'


interface BoardCanvasProps {
  board: any
  accessToken: string
  orgslug: string
  username: string
  orgUuid?: string
}

const COLORS = [
  '#958DF1', '#F98181', '#FBBC88', '#FAF594',
  '#70CFF8', '#94FADB', '#B9F18D', '#C3A8F0',
]

function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)]
}

function pointsToSvgPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y} L ${points[0].x} ${points[0].y}`
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const mx = (prev.x + curr.x) / 2
    const my = (prev.y + curr.y) / 2
    d += ` Q ${prev.x} ${prev.y} ${mx} ${my}`
  }
  const last = points[points.length - 1]
  d += ` L ${last.x} ${last.y}`
  return d
}

/** Inner component — only mounted once ydoc & provider are ready */
function BoardEditorInner({
  board,
  orgslug,
  username,
  accessToken,
  orgUuid,
  ydoc,
  provider,
}: {
  board: any
  orgslug: string
  username: string
  accessToken: string
  orgUuid?: string
  ydoc: Y.Doc
  provider: HocuspocusProvider
}) {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const isReadOnly = searchParams?.get('readonly') === '1' || searchParams?.get('permission') === 'view'
  const { track } = useLHAnalytics('dashboard')
  const [toolMode, setToolMode] = useState<ToolMode>('select')
  const [selectedShape, setSelectedShape] = useState<ShapeType>('square')
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)
  const [zoom, setZoom] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth <= 768 ? 0.6 : 1
  )
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [drawColor, setDrawColor] = useState('#000000')
  const [drawWidth, setDrawWidth] = useState(2)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [isDrawing, setIsDrawing] = useState(false)
  const isDrawingRef = useRef(false)
  const panRef = useRef(pan)
  panRef.current = pan
  const zoomRef = useRef(zoom)
  zoomRef.current = zoom
  const tapCandidateRef = useRef<{ clientX: number; clientY: number; time: number } | null>(null)
  const drawPointsRef = useRef<{ x: number; y: number }[]>([])
  const [drawingPath, setDrawingPath] = useState('')
  const canvasRef = useRef<HTMLDivElement>(null)
  const panRafRef = useRef(0)
  const prevToolModeRef = useRef<typeof toolMode | null>(null)
  const toolModeRef = useRef(toolMode)
  useEffect(() => {
    toolModeRef.current = toolMode
  }, [toolMode])
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)

  // Multi-page Tabs state
  const boardUuid = board?.board_uuid || 'default_board'
  const tabsStorageKey = `oxonom_board_tabs_${boardUuid}`
  const tabContentStoragePrefix = `oxonom_board_tab_content_${boardUuid}_`

  const [tabs, setTabs] = useState<BoardTab[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(tabsStorageKey)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      } catch {}
    }
    return [{ id: 'page_1', title: 'Sayfa 1', createdAt: Date.now() }]
  })

  const [activeTabId, setActiveTabId] = useState<string>(() => tabs[0]?.id || 'page_1')

  // Multi-select state
  const [selectedPositions, setSelectedPositions] = useState<Set<number>>(new Set())
  const [marquee, setMarquee] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null)
  const marqueeRef = useRef<typeof marquee>(null)

  // Placement tool indicator config
  const placementTools: Partial<Record<ToolMode, { icon: React.ComponentType<any>; label: string }>> = {
    draw: { icon: PencilSimple, label: 'Draw' },
    handwriting: { icon: PenNib, label: 'Handwriting' },
    text: { icon: TextT, label: 'Text' },
    shape: { icon: Shapes, label: 'Shape' },
    eraser: { icon: Eraser, label: 'Eraser' },
    card: { icon: Square, label: 'Card' },
    youtube: { icon: YoutubeLogo, label: 'YouTube' },
    embed: { icon: Code, label: 'Embed' },
    webpage: { icon: Globe, label: 'Webpage' },
    note: { icon: Note, label: 'Note' },
    sticker: { icon: Smiley, label: 'Sticker' },
    frame: { icon: FrameCorners, label: 'Frame' },
    todo: { icon: CheckSquare, label: 'Todo' },
    podcast: { icon: Headphones, label: 'Podcast' },
    modules: { icon: Cube, label: 'Modüller' },
  }
  const activePlacement = placementTools[toolMode] ?? null

  // Clear stale mouse position when leaving a placement tool.
  // Resets a piece of UI state once when the placement mode turns off; it cannot
  // loop because the only dependency (activePlacement) does not derive from mousePos.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!activePlacement) setMousePos(null)
  }, [activePlacement])

  const userColor = useMemo(() => getRandomColor(), [])
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  // Set user info on awareness (for RemoteCursors and PresenceAvatars)
  useEffect(() => {
    if (provider.awareness) {
      provider.awareness.setLocalStateField('user', {
        name: username,
        color: userColor,
      })
    }
  }, [provider, username, userColor])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        undoRedo: false, // Collaboration handles undo/redo
      }),
      Collaboration.configure({
        document: ydoc,
      }),
      Extension.create({
        name: 'boardContext',
        addStorage() {
          return {
            accessToken,
            boardUuid: board.board_uuid,
            boardName: board.name || 'Board',
            orgslug,
            orgUuid: orgUuid || '',
            username,
          }
        },
      }),
      BoardCardExtension,
      TextBlockExtension,
      DrawingStrokeExtension,
      YouTubeBlockExtension,
      PlaygroundBlockExtension,
      ActivityBlockExtension,
      EmbedBlockExtension,
      WebpageBlockExtension,
      StickerBlockExtension,
      FrameBoxExtension,
      NoteBlockExtension,
      TodoBlockExtension,
      PodcastBlockExtension,
    ],
    editable: !isReadOnly,
    immediatelyRender: false,
    autofocus: false,
    editorProps: {
      attributes: {
        class: 'board-editor outline-none min-h-[2000px] min-w-[3000px] relative',
        dir: 'ltr',
      },
      handleTextInput(view) {
        const { $from } = view.state.selection
        if (!$from) return true
        for (let d = $from.depth; d > 0; d--) {
          const name = $from.node(d)?.type?.name
          if (name === 'boardCard' || name === 'noteBlock' || name === 'textBlock') return false
        }
        return true
      },
      handleKeyDown(view, event) {
        if (event.key !== 'Enter') return false
        const { $from } = view.state.selection
        if (!$from) return false
        for (let d = $from.depth; d > 0; d--) {
          const name = $from.node(d)?.type?.name
          if (name === 'boardCard' || name === 'noteBlock' || name === 'textBlock') return false
        }
        event.preventDefault()
        return true
      },
    },
  })

  // Seed demo board content if document is empty
  useEffect(() => {
    if (!editor) return

    const timer = setTimeout(() => {
      const doc = editor.state.doc
      const isEmpty =
        doc.childCount === 0 ||
        (doc.childCount === 1 &&
          doc.firstChild?.type?.name === 'paragraph' &&
          doc.firstChild?.content.size === 0)

      if (isEmpty) {
        const initial = getDemoBoardInitialContent(board)
        if (initial && initial.content && initial.content.length > 0) {
          editor.commands.setContent(initial)
        }
      }
    }, 150)

    return () => clearTimeout(timer)
  }, [editor, board])

  // Persist local edits to localStorage for seamless offline & demo experience
  useEffect(() => {
    if (!ydoc || !board?.board_uuid) return
    const handler = () => {
      try {
        const update = Y.encodeStateAsUpdate(ydoc)
        let binary = ''
        const len = update.byteLength
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(update[i])
        }
        localStorage.setItem(`board_ydoc_${board.board_uuid}`, btoa(binary))
      } catch (_err) {
        // Ignore quota limits
      }
    }
    ydoc.on('update', handler)
    return () => {
      ydoc.off('update', handler)
    }
  }, [ydoc, board?.board_uuid])

  // Remap selected positions when the document changes
  useEffect(() => {
    if (!editor) return
    const handler = () => {
      // Get the last transaction from the editor state
      // We remap after every update to keep positions valid
      setSelectedPositions((prev) => {
        if (prev.size === 0) return prev
        const next = new Set<number>()
        const doc = editor.state.doc
        // Re-validate positions: check each still points to a top-level node
        for (const pos of prev) {
          if (pos >= 0 && pos < doc.content.size) {
            const node = doc.nodeAt(pos)
            if (node) next.add(pos)
          }
        }
        if (next.size === prev.size && [...next].every((p) => prev.has(p))) return prev
        return next
      })
    }
    editor.on('update', handler)
    return () => { editor.off('update', handler) }
  }, [editor])

  // Keyboard handler: Delete/Backspace removes all selected nodes, Space to pan
  useEffect(() => {
    if (!editor) return
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space to temporarily activate pan mode
      if (e.code === 'Space') {
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return
        e.preventDefault()
        if (prevToolModeRef.current === null) {
          prevToolModeRef.current = toolMode
          setToolMode('pan')
        }
        return
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Only handle if no text input is focused
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return
        if (selectedPositions.size === 0) return
        e.preventDefault()
        // Delete in reverse order to preserve earlier positions
        const sorted = Array.from(selectedPositions).sort((a, b) => b - a)
        editor.chain()
          .command(({ tr }) => {
            for (const pos of sorted) {
              const node = tr.doc.nodeAt(pos)
              if (node) tr.delete(pos, pos + node.nodeSize)
            }
            return true
          })
          .run()
        setSelectedPositions(new Set())
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && prevToolModeRef.current !== null) {
        setToolMode(prevToolModeRef.current)
        prevToolModeRef.current = null
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [editor, selectedPositions, toolMode])

  // Pan/Zoom handlers
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      setZoom((z) => Math.min(Math.max(z + delta, 0.25), 3))
    } else {
      setPan((p) => ({
        x: p.x - e.deltaX,
        y: p.y - e.deltaY,
      }))
    }
  }, [])

  const insertBlockAtWorldPos = useCallback((mode: string, worldX: number, worldY: number) => {
    if (!editor) return
    toolModeRef.current = 'select'
    const pos = editor.state.doc.content.size
    const x = Math.round(worldX)
    const y = Math.round(worldY)

    switch (mode) {
      case 'text':
        editor.chain().insertContentAt(pos, {
          type: 'textBlock',
          attrs: { x, y, width: 280, height: 100, fontSize: 18, color: '#171717' },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Buraya yazın...' }] }],
        }).run()
        track(AnalyticsEvent.BoardBlockAdded, { block_type: 'text' })
        break
      case 'shape': {
        const w = selectedShape === 'line' ? 240 : 200
        const h = selectedShape === 'line' ? 40 : 160
        const shapeInfo = getGeometricShapePath(selectedShape, w, h)
        editor.chain().insertContentAt(pos, {
          type: 'drawingStroke',
          attrs: {
            pathData: shapeInfo.pathData,
            strokeColor: drawColor || '#2563eb',
            strokeWidth: Math.max(drawWidth, 3),
            x,
            y,
            viewBox: `0 0 ${w} ${h}`,
            shapeType: selectedShape,
          },
        }).run()
        track(AnalyticsEvent.BoardBlockAdded, { block_type: 'shape' })
        break
      }
      case 'card':
        editor.chain().insertContentAt(pos, {
          type: 'boardCard',
          attrs: { x, y, width: 300, height: 200 },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: t('boards.new_card', 'Yeni Kart') }] }],
        }).run()
        track(AnalyticsEvent.BoardBlockAdded, { block_type: 'card' })
        break
      case 'youtube':
        editor.chain().insertContentAt(pos, {
          type: 'youtubeBlock',
          attrs: { x, y, width: 480, height: 270 },
        }).run()
        track(AnalyticsEvent.BoardBlockAdded, { block_type: 'youtube' })
        break
      case 'embed':
        editor.chain().insertContentAt(pos, {
          type: 'embedBlock',
          attrs: { x, y, width: 520, height: 360 },
        }).run()
        track(AnalyticsEvent.BoardBlockAdded, { block_type: 'embed' })
        break
      case 'webpage':
        editor.chain().insertContentAt(pos, {
          type: 'webpageBlock',
          attrs: { x, y, width: 520, height: 400 },
        }).run()
        track(AnalyticsEvent.BoardBlockAdded, { block_type: 'webpage' })
        break
      case 'note':
        editor.chain().insertContentAt(pos, {
          type: 'noteBlock',
          attrs: { x, y, width: 260, height: 200 },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: t('boards.new_note', 'Yeni Not') }] }],
        }).run()
        track(AnalyticsEvent.BoardBlockAdded, { block_type: 'note' })
        break
      case 'sticker':
        editor.chain().insertContentAt(pos, {
          type: 'stickerBlock',
          attrs: { x, y, emoji: '😀' },
        }).run()
        track(AnalyticsEvent.BoardBlockAdded, { block_type: 'sticker' })
        break
      case 'todo':
        editor.chain().insertContentAt(pos, {
          type: 'todoBlock',
          attrs: { x, y, width: 260, height: 260 },
        }).run()
        track(AnalyticsEvent.BoardBlockAdded, { block_type: 'todo' })
        break
      case 'podcast':
        editor.chain().insertContentAt(pos, {
          type: 'podcastBlock',
          attrs: { x, y, width: 400, height: 280 },
        }).run()
        track(AnalyticsEvent.BoardBlockAdded, { block_type: 'podcast' })
        break
      case 'frame':
        editor.chain().insertContentAt(pos, {
          type: 'frameBox',
          attrs: { x, y, width: 400, height: 300, title: 'Frame' },
        }).run()
        track(AnalyticsEvent.BoardBlockAdded, { block_type: 'frame' })
        break
      case 'modules':
        editor.chain().insertContentAt(pos, {
          type: 'playgroundBlock',
          attrs: {
            blockUuid: `pg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            x,
            y,
            width: 540,
            height: 480,
            htmlContent: null,
          },
        }).run()
        track(AnalyticsEvent.BoardBlockAdded, { block_type: 'modules' })
        break
      default:
        return
    }
    setToolMode('select')
  }, [editor, track, t, selectedShape, drawColor, drawWidth])

  const eraseAt = useCallback((worldX: number, worldY: number, radius = 35) => {
    if (!editor) return
    const doc = editor.state.doc
    const toDelete: { from: number; to: number }[] = []
    doc.descendants((node, pos) => {
      if (!node || !node.type) return false
      if (node.isBlock || node.type.name === 'drawingStroke' || node.type.name === 'textBlock') {
        const nx = node.attrs?.x ?? 0
        const ny = node.attrs?.y ?? 0
        let nw = node.attrs?.width ?? 100
        let nh = node.attrs?.height ?? 60
        if (node.type.name === 'drawingStroke') {
          const vb = (node.attrs?.viewBox || '0 0 100 100').split(' ').map(Number)
          nw = vb[2] || 100
          nh = vb[3] || 100
        }
        const closestX = Math.max(nx, Math.min(worldX, nx + nw))
        const closestY = Math.max(ny, Math.min(worldY, ny + nh))
        const dist = Math.hypot(worldX - closestX, worldY - closestY)
        if (dist <= radius) {
          toDelete.push({ from: pos, to: pos + node.nodeSize })
          return false
        }
      }
      return true
    })

    if (toDelete.length > 0) {
      toDelete.sort((a, b) => b.from - a.from)
      editor.chain().command(({ tr }) => {
        for (const item of toDelete) {
          tr.delete(item.from, item.to)
        }
        return true
      }).run()
    }
  }, [editor])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const mode = toolModeRef.current
    if (mode === 'pan' || e.button === 1 || (e.button === 0 && e.shiftKey && mode !== 'select')) {
      editor?.commands.blur()
      setIsPanning(true)
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      e.preventDefault()
    } else if (mode === 'select' && e.button === 0) {
      const target = e.target as HTMLElement
      const isOnBlock = target.closest('[data-node-view-wrapper]')
      if (!isOnBlock) {
        editor?.commands.blur()
        const rect = canvasRef.current?.getBoundingClientRect()
        if (rect) {
          const sx = e.clientX - rect.left
          const sy = e.clientY - rect.top
          const m = { startX: sx, startY: sy, currentX: sx, currentY: sy }
          setMarquee(m)
          marqueeRef.current = m
        }
        if (!e.shiftKey) {
          setSelectedPositions(new Set())
        }
      }
    } else if ((mode === 'draw' || mode === 'handwriting') && e.button === 0) {
      editor?.commands.blur()
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      e.preventDefault()
      const x = (e.clientX - rect.left - pan.x) / zoom
      const y = (e.clientY - rect.top - pan.y) / zoom
      drawPointsRef.current = [{ x, y }]
      setDrawingPath(`M ${x} ${y}`)
      isDrawingRef.current = true
      setIsDrawing(true)
    } else if (mode === 'eraser' && e.button === 0) {
      editor?.commands.blur()
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      e.preventDefault()
      const x = (e.clientX - rect.left - pan.x) / zoom
      const y = (e.clientY - rect.top - pan.y) / zoom
      eraseAt(x, y)
    } else if (e.button === 0) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = (e.clientX - rect.left - pan.x) / zoom
      const y = (e.clientY - rect.top - pan.y) / zoom
      insertBlockAtWorldPos(mode, x, y)
    }
  }, [pan, zoom, editor, insertBlockAtWorldPos, eraseAt])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Track mouse position for placement ghost preview
    if (activePlacement) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      }
    }

    if (toolModeRef.current === 'eraser' && e.buttons === 1) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        const x = (e.clientX - rect.left - pan.x) / zoom
        const y = (e.clientY - rect.top - pan.y) / zoom
        eraseAt(x, y)
      }
    }

    if (isPanning) {
      const newX = e.clientX - panStart.x
      const newY = e.clientY - panStart.y
      cancelAnimationFrame(panRafRef.current)
      panRafRef.current = requestAnimationFrame(() => {
        setPan({ x: newX, y: newY })
      })
    } else if (marqueeRef.current) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      const m = { ...marqueeRef.current, currentX: e.clientX - rect.left, currentY: e.clientY - rect.top }
      marqueeRef.current = m
      cancelAnimationFrame(panRafRef.current)
      panRafRef.current = requestAnimationFrame(() => {
        setMarquee(m)
      })
    } else if (isDrawingRef.current) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = (e.clientX - rect.left - pan.x) / zoom
      const y = (e.clientY - rect.top - pan.y) / zoom
      drawPointsRef.current.push({ x, y })
      cancelAnimationFrame(panRafRef.current)
      panRafRef.current = requestAnimationFrame(() => {
        setDrawingPath(pointsToSvgPath(drawPointsRef.current))
      })
    }
  }, [isPanning, panStart, pan, zoom, activePlacement, eraseAt])

  const commitDrawingStroke = useCallback(() => {
    isDrawingRef.current = false
    setIsDrawing(false)
    const points = drawPointsRef.current
    if (points.length === 0 || !editor) {
      setDrawingPath('')
      drawPointsRef.current = []
      return
    }

    if (points.length === 1) {
      points.push({ x: points[0].x + 0.5, y: points[0].y + 0.5 })
    }

    // Calculate bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const p of points) {
      if (p.x < minX) minX = p.x
      if (p.y < minY) minY = p.y
      if (p.x > maxX) maxX = p.x
      if (p.y > maxY) maxY = p.y
    }
    const padding = 10
    minX -= padding; minY -= padding; maxX += padding; maxY += padding
    const width = maxX - minX
    const height = maxY - minY

    // Normalize points relative to bounding box origin
    const normalized = points.map(p => ({ x: p.x - minX, y: p.y - minY }))
    const pathData = pointsToSvgPath(normalized)

    // Handwriting uses slightly finer stroke
    const effectiveWidth = toolModeRef.current === 'handwriting' ? Math.min(drawWidth, 2.5) : drawWidth

    // Insert without focus() to avoid scroll jumps that break pan/zoom
    const endPos = editor.state.doc.content.size
    editor.chain().insertContentAt(endPos, {
      type: 'drawingStroke',
      attrs: {
        pathData,
        strokeColor: drawColor,
        strokeWidth: effectiveWidth,
        x: Math.round(minX),
        y: Math.round(minY),
        viewBox: `0 0 ${Math.round(width)} ${Math.round(height)}`,
      },
    }).run()

    setDrawingPath('')
    drawPointsRef.current = []
  }, [editor, drawColor, drawWidth])

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false)
    }
    if (marqueeRef.current && editor) {
      const m = marqueeRef.current
      // Convert screen-space marquee rect to world-space
      const left = Math.min(m.startX, m.currentX)
      const top = Math.min(m.startY, m.currentY)
      const right = Math.max(m.startX, m.currentX)
      const bottom = Math.max(m.startY, m.currentY)

      // Only count as marquee if dragged at least 5px
      if (right - left > 5 || bottom - top > 5) {
        // Convert to world coords
        const wLeft = (left - pan.x) / zoom
        const wTop = (top - pan.y) / zoom
        const wRight = (right - pan.x) / zoom
        const wBottom = (bottom - pan.y) / zoom

        const hits: number[] = []
        editor.state.doc.forEach((node: any, pos: number) => {
          if (!node || !node.type) return
          const nx = node.attrs?.x ?? 0
          const ny = node.attrs?.y ?? 0

          // Resolve actual rendered size per node type
          let nw: number, nh: number
          const typeName = node.type.name
          if (typeName === 'stickerBlock') {
            nw = 80; nh = 80
          } else if (typeName === 'drawingStroke') {
            const vb = (node.attrs?.viewBox || '0 0 100 100').split(' ').map(Number)
            nw = vb[2] || 100
            nh = vb[3] || 100
          } else {
            nw = node.attrs?.width ?? 300
            nh = node.attrs?.height ?? 200
          }

          // Check if block overlaps marquee rect
          if (nx + nw > wLeft && nx < wRight && ny + nh > wTop && ny < wBottom) {
            hits.push(pos)
          }
        })
        if (hits.length > 0) {
          setSelectedPositions(new Set(hits))
        }
      }

      marqueeRef.current = null
      setMarquee(null)
    }
    if (isDrawingRef.current && editor) {
      commitDrawingStroke()
    }
  }, [isPanning, editor, commitDrawingStroke, pan.x, pan.y, zoom, setSelectedPositions])

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 3))
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.25))
  const handleZoomReset = () => { setZoom(1); setPan({ x: 0, y: 0 }) }

  const handleFocusContent = useCallback(() => {
    if (!editor || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const screenW = rect.width || (typeof window !== 'undefined' ? window.innerWidth : 1200)
    const screenH = rect.height || (typeof window !== 'undefined' ? window.innerHeight : 800)

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    let count = 0

    editor.state.doc.forEach((node: any) => {
      if (!node || !node.type) return
      const x = node.attrs?.x ?? 0
      const y = node.attrs?.y ?? 0
      let w = node.attrs?.width ?? 300
      let h = node.attrs?.height ?? 200

      if (node.type.name === 'stickerBlock') {
        w = 80; h = 80
      } else if (node.type.name === 'drawingStroke') {
        const vb = (node.attrs?.viewBox || '0 0 100 100').split(' ').map(Number)
        w = vb[2] || 100
        h = vb[3] || 100
      }

      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x + w > maxX) maxX = x + w
      if (y + h > maxY) maxY = y + h
      count++
    })

    if (count === 0 || minX === Infinity) {
      setZoom(1)
      setPan({ x: 0, y: 0 })
      return
    }

    const padding = 80
    minX -= padding
    minY -= padding
    maxX += padding
    maxY += padding

    const contentW = Math.max(maxX - minX, 100)
    const contentH = Math.max(maxY - minY, 100)

    const scaleX = screenW / contentW
    const scaleY = screenH / contentH
    const targetZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.3), 1.25)

    const targetPanX = (screenW - contentW * targetZoom) / 2 - minX * targetZoom
    const targetPanY = (screenH - contentH * targetZoom) / 2 - minY * targetZoom

    setZoom(Number(targetZoom.toFixed(2)))
    setPan({ x: Math.round(targetPanX), y: Math.round(targetPanY) })
  }, [editor])

  // Touch: drawing on 1 finger when draw tool is active, pan (1 finger) and pinch-to-zoom (2 fingers)
  const touchRef = useRef<{
    startTouches: { x: number; y: number }[]
    startPan: { x: number; y: number }
    startZoom: number
    startDist: number
  } | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const mode = toolModeRef.current
    const target = e.target as HTMLElement
    const isOnBlock = !!target.closest('[data-node-view-wrapper]')
    const touches = Array.from(e.touches)

    // Two or more fingers: ALWAYS pinch-to-zoom / 2-finger pan regardless of active tool
    if (touches.length >= 2) {
      if (isDrawingRef.current) {
        isDrawingRef.current = false
        setIsDrawing(false)
        setDrawingPath('')
        drawPointsRef.current = []
      }
      tapCandidateRef.current = null
      const dist = Math.hypot(touches[1].clientX - touches[0].clientX, touches[1].clientY - touches[0].clientY)
      touchRef.current = {
        startTouches: touches.map(t => ({ x: t.clientX, y: t.clientY })),
        startPan: { ...panRef.current },
        startZoom: zoomRef.current,
        startDist: dist,
      }
      return
    }

    if (touches.length === 1) {
      const t = touches[0]

      // 1. Drawing mode: single touch starts stroke
      if (mode === 'draw' || mode === 'handwriting') {
        editor?.commands.blur()
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return
        const x = (t.clientX - rect.left - panRef.current.x) / zoomRef.current
        const y = (t.clientY - rect.top - panRef.current.y) / zoomRef.current
        drawPointsRef.current = [{ x, y }]
        setDrawingPath(`M ${x} ${y}`)
        isDrawingRef.current = true
        setIsDrawing(true)
        return
      }

      // Eraser mode on touch
      if (mode === 'eraser') {
        editor?.commands.blur()
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return
        const x = (t.clientX - rect.left - panRef.current.x) / zoomRef.current
        const y = (t.clientY - rect.top - panRef.current.y) / zoomRef.current
        eraseAt(x, y)
        return
      }

      // 2. Placement tool: record tap candidate (placed on release if not dragged)
      if (mode !== 'select' && mode !== 'pan') {
        tapCandidateRef.current = {
          clientX: t.clientX,
          clientY: t.clientY,
          time: Date.now(),
        }
        return
      }

      // 3. Block interaction in select/pan mode: let block handles touch
      if (isOnBlock) {
        return
      }

      // 4. Empty canvas in select/pan mode: 1-finger pan
      editor?.commands.blur()
      touchRef.current = {
        startTouches: [{ x: t.clientX, y: t.clientY }],
        startPan: { ...panRef.current },
        startZoom: zoomRef.current,
        startDist: 0,
      }
    }
  }, [editor, eraseAt])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touches = Array.from(e.touches)

    // Eraser on touch move
    if (toolModeRef.current === 'eraser' && touches.length === 1) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        const x = (touches[0].clientX - rect.left - panRef.current.x) / zoomRef.current
        const y = (touches[0].clientY - rect.top - panRef.current.y) / zoomRef.current
        eraseAt(x, y)
      }
      return
    }

    // 1. If currently drawing with 1 finger
    if (isDrawingRef.current && touches.length === 1) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = (touches[0].clientX - rect.left - panRef.current.x) / zoomRef.current
      const y = (touches[0].clientY - rect.top - panRef.current.y) / zoomRef.current
      drawPointsRef.current.push({ x, y })
      cancelAnimationFrame(panRafRef.current)
      panRafRef.current = requestAnimationFrame(() => {
        setDrawingPath(pointsToSvgPath(drawPointsRef.current))
      })
      return
    }

    // 2. If we have a tap candidate for a placement tool, check if user dragged
    if (tapCandidateRef.current && touches.length === 1) {
      const dist = Math.hypot(
        touches[0].clientX - tapCandidateRef.current.clientX,
        touches[0].clientY - tapCandidateRef.current.clientY
      )
      if (dist > 12) {
        tapCandidateRef.current = null
      }
    }

    if (!touchRef.current) return

    // 3. Two-finger pinch to zoom + pan
    if (touches.length >= 2 && touchRef.current.startTouches.length >= 2) {
      const dist = Math.hypot(touches[1].clientX - touches[0].clientX, touches[1].clientY - touches[0].clientY)
      const scale = dist / (touchRef.current.startDist || 1)
      const newZoom = Math.min(Math.max(touchRef.current.startZoom * scale, 0.25), 3)

      const midX = (touches[0].clientX + touches[1].clientX) / 2
      const midY = (touches[0].clientY + touches[1].clientY) / 2
      const startMidX = (touchRef.current.startTouches[0].x + touchRef.current.startTouches[1].x) / 2
      const startMidY = (touchRef.current.startTouches[0].y + touchRef.current.startTouches[1].y) / 2

      cancelAnimationFrame(panRafRef.current)
      panRafRef.current = requestAnimationFrame(() => {
        setZoom(newZoom)
        setPan({
          x: touchRef.current!.startPan.x + (midX - startMidX),
          y: touchRef.current!.startPan.y + (midY - startMidY),
        })
      })
    } else if (touches.length === 1 && touchRef.current.startTouches.length === 1 && !isDrawingRef.current) {
      // 4. One-finger canvas pan
      const dx = touches[0].clientX - touchRef.current.startTouches[0].x
      const dy = touches[0].clientY - touchRef.current.startTouches[0].y
      cancelAnimationFrame(panRafRef.current)
      panRafRef.current = requestAnimationFrame(() => {
        setPan({
          x: touchRef.current!.startPan.x + dx,
          y: touchRef.current!.startPan.y + dy,
        })
      })
    }
  }, [])

  const handleTouchEnd = useCallback((_e?: React.TouchEvent) => {
    // 1. Commit drawing if drawing
    if (isDrawingRef.current) {
      commitDrawingStroke()
    }

    // 2. Commit placement if tap candidate exists
    if (tapCandidateRef.current) {
      const { clientX, clientY } = tapCandidateRef.current
      tapCandidateRef.current = null
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        const x = (clientX - rect.left - panRef.current.x) / zoomRef.current
        const y = (clientY - rect.top - panRef.current.y) / zoomRef.current
        insertBlockAtWorldPos(toolModeRef.current, x, y)
      }
    }

    touchRef.current = null
  }, [commitDrawingStroke, insertBlockAtWorldPos])

  // Non-passive native touch listener prevents mobile browser gestures (swipe back, pull down refresh)
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return

    const onNativeTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) {
        return
      }
      if (e.touches.length >= 2 || toolModeRef.current === 'draw' || toolModeRef.current !== 'select') {
        e.preventDefault()
      }
    }

    const onNativeTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) {
        return
      }
      e.preventDefault()
    }

    el.addEventListener('touchstart', onNativeTouchStart, { passive: false })
    el.addEventListener('touchmove', onNativeTouchMove, { passive: false })

    return () => {
      el.removeEventListener('touchstart', onNativeTouchStart)
      el.removeEventListener('touchmove', onNativeTouchMove)
    }
  }, [])

  // Tab management handlers
  const handleSelectTab = useCallback((tabId: string) => {
    if (!editor || tabId === activeTabId) return
    try {
      const currentJson = editor.getJSON()
      localStorage.setItem(`${tabContentStoragePrefix}${activeTabId}`, JSON.stringify(currentJson))
    } catch {}

    setActiveTabId(tabId)

    try {
      const saved = localStorage.getItem(`${tabContentStoragePrefix}${tabId}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        editor.commands.setContent(parsed)
      } else {
        editor.commands.setContent({ type: 'doc', content: [] })
      }
    } catch {
      editor.commands.setContent({ type: 'doc', content: [] })
    }
  }, [editor, activeTabId, tabContentStoragePrefix])

  const handleAddTab = useCallback((customTitle?: string) => {
    if (!editor) return
    try {
      const currentJson = editor.getJSON()
      localStorage.setItem(`${tabContentStoragePrefix}${activeTabId}`, JSON.stringify(currentJson))
    } catch {}

    const newTabId = `page_${Date.now()}`
    const newTitle = customTitle?.trim() || `Sayfa ${tabs.length + 1}`
    const newTab: BoardTab = { id: newTabId, title: newTitle, createdAt: Date.now() }
    const updatedTabs = [...tabs, newTab]

    setTabs(updatedTabs)
    try {
      localStorage.setItem(tabsStorageKey, JSON.stringify(updatedTabs))
    } catch {}

    setActiveTabId(newTabId)
    editor.commands.setContent({ type: 'doc', content: [] })
    toast.success(`"${newTitle}" sayfası oluşturuldu`)
  }, [editor, tabs, activeTabId, tabContentStoragePrefix, tabsStorageKey])

  const handleRenameTab = useCallback((tabId: string, newTitle: string) => {
    const updated = tabs.map(t => t.id === tabId ? { ...t, title: newTitle.trim() || t.title } : t)
    setTabs(updated)
    try {
      localStorage.setItem(tabsStorageKey, JSON.stringify(updated))
    } catch {}
  }, [tabs, tabsStorageKey])

  const handleDeleteTab = useCallback((tabId: string) => {
    if (tabs.length <= 1) {
      toast.error('En az bir sayfa bulunmalıdır.')
      return
    }
    const filtered = tabs.filter(t => t.id !== tabId)
    setTabs(filtered)
    try {
      localStorage.setItem(tabsStorageKey, JSON.stringify(filtered))
      localStorage.removeItem(`${tabContentStoragePrefix}${tabId}`)
    } catch {}

    if (activeTabId === tabId) {
      const nextTab = filtered[0]
      setActiveTabId(nextTab.id)
      if (editor) {
        try {
          const saved = localStorage.getItem(`${tabContentStoragePrefix}${nextTab.id}`)
          if (saved) {
            editor.commands.setContent(JSON.parse(saved))
          } else {
            editor.commands.setContent({ type: 'doc', content: [] })
          }
        } catch {
          editor.commands.setContent({ type: 'doc', content: [] })
        }
      }
    }
    toast.success('Sayfa silindi')
  }, [tabs, activeTabId, editor, tabContentStoragePrefix, tabsStorageKey])

  if (!editor) return null

  return (
    <BoardYjsProvider value={ydoc}>
    <BoardSelectionProvider editor={editor} selectedPositions={selectedPositions} setSelectedPositions={setSelectedPositions}>
    <div
      className="relative h-screen w-full overflow-hidden board-effect-shake-target"
      style={{
        backgroundColor: '#f8f8f8',
        backgroundImage: 'radial-gradient(circle, #d1d1d1 1px, transparent 1px)',
        backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* Canvas viewport */}
      <div
        ref={canvasRef}
        className="h-full w-full relative"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{
          cursor: toolMode === 'pan' || isPanning ? 'grab' : toolMode === 'eraser' ? 'cell' : toolMode === 'draw' || toolMode === 'handwriting' || activePlacement ? 'crosshair' : 'default',
          touchAction: 'none',
        }}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          <EditorContent editor={editor} />
        </div>
        <RemoteCursors provider={provider} canvasRef={canvasRef} pan={pan} zoom={zoom} />

        {/* Marquee selection overlay */}
        {marquee && (
          <svg
            className="absolute inset-0 pointer-events-none z-30"
            style={{ width: '100%', height: '100%' }}
          >
            <rect
              x={Math.min(marquee.startX, marquee.currentX)}
              y={Math.min(marquee.startY, marquee.currentY)}
              width={Math.abs(marquee.currentX - marquee.startX)}
              height={Math.abs(marquee.currentY - marquee.startY)}
              fill="rgba(59, 130, 246, 0.1)"
              stroke="rgba(59, 130, 246, 0.5)"
              strokeWidth={1}
              strokeDasharray="4 2"
            />
          </svg>
        )}

        {/* Placement cursor indicator */}
        {activePlacement && mousePos && (() => {
          const Icon = activePlacement.icon
          return (
            <div
              className="absolute pointer-events-none z-30"
              style={{
                left: mousePos.x + 16,
                top: mousePos.y + 16,
              }}
            >
              <div className="flex items-center gap-1.5 rounded-full bg-neutral-800 ps-1.5 pe-2.5 py-1 shadow-lg">
                <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center">
                  <Icon size={11} weight="bold" className="text-white" />
                </div>
                <span className="text-[11px] font-medium text-white/90 select-none whitespace-nowrap">
                  {activePlacement.label}
                </span>
              </div>
            </div>
          )
        })()}

        {/* Live drawing overlay */}
        {isDrawing && drawingPath && (
          <svg
            className="absolute inset-0 pointer-events-none z-30"
            style={{ width: '100%', height: '100%' }}
          >
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              <path
                d={drawingPath}
                stroke={drawColor}
                strokeWidth={drawWidth / zoom}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </svg>
        )}
      </div>

      {/* Top bar: back + logo + title */}
      <div className="board-enter-top">
        <BoardTopBar
          boardName={board.name}
          orgslug={orgslug}
          board={board}
          accessToken={accessToken}
        />
      </div>

      {/* Whiteboard Multi-page Tab System (Floating prominently above the bottom toolbar) */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-[95vw] animate-in fade-in slide-in-from-bottom-2 duration-200">
        <BoardTabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={handleSelectTab}
          onAddTab={handleAddTab}
          onRenameTab={handleRenameTab}
          onDeleteTab={handleDeleteTab}
          readOnly={isReadOnly}
        />
      </div>

      {/* Top right: avatars + clock + timer + share */}
      <div className="board-enter-top">
        <BoardTopRight
          provider={provider}
          ydoc={ydoc}
          board={board}
          accessToken={accessToken}
        />
      </div>
 
      {/* Read-Only Mode Badge */}
      {isReadOnly && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/95 backdrop-blur-md text-white text-xs font-semibold shadow-lg pointer-events-auto animate-in fade-in duration-200">
          <Eye size={14} className="shrink-0" />
          <span>Sadece Görüntüleme Modu (Salt Okunur)</span>
        </div>
      )}

      {/* Bottom toolbar: logo, tools, undo/redo */}
      {!isReadOnly && (
        <BoardToolbar
          toolMode={toolMode}
          onToolModeChange={setToolMode}
          editor={editor}
          drawColor={drawColor}
          drawWidth={drawWidth}
          onDrawColorChange={setDrawColor}
          onDrawWidthChange={setDrawWidth}
          selectedShape={selectedShape}
          onSelectShape={setSelectedShape}
          onClearAll={() => setConfirmClearOpen(true)}
          onAddTab={() => handleAddTab()}
          activeTabTitle={tabs.find((t) => t.id === activeTabId)?.title}
        />
      )}

      {/* Clear All Confirmation Modal */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-neutral-100 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash size={22} weight="bold" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900">Tümünü Temizle</h3>
                <p className="text-xs text-neutral-500">Bu sayfadaki tüm çizim ve nesneler silinecek.</p>
              </div>
            </div>
            <p className="text-sm text-neutral-600">
              Bu işlem geri alınamaz. Tahtadaki tüm içerik kalıcı olarak temizlenecektir. Devam etmek istiyor musunuz?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmClearOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  editor?.commands.setContent({ type: 'doc', content: [] })
                  setConfirmClearOpen(false)
                  toast.success('Tahta temizlendi')
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
              >
                Evet, Tümünü Temizle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zoom & Odak Controls — Fixed bottom-right with clean, non-overlapping placement */}
      <div className="fixed bottom-4 end-4 z-30 pointer-events-auto flex items-center board-enter-delayed">
        <BoardZoomControls
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
          onFocusContent={handleFocusContent}
        />
      </div>

      {/* Feedback button — bottom left (desktop only, avoids collision in landscape & mobile) */}
      <button
        onClick={() => setFeedbackOpen(true)}
        className="fixed bottom-4 start-4 z-20 hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-500 hover:text-neutral-700 nice-shadow transition-colors board-enter-delayed"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <MessageCircle size={14} />
        Feedback
      </button>
      <FeedbackModal
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        userName={username}
      />

    </div>
    </BoardSelectionProvider>
    </BoardYjsProvider>
  )
}

/** Outer component — handles Yjs lifecycle, only renders editor once ready */
export default function BoardCanvas({ board, accessToken, orgslug, username, orgUuid }: BoardCanvasProps) {
  const { isTeacher, isAdmin } = useAdminStatus()
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null)
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null)
  const [connStatus, setConnStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [authFailed, setAuthFailed] = useState(false)

  const isDemo = Boolean(
    board?.is_demo ||
    board?.board_uuid?.startsWith('board_') ||
    board?.usergroup_id ||
    isTeacher ||
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && getCollabUrl().includes('localhost'))
  )

  useEffect(() => {
    const doc = new Y.Doc()

    // Restore saved board state from localStorage if available
    if (typeof window !== 'undefined' && board?.board_uuid) {
      try {
        const saved = localStorage.getItem(`board_ydoc_${board.board_uuid}`)
        if (saved) {
          const binary = atob(saved)
          const bytes = new Uint8Array(binary.length)
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i)
          }
          Y.applyUpdate(doc, bytes)
        }
      } catch (err) {
        console.warn('[board] Could not restore from localStorage:', err)
      }
    }

    const prov = new HocuspocusProvider({
      url: getCollabUrl(),
      name: `board:${board.board_uuid}`,
      document: doc,
      token: accessToken,
      onStatus({ status }: { status: string }) {
        if (!isDemo) {
          setConnStatus(status as 'connecting' | 'connected' | 'disconnected')
        } else {
          setConnStatus('connected')
        }
      },
      onAuthenticationFailed({ reason }: { reason: string }) {
        console.error('[board] Authentication failed:', reason)
        // Teachers and admins have full authority to view all past boards; never lock them out
        if (!isDemo && !board?.usergroup_id && !isTeacher && !isAdmin) {
          setAuthFailed(true)
          prov.disconnect()
        }
      },
    })

    // The Y.Doc / HocuspocusProvider are external systems created in this effect;
    // storing them in state once per board/token is the intended synchronization,
    // not a cascading render loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYdoc(doc)
    setProvider(prov)
    setAuthFailed(false)
    setConnStatus(isDemo ? 'connected' : 'connecting')

    return () => {
      prov.destroy()
      doc.destroy()
    }
  }, [board.board_uuid, accessToken, isDemo])

  if (authFailed) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-8 shadow-lg text-center max-w-sm">
          <div className="text-2xl">🔒</div>
          <p className="text-sm font-bold text-neutral-800">Bu tahtaya bağlanılamıyor</p>
          <p className="text-xs text-neutral-500">Erişim yetkiniz olmayabilir veya oturum süresi dolmuş olabilir.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Yeniden Dene
          </button>
        </div>
      </div>
    )
  }

  if (!ydoc || !provider) return null

  return (
    <>
      <BoardEditorInner
        board={board}
        orgslug={orgslug}
        username={username}
        accessToken={accessToken}
        orgUuid={orgUuid}
        ydoc={ydoc}
        provider={provider}
      />
      {/* Connection status indicator (suppressed for demo/standalone boards to avoid false alarms) */}
      {connStatus === 'disconnected' && !isDemo && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-4 py-2 shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>
          <span className="text-xs font-medium text-amber-700">Reconnecting...</span>
        </div>
      )}
    </>
  )
}
