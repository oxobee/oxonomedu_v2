'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  RotateCcw,
  Check,
  Sparkles,
  Presentation,
  Calendar,
  FileText,
  Gamepad2,
  BookOpen,
  Users,
} from 'lucide-react'
import { RemoteShortcutItem, DEFAULT_REMOTE_SHORTCUTS } from '@/lib/remote/protocol'

interface ShortcutManagerModalProps {
  isOpen: boolean
  onClose: () => void
  shortcuts: RemoteShortcutItem[]
  onSave: (newShortcuts: RemoteShortcutItem[]) => Promise<void>
}

// Available presets that user can add
const AVAILABLE_PRESETS: Omit<RemoteShortcutItem, 'order'>[] = [
  {
    id: 'shortcut_whiteboard',
    label: 'Akıllı Tahta',
    icon: 'Presentation',
    color: 'from-blue-600 to-indigo-700',
    action: 'OPEN_WHITEBOARD',
  },
  {
    id: 'shortcut_attendance',
    label: 'Yoklama Al',
    icon: 'Calendar',
    color: 'from-purple-600 to-pink-700',
    action: 'OPEN_ATTENDANCE',
  },
  {
    id: 'shortcut_assignments',
    label: 'Ev Ödevleri',
    icon: 'FileText',
    color: 'from-emerald-600 to-teal-700',
    action: 'OPEN_ASSIGNMENTS',
  },
  {
    id: 'shortcut_playgrounds',
    label: 'İnteraktif Modüller',
    icon: 'Sparkles',
    color: 'from-amber-500 to-orange-600',
    action: 'OPEN_PLAYGROUNDS',
  },
  {
    id: 'shortcut_games',
    label: 'Eğitici Oyunlar',
    icon: 'Gamepad2',
    color: 'from-indigo-600 to-violet-800',
    action: 'OPEN_GAMES',
  },
  {
    id: 'shortcut_library',
    label: 'Kaynaklar',
    icon: 'BookOpen',
    color: 'from-rose-500 to-red-700',
    action: 'OPEN_LIBRARY',
  },
]

export default function ShortcutManagerModal({
  isOpen,
  onClose,
  shortcuts,
  onSave,
}: ShortcutManagerModalProps) {
  const [items, setItems] = useState<RemoteShortcutItem[]>(shortcuts)
  const [isSaving, setIsSaving] = useState(false)

  // Sync state when opened
  React.useEffect(() => {
    if (isOpen) {
      setItems(shortcuts)
    }
  }, [isOpen, shortcuts])

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newItems.length) return

    const temp = newItems[index]
    newItems[index] = newItems[targetIndex]
    newItems[targetIndex] = temp

    // Reassign orders
    const updated = newItems.map((it, idx) => ({ ...it, order: idx + 1 }))
    setItems(updated)
  }

  const removeItem = (id: string) => {
    const filtered = items.filter(it => it.id !== id).map((it, idx) => ({ ...it, order: idx + 1 }))
    setItems(filtered)
  }

  const addPreset = (preset: Omit<RemoteShortcutItem, 'order'>) => {
    if (items.some(it => it.id === preset.id)) return
    const newItem: RemoteShortcutItem = {
      ...preset,
      order: items.length + 1,
    }
    setItems([...items, newItem])
  }

  const handleResetDefaults = () => {
    setItems(DEFAULT_REMOTE_SHORTCUTS)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(items)
      onClose()
    } catch (err) {
      console.error('Failed to save shortcuts:', err)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden text-white"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">Kısayolları Özelleştir</h2>
              <p className="text-xs text-slate-400 font-medium">
                Kumanda ekranındaki butonları sıralayın veya ekleyin
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {/* Active Shortcuts List */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                Aktif Kısayollar ({items.length})
              </h3>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center text-xs font-black text-slate-500">
                        {idx + 1}
                      </span>
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-xs`}>
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-100">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Move Up */}
                      <button
                        type="button"
                        onClick={() => moveItem(idx, 'up')}
                        disabled={idx === 0}
                        className="w-7 h-7 rounded-lg bg-slate-700/60 hover:bg-slate-700 disabled:opacity-30 text-slate-300 flex items-center justify-center cursor-pointer transition-all"
                        title="Yukarı Taşı"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        onClick={() => moveItem(idx, 'down')}
                        disabled={idx === items.length - 1}
                        className="w-7 h-7 rounded-lg bg-slate-700/60 hover:bg-slate-700 disabled:opacity-30 text-slate-300 flex items-center justify-center cursor-pointer transition-all"
                        title="Aşağı Taşı"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="w-7 h-7 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 flex items-center justify-center cursor-pointer transition-all ml-1"
                        title="Kaldır"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="p-6 text-center text-slate-500 text-xs font-semibold border border-dashed border-slate-800 rounded-2xl">
                    Henüz hiç kısayol eklenmemiş.
                  </div>
                )}
              </div>
            </div>

            {/* Presets to Add */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                Eklenebilir Butonlar
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_PRESETS.filter(p => !items.some(i => i.id === p.id)).map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => addPreset(preset)}
                    className="p-3 rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 flex items-center justify-between text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${preset.color} flex items-center justify-center text-white shrink-0`}>
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-300 group-hover:text-white truncate">
                        {preset.label}
                      </span>
                    </div>
                    <Plus className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Varsayılana Dön</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-indigo-950/40 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Kaydediliyor...' : 'Kaydet & Kapat'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
