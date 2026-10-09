'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Tv,
  ChevronLeft,
  Search,
  CheckCircle2,
  Lock,
  Unlock,
  Power,
  Sparkles,
  ExternalLink,
  QrCode,
  Layers,
  Clock,
  Radio,
} from 'lucide-react'
import toast from 'react-hot-toast'
import MobileHeader from '@components/Mobile/MobileHeader'
import MobileAdminDock from './MobileAdminDock'
import MobileAdminMoreSheet from './MobileAdminMoreSheet'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'

export interface MAdminBoardsClientProps {
  orgSlug?: string
  hideHeader?: boolean
  hideDock?: boolean
}

interface AdminBoardItem {
  id: string
  className: string
  location: string
  status: 'ONLINE' | 'ACTIVE_LESSON' | 'OFFLINE'
  currentTeacher: string
  currentSubject: string
  sessionCode: string
  isLocked: boolean
  lastSync: string
}

export default function MAdminBoardsClient({
  orgSlug,
  hideHeader = false,
  hideDock = false,
}: MAdminBoardsClientProps) {
  const { theme, toggleTheme } = useMobileTheme()
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [boards, setBoards] = useState<AdminBoardItem[]>([
    {
      id: 'board-1',
      className: '1-A Şubesi',
      location: 'Derslik 101',
      status: 'ACTIVE_LESSON',
      currentTeacher: 'Özlem ZOR',
      currentSubject: 'Hayat Bilgisi · Güvenli Hayat',
      sessionCode: 'PANO-101A',
      isLocked: false,
      lastSync: 'Şimdi',
    },
    {
      id: 'board-2',
      className: '2-B Şubesi',
      location: 'Derslik 104',
      status: 'ACTIVE_LESSON',
      currentTeacher: 'Murat KAYA',
      currentSubject: 'Matematik · Doğal Sayılar',
      sessionCode: 'PANO-204B',
      isLocked: false,
      lastSync: '1 dk önce',
    },
    {
      id: 'board-3',
      className: '3-A Şubesi',
      location: 'Derslik 201',
      status: 'ONLINE',
      currentTeacher: 'Ayşe DEMİR',
      currentSubject: 'Hazır (Teneffüs Modu)',
      sessionCode: 'PANO-301A',
      isLocked: true,
      lastSync: '3 dk önce',
    },
    {
      id: 'board-4',
      className: '4-B Şubesi',
      location: 'Fen Laboratuvarı',
      status: 'ACTIVE_LESSON',
      currentTeacher: 'Selin AK',
      currentSubject: 'Fen Bilimleri · Maddeyi Tanıyalım',
      sessionCode: 'PANO-LAB4',
      isLocked: false,
      lastSync: 'Şimdi',
    },
    {
      id: 'board-5',
      className: 'BT Sınıfı',
      location: 'Bilişim Laboratuvarı',
      status: 'ONLINE',
      currentTeacher: 'Bilişim Koordinatörü',
      currentSubject: 'Kodlama & Robotik Pano',
      sessionCode: 'PANO-BT01',
      isLocked: false,
      lastSync: '5 dk önce',
    },
    {
      id: 'board-6',
      className: 'Konferans Salonu',
      location: 'Zemin Kat Salon',
      status: 'OFFLINE',
      currentTeacher: '-',
      currentSubject: 'Cihaz Beklemede',
      sessionCode: 'PANO-SALON',
      isLocked: true,
      lastSync: '2 saat önce',
    },
  ])

  const toggleLock = (boardId: string) => {
    setBoards((prev) =>
      prev.map((b) => {
        if (b.id === boardId) {
          const nextLocked = !b.isLocked
          toast.success(
            nextLocked
              ? `${b.className} tahtası uzaktan kilitlendi.`
              : `${b.className} tahtasının kilidi açıldı.`
          )
          return { ...b, isLocked: nextLocked }
        }
        return b
      })
    )
  }

  const endSession = (boardId: string, className: string) => {
    setBoards((prev) =>
      prev.map((b) => {
        if (b.id === boardId) {
          toast.success(`${className} aktif ders oturumu sonlandırıldı.`)
          return {
            ...b,
            status: 'ONLINE',
            currentSubject: 'Oturum Kapatıldı (Hazır)',
            isLocked: true,
          }
        }
        return b
      })
    )
  }

  const filteredBoards = boards.filter((b) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      b.className.toLowerCase().includes(q) ||
      b.location.toLowerCase().includes(q) ||
      b.currentTeacher.toLowerCase().includes(q) ||
      b.sessionCode.toLowerCase().includes(q)
    )
  })

  const getUrl = (path: string) => {
    return orgSlug ? `/orgs/${orgSlug}${path}` : path
  }

  const pageContent = (
    <div className="flex flex-col flex-1 w-full pb-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col flex-1 w-full dash-stagger-items"
      >
        {/* ── 1. SUBBAR & BREADCRUMB ── */}
        <div className="px-4 pt-3 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Link
              href={getUrl('/m-admin')}
              aria-label="İdare Paneline Dön"
              className="w-10 h-10 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121826] text-gray-800 dark:text-gray-200 flex items-center justify-center shrink-0 shadow-xs hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors"
            >
              <ChevronLeft size={20} strokeWidth={2.2} />
            </Link>

            <nav
              aria-label="Konum"
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 truncate"
            >
              <Link
                href={getUrl('/m-admin')}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                İdare
              </Link>
              <span className="text-gray-400">/</span>
              <span className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800 text-gray-900 dark:text-white font-bold shadow-xs truncate">
                <Tv size={13} className="text-[#34D399] shrink-0" />
                <span className="truncate">Akıllı Tahta Yönetimi</span>
              </span>
            </nav>
          </div>

          <span className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-black shrink-0 border border-emerald-200/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{boards.filter((b) => b.status !== 'OFFLINE').length} Çevrim İçi</span>
          </span>
        </div>

        {/* ── 2. SEARCH & SUMMARY ── */}
        <section className="px-4 mt-3">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Derslik, şube veya tahta kodu ara..."
              className={`w-full h-11 pl-9 pr-3.5 rounded-2xl text-xs font-medium outline-hidden transition-all ${
                theme === 'dark'
                  ? 'bg-[#121826] text-white placeholder-gray-500 border border-gray-800 focus:border-[#34D399]/60'
                  : 'bg-white text-gray-900 placeholder-gray-400 border border-gray-200/90 focus:border-[#10B981] shadow-xs'
              }`}
            />
          </div>
        </section>

        {/* ── 3. BOARDS LIST ── */}
        <section className="px-4 mt-3 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold px-1">
            <span>Okul Geneli Akıllı Tahtalar ({filteredBoards.length})</span>
            <span>Canlı Senkronizasyon</span>
          </div>

          {filteredBoards.map((board) => (
            <motion.div
              key={board.id}
              className="bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800/80 rounded-2xl p-4 shadow-xs transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                      board.status === 'ACTIVE_LESSON'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : board.status === 'ONLINE'
                        ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Tv size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-black text-gray-900 dark:text-white truncate">
                        {board.className}
                      </h4>
                      <span className="text-[10px] font-bold text-gray-400">
                        ({board.location})
                      </span>
                    </div>

                    <div className="text-[11px] font-bold text-gray-700 dark:text-gray-300 mt-1 truncate">
                      {board.currentSubject}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                      <span>Kod: {board.sessionCode}</span>
                      <span>·</span>
                      <span>Öğretmen: {board.currentTeacher}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      board.status === 'ACTIVE_LESSON'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        : board.status === 'ONLINE'
                        ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                    }`}
                  >
                    {board.status === 'ACTIVE_LESSON'
                      ? 'Ders İşleniyor'
                      : board.status === 'ONLINE'
                      ? 'Bağlı (Hazır)'
                      : 'Çevrim Dışı'}
                  </span>
                </div>
              </div>

              {/* Action Buttons for Admin Control */}
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => toggleLock(board.id)}
                  className={`flex-1 h-8 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    board.isLocked
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {board.isLocked ? <Unlock size={12} /> : <Lock size={12} />}
                  <span>{board.isLocked ? 'Kilidi Aç' : 'Tahtayı Kilitle'}</span>
                </button>

                {board.status === 'ACTIVE_LESSON' && (
                  <button
                    type="button"
                    onClick={() => endSession(board.id, board.className)}
                    className="h-8 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-rose-200/60 dark:border-rose-800/60"
                  >
                    <Power size={12} />
                    <span>Oturumu Kapat</span>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </section>
      </motion.div>

      {/* ── MORE SHEET ── */}
      <MobileAdminMoreSheet
        isOpen={isMoreSheetOpen}
        onClose={() => setIsMoreSheetOpen(false)}
        theme={theme}
        orgSlug={orgSlug}
      />
    </div>
  )

  if (hideHeader) {
    return pageContent
  }

  return (
    <div
      className={`${theme} min-h-[100dvh] w-full bg-[#0A0D15] sm:bg-[#E2E8F0] sm:dark:bg-[#06090F] flex justify-center selection:bg-[#34D399]/30 font-jakarta overscroll-none transition-colors duration-200`}
    >
      <div className="w-full sm:max-w-[390px] min-h-[100dvh] bg-[#F8FAFC] dark:bg-[#0A0D15] sm:shadow-2xl relative flex flex-col pb-24 sm:border-x border-gray-200/60 dark:border-gray-800/80 overflow-x-hidden overscroll-y-none">
        <MobileHeader theme={theme} onToggleTheme={toggleTheme} />
        <main className="flex-1 w-full flex flex-col">{pageContent}</main>
        {!hideDock && (
          <MobileAdminDock
            activeTab="home"
            onOpenMoreSheet={() => setIsMoreSheetOpen(true)}
            orgSlug={orgSlug}
            theme={theme}
          />
        )}
      </div>
    </div>
  )
}
