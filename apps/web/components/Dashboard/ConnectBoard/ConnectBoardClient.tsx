'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  KeyRound,
  CheckCircle2,
  XCircle,
  RotateCw,
  Sparkles,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Tv,
  ExternalLink,
  ChevronRight,
  Maximize2
} from 'lucide-react'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { useAuth } from '@components/Contexts/AuthContext'
import { useOrg } from '@components/Contexts/OrgContext'
import toast from 'react-hot-toast'

interface ConnectBoardClientProps {
  initialCode?: string
  initialSessionId?: string
  onSuccess?: () => void
  isModal?: boolean
}

export default function ConnectBoardClient({
  initialCode = '',
  initialSessionId = '',
  onSuccess,
  isModal = false,
}: ConnectBoardClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const session = useLHSession() as any
  const auth = useAuth() as any
  const org = useOrg() as any
  const user = session?.data?.user

  // Check URL query parameters for prefilled code/session
  const urlCode = searchParams?.get('code') || initialCode
  const urlSession = searchParams?.get('session') || initialSessionId

  const [activeTab, setActiveTab] = useState<'otp' | 'camera'>('otp')
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [sessionId, setSessionId] = useState<string>(urlSession)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  const scannerRef = useRef<any>(null)
  const scannerContainerId = 'html5-qr-reader-container'

  // Prefill code from URL if provided
  useEffect(() => {
    if (urlCode && urlCode.length === 6) {
      const split = urlCode.split('').slice(0, 6)
      setDigits(split)
      // Auto-submit if both code and user are available
      if (user) {
        handleConfirmPair(urlCode, urlSession)
      }
    }
  }, [urlCode, urlSession, user])

  // Handle camera scanner
  const startCamera = async () => {
    setCameraError(null)
    setIsCameraActive(true)

    try {
      const { Html5Qrcode } = await import('html5-qrcode')

      // Stop previous instance if running
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop()
          }
          await scannerRef.current.clear()
        } catch (_) {}
      }

      const html5Qr = new Html5Qrcode(scannerContainerId)
      scannerRef.current = html5Qr

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      }

      await html5Qr.start(
        { facingMode: 'environment' },
        config,
        (decodedText: string) => {
          handleQrScanSuccess(decodedText)
        },
        () => {
          // ignore frame errors while looking for QR
        }
      )
    } catch (err: any) {
      console.error('[Camera] Start error:', err)
      setCameraError('Kamera başlatılamadı. Lütfen kamera erişim iznini kontrol edin veya 6 haneli kodu elle girin.')
      setIsCameraActive(false)
    }
  }

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop()
        }
        await scannerRef.current.clear()
      } catch (err) {
        console.error('[Camera] Stop error:', err)
      }
      scannerRef.current = null
    }
    setIsCameraActive(false)
  }

  // Cleanup camera on unmount or tab switch
  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [activeTab])

  // Process scanned QR text
  const handleQrScanSuccess = (qrText: string) => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([80, 50, 80]) } catch (_) {}
    }

    stopCamera()

    try {
      // Check if it's a URL with code=...
      if (qrText.includes('code=')) {
        const url = new URL(qrText)
        const code = url.searchParams.get('code')
        const sess = url.searchParams.get('session')
        if (code && code.length === 6) {
          setDigits(code.split(''))
          if (sess) setSessionId(sess)
          handleConfirmPair(code, sess || undefined)
          return
        }
      }

      // Check if raw JSON
      if (qrText.startsWith('{') && qrText.endsWith('}')) {
        const parsed = JSON.parse(qrText)
        if (parsed.code) {
          const code = String(parsed.code)
          setDigits(code.split('').slice(0, 6))
          handleConfirmPair(code, parsed.session || parsed.sessionId)
          return
        }
      }

      // Check if 6 digit raw string
      const cleaned = qrText.replace(/[^0-9]/g, '')
      if (cleaned.length === 6) {
        setDigits(cleaned.split(''))
        handleConfirmPair(cleaned)
        return
      }

      toast.error('Geçersiz QR kod formatı.')
    } catch (err) {
      console.error('[QR] Parsing error:', err)
      toast.error('QR kod okunamadı.')
    }
  }

  // OTP Digits Handling
  const handleDigitChange = (index: number, val: string) => {
    setErrorMessage(null)
    const cleaned = val.replace(/[^0-9]/g, '')
    const newDigits = [...digits]
    newDigits[index] = cleaned.slice(-1)
    setDigits(newDigits)

    // Auto advance to next box
    if (cleaned && index < 5) {
      inputRefs[index + 1].current?.focus()
    }

    // Auto submit on last digit
    if (index === 5 && cleaned) {
      const fullCode = newDigits.join('')
      if (fullCode.length === 6) {
        handleConfirmPair(fullCode, sessionId)
      }
    }
  }

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  const handleDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6)
    if (!pasted) return

    const newDigits = ['', '', '', '', '', '']
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i]
    }
    setDigits(newDigits)

    if (pasted.length === 6) {
      handleConfirmPair(pasted, sessionId)
    } else {
      inputRefs[Math.min(pasted.length, 5)].current?.focus()
    }
  }

  // Teacher Pair Confirmation
  const handleConfirmPair = async (codeToSubmit?: string, sessId?: string) => {
    const code = codeToSubmit || digits.join('')
    if (code.length < 6) {
      setErrorMessage('Lütfen 6 haneli eşleştirme kodunu eksiksiz girin.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    // Collect teacher payload
    let savedSettings: any = null
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('oxonom_pano_settings')
        if (raw) savedSettings = JSON.parse(raw)
      } catch (_) {}
    }

    let token = session?.data?.tokens?.access_token || auth?.accessToken
    if (!token && auth?.refreshSession) {
      try {
        token = await auth.refreshSession()
      } catch (_) {}
    }
    const refreshToken = session?.data?.tokens?.refresh_token || token

    const teacherData = {
      id: user?.id || 2,
      username: user?.username || 'ogretmen',
      first_name: user?.first_name || 'Özlem',
      last_name: user?.last_name || 'ZOR',
      email: user?.email || 'ogretmen@oxonom.com',
      role: 'teacher',
      token,
      refreshToken,
      orgSlug: org?.slug || 'neclagorer',
      lock_pin: savedSettings?.pin || '1234',
      settings: savedSettings,
    }

    try {
      const res = await fetch('/api/pano/pair/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          sessionId: sessId || sessionId || undefined,
          teacherData,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setIsSuccess(true)
        const confirmedSessionId = data.session?.sessionId || sessId || sessionId
        setSessionId(confirmedSessionId)
        if (typeof window !== 'undefined') {
          if (confirmedSessionId) {
            localStorage.setItem('oxonom_pano_active_session_id', confirmedSessionId)
          }
          localStorage.setItem('oxonom_pano_paired_session', JSON.stringify(teacherData))
          localStorage.setItem('oxonom_pano_device_type', 'phone')
        }
        toast.success('Akıllı tahta başarıyla eşleştirildi! Pano açılıyor...')
        if (onSuccess) onSuccess()
        setTimeout(() => {
          router.push(`/pano?session=${encodeURIComponent(confirmedSessionId || '')}&device=phone`)
        }, 1200)
      } else {
        setErrorMessage(data.error || 'Eşleştirme başarısız oldu. Lütfen kodu kontrol edin.')
        toast.error(data.error || 'Eşleştirme başarısız.')
        setDigits(['', '', '', '', '', ''])
        inputRefs[0].current?.focus()
      }
    } catch (err) {
      console.error('[PairConfirm] Error:', err)
      setErrorMessage('Bağlantı hatası oluştu. Lütfen tekrar deneyin.')
      toast.error('Bağlantı hatası.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`w-full max-w-xl mx-auto ${isModal ? 'p-1' : 'p-4 sm:p-6'}`}>
      <div className="bg-white dark:bg-[#121215] rounded-3xl border border-gray-200/80 dark:border-white/10 shadow-xl overflow-hidden">
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-br from-indigo-900 via-slate-900 to-black text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center text-rose-400 shadow-inner shrink-0">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                <span>Tahtaya Bağlan</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  CANLI
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Sınıftaki akıllı tahtayı telefonunuzdan veya bilgisayarınızdan tek dokunuşla kontrol edin.
              </p>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="mt-5 grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <button
              type="button"
              onClick={() => setActiveTab('otp')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'otp'
                  ? 'bg-white text-slate-950 shadow-md scale-[1.02]'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <KeyRound className="w-4 h-4 text-indigo-600" />
              <span>6 Haneli Kod Gir</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('camera')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'camera'
                  ? 'bg-white text-slate-950 shadow-md scale-[1.02]'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Camera className="w-4 h-4 text-rose-500" />
              <span>QR Kodu Tara</span>
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="py-8 text-center flex flex-col items-center"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border-2 border-emerald-300 dark:border-emerald-800 shadow-lg shadow-emerald-500/20 animate-bounce">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1.5">
                  Tahtaya Bağlanıldı!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mb-6 leading-relaxed">
                  Akıllı tahta artık <strong>{user?.first_name || 'Öğretmen'}</strong> profiliniz ve sınıflarınızla senkronize çalışıyor.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSuccess(false)
                      setDigits(['', '', '', '', '', ''])
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-slate-700 dark:text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Başka Tahta Eşleştir
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      router.push(`/pano?session=${encodeURIComponent(sessionId || '')}&device=phone`)
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Pano'yu Aç</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ) : activeTab === 'otp' ? (
              <motion.div
                key="otp-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Tahtadaki 6 Haneli Kodu Girin
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Tahta ekranının sağında yer alan 6 haneli kodu sırasıyla tuşlayın.
                  </p>
                </div>

                {/* ANIMATED 6-DIGIT OTP INPUTS */}
                <div className="flex justify-center items-center gap-2 sm:gap-3" onPaste={handleDigitPaste}>
                  {/* First 3 Digits */}
                  <div className="flex gap-1.5 sm:gap-2">
                    {digits.slice(0, 3).map((digit, idx) => (
                      <motion.input
                        key={idx}
                        ref={inputRefs[idx]}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                        whileFocus={{ scale: 1.08 }}
                        className={`w-11 h-14 sm:w-13 sm:h-16 text-center text-2xl font-black rounded-2xl border-2 outline-none transition-all shadow-sm ${
                          errorMessage
                            ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-600'
                            : digit
                            ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/30 text-indigo-950 dark:text-white'
                            : 'border-gray-200 dark:border-white/15 bg-gray-50 dark:bg-black/30 text-slate-900 dark:text-white focus:border-indigo-500 focus:bg-white'
                        }`}
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>

                  <span className="text-xl font-bold text-gray-300 dark:text-gray-600 select-none">
                    -
                  </span>

                  {/* Last 3 Digits */}
                  <div className="flex gap-1.5 sm:gap-2">
                    {digits.slice(3, 6).map((digit, idx) => (
                      <motion.input
                        key={idx + 3}
                        ref={inputRefs[idx + 3]}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx + 3, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(idx + 3, e)}
                        whileFocus={{ scale: 1.08 }}
                        className={`w-11 h-14 sm:w-13 sm:h-16 text-center text-2xl font-black rounded-2xl border-2 outline-none transition-all shadow-sm ${
                          errorMessage
                            ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-600'
                            : digit
                            ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/30 text-indigo-950 dark:text-white'
                            : 'border-gray-200 dark:border-white/15 bg-gray-50 dark:bg-black/30 text-slate-900 dark:text-white focus:border-indigo-500 focus:bg-white'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {errorMessage && (
                  <p className="text-xs text-red-500 text-center font-semibold animate-shake">
                    {errorMessage}
                  </p>
                )}

                {/* Submit Action Button */}
                <button
                  type="button"
                  onClick={() => handleConfirmPair()}
                  disabled={isSubmitting || digits.some((d) => !d)}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Tahtaya Bağlan</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="camera-view"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col items-center text-center space-y-4"
              >
                <div className="text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Kamera ile QR Kodu Hizalayın
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Tahtadaki QR kodu kamera karesi içine getirdiğinizde anında bağlanacaksınız.
                  </p>
                </div>

                {/* CAMERA CONTAINER */}
                <div className="w-full max-w-[320px] aspect-square rounded-3xl overflow-hidden bg-black relative border-2 border-indigo-500/40 shadow-inner flex items-center justify-center">
                  <div id={scannerContainerId} className="w-full h-full" />

                  {/* Corner viewfinder marks */}
                  <span className="absolute top-3 left-3 w-6 h-6 border-t-3 border-l-3 border-rose-500 rounded-tl-lg pointer-events-none z-20" />
                  <span className="absolute top-3 right-3 w-6 h-6 border-t-3 border-r-3 border-rose-500 rounded-tr-lg pointer-events-none z-20" />
                  <span className="absolute bottom-3 left-3 w-6 h-6 border-b-3 border-l-3 border-rose-500 rounded-bl-lg pointer-events-none z-20" />
                  <span className="absolute bottom-3 right-3 w-6 h-6 border-b-3 border-r-3 border-rose-500 rounded-br-lg pointer-events-none z-20" />

                  {/* Scanning Laser Beam */}
                  <div
                    className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent pointer-events-none z-20"
                    style={{
                      animation: 'scan-beam 2s ease-in-out infinite',
                    }}
                  />
                </div>

                {cameraError && (
                  <p className="text-xs text-red-500 font-semibold max-w-xs leading-relaxed">
                    {cameraError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab('otp')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                >
                  Kod ile girmeyi tercih ediyorum &rarr;
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Info */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-black/30 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Uçtan Uca Şifreli Oturum</span>
          </div>
          <span>Oxonom Edu Pano OS</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan-beam {
          0%, 100% {
            top: 15%;
          }
          50% {
            top: 85%;
          }
        }
      `}</style>
    </div>
  )
}
