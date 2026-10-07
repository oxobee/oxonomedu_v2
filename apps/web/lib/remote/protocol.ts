// Oxonom Edu — Smart Board Remote Control Protocol & Types
// Defines the secure, versioned communication contract between Phone Remote and Smart Board.

export type RemoteConnectionState =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'ended'

export type RemoteActionType =
  // Basic Navigation
  | 'HOME'
  | 'BACK'
  | 'CLOSE_WINDOW'
  | 'RELOAD_WINDOW'
  | 'FULLSCREEN'
  | 'EXIT_FULLSCREEN'
  | 'LOCK'
  | 'UNLOCK'
  // Class & Branch Selection
  | 'SELECT_CLASS'
  // Core Apps & Shortcuts
  | 'OPEN_WHITEBOARD'
  | 'OPEN_ATTENDANCE'
  | 'OPEN_ASSIGNMENTS'
  | 'OPEN_PLAYGROUNDS'
  | 'OPEN_GAMES'
  | 'OPEN_LIBRARY'
  // Board & Presentation Controls
  | 'NEXT_PAGE'
  | 'PREVIOUS_PAGE'
  | 'PEN'
  | 'ERASER'
  | 'UNDO'
  | 'REDO'
  | 'ZOOM_IN'
  | 'ZOOM_OUT'
  // Custom Shortcut Execution
  | 'TRIGGER_SHORTCUT'

export const ALLOWED_REMOTE_ACTIONS = new Set<RemoteActionType>([
  'HOME',
  'BACK',
  'CLOSE_WINDOW',
  'RELOAD_WINDOW',
  'FULLSCREEN',
  'EXIT_FULLSCREEN',
  'LOCK',
  'UNLOCK',
  'SELECT_CLASS',
  'OPEN_WHITEBOARD',
  'OPEN_ATTENDANCE',
  'OPEN_ASSIGNMENTS',
  'OPEN_PLAYGROUNDS',
  'OPEN_GAMES',
  'OPEN_LIBRARY',
  'NEXT_PAGE',
  'PREVIOUS_PAGE',
  'PEN',
  'ERASER',
  'UNDO',
  'REDO',
  'ZOOM_IN',
  'ZOOM_OUT',
  'TRIGGER_SHORTCUT',
])

export interface RemoteActionPayload {
  classId?: number
  className?: string
  boardUuid?: string
  path?: string
  tool?: string
  shortcutId?: string
  [key: string]: any
}

export interface RemoteActionMessage {
  type: 'remote_action'
  id: string
  sessionId: string
  action: RemoteActionType
  payload?: RemoteActionPayload
  timestamp: number
  sourceDeviceId?: string
}

export type BoardEventType =
  | 'REMOTE_CONNECTED'
  | 'REMOTE_DISCONNECTED'
  | 'REMOTE_SESSION_ENDED'
  | 'BOARD_STATE'
  | 'ACTION_RESULT'
  | 'ACTION_ERROR'

export interface BoardEventMessage {
  type: 'board_event'
  event: BoardEventType
  sessionId: string
  data?: any
  timestamp: number
}

export interface RemoteShortcutItem {
  id: string
  label: string
  icon: string // Lucide icon name, e.g. 'Presentation', 'Calendar', 'FileText', 'Play', 'Sparkles', 'BookOpen', 'Gamepad2'
  color: string // Tailwind gradient or bg class
  action: RemoteActionType
  payload?: RemoteActionPayload
  order: number
}

export const DEFAULT_REMOTE_SHORTCUTS: RemoteShortcutItem[] = [
  {
    id: 'shortcut_whiteboard',
    label: 'Akıllı Tahta',
    icon: 'Presentation',
    color: 'from-blue-600 to-indigo-700',
    action: 'OPEN_WHITEBOARD',
    order: 1,
  },
  {
    id: 'shortcut_attendance',
    label: 'Yoklama Al',
    icon: 'Calendar',
    color: 'from-purple-600 to-pink-700',
    action: 'OPEN_ATTENDANCE',
    order: 2,
  },
  {
    id: 'shortcut_assignments',
    label: 'Ev Ödevleri',
    icon: 'FileText',
    color: 'from-emerald-600 to-teal-700',
    action: 'OPEN_ASSIGNMENTS',
    order: 3,
  },
  {
    id: 'shortcut_playgrounds',
    label: 'İnteraktif Modüller',
    icon: 'Sparkles',
    color: 'from-amber-500 to-orange-600',
    action: 'OPEN_PLAYGROUNDS',
    order: 4,
  },
  {
    id: 'shortcut_games',
    label: 'Eğitici Oyunlar',
    icon: 'Gamepad2',
    color: 'from-indigo-600 to-violet-800',
    action: 'OPEN_GAMES',
    order: 5,
  },
  {
    id: 'shortcut_library',
    label: 'Kaynaklar',
    icon: 'BookOpen',
    color: 'from-rose-500 to-red-700',
    action: 'OPEN_LIBRARY',
    order: 6,
  },
]
