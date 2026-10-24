'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Tv,
  Plus,
  Settings,
  ExternalLink,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Clock,
  Volume2,
  VolumeX,
  Sparkles,
  MapPin,
  Calendar,
  CloudSun,
  ShieldCheck,
  Trash2,
  X,
  Check,
  Monitor,
  Activity,
  Layers,
  Copy,
  School,
  Wifi,
  WifiOff,
  Power,
  RotateCcw,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import {
  getCurrentSchoolCode,
  isDemoSchool,
  getTenantBoards,
  saveTenantBoards,
  getTenantClasses,
} from '@/lib/schools/schoolTenantManager'
import { getStoredPrincipalProfile } from '@/lib/principal/principalProfileStorage'
import {
  generateUnique4DigitPanoCode,
  isPanoCodeTakenByOtherSchool,
  formatCompositeBoardCode,
  registerBoardInGlobal,
  unregisterBoardFromGlobal,
  setBoardLiveStatus,
  BOARD_SYNC_CHANNEL_NAME,
} from '@/lib/pano/boardPairingManager'

export interface SchoolBoard {
  id: string
  code: string // Benzersiz Eşleştirme Kodu (Örn: PANO-4A-8392)
  name: string
  location: string
  type: 'lobby' | 'corridor' | 'teachers_lounge' | 'cafeteria' | 'classroom'
  status: 'online' | 'offline' | 'standby'
  classroom?: string // Atanan sınıf/şube (örn: "4-A")
  schoolCode?: string
  schoolName?: string
  slideDuration: number // seconds
  dutyTeacherTicker: boolean
  weatherWidget: boolean
  bellSoundEnabled: boolean
  announcementTicker: boolean
  mealMenuEnabled: boolean
  anthemEnabled: boolean
  lastSeen: string
  resolution: string
}

const DEFAULT_BOARDS: SchoolBoard[] = [
  {
    id: 'board-1',
    code: '0368',
    name: 'Ana Giriş & Lobi Panosu',
    location: 'Ana Bina · Zemin Kat Giriş Turnikeleri',
    type: 'lobby',
    status: 'offline',
    classroom: undefined,
    slideDuration: 10,
    dutyTeacherTicker: true,
    weatherWidget: true,
    bellSoundEnabled: true,
    announcementTicker: true,
    mealMenuEnabled: true,
    anthemEnabled: true,
    lastSeen: 'Bağlantı Bekliyor',
    resolution: '1920x1080 (FHD)',
  },
  {
    id: 'board-2',
    code: '0369',
    name: 'Öğretmenler Odası Bilgi Ekranı',
    location: 'A Blok · 2. Kat Öğretmenler Odası',
    type: 'teachers_lounge',
    status: 'offline',
    classroom: undefined,
    slideDuration: 15,
    dutyTeacherTicker: true,
    weatherWidget: true,
    bellSoundEnabled: true,
    announcementTicker: true,
    mealMenuEnabled: true,
    anthemEnabled: false,
    lastSeen: 'Bağlantı Bekliyor',
    resolution: '1920x1080 (FHD)',
  },
  {
    id: 'board-3',
    code: '0370',
    name: '1-A Sınıfı Akıllı Tahta',
    location: 'B Blok · 1. Kat 101 Nolu Derslik',
    type: 'classroom',
    status: 'offline',
    classroom: '1-A',
    slideDuration: 8,
    dutyTeacherTicker: false,
    weatherWidget: true,
    bellSoundEnabled: true,
    announcementTicker: true,
    mealMenuEnabled: false,
    anthemEnabled: true,
    lastSeen: 'Bağlantı Bekliyor',
    resolution: '1920x1080 (FHD)',
  },
  {
    id: 'board-4',
    code: '0371',
    name: '4-A Sınıfı Akıllı Tahta',
    location: 'B Blok · 2. Kat 204 Nolu Derslik',
    type: 'classroom',
    status: 'offline',
    classroom: '4-A',
    slideDuration: 12,
    dutyTeacherTicker: true,
    weatherWidget: true,
    bellSoundEnabled: true,
    announcementTicker: true,
    mealMenuEnabled: true,
    anthemEnabled: true,
    lastSeen: 'Bağlantı Bekliyor',
    resolution: '1920x1080 (FHD)',
  },
]

