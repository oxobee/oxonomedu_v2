'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  FileText,
  Pin,
  Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface NoteItem {
  id: string
  text: string
  done: boolean
  createdAt: string
  category?: string
}

const getClassDefaultNotes = (code: string): NoteItem[] => {
  if (code.includes('1-B') || code === '1-B') {
    return [
      {
        id: 'n-1b-1',
        text: '1-B Matematik: Ritmik sayma ödevinde ek pekiştirme yapılacak.',
        done: false,
        createdAt: 'Bugün 09:30',
        category: 'Ders Materyali',
      },
      {
        id: 'n-1b-2',
        text: '1-B Hayat Bilgisi çalışma yaprağı akıllı tahtaya yansıtılacak.',
        done: true,
        createdAt: 'Dün 14:10',
        category: 'Akıllı Tahta',
      },
    ]
  }
  return [
    {
      id: 'n-1a-1',
      text: '1-A Türkçe okuma parçası fotokopisi dağıtılacak.',
      done: false,
      createdAt: 'Bugün 09:15',
      category: 'Ders Materyali',
    },
    {
      id: 'n-1a-2',
      text: 'Erçil Evren: Ritmik sayma ödevinde ek pekiştirme yapılacak.',
      done: true,
      createdAt: 'Dün 14:30',
      category: 'Öğrenci Takip',
    },
    {
      id: 'n-1a-3',
      text: 'Akıllı tahta üzerinden yeni nesil soru çözümü etkinliği başlatılacak.',
      done: false,
      createdAt: 'Bugün 10:00',
      category: 'Akıllı Tahta',
    },
  ]
}

interface TeacherNotesModalProps {
  isOpen: boolean
  onClose: () => void
  classNameCode?: string
  theme?: 'light' | 'dark'
}

export default function TeacherNotesModal({
  isOpen,
  onClose,
  classNameCode = '1-A',
  theme = 'light',
}: TeacherNotesModalProps) {
  const [notes, setNotes] = useState<NoteItem[]>([])
  const [newText, setNewText] = useState('')
  const [newCategory, setNewCategory] = useState('Ders İçi')
  const [expandedNoteIds, setExpandedNoteIds] = useState<Record<string, boolean>>({})

  const storageKey = `oxonom_teacher_notes_${classNameCode || '1-A'}`

  const toggleExpand = (id: string) => {
    setExpandedNoteIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(storageKey)
        if (raw) {
          setNotes(JSON.parse(raw))
        } else {
          const initial = getClassDefaultNotes(classNameCode)
          setNotes(initial)
          localStorage.setItem(storageKey, JSON.stringify(initial))
        }
      } catch (_) {
        setNotes(getClassDefaultNotes(classNameCode))
      }
    }
  }, [isOpen, classNameCode, storageKey])

  const saveNotes = (updated: NoteItem[]) => {
    setNotes(updated)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated))
      } catch (_) {}
    }
  }

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newText.trim()) return

    const newNote: NoteItem = {
      id: `n-${Date.now()}`,
      text: newText.trim(),
      done: false,
      createdAt: 'Az önce',
      category: newCategory,
    }

    const updated = [newNote, ...notes]
    saveNotes(updated)
    setNewText('')
    toast.success('Not başarıyla eklendi.')
  }

  const handleToggleDone = (id: string) => {
    const updated = notes.map((n) => (n.id === id ? { ...n, done: !n.done } : n))
    saveNotes(updated)
  }

  const handleDelete = (id: string) => {
    const updated = notes.filter((n) => n.id !== id)
    saveNotes(updated)
    toast.success('Not silindi.')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className={`${theme} fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta`}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Sheet / Modal */}
        <motion.div
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full sm:max-w-md bg-white dark:bg-[#0E1526] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[85vh] flex flex-col z-10 overflow-hidden pb-[env(safe-area-inset-bottom)] font-jakarta"
        >
          {/* Mobile Handle */}
          <div className="pt-3 pb-1 flex justify-center sm:hidden">
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#34D399]/20 text-[#059669] dark:text-[#34D399] flex items-center justify-center font-bold">
                <FileText size={17} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <span>Öğretmen Ders Notları</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-800/60">
                    {classNameCode}
                  </span>
                </h3>
                <p className="text-[11px] text-gray-400">Ders içi hatırlatıcılar ve yapılacaklar</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* New Note Form */}
          <form onSubmit={handleAddNote} className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Yeni not veya hatırlatma yazın..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#34D399]/30 transition-all"
              />
              <button
                type="submit"
                className="px-3.5 py-2.5 bg-[#34D399] hover:bg-[#2dd4bf] text-[#022c22] font-bold rounded-xl text-xs flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Plus size={15} />
                <span>Ekle</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400 font-semibold">Kategori:</span>
              {['Ders İçi', 'Öğrenci Takip', 'Materyal', 'Ödev'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setNewCategory(cat)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    newCategory === cat
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </form>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {notes.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                Kayıtlı not bulunmuyor. Yeni bir hatırlatıcı ekleyebilirsiniz.
              </div>
            ) : (
              notes.map((item) => {
                const isExpanded = !!expandedNoteIds[item.id]
                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border transition-all flex items-start justify-between gap-2.5 ${
                      item.done
                        ? 'bg-gray-50/70 dark:bg-[#12192A]/50 border-gray-100 dark:border-gray-800/80 opacity-60'
                        : 'bg-white dark:bg-[#131C31] border-gray-100 dark:border-gray-800 shadow-xs'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleDone(item.id)
                      }}
                      className="mt-0.5 text-gray-400 hover:text-[#34D399] transition-colors cursor-pointer shrink-0"
                    >
                      {item.done ? (
                        <CheckCircle2 size={16} className="text-[#34D399]" />
                      ) : (
                        <Circle size={16} />
                      )}
                    </button>

                    <div
                      onClick={() => toggleExpand(item.id)}
                      className="flex-1 min-w-0 cursor-pointer group select-none"
                      title={isExpanded ? 'Daraltmak için tıklayın' : 'Genişletmek için tıklayın'}
                    >
                      <p
                        className={`text-xs leading-relaxed break-words break-all transition-all duration-200 ${
                          isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-1'
                        } ${
                          item.done
                            ? 'line-through text-gray-400 dark:text-gray-500'
                            : 'font-medium text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {item.text}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                        {item.category && (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {item.category}
                          </span>
                        )}
                        <span>•</span>
                        <span>{item.createdAt}</span>
                        {item.text.length > 35 && (
                          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium ml-auto flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                            {isExpanded ? 'Daralt' : 'Daha fazla'}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(item.id)
                      }}
                      className="text-gray-300 hover:text-red-500 p-1 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
