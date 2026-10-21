'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Maximize2, Download, Trash2, Edit3, StickyNote } from 'lucide-react'

export interface SmartBoardMockupProps {
  imageUrl: string
  title: string
  courseName: string
  dateStr?: string
  studentNote?: string
  onExpand?: () => void
  onAddNote?: () => void
  onDownload?: () => void
  onDelete?: () => void
  compact?: boolean
  showControls?: boolean
}

export default function SmartBoardMockup({
  imageUrl,
  title,
  courseName,
  dateStr,
  studentNote,
  onExpand,
  onAddNote,
  onDownload,
  onDelete,
  compact = false,
  showControls = true,
}: SmartBoardMockupProps) {
  return (
    <div className="w-full select-none">
      {/* ── REALISTIC CLASSROOM SMART BOARD FRAME ── */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#242936] via-[#1A1D27] to-[#12151D] p-2 sm:p-3 border-[2.5px] border-[#374053] shadow-2xl shadow-black/40 flex flex-col group transition-all duration-300">
        {/* Top Bezel: Camera & Power LED */}
        <div className="flex items-center justify-between px-2 pb-1.5 pt-0.5 text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5 opacity-80">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span className="hidden sm:inline font-mono text-[9px] text-slate-400">4K UHD</span>
          </div>

          {/* Top Center Camera Notch */}
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0E1118] border border-slate-700/60 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-800 border border-slate-600" />
            <span className="w-2 h-2 rounded-full bg-[#1A2536] border border-cyan-500/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-800 border border-slate-600" />
          </div>

          {/* Power / Status LED */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            <span className="hidden sm:inline font-mono text-[9px] text-emerald-400/90 font-bold">ONLINE</span>
          </div>
        </div>

        {/* ── THE INTERACTIVE SCREEN ── */}
        <div className="relative aspect-[16/10] bg-[#0A0D15] rounded-xl sm:rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
          {/* Subtle anti-glare glass sheen */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.07] pointer-events-none z-10" />

          {/* Board Visual (Image / SVG Canvas) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.015]"
            loading="lazy"
          />

          {/* Top-Left Course Tag */}
          <div className="absolute top-2.5 left-2.5 z-20">
            <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white text-[10.5px] font-extrabold border border-white/10 shadow-md">
              {courseName}
            </span>
          </div>

          {/* Date Tag Top Right */}
          {dateStr && (
            <div className="absolute top-2.5 right-2.5 z-20">
              <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-slate-300 text-[9.5px] font-semibold border border-white/5">
                {dateStr}
              </span>
            </div>
          )}

          {/* Student Personal Study Note Sticker (Bottom-Left) */}
          {studentNote && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute bottom-2.5 left-2.5 right-2.5 sm:right-auto sm:max-w-[85%] z-20 bg-amber-400/95 dark:bg-amber-500/95 text-slate-950 px-3 py-1.5 rounded-xl shadow-lg border border-amber-300 backdrop-blur-xs flex items-start gap-1.5"
            >
              <StickyNote size={13} className="shrink-0 mt-0.5 text-slate-900 fill-amber-200" />
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider block text-slate-900/80 leading-none">
                  Kişisel Çalışma Notum
                </span>
                <p className="text-[11px] font-bold text-slate-950 line-clamp-1 sm:line-clamp-2 leading-tight">
                  {studentNote}
                </p>
              </div>
            </motion.div>
          )}

          {/* Interactive Hover Actions Overlay */}
          {showControls && (
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 flex items-center justify-center gap-2 p-3">
              {onExpand && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onExpand()
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white text-slate-900 text-xs font-black flex items-center gap-1.5 shadow-xl hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                  title="Tam Ekran Büyüt"
                >
                  <Maximize2 size={14} className="text-[#8D49A6]" />
                  <span>Büyüt</span>
                </button>
              )}

              {onAddNote && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onAddNote()
                  }}
                  className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-xl active:scale-95 transition-all cursor-pointer"
                  title={studentNote ? 'Notu Düzenle' : 'Not Ekle'}
                >
                  <Edit3 size={14} />
                  <span>{studentNote ? 'Notu Düzenle' : 'Not Ekle'}</span>
                </button>
              )}

              {onDownload && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDownload()
                  }}
                  className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white shadow-xl active:scale-95 transition-all cursor-pointer border border-slate-700"
                  title="Görseli İndir"
                >
                  <Download size={15} />
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                  className="p-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white shadow-xl active:scale-95 transition-all cursor-pointer border border-rose-500"
                  title="Tahta Notunu Sil"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── BOTTOM BEZEL: MAGNETIC PEN TRAY & SOUNDBAR ── */}
        <div className="pt-2 sm:pt-2.5 pb-0.5 flex items-center justify-between px-2 text-slate-400">
          {/* Laser-engraved brand mark */}
          <div className="flex items-center gap-1.5 font-bold tracking-wider text-[8.5px] text-slate-400/90 font-mono">
            <span className="w-1.5 h-1.5 rounded-xs bg-[#8D49A6]" />
            <span>OXONOM SMART BOARD 4K</span>
          </div>

          {/* Magnetic Digital Styluses & Eraser Shelf */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 px-3 py-1 rounded-full bg-[#0E1118] border border-slate-700/60 shadow-inner">
            {/* Red Stylus */}
            <div
              className="w-6 sm:w-8 h-1.5 rounded-full bg-gradient-to-r from-rose-500 to-rose-400 shadow-[0_0_4px_#f43f5e] cursor-default"
              title="Kırmızı Dijital Kalem"
            />
            {/* Blue Stylus */}
            <div
              className="w-6 sm:w-8 h-1.5 rounded-full bg-gradient-to-r from-sky-500 to-sky-400 shadow-[0_0_4px_#38bdf8] cursor-default"
              title="Mavi Dijital Kalem"
            />
            {/* Purple Stylus */}
            <div
              className="w-6 sm:w-8 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-purple-400 shadow-[0_0_4px_#a855f7] cursor-default"
              title="Mor Dijital Kalem"
            />
            {/* Digital Eraser */}
            <div
              className="w-5 sm:w-6 h-2 rounded-xs bg-slate-700 border border-slate-600 shadow-inner"
              title="Manyetik Tahta Silgisi"
            />
          </div>

          {/* Speaker grille dots */}
          <div className="hidden sm:flex items-center gap-0.5 text-slate-600">
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span className="w-1 h-1 rounded-full bg-slate-600" />
          </div>
        </div>
      </div>
    </div>
  )
}
