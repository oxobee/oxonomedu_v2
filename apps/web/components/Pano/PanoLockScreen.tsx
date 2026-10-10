'use client'
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock,
  Unlock,
  Calendar,
  School,
  LogOut,
  Delete,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  User,
} from 'lucide-react'
import { PanoSettings } from './PanoClient'
import { ClassroomItem } from '@/hooks/usePanoSync'

export interface QuoteItem {
  text: string
  author: string
}

const DEFAULT_PANO_QUOTES: QuoteItem[] = [
  { text: "“Hayatta en hakiki mürşit ilimdir, fendir.”", author: "Gazi Mustafa Kemal Atatürk" },
  { text: "“İlim ilim bilmektir, ilim kendin bilmektir. Sen kendin bilmezsin, ya nice okumaktır.”", author: "Yunus Emre" },
  { text: "“Bir mıh bir nalı, bir nal bir atı, bir at bir yiğidi, bir yiğit bir vatanı kurtarır.”", author: "Türk Atasözü" },
  { text: "“Eğitim, dünyayı değiştirmek için kullanabileceğiniz en güçlü silahtır.”", author: "Nelson Mandela" },
  { text: "“Bilgi cesaret verir, cehalet ise cüret.”", author: "Platon" },
  { text: "“Akıl akıldan üstündür; ilim paylaştıkça çoğalan yegane hazinedir.”", author: "Şems-i Tebrizi" },
  { text: "“Bana bir harf öğretenin kırk yıl kölesi olurum.”", author: "Hz. Ali (r.a.)" },
  { text: "“Gözlem yapmadan teoriler üretmek, tuğlasız bina yapmaya benzer.”", author: "Arthur Conan Doyle" }
]

const normalizeQuote = (q: any): QuoteItem => {
  if (typeof q === 'object' && q !== null && 'text' in q) {
    return { text: q.text || '', author: q.author || '' }
  }
  if (typeof q === 'string') {
    if (q.includes(' — ')) {
      const parts = q.split(' — ')
      return { text: parts[0].trim(), author: parts.slice(1).join(' — ').trim() }
    }
    return { text: q.trim(), author: '' }
  }
  return { text: '', author: '' }
}

export interface PanoLockScreenProps {
  user: any
  org: any
  settings: PanoSettings
  selectedClass?: ClassroomItem | null
  onUnlock: () => void
  onLogout?: () => void
}

