'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  PenTool,
  Eraser,
  Undo2,
  Redo2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  SlidersHorizontal,
} from 'lucide-react'
import { RemoteActionType } from '@/lib/remote/protocol'

interface WhiteboardToolbarProps {
  onAction: (action: RemoteActionType, payload?: any) => void
  disabled?: boolean
}

export default function WhiteboardToolbar({ onAction, disabled = false }: WhiteboardToolbarProps) {
  const [selectedTool, setSelectedTool] = useState<'pen' | 'eraser' | null>(null)

  const handleTap = (action: RemoteActionType, payload?: any) => {
    if (disabled) return
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(30) } catch (_) {}
    }

    if (action === 'PEN') {
      setSelectedTool(prev => prev === 'pen' ? null : 'pen')
    } else if (action === 'ERASER') {
      setSelectedTool(prev => prev === 'eraser' ? null : 'eraser')
    }

    onAction(action, payload)
  }

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-md rounded-3xl p-4 border border-slate-800 shadow-xl space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
          Tahta & Sunum Araçları
        </span>
        <span className="text-[10px] font-bold text-slate-500">
          Sayfa & Çizim
        </span>
      </div>

      {/* Sayfa Geçişleri (Önceki - Sonraki) */}
      <div className="grid grid-cols-2 gap-2.5">
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => handleTap('PREVIOUS_PAGE')}
          disabled={disabled}
          className="py-3.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-750 active:bg-slate-700 text-slate-100 font-bold text-sm flex items-center justify-center gap-2 border border-slate-700/80 cursor-pointer disabled:opacity-40 shadow-sm"
        >
          <ChevronLeft className="w-5 h-5 text-indigo-400" />
          <span>Önceki Sayfa</span>
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => handleTap('NEXT_PAGE')}
          disabled={disabled}
          className="py-3.5 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 border border-indigo-400/30 cursor-pointer disabled:opacity-40 shadow-md shadow-indigo-950/30"
        >
          <span>Sonraki Sayfa</span>
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Çizim & Düzenleme Araçları */}
      <div className="grid grid-cols-4 gap-2">
        {/* Kalem */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => handleTap('PEN')}
          disabled={disabled}
          className={`py-3 px-2 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border disabled:opacity-40 ${
            selectedTool === 'pen'
              ? 'bg-blue-600/30 text-blue-300 border-blue-500/50 shadow-sm ring-2 ring-blue-500/40'
              : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-750'
          }`}
        >
          <PenTool className="w-5 h-5 text-blue-400" />
          <span>Kalem</span>
        </motion.button>

        {/* Silgi */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => handleTap('ERASER')}
          disabled={disabled}
          className={`py-3 px-2 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border disabled:opacity-40 ${
            selectedTool === 'eraser'
              ? 'bg-rose-600/30 text-rose-300 border-rose-500/50 shadow-sm ring-2 ring-rose-500/40'
              : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-750'
          }`}
        >
          <Eraser className="w-5 h-5 text-rose-400" />
          <span>Silgi</span>
        </motion.button>

        {/* Geri Al */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => handleTap('UNDO')}
          disabled={disabled}
          className="py-3 px-2 rounded-2xl bg-slate-800/80 hover:bg-slate-750 active:bg-slate-700 text-slate-300 font-bold text-xs flex flex-col items-center justify-center gap-1.5 border border-slate-700/60 cursor-pointer disabled:opacity-40"
        >
          <Undo2 className="w-5 h-5 text-amber-400" />
          <span>Geri Al</span>
        </motion.button>

        {/* Yinele */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => handleTap('REDO')}
          disabled={disabled}
          className="py-3 px-2 rounded-2xl bg-slate-800/80 hover:bg-slate-750 active:bg-slate-700 text-slate-300 font-bold text-xs flex flex-col items-center justify-center gap-1.5 border border-slate-700/60 cursor-pointer disabled:opacity-40"
        >
          <Redo2 className="w-5 h-5 text-emerald-400" />
          <span>Yinele</span>
        </motion.button>
      </div>

      {/* Zoom Araçları */}
      <div className="grid grid-cols-2 gap-2.5 pt-0.5">
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => handleTap('ZOOM_IN')}
          disabled={disabled}
          className="py-2.5 px-3 rounded-2xl bg-slate-800/60 hover:bg-slate-750 active:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700/60 cursor-pointer disabled:opacity-40"
        >
          <ZoomIn className="w-4 h-4 text-cyan-400" />
          <span>Yakınlaştır (+)</span>
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => handleTap('ZOOM_OUT')}
          disabled={disabled}
          className="py-2.5 px-3 rounded-2xl bg-slate-800/60 hover:bg-slate-750 active:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700/60 cursor-pointer disabled:opacity-40"
        >
          <ZoomOut className="w-4 h-4 text-cyan-400" />
          <span>Uzaklaştır (−)</span>
        </motion.button>
      </div>
    </div>
  )
}
