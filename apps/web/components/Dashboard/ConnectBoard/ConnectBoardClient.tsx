'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
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
  Maximize2,
  LogOut,
  GraduationCap,
  Clock,
  Settings,
  AlertTriangle,
  X,
  RefreshCw,
  Smartphone,
  Lock,
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

interface ActiveBoardItem {
  sessionId: string
  code: string
  status: string
  pairedAt?: number | string
  expiresAt?: number | string
  className?: string | null
  classId?: number | string | null
  teacherName?: string
  boardName?: string
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

  // Camera permission modal state (especially for iPhone Safari)
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState<boolean>(false)
  const [isRequestingPermission, setIsRequestingPermission] = useState<boolean>(false)

  // Active smart boards state
  const [activeBoards, setActiveBoards] = useState<ActiveBoardItem[]>([])
  const [isLoadingBoards, setIsLoadingBoards] = useState<boolean>(false)
  const [loggingOutSessionId, setLoggingOutSessionId] = useState<string | null>(null)
  const [lockingSessionId, setLockingSessionId] = useState<string | null>(null)

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

  // Handle direct camera permission request (executed from user click/touch)
  const requestCameraPermissionDirectly = async () => {
    setIsRequestingPermission(true)
    setCameraError(null)

    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setCameraError('Tarayıcınız kamera erişimini desteklemiyor.')
        setIsPermissionModalOpen(true)
        return
      }