export default function PanoLockScreen({
  user,
  org,
  settings,
  selectedClass,
  onUnlock,
  onLogout,
}: PanoLockScreenProps) {
  const [pinInput, setPinInput] = useState('')
  const [hasError, setHasError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const actualPin = settings.pin ? String(settings.pin).trim() : ''
  const targetPinLength = actualPin.length > 0 ? actualPin.length : 4

  // Live Clock & Date
  const [currentTime, setCurrentTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = String(currentTime.getHours()).padStart(2, '0')
  const minutes = String(currentTime.getMinutes()).padStart(2, '0')
  const dateFormatted = currentTime.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
  const weekdayFormatted = currentTime.toLocaleDateString('tr-TR', { weekday: 'long' })

  // Teacher Display Info
  const teacherName =
    (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '') ||
    user?.full_name ||
    user?.name ||
    user?.username ||
    selectedClass?.teacherName ||
    'Öğretmen'

  const userInitial = (teacherName || 'Ö')[0].toUpperCase()

  // Prevent scrollbars
  useEffect(() => {
    const origBody = document.body.style.overflow
    const origHtml = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = origBody
      document.documentElement.style.overflow = origHtml
    }
  }, [])

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
    }
  }, [])

  // Quotes
  const quotes: QuoteItem[] = (settings.quotes && settings.quotes.length > 0 ? settings.quotes : DEFAULT_PANO_QUOTES).map(normalizeQuote)
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % quotes.length)
    }, 11000)
    return () => clearInterval(timer)
  }, [quotes.length])

  const activeQuote = quotes[currentQuoteIndex % quotes.length] || quotes[0]

  const handleKeyClick = (digit: string) => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(12) } catch (_) {}
    }

    if (isVerifying || isSuccess) return

    if (hasError) {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
      setHasError(false)
      const next = digit
      setPinInput(next)
      checkPin(next)
      return
    }

    if (pinInput.length >= targetPinLength) return

    const next = pinInput + digit
    setPinInput(next)
    checkPin(next)
  }

  const handleDelete = () => {
    if (isSuccess || isVerifying) return
    if (typeof window !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(10) } catch (_) {}
    }
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
    setHasError(false)
    setPinInput(prev => prev.slice(0, -1))
  }

  const handleClear = () => {
    if (isSuccess || isVerifying) return
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
    setHasError(false)
    setPinInput('')
  }

  const checkPin = (current: string) => {
    if (!actualPin) {
      onUnlock()
      return
    }

    if (current.length === targetPinLength) {
      if (current === actualPin) {
        setIsSuccess(true)
        setIsVerifying(true)
        if (typeof window !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate([30, 40, 30]) } catch (_) {}
        }
        setTimeout(() => {
          setIsSuccess(false)
          setIsVerifying(false)
          setPinInput('')
          onUnlock()
        }, 350)
      } else {
        setHasError(true)
        setIsVerifying(true)
        if (typeof window !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate([40, 60, 40]) } catch (_) {}
        }
        if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
        errorTimeoutRef.current = setTimeout(() => {
          setPinInput('')
          setHasError(false)
          setIsVerifying(false)
        }, 650)
      }
    }
  }

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleKeyClick(e.key)
      } else if (e.key === 'Backspace') {
        handleDelete()
      } else if (e.key === 'Escape') {
        handleClear()
      } else if (e.key === 'Enter') {
        if (!actualPin) {
          onUnlock()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pinInput, actualPin, targetPinLength, hasError, isVerifying, isSuccess])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.03, filter: 'blur(12px)' }}
      transition={{ type: "spring", damping: 30, stiffness: 220 }}
      className="fixed inset-0 z-[200] flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden h-screen w-screen font-sans"
      style={{
        background: 'radial-gradient(ellipse at 25% 25%, #1f121d 0%, #110913 50%, #060207 100%)',
      }}
    >
      {/* Background Matrix Dots */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1.2px, transparent 0),
            radial-gradient(circle at 19px 19px, rgba(244, 63, 94, 0.15) 1.2px, transparent 0)
          `,
          backgroundSize: '36px 36px',
        }}
      />

      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[350px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[300px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="relative z-20 flex items-center justify-between w-full shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-lg">
            <School className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white tracking-tight">{org?.name || 'Oxonom Okulları'}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Kilitli
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Akıllı Tahta Güvenlik Kalkanı</p>
          </div>
        </div>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-rose-500/25 active:bg-rose-500/35 border border-white/15 hover:border-rose-400/40 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer shadow-lg active:scale-95"
            title="Cihazdan Tamamen Çıkış Yap"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Cihazdan Çıkış Yap</span>
          </button>
        )}
      </header>

      {/* Main Content: Landscape 2-Column Responsive Layout */}
      <main className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center max-w-7xl w-full mx-auto my-auto px-2">
        {/* LEFT COLUMN: Widescreen Clock, Teacher Card & Quote */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
          {/* Big Digital Clock & Date */}
          <div className="space-y-1">
            <div className="flex items-center justify-center lg:justify-start font-mono tabular-nums tracking-tight">
              <span className="text-7xl sm:text-8xl lg:text-[7.5rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)] leading-none">
                {hours}
              </span>
              <span className="text-6xl sm:text-7xl lg:text-8xl font-thin text-rose-400 mx-2 sm:mx-4 animate-pulse drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]">
                :
              </span>
              <span className="text-7xl sm:text-8xl lg:text-[7.5rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)] leading-none">
                {minutes}
              </span>
            </div>

            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-xl text-slate-200 text-xs sm:text-sm font-semibold shadow-inner">
              <Calendar className="w-4 h-4 text-rose-400" />
              <span>{dateFormatted}</span>
              <span className="text-slate-500">•</span>
              <span className="text-rose-300 font-bold capitalize">{weekdayFormatted}</span>
            </div>
          </div>

          {/* Teacher Profile Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/75 border border-white/10 backdrop-blur-xl shadow-xl flex items-center gap-4 max-w-md w-full text-left">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-rose-900/40 shrink-0 border border-white/20">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block">
                Aktif Öğretmen Oturumu
              </span>
              <h3 className="text-base sm:text-lg font-black text-white truncate">
                Sayın {teacherName}
              </h3>
              <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                {selectedClass ? `${selectedClass.name} · ${selectedClass.gradeLevel}` : 'Ders tahtası hazır'}
              </p>
            </div>
          </div>

          {/* Inspiring Educational Quote */}
          <div className="max-w-lg w-full min-h-[70px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuoteIndex}
                initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
                transition={{ duration: 0.6 }}
                className="space-y-1"
              >
                <p className="text-sm sm:text-base font-semibold text-slate-300 italic leading-relaxed">
                  "{activeQuote.text}"
                </p>
                {activeQuote.author && (
                  <span className="text-xs font-bold text-rose-300/80 block">
                    — {activeQuote.author}
                  </span>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT COLUMN: Mobile-Style Sleek PIN Pad Card */}
        <div className="lg:col-span-5 flex justify-center w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={
              hasError
                ? { x: [-14, 14, -10, 10, -5, 5, 0], scale: 1, y: 0, opacity: 1 }
                : { x: 0, scale: 1, y: 0, opacity: 1 }
            }
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className={`w-full max-w-sm sm:max-w-[380px] p-6 sm:p-8 rounded-[32px] bg-slate-900/85 backdrop-blur-2xl ring-1 ring-white/10 transition-all duration-300 shadow-2xl ${
              isSuccess
                ? 'border-2 border-emerald-500 shadow-[0_0_60px_rgba(16,185,129,0.5)]'
                : 'border border-rose-500/25 shadow-[0_20px_50px_rgba(0,0,0,0.7)]'
            }`}
          >
            {/* Header with Lock Icon */}
            <div className="flex flex-col items-center text-center mb-5">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-lg transition-colors ${
                  isSuccess
                    ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                    : 'bg-rose-500/20 border border-rose-500/30 text-rose-400'
                }`}
              >
                {isSuccess ? <Unlock className="w-7 h-7 animate-pulse text-emerald-400" /> : <Lock className="w-6 h-6" />}
              </div>

              <h2 className={`text-lg font-black tracking-tight transition-colors ${isSuccess ? 'text-emerald-400' : 'text-white'}`}>
                {isSuccess ? 'Pano Açılıyor...' : 'Pano PIN Girişi'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {actualPin ? `${targetPinLength} haneli şifrenizi girin` : 'Şifresiz hızlı giriş yapabilirsiniz'}
              </p>
            </div>

            {/* If NO pin configured: Direct Large Unlock Button */}
            {!actualPin ? (
              <div className="space-y-4 w-full pt-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onUnlock}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/30 border border-white/20 cursor-pointer active:scale-95 transition-all"
                >
                  <Unlock className="w-5 h-5" />
                  <span>Kilidi Aç</span>
                </motion.button>
                <p className="text-[11px] text-slate-400 text-center">Ayarlardan tahta PIN kodu belirleyebilirsiniz.</p>
              </div>
            ) : (
              <>
                {/* PIN Indicator Dots */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  {Array.from({ length: targetPinLength }).map((_, i) => {
                    const isFilled = i < pinInput.length
                    return (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-full transition-all duration-300 ${
                          isFilled
                            ? isSuccess
                              ? 'bg-gradient-to-tr from-emerald-400 to-teal-300 scale-125 border border-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.9)]'
                              : 'bg-gradient-to-tr from-rose-500 to-red-400 scale-125 border border-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.8)]'
                            : 'border border-white/30 bg-white/5'
                        } ${hasError ? '!border-red-500 !bg-red-500 animate-bounce' : ''}`}
                      />
                    )
                  })}
                </div>

                {hasError && (
                  <p className="text-red-400 text-xs font-bold mb-4 text-center animate-pulse">
                    Hatalı PIN Kodu! Tekrar deneyin.
                  </p>
                )}

                {/* Mobile-Style Tactile Keypad */}
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full">
                  {[
                    { num: '1', sub: '' },
                    { num: '2', sub: 'ABC' },
                    { num: '3', sub: 'DEF' },
                    { num: '4', sub: 'GHI' },
                    { num: '5', sub: 'JKL' },
                    { num: '6', sub: 'MNO' },
                    { num: '7', sub: 'PQRS' },
                    { num: '8', sub: 'TUV' },
                    { num: '9', sub: 'WXYZ' }
                  ].map(({ num, sub }) => (
                    <motion.button
                      key={num}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      aria-label={`Rakam ${num}`}
                      onClick={() => handleKeyClick(num)}
                      className="h-14 sm:h-16 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] active:bg-rose-500/30 border border-white/10 hover:border-white/20 text-white flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 group shadow-sm"
                    >
                      <span className="font-mono text-xl sm:text-2xl font-black group-hover:text-rose-300 transition-colors leading-none">
                        {num}
                      </span>
                      {sub && (
                        <span className="text-[8px] font-bold text-slate-400 tracking-wider uppercase mt-0.5 group-hover:text-rose-200">
                          {sub}
                        </span>
                      )}
                    </motion.button>
                  ))}

                  {/* Bottom row: Clear (C), 0 (+), Delete (⌫) */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    aria-label="Temizle"
                    onClick={handleClear}
                    className="h-14 sm:h-16 rounded-2xl bg-white/[0.05] hover:bg-white/[0.10] active:bg-white/[0.15] border border-white/10 text-slate-400 hover:text-white text-xs font-bold flex items-center justify-center cursor-pointer transition-all active:scale-95"
                    title="Temizle"
                  >
                    C
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    aria-label="Rakam 0"
                    onClick={() => handleKeyClick('0')}
                    className="h-14 sm:h-16 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] active:bg-rose-500/30 border border-white/10 hover:border-white/20 text-white flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 group shadow-sm"
                  >
                    <span className="font-mono text-xl sm:text-2xl font-black group-hover:text-rose-300 transition-colors leading-none">
                      0
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                      +
                    </span>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    aria-label="Sil"
                    onClick={handleDelete}
                    className="h-14 sm:h-16 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] active:bg-rose-500/30 border border-white/10 hover:border-white/20 text-slate-300 hover:text-rose-400 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                    title="Sil"
                  >
                    <Delete className="w-5 h-5 text-slate-400 group-hover:text-rose-300" />
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </main>

      {/* Footer Branding with Soft Sweeping Glow */}
      <footer className="relative z-20 flex items-center justify-center w-full py-2 shrink-0">
        <div className="relative overflow-hidden py-1 px-6 flex items-center justify-center">
          <span className="font-mono text-[10px] sm:text-xs font-black text-rose-200/70 uppercase tracking-[0.45em] sm:tracking-[0.6em] relative z-10">
            O X O N O M &nbsp; T E C H N O L O G Y
          </span>
          <motion.div
            initial={{ x: '-160%' }}
            animate={{ x: '260%' }}
            transition={{
              repeat: Infinity,
              duration: 3.4,
              ease: "easeInOut",
              repeatDelay: 2
            }}
            className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-rose-300/60 to-transparent blur-xs pointer-events-none mix-blend-screen z-20"
          />
        </div>
      </footer>
    </motion.div>
  )
}
