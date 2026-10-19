'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Search,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Layers,
  GraduationCap,
  Briefcase,
  Calendar,
  Building2,
  BookOpen,
  BarChart3,
  HeartHandshake,
  Megaphone,
  Tv,
  FolderKanban,
  CalendarDays,
  ShieldAlert,
  Settings,
  LayoutDashboard,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { ADMIN_MODULES, AdminModuleItem } from './adminModulesData'

interface MobileAdminMoreSheetProps {
  isOpen: boolean
  onClose: () => void
  theme?: 'light' | 'dark'
  orgSlug?: string
}

// Icon helper mapping
function renderModuleIcon(iconName: string, className = 'w-5 h-5') {
  switch (iconName) {
    case 'LayoutDashboard':
      return <LayoutDashboard className={className} />
    case 'GraduationCap':
      return <GraduationCap className={className} />
    case 'Briefcase':
      return <Briefcase className={className} />
    case 'Calendar':
      return <Calendar className={className} />
    case 'Building2':
      return <Building2 className={className} />
    case 'BookOpen':
      return <BookOpen className={className} />
    case 'BarChart3':
      return <BarChart3 className={className} />
    case 'HeartHandshake':
      return <HeartHandshake className={className} />
    case 'Megaphone':
      return <Megaphone className={className} />
    case 'Tv':
      return <Tv className={className} />
    case 'FolderKanban':
      return <FolderKanban className={className} />
    case 'CalendarDays':
      return <CalendarDays className={className} />
    case 'ShieldAlert':
      return <ShieldAlert className={className} />
    case 'Settings':
      return <Settings className={className} />
    default:
      return <Layers className={className} />
  }
}

