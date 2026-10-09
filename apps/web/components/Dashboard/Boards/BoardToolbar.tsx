'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import Image from 'next/image'
import {
  Cursor,
  Hand,
  PencilSimple,
  PenNib,
  TextT,
  Eraser,
  Shapes,
  Triangle,
  Square,
  Rectangle,
  Circle,
  LineSegment,
  Cube,
  FrameCorners,
  Trash,
  Note,
  YoutubeLogo,
  Code,
  Globe,
  Smiley,
  CheckSquare,
  Headphones,
  DotsThreeCircle,
  ArrowCounterClockwise,
  ArrowClockwise,
  Plus,
  SignOut,
} from '@phosphor-icons/react'
import { DividerVerticalIcon } from '@radix-ui/react-icons'
import * as Popover from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'
import type { Editor } from '@tiptap/core'
import ToolTip from '@components/Objects/StyledElements/Tooltip/Tooltip'

export type ToolMode =
  | 'select'
  | 'pan'
  | 'draw'
  | 'handwriting'
  | 'text'
  | 'eraser'
  | 'shape'
  | 'card'
  | 'note'
  | 'frame'
  | 'todo'
  | 'modules'
  | 'sticker'
  | 'youtube'
  | 'webpage'
  | 'embed'
  | 'podcast'

export type ShapeType = 'square' | 'rect' | 'circle' | 'triangle' | 'line' | 'cube' | 'cylinder'

interface BoardToolbarProps {
  toolMode: ToolMode
  onToolModeChange: (mode: ToolMode) => void
  editor: Editor
  drawColor: string
  drawWidth: number
  onDrawColorChange: (color: string) => void
  onDrawWidthChange: (width: number) => void
  selectedShape?: ShapeType
  onSelectShape?: (shape: ShapeType) => void
  onClearAll?: () => void
  onAddTab?: () => void
  activeTabTitle?: string
}

const DRAW_COLORS = [
  '#000000', '#EF4444', '#3B82F6', '#22C55E',
  '#F97316', '#A855F7', '#EC4899', '#9CA3AF',
]

const DRAW_WIDTHS = [
  { label: 'İnce', value: 2 },
  { label: 'Orta', value: 4 },
  { label: 'Kalın', value: 7 },
]

const SHAPE_LIST: { id: ShapeType; label: string; icon: React.ComponentType<any> }[] = [
  { id: 'triangle', label: 'Üçgen', icon: Triangle },
  { id: 'square', label: 'Kare', icon: Square },
  { id: 'rect', label: 'Dikdörtgen', icon: Rectangle },
  { id: 'circle', label: 'Daire', icon: Circle },
  { id: 'line', label: 'Düz Çizgi', icon: LineSegment },
  { id: 'cube', label: 'Küp (3D)', icon: Cube },
  { id: 'cylinder', label: 'Silindir (3D)', icon: FrameCorners },
]