export default function PrincipalBoardsView() {
  const [boards, setBoards] = useState<SchoolBoard[]>([])
  const [selectedBoard, setSelectedBoard] = useState<SchoolBoard | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isNewBoardOpen, setIsNewBoardOpen] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // School tenant details
  const [schoolCode, setSchoolCode] = useState<string>('741295')
  const [schoolName, setSchoolName] = useState<string>('Okul Panoları')
  const [availableClasses, setAvailableClasses] = useState<{ id: string | number; name: string }[]>([])

  // New Board Form State
  const [newBoardName, setNewBoardName] = useState('')
  const [newBoardCode, setNewBoardCode] = useState('')
  const [newBoardLocation, setNewBoardLocation] = useState('')
  const [newBoardType, setNewBoardType] = useState<SchoolBoard['type']>('classroom')
  const [newBoardClassroom, setNewBoardClassroom] = useState<string>('')

  // Load School Identity and Tenant Data
  const loadSchoolBoards = useCallback(() => {
    try {
      const code = getCurrentSchoolCode()
      setSchoolCode(code)

      const profile = getStoredPrincipalProfile()
      const sName = profile?.schoolName || 'Okul'
      setSchoolName(sName)

      // Load tenant classes
      const tenantClasses = getTenantClasses(code)
      if (Array.isArray(tenantClasses) && tenantClasses.length > 0) {
        setAvailableClasses(
          tenantClasses.map((c: any) => ({
            id: c.id || c.code || c.name,
            name: c.name || c.code || String(c.id),
          }))
        )
      } else {
        // Fallback default classes if demo
        if (isDemoSchool(code)) {
          setAvailableClasses([
            { id: '1-A', name: '1-A Sınıfı' },
            { id: '2-A', name: '2-A Sınıfı' },
            { id: '3-A', name: '3-A Sınıfı' },
            { id: '4-A', name: '4-A Sınıfı' },
          ])
        } else {
          setAvailableClasses([])
        }
      }

      // Load isolated boards
      const tenant = getTenantBoards(code)
      if (tenant !== null) {
        setBoards(tenant)
        return
      }

      if (!isDemoSchool(code)) {
        // Newly created school starts with ZERO boards (100% empty multi-tenant)
        setBoards([])
        return
      }

      // Demo school fallback
      const stored = localStorage.getItem('oxonom_school_digital_boards')
      if (stored) {
        setBoards(JSON.parse(stored))
      } else {
        setBoards(DEFAULT_BOARDS)
        localStorage.setItem('oxonom_school_digital_boards', JSON.stringify(DEFAULT_BOARDS))
        // Also register in global registry
        for (const b of DEFAULT_BOARDS) {
          registerBoardInGlobal(b, code, sName)
        }
      }
    } catch (_) {
      setBoards([])
    }
  }, [])

  useEffect(() => {
    loadSchoolBoards()
  }, [loadSchoolBoards])

  // Live Multi-Window & Real-Time Sync Listeners
  useEffect(() => {
    const handleSync = () => {
      loadSchoolBoards()
    }

    window.addEventListener('oxonom_boards_updated', handleSync)
    window.addEventListener('storage', handleSync)

    let bc: BroadcastChannel | null = null
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel(BOARD_SYNC_CHANNEL_NAME)
        bc.onmessage = () => {
          loadSchoolBoards()
        }
      }
    } catch (_) {}

    return () => {
      window.removeEventListener('oxonom_boards_updated', handleSync)
      window.removeEventListener('storage', handleSync)
      if (bc) bc.close()
    }
  }, [loadSchoolBoards])

  const saveBoards = (nextBoards: SchoolBoard[]) => {
    setBoards(nextBoards)
    saveTenantBoards(nextBoards, schoolCode)
    try {
      localStorage.setItem('oxonom_school_digital_boards', JSON.stringify(nextBoards))
    } catch (_) {}
  }

  // Auto-generate 4-digit code when opening new board modal
  const handleOpenNewBoardModal = () => {
    const initialClass = availableClasses[0]?.name.replace(/ Sınıfı.*/i, '').trim() || ''
    setNewBoardClassroom(initialClass)
    setNewBoardType('classroom')
    setNewBoardName(initialClass ? `${initialClass} Sınıfı Akıllı Tahtası` : 'Yeni Akıllı Tahta')
    setNewBoardLocation(initialClass ? `${initialClass} Dersliği` : 'Genel Okul Alanı')
    setNewBoardCode(generateUnique4DigitPanoCode(schoolCode))
    setIsNewBoardOpen(true)
  }

  // Re-generate unique 4-digit pairing code
  const handleRegenerateCode = () => {
    const newCode = generateUnique4DigitPanoCode(schoolCode)
    setNewBoardCode(newCode)
    toast.success(`Yeni 4 haneli pano kodu üretildi: ${newCode}`)
  }

  // Classroom changed in creation modal
  const handleClassroomSelectionChange = (clsName: string) => {
    setNewBoardClassroom(clsName)
    if (clsName) {
      setNewBoardName(`${clsName} Sınıfı Akıllı Tahtası`)
      setNewBoardLocation(`${clsName} Dersliği`)
    } else {
      setNewBoardName('Kat Koridor Panosu')
      setNewBoardLocation('Genel Okul Alanı')
    }
  }

  const handleOpenSettings = (board: SchoolBoard) => {
    setSelectedBoard({ ...board })
    setIsSettingsOpen(true)
  }

  const handleSaveSettings = () => {
    if (!selectedBoard) return
    const nextBoards = boards.map((b) => (b.id === selectedBoard.id ? selectedBoard : b))
    saveBoards(nextBoards)
    // Update in global registry
    registerBoardInGlobal(selectedBoard, schoolCode, schoolName)
    setIsSettingsOpen(false)
    toast.success(`"${selectedBoard.name}" ayarları başarıyla kaydedildi!`)
  }

  const handleDeleteBoard = (id: string, name: string, code: string) => {
    if (confirm(`"${name}" (${code}) panosunu kaldırmak istediğinize emin misiniz?`)) {
      const nextBoards = boards.filter((b) => b.id !== id)
      saveBoards(nextBoards)
      unregisterBoardFromGlobal(id, code)
      if (selectedBoard?.id === id) {
        setIsSettingsOpen(false)
      }
      toast.success('Pano sistemden kaldırıldı.')
    }
  }

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBoardName.trim()) {
      toast.error('Lütfen bir pano adı girin.')
      return
    }

    const code = (
      newBoardCode.trim().toUpperCase() ||
      generateUnique4DigitPanoCode(schoolCode)
    )

    // Multi-tenant check: Is this 4-digit code already used by another school?
    const conflict = isPanoCodeTakenByOtherSchool(code, schoolCode)
    if (conflict.isTaken) {
      toast.error(
        `Bu pano numarası (${code}) başka bir okul (${conflict.usedBySchool}) tarafından kullanılıyor! Lütfen farklı bir 4 haneli numara seçiniz veya "Farklı Kod Üret" butonuna basınız.`,
        { duration: 6000 }
      )
      return
    }

    const newBoard: SchoolBoard = {
      id: `board-${Date.now()}`,
      code,
      name: newBoardName.trim(),
      location: newBoardLocation.trim() || 'Genel Okul Alanı',
      type: newBoardType,
      classroom: newBoardClassroom || undefined,
      schoolCode,
      schoolName,
      status: 'offline', // Başlangıçta pasif; akıllı tahtada bu kod girilince aktifleşir
      slideDuration: 10,
      dutyTeacherTicker: true,
      weatherWidget: true,
      bellSoundEnabled: true,
      announcementTicker: true,
      mealMenuEnabled: true,
      anthemEnabled: true,
      lastSeen: 'Bağlantı Bekliyor',
      resolution: '1920x1080 (FHD)',
    }

    // Register globally for cross-tenant /pano lookups
    registerBoardInGlobal(newBoard, schoolCode, schoolName)

    const nextBoards = [...boards, newBoard]
    saveBoards(nextBoards)
    setIsNewBoardOpen(false)
    setNewBoardName('')
    setNewBoardCode('')
    setNewBoardLocation('')
    setNewBoardClassroom('')
    toast.success(
      `"${newBoard.name}" panosu oluşturuldu! Eşleştirme Kodu: ${newBoard.code}`,
      { duration: 5000 }
    )
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success(`Pano Kodu Kopyalandı: ${code}`)
    setTimeout(() => setCopiedCode(null), 2500)
  }

  const handleToggleBoardStatus = (board: SchoolBoard) => {
    const nextStatus = board.status === 'online' ? 'offline' : 'online'
    const updated = setBoardLiveStatus(board.code, nextStatus)
    if (updated) {
      loadSchoolBoards()
      toast.success(
        nextStatus === 'online'
          ? `"${board.name}" panosu CANLI (Yeşil) olarak işaretlendi.`
          : `"${board.name}" panosu PASİF (Kırmızı) durumuna alındı.`
      )
    }
  }

  const handleRefreshBoard = (board: SchoolBoard) => {
    toast.loading(`"${board.name}" ekran sinyali kontrol ediliyor...`, {
      id: `refresh-${board.id}`,
    })
    setTimeout(() => {
      loadSchoolBoards()
      toast.success(
        board.status === 'online'
          ? `"${board.name}" panosu aktif ve canlı sinyal veriyor!`
          : `"${board.name}" bağlantı bekliyor. /pano ekranından ${board.code} kodunu giriniz.`,
        { id: `refresh-${board.id}` }
      )
    }, 600)
  }

  const handleOpenLivePreview = (board: SchoolBoard) => {
    const url = `/pano?code=${encodeURIComponent(board.code)}`
    window.open(url, '_blank')
  }

  const onlineCount = boards.filter((b) => b.status === 'online').length
  const offlineCount = boards.filter((b) => b.status === 'offline').length

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <Toaster position="top-right" />

      {/* ── HEADER BANNER ── */}
      <div className="rounded-3xl bg-gradient-to-r from-[#F7F0FA] via-[#F0D8FA] to-white dark:from-[#211729] dark:via-[#2F143D] dark:to-[#1A0E24] border border-[#E8DFEB] dark:border-[#49364F] p-6 lg:p-8 shadow-sm dark:shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8D49A6]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-[#D914C8] flex items-center gap-1.5">
                <Tv size={14} />
                Merkezi Akıllı Tahta & Pano Ağı
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8D49A6]/15 text-[#4B075F] dark:text-[#E9D5FF] border border-[#8D49A6]/30">
                Kurum Kodu: {schoolCode}
              </span>
              {onlineCount > 0 ? (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {onlineCount} Pano Canlı / Aktif
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Bağlantı Bekleniyor
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#241329] dark:text-white tracking-tight">
              {schoolName} · Dijital Panolar & Akıllı Tahtalar
            </h1>
            <p className="text-xs sm:text-sm text-[#716779] dark:text-[#C4B3CD] mt-1 max-w-2xl leading-relaxed">
              Her sınıf ve kat için benzersiz eşleştirme kodu oluşturun. Akıllı tahtalarda{' '}
              <strong className="text-[#8D49A6] dark:text-[#D914C8]">/pano</strong> ekranına girilen kod ile ekranlar
              anında canlıya geçer ve gerçek zamanlı olarak izlenebilir.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleOpenNewBoardModal}
              className="h-11 px-5 rounded-2xl bg-brand-gradient text-white text-xs font-black flex items-center gap-2 shadow-md shadow-[#4B075F]/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Yeni Pano Tanımla</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── METRICS SUMMARY BAR ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1426] border border-[#E8DFEB] dark:border-[#3A2942] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#716779] dark:text-[#A898B0] mb-1">
            <span>Toplam Pano</span>
            <Layers size={15} className="text-[#8D49A6]" />
          </div>
          <div className="text-2xl font-black text-[#241329] dark:text-white">{boards.length}</div>
          <div className="text-[10px] text-[#716779] dark:text-[#A898B0] font-semibold mt-0.5">
            Okula tanımlı cihazlar
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1426] border border-[#E8DFEB] dark:border-[#3A2942] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#716779] dark:text-[#A898B0] mb-1">
            <span>Çevrimiçi (Aktif)</span>
            <Activity size={15} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <span>{onlineCount}</span>
            {onlineCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
            Canlı veri aktarımı açık
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1426] border border-[#E8DFEB] dark:border-[#3A2942] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#716779] dark:text-[#A898B0] mb-1">
            <span>Çevrimdışı (Pasif)</span>
            <WifiOff size={15} className="text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{offlineCount}</div>
          <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold mt-0.5">
            Giriş / Kod eşleşmesi bekliyor
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1426] border border-[#E8DFEB] dark:border-[#3A2942] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#716779] dark:text-[#A898B0] mb-1">
            <span>Nöbet & Duyuru Bandı</span>
            <ShieldCheck size={15} className="text-[#D914C8]" />
          </div>
          <div className="text-2xl font-black text-[#241329] dark:text-white">
            {boards.filter((b) => b.dutyTeacherTicker).length}
          </div>
          <div className="text-[10px] text-[#716779] dark:text-[#A898B0] font-semibold mt-0.5">
            Dinamik okul akışı
          </div>
        </div>
      </div>

      {/* ── BOARDS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {boards.map((board) => {
          const isLive = board.status === 'online'
          return (
            <div
              key={board.id}
              className={`p-5 rounded-3xl bg-white dark:bg-[#1E1426] border transition-all flex flex-col justify-between group relative overflow-hidden ${
                isLive
                  ? 'border-emerald-500/40 hover:border-emerald-500 shadow-sm dark:shadow-emerald-950/20'
                  : 'border-rose-300 dark:border-rose-900/40 hover:border-rose-400 shadow-xs'
              }`}
            >
              {/* Top Accent Stripe */}
              <div
                className={`absolute top-0 inset-x-0 h-1.5 ${
                  isLive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-rose-500 to-amber-500'
                }`}
              />

              <div>
                {/* Top Row: Code Badge, Live Status Pill & Quick Controls */}
                <div className="flex items-center justify-between gap-2 mb-3.5 pt-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Eşleştirme Kodu Monospace Badge with Click-to-Copy */}
                    <button
                      type="button"
                      onClick={() => handleCopyCode(board.code)}
                      className="group/code px-3 py-1.5 rounded-xl bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#F0D8FA] font-mono text-xs font-black border border-[#D5C5DC] dark:border-[#8D49A6]/40 flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xs"
                      title="Pano Kodunu Kopyala"
                    >
                      <span>Pano No: {board.code}</span>
                      <span className="text-[10px] font-normal opacity-75">({board.code}-01)</span>
                      {copiedCode === board.code ? (
                        <Check size={12} className="text-emerald-600" />
                      ) : (
                        <Copy size={12} className="opacity-60 group-hover/code:opacity-100" />
                      )}
                    </button>

                    {/* Status Pill: Yeşil Canlı veya Kırmızı Pasif */}
                    {isLive ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-[11px] font-black text-emerald-700 dark:text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Canlı (Şimdi)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-[11px] font-black text-rose-700 dark:text-rose-400">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        Pasif (Bağlantı Bekliyor)
                      </span>
                    )}

                    {/* Classroom Badge */}
                    {board.classroom && (
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-black flex items-center gap-1">
                        <School size={11} />
                        {board.classroom} Sınıfı
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleBoardStatus(board)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                        isLive
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 hover:text-rose-700'
                          : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:text-emerald-700'
                      }`}
                      title={isLive ? 'Panoyu Pasife Al (Çıkış Yap)' : 'Panoyu Canlıya Al'}
                    >
                      <Power size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRefreshBoard(board)}
                      className="w-8 h-8 rounded-xl bg-[#F7F0FA] dark:bg-[#2D2035] hover:bg-[#F0D8FA] dark:hover:bg-[#49364F] text-[#716779] dark:text-[#D2C5D8] flex items-center justify-center transition-colors cursor-pointer"
                      title="Sinyal Kontrol Et"
                    >
                      <RefreshCw size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenSettings(board)}
                      className="w-8 h-8 rounded-xl bg-[#F7F0FA] dark:bg-[#2D2035] hover:bg-[#F0D8FA] dark:hover:bg-[#49364F] text-[#716779] dark:text-[#D2C5D8] flex items-center justify-center transition-colors cursor-pointer"
                      title="Pano Ayarları"
                    >
                      <Settings size={14} />
                    </button>
                  </div>
                </div>

                {/* Title & Location */}
                <h3 className="text-base sm:text-lg font-black text-[#241329] dark:text-white leading-tight">
                  {board.name}
                </h3>
                <p className="text-xs text-[#716779] dark:text-[#A898B0] flex items-center gap-1.5 mt-1">
                  <MapPin size={13} className="text-[#8D49A6] shrink-0" />
                  <span>{board.location}</span>
                </p>

                {/* Pairing Guide Callout for Offline Boards */}
                {!isLive && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-between gap-2">
                    <span>
                      Akıllı tahtada <strong>/pano</strong> ekranına{' '}
                      <strong className="font-mono text-xs font-black">{board.code}</strong> (veya tahta no ile <strong className="font-mono text-xs">{board.code}-01</strong>) giriniz.
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(board.code)}
                      className="px-2 py-1 rounded bg-amber-200 dark:bg-amber-900/60 font-bold shrink-0 hover:brightness-105 cursor-pointer"
                    >
                      Kodu Kopyala
                    </button>
                  </div>
                )}

                {/* Badges / Active Features */}
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#E8DFEB] dark:border-[#3A2942]/70 text-[11px]">
                  <span className="px-2 py-0.5 rounded-lg bg-[#F7F0FA] dark:bg-[#2D2035] text-[#514458] dark:text-[#D2C5D8] font-bold flex items-center gap-1">
                    <Clock size={11} className="text-[#8D49A6]" />
                    {board.slideDuration} sn döngü
                  </span>

                  {board.dutyTeacherTicker && (
                    <span className="px-2 py-0.5 rounded-lg bg-[#F7F0FA] dark:bg-[#2D2035] text-[#514458] dark:text-[#D2C5D8] font-bold flex items-center gap-1">
                      <ShieldCheck size={11} className="text-[#16805D]" />
                      Nöbetçi Öğretmen
                    </span>
                  )}

                  {board.weatherWidget && (
                    <span className="px-2 py-0.5 rounded-lg bg-[#F7F0FA] dark:bg-[#2D2035] text-[#514458] dark:text-[#D2C5D8] font-bold flex items-center gap-1">
                      <CloudSun size={11} className="text-[#D914C8]" />
                      Hava Durumu
                    </span>
                  )}

                  {board.bellSoundEnabled ? (
                    <span className="px-2 py-0.5 rounded-lg bg-[#F7F0FA] dark:bg-[#2D2035] text-[#16805D] dark:text-[#45C7A2] font-bold flex items-center gap-1">
                      <Volume2 size={11} />
                      Zil Sesi Aktif
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-lg bg-[#F7F0FA] dark:bg-[#2D2035] text-[#716779] dark:text-[#A898B0] font-bold flex items-center gap-1">
                      <VolumeX size={11} />
                      Sessiz Mod
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-4 border-t border-[#E8DFEB] dark:border-[#3A2942] flex items-center justify-between gap-2 flex-wrap">
                <div className="text-[11px] text-[#716779] dark:text-[#A898B0]">
                  Durum:{' '}
                  <strong className={isLive ? 'text-emerald-600' : 'text-rose-600'}>
                    {board.lastSeen}
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenSettings(board)}
                    className="px-3 py-1.5 rounded-xl border border-[#E8DFEB] dark:border-[#49364F] hover:bg-[#F7F0FA] dark:hover:bg-[#2D2035] text-[#241329] dark:text-[#FCF9FD] text-xs font-bold transition-colors cursor-pointer"
                  >
                    Ayarlar
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenLivePreview(board)}
                    className="px-3.5 py-1.5 rounded-xl bg-brand-gradient text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:opacity-95 transition-all cursor-pointer"
                  >
                    <span>Tahtayı Aç</span>
                    <ExternalLink size={13} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {boards.length === 0 && (
          <div className="col-span-full py-16 text-center rounded-3xl bg-white dark:bg-[#1A1222] border-2 border-dashed border-[#D914C8]/30 p-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#D914C8]/15 to-[#8D49A6]/15 text-[#D914C8] flex items-center justify-center mx-auto shadow-sm">
              <Tv size={32} />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base font-black text-[#241329] dark:text-white">
                Bu Okula Henüz Akıllı Tahta / Pano Tanımlanmadı
              </h3>
              <p className="text-xs text-[#716779] dark:text-[#A898B0] leading-relaxed">
                Her sınıfa veya koridora özel benzersiz kodlu dijital panolar oluşturabilirsiniz. Akıllı tahtalarda bu kod
                girildiğinde panolarınız otomatik olarak aktifleşecektir.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleOpenNewBoardModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D914C8] to-[#8D49A6] text-white text-xs font-black shadow-lg shadow-[#D914C8]/25 hover:brightness-110 transition-all cursor-pointer"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>+ İlk Akıllı Tahta / Panoyu Ekle</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── SETTINGS MODAL ── */}
      <AnimatePresence>
        {isSettingsOpen && selectedBoard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#1E1426] border border-[#E8DFEB] dark:border-[#49364F] p-6 shadow-2xl relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E8DFEB] dark:border-[#3A2942]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#F0D8FA] flex items-center justify-center">
                    <Sliders size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-[#241329] dark:text-white">
                      Pano Ayarları: {selectedBoard.code}
                    </h2>
                    <p className="text-xs text-[#716779] dark:text-[#A898B0]">{selectedBoard.name}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-8 h-8 rounded-xl hover:bg-[#F7F0FA] dark:hover:bg-[#2D2035] text-[#716779] dark:text-[#D2C5D8] flex items-center justify-center cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Content */}
              <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                <div>
                  <label className="block text-xs font-bold text-[#241329] dark:text-[#E0D0E8] mb-1">
                    Pano Adı
                  </label>
                  <input
                    type="text"
                    value={selectedBoard.name}
                    onChange={(e) => setSelectedBoard({ ...selectedBoard, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F7F0FA] dark:bg-[#17101C] border border-[#E8DFEB] dark:border-[#49364F] text-xs font-semibold text-[#241329] dark:text-white focus:outline-none focus:border-[#D914C8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#241329] dark:text-[#E0D0E8] mb-1">
                    Konum / Kat Bilgisi
                  </label>
                  <input
                    type="text"
                    value={selectedBoard.location}
                    onChange={(e) => setSelectedBoard({ ...selectedBoard, location: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F7F0FA] dark:bg-[#17101C] border border-[#E8DFEB] dark:border-[#49364F] text-xs font-semibold text-[#241329] dark:text-white focus:outline-none focus:border-[#D914C8]"
                  />
                </div>

                {/* Slayt Geçiş Hızı */}
                <div>
                  <label className="block text-xs font-bold text-[#241329] dark:text-[#E0D0E8] mb-1.5">
                    Slayt Geçiş Süresi: <span className="text-[#D914C8]">{selectedBoard.slideDuration} saniye</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 8, 10, 15].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setSelectedBoard({ ...selectedBoard, slideDuration: sec })}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selectedBoard.slideDuration === sec
                            ? 'bg-brand-gradient text-white border-transparent shadow-xs'
                            : 'bg-[#F7F0FA] dark:bg-[#17101C] border-[#E8DFEB] dark:border-[#3A2942] text-[#716779] dark:text-[#A898B0]'
                        }`}
                      >
                        {sec} sn
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggle Switches */}
                <div className="space-y-2.5 pt-2 border-t border-[#E8DFEB] dark:border-[#3A2942]">
                  <div className="text-xs font-bold text-[#4B075F] dark:text-[#C58ADB]">Modül Gösterim Seçenekleri</div>

                  <label className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F0FA] dark:bg-[#17101C] border border-[#E8DFEB] dark:border-[#3A2942] cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck size={16} className="text-[#16805D]" />
                      <div>
                        <div className="text-xs font-bold text-[#241329] dark:text-white">Nöbetçi Öğretmen Bandı</div>
                        <div className="text-[10px] text-[#716779] dark:text-[#A898B0]">Günün nöbetçi öğretmenleri altta kayan yazıda gösterilir</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedBoard.dutyTeacherTicker}
                      onChange={(e) => setSelectedBoard({ ...selectedBoard, dutyTeacherTicker: e.target.checked })}
                      className="w-4 h-4 accent-[#D914C8] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F0FA] dark:bg-[#17101C] border border-[#E8DFEB] dark:border-[#3A2942] cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <CloudSun size={16} className="text-[#D914C8]" />
                      <div>
                        <div className="text-xs font-bold text-[#241329] dark:text-white">Hava Durumu & Saat Köşesi</div>
                        <div className="text-[10px] text-[#716779] dark:text-[#A898B0]">Anlık ilçe hava durumu ve dijital saat widgeti</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedBoard.weatherWidget}
                      onChange={(e) => setSelectedBoard({ ...selectedBoard, weatherWidget: e.target.checked })}
                      className="w-4 h-4 accent-[#D914C8] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F0FA] dark:bg-[#17101C] border border-[#E8DFEB] dark:border-[#3A2942] cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <Volume2 size={16} className="text-[#8D49A6]" />
                      <div>
                        <div className="text-xs font-bold text-[#241329] dark:text-white">Ders Giriş / Çıkış Zil Sesi</div>
                        <div className="text-[10px] text-[#716779] dark:text-[#A898B0]">Ders bitişlerinde panodan melodi çalsın</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedBoard.bellSoundEnabled}
                      onChange={(e) => setSelectedBoard({ ...selectedBoard, bellSoundEnabled: e.target.checked })}
                      className="w-4 h-4 accent-[#D914C8] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F0FA] dark:bg-[#17101C] border border-[#E8DFEB] dark:border-[#3A2942] cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <Sparkles size={16} className="text-[#4B075F]" />
                      <div>
                        <div className="text-xs font-bold text-[#241329] dark:text-white">Günün Yemek Menüsü</div>
                        <div className="text-[10px] text-[#716779] dark:text-[#A898B0]">Öğle yemeği menüsü slaytlarda yer alsın</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedBoard.mealMenuEnabled}
                      onChange={(e) => setSelectedBoard({ ...selectedBoard, mealMenuEnabled: e.target.checked })}
                      className="w-4 h-4 accent-[#D914C8] cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 mt-2 border-t border-[#E8DFEB] dark:border-[#3A2942] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteBoard(selectedBoard.id, selectedBoard.name, selectedBoard.code)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Panoyu Sil</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#E8DFEB] dark:border-[#49364F] text-xs font-bold text-[#716779] dark:text-[#D2C5D8] hover:bg-[#F7F0FA] dark:hover:bg-[#2D2035] transition-colors cursor-pointer"
                  >
                    Vazgeç
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="px-5 py-2 rounded-xl bg-brand-gradient text-white text-xs font-extrabold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                  >
                    Değişiklikleri Kaydet
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── NEW BOARD MODAL ── */}
      <AnimatePresence>
        {isNewBoardOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#1E1426] border border-[#E8DFEB] dark:border-[#49364F] p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DFEB] dark:border-[#3A2942]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#F0D8FA] flex items-center justify-center">
                    <Plus size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-[#241329] dark:text-white">Yeni Dijital Pano / Akıllı Tahta Ekle</h2>
                    <p className="text-xs text-[#716779] dark:text-[#A898B0]">Otomatik benzersiz kod üretilir ve panoya atanır</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNewBoardOpen(false)}
                  className="w-8 h-8 rounded-xl hover:bg-[#F7F0FA] dark:hover:bg-[#2D2035] text-[#716779] dark:text-[#D2C5D8] flex items-center justify-center cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateBoard} className="py-4 space-y-3.5">
                {/* Pano Türü */}
                <div>
                  <label className="block text-xs font-bold text-[#241329] dark:text-[#E0D0E8] mb-1">
                    Pano Kullanım Alanı / Türü *
                  </label>
                  <select
                    value={newBoardType}
                    onChange={(e) => {
                      const t = e.target.value as SchoolBoard['type']
                      setNewBoardType(t)
                      if (t !== 'classroom') {
                        setNewBoardClassroom('')
                        setNewBoardName(
                          t === 'lobby'
                            ? 'Ana Giriş & Lobi Panosu'
                            : t === 'teachers_lounge'
                            ? 'Öğretmenler Odası Ekranı'
                            : t === 'cafeteria'
                            ? 'Yemekhane Bilgi Ekranı'
                            : 'Kat Koridoru Panosu'
                        )
                        setNewBoardCode(generateUnique4DigitPanoCode(schoolCode))
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F0FA] dark:bg-[#17101C] border border-[#E8DFEB] dark:border-[#49364F] text-xs font-semibold text-[#241329] dark:text-white focus:outline-none focus:border-[#D914C8]"
                  >
                    <option value="classroom">Sınıf Akıllı Tahtası (Derslik)</option>
                    <option value="corridor">Kat & Koridor Panosu</option>
                    <option value="lobby">Giriş / Lobi Ekranı</option>
                    <option value="teachers_lounge">Öğretmenler Odası Panosu</option>
                    <option value="cafeteria">Yemekhane & Kafeterya Ekranı</option>
                  </select>
                </div>

                {/* Sınıf / Şube Seçimi (Eğer Sınıf Tahtasıysa) */}
                {newBoardType === 'classroom' && (
                  <div>
                    <label className="block text-xs font-bold text-[#241329] dark:text-[#E0D0E8] mb-1 flex items-center gap-1.5">
                      <School size={13} className="text-[#D914C8]" />
                      <span>Hangi Sınıfa Ait? (Şube Eşleştirmesi) *</span>
                    </label>
                    <select
                      value={newBoardClassroom}
                      onChange={(e) => handleClassroomSelectionChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F0FA] dark:bg-[#17101C] border border-[#E8DFEB] dark:border-[#49364F] text-xs font-bold text-[#241329] dark:text-white focus:outline-none focus:border-[#D914C8]"
                    >
                      <option value="">-- Sınıf Seçiniz --</option>
                      {availableClasses.map((cls) => (
                        <option key={cls.id} value={cls.name.replace(/ Sınıfı.*/i, '').trim()}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                    {availableClasses.length === 0 && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                        Okulunuzda henüz şube tanımlanmamış. Sınıflar menüsünden şube ekleyebilirsiniz.
                      </p>
                    )}
                  </div>
                )}

                {/* Pano Adı */}
                <div>
                  <label className="block text-xs font-bold text-[#241329] dark:text-[#E0D0E8] mb-1">
                    Pano Tanım Adı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: 4-A Sınıfı Akıllı Tahtası"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F0FA] dark:bg-[#17101C] border border-[#E8DFEB] dark:border-[#49364F] text-xs font-semibold text-[#241329] dark:text-white focus:outline-none focus:border-[#D914C8]"
                  />
                </div>

                {/* Otomatik 4 Haneli Benzersiz Kod */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#241329] dark:text-[#E0D0E8] flex items-center gap-1.5">
                      <span>4 Haneli Benzersiz Pano Kodu *</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">(Karışık 4 Hane)</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleRegenerateCode}
                      className="text-[11px] text-[#8D49A6] dark:text-[#D914C8] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={11} />
                      <span>Farklı 4 Haneli Kod Üret</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={4}
                      placeholder="Örn: 0368"
                      value={newBoardCode}
                      onChange={(e) => setNewBoardCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F0D8FA]/30 dark:bg-[#350444]/40 border border-[#D5C5DC] dark:border-[#8D49A6]/40 font-mono text-sm font-black text-[#4B075F] dark:text-[#F0D8FA] tracking-widest text-center focus:outline-none focus:border-[#D914C8]"
                    />
                  </div>
                  <p className="text-[10px] text-[#716779] dark:text-[#A898B0] mt-1">
                    Akıllı tahtalar bu pano numarasına ({newBoardCode || '0368'}-01, {newBoardCode || '0368'}-02) tanımlanır. Başka bir okulda olan numaralar kullanılamaz.
                  </p>
                </div>

                {/* Fiziksel Konum / Kat */}
                <div>
                  <label className="block text-xs font-bold text-[#241329] dark:text-[#E0D0E8] mb-1">
                    Fiziksel Konum / Kat Bilgisi
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: B Blok · 2. Kat No: 204"
                    value={newBoardLocation}
                    onChange={(e) => setNewBoardLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F0FA] dark:bg-[#17101C] border border-[#E8DFEB] dark:border-[#49364F] text-xs font-semibold text-[#241329] dark:text-white focus:outline-none focus:border-[#D914C8]"
                  />
                </div>

                <div className="pt-3 border-t border-[#E8DFEB] dark:border-[#3A2942] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewBoardOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#E8DFEB] dark:border-[#49364F] text-xs font-bold text-[#716779] dark:text-[#D2C5D8] hover:bg-[#F7F0FA] dark:hover:bg-[#2D2035] transition-colors cursor-pointer"
                  >
                    İptal
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-brand-gradient text-white text-xs font-extrabold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Panoyu Oluştur & Kodu Tanımla</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
