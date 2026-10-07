'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  TeacherPairData,
  PanoSharedState,
  PanoAction,
  WindowStateItem,
} from '@/lib/pano-pair/store'

export interface AppItem {
  id: string
  type: 'widget' | 'app'
  widgetType?: string
  title: string
  icon?: string
  color?: string
  iconColor?: string
  badge?: string
  path?: string
}

export interface WindowState extends WindowStateItem {
  app: AppItem
}

export interface ClassroomItem {
  id: number
  name: string
  gradeLevel: string
  studentCount: number
  boardCount: number
  attendance: string
  teacherName: string
  subject: string
}

export type PanoConnectionStatus = 'connected' | 'connecting' | 'disconnected'

export interface UsePanoSyncOptions {
  activeSessionId: string | null
  classrooms: ClassroomItem[]
  defaultClassrooms?: ClassroomItem[]
  onSessionClosed?: () => void
  /** Called with the server-side (single source of truth) class list for this session */
  onClassrooms?: (classrooms: ClassroomItem[]) => void
}

export function usePanoSync({
  activeSessionId,
  classrooms,
  defaultClassrooms = [],
  onSessionClosed,
  onClassrooms,
}: UsePanoSyncOptions) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 1. Device ID & Token (Unique client tokens for echo loop prevention and authentication)
  // Requirement 6: Keep deviceId and role in sessionStorage (per-tab) so multiple tabs never conflict or echo
  const [deviceId] = useState<string>(() => {
    if (typeof window === 'undefined') return 'init'
    let id = sessionStorage.getItem('oxonom_pano_device_id')
    if (!id) {
      const qDevice = searchParams?.get('device')
      const prefix = qDevice === 'phone' ? 'phone' : 'board'
      id = `${prefix}-${Math.random().toString(36).substring(2, 9)}`
      sessionStorage.setItem('oxonom_pano_device_id', id)
    }
    return id
  })

  // FIX: token read state + always read fresh right before each request.
  const readStoredToken = () => {
    if (typeof window === 'undefined') return ''
    return sessionStorage.getItem('oxonom_pano_device_token') || localStorage.getItem('oxonom_pano_device_token') || ''
  }

  const [deviceToken, setDeviceToken] = useState<string>(() => {
    if (typeof window === 'undefined') return ''
    const qToken = searchParams?.get('token')
    if (qToken) {
      sessionStorage.setItem('oxonom_pano_device_token', qToken)
      localStorage.setItem('oxonom_pano_device_token', qToken)
      return qToken
    }
    return readStoredToken()
  })

  const getToken = useCallback(() => readStoredToken() || deviceToken, [deviceToken])

  // 2. Device Role (Phone vs Board): Strictly based on ?device=phone|board or pairing role (in sessionStorage)
  const isPhone = useMemo(() => {
    if (typeof window === 'undefined') return false
    const qDevice = searchParams?.get('device')
    if (qDevice === 'phone') {
      sessionStorage.setItem('oxonom_pano_device_type', 'phone')
      return true
    }
    if (qDevice === 'board') {
      sessionStorage.setItem('oxonom_pano_device_type', 'board')
      return false
    }
    const savedType = sessionStorage.getItem('oxonom_pano_device_type')
    if (savedType === 'phone') return true
    if (savedType === 'board') return false
    return false
  }, [searchParams])

  // 3. Core Shared State
  const [selectedClass, setSelectedClass] = useState<ClassroomItem | null>(null)
  const [openWindows, setOpenWindows] = useState<WindowState[]>([])
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('oxonom_pano_is_locked') === 'true'
    }
    return false
  })

  // 4. Modals State
  const [isClassModalOpen, setIsClassModalOpen] = useState(false)
  const [isNewBoardModalOpen, setIsNewBoardModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // 5. Version Tracking for Strict Monotonicity & Connection Status
  const lastAppliedVersionRef = useRef<number>(0)
  const sseConnectedRef = useRef<boolean>(false)
  const [connectionStatus, setConnectionStatus] = useState<PanoConnectionStatus>('connecting')

  // Helper to find classroom in dynamic list or fallback defaults
  const findClassroom = useCallback((classId: number | null): ClassroomItem | null => {
    if (classId === null) return null
    const list = classrooms && classrooms.length > 0 ? classrooms : defaultClassrooms
    return list.find(c => c.id === classId) || defaultClassrooms.find(c => c.id === classId) || null
  }, [classrooms, defaultClassrooms])

  // ---- Stable refs: the sync effect must NOT depend on changing callbacks (that caused an infinite
  // resync/reconnect loop: onClassrooms -> new array -> new findClassroom -> new handler -> effect re-run).
  const applyRemoteRef = useRef<(st: PanoSharedState, force?: boolean) => void>(() => {})
  const onClassroomsRef = useRef(onClassrooms)
  onClassroomsRef.current = onClassrooms
  const onSessionClosedRef = useRef(onSessionClosed)
  onSessionClosedRef.current = onSessionClosed
  const getTokenRef = useRef(getToken)
  getTokenRef.current = getToken
  const lastClassroomsSigRef = useRef<string>('')

  // Only push the class list up when it really changed (avoids needless re-renders)
  const pushClassrooms = useCallback((list: any) => {
    if (!Array.isArray(list) || list.length === 0) return
    const sig = list.map((c: any) => `${c.id}:${c.name}`).join('|')
    if (sig === lastClassroomsSigRef.current) return
    lastClassroomsSigRef.current = sig
    onClassroomsRef.current?.(list)
  }, [])

  // Pull full state (+ class list) from the server and force-apply it (initial sync / rollback)
  const resyncFromServer = useCallback(async () => {
    if (!activeSessionId) return
    try {
      const token = getTokenRef.current()
      const headers: Record<string, string> = {}
      if (token) headers['x-device-token'] = token

      const res = await fetch(
        `/api/pano/pair/state?sessionId=${encodeURIComponent(activeSessionId)}`,
        { headers }
      )
      if (!res.ok) {
        if (res.status === 403 || res.status === 410) {
          onSessionClosedRef.current?.()
        }
        return
      }
      const data = await res.json()
      pushClassrooms(data.classrooms)
      if (data.state) {
        applyRemoteRef.current(data.state, true)
        setConnectionStatus('connected')
      }
    } catch (_) {}
  }, [activeSessionId, pushClassrooms])

  // 6. Action-based Dispatch with Optimistic Local Update & Atomic Monotonic Sync
  const dispatch = useCallback(async (action: PanoAction) => {
    if (!activeSessionId) return

    // Optimistic Local Update (< 1ms immediate responsiveness)
    switch (action.type) {
      case 'SELECT_CLASS': {
        if (action.classId === null) {
          setSelectedClass(null)
          if (typeof window !== 'undefined') localStorage.removeItem('oxonom_pano_selected_class_id')
        } else {
          const found = (action as any).class || findClassroom(action.classId)
          if (found) {
            setSelectedClass(found)
            if (typeof window !== 'undefined') localStorage.setItem('oxonom_pano_selected_class_id', String(found.id))
          }
        }
        setIsClassModalOpen(false)
        break
      }
      case 'OPEN_APP': {
        if (!selectedClass) {
          toast.error('Lütfen önce bir sınıf seçiniz.')
          return
        }
        setOpenWindows(prev => {
          const existingIdx = prev.findIndex(w => w.app.id === action.app.id)
          if (existingIdx >= 0) {
            return prev.map((w, idx) =>
              idx === existingIdx
                ? { ...w, currentPath: action.app.path || w.currentPath || w.app.path || '/dash' }
                : w
            )
          }
          return [...prev, { app: action.app, isMaximized: true, iframeKey: 1, currentPath: action.app.path || '/dash' }]
        })
        setActiveWindowId(action.app.id)
        setIsClassModalOpen(false)
        setIsNewBoardModalOpen(false)
        setIsSettingsOpen(false)
        break
      }
      case 'CLOSE_WINDOW': {
        setOpenWindows(prev => {
          const remaining = prev.filter(w => w.app.id !== action.windowId)
          setActiveWindowId(curr => (curr === action.windowId ? (remaining.length > 0 ? remaining[remaining.length - 1].app.id : null) : curr))
          return remaining
        })
        break
      }
      case 'TOGGLE_MAXIMIZE': {
        setOpenWindows(prev => prev.map(w => w.app.id === action.windowId ? { ...w, isMaximized: !w.isMaximized } : w))
        break
      }
      case 'RELOAD_WINDOW': {
        setOpenWindows(prev => prev.map(w => w.app.id === action.windowId ? { ...w, iframeKey: (w.iframeKey || 1) + 1 } : w))
        break
      }
      case 'FOCUS_WINDOW': {
        setActiveWindowId(action.windowId)
        break
      }
      case 'NAVIGATE': {
        setOpenWindows(prev => prev.map(w => w.app.id === action.windowId ? { ...w, currentPath: action.path } : w))
        break
      }
      case 'OPEN_MODAL': {
        setIsClassModalOpen(action.modalId === 'class_selection')
        setIsNewBoardModalOpen(action.modalId === 'new_board')
        setIsSettingsOpen(action.modalId === 'settings')
        break
      }
      case 'CLOSE_MODAL': {
        setIsClassModalOpen(false)
        setIsNewBoardModalOpen(false)
        setIsSettingsOpen(false)
        break
      }
      case 'LOCK': {
        setIsLocked(true)
        if (typeof window !== 'undefined') localStorage.setItem('oxonom_pano_is_locked', 'true')
        break
      }
      case 'UNLOCK': {
        setIsLocked(false)
        if (typeof window !== 'undefined') localStorage.removeItem('oxonom_pano_is_locked')
        break
      }
      case 'GO_HOME': {
        setActiveWindowId(null)
        break
      }
    }

    // Network transmission to server (FIX: errors are no longer swallowed)
    const outAction: PanoAction =
      action.type === 'SELECT_CLASS' && action.classId !== null
        ? { ...action, class: action.class ?? findClassroom(action.classId) }
        : action

    const send = async (token: string) =>
      fetch('/api/pano/pair/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-device-token': token },
        body: JSON.stringify({
          sessionId: activeSessionId,
          deviceId,
          deviceToken: token,
          deviceType: isPhone ? 'phone' : 'board',
          action: outAction,
        }),
      })

    try {
      let res = await send(getToken())
      if (res.status === 401) {
        // Token may have just been rewritten by the standby/pairing flow: re-read once and retry
        res = await send(readStoredToken())
      }
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        if (data.state?.version) {
          lastAppliedVersionRef.current = Math.max(lastAppliedVersionRef.current, data.state.version)
        }
      } else if (res.status === 403 || res.status === 410) {
        if (onSessionClosed) onSessionClosed()
      } else {
        const errCode = data.code || data.error || 'error'
        console.warn('[usePanoSync] Dispatch rejected:', res.status, errCode, action.type)
        toast.error(`Tahtaya iletilemedi (${res.status}: ${errCode})`)
        resyncFromServer()
      }
    } catch (err) {
      console.warn('[usePanoSync] Dispatch network error:', err)
      toast.error('Bağlantı hatası: işlem tahtaya iletilemedi.')
      resyncFromServer()
    }
  }, [activeSessionId, deviceId, getToken, isPhone, selectedClass, findClassroom, onSessionClosed])

  // 7. Apply Authoritative Remote State
  const handleRemoteState = useCallback((remoteState: PanoSharedState, force = false) => {
    if (!remoteState) return

    if (!force) {
      // Ignore echo from this exact device (but still advance the version)
      if (remoteState.sourceDeviceId === deviceId) {
        lastAppliedVersionRef.current = Math.max(lastAppliedVersionRef.current, remoteState.version || 0)
        return
      }
      // Monotonic versioning: ignore older or identical versions
      if (remoteState.version <= lastAppliedVersionRef.current) return
    }
    lastAppliedVersionRef.current = Math.max(lastAppliedVersionRef.current, remoteState.version || 0)

    try {
      // Sync windows
      if (Array.isArray(remoteState.openWindows)) {
        setOpenWindows(remoteState.openWindows as WindowState[])
      }

      // Sync active window
      if (remoteState.activeWindowId !== undefined) {
        setActiveWindowId(remoteState.activeWindowId)
      }

      // Sync selected class: prefer the server snapshot, never wipe the selection if a local lookup fails
      if (remoteState.selectedClassId !== undefined) {
        if (remoteState.selectedClassId === null) {
          setSelectedClass(null)
          if (typeof window !== 'undefined') localStorage.removeItem('oxonom_pano_selected_class_id')
        } else {
          const found =
            ((remoteState as any).selectedClass as ClassroomItem | null | undefined) ||
            findClassroom(remoteState.selectedClassId)
          if (found) {
            setSelectedClass(found)
            if (typeof window !== 'undefined') localStorage.setItem('oxonom_pano_selected_class_id', String(found.id))
          }
        }
      }

      // Sync lock state
      if (typeof remoteState.isLocked === 'boolean') {
        setIsLocked(remoteState.isLocked)
        if (typeof window !== 'undefined') {
          if (remoteState.isLocked) {
            localStorage.setItem('oxonom_pano_is_locked', 'true')
          } else {
            localStorage.removeItem('oxonom_pano_is_locked')
          }
        }
      }

      // Sync UI modals
      if (remoteState.ui?.openModal) {
        const mId = remoteState.ui.openModal.id
        setIsClassModalOpen(mId === 'class_selection')
        setIsNewBoardModalOpen(mId === 'new_board')
        setIsSettingsOpen(mId === 'settings')
      } else if (remoteState.ui && remoteState.ui.openModal === null) {
        setIsClassModalOpen(false)
        setIsNewBoardModalOpen(false)
        setIsSettingsOpen(false)
      }
    } catch (err) {
      console.error('[usePanoSync] Remote state application error:', err)
    }
  }, [deviceId, findClassroom])
  applyRemoteRef.current = handleRemoteState

  // 8. Realtime sync: coordinated SSE streaming + adaptive polling (serverless-safe).
  // IMPORTANT: depends ONLY on activeSessionId; everything else is read through refs.
  useEffect(() => {
    if (!activeSessionId) {
      setConnectionStatus('disconnected')
      return
    }

    // CRITICAL: Reset version counter for the new session so we don't skip state
    // delivery. Old session may have left lastAppliedVersionRef at e.g. 10; new
    // session starts at version 1 → server returns changed:false → board never updates.
    lastAppliedVersionRef.current = 0

    let pollTimer: ReturnType<typeof setTimeout> | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let disposed = false
    let sse: EventSource | null = null
    let consecutivePollErrors = 0
    let sseRetryCount = 0

    const schedulePoll = (ms: number) => {
      if (disposed) return
      if (pollTimer) clearTimeout(pollTimer)
      pollTimer = setTimeout(poll, ms)
    }

    const poll = async () => {
      if (disposed) return
      try {
        const since = lastAppliedVersionRef.current
        const token = getTokenRef.current()
        const headers: Record<string, string> = {}
        if (token) headers['x-device-token'] = token

        const res = await fetch(
          `/api/pano/pair/state?sessionId=${encodeURIComponent(activeSessionId)}&since=${since}`,
          { headers }
        )
        if (res.ok) {
          consecutivePollErrors = 0
          setConnectionStatus('connected')
          const data = await res.json()
          if (data.changed && data.state) {
            pushClassrooms(data.classrooms)
            applyRemoteRef.current(data.state)
          }
        } else if (res.status === 401) {
          // Token invalid – re-read from storage (may have been written after hook mounted)
          consecutivePollErrors += 1
          if (consecutivePollErrors >= 2) {
            setConnectionStatus('disconnected')
          }
        } else if (res.status === 403 || res.status === 410) {
          disposed = true
          setConnectionStatus('disconnected')
          onSessionClosedRef.current?.()
          return
        } else {
          consecutivePollErrors += 1
          if (consecutivePollErrors >= 3 && !sseConnectedRef.current) {
            setConnectionStatus('disconnected')
          }
        }
      } catch (_) {
        consecutivePollErrors += 1
        if (consecutivePollErrors >= 3 && !sseConnectedRef.current) {
          setConnectionStatus('disconnected')
        }
      }

      if (!disposed) {
        // Always poll at 800ms on Vercel/serverless: SSE opens on a different lambda instance
        // than where the phone posts state, so SSE events never arrive on the board tab.
        // Fast polling is the only reliable real-time mechanism without Redis pub/sub.
        const hidden = typeof document !== 'undefined' && document.visibilityState === 'hidden'
        const delay = hidden ? 3000 : 800
        schedulePoll(delay)
      }
    }

    const connectSSE = async () => {
      if (disposed) return
      try {
        if (sse) {
          try { sse.close() } catch (_) {}
          sse = null
        }

        const token = getTokenRef.current()
        let sseUrl = ''

        // Acquire short-lived single-use ticket (GÖREV 4-b)
        try {
          const ticketRes = await fetch('/api/pano/pair/ticket', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-device-token': token,
            },
            body: JSON.stringify({ sessionId: activeSessionId }),
          })
          if (ticketRes.ok) {
            const ticketData = await ticketRes.json()
            if (ticketData.ticket) {
              sseUrl = `/api/pano/pair/stream?sessionId=${encodeURIComponent(activeSessionId)}&ticket=${encodeURIComponent(ticketData.ticket)}&lastVersion=${lastAppliedVersionRef.current}`
            }
          }
        } catch (_) {
          // If ticket fetch fails, fallback to direct query token
        }

        if (!sseUrl) {
          // Fallback if ticket route unavailable
          sseUrl = `/api/pano/pair/stream?sessionId=${encodeURIComponent(activeSessionId)}&token=${encodeURIComponent(token)}&lastVersion=${lastAppliedVersionRef.current}`
        }

        if (disposed) return

        const source = new EventSource(sseUrl)
        sse = source

        source.onopen = () => {
          if (disposed) return
          sseConnectedRef.current = true
          sseRetryCount = 0
          setConnectionStatus('connected')
        }

        source.addEventListener('state', (e: MessageEvent) => {
          if (disposed) return
          sseConnectedRef.current = true
          sseRetryCount = 0
          setConnectionStatus('connected')
          try {
            applyRemoteRef.current(JSON.parse(e.data) as PanoSharedState)
          } catch (_) {}
        })

        source.addEventListener('session_closed', () => {
          disposed = true
          sseConnectedRef.current = false
          setConnectionStatus('disconnected')
          onSessionClosedRef.current?.()
        })

        source.onerror = () => {
          if (disposed) return
          sseConnectedRef.current = false
          try { source.close() } catch (_) {}
          sse = null

          // Exponential backoff retry for SSE
          const backoff = Math.min(1000 * Math.pow(1.5, sseRetryCount), 30000)
          sseRetryCount += 1
          if (reconnectTimer) clearTimeout(reconnectTimer)
          reconnectTimer = setTimeout(connectSSE, backoff)
        }
      } catch (_) {
        sseConnectedRef.current = false
        const backoff = Math.min(1000 * Math.pow(1.5, sseRetryCount), 30000)
        sseRetryCount += 1
        if (reconnectTimer) clearTimeout(reconnectTimer)
        reconnectTimer = setTimeout(connectSSE, backoff)
      }
    }

    // Initial resync & bootstrap
    resyncFromServer()
    poll()
    connectSSE()

    // Page visibility listener: immediate poll & reconnect on tab focus
    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible' && !disposed) {
        poll()
        if (!sseConnectedRef.current) {
          if (reconnectTimer) clearTimeout(reconnectTimer)
          connectSSE()
        }
      }
    }

    // Online / offline listeners
    const handleOnline = () => {
      if (disposed) return
      setConnectionStatus('connecting')
      poll()
      if (reconnectTimer) clearTimeout(reconnectTimer)
      connectSSE()
    }

    const handleOffline = () => {
      setConnectionStatus('disconnected')
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
    }

    return () => {
      disposed = true
      sseConnectedRef.current = false
      if (pollTimer) clearTimeout(pollTimer)
      if (reconnectTimer) clearTimeout(reconnectTimer)
      if (sse) {
        try { sse.close() } catch (_) {}
      }
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [activeSessionId, resyncFromServer, pushClassrooms])

  // 9. FAZ 3: Parent Listener for In-iframe Navigations (`pano:navigate`)
  useEffect(() => {
    const handlePostMessage = (e: MessageEvent) => {
      if (typeof window !== 'undefined' && e.origin !== window.location.origin) return

      if (e.data && (e.data.type === 'pano:navigate' || e.data.type === 'LH_NAVIGATE') && e.data.path) {
        let newPath = e.data.path as string
        if (activeWindowId) {
          const currentWin = openWindows.find(w => w.app.id === activeWindowId)
          if (currentWin && currentWin.currentPath !== newPath && currentWin.app.path !== newPath) {
            dispatch({
              type: 'NAVIGATE',
              windowId: activeWindowId,
              path: newPath,
            })
          }
        }
      }
    }

    window.addEventListener('message', handlePostMessage)
    return () => window.removeEventListener('message', handlePostMessage)
  }, [activeWindowId, openWindows, dispatch])

  // Active Window Helper
  const activeWindow = useMemo(() => {
    return openWindows.find(w => w.app.id === activeWindowId)
  }, [openWindows, activeWindowId])

  // Common UI Actions
  const handleSelectClass = useCallback((cls: ClassroomItem) => {
    dispatch({ type: 'SELECT_CLASS', classId: cls.id, class: cls })
  }, [dispatch])

  const openAppInWindow = useCallback((app: AppItem) => {
    if (!selectedClass) {
      toast.error('Lütfen önce bir sınıf seçiniz.')
      return
    }
    dispatch({ type: 'OPEN_APP', app })
  }, [selectedClass, dispatch])

  const handleCloseWindow = useCallback((appId: string) => {
    dispatch({ type: 'CLOSE_WINDOW', windowId: appId })
  }, [dispatch])

  const handleToggleMaximizeWindow = useCallback((appId: string) => {
    dispatch({ type: 'TOGGLE_MAXIMIZE', windowId: appId })
  }, [dispatch])

  const handleReloadWindow = useCallback((appId: string) => {
    dispatch({ type: 'RELOAD_WINDOW', windowId: appId })
  }, [dispatch])

  const handleNavigateWindow = useCallback((appId: string, path: string) => {
    dispatch({ type: 'NAVIGATE', windowId: appId, path })
  }, [dispatch])

  const lockPano = useCallback(() => {
    dispatch({ type: 'LOCK' })
  }, [dispatch])

  const unlockPano = useCallback(() => {
    dispatch({ type: 'UNLOCK' })
  }, [dispatch])

  const handleToggleBoardLockFromPhone = useCallback(() => {
    if (isLocked) {
      dispatch({ type: 'UNLOCK' })
      toast.success('Akıllı tahtanın kilidi açıldı 🔓')
    } else {
      dispatch({ type: 'LOCK' })
      toast('Akıllı tahta kilitlendi 🔒', { icon: '🔒' })
    }
  }, [isLocked, dispatch])

  return {
    deviceId,
    deviceToken,
    setDeviceToken,
    resyncFromServer,
    connectionStatus,
    isPhone,
    selectedClass,
    setSelectedClass,
    openWindows,
    setOpenWindows,
    activeWindowId,
    setActiveWindowId,
    activeWindow,
    isLocked,
    setIsLocked,
    isClassModalOpen,
    setIsClassModalOpen,
    isNewBoardModalOpen,
    setIsNewBoardModalOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    dispatch,
    handleSelectClass,
    openAppInWindow,
    handleCloseWindow,
    handleToggleMaximizeWindow,
    handleReloadWindow,
    handleNavigateWindow,
    lockPano,
    unlockPano,
    handleToggleBoardLockFromPhone,
    handleRemoteState,
    lastAppliedVersionRef,
  }
}
