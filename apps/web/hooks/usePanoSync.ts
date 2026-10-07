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

export interface UsePanoSyncOptions {
  activeSessionId: string | null
  classrooms: ClassroomItem[]
  defaultClassrooms?: ClassroomItem[]
  onSessionClosed?: () => void
}

export function usePanoSync({
  activeSessionId,
  classrooms,
  defaultClassrooms = [],
  onSessionClosed,
}: UsePanoSyncOptions) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 1. Device ID & Token (Unique client tokens for echo loop prevention and authentication)
  const [deviceId] = useState<string>(() => {
    if (typeof window === 'undefined') return 'init'
    let id = localStorage.getItem('oxonom_pano_device_id')
    if (!id) {
      const qDevice = searchParams?.get('device')
      const prefix = qDevice === 'phone' ? 'phone' : 'board'
      id = `${prefix}-${Math.random().toString(36).substring(2, 9)}`
      localStorage.setItem('oxonom_pano_device_id', id)
    }
    return id
  })

  const [deviceToken] = useState<string>(() => {
    if (typeof window === 'undefined') return ''
    const qToken = searchParams?.get('token')
    if (qToken) {
      localStorage.setItem('oxonom_pano_device_token', qToken)
      return qToken
    }
    let tok = localStorage.getItem('oxonom_pano_device_token')
    if (!tok) {
      tok = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tok_${Math.random().toString(36).substring(2)}`
      localStorage.setItem('oxonom_pano_device_token', tok)
    }
    return tok
  })

  // 2. Device Role (Phone vs Board): Strictly based on ?device=phone|board or pairing role (NO innerWidth guessing)
  const isPhone = useMemo(() => {
    if (typeof window === 'undefined') return false
    const qDevice = searchParams?.get('device')
    if (qDevice === 'phone') return true
    if (qDevice === 'board') return false
    const savedType = localStorage.getItem('oxonom_pano_device_type')
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

  // 5. Version Tracking for Strict Monotonicity
  const lastAppliedVersionRef = useRef<number>(0)
  const sseConnectedRef = useRef<boolean>(false)

  // Helper to find classroom in dynamic list or fallback defaults
  const findClassroom = useCallback((classId: number | null): ClassroomItem | null => {
    if (classId === null) return null
    const list = classrooms && classrooms.length > 0 ? classrooms : defaultClassrooms
    return list.find(c => c.id === classId) || defaultClassrooms.find(c => c.id === classId) || null
  }, [classrooms, defaultClassrooms])

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
          const found = findClassroom(action.classId)
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

    // Network transmission to server
    try {
      const res = await fetch('/api/pano/pair/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-token': deviceToken,
        },
        body: JSON.stringify({
          sessionId: activeSessionId,
          deviceId,
          deviceToken,
          deviceType: isPhone ? 'phone' : 'board',
          action,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.state?.version) {
          lastAppliedVersionRef.current = Math.max(lastAppliedVersionRef.current, data.state.version)
        }
      }
    } catch (err) {
      console.warn('[usePanoSync] Dispatch network error:', err)
    }
  }, [activeSessionId, deviceId, deviceToken, isPhone, selectedClass, findClassroom])

  // 7. Apply Authoritative Remote State
  const handleRemoteState = useCallback((remoteState: PanoSharedState) => {
    if (!remoteState) return

    // Ignore echo from this exact device
    if (remoteState.sourceDeviceId === deviceId) return

    // Monotonic versioning: ignore older or identical versions
    if (remoteState.version <= lastAppliedVersionRef.current) return
    lastAppliedVersionRef.current = remoteState.version

    try {
      // Sync windows
      if (Array.isArray(remoteState.openWindows)) {
        setOpenWindows(remoteState.openWindows as WindowState[])
      }

      // Sync active window
      if (remoteState.activeWindowId !== undefined) {
        setActiveWindowId(remoteState.activeWindowId)
      }

      // Sync selected class
      if (remoteState.selectedClassId !== undefined) {
        if (remoteState.selectedClassId === null) {
          setSelectedClass(null)
          if (typeof window !== 'undefined') localStorage.removeItem('oxonom_pano_selected_class_id')
        } else {
          const found = findClassroom(remoteState.selectedClassId)
          setSelectedClass(found)
          if (found && typeof window !== 'undefined') {
            localStorage.setItem('oxonom_pano_selected_class_id', String(found.id))
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

  // 8. Realtime SSE Connection + Graceful Disconnect Fallback (30s Polling only when disconnected)
  useEffect(() => {
    if (!activeSessionId) return

    let sse: EventSource | null = null
    let fallbackPollTimer: NodeJS.Timeout | null = null

    const startFallbackPolling = () => {
      if (fallbackPollTimer) return
      // FAZ 4: Polling only activates when SSE is broken, with 30s interval
      fallbackPollTimer = setInterval(async () => {
        if (sseConnectedRef.current) return
        try {
          const res = await fetch(
            `/api/pano/pair/state?sessionId=${encodeURIComponent(activeSessionId)}&token=${encodeURIComponent(deviceToken)}`
          )
          if (res.ok) {
            const data = await res.json()
            if (data.state) handleRemoteState(data.state)
          } else if (res.status === 403 || res.status === 410) {
            if (onSessionClosed) onSessionClosed()
          }
        } catch (_) {}
      }, 30000)
    }

    const stopFallbackPolling = () => {
      if (fallbackPollTimer) {
        clearInterval(fallbackPollTimer)
        fallbackPollTimer = null
      }
    }

    try {
      const sseUrl = `/api/pano/pair/stream?sessionId=${encodeURIComponent(activeSessionId)}&token=${encodeURIComponent(deviceToken)}&lastVersion=${lastAppliedVersionRef.current}`
      sse = new EventSource(sseUrl)

      sse.onopen = () => {
        sseConnectedRef.current = true
        stopFallbackPolling()
      }

      sse.addEventListener('state', (e: MessageEvent) => {
        try {
          sseConnectedRef.current = true
          stopFallbackPolling()
          const data: PanoSharedState = JSON.parse(e.data)
          handleRemoteState(data)
        } catch (err) {
          console.error('[usePanoSync] SSE parse state error:', err)
        }
      })

      sse.addEventListener('session_closed', () => {
        if (onSessionClosed) onSessionClosed()
      })

      sse.onerror = () => {
        sseConnectedRef.current = false
        startFallbackPolling()
      }
    } catch (err) {
      console.warn('[usePanoSync] Stream initialization error:', err)
      startFallbackPolling()
    }

    return () => {
      if (sse) sse.close()
      stopFallbackPolling()
      sseConnectedRef.current = false
    }
  }, [activeSessionId, deviceToken, handleRemoteState, onSessionClosed])

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
    dispatch({ type: 'SELECT_CLASS', classId: cls.id })
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
