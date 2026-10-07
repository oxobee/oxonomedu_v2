'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Presentation,
  Calendar,
  FileText,
  Sparkles,
  Gamepad2,
  BookOpen,
  Settings,
  Tv,
} from 'lucide-react'
import { RemoteShortcutItem, RemoteActionType } from '@/lib/remote/protocol'
import ShortcutManagerModal from './ShortcutManagerModal'

interface RemoteShortcutsProps {
  shortcuts: RemoteShortcutItem[]
  onAction: (action: RemoteActionType, payload?: any) => void
  onSaveShortcuts: (newShortcuts: RemoteShortcutItem[]) => Promise<void>
  disabled?: boolean
}

// Icon helper to render the corresponding Lucide icon
function ShortcutIcon({ icon, className = 'w-6 h-6' }: { icon: string; className?: string }) {
  switch (icon) {
    case 'Presentation':
      return <Presentation className={className} />
    case 'Calendar':
      return <Calendar className={className} />
    case 'FileText':
      return <FileText className={className} />
    case 'Sparkles':
      return <Sparkles className={className} />
    case 'Gamepad2':
      return <Gamepad2 className={className} />
    case 'BookOpen':
      return <BookOpen className={className} />
    default:
      return <Tv className={className} />
  }
}

export default function RemoteShortcuts({
  shortcuts,
  onAction,
  onSaveShortcuts,
  disabled = false,
}: RemoteShortcutsProps) {
  const [isManagerOpen, setIsManagerOpen] = useState(false)

  const handleTap = (item: RemoteShortcutItem) => {
    if (disabled) return
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(30) } catch (_) {}
    }
    onAction(item.action, item.payload)
  }

  // Sort shortcuts by order
  const sortedShortcuts = [...shortcuts].sort((a, b) => a.order - b.order)

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-md rounded-3xl p-4 border border-slate-800 shadow-xl space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            Uygulama Kısayolları
          </span>
          <span className="text-[10px] font-bold text-slate-500">
            ({sortedShortcuts.length})
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsManagerOpen(true)}
          disabled={disabled}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-650 text-slate-300 hover:text-white text-[11px] font-bold border border-slate-700/60 transition-all cursor-pointer disabled:opacity-40"
        >
          <Settings className="w-3.5 h-3.5 text-indigo-400" />
          <span>Düzenle</span>
        </button>
      </div>

      {/* Grid of Shortcuts */}
      <div className="grid grid-cols-2 gap-2.5">
        {sortedShortcuts.map((item) => (
          <motion.button
            key={item.id}
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => handleTap(item)}
            disabled={disabled}
            className={`p-3.5 rounded-2xl bg-gradient-to-br ${item.color} text-white flex flex-col items-start justify-between min-h-[92px] shadow-lg shadow-black/30 border border-white/10 cursor-pointer text-left relative overflow-hidden group disabled:opacity-40`}
          >
            {/* Subtle glow / backdrop accent */}
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full blur-xl pointer-events-none" />

            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 mb-2 border border-white/20">
              <ShortcutIcon icon={item.icon} className="w-4 h-4 text-white" />
            </div>

            <div className="w-full">
              <span className="text-xs sm:text-sm font-black leading-tight block tracking-tight">
                {item.label}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {sortedShortcuts.length === 0 && (
        <div className="p-6 text-center text-slate-500 text-xs font-semibold border border-dashed border-slate-800 rounded-2xl">
          Aktif kısayol bulunmuyor. &quot;Düzenle&quot; butonuna basarak kısayol ekleyebilirsiniz.
        </div>
      )}

      {/* Edit Modal */}
      <ShortcutManagerModal
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        shortcuts={sortedShortcuts}
        onSave={onSaveShortcuts}
      />
    </div>
  )
}
