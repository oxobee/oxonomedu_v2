'use client'

// Simplified board-only auth hook — remote control removed.
// Phone pairs via QR/code → board gets teacher session → board manages UI locally.
// No polling, no server state sync, no phone→board commands.

import { useState, useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'

// Local type — mirrors store.ts PanoAction but doesn't import server code into client bundle
export type PanoAction =
  | { type: 'SELECT_CLASS'; classId: number | null; class?: any | null }
  | { type: 'OPEN_APP'; app: { id: string; type: 'widget' | 'app'; widgetType?: string; title: string; icon?: string; color?: string; iconColor?: string; badge?: string; path?: string } }
  | { type: 'CLOSE_WINDOW'; windowId: string }
  | { type: 'TOGGLE_MAXIMIZE'; windowId: string }
  | { type: 'RELOAD_WINDOW'; windowId: string }
  | { type: 'FOCUS_WINDOW'; windowId: string }
  | { type: 'NAVIGATE'; windowId: string; path: string }
  | { type: 'OPEN_MODAL'; modalId: string; payload?: any }
  | { type: 'CLOSE_MODAL' }
  | { type: 'LOCK' }
  | { type: 'UNLOCK' }
  | { type: 'GO_HOME' }

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

export interface WindowState {
  app: AppItem
  isMaximized: boolean
  iframeKey: number
  currentPath?: string
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
  onClassrooms?: (classrooms: ClassroomItem[]) => void
}

export function usePanoSync({
  classrooms,
  defaultClassrooms = [],
}: UsePanoSyncOptions) {
  const [selectedClass, setSelectedClass] = useState<ClassroomItem | null>(null)
  const [openWindows, setOpenWindows] = useState<WindowState[]>([])
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('oxonom_pano_is_locked') === 'true'
    }
    return false
  })
  const [isClassModalOpen, setIsClassModalOpen] = useState(false)
  const [isNewBoardModalOpen, setIsNewBoardModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const findClassroom = useCallback((classId: number | null): ClassroomItem | null => {
    if (classId === null) return null
    const list = classrooms && classrooms.length > 0 ? classrooms : defaultClassrooms
    return list.find(c => c.id === classId) || defaultClassrooms.find(c => c.id === classId) || null
  }, [classrooms, defaultClassrooms])

  // Local-only dispatch — no server calls
  const dispatch = useCallback(async (action: PanoAction) => {
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
          setActiveWindowId(curr => curr === action.windowId ? (remaining.length > 0 ? remaining[remaining.length - 1].app.id : null) : curr)
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
  }, [selectedClass, findClassroom])

  const activeWindow = useMemo(() => openWindows.find(w => w.app.id === activeWindowId), [openWindows, activeWindowId])

  const handleSelectClass = useCallback((cls: ClassroomItem) => {
    setSelectedClass(cls)
    setIsClassModalOpen(false)
    if (typeof window !== 'undefined') localStorage.setItem('oxonom_pano_selected_class_id', String(cls.id))
  }, [])

  const openAppInWindow = useCallback((app: AppItem) => {
    if (!selectedClass) {
      toast.error('Lütfen önce bir sınıf seçiniz.')
      return
    }
    dispatch({ type: 'OPEN_APP', app })
  }, [selectedClass, dispatch])

  const handleCloseWindow = useCallback((appId: string) => dispatch({ type: 'CLOSE_WINDOW', windowId: appId }), [dispatch])
  const handleToggleMaximizeWindow = useCallback((appId: string) => dispatch({ type: 'TOGGLE_MAXIMIZE', windowId: appId }), [dispatch])
  const handleReloadWindow = useCallback((appId: string) => dispatch({ type: 'RELOAD_WINDOW', windowId: appId }), [dispatch])
  const handleNavigateWindow = useCallback((appId: string, path: string) => dispatch({ type: 'NAVIGATE', windowId: appId, path }), [dispatch])

  const lockPano = useCallback(() => {
    setIsLocked(true)
    if (typeof window !== 'undefined') localStorage.setItem('oxonom_pano_is_locked', 'true')
  }, [])

  const unlockPano = useCallback(() => {
    setIsLocked(false)
    if (typeof window !== 'undefined') localStorage.removeItem('oxonom_pano_is_locked')
  }, [])

  const handleToggleBoardLockFromPhone = useCallback(() => {
    if (isLocked) unlockPano()
    else lockPano()
  }, [isLocked, lockPano, unlockPano])

  return {
    // Auth stubs (no longer needed for sync, kept for API compatibility)
    deviceId: 'board-local',
    deviceToken: '',
    setDeviceToken: (_: string) => {},
    resyncFromServer: async () => {},
    connectionStatus: 'connected' as PanoConnectionStatus,
    isPhone: false,
    // State
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
    // Actions
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
    // Compat stubs
    handleRemoteState: (_: any) => {},
    lastAppliedVersionRef: { current: 0 },
  }
}
