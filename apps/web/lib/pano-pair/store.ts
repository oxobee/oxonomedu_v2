// Persistent Realtime Pairing & Shared State Store for Oxonom Smart Board (Pano OS)
// Backed by MongoDB Atlas (Cloud) with in-memory caching and fallback

import { MongoClient, Db, Collection } from 'mongodb'

export interface TeacherPairData {
  sessionId?: string
  id?: number
  username?: string
  first_name?: string
  last_name?: string
  email?: string
  role?: string
  token?: string
  refreshToken?: string
  orgSlug?: string
  lock_pin?: string
  selectedClassId?: number | null
  classrooms?: any[]
  settings?: any
}

export interface WindowStateItem {
  app: {
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
  isMaximized: boolean
  iframeKey: number
}

export interface PanoSharedState {
  version: number
  updatedAt: number
  sourceDeviceId: string
  updatedBy: 'board' | 'phone'
  openWindows: WindowStateItem[]
  activeWindowId: string | null
  currentView: 'home' | 'window'
  selectedClassId: number | null
  isLocked: boolean
}

export interface PanoPairSession {
  sessionId: string
  code: string // 6-digit string
  createdAt: number
  expiresAt: number
  status: 'waiting' | 'paired' | 'expired' | 'closed'
  teacherData?: TeacherPairData
  sharedState?: PanoSharedState
  pairedAt?: number
  closedAt?: number
  closedReason?: string
}

export type PanoSessionEvent =
  | { type: 'paired'; teacherData: TeacherPairData; session: PanoPairSession }
  | { type: 'state'; state: PanoSharedState }
  | { type: 'session_closed'; sessionId: string; reason?: string }

export type SessionListener = (event: PanoSessionEvent) => void

// MongoDB Connection Pool
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://oxobee_admin:OxonomEdu2026DbSecret@oxonomedu.miwnehh.mongodb.net/eduboard?retryWrites=true&w=majority'

interface GlobalPanoStore {
  client?: MongoClient
  db?: Db
  memorySessions: Map<string, PanoPairSession>
  codeToSessionId: Map<string, string>
  listeners: Map<string, Set<SessionListener>>
}

const g = globalThis as unknown as { _panoPairStore?: GlobalPanoStore }

if (!g._panoPairStore) {
  g._panoPairStore = {
    memorySessions: new Map(),
    codeToSessionId: new Map(),
    listeners: new Map(),
  }
}

const store = g._panoPairStore

async function getPanoCollection(): Promise<Collection<PanoPairSession> | null> {
  try {
    if (!store.client) {
      store.client = new MongoClient(MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 4000,
        connectTimeoutMS: 4000,
      })
      await store.client.connect()
    }
    if (!store.db) {
      store.db = store.client.db('eduboard')
    }
    return store.db.collection<PanoPairSession>('pano_sessions')
  } catch (err) {
    console.warn('[PanoStore] MongoDB connection fallback to memory:', err)
    return null
  }
}

