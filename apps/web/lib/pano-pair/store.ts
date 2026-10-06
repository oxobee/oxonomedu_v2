// In-memory Realtime Pairing Store for Oxonom Smart Board (Pano OS)

export interface TeacherPairData {
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
  selectedClassId?: number
  classrooms?: any[]
  settings?: any
}

export interface PanoPairSession {
  sessionId: string
  code: string // 6-digit string
  createdAt: number
  expiresAt: number
  status: 'waiting' | 'paired' | 'expired'
  teacherData?: TeacherPairData
}

type SessionListener = (session: PanoPairSession) => void

// Use globalThis to persist session store across hot reloads in Next.js
interface GlobalPanoStore {
  sessions: Map<string, PanoPairSession>
  codeToSessionId: Map<string, string>
  listeners: Map<string, Set<SessionListener>>
}

const g = globalThis as unknown as { _panoPairStore?: GlobalPanoStore }

if (!g._panoPairStore) {
  g._panoPairStore = {
    sessions: new Map(),
    codeToSessionId: new Map(),
    listeners: new Map(),
  }
}

const store = g._panoPairStore

// Helper to generate a unique 6-digit numeric code
function generateUniqueCode(): string {
  let code = ''
  let attempts = 0
  const now = Date.now()

  while (attempts < 100) {
    const num = Math.floor(100000 + Math.random() * 900000)
    code = String(num)
    const existingId = store.codeToSessionId.get(code)
    if (!existingId) break

    const existing = store.sessions.get(existingId)
    if (!existing || existing.expiresAt < now) {
      store.codeToSessionId.delete(code)
      break
    }
    attempts++
  }
  return code
}

// Cleanup expired sessions periodically
function cleanExpired() {
  const now = Date.now()
  for (const [id, sess] of store.sessions.entries()) {
    if (sess.expiresAt < now) {
      store.codeToSessionId.delete(sess.code)
      store.sessions.delete(id)
      store.listeners.delete(id)
    }
  }
}

export function createPanoSession(ttlMs = 5 * 60 * 1000): PanoPairSession {
  cleanExpired()

  const sessionId = `pano_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  const code = generateUniqueCode()
  const now = Date.now()

  const session: PanoPairSession = {
    sessionId,
    code,
    createdAt: now,
    expiresAt: now + ttlMs,
    status: 'waiting',
  }

  store.sessions.set(sessionId, session)
  store.codeToSessionId.set(code, sessionId)

  return session
}

export function getPanoSession(sessionId: string): PanoPairSession | null {
  const session = store.sessions.get(sessionId)
  if (!session) return null

  if (session.expiresAt < Date.now()) {
    session.status = 'expired'
    store.codeToSessionId.delete(session.code)
    store.sessions.delete(sessionId)
    return session
  }

  return session
}

export function getPanoSessionByCode(code: string): PanoPairSession | null {
  const clean = code.replace(/[^0-9]/g, '')
  const sessionId = store.codeToSessionId.get(clean)
  if (!sessionId) return null
  return getPanoSession(sessionId)
}

export function pairPanoSession(
  identifier: { code?: string; sessionId?: string },
  teacherData: TeacherPairData
): { success: boolean; session?: PanoPairSession; error?: string } {
  cleanExpired()

  let session: PanoPairSession | null = null

  if (identifier.sessionId) {
    session = getPanoSession(identifier.sessionId)
  } else if (identifier.code) {
    session = getPanoSessionByCode(identifier.code)
  }

  if (!session) {
    return { success: false, error: 'Geçersiz veya süresi dolmuş eşleştirme kodu.' }
  }

  if (session.status === 'expired') {
    return { success: false, error: 'Eşleştirme kodunun süresi dolmuş. Lütfen tahtadaki yeni kodu deneyin.' }
  }

  session.status = 'paired'
  session.teacherData = teacherData
  store.sessions.set(session.sessionId, session)

  // Notify active SSE listeners immediately
  const listeners = store.listeners.get(session.sessionId)
  if (listeners) {
    for (const listener of listeners) {
      try {
        listener(session)
      } catch (err) {
        console.error('[PanoStore] Listener error:', err)
      }
    }
  }

  return { success: true, session }
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

export function closePanoSession(sessionId: string): void {
  const sess = store.sessions.get(sessionId)
  if (sess) {
    store.codeToSessionId.delete(sess.code)
    store.sessions.delete(sessionId)
    store.listeners.delete(sessionId)
  }
}