export default function MobileAdminMoreSheet({
  isOpen,
  onClose,
  theme = 'dark',
  orgSlug,
}: MobileAdminMoreSheetProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedModuleId((prev) => (prev === id ? null : id))
  }

  const handleUnavailableClick = (title: string) => {
    toast(
      (t) => (
        <div className="flex items-start gap-2.5">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-xs text-gray-900 dark:text-white">
              {title}
            </div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Bu modül henüz sisteme eklenmemiştir. Sırayla geliştirilip yayına alınacaktır.
            </div>
          </div>
        </div>
      ),
      {
        duration: 4000,
        style: {
          borderRadius: '16px',
          background: theme === 'dark' ? '#121826' : '#ffffff',
          color: theme === 'dark' ? '#ffffff' : '#0F172A',
          border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
        },
      }
    )
  }

  const filteredModules = ADMIN_MODULES.filter((mod) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      mod.title.toLowerCase().includes(q) ||
      mod.code.includes(q) ||
      mod.description.toLowerCase().includes(q) ||
      mod.subItems.some((item) => item.toLowerCase().includes(q))
    )
  })

  // Format destination URL with orgslug if present
  const getUrl = (href?: string) => {
    if (!href) return '#'
    return orgSlug ? `/orgs/${orgSlug}${href}` : href
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
          />

          {/* Sheet Modal */}
          <motion.div
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={`relative w-full sm:max-w-[420px] max-h-[88vh] rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col z-10 overflow-hidden ${
              theme === 'dark'
                ? 'bg-[#211729] text-[#FCF9FD] border-t sm:border border-[#49364F]'
                : 'bg-white text-[#241329] border-t sm:border border-[#E8DFEB]'
            }`}
          >
            {/* Header Handle */}
            <div className="pt-3 pb-1 flex justify-center sm:hidden">
              <div className="w-12 h-1.5 bg-[#E8DFEB] dark:bg-[#49364F] rounded-full" />
            </div>

            {/* Title Bar */}
            <div className="px-5 pt-3 pb-3 flex items-center justify-between border-b border-[#E8DFEB] dark:border-[#49364F]/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F0D8FA] dark:bg-[#4B075F]/30 text-[#4B075F] dark:text-[#C58ADB] flex items-center justify-center">
                  <Layers size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold tracking-tight">
                    İdare Paneli Menüsü
                  </h3>
                  <p className="text-[11px] text-[#716779] dark:text-[#B5A5BD] font-medium">
                    Tüm okul yönetim modülleri (01 — 14)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#F7F0FA] dark:bg-[#2D2035] hover:bg-[#F0D8FA] dark:hover:bg-[#49364F] text-[#716779] dark:text-[#D2C5D8] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Kapat"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Input */}
            <div className="px-5 pt-3.5 pb-2">
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#716779]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Modül veya özellik ara (örn: devamsızlık, müfredat)..."
                  className={`w-full h-10 pl-9 pr-3.5 rounded-xl text-xs font-medium outline-hidden transition-all ${
                    theme === 'dark'
                      ? 'bg-[#17101C] text-white placeholder-[#716779] border border-[#49364F] focus:border-[#8D49A6]'
                      : 'bg-[#FCF9FD] text-[#241329] placeholder-[#716779] border border-[#E8DFEB] focus:border-[#8D49A6]'
                  }`}
                />
              </div>
            </div>

            {/* Modules List Scrollable Area */}
            <div className="flex-1 overflow-y-auto px-5 py-2 space-y-2.5 divide-y divide-[#E8DFEB]/50 dark:divide-[#49364F]/40">
              {filteredModules.map((mod) => {
                const isExpanded = expandedModuleId === mod.id

                return (
                  <div key={mod.id} className="pt-2.5 first:pt-0">
                    <div
                      className={`rounded-2xl p-3 border transition-all ${
                        mod.isAvailable
                          ? theme === 'dark'
                            ? 'bg-[#2D2035] border-[#8D49A6]/40 hover:border-[#8D49A6]'
                            : 'bg-[#FCF9FD] border-[#8D49A6]/30 hover:border-[#8D49A6]'
                          : theme === 'dark'
                          ? 'bg-[#17101C]/60 border-[#49364F]/50'
                          : 'bg-[#F7F0FA]/80 border-[#E8DFEB]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Left Icon & Code */}
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              mod.isAvailable
                                ? 'bg-[#F0D8FA] dark:bg-[#4B075F]/40 text-[#4B075F] dark:text-[#C58ADB]'
                                : theme === 'dark'
                                ? 'bg-[#2D2035] text-[#716779]'
                                : 'bg-[#E8DFEB] text-[#716779]'
                            }`}
                          >
                            {renderModuleIcon(mod.icon, 'w-4 h-4')}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-[#F0D8FA] dark:bg-[#4B075F]/30 text-[#4B075F] dark:text-[#C58ADB]">
                                {mod.code}
                              </span>
                              <h4 className="text-xs font-extrabold truncate text-[#241329] dark:text-white">
                                {mod.title}
                              </h4>
                            </div>

                            <p className="text-[11px] text-[#716779] dark:text-[#B5A5BD] mt-1 line-clamp-1">
                              {mod.description}
                            </p>
                          </div>
                        </div>

                        {/* Status Badge & Action */}
                        <div className="shrink-0 flex items-center gap-1.5">
                          {mod.isAvailable ? (
                            <Link
                              href={getUrl(mod.href)}
                              onClick={onClose}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#4B075F] text-white hover:bg-[#620B79] transition-colors cursor-pointer"
                            >
                              <CheckCircle2 size={11} />
                              <span>Aç</span>
                              <ExternalLink size={10} />
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUnavailableClick(mod.title)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFF3D9] dark:bg-[#B86B00]/20 text-[#B86B00] dark:text-[#F5C542] border border-[#B86B00]/20 transition-colors cursor-pointer"
                            >
                              <Clock size={11} />
                              <span>Yakında</span>
                            </button>
                          )}

                          {/* Accordion toggle button */}
                          <button
                            type="button"
                            onClick={() => toggleExpand(mod.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#716779] hover:text-[#241329] dark:hover:text-white transition-colors"
                            aria-label="Detayları göster"
                          >
                            {isExpanded ? (
                              <ChevronDown size={14} />
                            ) : (
                              <ChevronRight size={14} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Sub-items */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden mt-3 pt-2.5 border-t border-[#E8DFEB] dark:border-[#49364F]/80"
                          >
                            <div className="text-[10px] font-bold uppercase tracking-wider text-[#716779] dark:text-[#B5A5BD] mb-1.5">
                              İçerdiği Alt Özellikler:
                            </div>
                            <div className="grid grid-cols-1 gap-1">
                              {mod.subItems.map((item, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => {
                                    if (mod.isAvailable) {
                                      onClose()
                                    } else {
                                      handleUnavailableClick(item)
                                    }
                                  }}
                                  className={`px-2.5 py-1.5 rounded-lg text-[11px] flex items-center justify-between transition-colors cursor-pointer ${
                                    mod.isAvailable
                                      ? 'text-[#4B075F] dark:text-[#C58ADB] hover:bg-[#F0D8FA]/50 dark:hover:bg-[#4B075F]/20'
                                      : 'text-[#716779] dark:text-[#B5A5BD] hover:bg-[#F7F0FA] dark:hover:bg-[#2D2035]/60'
                                  }`}
                                >
                                  <span className="flex items-center gap-1.5 truncate">
                                    <span className="w-1 h-1 rounded-full bg-[#716779] dark:bg-[#B5A5BD] shrink-0" />
                                    <span className="truncate">{item}</span>
                                  </span>
                                  {mod.isAvailable ? (
                                    <ExternalLink size={10} className="text-[#8D49A6] shrink-0" />
                                  ) : (
                                    <span className="text-[9px] text-[#B86B00] dark:text-[#F5C542] font-bold shrink-0">
                                      Eklenecek
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )
              })}

              {filteredModules.length === 0 && (
                <div className="py-10 text-center text-xs text-[#716779]">
                  Aradığınız kriterlere uygun idare modülü bulunamadı.
                </div>
              )}
            </div>

            {/* Bottom Footer Info */}
            <div className="px-5 py-3 border-t border-[#E8DFEB] dark:border-[#49364F]/80 bg-[#FCF9FD] dark:bg-[#17101C]/60 flex items-center justify-between text-[11px] text-[#716779] dark:text-[#B5A5BD]">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#D914C8] animate-pulse" />
                <span>3 Aktif Modül</span>
              </span>
              <span className="font-semibold text-[#716779] dark:text-[#B5A5BD]">
                11 Modül Sırayla Eklenecek
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