      // Direct synchronous user-gesture getUserMedia call for iOS Safari
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
      })

      // If granted, release the test stream
      stream.getTracks().forEach((track) => track.stop())

      // Camera permission acquired
      setIsPermissionModalOpen(false)
      setCameraError(null)
      toast.success('Kamera izni verildi!')
      startCamera()
    } catch (err: any) {
      console.warn('[Camera] Direct permission error:', err)
      setIsCameraActive(false)
      setIsPermissionModalOpen(true)
      const isDenied = err?.name === 'NotAllowedError' || String(err).includes('Permission') || String(err).includes('NotAllowedError')
      setCameraError(
        isDenied
          ? 'Kamera erişim izni reddedildi. Lütfen iPhone ayarlarından kamera iznini açın.'
          : 'Kamera açılamadı. Lütfen izinleri kontrol edin.'
      )
    } finally {
      setIsRequestingPermission(false)
    }
  }

  // Handle switching to camera tab with direct user gesture
  const handleSwitchToCamera = async () => {
    // Blur any active input so mobile software keyboard is dismissed immediately
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    setActiveTab('camera')
    setCameraError(null)

    // Quick direct permission check to catch iOS Safari prompt early
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        })
        stream.getTracks().forEach((t) => t.stop())
        startCamera()
      } catch (err: any) {
        console.warn('[Camera] Tab switch permission check failed:', err)
        setCameraError('Kamera izni gerekiyor. Lütfen kamera erişimine izin verin.')
        setIsPermissionModalOpen(true)
        startCamera()
      }
    } else {
      startCamera()
    }
  }

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
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight)
          const qrboxSize = Math.max(160, Math.floor(minEdge * 0.72))
          return { width: qrboxSize, height: qrboxSize }
        },
        aspectRatio: 1.0,
      }

      try {
        await html5Qr.start(
          { facingMode: 'environment' },
          config,
          (decodedText: string) => {
            handleQrScanSuccess(decodedText)
          },
          () => {}
        )
      } catch (firstErr: any) {
        console.warn('[Camera] Standard facingMode failed, checking available cameras:', firstErr)
        // Fallback for iOS multi-camera or constraint issues
        const cameras = await Html5Qrcode.getCameras().catch(() => [])
        if (cameras && cameras.length > 0) {
          const backCam =
            cameras.find((c: any) =>
              c.label?.toLowerCase().includes('back') ||
              c.label?.toLowerCase().includes('arka') ||
              c.label?.toLowerCase().includes('environment')
            ) || cameras[cameras.length - 1]

          await html5Qr.start(
            backCam.id,
            config,
            (decodedText: string) => {
              handleQrScanSuccess(decodedText)
            },
            () => {}
          )
        } else {
          throw firstErr
        }
      }
    } catch (err: any) {
      console.error('[Camera] Start error:', err)
      const isDenied =
        err?.name === 'NotAllowedError' ||
        String(err).includes('NotAllowedError') ||
        String(err).includes('Permission')

      setCameraError(
        isDenied
          ? 'Kamera izni reddedildi. Lütfen iPhone ayarlarından izin verin.'
          : 'Kamera başlatılamadı. Lütfen kamera iznini kontrol edin veya 6 haneli kodu elle girin.'
      )
      setIsCameraActive(false)
      // Automatically open permission popup to guide teacher
      setIsPermissionModalOpen(true)
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

  // Active boards fetcher
  const fetchActiveBoards = useCallback(async () => {
    try {
      setIsLoadingBoards(true)
      const storedSessionId = typeof window !== 'undefined'
        ? (localStorage.getItem('oxonom_pano_active_session_id') || sessionStorage.getItem('oxonom_pano_active_session_id') || '')
        : ''

      const params = new URLSearchParams()
      if (user?.id) params.set('teacherId', String(user.id))
      if (user?.email) params.set('email', user.email)
      if (storedSessionId) params.set('sessionId', storedSessionId)
      if (sessionId) params.set('sessionId', sessionId)

      const res = await fetch(`/api/pano/pair/active-boards?${params.toString()}`)
      const data = await res.json()
      if (data.success && Array.isArray(data.boards)) {
        setActiveBoards(data.boards)
        if (data.boards.length === 0 && (storedSessionId || sessionId)) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('oxonom_pano_active_session_id')
            sessionStorage.removeItem('oxonom_pano_active_session_id')
          }
          setSessionId('')
        }
      }
    } catch (err) {
      console.error('[fetchActiveBoards] Error:', err)
    } finally {
      setIsLoadingBoards(false)
    }
  }, [user?.id, user?.email, sessionId])

  // Real-time synchronization & fast polling so Pano logout appears live on phone immediately
  useEffect(() => {
    fetchActiveBoards()
    const timer = setInterval(() => {
      fetchActiveBoards()
    }, 2500)

    const handleSync = () => {
      fetchActiveBoards()
    }
    window.addEventListener('oxonom_pano_sync', handleSync)
    window.addEventListener('storage', handleSync)

    return () => {
      clearInterval(timer)
      window.removeEventListener('oxonom_pano_sync', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [fetchActiveBoards])

  // Teacher board logout handler
  const handleLogoutBoard = async (sessId: string) => {
    if (!confirm('Bu akıllı tahtadaki oturumunuzu kapatmak istediğinize emin misiniz?')) {
      return
    }
    setLoggingOutSessionId(sessId)
    try {
      const res = await fetch('/api/pano/pair/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessId,
          role: 'phone',
          target: 'board_only',
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Akıllı tahta oturumu kapatıldı.')
        setActiveBoards((prev) => prev.filter((b) => b.sessionId !== sessId))
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('oxonom_pano_active_session_id')
          if (stored === sessId) {
            localStorage.removeItem('oxonom_pano_active_session_id')
            sessionStorage.removeItem('oxonom_pano_active_session_id')
          }
        }
      } else {
        toast.error(data.error || 'Çıkış yapılamadı.')
      }
    } catch (err) {
      console.error('[LogoutBoard] Error:', err)
      toast.error('Bağlantı hatası.')
    } finally {
      setLoggingOutSessionId(null)
      fetchActiveBoards()
    }
  }

  // Teacher board lock handler
  const handleLockBoard = async (sessId: string) => {
    setLockingSessionId(sessId)
    try {
      const phoneToken = typeof window !== 'undefined' ? localStorage.getItem('oxonom_pano_device_token') || '' : ''
      const res = await fetch('/api/remote/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessId,
          action: 'LOCK',
          token: phoneToken || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Akıllı tahta kilitlendi!')
      } else {
        toast.error(data.error || 'Tahta kilitlenemedi.')
      }
    } catch (err) {
      console.error('[LockBoard] Error:', err)
      toast.error('Bağlantı hatası.')
    } finally {
      setLockingSessionId(null)
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
      first_name: user?.first_name || 'Ebru',
      last_name: user?.last_name || 'TEKNECİ',
      email: user?.email || 'ogretmen@oxonom.com',
      role: 'teacher',
      token,
      refreshToken,
      orgSlug: org?.slug || 'oxonom',
      lock_pin: savedSettings?.pin || '1234',
      settings: savedSettings,
    }

    try {
      const existingDeviceToken = typeof window !== 'undefined' ? localStorage.getItem('oxonom_pano_device_token') || undefined : undefined
      const res = await fetch('/api/pano/pair/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          sessionId: sessId || sessionId || undefined,
          teacherData,
          deviceToken: existingDeviceToken,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setIsSuccess(true)
        const confirmedSessionId = data.session?.sessionId || sessId || sessionId
        const phoneToken = data.phoneDeviceToken || existingDeviceToken || ''
        setSessionId(confirmedSessionId)
        if (typeof window !== 'undefined') {
          if (confirmedSessionId) {
            sessionStorage.setItem('oxonom_pano_active_session_id', confirmedSessionId)
            localStorage.setItem('oxonom_pano_active_session_id', confirmedSessionId)
          }
          if (phoneToken) {
            sessionStorage.setItem('oxonom_pano_device_token', phoneToken)
            localStorage.setItem('oxonom_pano_device_token', phoneToken)
          }
          sessionStorage.setItem('oxonom_pano_device_type', 'phone')
          localStorage.setItem('oxonom_pano_device_type', 'phone')
          localStorage.setItem('oxonom_pano_paired_session', JSON.stringify(teacherData))
        }
        toast.success('Akıllı tahta başarıyla eşleştirildi! Tahtada sınıfınızı seçebilirsiniz.')
        if (onSuccess) onSuccess()
        fetchActiveBoards()
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
    <div className={`w-full mx-auto ${isModal ? 'p-0 space-y-3' : 'max-w-xl space-y-6 p-4 sm:p-6'}`}>
      {/* ACTIVE SMART BOARDS LIST */}
      {activeBoards.length > 0 && (
        <div className={`bg-white dark:bg-[#121215] border border-emerald-500/30 dark:border-emerald-500/20 shadow-md overflow-hidden ${isModal ? 'rounded-2xl' : 'rounded-3xl shadow-xl'}`}>
          <div className={`${isModal ? 'p-3' : 'p-4 sm:p-5'} bg-gradient-to-r from-emerald-950 via-slate-900 to-black text-white flex items-center justify-between`}>
            <div className="flex items-center gap-2.5">
              <div className={`${isModal ? 'w-8 h-8 rounded-xl' : 'w-10 h-10 rounded-2xl'} bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0`}>
                <Tv className={isModal ? 'w-4 h-4' : 'w-5 h-5'} />
              </div>
              <div>
                <h3 className={`${isModal ? 'text-xs sm:text-sm' : 'text-base sm:text-lg'} font-black tracking-tight flex items-center gap-1.5`}>
                  <span>Açık Akıllı Tahtalarım</span>
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {activeBoards.length} Aktif
                  </span>
                </h3>
                {!isModal && (
                  <p className="text-xs text-slate-300">
                    Şu an açık olan ve hesabınızla eşleşmiş tahtalar
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => fetchActiveBoards()}
              disabled={isLoadingBoards}
              className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Yenile"
            >
              <RotateCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLoadingBoards ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className={`${isModal ? 'p-2.5 sm:p-3 space-y-2' : 'p-4 sm:p-5 space-y-3'}`}>
            {activeBoards.map((board) => (
              <div
                key={board.sessionId}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex flex-col gap-3 transition-all hover:border-emerald-500/40"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {board.boardName || 'Oxonom Akıllı Tahta'}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-gray-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-bold">
                      Kod: {board.code}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                    Çevrimiçi
                  </span>
                </div>

                {/* Sınıf / Şube Bilgisi */}
                {board.className ? (
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200">
                    <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Giriş Yapılan Şube
                      </div>
                      <div className="text-sm font-black text-emerald-950 dark:text-emerald-100">
                        {board.className}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        Şube Durumu
                      </div>
                      <div className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                        Tahtada sınıf seçimi bekleniyor...
                      </div>
                    </div>
                  </div>
                )}

                {/* Tahtayı Kilitle & Tahtadan Çıkış Yap Butonları */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleLockBoard(board.sessionId)}
                    disabled={lockingSessionId === board.sessionId}
                    className="py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 active:bg-amber-200 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-900/50 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Açık olan oturumdaki tahtayı kilit ekranına al"
                  >
                    {lockingSessionId === board.sessionId ? (
                      <RotateCw className="w-4 h-4 animate-spin text-amber-600" />
                    ) : (
                      <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    )}
                    <span>Tahtayı Kilitle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLogoutBoard(board.sessionId)}
                    disabled={loggingOutSessionId === board.sessionId}
                    className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 active:bg-rose-200 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {loggingOutSessionId === board.sessionId ? (
                      <RotateCw className="w-4 h-4 animate-spin text-rose-600" />
                    ) : (
                      <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    )}
                    <span>Tahtadan Çıkış Yap</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONNECT TO BOARD CARD */}
      <div className={isModal ? 'w-full' : 'bg-white dark:bg-[#121215] rounded-3xl border border-gray-200/80 dark:border-white/10 shadow-xl overflow-hidden'}>
        {/* Mode Switch Tabs in Modal Mode */}
        {isModal ? (
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-gray-100 dark:bg-white/10 text-xs font-bold mb-3 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('otp')}
              className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'otp'
                  ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-xs font-black'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
              <span>6 Haneli Kod Gir</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchToCamera()}
              className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'camera'
                  ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-xs font-black'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-rose-500" />
              <span>QR Kodu Tara</span>
            </button>
          </div>
        ) : (
          /* Full Page Header Banner */
          <div className="p-6 bg-gradient-to-br from-indigo-900 via-slate-900 to-black text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center text-rose-400 shadow-inner shrink-0">
                <Tv className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                  <span>{activeBoards.length > 0 ? 'Yeni Bir Tahtaya Bağlan' : 'Tahtaya Bağlan'}</span>
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
                onClick={() => handleSwitchToCamera()}
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
        )}

        {/* Card Body */}
        <div className={isModal ? 'p-1' : 'p-6 sm:p-8'}>
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="py-4 flex flex-col items-center justify-center text-center"
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsSuccess(false)
                    setDigits(['', '', '', '', '', ''])
                    fetchActiveBoards()
                  }}
                  className="w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-lg shadow-emerald-600/20 border border-emerald-400/40 flex items-center justify-between gap-3 group transition-all cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shrink-0 shadow-inner">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm sm:text-base font-black tracking-tight flex items-center gap-2">
                        <span>Tahtaya Bağlanıldı</span>
                        <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-white/25 text-white">
                          Aktif
                        </span>
                      </div>
                      <p className="text-xs text-white/80 font-medium mt-0.5">
                        Oturum başarıyla senkronize edildi. Detayları görmek ve yönetmek için tıklayın.
                      </p>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors shrink-0">
                    <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              </motion.div>
            ) : activeTab === 'otp' ? (
              <motion.div
                key="otp-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={isModal ? 'space-y-4' : 'space-y-6'}
              >
                <div className="text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Tahtadaki 6 Haneli Kodu Girin
                  </span>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Tahta ekranının sağında yer alan 6 haneli kodu sırasıyla tuşlayın.
                  </p>
                </div>

                {/* ANIMATED 6-DIGIT OTP INPUTS */}
                <div className="flex justify-center items-center gap-1.5 sm:gap-3" onPaste={handleDigitPaste}>
                  {/* First 3 Digits */}
                  <div className="flex gap-1 sm:gap-2">
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
                        onFocus={(e) => {
                          e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' })
                        }}
                        whileFocus={{ scale: 1.05 }}
                        className={`w-10 h-13 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-xl sm:rounded-2xl border-2 outline-none transition-all shadow-sm ${
                          errorMessage
                            ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-600'
                            : digit
                            ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/30 text-indigo-950 dark:text-white'
                            : 'border-gray-200 dark:border-white/15 bg-gray-50 dark:bg-black/30 text-slate-900 dark:text-white focus:border-indigo-500 focus:bg-white'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="text-base sm:text-xl font-bold text-gray-300 dark:text-gray-600 select-none">
                    -
                  </span>

                  {/* Last 3 Digits */}
                  <div className="flex gap-1 sm:gap-2">
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
                        onFocus={(e) => {
                          e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' })
                        }}
                        whileFocus={{ scale: 1.05 }}
                        className={`w-10 h-13 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-xl sm:rounded-2xl border-2 outline-none transition-all shadow-sm ${
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
                  className="w-full py-3 px-5 sm:py-3.5 sm:px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
                className={isModal ? 'flex flex-col items-center text-center space-y-3' : 'flex flex-col items-center text-center space-y-4'}
              >
                <div className="text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Kamera ile QR Kodu Hizalayın
                  </span>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Tahtadaki QR kodu kamera karesi içine getirdiğinizde anında bağlanacaksınız.
                  </p>
                </div>

                {/* CAMERA CONTAINER */}
                <div className="w-full max-w-[240px] sm:max-w-[300px] aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-black relative border-2 border-indigo-500/40 shadow-inner flex items-center justify-center">
                  <div id={scannerContainerId} className="w-full h-full" />

                  {/* Corner viewfinder marks */}
                  <span className="absolute top-3 left-3 w-6 h-6 border-t-3 border-l-3 border-rose-500 rounded-tl-lg pointer-events-none z-20" />
                  <span className="absolute top-3 right-3 w-6 h-6 border-t-3 border-r-3 border-rose-500 rounded-tr-lg pointer-events-none z-20" />
                  <span className="absolute bottom-3 left-3 w-6 h-6 border-b-3 border-l-3 border-rose-500 rounded-bl-lg pointer-events-none z-20" />
                  <span className="absolute bottom-3 right-3 w-6 h-6 border-b-3 border-r-3 border-rose-500 rounded-br-lg pointer-events-none z-20" />

                  {/* Scanning Laser Beam (only when active and no error) */}
                  {isCameraActive && !cameraError && (
                    <div
                      className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent pointer-events-none z-20"
                      style={{
                        animation: 'scan-beam 2s ease-in-out infinite',
                      }}
                    />
                  )}

                  {/* Camera Error / Permission Overlay */}
                  {cameraError && (
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-30 p-5 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-2.5">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-white mb-1">
                        Kamera İzni Bekleniyor
                      </p>
                      <p className="text-[11px] text-slate-300 max-w-[230px] mb-4 leading-relaxed">
                        {cameraError}
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsPermissionModalOpen(true)}
                        className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>İzinleri Yönet / Aç</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Camera Permission Actions */}
                {cameraError ? (
                  <div className="flex flex-col items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => requestCameraPermissionDirectly()}
                      disabled={isRequestingPermission}
                      className="py-2.5 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isRequestingPermission ? (
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Camera className="w-3.5 h-3.5" />
                      )}
                      <span>İzni Doğrudan İste ve Tekrar Dene</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('otp')}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:underline font-semibold"
                    >
                      Kod ile girmeyi tercih ediyorum &rarr;
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTab('otp')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                  >
                    Kod ile girmeyi tercih ediyorum &rarr;
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Info */}
        {!isModal ? (
          <div className="px-6 py-4 bg-gray-50 dark:bg-black/30 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Uçtan Uca Şifreli Oturum</span>
            </div>
            <span>Oxonom Edu Pano OS</span>
          </div>
        ) : (
          <div className="pt-2 pb-1 flex items-center justify-center gap-1.5 text-[10px] text-gray-400 dark:text-gray-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Uçtan Uca Şifreli Oturum Eşleşmesi</span>
          </div>
        )}
      </div>

      {/* IPHONE / SAFARI CAMERA PERMISSION MODAL */}
      <AnimatePresence>
        {isPermissionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-white dark:bg-[#18181b] rounded-t-3xl sm:rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden p-6 text-slate-900 dark:text-white relative"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsPermissionModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon & Title */}
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">
                    Kamera İzni Gerekli
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tahtadaki QR kodu tarayabilmek için kameraya izin verin.
                  </p>
                </div>
              </div>

              {/* Instructions Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-3 mb-5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Smartphone className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>iPhone (Safari) İçin İzin Adımları:</span>
                </div>
                <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-decimal list-inside pl-1 leading-relaxed">
                  <li>
                    Safari ekranının altındaki veya üstündeki <strong>aA</strong> (veya 🔒 kilit) simgesine dokunun.
                  </li>
                  <li>
                    Menüden <strong>Web Sitesi Ayarları</strong>'nı seçin.
                  </li>
                  <li>
                    <strong>Kamera</strong> seçeneğini <strong>İzin Ver</strong> (veya Sor) yapın.
                  </li>
                  <li>
                    Aşağıdaki butona dokunun veya sayfayı yenileyin.
                  </li>
                </ol>
              </div>

              {/* Actions */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => requestCameraPermissionDirectly()}
                  disabled={isRequestingPermission}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isRequestingPermission ? (
                    <RotateCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                  <span>İzni Doğrudan İste ve Kamerayı Aç</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') window.location.reload()
                    }}
                    className="py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sayfayı Yenile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsPermissionModalOpen(false)
                      setActiveTab('otp')
                    }}
                    className="py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Kod ile Gir</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
