// Persistent Realtime Pairing & Shared State Store for Oxonom Smart Board (Pano OS)
// Backed by MongoDB Atlas (Cloud) & Redis Pub/Sub with in-memory caching and fallback

import { MongoClient, Db, Collection } from 'mongodb'
import crypto from 'crypto'
import Redis from 'ioredis'

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
  currentPath?: string
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
  /** Full snapshot of the selected class so every device can render it without a local lookup */
  selectedClass?: any | null
  isLocked: boolean
  ui?: {
    openModal: { id: string; payload?: any } | null
  }
}

export type PanoAction =
  | { type: 'SELECT_CLASS'; classId: number | null; class?: any | null }
  | { type: 'OPEN_APP'; app: WindowStateItem['app'] }
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

export interface PanoPairSession {
  sessionId: string
  code: string // 6-digit string
  createdAt: number
  expiresAt: number
  expireAt?: Date
  status: 'waiting' | 'paired' | 'expired' | 'closed'
  teacherData?: TeacherPairData
  sharedState?: PanoSharedState
  pairedAt?: number
  closedAt?: number
  closedReason?: string
  boardDeviceToken?: string
  phoneDeviceToken?: string
  failedAttempts?: number
}

export type PanoSessionEvent =
  | { type: 'paired'; teacherData: TeacherPairData; session: PanoPairSession }
  | { type: 'state'; state: PanoSharedState }
  | { type: 'session_closed'; sessionId: string; reason?: string }
  | { type: 'remote_action'; action: any }

export type SessionListener = (event: PanoSessionEvent) => void

// MongoDB Connection Pool strictly from process.env.MONGODB_URI (FAZ 5 Security)
const MONGODB_URI = process.env.MONGODB_URI || ''

// Redis Configuration (FAZ 4 Realtime Infrastructure)
const REDIS_URL = process.env.REDIS_URL || process.env.LEARNHOUSE_REDIS_URL || ''

const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL)

let redisPub: Redis | null = null

export function getRedisPublisher(): Redis | null {
  if (!REDIS_URL) return null
  if (!redisPub) {
    try {
      redisPub = new Redis(REDIS_URL, {
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        lazyConnect: true,
      })
      redisPub.connect().catch((err: any) => {
        console.warn('[PanoRedis] Publisher connection fallback:', err?.message || err)
        redisPub = null
      })
    } catch (_) {
      redisPub = null
    }
  }
  return redisPub
}

export function createRedisSubscriber(): Redis | null {
  if (!REDIS_URL) return null
  try {
    const sub = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    })
    sub.on('error', (err: any) => {
      console.warn('[PanoRedis] Subscriber error:', err?.message || err)
    })
    return sub
  } catch (_) {
    return null
  }
}

declare global {
  var _panoMongoClient: MongoClient | undefined
  var _panoMongoDb: Db | undefined
  var _panoIndexesReady: boolean | undefined
  var _panoPairStore: GlobalPanoStore | undefined
}

interface GlobalPanoStore {
  memorySessions: Map<string, PanoPairSession>
  codeToSessionId: Map<string, string>
  listeners: Map<string, Set<SessionListener>>
}

if (!globalThis._panoPairStore) {
  globalThis._panoPairStore = {
    memorySessions: new Map(),
    codeToSessionId: new Map(),
    listeners: new Map(),
  }
}

const store = globalThis._panoPairStore

export async function getPanoDb(): Promise<Db | null> {
  if (!MONGODB_URI) {
    if (isProduction) {
      const err = new Error('Veritabanı yapılandırılmamış (MONGODB_URI ortam değişkeni eksik)')
      ;(err as any).code = 'store_unavailable'
      throw err
    }
    return null
  }

  try {
    if (!globalThis._panoMongoClient) {
      const client = new MongoClient(MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      })
      await client.connect()
      globalThis._panoMongoClient = client
      globalThis._panoMongoDb = client.db('eduboard')
    }
    return globalThis._panoMongoDb || globalThis._panoMongoClient.db('eduboard')
  } catch (err: any) {
    console.error('[PanoStore] MongoDB connection error:', err?.message || err)
    if (isProduction) {
      const error = new Error('Veritabanı yapılandırılmamış (MongoDB bağlantısı kurulamadı)')
      ;(error as any).code = 'store_unavailable'
      throw error
    }
    return null
  }
}

