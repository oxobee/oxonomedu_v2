// apps/web/components/Pano/PanoPairingGate.tsx
'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Tv,
  KeyRound,
  ArrowRight,
  School,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Layers,
  HelpCircle,
} from 'lucide-react'
import {
  pairBoardWithCode,
  BoardPairingInfo,
  getGlobalBoardRegistry,
} from '@/lib/pano/boardPairingManager'

interface PanoPairingGateProps {
  onSuccess: (board: BoardPairingInfo) => void
  initialCode?: string
}

export default function PanoPairingGate({ onSuccess, initialCode = '' }: PanoPairingGateProps) {
  const [code, setCode] = useState(initialCode.toUpperCase())
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showHelperList, setShowHelperList] = useState(false)

  // Quick lookup of available demo/system boards
  const registeredBoards = Object.values(getGlobalBoardRegistry())

  const handlePairSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const cleanCode = code.trim().toUpperCase()
    if (!cleanCode) {
      setErrorMessage('Lütfen okul müdürünüzden aldığınız pano kodunu giriniz.')
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    // Simulate snappy handshake
    setTimeout(() => {
      const result = pairBoardWithCode(cleanCode)
      if (result.success && result.board) {
        onSuccess(result.board)
      } else {
        setErrorMessage(
          result.error ||
            'Girdiğiniz pano kodu sistemde bulunamadı. Lütfen okul müdürünüzün oluşturduğu kodu kontrol ediniz.'
        )
      }
      setIsLoading(false)
    }, 450)
  }

  const handleQuickSelect = (quickCode: string) => {
    setCode(quickCode)
    setErrorMessage(null)
    setIsLoading(true)
    setTimeout(() => {
      const result = pairBoardWithCode(quickCode)
      if (result.success && result.board) {
        onSuccess(result.board)
      } else {
        setErrorMessage(result.error || 'Geçersiz pano kodu')
      }
      setIsLoading(false)
    }, 350)
  }

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#0E0614] text-white flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto select-none font-sans z-[9999]">
      {/* ── Ambient Background Lighting ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#4B075F]/35 blur-[140px] animate-pulse" />
        <div
          className="absolute -bottom-40 -right-40 w-[650px] h-[650px] rounded-full bg-[#8D49A6]/25 blur-[150px] animate-pulse"
          style={{ animationDuration: '8s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#D914C8]/15 blur-[160px]"
        />

        {/* Floating Geometric Grid */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.07]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="gate-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#D914C8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gate-grid)" />
        </svg>
      </div>

      {/* ── Main Pairing Card ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg rounded-[2.5rem] bg-[#1A0E24]/90 backdrop-blur-2xl border border-[#49364F] shadow-2xl p-6 sm:p-10 text-center flex flex-col items-center"
      >
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center">
          <div className="h-12 sm:h-14 mb-4 flex items-center justify-center">
            <img
              src="/oxonom-logo-dark.png"
              alt="Oxonom Edu"
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-md"
              onError={(e) => {
                // Fallback text if logo image is missing
                const target = e.currentTarget
                target.style.display = 'none'
              }}
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8D49A6]/25 border border-[#8D49A6]/40 text-[#F0D8FA] text-xs font-black uppercase tracking-wider mb-2">
            <Tv size={14} className="text-[#D914C8]" />
            <span>Akıllı Tahta & Pano Girişi</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
            Cihaz Eşleştirme Ekranı
          </h1>

          <p className="text-xs sm:text-sm text-[#C4B3CD] mt-2 max-w-sm leading-relaxed">
            Bu akıllı tahtayı okulunuzun sistemine bağlamak için Okul Müdürünüzden aldığınız{' '}
            <strong className="text-white">4 Haneli Pano Kodunu</strong> giriniz.
          </p>
        </div>

        {/* Pairing Form */}
        <form onSubmit={handlePairSubmit} className="w-full space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#C4B3CD]">
              <KeyRound size={20} className="text-[#D914C8]" />
            </div>
            <input
              type="text"
              autoFocus
              required
              placeholder="Örn: 0368 veya 0368-01"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase())
                setErrorMessage(null)
              }}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#261533] border-2 border-[#8D49A6]/50 focus:border-[#D914C8] text-white font-mono text-lg sm:text-xl font-black tracking-widest uppercase text-center placeholder:text-[#716779] focus:outline-none focus:ring-4 focus:ring-[#D914C8]/20 transition-all shadow-inner"
            />
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2 text-left"
              >
                <AlertCircle size={16} className="shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#D914C8] via-[#8D49A6] to-[#4B075F] hover:brightness-110 active:scale-[0.99] text-white font-black text-sm tracking-wide shadow-xl shadow-[#D914C8]/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RotateCw size={18} className="animate-spin" />
                <span>Pano Doğrulanıyor...</span>
              </>
            ) : (
              <>
                <span>Panoya Giriş Yap</span>
                <ArrowRight size={18} strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>

        {/* Feature Highlights */}
        <div className="grid grid-cols-3 gap-2 w-full mt-6 pt-5 border-t border-[#49364F]/70 text-[10px] text-[#C4B3CD]">
          <div className="flex flex-col items-center gap-1 text-center p-2 rounded-xl bg-[#261533]/40 border border-[#3A2942]">
            <School size={16} className="text-[#D914C8]" />
            <span className="font-bold text-white">Okul & Sınıf</span>
            <span className="text-[9px] text-[#A898B0]">Otomatik Algılanır</span>
          </div>

          <div className="flex flex-col items-center gap-1 text-center p-2 rounded-xl bg-[#261533]/40 border border-[#3A2942]">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span className="font-bold text-white">Canlı Durum</span>
            <span className="text-[9px] text-[#A898B0]">Müdürde Yeşil Yanar</span>
          </div>

          <div className="flex flex-col items-center gap-1 text-center p-2 rounded-xl bg-[#261533]/40 border border-[#3A2942]">
            <ShieldCheck size={16} className="text-[#8D49A6]" />
            <span className="font-bold text-white">Multi-Tenant</span>
            <span className="text-[9px] text-[#A898B0]">%100 İzole Veri</span>
          </div>
        </div>

        {/* Available System Boards Drawer / Quick Select */}
        <div className="mt-5 w-full">
          <button
            type="button"
            onClick={() => setShowHelperList(!showHelperList)}
            className="text-[11px] text-[#C58ADB] hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer"
          >
            <HelpCircle size={13} />
            <span>Kayıtlı panoları ve demo kodlarını göster</span>
          </button>

          <AnimatePresence>
            {showHelperList && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 rounded-2xl bg-[#261533]/80 border border-[#49364F] text-left text-xs space-y-2 overflow-hidden"
              >
                <div className="text-[10px] uppercase font-bold text-[#A898B0] tracking-wider">
                  Hızlı Seçim (Tıklayarak Bağlan):
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                  {registeredBoards.map((b) => (
                    <button
                      key={b.code}
                      type="button"
                      onClick={() => handleQuickSelect(b.code)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#3A2448] hover:bg-[#8D49A6] text-white font-mono text-xs font-black border border-[#5A396E] transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{b.code}</span>
                      <span className="text-[10px] font-sans font-normal opacity-75">
                        ({b.classroom || b.name})
                      </span>
                    </button>
                  ))}
                  {registeredBoards.length === 0 && (
                    <div className="text-[11px] text-[#A898B0]">
                      Henüz kayıtlı pano bulunamadı. Lütfen önce Okul Müdürü panelinden pano ekleyiniz.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