export default function BoardToolbar({
  toolMode,
  onToolModeChange,
  editor,
  drawColor,
  drawWidth,
  onDrawColorChange,
  onDrawWidthChange,
  selectedShape = 'square',
  onSelectShape,
  onClearAll,
  onAddTab,
  activeTabTitle,
}: BoardToolbarProps) {
  const { t } = useTranslation()
  const [drawPopoverOpen, setDrawPopoverOpen] = useState(false)
  const [hwPopoverOpen, setHwPopoverOpen] = useState(false)
  const [shapePopoverOpen, setShapePopoverOpen] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [toolbarScale, setToolbarScale] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseFloat(localStorage.getItem('board-toolbar-scale') || '1')
    }
    return 1
  })

  const router = useRouter()

  const handleExit = () => {
    if (typeof window !== 'undefined') {
      const isMobileOrTablet =
        window.innerWidth <= 1024 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Tablet/i.test(
          navigator.userAgent
        ) ||
        window.matchMedia('(max-width: 1024px)').matches ||
        ('ontouchstart' in window && window.innerWidth <= 1024)
      if (isMobileOrTablet) {
        router.push('/m-boards')
      } else {
        router.push('/dash/boards')
      }
    }
  }

  const handleScaleChange = (scale: number) => {
    setToolbarScale(scale)
    if (typeof window !== 'undefined') {
      localStorage.setItem('board-toolbar-scale', scale.toString())
    }
  }

  return (
    <>
      {/* ─── DESKTOP TOOLBAR ────────────────────────────────────────────── */}
      <div
        className="hidden md:flex absolute bottom-5 left-1/2 z-20 items-center gap-[5px] rounded-[18px] px-3 py-2 nice-shadow board-enter-toolbar border border-gray-200/80"
        style={{
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          ['--toolbar-scale' as any]: toolbarScale,
          transform: `translateX(-50%) scale(${toolbarScale})`,
          transformOrigin: 'bottom center',
          transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
        }}
      >
        {/* Logo */}
        <Link href="/dash/boards">
          <div className="bg-black rounded-lg w-[26px] h-[26px] flex items-center justify-center hover:opacity-80 transition-opacity">
            <Image
              src="/lrn.svg"
              alt="AgenaPOS"
              width={14}
              height={14}
              className="invert"
            />
          </div>
        </Link>

        {/* Çıkış Yap (Exit) Button next to mouse / cursor */}
        <ToolTip content="Tahtadan Çıkış Yap">
          <div
            onClick={handleExit}
            className="editor-tool-btn text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
            role="button"
            tabIndex={0}
            title="Çıkış Yap"
          >
            <SignOut size={16} weight="bold" />
          </div>
        </ToolTip>

        <DividerVerticalIcon style={{ color: 'grey', opacity: '0.4' }} />

        {/* 1. SEÇİM (Select) */}
        <ToolTip content="Seçim Aracı (V)">
          <div
            onClick={() => onToolModeChange('select')}
            className={cn('editor-tool-btn', toolMode === 'select' && 'is-active')}
          >
            <Cursor size={16} weight="duotone" />
          </div>
        </ToolTip>

        {/* 2. KAYDIR (Pan / Hand) */}
        <ToolTip content="Tuvali Kaydır (H)">
          <div
            onClick={() => onToolModeChange('pan')}
            className={cn('editor-tool-btn', toolMode === 'pan' && 'is-active')}
          >
            <Hand size={16} weight="duotone" />
          </div>
        </ToolTip>

        {/* 3. KALEM (Pen / Draw) */}
        <Popover.Root open={drawPopoverOpen} onOpenChange={setDrawPopoverOpen}>
          <ToolTip content="Kalem (P)">
            <Popover.Trigger asChild>
              <div
                onClick={() => {
                  onToolModeChange('draw')
                  setDrawPopoverOpen(true)
                }}
                className={cn('editor-tool-btn', toolMode === 'draw' && 'is-active')}
              >
                <PencilSimple size={16} weight="duotone" />
              </div>
            </Popover.Trigger>
          </ToolTip>
          <Popover.Portal>
            <Popover.Content
              side="top"
              sideOffset={12}
              className="rounded-2xl p-3 nice-shadow z-50 bg-white/95 backdrop-blur-md border border-neutral-200/80"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Kalem Rengi
              </div>
              <div className="flex items-center gap-1.5 mb-2.5">
                {DRAW_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => onDrawColorChange(color)}
                    className={cn(
                      'w-5 h-5 rounded-full border-2 transition-all hover:scale-110',
                      drawColor === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-neutral-200'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                Çizgi Kalınlığı
              </div>
              <div className="flex items-center gap-1.5">
                {DRAW_WIDTHS.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => onDrawWidthChange(value)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors',
                      drawWidth === value ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <Popover.Arrow className="fill-white" width={10} height={5} />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* 4. EL YAZISI (Calligraphy / Fine Pen) */}
        <Popover.Root open={hwPopoverOpen} onOpenChange={setHwPopoverOpen}>
          <ToolTip content="El Yazısı & Kaligrafi">
            <Popover.Trigger asChild>
              <div
                onClick={() => {
                  onToolModeChange('handwriting')
                  setHwPopoverOpen(true)
                }}
                className={cn('editor-tool-btn', toolMode === 'handwriting' && 'is-active')}
              >
                <PenNib size={16} weight="duotone" className="text-purple-600" />
              </div>
            </Popover.Trigger>
          </ToolTip>
          <Popover.Portal>
            <Popover.Content
              side="top"
              sideOffset={12}
              className="rounded-2xl p-3 nice-shadow z-50 bg-white/95 backdrop-blur-md border border-neutral-200/80"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                El Yazısı Mürekkebi
              </div>
              <div className="flex items-center gap-1.5 mb-2.5">
                {DRAW_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => onDrawColorChange(color)}
                    className={cn(
                      'w-5 h-5 rounded-full border-2 transition-all hover:scale-110',
                      drawColor === color ? 'border-purple-500 ring-2 ring-purple-200' : 'border-neutral-200'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                Uç Kalınlığı
              </div>
              <div className="flex items-center gap-1.5">
                {[
                  { label: 'İnce Dolma Kalem', value: 1.5 },
                  { label: 'Orta Uç', value: 3 },
                  { label: 'Fırça Uç', value: 5 },
                ].map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => onDrawWidthChange(value)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors',
                      drawWidth === value ? 'bg-purple-700 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <Popover.Arrow className="fill-white" width={10} height={5} />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* 5. METİN EKLE (Add Text) */}
        <ToolTip content="Metin Ekle (T) - Bilgisayar Yazısı">
          <div
            onClick={() => onToolModeChange('text')}
            className={cn('editor-tool-btn', toolMode === 'text' && 'is-active')}
          >
            <TextT size={16} weight="bold" className="text-blue-600" />
          </div>
        </ToolTip>

        {/* 6. SİLGİ (Eraser) */}
        <ToolTip content="Silgi (E) - Çizim ve Nesneleri Sil">
          <div
            onClick={() => onToolModeChange('eraser')}
            className={cn('editor-tool-btn', toolMode === 'eraser' && 'is-active text-rose-600')}
          >
            <Eraser size={16} weight="duotone" className="text-rose-500" />
          </div>
        </ToolTip>

        {/* 7. ŞEKİLLER (Shapes Popover) */}
        <Popover.Root open={shapePopoverOpen} onOpenChange={setShapePopoverOpen}>
          <ToolTip content="Şekil Araçları (Üçgen, Kare, Daire, Küp...)">
            <Popover.Trigger asChild>
              <div
                onClick={() => {
                  onToolModeChange('shape')
                  setShapePopoverOpen(true)
                }}
                className={cn('editor-tool-btn', toolMode === 'shape' && 'is-active')}
              >
                <Shapes size={16} weight="duotone" className="text-indigo-600" />
              </div>
            </Popover.Trigger>
          </ToolTip>
          <Popover.Portal>
            <Popover.Content
              side="top"
              sideOffset={12}
              className="rounded-2xl p-2.5 nice-shadow z-50 bg-white/95 backdrop-blur-md border border-neutral-200/80 w-52"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2 py-1">
                Geometrik Şekiller
              </div>
              <div className="grid grid-cols-2 gap-1 mt-1">
                {SHAPE_LIST.map((shape) => {
                  const SIcon = shape.icon
                  const isCur = selectedShape === shape.id && toolMode === 'shape'
                  return (
                    <button
                      key={shape.id}
                      type="button"
                      onClick={() => {
                        onSelectShape?.(shape.id)
                        onToolModeChange('shape')
                        setShapePopoverOpen(false)
                      }}
                      className={cn(
                        'flex items-center gap-1.5 p-2 rounded-xl text-xs font-semibold transition-all text-left',
                        isCur
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'hover:bg-neutral-100 text-neutral-700'
                      )}
                    >
                      <SIcon size={15} weight="duotone" />
                      <span className="truncate">{shape.label}</span>
                    </button>
                  )
                })}
              </div>
              <Popover.Arrow className="fill-white" width={10} height={5} />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <DividerVerticalIcon style={{ color: 'grey', opacity: '0.4' }} />

        {/* 8. YAPIŞKAN NOT */}
        <ToolTip content="Yapışkan Not (N)">
          <div
            onClick={() => onToolModeChange('note')}
            className={cn('editor-tool-btn', toolMode === 'note' && 'is-active')}
          >
            <Note size={16} weight="duotone" className="text-amber-500" />
          </div>
        </ToolTip>

        {/* 9. KART */}
        <ToolTip content="İçerik Kartı">
          <div
            onClick={() => onToolModeChange('card')}
            className={cn('editor-tool-btn', toolMode === 'card' && 'is-active')}
          >
            <Square size={16} weight="duotone" />
          </div>
        </ToolTip>

        {/* 10. MODÜLLER & PLAYGROUNDS */}
        <ToolTip content="Eğitici İnteraktif Modüller">
          <div
            onClick={() => onToolModeChange('modules')}
            className={cn('editor-tool-btn', toolMode === 'modules' && 'is-active')}
          >
            <Cube size={16} weight="duotone" className="text-emerald-600" />
          </div>
        </ToolTip>

        {/* 11. ÇIKARTMALAR */}
        <ToolTip content="Emojiler & Çıkartmalar">
          <div
            onClick={() => onToolModeChange('sticker')}
            className={cn('editor-tool-btn', toolMode === 'sticker' && 'is-active')}
          >
            <Smiley size={16} weight="duotone" className="text-amber-500" />
          </div>
        </ToolTip>

        {/* 12. YOUTUBE */}
        <ToolTip content="YouTube Videosu Ekle">
          <div
            onClick={() => onToolModeChange('youtube')}
            className={cn('editor-tool-btn', toolMode === 'youtube' && 'is-active')}
          >
            <YoutubeLogo size={16} weight="duotone" className="text-red-500" />
          </div>
        </ToolTip>

        {/* 13. WEB GÖRÜNÜMÜ */}
        <ToolTip content="Web Sayfası Göm">
          <div
            onClick={() => onToolModeChange('webpage')}
            className={cn('editor-tool-btn', toolMode === 'webpage' && 'is-active')}
          >
            <Globe size={16} weight="duotone" className="text-sky-500" />
          </div>
        </ToolTip>

        <DividerVerticalIcon style={{ color: 'grey', opacity: '0.4' }} />

        {/* 14. GERİ AL (Undo) */}
        <ToolTip content="Geri Al (Ctrl+Z)">
          <div
            onClick={() => editor?.chain?.().undo?.().run?.()}
            className="editor-tool-btn hover:text-black cursor-pointer"
          >
            <ArrowCounterClockwise size={16} weight="bold" />
          </div>
        </ToolTip>

        {/* 15. İLERİ AL (Redo) */}
        <ToolTip content="İleri Al (Ctrl+Y)">
          <div
            onClick={() => editor?.chain?.().redo?.().run?.()}
            className="editor-tool-btn hover:text-black cursor-pointer"
          >
            <ArrowClockwise size={16} weight="bold" />
          </div>
        </ToolTip>

        {/* 16. TÜMÜNÜ TEMİZLE (Clear All with Confirm) */}
        {onClearAll && (
          <ToolTip content="Tümünü Temizle">
            <div
              onClick={onClearAll}
              className="editor-tool-btn text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
            >
              <Trash size={16} weight="duotone" />
            </div>
          </ToolTip>
        )}

        <DividerVerticalIcon style={{ color: 'grey', opacity: '0.4' }} />

        {/* Toolbar Scale */}
        <div className="flex items-center gap-1 bg-neutral-100/80 rounded-xl p-0.5">
          {[
            { label: 'S', value: 0.85 },
            { label: 'M', value: 1.0 },
            { label: 'L', value: 1.15 },
          ].map((size) => (
            <button
              key={size.label}
              type="button"
              onClick={() => handleScaleChange(size.value)}
              className={cn(
                'w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer',
                Math.abs(toolbarScale - size.value) < 0.05
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-200/60'
              )}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── MOBILE TOOL DOCK ────────────────────────────────────────────── */}
      <div className="flex md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-40 items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-2xl shadow-xl border border-neutral-200/80 max-w-[96vw]">
        {/* Çıkış Yap Butonu */}
        <button
          type="button"
          onClick={handleExit}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors shrink-0"
          title="Çıkış Yap"
        >
          <SignOut size={16} weight="bold" />
        </button>

        <button
          type="button"
          onClick={() => onToolModeChange('select')}
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0',
            toolMode === 'select' ? 'bg-slate-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
          )}
          title="Seçim"
        >
          <Cursor size={16} weight="bold" />
        </button>

        <button
          type="button"
          onClick={() => onToolModeChange('draw')}
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0',
            toolMode === 'draw' ? 'bg-blue-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'
          )}
          title="Çizim"
        >
          <PencilSimple size={16} weight="bold" />
        </button>

        <button
          type="button"
          onClick={() => onToolModeChange('text')}
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0',
            toolMode === 'text' ? 'bg-indigo-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'
          )}
          title="Metin"
        >
          <TextT size={16} weight="bold" />
        </button>

        <button
          type="button"
          onClick={() => onToolModeChange('eraser')}
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0',
            toolMode === 'eraser' ? 'bg-rose-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'
          )}
          title="Silgi"
        >
          <Eraser size={16} weight="bold" />
        </button>

        <div className="w-px h-4 bg-neutral-200 shrink-0 mx-0.5" />

        <button
          type="button"
          onClick={() => editor?.chain?.().undo?.().run?.()}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-600 hover:bg-neutral-100 shrink-0"
          title="Geri Al"
        >
          <ArrowCounterClockwise size={15} weight="bold" />
        </button>

        {onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 shrink-0"
            title="Temizle"
          >
            <Trash size={15} weight="bold" />
          </button>
        )}

        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs shrink-0"
          title="Tüm Araçlar"
        >
          <DotsThreeCircle size={15} weight="fill" />
          <span>Araçlar</span>
        </button>
      </div>

      {/* ─── MOBILE FULL TOOL DRAWER ─────────────────────────────────────── */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl p-5 shadow-2xl border-t border-neutral-200 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-base text-neutral-900">Akıllı Tahta Araçları</h3>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="text-gray-400 p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 mt-4">
              {[
                { mode: 'select' as const, icon: Cursor, label: 'Seçim' },
                { mode: 'pan' as const, icon: Hand, label: 'Kaydır' },
                { mode: 'draw' as const, icon: PencilSimple, label: 'Kalem' },
                { mode: 'handwriting' as const, icon: PenNib, label: 'El Yazısı' },
                { mode: 'text' as const, icon: TextT, label: 'Metin Ekle' },
                { mode: 'eraser' as const, icon: Eraser, label: 'Silgi' },
                { mode: 'shape' as const, icon: Shapes, label: 'Şekiller' },
                { mode: 'note' as const, icon: Note, label: 'Yapışkan Not' },
                { mode: 'card' as const, icon: Square, label: 'Kart' },
                { mode: 'modules' as const, icon: Cube, label: 'Modüller' },
                { mode: 'sticker' as const, icon: Smiley, label: 'Çıkartma' },
                { mode: 'youtube' as const, icon: YoutubeLogo, label: 'YouTube' },
                { mode: 'webpage' as const, icon: Globe, label: 'Web' },
              ].map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    onToolModeChange(mode)
                    setMobileDrawerOpen(false)
                  }}
                  className={cn(
                    'p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center',
                    toolMode === mode
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-xs'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                  )}
                >
                  <Icon size={20} weight={toolMode === mode ? 'fill' : 'duotone'} />
                  <span className="text-xs leading-tight line-clamp-1">{label}</span>
                </button>
              ))}
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => editor?.chain?.().undo?.().run?.()}
                  className="px-3 py-1.5 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-semibold"
                >
                  Geri Al
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain?.().redo?.().run?.()}
                  className="px-3 py-1.5 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-semibold"
                >
                  İleri Al
                </button>
              </div>

              {onClearAll && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawerOpen(false)
                    onClearAll()
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold"
                >
                  Tümünü Temizle
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
