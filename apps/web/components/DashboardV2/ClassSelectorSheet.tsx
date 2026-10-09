'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  Search,
  X,
  Users,
  GraduationCap,
  Sparkles,
} from 'lucide-react'
import { ClassroomItem } from '@services/demo/schoolDirectory'

interface ClassSelectorSheetProps {
  isOpen: boolean
  onClose: () => void
  classrooms: ClassroomItem[]
  selectedClass: ClassroomItem | null
  onSelect: (classroom: ClassroomItem) => void
  theme?: 'light' | 'dark'
}

export default function ClassSelectorSheet({
  isOpen,
  onClose,
  classrooms,
  selectedClass,
  onSelect,
  theme = 'light',
}: ClassSelectorSheetProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGradeTab, setSelectedGradeTab] = useState<string>('all')

  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setSearchQuery('')
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Extract unique grade levels
  const gradeLevels = useMemo(() => {
    const set = new Set<string>()
    classrooms.forEach((c) => {
      if (c.grade_level) set.add(c.grade_level)
    })
    return Array.from(set)
  }, [classrooms])

  // Filter classrooms
  const filteredClassrooms = useMemo(() => {
    return classrooms.filter((c) => {
      if (selectedGradeTab !== 'all' && c.grade_level !== selectedGradeTab) {
        return false
      }
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.teacher_name.toLowerCase().includes(q)
      )
    })
  }, [classrooms, selectedGradeTab, searchQuery])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`${theme} fixed inset-0 z-50 flex items-end md:items-center justify-center font-jakarta`}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Sheet / Modal Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full md:max-w-md bg-white dark:bg-[#0E1526] rounded-t-3xl md:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[85vh] md:max-h-[80vh] flex flex-col z-10 overflow-hidden pb-[env(safe-area-inset-bottom)]"
          >
            {/* Drag Handle (Mobile) */}
            <div className="pt-3 pb-1 flex justify-center md:hidden">
              <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-5 pt-3 pb-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Sınıf & Şube Seçimi</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Çalışmak istediğiniz aktif sınıfı seçin</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Kapat"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 pb-2">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Sınıf veya öğretmen ara (örn: 4-A)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Grade Tabs (Horizontal scroll) */}
            <div className="px-4 pb-2 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedGradeTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedGradeTab === 'all'
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Tümü ({classrooms.length})
              </button>
              {gradeLevels.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedGradeTab(lvl)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedGradeTab === lvl
                      ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Classrooms List */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
              {filteredClassrooms.length === 0 ? (
                <div className="py-12 text-center text-gray-400 dark:text-gray-500 text-xs">
                  Aramanızla eşleşen sınıf bulunamadı.
                </div>
              ) : (
                filteredClassrooms.map((c) => {
                  const isSelected = selectedClass?.id === c.id || selectedClass?.code === c.code
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        onSelect(c)
                        onClose()
                      }}
                      className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer active:scale-[0.99] border ${
                        isSelected
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-600/80 shadow-xs'
                          : 'bg-white dark:bg-[#131A2B] hover:bg-gray-50 dark:hover:bg-[#1A2338] border-gray-100 dark:border-gray-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Class Code Badge */}
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                            isSelected
                              ? 'bg-emerald-600 dark:bg-emerald-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {c.code}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900 dark:text-white text-sm truncate">
                              {c.name}
                            </span>
                            {c.code === '4-A' && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80">
                                <Sparkles size={10} /> Varsayılan
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1.5 mt-0.5">
                            <span className="font-medium">{c.teacher_name}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Users size={12} className="text-gray-400 dark:text-gray-500" />
                              {c.student_count || 30} Öğrenci
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Selection Indicator */}
                      <div className="shrink-0 pl-2">
                        {isSelected ? (
                          <div className="w-7 h-7 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                            <Check size={14} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-300 dark:text-gray-600 hover:border-gray-400 dark:hover:border-gray-500" />
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {/* Footer Summary */}
            <div className="p-3 bg-gray-50 dark:bg-[#0A0F1D] border-t border-gray-100 dark:border-gray-800/80 text-center text-[11px] text-gray-500 dark:text-gray-400">
              Seçilen sınıf verileri çalışma alanınızda anında güncellenir.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