export async function getPanoCollection(): Promise<Collection<PanoPairSession> | null> {
  const db = await getPanoDb()
  if (!db) return null

  const coll = db.collection<PanoPairSession>('pano_sessions')
  if (!globalThis._panoIndexesReady) {
    try {
      await Promise.all([
        coll.createIndex({ sessionId: 1 }, { unique: true }),
        coll.createIndex({ code: 1 }),
        coll.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 }),
        coll.createIndex({ expiresAt: 1 }),
      ])
      globalThis._panoIndexesReady = true
    } catch (idxErr) {
      console.warn('[PanoStore] Index creation warning:', idxErr)
    }
  }
  return coll
}

export async function checkMongoHealth(): Promise<{
  mongoConfigured: boolean
  mongoPing: boolean
  redisConfigured: boolean
  env: 'vercel' | 'other'
}> {
  const mongoConfigured = Boolean(MONGODB_URI)
  const redisConfigured = Boolean(REDIS_URL)
  const env: 'vercel' | 'other' = process.env.VERCEL ? 'vercel' : 'other'

  let mongoPing = false
  if (mongoConfigured) {
    try {
      const db = await getPanoDb()
      if (db) {
        const pingRes = await db.command({ ping: 1 })
        mongoPing = Boolean(pingRes && (pingRes.ok === 1 || pingRes.ok === true))
      }
    } catch (err: any) {
      console.warn('[PanoHealth] MongoDB ping check error:', err?.message || err)
      mongoPing = false
    }
  }

  return {
    mongoConfigured,
    mongoPing,
    redisConfigured,
    env,
  }
}

// Generate a random cryptographically secure 6-digit code (FAZ 5)
function generateCode(): string {
  try {
    return String(crypto.randomInt(100000, 1000000))
  } catch (_) {
    return String(Math.floor(100000 + Math.random() * 900000))
  }
}

