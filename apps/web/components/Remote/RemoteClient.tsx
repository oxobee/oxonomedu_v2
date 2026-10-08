'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import screenfull from 'screenfull'
import toast from 'react-hot-toast'
import {
  RemoteConnectionState,
  RemoteActionType,
  RemoteShortcutItem,
  DEFAULT_REMOTE_SHORTCUTS,
} from '@/lib/remote/protocol'
import RemoteStatusBar from './RemoteStatusBar'
import RemotePad from './RemotePad'
import WhiteboardToolbar from './WhiteboardToolbar'
import RemoteShortcuts from './RemoteShortcuts'
import {
  Tv,
  QrCode,
  AlertCircle,
  RefreshCw,
  School,
  Search,
  ArrowRight,
  Sparkles,
  Lock,
} from 'lucide-react'
import { ALL_CLASSROOMS } from '@services/demo/schoolDirectory'

export default function RemoteClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Session & Auth
  const [sessionId, setSessionId] = useState<string>('')
  const [token, setToken] = useState<string>('')

  // Connection & Board State
  const [connectionStatus, setConnectionStatus] = useState<RemoteConnectionState>('connecting')
  const [boardName, setBoardName] = useState<string>('Oxonom Akıllı Tahta')
  const [className, setClassName] = useState<string>('')
  const [isLocked, setIsLocked] = useState<boolean>(false)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)

  // Class Selection State (User Rule: "sınıf seçmeden kumanda aktif olmasın")
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [selectedClass, setSelectedClass] = useState<any | null>(null)
  const [classrooms, setClassrooms] = useState<any[]>(ALL_CLASSROOMS)
  const [classSearch, setClassSearch] = useState<string>('')

  // Shortcuts
  const [shortcuts, setShortcuts] = useState<RemoteShortcutItem[]>(DEFAULT_REMOTE_SHORTCUTS)

  // SSE EventSource reference
  const sseRef = useRef<EventSource | null>(null)

  // 1. Initial credential resolution from URL params or storage
  useEffect(() => {
    let resolvedSession = searchParams.get('session') || searchParams.get('sessionId') || ''
    let resolvedToken = searchParams.get('token') || searchParams.get('deviceToken') || ''

    if (typeof window !== 'undefined') {
      if (!resolvedSession) {
        resolvedSession =
          sessionStorage.getItem('oxonom_pano_active_session_id') ||
          localStorage.getItem('oxonom_pano_active_session_id') ||
          ''
      }
      if (!resolvedToken) {
        resolvedToken =
          sessionStorage.getItem('oxonom_pano_device_token') ||
          localStorage.getItem('oxonom_pano_device_token') ||
          ''
      }

      // Persist resolved credentials
      if (resolvedSession) {
        sessionStorage.setItem('oxonom_pano_active_session_id', resolvedSession)
        localStorage.setItem('oxonom_pano_active_session_id', resolvedSession)
      }
      if (resolvedToken) {
        sessionStorage.setItem('oxonom_pano_device_token', resolvedToken)
        localStorage.setItem('oxonom_pano_device_token', resolvedToken)
      }
    }

    setSessionId(resolvedSession)
    setToken(resolvedToken)

    if (!resolvedSession) {
      setConnectionStatus('disconnected')
    } else {
      // Query initial board state and teacher classrooms
      const fetchInitialState = async () => {
        try {
          const res = await fetch(
            `/api/pano/pair/state?sessionId=${encodeURIComponent(resolvedSession)}${
              resolvedToken ? `&token=${encodeURIComponent(resolvedToken)}` : ''
            }`
          )
          if (res.ok) {
            const data = await res.json()
            if (data.teacherData?.classrooms && data.teacherData.classrooms.length > 0) {
              setClassrooms(data.teacherData.classrooms)
            }
            if (data.sharedState?.selectedClassId) {
              setSelectedClassId(data.sharedState.selectedClassId)
              setSelectedClass(data.sharedState.selectedClass || null)
              if (data.sharedState.selectedClass?.name) {
                setClassName(data.sharedState.selectedClass.name)
              }
            }
          }
        } catch (_) {}
      }
      fetchInitialState()
    }
  }, [searchParams])

  // 2. Fullscreen change listener
  useEffect(() => {
    if (screenfull.isEnabled) {
      const handleFsChange = () => {
        setIsFullscreen(screenfull.isFullscreen)
      }
      screenfull.on('change', handleFsChange)
      return () => {
        screenfull.off('change', handleFsChange)
      }
    }
  }, [])

  const handleToggleFullscreen = () => {
    if (screenfull.isEnabled) {
      try {
        screenfull.toggle()
      } catch (err) {
        console.warn('Fullscreen toggle failed:', err)
      }
    } else {
      toast('Cihazınız tam ekran API desteklemiyor.')
    }
  }

  // 3. Load shortcuts from server
  useEffect(() => {
    if (!sessionId) return
    const fetchShortcuts = async () => {
      try {
        const url = `/api/remote/shortcuts?sessionId=${encodeURIComponent(sessionId)}${
          token ? `&token=${encodeURIComponent(token)}` : ''
        }`
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.shortcuts) && data.shortcuts.length > 0) {
            setShortcuts(data.shortcuts)
          }
        }
      } catch (err) {
        console.warn('Failed to fetch shortcuts:', err)
      }
    }
    fetchShortcuts()
  }, [sessionId, token])

  // 4. SSE Real-time connection & Fast Polling backup to Smart Board stream
  useEffect(() => {
    if (!sessionId) return

    let isMounted = true
    let lastPollTime = Date.now() - 3000

    const connectSSE = () => {
      if (sseRef.current) {
        sseRef.current.close()
        sseRef.current = null
      }

      setConnectionStatus('connecting')

      const streamUrl = `/api/pano/pair/stream?sessionId=${encodeURIComponent(sessionId)}${
        token ? `&token=${encodeURIComponent(token)}` : ''
      }`
      const sse = new EventSource(streamUrl)
      sseRef.current = sse

      sse.onopen = () => {
        if (!isMounted) return
        setConnectionStatus('connected')
      }

      sse.addEventListener('remote_connected', () => {
        if (!isMounted) return
        setConnectionStatus('connected')
      })

      sse.addEventListener('paired', (e: MessageEvent) => {
        if (!isMounted) return
        setConnectionStatus('connected')
        try {
          const data = JSON.parse(e.data)
          if (data.first_name || data.last_name) {
            setBoardName(`${data.first_name} ${data.last_name}`.trim())
          }
          if (Array.isArray(data.classrooms) && data.classrooms.length > 0) {
            setClassrooms(data.classrooms)
          }
          if (data.selectedClassId) {
            setSelectedClassId(data.selectedClassId)
            const matched = data.classrooms?.find((c: any) => c.id === data.selectedClassId)
            if (matched) {
              setSelectedClass(matched)
              setClassName(matched.name)
            }
          }
          if (data.orgSlug && !className) {
            setClassName(data.orgSlug.toUpperCase())
          }
        } catch (_) {}
      })

      sse.addEventListener('state', (e: MessageEvent) => {
        if (!isMounted) return
        try {
          const stateData = JSON.parse(e.data)
          if (typeof stateData.isLocked === 'boolean') {
            setIsLocked(stateData.isLocked)
          }
          if (stateData.selectedClassId !== undefined) {
            setSelectedClassId(stateData.selectedClassId)
            setSelectedClass(stateData.selectedClass || null)
            if (stateData.selectedClass?.name) {
              setClassName(stateData.selectedClass.name)
            } else if (!stateData.selectedClassId) {
              setClassName('')
            }
          } else if (stateData.activeClassName) {
            setClassName(stateData.activeClassName)
          }
        } catch (_) {}
      })

      sse.addEventListener('session_closed', () => {
        if (!isMounted) return
        setConnectionStatus('ended')
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([100, 50, 100])
          } catch (_) {}
        }
        toast.error('Akıllı tahta oturumu sonlandırıldı.')
      })

      sse.onerror = () => {
        if (!isMounted) return
        setConnectionStatus('reconnecting')
      }
    }

    // Fast HTTP Polling backup for serverless cross-instance sync
    const pollInterval = setInterval(async () => {
      if (!isMounted || !sessionId) return
      try {
        const res = await fetch(
          `/api/remote/pending?sessionId=${encodeURIComponent(sessionId)}${
            token ? `&token=${encodeURIComponent(token)}` : ''
          }&since=${lastPollTime}`
        )
        if (res.ok) {
          const data = await res.json()
          if (data.serverTime) {
            lastPollTime = Math.max(lastPollTime, data.serverTime - 1000)
          }
          if (data.status === 'paired') {
            setConnectionStatus('connected')
          }
          if (data.sharedState) {
            if (data.sharedState.selectedClassId !== undefined) {
              setSelectedClassId(data.sharedState.selectedClassId)
              setSelectedClass(data.sharedState.selectedClass || null)
              if (data.sharedState.selectedClass?.name) {
                setClassName(data.sharedState.selectedClass.name)
              } else if (!data.sharedState.selectedClassId) {
                setClassName('')
              }
            }
            if (typeof data.sharedState.isLocked === 'boolean') {
              setIsLocked(data.sharedState.isLocked)
            }
          }
        }
      } catch (_) {}
    }, 400)

    connectSSE()

    return () => {
      isMounted = false
      clearInterval(pollInterval)
      if (sseRef.current) {
        sseRef.current.close()
        sseRef.current = null
      }
    }
  }, [sessionId, token])

  // 5. Send Action to Board (<100ms via Redis/MongoDB)
  const handleAction = useCallback(
    async (action: RemoteActionType, payload: any = {}) => {
      if (!sessionId) {
        toast.error('Aktif tahta bağlantısı yok.')
        return
      }

      // Optimistic lock toggle
      if (action === 'LOCK') setIsLocked(true)
      if (action === 'UNLOCK') setIsLocked(false)

      try {
        const actionId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
        const res = await fetch('/api/remote/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: actionId,
            sessionId,
            token,
            action,
            payload,
          }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          if (res.status === 410) {
            setConnectionStatus('ended')
            toast.error('Tahta oturumu sonlandı.')
          } else {
            toast.error(data.error || 'Komut iletilemedi.')
          }
        }
      } catch (err) {
        console.error('Remote action dispatch error:', err)
        toast.error('İletişim hatası oluştu.')
      }
    },
    [sessionId, token]
  )

  // 6. Classroom Selection Handler (User Rule: "sınıf seçmeden kumanda aktif olmasın")
  const handleSelectClass = async (cls: any) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40])
      } catch (_) {}
    }
    setSelectedClassId(cls.id)
    setSelectedClass(cls)
    setClassName(cls.name)
    await handleAction('SELECT_CLASS', { classId: cls.id, className: cls.name })
    toast.success(`${cls.name} seçildi! Kumanda aktif.`)
  }

  const handleChangeClass = async () => {
    setSelectedClassId(null)
    setSelectedClass(null)
    setClassName('')
    await handleAction('SELECT_CLASS', { classId: null })
    toast('Lütfen yeni sınıfınızı seçin.', { icon: '🏫' })
  }

  // 7. Save customized shortcuts
  const handleSaveShortcuts = async (newShortcuts: RemoteShortcutItem[]) => {
    setShortcuts(newShortcuts)
    if (!sessionId) return

    try {
      const res = await fetch('/api/remote/shortcuts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          token,
          shortcuts: newShortcuts,
        }),
      })

      if (res.ok) {
        toast.success('Kısayollar güncellendi.')
      } else {
        toast.error('Kısayollar kaydedilemedi.')
      }
    } catch (err) {
      console.error('Save shortcuts error:', err)
      toast.error('Kaydetme hatası.')
    }
  }

  // 8. Handle Disconnect
  const handleDisconnect = () => {
    if (confirm('Kumanda bağlantısını sonlandırmak istiyor musunuz?')) {
      if (sseRef.current) {
        sseRef.current.close()
      }
      setConnectionStatus('disconnected')
      router.push('/dash/connect-board')
    }
  }

  // Filtered classrooms for mobile selection
  const availableClassrooms = classrooms && classrooms.length > 0 ? classrooms : ALL_CLASSROOMS
  const filteredClassrooms = useMemo(() => {
    if (!classSearch.trim()) return availableClassrooms
    const q = classSearch.toLowerCase().trim()
    return availableClassrooms.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.gradeLevel || c.grade_level || '').toLowerCase().includes(q) ||
        (c.teacherName || c.teacher_name || '').toLowerCase().includes(q)
    )
  }, [availableClassrooms, classSearch])

  // Empty / Disconnected State View
  if (!sessionId || connectionStatus === 'disconnected') {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-400 mb-6 shadow-2xl">
          <Tv className="w-10 h-10" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-2">
          Tahta Bağlantısı Bulunamadı
        </h1>
        <p className="text-sm text-slate-400 max-w-sm mb-8 leading-relaxed">
          Akıllı tahtayı telefonunuzla yönetmek için tahtada görüntülenen QR kodu okutun veya 6 haneli kodu girin.
        </p>

        <button
          type="button"
          onClick={() => router.push('/dash/connect-board')}
          className="w-full max-w-xs py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-950/50 cursor-pointer transition-all"
        >
          <QrCode className="w-5 h-5" />
          <span>QR Kodu Tara / Bağlan</span>
        </button>
      </main>
    )
  }

  // Session Ended View
  if (connectionStatus === 'ended') {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-20 h-20 rounded-3xl bg-rose-950/40 border border-rose-900/60 flex items-center justify-center text-rose-400 mb-6 shadow-2xl">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-2">
          Tahta Oturumu Sonlandırıldı
        </h1>
        <p className="text-sm text-slate-400 max-w-sm mb-8 leading-relaxed">
          Akıllı tahtada oturum kapatıldı veya süre doldu. Yeni bir oturum başlatmak için QR kodu tekrar okutun.
        </p>

        <button
          type="button"
          onClick={() => router.push('/dash/connect-board')}
          className="w-full max-w-xs py-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg border border-slate-700 cursor-pointer transition-all"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Yeniden Eşleştir</span>
        </button>
      </main>
    )
  }

  // CRITICAL USER RULE: "sınıf seçmeden kumanda aktif olmasın"
  // If no classroom has been selected, keep remote controls inactive and display class selection!
  const isClassSelected = Boolean(selectedClassId || selectedClass)

  if (!isClassSelected) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex flex-col pb-safe select-none">
        {/* Top Header & Status Bar */}
        <RemoteStatusBar
          status={connectionStatus}
          boardName={boardName}
          className="Sınıf Seçimi Bekleniyor"
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          onDisconnect={handleDisconnect}
        />

        <div className="flex-1 max-w-md w-full mx-auto p-4 flex flex-col space-y-4 overflow-y-auto">
          {/* Header Card */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-inner">
              <School className="w-7 h-7" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Tahta Bağlandı • Sınıf Seçimi Zorunlu</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Lütfen Sınıfınızı Seçin
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              Kumandanın aktif olması ve akıllı tahta araçlarını kontrol edebilmeniz için derse başlayacağınız şubeye dokunun.
            </p>
          </div>

          {/* Search / Filter Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Şube ara (örn: 8-A, 7-B)..."
              value={classSearch}
              onChange={(e) => setClassSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Classroom Cards List */}
          <div className="space-y-2.5 pb-6">
            {filteredClassrooms.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelectClass(c)}
                className="w-full p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 active:scale-[0.98] border border-slate-800 hover:border-indigo-500/50 flex items-center justify-between text-left transition-all cursor-pointer group shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-black text-base flex items-center justify-center shadow-md shrink-0">
                    {c.name.split(' ')[0]}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white group-hover:text-indigo-400 transition-colors">
                      {c.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                      {c.gradeLevel || c.grade_level || 'Sınıf'} • {c.teacherName || c.teacher_name || 'Öğretmen'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs shrink-0">
                  <span className="hidden sm:inline">Derse Başla</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    )
  }

  // Active Remote Control View (Class Selected & Fully Active)
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col pb-safe select-none">
      {/* Top Header & Status Bar with Change Class option */}
      <RemoteStatusBar
        status={connectionStatus}
        boardName={boardName}
        className={className || selectedClass?.name || 'Sınıf'}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onDisconnect={handleDisconnect}
        onChangeClass={handleChangeClass}
      />

      {/* Main Remote Controls — Active and Synchronized */}
      <div className="flex-1 max-w-md w-full mx-auto p-4 space-y-4 overflow-y-auto">
        {/* Navigation Pad */}
        <RemotePad
          isLocked={isLocked}
          onAction={handleAction}
          disabled={connectionStatus !== 'connected'}
        />

        {/* Whiteboard / Presentation Controls */}
        <WhiteboardToolbar
          onAction={handleAction}
          disabled={connectionStatus !== 'connected'}
        />

        {/* Customizable App Shortcuts */}
        <RemoteShortcuts
          shortcuts={shortcuts}
          onAction={handleAction}
          onSaveShortcuts={handleSaveShortcuts}
          disabled={connectionStatus !== 'connected'}
        />
      </div>
    </main>
  )
}
