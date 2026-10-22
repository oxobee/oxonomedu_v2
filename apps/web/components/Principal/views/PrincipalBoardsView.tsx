'use client'

import React, { useState, useEffect } from 'react'
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
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export interface SchoolBoard {
  id: string
  code: string
  name: string
  location: string
  type: 'lobby' | 'corridor' | 'teachers_lounge' | 'cafeteria'
  status: 'online' | 'offline' | 'standby'
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
    code: 'ANA-PANO',
    name: 'Ana Giriş & Lobi Panosu',
    location: 'Ana Bina · Zemin Kat Giriş Turnikeleri',
    type: 'lobby',
    status: 'online',
    slideDuration: 10,
    dutyTeacherTicker: true,
    weatherWidget: true,
    bellSoundEnabled: true,
    announcementTicker: true,
    mealMenuEnabled: true,
    anthemEnabled: true,
    lastSeen: 'Canlı (Şimdi)',
    resolution: '1920x1080 (FHD)',
  },
  {
    id: 'board-2',
    code: 'OGRETMEN-PANO',
    name: 'Öğretmenler Odası Bilgi Ekranı',
    location: 'A Blok · 2. Kat Öğretmenler Odası',
    type: 'teachers_lounge',
    status: 'online',
    slideDuration: 15,
    dutyTeacherTicker: true,
    weatherWidget: true,
    bellSoundEnabled: true,
    announcementTicker: true,
    mealMenuEnabled: true,
    anthemEnabled: false,
    lastSeen: 'Canlı (Şimdi)',
    resolution: '1920x1080 (FHD)',
  },
  {
    id: 'board-3',
    code: '1-A',
    name: 'İlkokul Koridor Ekranı',
    location: 'B Blok · 1. Kat Sınıflar Koridoru',
    type: 'corridor',
    status: 'online',
    slideDuration: 8,
    dutyTeacherTicker: false,
    weatherWidget: true,
    bellSoundEnabled: true,
    announcementTicker: true,
    mealMenuEnabled: false,
    anthemEnabled: true,
    lastSeen: 'Canlı (Şimdi)',
    resolution: '1920x1080 (FHD)',
  },
  {
    id: 'board-4',
    code: '9-A',
    name: 'Lise Katı Akıllı Panosu',
    location: 'C Blok · 2. Kat Koridor',
    type: 'corridor',
    status: 'online',
    slideDuration: 12,
    dutyTeacherTicker: true,
    weatherWidget: true,
    bellSoundEnabled: false,
    announcementTicker: true,
    mealMenuEnabled: true,
    anthemEnabled: true,
    lastSeen: 'Canlı (Şimdi)',
    resolution: '1920x1080 (FHD)',
  },
]