export async function createPanoSession(ttlMs = 5 * 60 * 1000): Promise<PanoPairSession> {
  const sessionId = `pano_${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).substring(2)}`}`
  const boardDeviceToken = crypto.randomUUID ? crypto.randomUUID() : `board_${Math.random().toString(36).substring(2)}`
  const code = generateCode()
  const now = Date.now()
  const expiresAt = now + ttlMs

  const session: PanoPairSession = {
    sessionId,
    code,
    createdAt: now,
    expiresAt,
    expireAt: new Date(expiresAt),
    status: 'waiting',
    boardDeviceToken,
    failedAttempts: 0,
  }

  // Update memory cache
  store.memorySessions.set(sessionId, session)
  store.codeToSessionId.set(code, sessionId)

  // Persist to MongoDB (in production, fails loudly if DB is down)
  const coll = await getPanoCollection()
  if (coll) {
    await coll.updateOne(
      { sessionId },
      { $set: session },
      { upsert: true }
    )
  }

  return session
}

export async function getPanoSession(sessionId: string): Promise<PanoPairSession | null> {
  if (!sessionId) return null

  // 1. In production / when Mongo is configured, trust DB as single source of truth across serverless instances
  try {
    const coll = await getPanoCollection()
    if (coll) {
      const doc = await coll.findOne({ sessionId })
      if (!doc) {
        return null
      }
      const { _id: _unusedId, expireAt: _unusedExpireAt, ...cleanSession } = doc as any
      if (cleanSession.expiresAt < Date.now() && cleanSession.status === 'waiting') {
        cleanSession.status = 'expired'
        coll.updateOne({ sessionId }, { $set: { status: 'expired' } }).catch(() => {})
      }
      store.memorySessions.set(sessionId, cleanSession)
      store.codeToSessionId.set(cleanSession.code, sessionId)
      return cleanSession
    }
  } catch (err: any) {
    if (isProduction) {
      throw err
    }
    console.warn('[PanoStore] getPanoSession DB error, fallback to memory in dev:', err)
  }

  // 2. Memory fallback ONLY in development mode when DB is not configured
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

  // 1. Trust DB across serverless instances
  try {
    const coll = await getPanoCollection()
    if (coll) {
      const doc = await coll.findOne({
        code: clean,
        expiresAt: { $gt: Date.now() },
        status: { $in: ['waiting', 'paired'] },
      })
      if (!doc) return null
      const { _id: _unusedId, expireAt: _unusedExpireAt, ...cleanSession } = doc as any
      store.memorySessions.set(cleanSession.sessionId, cleanSession)
      store.codeToSessionId.set(clean, cleanSession.sessionId)
      return cleanSession
    }
  } catch (err: any) {
    if (isProduction) {
      throw err
    }
    console.warn('[PanoStore] getPanoSessionByCode DB error, fallback to memory in dev:', err)
  }

  // 2. Memory fallback ONLY in development
  const sessionId = store.codeToSessionId.get(clean)
  if (!sessionId) return null
  return getPanoSession(sessionId)
}

// Track failed code attempts with automatic lockout after 5 tries (FAZ 5)
export async function recordFailedAttempt(code: string): Promise<{ locked: boolean; attempts: number }> {
  const session = await getPanoSessionByCode(code)
  if (!session) return { locked: false, attempts: 0 }

  const attempts = (session.failedAttempts || 0) + 1
  session.failedAttempts = attempts
  if (attempts >= 5) {
    session.status = 'expired'
  }

  store.memorySessions.set(session.sessionId, session)

  try {
    const coll = await getPanoCollection()
    if (coll) {
      await coll.updateOne(
        { sessionId: session.sessionId },
        {
          $set: {
            failedAttempts: attempts,
            ...(attempts >= 5 ? { status: 'expired' } : {}),
          },
        }
      )
    }
  } catch (_) {
    // ignore record attempt error
  }

  return { locked: attempts >= 5, attempts }
}

export async function pairPanoSession(
  identifier: { code?: string; sessionId?: string },
  teacherData: TeacherPairData,
  clientDeviceToken?: string
): Promise<{ success: boolean; session?: PanoPairSession; phoneDeviceToken?: string; error?: string }> {
  let session: PanoPairSession | null = null

  if (identifier.sessionId) {
    session = await getPanoSession(identifier.sessionId)
  } else if (identifier.code) {
    session = await getPanoSessionByCode(identifier.code)
  }

  if (!session) {
    return { success: false, error: 'Geçersiz veya süresi dolmuş eşleştirme kodu.' }
  }

  if (session.status === 'expired' || (session.failedAttempts && session.failedAttempts >= 5)) {
    return { success: false, error: 'Eşleştirme kodunun süresi dolmuş veya çok fazla hatalı deneme yapılmış.' }
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
    ui: { openModal: null },
  }

  const phoneDeviceToken = clientDeviceToken || (crypto.randomUUID ? crypto.randomUUID() : `phone_${Math.random().toString(36).substring(2)}`)

  const updatedSession: PanoPairSession = {
    ...session,
    status: 'paired',
    teacherData,
    sharedState: session.sharedState || defaultSharedState,
    phoneDeviceToken,
    failedAttempts: 0,
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
            phoneDeviceToken,
            failedAttempts: 0,
            pairedAt: updatedSession.pairedAt,
          },
        }
      )
    }
  } catch (err: any) {
    console.error('[PanoStore] pairPanoSession DB error:', err)
    if (isProduction) throw err
  }

  // FAZ 5 Security: Strip teacher JWT token and refreshToken before publishing over SSE
  const { token, refreshToken, ...safeTeacherData } = teacherData

  // Broadcast event (In-process + Redis)
  await publishSessionEvent(session.sessionId, {
    type: 'paired',
    teacherData: safeTeacherData,
    session: {
      ...updatedSession,
      teacherData: safeTeacherData,
    },
  })

  return { success: true, session: updatedSession, phoneDeviceToken }
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

// Publish session events to in-process listeners and Redis channel (FAZ 4)
export async function publishSessionEvent(sessionId: string, event: PanoSessionEvent): Promise<void> {
  // 1. In-process listeners
  notifySessionListeners(sessionId, event)

  // 2. Redis pub/sub
  const pub = getRedisPublisher()
  if (pub) {
    try {
      await pub.publish(`pano:session:${sessionId}`, JSON.stringify(event))
    } catch (err) {
      console.warn('[PanoRedis] Publish error:', err)
    }
  }
}

export async function verifyDeviceToken(sessionId: string, token: string | null | undefined): Promise<boolean> {
  if (!token) return false
  const session = await getPanoSession(sessionId)
  if (!session) return false
  if (!session.boardDeviceToken && !session.phoneDeviceToken) {
    // Security (GÖREV 4-a): Never allow access if tokens are not defined in session
    return false
  }
  return token === session.boardDeviceToken || token === session.phoneDeviceToken
}

// Short-lived single-use tickets for SSE stream auth (GÖREV 4-b)
interface PanoTicket {
  sessionId: string
  deviceToken: string
  expiresAt: number
}
const ticketStore = new Map<string, PanoTicket>()

export async function createPanoTicket(sessionId: string, deviceToken: string, ttlMs = 30000): Promise<string> {
  const ticket = crypto.randomUUID ? crypto.randomUUID() : `tkt_${Math.random().toString(36).substring(2)}`
  const expiresAtMs = Date.now() + ttlMs
  ticketStore.set(ticket, { sessionId, deviceToken, expiresAt: expiresAtMs })

  try {
    const db = await getPanoDb()
    if (db) {
      await db.collection('pano_tickets').insertOne({
        ticket,
        sessionId,
        deviceToken,
        expiresAt: new Date(expiresAtMs),
        createdAt: new Date(),
      })
    }
  } catch (_) {
    // In-memory fallback
  }

  return ticket
}

export async function verifyAndConsumeTicket(sessionId: string, ticket: string): Promise<boolean> {
  if (!ticket) return false

  // Try Mongo first (works across Vercel serverless lambdas)
  try {
    const db = await getPanoDb()
    if (db) {
      const res = await db.collection('pano_tickets').findOneAndDelete({
        ticket,
        sessionId,
        expiresAt: { $gt: new Date() },
      })
      if (res && (res.value || (res as any).deviceToken)) {
        const doc = res.value || res
        return verifyDeviceToken(sessionId, (doc as any).deviceToken)
      }
    }
  } catch (_) {
    // fallback to memory
  }

  // Fallback to memory
  const entry = ticketStore.get(ticket)
  if (!entry) return false
  ticketStore.delete(ticket) // Single-use!
  if (entry.expiresAt < Date.now() || entry.sessionId !== sessionId) {
    return false
  }
  return verifyDeviceToken(sessionId, entry.deviceToken)
}

export async function applyPanoAction(
  sessionId: string,
  action: PanoAction,
  sourceDeviceId: string,
  updatedBy: 'board' | 'phone' = 'phone'
): Promise<PanoSharedState | null> {
  const session = await getPanoSession(sessionId)
  if (!session || session.status !== 'paired') {
    return null
  }

  const current = session.sharedState || {
    version: 1,
    updatedAt: Date.now(),
    sourceDeviceId,
    updatedBy,
    openWindows: [],
    activeWindowId: null,
    currentView: 'home',
    selectedClassId: session.teacherData?.selectedClassId ?? null,
    isLocked: false,
    ui: { openModal: null },
  }

  let nextOpenWindows = [...(current.openWindows || [])]
  let nextActiveWindowId = current.activeWindowId ?? null
  let nextCurrentView = current.currentView || 'home'
  let nextSelectedClassId = current.selectedClassId ?? null
  let nextSelectedClass: any | null = current.selectedClass ?? null
  let nextIsLocked = current.isLocked ?? false
  let nextUi = current.ui ? { ...current.ui } : { openModal: null }

  switch (action.type) {
    case 'SELECT_CLASS': {
      nextSelectedClassId = action.classId
      // Single source of truth: prefer the snapshot sent by the device, else the server-side teacher class list
      nextSelectedClass =
        action.classId === null
          ? null
          : action.class ||
            (session.teacherData?.classrooms || []).find((c: any) => c.id === action.classId) ||
            null
      nextUi = { openModal: null }
      break
    }
    case 'OPEN_APP': {
      const existingIdx = nextOpenWindows.findIndex(w => w.app.id === action.app.id)
      if (existingIdx >= 0) {
        nextOpenWindows = nextOpenWindows.map((w, idx) =>
          idx === existingIdx
            ? { ...w, currentPath: action.app.path || w.currentPath || w.app.path || '/dash' }
            : w
        )
      } else {
        nextOpenWindows.push({
          app: action.app,
          isMaximized: true,
          iframeKey: 1,
          currentPath: action.app.path || '/dash',
        })
      }
      nextActiveWindowId = action.app.id
      nextCurrentView = 'window'
      nextUi = { openModal: null }
      break
    }
    case 'CLOSE_WINDOW': {
      nextOpenWindows = nextOpenWindows.filter(w => w.app.id !== action.windowId)
      if (nextActiveWindowId === action.windowId) {
        nextActiveWindowId = nextOpenWindows.length > 0 ? nextOpenWindows[nextOpenWindows.length - 1].app.id : null
      }
      nextCurrentView = nextActiveWindowId ? 'window' : 'home'
      break
    }
    case 'TOGGLE_MAXIMIZE': {
      nextOpenWindows = nextOpenWindows.map(w =>
        w.app.id === action.windowId ? { ...w, isMaximized: !w.isMaximized } : w
      )
      break
    }
    case 'RELOAD_WINDOW': {
      nextOpenWindows = nextOpenWindows.map(w =>
        w.app.id === action.windowId ? { ...w, iframeKey: (w.iframeKey || 1) + 1 } : w
      )
      break
    }
    case 'FOCUS_WINDOW': {
      nextActiveWindowId = action.windowId
      nextCurrentView = 'window'
      break
    }
    case 'NAVIGATE': {
      nextOpenWindows = nextOpenWindows.map(w =>
        w.app.id === action.windowId ? { ...w, currentPath: action.path } : w
      )
      break
    }
    case 'OPEN_MODAL': {
      nextUi = { openModal: { id: action.modalId, payload: action.payload } }
      break
    }
    case 'CLOSE_MODAL': {
      nextUi = { openModal: null }
      break
    }
    case 'LOCK': {
      nextIsLocked = true
      break
    }
    case 'UNLOCK': {
      nextIsLocked = false
      break
    }
    case 'GO_HOME': {
      nextActiveWindowId = null
      nextCurrentView = 'home'
      break
    }
  }

  // Atomic update using MongoDB findOneAndUpdate + $inc
  let assignedVersion = (current.version || 0) + 1
  const updatedAt = Date.now()

  try {
    const coll = await getPanoCollection()
    if (coll) {
      const res = await coll.findOneAndUpdate(
        { sessionId },
        {
          $inc: { 'sharedState.version': 1 },
          $set: {
            'sharedState.updatedAt': updatedAt,
            'sharedState.sourceDeviceId': sourceDeviceId,
            'sharedState.updatedBy': updatedBy,
            'sharedState.openWindows': nextOpenWindows,
            'sharedState.activeWindowId': nextActiveWindowId,
            'sharedState.currentView': nextCurrentView,
            'sharedState.selectedClassId': nextSelectedClassId,
            'sharedState.selectedClass': nextSelectedClass,
            'sharedState.isLocked': nextIsLocked,
            'sharedState.ui': nextUi,
          },
        },
        { returnDocument: 'after' }
      )
      if (res?.sharedState?.version) {
        assignedVersion = res.sharedState.version
      }
    }
  } catch (err: any) {
    console.error('[PanoStore] applyPanoAction DB error:', err)
    if (isProduction) throw err
  }

  const nextState: PanoSharedState = {
    version: assignedVersion,
    updatedAt,
    sourceDeviceId,
    updatedBy,
    openWindows: nextOpenWindows,
    activeWindowId: nextActiveWindowId,
    currentView: nextCurrentView,
    selectedClassId: nextSelectedClassId,
    selectedClass: nextSelectedClass,
    isLocked: nextIsLocked,
    ui: nextUi,
  }

  session.sharedState = nextState
  store.memorySessions.set(sessionId, session)

  // Broadcast state event via in-process listeners & Redis pub/sub
  await publishSessionEvent(sessionId, {
    type: 'state',
    state: nextState,
  })

  return nextState
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

  const current = session.sharedState || {
    version: 1,
    updatedAt: Date.now(),
    sourceDeviceId,
    updatedBy,
    openWindows: [],
    activeWindowId: null,
    currentView: 'home',
    selectedClassId: session.teacherData?.selectedClassId ?? null,
    isLocked: false,
    ui: { openModal: null },
  }

  const nextOpenWindows = patch.openWindows !== undefined ? patch.openWindows : (current.openWindows || [])
  const nextActiveWindowId = patch.activeWindowId !== undefined ? patch.activeWindowId : (current.activeWindowId ?? null)
  const nextCurrentView = patch.currentView !== undefined ? patch.currentView : (current.currentView || 'home')
  const nextSelectedClassId = patch.selectedClassId !== undefined ? patch.selectedClassId : (current.selectedClassId ?? null)
  const nextIsLocked = patch.isLocked !== undefined ? patch.isLocked : (current.isLocked ?? false)
  const nextSelectedClass: any | null =
    patch.selectedClassId === undefined
      ? current.selectedClass ?? null
      : patch.selectedClassId === null
        ? null
        : (session.teacherData?.classrooms || []).find((c: any) => c.id === patch.selectedClassId) || null
  const nextUi = patch.ui !== undefined ? patch.ui : (current.ui || { openModal: null })

  let assignedVersion = (current.version || 0) + 1
  const updatedAt = Date.now()

  // Atomic update using MongoDB findOneAndUpdate + $inc
  try {
    const coll = await getPanoCollection()
    if (coll) {
      const res = await coll.findOneAndUpdate(
        { sessionId },
        {
          $inc: { 'sharedState.version': 1 },
          $set: {
            'sharedState.updatedAt': updatedAt,
            'sharedState.sourceDeviceId': sourceDeviceId,
            'sharedState.updatedBy': updatedBy,
            'sharedState.openWindows': nextOpenWindows,
            'sharedState.activeWindowId': nextActiveWindowId,
            'sharedState.currentView': nextCurrentView,
            'sharedState.selectedClassId': nextSelectedClassId,
            'sharedState.selectedClass': nextSelectedClass,
            'sharedState.isLocked': nextIsLocked,
            'sharedState.ui': nextUi,
          },
        },
        { returnDocument: 'after' }
      )
      if (res?.sharedState?.version) {
        assignedVersion = res.sharedState.version
      }
    }
  } catch (err: any) {
    console.error('[PanoStore] updatePanoSharedState DB error:', err)
    if (isProduction) throw err
  }

  const nextState: PanoSharedState = {
    version: assignedVersion,
    updatedAt,
    sourceDeviceId,
    updatedBy,
    openWindows: nextOpenWindows,
    activeWindowId: nextActiveWindowId,
    currentView: nextCurrentView,
    selectedClassId: nextSelectedClassId,
    selectedClass: nextSelectedClass,
    isLocked: nextIsLocked,
    ui: nextUi,
  }

  session.sharedState = nextState
  store.memorySessions.set(sessionId, session)

  // Broadcast state event via in-process listeners & Redis pub/sub
  await publishSessionEvent(sessionId, {
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

  // Broadcast closed event via in-process listeners & Redis pub/sub
  await publishSessionEvent(sessionId, {
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
