'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
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
import { Tv, QrCode, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'

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
        const url = `/api/remote/shortcuts?sessionId=${encodeURIComponent(sessionId)}${token ? `&token=${encodeURIComponent(token)}` : ''}`
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

  // 4. SSE Real-time connection to Smart Board stream
  useEffect(() => {
    if (!sessionId) return

    let isMounted = true
    const connectSSE = () => {
      if (sseRef.current) {
        sseRef.current.close()
        sseRef.current = null
      }

      setConnectionStatus('connecting')

      const streamUrl = `/api/pano/pair/stream?sessionId=${encodeURIComponent(sessionId)}${token ? `&token=${encodeURIComponent(token)}` : ''}`
      const sse = new EventSource(streamUrl)
      sseRef.current = sse

      sse.onopen = () => {
        if (!isMounted) return
        setConnectionStatus('connected')
      }

      sse.addEventListener('paired', (e: MessageEvent) => {
        if (!isMounted) return
        setConnectionStatus('connected')
        try {
          const data = JSON.parse(e.data)
          if (data.first_name || data.last_name) {
            setBoardName(`${data.first_name} ${data.last_name}`)
          }
          if (data.orgSlug) {
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
          if (stateData.activeClassName) {
            setClassName(stateData.activeClassName)
          }
        } catch (_) {}
      })

      sse.addEventListener('session_closed', () => {
        if (!isMounted) return
        setConnectionStatus('ended')
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try { navigator.vibrate([100, 50, 100]) } catch (_) {}
        }
        toast.error('Akıllı tahta oturumu sonlandırıldı.')
      })

      sse.onerror = () => {
        if (!isMounted) return
        setConnectionStatus('reconnecting')
      }
    }

    connectSSE()

    return () => {
      isMounted = false
      if (sseRef.current) {
        sseRef.current.close()
        sseRef.current = null
      }
    }
  }, [sessionId, token])

  // 5. Send Action to Board (<100ms via Redis/SSE)
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

  // 6. Save customized shortcuts
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

  // 7. Handle Disconnect
  const handleDisconnect = () => {
    if (confirm('Kumanda bağlantısını sonlandırmak istiyor musunuz?')) {
      if (sseRef.current) {
        sseRef.current.close()
      }
      setConnectionStatus('disconnected')
      router.push('/dash/connect-board')
    }
  }

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
        <p className="text-sm text-slate-400 max-w-sm mb-8">
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
        <p className="text-sm text-slate-400 max-w-sm mb-8">
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

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col pb-safe select-none">
      {/* Top Header & Status Bar */}
      <RemoteStatusBar
        status={connectionStatus}
        boardName={boardName}
        className={className}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onDisconnect={handleDisconnect}
      />

      {/* Main Remote Controls */}
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