export default function PrincipalBoardsView() {
  const [boards, setBoards] = useState<SchoolBoard[]>([])
  const [selectedBoard, setSelectedBoard] = useState<SchoolBoard | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isNewBoardOpen, setIsNewBoardOpen] = useState(false)

  // New Board Form State
  const [newBoardName, setNewBoardName] = useState('')
  const [newBoardCode, setNewBoardCode] = useState('')
  const [newBoardLocation, setNewBoardLocation] = useState('')
  const [newBoardType, setNewBoardType] = useState<SchoolBoard['type']>('corridor')

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('oxonom_school_digital_boards')
      if (stored) {
        setBoards(JSON.parse(stored))
      } else {
        setBoards(DEFAULT_BOARDS)
        localStorage.setItem('oxonom_school_digital_boards', JSON.stringify(DEFAULT_BOARDS))
      }
    } catch (_) {
      setBoards(DEFAULT_BOARDS)
    }
  }, [])

  const saveBoards = (nextBoards: SchoolBoard[]) => {
    setBoards(nextBoards)
    try {
      localStorage.setItem('oxonom_school_digital_boards', JSON.stringify(nextBoards))
    } catch (_) {}
  }

  const handleOpenSettings = (board: SchoolBoard) => {
    setSelectedBoard({ ...board })
    setIsSettingsOpen(true)
  }

  const handleSaveSettings = () => {
    if (!selectedBoard) return
    const nextBoards = boards.map((b) => (b.id === selectedBoard.id ? selectedBoard : b))
    saveBoards(nextBoards)
    setIsSettingsOpen(false)
    toast.success(`"${selectedBoard.name}" ayarları başarıyla kaydedildi!`)
  }

  const handleDeleteBoard = (id: string, name: string) => {
    if (confirm(`"${name}" panosunu kaldırmak istediğinize emin misiniz?`)) {
      const nextBoards = boards.filter((b) => b.id !== id)
      saveBoards(nextBoards)
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

    const code = newBoardCode.trim().toUpperCase() || `PANO-${Date.now().toString().slice(-4)}`
    const newBoard: SchoolBoard = {
      id: `board-${Date.now()}`,
      code,
      name: newBoardName.trim(),
      location: newBoardLocation.trim() || 'Genel Okul Alanı',
      type: newBoardType,
      status: 'online',
      slideDuration: 10,
      dutyTeacherTicker: true,
      weatherWidget: true,
      bellSoundEnabled: true,
      announcementTicker: true,
      mealMenuEnabled: true,
      anthemEnabled: true,
      lastSeen: 'Canlı (Şimdi)',
      resolution: '1920x1080 (FHD)',
    }

    const nextBoards = [...boards, newBoard]
    saveBoards(nextBoards)
    setIsNewBoardOpen(false)
    setNewBoardName('')
    setNewBoardCode('')
    setNewBoardLocation('')
    toast.success(`"${newBoard.name}" panosu oluşturuldu ve yayına hazır!`)
  }

  const handleRefreshBoard = (board: SchoolBoard) => {
    toast.loading(`"${board.name}" ekranı uzaktan yenileniyor...`, { id: `refresh-${board.id}` })
    setTimeout(() => {
      toast.success(`"${board.name}" sinyali güncellendi. Ekran aktif!`, { id: `refresh-${board.id}` })
    }, 900)
  }

  const handleOpenLivePreview = (board: SchoolBoard) => {
    const url = board.code === 'ANA-PANO' ? '/pano' : `/pano?board=${encodeURIComponent(board.code)}`
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <Toaster position="top-right" />

      {/* ── HEADER BANNER ── */}
      <div className="rounded-3xl bg-gradient-to-r from-[#F7F0FA] via-[#F0D8FA] to-white dark:from-[#211729] dark:via-[#2F143D] dark:to-[#1A0E24] border border-[#E8DFEB] dark:border-[#49364F] p-6 lg:p-8 shadow-sm dark:shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8D49A6]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#D914C8] flex items-center gap-1.5">
                <Tv size={14} />
                Merkezi Ekran & Pano Ağı
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#16805D]/15 text-[#16805D] dark:text-[#45C7A2] border border-[#16805D]/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16805D] dark:bg-[#45C7A2] animate-pulse" />
                4 Pano Yayında
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#241329] dark:text-white tracking-tight">
              Dijital Okul Panoları & Ekran Yönetimi
            </h1>
            <p className="text-xs sm:text-sm text-[#716779] dark:text-[#C4B3CD] mt-1 max-w-2xl leading-relaxed">
              Okul girişi, lobi, koridorlar ve öğretmenler odasındaki tüm akıllı tahta ve dijital panoları tek noktadan
              yönetin; slayt sürelerini, nöbetçi öğretmen akışını, zil ve hava durumu modüllerini yapılandırın.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsNewBoardOpen(true)}
              className="h-10 px-4 rounded-2xl bg-brand-gradient text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-[#4B075F]/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus size={16} />
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
          <div className="text-[10px] text-[#16805D] dark:text-[#45C7A2] font-semibold mt-0.5">
            Tüm cihazlar senkronize
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1426] border border-[#E8DFEB] dark:border-[#3A2942] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#716779] dark:text-[#A898B0] mb-1">
            <span>Çevrimiçi Cihaz</span>
            <Activity size={15} className="text-[#16805D]" />
          </div>
          <div className="text-2xl font-black text-[#16805D] dark:text-[#45C7A2]">{boards.length}</div>
          <div className="text-[10px] text-[#716779] dark:text-[#A898B0] font-semibold mt-0.5">
            %100 çalışma süresi
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1426] border border-[#E8DFEB] dark:border-[#3A2942] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#716779] dark:text-[#A898B0] mb-1">
            <span>Aktif Nöbet Gösterimi</span>
            <ShieldCheck size={15} className="text-[#D914C8]" />
          </div>
          <div className="text-2xl font-black text-[#241329] dark:text-white">
            {boards.filter((b) => b.dutyTeacherTicker).length}
          </div>
          <div className="text-[10px] text-[#716779] dark:text-[#A898B0] font-semibold mt-0.5">
            Otomatik e-Okul senkronu
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1426] border border-[#E8DFEB] dark:border-[#3A2942] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#716779] dark:text-[#A898B0] mb-1">
            <span>Ortalama Slayt Hızı</span>
            <Clock size={15} className="text-[#4B075F]" />
          </div>
          <div className="text-2xl font-black text-[#241329] dark:text-white">
            {boards.length > 0
              ? `${Math.round(boards.reduce((acc, b) => acc + b.slideDuration, 0) / boards.length)} sn`
              : '10 sn'}
          </div>
          <div className="text-[10px] text-[#716779] dark:text-[#A898B0] font-semibold mt-0.5">
            Duyuru akış döngüsü
          </div>
        </div>
      </div>

      {/* ── BOARDS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {boards.map((board) => (
          <div
            key={board.id}
            className="p-5 rounded-3xl bg-white dark:bg-[#1E1426] border border-[#E8DFEB] dark:border-[#3A2942] shadow-xs hover:border-[#8D49A6]/50 transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Top Row: Code Badge, Live Indicator & Actions */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#F0D8FA] text-xs font-extrabold border border-[#D5C5DC] dark:border-[#8D49A6]/30">
                    {board.code}
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#16805D] dark:text-[#45C7A2]">
                    <span className="w-2 h-2 rounded-full bg-[#16805D] dark:bg-[#45C7A2] animate-pulse" />
                    Çevrimiçi
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleRefreshBoard(board)}
                    className="w-8 h-8 rounded-xl bg-[#F7F0FA] dark:bg-[#2D2035] hover:bg-[#F0D8FA] dark:hover:bg-[#49364F] text-[#716779] dark:text-[#D2C5D8] flex items-center justify-center transition-colors cursor-pointer"
                    title="Ekranı Yeniden Başlat / Yenile"
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

              {/* Badges / Active Features */}
              <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-[#E8DFEB] dark:border-[#3A2942]/70 text-[11px]">
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
            <div className="mt-5 pt-4 border-t border-[#E8DFEB] dark:border-[#3A2942] flex items-center justify-between gap-2">
              <div className="text-[11px] text-[#716779] dark:text-[#A898B0]">
                Çözünürlük: <strong className="text-[#241329] dark:text-white">{board.resolution}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenSettings(board)}
                  className="px-3 py-1.5 rounded-xl border border-[#E8DFEB] dark:border-[#49364F] hover:bg-[#F7F0FA] dark:hover:bg-[#2D2035] text-[#241329] dark:text-[#FCF9FD] text-xs font-bold transition-colors cursor-pointer"
                >
                  Ayarları Düzenle
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenLivePreview(board)}
                  className="px-3.5 py-1.5 rounded-xl bg-brand-gradient text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:opacity-95 transition-all cursor-pointer"
                >
                  <span>Canlı Önizle</span>
                  <ExternalLink size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
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
                    Konum / Açıklama
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

                  {/* Nöbetçi Öğretmen */}
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

                  {/* Hava Durumu ve Saat */}
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

                  {/* Zil Sesi & Anons */}
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

                  {/* Yemek Listesi */}
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
                  onClick={() => handleDeleteBoard(selectedBoard.id, selectedBoard.name)}
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
              className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1E1426] border border-[#E8DFEB] dark:border-[#49364F] p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DFEB] dark:border-[#3A2942]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#F0D8FA] dark:bg-[#350444] text-[#4B075F] dark:text-[#F0D8FA] flex items-center justify-center">
                    <Plus size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-[#241329] dark:text-white">Yeni Dijital Pano Ekle</h2>
                    <p className="text-xs text-[#716779] dark:text-[#A898B0]">Akıllı ekranı kurumsal ağa bağlayın</p>
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
                <div>
                  <label className="block text-xs font-bold text-[#241329] dark:text-[#E0D0E8] mb-1">
                    Pano Tanım Adı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Yemekhane Bilgi Ekranı"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F0FA] dark:bg-[#17101C] border border-[#E8DFEB] dark:border-[#49364F] text-xs font-semibold text-[#241329] dark:text-white focus:outline-none focus:border-[#D914C8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#241329] dark:text-[#E0D0E8] mb-1">
                    Pano Kodu (Slug / Eşleştirme)
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: YEMEKHANE-1 (Boşsa otomatik üretilir)"
                    value={newBoardCode}
                    onChange={(e) => setNewBoardCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F0FA] dark:bg-[#17101C] border border-[#E8DFEB] dark:border-[#49364F] text-xs font-semibold text-[#241329] dark:text-white uppercase focus:outline-none focus:border-[#D914C8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#241329] dark:text-[#E0D0E8] mb-1">
                    Fiziksel Konum / Kat
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Ana Bina -1. Kat Yemekhane Salonu"
                    value={newBoardLocation}
                    onChange={(e) => setNewBoardLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F0FA] dark:bg-[#17101C] border border-[#E8DFEB] dark:border-[#49364F] text-xs font-semibold text-[#241329] dark:text-white focus:outline-none focus:border-[#D914C8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#241329] dark:text-[#E0D0E8] mb-1">
                    Pano Türü
                  </label>
                  <select
                    value={newBoardType}
                    onChange={(e) => setNewBoardType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F0FA] dark:bg-[#17101C] border border-[#E8DFEB] dark:border-[#49364F] text-xs font-semibold text-[#241329] dark:text-white focus:outline-none focus:border-[#D914C8]"
                  >
                    <option value="corridor">Koridor & Kat Ekranı</option>
                    <option value="lobby">Giriş / Lobi Panosu</option>
                    <option value="teachers_lounge">Öğretmenler Odası</option>
                    <option value="cafeteria">Yemekhane & Kafeterya</option>
                  </select>
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
                    className="px-5 py-2 rounded-xl bg-brand-gradient text-white text-xs font-extrabold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                  >
                    Panoyu Oluştur & Yayına Al
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