// Generate a random 6-digit code
function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function createPanoSession(ttlMs = 5 * 60 * 1000): Promise<PanoPairSession> {
  const sessionId = `pano_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  const code = generateCode()
  const now = Date.now()

  const session: PanoPairSession = {
    sessionId,
    code,
    createdAt: now,
    expiresAt: now + ttlMs,
    status: 'waiting',
  }

  // Update memory cache
  store.memorySessions.set(sessionId, session)
  store.codeToSessionId.set(code, sessionId)

  // Persist to MongoDB
  try {
    const coll = await getPanoCollection()
    if (coll) {
      await coll.updateOne(
        { sessionId },
        { $set: session },
        { upsert: true }
      )
    }
  } catch (err) {
    console.error('[PanoStore] createPanoSession DB error:', err)
  }

  return session
}

export async function getPanoSession(sessionId: string): Promise<PanoPairSession | null> {
  if (!sessionId) return null

  // 1. Try DB first
  try {
    const coll = await getPanoCollection()
    if (coll) {
      const doc = await coll.findOne({ sessionId })
      if (doc) {
        // Strip mongo internal _id
        const { _id, ...cleanSession } = doc as any
        if (cleanSession.expiresAt < Date.now() && cleanSession.status === 'waiting') {
          cleanSession.status = 'expired'
          coll.updateOne({ sessionId }, { $set: { status: 'expired' } }).catch(() => {})
        }
        store.memorySessions.set(sessionId, cleanSession)
        store.codeToSessionId.set(cleanSession.code, sessionId)
        return cleanSession
      }
    }
  } catch (err) {
    console.warn('[PanoStore] getPanoSession DB error, checking memory:', err)
  }

  // 2. Memory fallback
  const mem = store.memorySessions.get(sessionId)
  if (!mem) return null

  if (mem.expiresAt < Date.now() && mem.status === 'waiting') {
    mem.status = 'expired'
    store.codeToSessionId.delete(mem.code)
  }

  return mem
}

export async function getPanoSessionByCode(code: string): Promise<PanoPairSession | null> {
  const clean = code.replace(/[^0-9]/g, '')
  if (!clean) return null

  // 1. Try DB first
  try {
    const coll = await getPanoCollection()
    if (coll) {
      const doc = await coll.findOne({
        code: clean,
        expiresAt: { $gt: Date.now() },
        status: { $in: ['waiting', 'paired'] },
      })
      if (doc) {
        const { _id, ...cleanSession } = doc as any
        store.memorySessions.set(cleanSession.sessionId, cleanSession)
        store.codeToSessionId.set(clean, cleanSession.sessionId)
        return cleanSession
      }
    }
  } catch (err) {
    console.warn('[PanoStore] getPanoSessionByCode DB error, checking memory:', err)
  }

  // 2. Memory fallback
  const sessionId = store.codeToSessionId.get(clean)
  if (!sessionId) return null
  return getPanoSession(sessionId)
}

export async function pairPanoSession(
  identifier: { code?: string; sessionId?: string },
  teacherData: TeacherPairData
): Promise<{ success: boolean; session?: PanoPairSession; error?: string }> {
  let session: PanoPairSession | null = null

  if (identifier.sessionId) {
    session = await getPanoSession(identifier.sessionId)
  } else if (identifier.code) {
    session = await getPanoSessionByCode(identifier.code)
  }

  if (!session) {
    return { success: false, error: 'Geçersiz veya süresi dolmuş eşleştirme kodu.' }
  }

  if (session.status === 'expired') {
    return { success: false, error: 'Eşleştirme kodunun süresi dolmuş. Lütfen tahtadaki yeni kodu deneyin.' }
  }

  const defaultSharedState: PanoSharedState = {
    version: 1,
    updatedAt: Date.now(),
    sourceDeviceId: 'system',
    updatedBy: 'phone',
    openWindows: [],
    activeWindowId: null,
    currentView: 'home',
    selectedClassId: teacherData.selectedClassId ?? null,
    isLocked: false,
  }

  const updatedSession: PanoPairSession = {
    ...session,
    status: 'paired',
    teacherData,
    sharedState: session.sharedState || defaultSharedState,
    pairedAt: Date.now(),
  }

  // Save to memory
  store.memorySessions.set(session.sessionId, updatedSession)

  // Persist to MongoDB
  try {
    const coll = await getPanoCollection()
    if (coll) {
      await coll.updateOne(
        { sessionId: session.sessionId },
        {
          $set: {
            status: 'paired',
            teacherData,
            sharedState: updatedSession.sharedState,
            pairedAt: updatedSession.pairedAt,
          },
        }
      )
    }
  } catch (err) {
    console.error('[PanoStore] pairPanoSession DB error:', err)
  }

  // Notify in-process listeners
  notifySessionListeners(session.sessionId, {
    type: 'paired',
    teacherData,
    session: updatedSession,
  })

  return { success: true, session: updatedSession }
}

export function notifySessionListeners(sessionId: string, event: PanoSessionEvent): void {
  const listeners = store.listeners.get(sessionId)
  if (listeners) {
    for (const listener of listeners) {
      try {
        listener(event)
      } catch (err) {
        console.error('[PanoStore] Listener error:', err)
      }
    }
  }
}

export async function updatePanoSharedState(
  sessionId: string,
  patch: Partial<PanoSharedState>,
  sourceDeviceId: string,
  updatedBy: 'board' | 'phone' = 'phone'
): Promise<PanoSharedState | null> {
  const session = await getPanoSession(sessionId)
  if (!session || session.status !== 'paired') {
    return null
  }

  const currentVersion = session.sharedState?.version || 0
  const nextVersion = currentVersion + 1

  const nextState: PanoSharedState = {
    version: nextVersion,
    updatedAt: Date.now(),
    sourceDeviceId,
    updatedBy,
    openWindows: patch.openWindows !== undefined ? patch.openWindows : (session.sharedState?.openWindows || []),
    activeWindowId: patch.activeWindowId !== undefined ? patch.activeWindowId : (session.sharedState?.activeWindowId ?? null),
    currentView: patch.currentView !== undefined ? patch.currentView : (session.sharedState?.currentView || 'home'),
    selectedClassId: patch.selectedClassId !== undefined ? patch.selectedClassId : (session.sharedState?.selectedClassId ?? null),
    isLocked: patch.isLocked !== undefined ? patch.isLocked : (session.sharedState?.isLocked ?? false),
  }

  session.sharedState = nextState
  store.memorySessions.set(sessionId, session)

  // Persist to MongoDB
  try {
    const coll = await getPanoCollection()
    if (coll) {
      await coll.updateOne(
        { sessionId },
        { $set: { sharedState: nextState } }
      )
    }
  } catch (err) {
    console.error('[PanoStore] updatePanoSharedState DB error:', err)
  }

  // Broadcast state event to in-process listeners
  notifySessionListeners(sessionId, {
    type: 'state',
    state: nextState,
  })

  return nextState
}

export async function getPanoSharedState(sessionId: string): Promise<PanoSharedState | null> {
  const session = await getPanoSession(sessionId)
  if (!session) return null
  return session.sharedState || null
}

export function subscribePanoSession(sessionId: string, listener: SessionListener): () => void {
  if (!store.listeners.has(sessionId)) {
    store.listeners.set(sessionId, new Set())
  }
  store.listeners.get(sessionId)!.add(listener)

  return () => {
    const set = store.listeners.get(sessionId)
    if (set) {
      set.delete(listener)
      if (set.size === 0) store.listeners.delete(sessionId)
    }
  }
}

export async function closePanoSession(sessionId: string, reason = 'user_logout'): Promise<void> {
  const sess = store.memorySessions.get(sessionId)
  if (sess) {
    sess.status = 'closed'
    store.codeToSessionId.delete(sess.code)
    store.memorySessions.delete(sessionId)
    store.listeners.delete(sessionId)
  }

  // Notify in-process listeners
  notifySessionListeners(sessionId, {
    type: 'session_closed',
    sessionId,
    reason,
  })

  // Persist closed status to MongoDB
  try {
    const coll = await getPanoCollection()
    if (coll) {
      await coll.updateOne(
        { sessionId },
        {
          $set: {
            status: 'closed',
            closedReason: reason,
            closedAt: Date.now(),
          },
        }
      )
    }
  } catch (err) {
    console.error('[PanoStore] closePanoSession DB error:', err)
  }
}
