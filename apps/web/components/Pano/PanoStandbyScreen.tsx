'use client'
import React, { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RotateCw,
  Maximize2,
  Minimize2,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wifi,
  Radio,
  Clock,
  KeyRound,
  AlertTriangle
} from 'lucide-react'
import screenfull from 'screenfull'
import toast from 'react-hot-toast'
import { TeacherPairData } from '@/lib/pano-pair/store'

interface PanoStandbyScreenProps {
  onPaired: (data: TeacherPairData) => void
}

export default function PanoStandbyScreen({ onPaired }: PanoStandbyScreenProps) {
  const [sessionId, setSessionId] = useState<string>('')
  const [pairingCode, setPairingCode] = useState<string>('')
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [expiresAt, setExpiresAt] = useState<number>(Date.now() + 300000)
  const [timeLeft, setTimeLeft] = useState<number>(300)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [isPairedSuccess, setIsPairedSuccess] = useState<boolean>(false)
  const [pairedTeacher, setPairedTeacher] = useState<TeacherPairData | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [dbError, setDbError] = useState<string | null>(null)

  const sseRef = useRef<EventSource | null>(null)
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null)
  const countTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Track fullscreen state
  useEffect(() => {
    if (screenfull.isEnabled) {
      const handler = () => setIsFullscreen(screenfull.isFullscreen)
      screenfull.on('change', handler)
      return () => screenfull.off('change', handler)
    }
  }, [])

  const toggleFullscreen = () => {
    if (screenfull.isEnabled) {
      screenfull.toggle().catch(() => {})
    }
  }

  // Prevent scrollbars on Standby screen
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

  // Create new pairing session
  const initSession = async (silent = false) => {
    if (!silent) setIsLoading(true)
    setIsRefreshing(true)

    // Close previous SSE / pollers
    if (sseRef.current) {
      sseRef.current.close()
      sseRef.current = null
    }
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current)
      pollTimerRef.current = null
    }

    try {
      const res = await fetch('/api/pano/pair/session', { method: 'POST' })
      const data = await res.json().catch(() => ({}))

      if (res.status === 503 || data.code === 'store_unavailable') {
        const errorMsg = data.error || 'Veritabanı yapılandırılmamış (MongoDB bağlantısı kurulamadı)'
        setDbError(errorMsg)
        toast.error(errorMsg)
        setIsLoading(false)
        setIsRefreshing(false)
        return
      }

      if (data.success && data.session) {
        setDbError(null)
        const sess = data.session
        setSessionId(sess.sessionId)
        setPairingCode(sess.code)
        setExpiresAt(sess.expiresAt)
        setTimeLeft(Math.max(0, Math.floor((sess.expiresAt - Date.now()) / 1000)))

        // Generate high-contrast, clean QR code with optimal scanning resolution
        const qrUrl = sess.qrUrl || `${window.location.origin}/dash/connect-board?code=${sess.code}&session=${sess.sessionId}`
        const url = await QRCode.toDataURL(qrUrl, {
          width: 320,
          margin: 1.5,
          color: {
            dark: '#09090b',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M',
        })
        setQrDataUrl(url)

        if (sess.boardDeviceToken && typeof window !== 'undefined') {
          sessionStorage.setItem('oxonom_pano_device_token', sess.boardDeviceToken)
          localStorage.setItem('oxonom_pano_device_token', sess.boardDeviceToken)
        }

        // Start Realtime SSE listening
        startRealtimeListening(sess.sessionId, sess.boardDeviceToken)
      } else {
        toast.error(data.error || 'Tahta oturumu oluşturulamadı.')
      }
    } catch (err) {
      console.error('[PanoStandby] Session creation error:', err)
      toast.error('Bağlantı hatası oluştu.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Start Server-Sent Events with fallback Polling
  const startRealtimeListening = (activeSessionId: string, deviceToken?: string) => {
    try {
      const tok = deviceToken || (typeof window !== 'undefined' ? localStorage.getItem('oxonom_pano_device_token') || '' : '')
      const sseUrl = `/api/pano/pair/stream?sessionId=${encodeURIComponent(activeSessionId)}${tok ? `&token=${encodeURIComponent(tok)}` : ''}`
      const sse = new EventSource(sseUrl)
      sseRef.current = sse

      sse.addEventListener('paired', (event) => {
        try {
          const teacherData: TeacherPairData = JSON.parse(event.data)
          handleSuccessfulPair(teacherData)
        } catch (err) {
          console.error('[PanoStandby] SSE parse error:', err)
        }
      })

      sse.onerror = () => {
        // Fallback polling will handle checking
        sse.close()
      }
    } catch (err) {
      console.warn('[PanoStandby] SSE not supported, using polling fallback')
    }

    // Polling fallback every 1.8 seconds
    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/pano/pair/session?sessionId=${encodeURIComponent(activeSessionId)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.status === 'paired' && data.teacherData) {
            handleSuccessfulPair(data.teacherData)
          } else if (data.status === 'expired') {
            initSession(true)
          }
        }
      } catch (_) {}
    }, 1800)
  }

  const handleSuccessfulPair = async (teacherData: TeacherPairData) => {
    if (sseRef.current) sseRef.current.close()
    if (pollTimerRef.current) clearInterval(pollTimerRef.current)

    setPairedTeacher(teacherData)
    setIsPairedSuccess(true)

    // Set client-side cookies immediately
    if (typeof document !== 'undefined') {
      const orgSlug = teacherData.orgSlug || 'neclagorer'
      document.cookie = `LH_session=1; path=/; max-age=2592000; SameSite=Lax`
      document.cookie = `LH_org=${orgSlug}; path=/; max-age=2592000; SameSite=Lax`
    }

    // Call claim endpoint to set HTTP-only auth cookies (LH_access, LH_refresh) on the board browser
    let finalTeacherData = teacherData
    try {
      const res = await fetch('/api/pano/pair/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          teacherData,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.teacherData) {
          finalTeacherData = data.teacherData
          setPairedTeacher(finalTeacherData)
        }
      }
    } catch (err) {
      console.error('[PanoStandby] Claim error:', err)
    }

    if (typeof window !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([100, 50, 100]) } catch (_) {}
    }

    // Smooth delay to celebrate and unlock into dashboard
    setTimeout(() => {
      onPaired({
        ...finalTeacherData,
        sessionId,
      })
    }, 1200)
  }

  // Countdown timer
  useEffect(() => {
    countTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto refresh expired code
          initSession(true)
          return 300
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (countTimerRef.current) clearInterval(countTimerRef.current)
    }
  }, [])

  // Mount session
  useEffect(() => {
    initSession()

    return () => {
      if (sseRef.current) sseRef.current.close()
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
      if (countTimerRef.current) clearInterval(countTimerRef.current)
    }
  }, [])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTimeLeft = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`

  // Format 6 digit code into 2 chunks: [0..2] and [3..5]
  const codeDigits = (pairingCode || '------').split('')

  return (
    <div
      className="fixed inset-0 z-[300] flex flex-col items-center justify-between p-4 sm:p-8 md:p-10 select-none overflow-hidden h-screen w-screen max-h-screen max-w-screen font-sans"
      style={{
        background: 'radial-gradient(ellipse at 50% 15%, #251014 0%, #15090b 50%, #070304 100%)',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {/* Eye-Friendly High-Tech Refined Dot Pattern with Red Hue */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.12) 1.2px, transparent 0),
            radial-gradient(circle at 19px 19px, rgba(244, 63, 94, 0.12) 1.2px, transparent 0)
          `,
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 20%, rgba(0,0,0,0.95) 75%, rgba(0,0,0,0.3) 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 20%, rgba(0,0,0,0.95) 75%, rgba(0,0,0,0.3) 100%)'
        }}
      />

      {/* Ambient Red & Ruby Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[360px] bg-rose-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[650px] h-[280px] bg-red-600/12 rounded-full blur-[130px] pointer-events-none" />

      {/* TOP BAR: Status & Fullscreen Toggle */}
      <div className="w-full flex items-center justify-between relative z-20 px-2 sm:px-4">
        {/* Connection status badge */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/50 border border-white/10 backdrop-blur-xl text-xs font-semibold text-white/80 shadow-lg">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="tracking-wide">Tahta Çevrimiçi • Eşleştirme Bekleniyor</span>
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran Yap'}
          className="p-2 sm:p-2.5 rounded-2xl bg-black/40 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 backdrop-blur-xl transition-all shadow-md active:scale-95 cursor-pointer"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>

      {/* CENTER STAGE: Brand Logo + Pairing Master Card */}
      <div className="relative z-10 flex flex-col items-center max-w-4xl w-full my-auto px-2">
        {/* Large Centered Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center text-center mb-6 sm:mb-8"
        >
          <div className="relative flex items-center justify-center drop-shadow-[0_10px_35px_rgba(244,63,94,0.35)]">
            <img
              src="/oxonom_edu_logo_white.png"
              alt="Oxonom Edu Logo"
              className="h-14 sm:h-18 md:h-20 w-auto object-contain select-none"
            />
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-[11px] sm:text-xs font-extrabold tracking-[0.25em] uppercase text-rose-300/80 drop-shadow-xs">
              Akıllı Tahta Eğitim İşletim Sistemi
            </span>
          </div>
        </motion.div>

        {/* Success Modal Overlay (When paired) */}
        <AnimatePresence>
          {isPairedSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="absolute inset-0 z-50 rounded-[2.5rem] bg-black/90 backdrop-blur-3xl border-2 border-emerald-500/80 shadow-[0_0_80px_rgba(16,185,129,0.4)] flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 border-2 border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.5)] animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
                Eşleştirme Başarılı!
              </h3>
              <p className="text-base sm:text-lg text-emerald-300 font-semibold mb-4">
                Hoş Geldiniz, {pairedTeacher?.first_name || pairedTeacher?.username || 'Öğretmenim'}
              </p>
              <span className="text-xs text-white/50 animate-pulse">
                Akıllı tahta panosu yükleniyor...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MASTER PAIRING FRAME */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full relative rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-b from-[#140b0e]/90 via-[#0e0709]/95 to-[#070305]/95 border-2 border-rose-500/30 backdrop-blur-2xl shadow-[0_15px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(244,63,94,0.15)] ring-1 ring-white/10 p-6 sm:p-8 md:p-10 overflow-hidden"
        >
          {/* Subtle frame corner lights */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-rose-500/20 to-transparent rounded-tl-[2rem] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-rose-500/20 to-transparent rounded-br-[2rem] pointer-events-none" />

          {dbError ? (
            <div className="flex flex-col items-center justify-center p-8 sm:p-10 text-center relative z-10 space-y-4 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-white">Veritabanı Yapılandırılmamış (503)</h3>
                <p className="text-sm text-rose-300 font-semibold">{dbError}</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Akıllı tahta eşleşmesi ve telefon kumandasının ortak çalışabilmesi için MongoDB Atlas bağlantısı zorunludur. Vercel üzerinde <strong>MONGODB_URI</strong> ortam değişkeninin tanımlı ve Atlas Network Access (0.0.0.0/0) erişiminin açık olduğunu doğrulayın.
                </p>
              </div>
              <button
                type="button"
                onClick={() => initSession(false)}
                className="mt-3 px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer active:scale-95 flex items-center gap-2"
              >
                <RotateCw className="w-4 h-4" />
                <span>Yeniden Bağlanmayı Dene</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-11 gap-8 items-center relative z-10">
            {/* LEFT COLUMN: QR CODE (5 cols) */}
            <div className="md:col-span-5 flex flex-col items-center text-center">
              <div className="relative group">
                {/* QR Code Container */}
                <div className="p-3.5 sm:p-4 rounded-3xl bg-white shadow-2xl shadow-rose-950/60 ring-4 ring-rose-500/20 relative transition-transform duration-300 group-hover:scale-102">
                  {isLoading ? (
                    <div className="w-52 h-52 sm:w-60 sm:h-60 flex flex-col items-center justify-center bg-gray-50 rounded-2xl">
                      <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[11px] font-bold text-gray-400 mt-3">QR Üretiliyor...</span>
                    </div>
                  ) : (
                    <img
                      src={qrDataUrl}
                      alt="Tahtaya Bağlan QR Kodu"
                      className="w-52 h-52 sm:w-60 sm:h-60 object-contain rounded-2xl select-none"
                    />
                  )}

                  {/* Corner Target Marks */}
                  <span className="absolute -top-1.5 -left-1.5 w-5 h-5 border-t-3 border-l-3 border-rose-500 rounded-tl-lg" />
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 border-t-3 border-r-3 border-rose-500 rounded-tr-lg" />
                  <span className="absolute -bottom-1.5 -left-1.5 w-5 h-5 border-b-3 border-l-3 border-rose-500 rounded-bl-lg" />
                  <span className="absolute -bottom-1.5 -right-1.5 w-5 h-5 border-b-3 border-r-3 border-rose-500 rounded-br-lg" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-rose-200/90 text-xs sm:text-sm font-semibold">
                <Smartphone className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Telefon kameranızdan veya panelden okutun</span>
              </div>
            </div>

            {/* CENTER DIVIDER (1 col) */}
            <div className="hidden md:flex md:col-span-1 flex-col items-center justify-center h-full">
              <div className="w-px h-28 bg-gradient-to-b from-transparent via-rose-500/40 to-transparent" />
              <span className="my-3 px-2 py-1 rounded-full bg-rose-950/80 border border-rose-500/30 text-[10px] font-black tracking-widest text-rose-300 uppercase shadow-inner">
                VEYA
              </span>
              <div className="w-px h-28 bg-gradient-to-b from-transparent via-rose-500/40 to-transparent" />
            </div>

            {/* RIGHT COLUMN: 6-DIGIT PAIRING CODE (5 cols) */}
            <div className="md:col-span-5 flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <KeyRound className="w-4 h-4 text-rose-400" />
                <span>6 Haneli Eşleştirme Kodu</span>
              </div>

              {/* Monospace Legible 6-Digit Display */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 my-2.5">
                {/* First 3 digits */}
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {codeDigits.slice(0, 3).map((digit, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      className="w-10 h-14 sm:w-12 sm:h-16 md:w-13 md:h-17 rounded-2xl bg-black/60 border-2 border-rose-500/30 text-white font-mono font-black text-2xl sm:text-3xl flex items-center justify-center shadow-inner shadow-rose-950/40 ring-1 ring-white/10"
                    >
                      <span className="drop-shadow-[0_0_12px_rgba(244,63,94,0.7)] text-rose-100">
                        {digit}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Dash separator */}
                <span className="text-xl sm:text-2xl font-black text-rose-500/70 px-0.5">
                  -
                </span>

                {/* Last 3 digits */}
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {codeDigits.slice(3, 6).map((digit, idx) => (
                    <motion.div
                      key={idx + 3}
                      whileHover={{ scale: 1.05 }}
                      className="w-10 h-14 sm:w-12 sm:h-16 md:w-13 md:h-17 rounded-2xl bg-black/60 border-2 border-rose-500/30 text-white font-mono font-black text-2xl sm:text-3xl flex items-center justify-center shadow-inner shadow-rose-950/40 ring-1 ring-white/10"
                    >
                      <span className="drop-shadow-[0_0_12px_rgba(244,63,94,0.7)] text-rose-100">
                        {digit}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <p className="text-xs text-slate-400 max-w-xs mt-2 leading-relaxed">
                Öğretmen panelinizdeki <strong className="text-white">“Tahtaya Bağlan”</strong> menüsünden bu 6 haneli kodu girerek anında bağlanabilirsiniz.
              </p>

              {/* Timer & Refresh Row */}
              <div className="mt-5 flex items-center gap-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-950/50 border border-rose-500/25 text-rose-300 text-xs font-semibold shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                  <span>Kalan Süre: <strong className="text-white font-mono">{formattedTimeLeft}</strong></span>
                </div>

                <button
                  type="button"
                  onClick={() => initSession(false)}
                  disabled={isRefreshing}
                  title="Yeni Kod Üret"
                  className="p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/80 hover:text-white border border-white/10 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-rose-400' : ''}`} />
                  <span className="hidden sm:inline">Kodu Yenile</span>
                </button>
              </div>
            </div>
          </div>
          )}
        </motion.div>
      </div>

      {/* BOTTOM FOOTER: Sweeping Glow Branding */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full pb-2 select-none shrink-0 space-y-1">
        <div className="relative overflow-hidden py-1 px-4">
          <span className="text-xs sm:text-sm font-black tracking-[0.35em] uppercase text-slate-400">
            OXONOM TECHNOLOGY
          </span>
          {/* Sweeping Light Effect */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(244,63,94,0.4) 50%, transparent 100%)',
              animation: 'oxonom-sweep 4s ease-in-out infinite',
            }}
          />
        </div>
        <p className="text-[10px] text-white/30 tracking-wider">
          Güvenli Akıllı Tahta Bağlantı Protokolü v2.0
        </p>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes oxonom-sweep {
          0% {
            transform: translateX(-150%);
          }
          50%, 100% {
            transform: translateX(150%);
          }
        }
      `}</style>
    </div>
  )
}
