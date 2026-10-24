// apps/web/lib/pano/boardPairingManager.ts
'use client'

import {
  getCurrentSchoolCode,
  isDemoSchool,
  getTenantBoards,
  saveTenantBoards,
} from '@/lib/schools/schoolTenantManager'
import { getStoredPrincipalProfile } from '@/lib/principal/principalProfileStorage'

export interface BoardPairingInfo {
  id: string
  code: string // e.g. PANO-4A-8392 or ANA-PANO
  name: string
  location: string
  type: 'lobby' | 'corridor' | 'teachers_lounge' | 'cafeteria' | 'classroom'
  classroom?: string // e.g. "4-A"
  schoolCode: string // e.g. "741295"
  schoolName: string // e.g. "Cumhuriyet İlkokulu"
  status: 'online' | 'offline' | 'standby'
  lastSeen: string
  resolution?: string
  slideDuration?: number
  dutyTeacherTicker?: boolean
  weatherWidget?: boolean
  bellSoundEnabled?: boolean
  announcementTicker?: boolean
  mealMenuEnabled?: boolean
  anthemEnabled?: boolean
  pairedAt?: string
  activeBoardNo?: string
}

export const GLOBAL_BOARD_REGISTRY_KEY = 'oxonom_global_board_registry'
export const ACTIVE_PAIRED_BOARD_KEY = 'oxonom_paired_board_session'
export const BOARD_SYNC_CHANNEL_NAME = 'oxonom_board_sync_channel'

const DEFAULT_DEMO_BOARDS: BoardPairingInfo[] = [
  {
    id: 'board-1',
    code: '1234',
    name: '1-A Sınıfı Akıllı Tahta',
    location: 'B Blok · 1. Kat 101 Nolu Derslik',
    type: 'classroom',
    status: 'offline',
    classroom: '1-A',
    schoolCode: '741295',
    schoolName: 'Necla Görer İlkokulu',
    slideDuration: 8,
    dutyTeacherTicker: false,
    weatherWidget: true,
    bellSoundEnabled: true,
    announcementTicker: true,
    mealMenuEnabled: false,
    anthemEnabled: true,
    lastSeen: 'Bağlantı Bekliyor',
    resolution: '1920x1080 (FHD)',
  },
  {
    id: 'board-2',
    code: '4321',
    name: '4-A Sınıfı Akıllı Tahta',
    location: 'B Blok · 2. Kat 204 Nolu Derslik',
    type: 'classroom',
    status: 'offline',
    classroom: '4-A',
    schoolCode: '741295',
    schoolName: 'Necla Görer İlkokulu',
    slideDuration: 12,
    dutyTeacherTicker: true,
    weatherWidget: true,
    bellSoundEnabled: true,
    announcementTicker: true,
    mealMenuEnabled: true,
    anthemEnabled: true,
    lastSeen: 'Bağlantı Bekliyor',
    resolution: '1920x1080 (FHD)',
  },
  {
    id: 'board-3',
    code: '7412',
    name: 'Ana Giriş & Lobi Panosu',
    location: 'Ana Bina · Zemin Kat Giriş Turnikeleri',
    type: 'lobby',
    status: 'offline',
    classroom: undefined,
    schoolCode: '741295',
    schoolName: 'Necla Görer İlkokulu',
    slideDuration: 10,
    dutyTeacherTicker: true,
    weatherWidget: true,
    bellSoundEnabled: true,
    announcementTicker: true,
    mealMenuEnabled: true,
    anthemEnabled: true,
    lastSeen: 'Bağlantı Bekliyor',
    resolution: '1920x1080 (FHD)',
  },
  {
    id: 'board-4',
    code: '8888',
    name: 'Öğretmenler Odası Bilgi Ekranı',
    location: 'A Blok · 2. Kat Öğretmenler Odası',
    type: 'teachers_lounge',
    status: 'offline',
    classroom: undefined,
    schoolCode: '741295',
    schoolName: 'Necla Görer İlkokulu',
    slideDuration: 15,
    dutyTeacherTicker: true,
    weatherWidget: true,
    bellSoundEnabled: true,
    announcementTicker: true,
    mealMenuEnabled: true,
    anthemEnabled: false,
    lastSeen: 'Bağlantı Bekliyor',
    resolution: '1920x1080 (FHD)',
  },
]

/**
 * Checks whether a 4-digit Pano Code is already used by another school in the multi-tenant system.
 */
export function isPanoCodeTakenByOtherSchool(
  code: string,
  currentSchoolCode: string
): { isTaken: boolean; usedBySchool?: string } {
  if (typeof window === 'undefined') return { isTaken: false }
  const clean = code.trim().toUpperCase()
  if (!clean) return { isTaken: false }

  // 1. Check Global Registry
  const registry = getGlobalBoardRegistry()
  const hit = registry[clean] || Object.values(registry).find((b) => b.code.toUpperCase() === clean)
  if (hit && String(hit.schoolCode) !== String(currentSchoolCode)) {
    return {
      isTaken: true,
      usedBySchool: hit.schoolName || `Okul Kodu: ${hit.schoolCode}`,
    }
  }

  // 2. Scan all tenant board partitions
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('oxonom_tenant_boards_')) {
      const sc = key.replace('oxonom_tenant_boards_', '')
      if (sc !== String(currentSchoolCode)) {
        try {
          const list = JSON.parse(localStorage.getItem(key) || '[]')
          if (Array.isArray(list)) {
            const match = list.find((b: any) => b.code && b.code.toUpperCase() === clean)
            if (match) {
              return {
                isTaken: true,
                usedBySchool: match.schoolName || `Okul Kodu: ${sc}`,
              }
            }
          }
        } catch (_) {}
      }
    }
  }

  return { isTaken: false }
}

/**
 * Generates a unique 4-digit random Pano Code (e.g. "0368") not taken by any school.
 */
export function generateUnique4DigitPanoCode(currentSchoolCode: string): string {
  for (let attempt = 0; attempt < 100; attempt++) {
    const rand = Math.floor(1000 + Math.random() * 9000).toString()
    const check = isPanoCodeTakenByOtherSchool(rand, currentSchoolCode)
    if (!check.isTaken) {
      return rand
    }
  }
  return Math.floor(1000 + Math.random() * 9000).toString()
}

/**
 * Legacy compatibility alias
 */
export function generateUniqueBoardCode(schoolCode?: string, classroom?: string): string {
  return generateUnique4DigitPanoCode(schoolCode || '741295')
}

/**
 * Formats a combined Pano + Board No (e.g. "0368-01")
 */
export function formatCompositeBoardCode(panoCode: string, boardNo: string | number = '01'): string {
  const cleanPano = panoCode.replace(/[^0-9A-Za-z]/g, '').padStart(4, '0')
  const cleanBoard = String(boardNo).replace(/[^0-9]/g, '').padStart(2, '0')
  return `${cleanPano}-${cleanBoard}`
}

/**
 * Dispatches sync events across tabs & windows
 */
function broadcastBoardUpdate(code?: string, status?: 'online' | 'offline') {
  if (typeof window === 'undefined') return
  try {
    // 1. Custom DOM event
    window.dispatchEvent(
      new CustomEvent('oxonom_boards_updated', {
        detail: { code, status, timestamp: Date.now() },
      })
    )

    // 2. Storage event trigger for other browser tabs
    localStorage.setItem('oxonom_boards_last_sync', `${Date.now()}_${code || ''}_${status || ''}`)

    // 3. BroadcastChannel for direct cross-tab message bus
    if ('BroadcastChannel' in window) {
      const bc = new BroadcastChannel(BOARD_SYNC_CHANNEL_NAME)
      bc.postMessage({ type: 'BOARD_STATUS_CHANGED', code, status, timestamp: Date.now() })
      bc.close()
    }
  } catch (_) {}
}

/**
 * Retrieves the global cross-tenant board registry
 */
export function getGlobalBoardRegistry(): Record<string, BoardPairingInfo> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(GLOBAL_BOARD_REGISTRY_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        return parsed
      }
    }

    // Initialize with default demo boards if empty
    const initialMap: Record<string, BoardPairingInfo> = {}
    for (const b of DEFAULT_DEMO_BOARDS) {
      initialMap[b.code.toUpperCase()] = b
    }
    localStorage.setItem(GLOBAL_BOARD_REGISTRY_KEY, JSON.stringify(initialMap))
    return initialMap
  } catch (_) {
    return {}
  }
}

/**
 * Saves the global board registry
 */
export function saveGlobalBoardRegistry(registry: Record<string, BoardPairingInfo>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(GLOBAL_BOARD_REGISTRY_KEY, JSON.stringify(registry))
    broadcastBoardUpdate()
  } catch (_) {}
}

/**
 * Registers or updates a board in the global registry and tenant storage
 */
export function registerBoardInGlobal(
  board: Partial<BoardPairingInfo> & { id: string; code: string; name: string },
  schoolCode: string,
  schoolName: string
): BoardPairingInfo {
  const normCode = board.code.trim().toUpperCase()
  const entry: BoardPairingInfo = {
    id: board.id,
    code: normCode,
    name: board.name,
    location: board.location || 'Genel Okul Alanı',
    type: board.type || 'corridor',
    classroom: board.classroom,
    schoolCode,
    schoolName,
    status: board.status || 'offline',
    lastSeen: board.lastSeen || (board.status === 'online' ? 'Canlı (Şimdi)' : 'Bağlantı Bekliyor'),
    resolution: board.resolution || '1920x1080 (FHD)',
    slideDuration: board.slideDuration || 10,
    dutyTeacherTicker: board.dutyTeacherTicker ?? true,
    weatherWidget: board.weatherWidget ?? true,
    bellSoundEnabled: board.bellSoundEnabled ?? true,
    announcementTicker: board.announcementTicker ?? true,
    mealMenuEnabled: board.mealMenuEnabled ?? true,
    anthemEnabled: board.anthemEnabled ?? true,
    pairedAt: board.pairedAt,
  }

  // 1. Update Global Registry
  const registry = getGlobalBoardRegistry()
  registry[normCode] = entry
  saveGlobalBoardRegistry(registry)

  // 2. Also notify server API asynchronously
  if (typeof window !== 'undefined') {
    fetch('/api/pano/board-registry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', board: entry, schoolCode, schoolName }),
      keepalive: true,
    }).catch(() => {})
  }

  return entry
}

/**
 * Unregisters a board from the global registry
 */
export function unregisterBoardFromGlobal(boardId: string, code?: string): void {
  const registry = getGlobalBoardRegistry()
  if (code && registry[code.toUpperCase()]) {
    delete registry[code.toUpperCase()]
  } else {
    for (const k of Object.keys(registry)) {
      if (registry[k].id === boardId) {
        delete registry[k]
        break
      }
    }
  }
  saveGlobalBoardRegistry(registry)
}

/**
 * Look up a board across all schools by its unique pairing code
 */
export function findBoardByPairingCode(code: string): BoardPairingInfo | null {
  if (!code || typeof window === 'undefined') return null
  const clean = code.trim().toUpperCase()
  const stripped = clean.replace(/[^A-Z0-9]/g, '')

  // 1. Check Global Registry
  const registry = getGlobalBoardRegistry()
  if (registry[clean]) {
    return registry[clean]
  }

  // 1b. Check without hyphens / flexible match
  for (const k of Object.keys(registry)) {
    if (k.replace(/[^A-Z0-9]/g, '') === stripped) {
      return registry[k]
    }
  }

  // 1c. Check default demo boards directly
  for (const demo of DEFAULT_DEMO_BOARDS) {
    if (demo.code === clean || demo.code === stripped) {
      registerBoardInGlobal(demo, demo.schoolCode, demo.schoolName)
      return demo
    }
  }

  // Fallback demo match for standard 123456 test PIN
  if (stripped === '123456') {
    const demo = DEFAULT_DEMO_BOARDS[0]
    registerBoardInGlobal(demo, demo.schoolCode, demo.schoolName)
    return demo
  }

  // 2. Search all tenant board storage partitions
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('oxonom_tenant_boards_')) {
      const scCode = key.replace('oxonom_tenant_boards_', '')
      try {
        const boards = JSON.parse(localStorage.getItem(key) || '[]')
        if (Array.isArray(boards)) {
          const match = boards.find(
            (b: any) =>
              b.code &&
              (b.code.toUpperCase() === clean ||
                b.code.toUpperCase().replace(/[^A-Z0-9]/g, '') === stripped)
          )
          if (match) {
            const registered = registerBoardInGlobal(
              match,
              match.schoolCode || scCode,
              match.schoolName || 'Okul Panosu'
            )
            return registered
          }
        }
      } catch (_) {}
    }
  }

  return null
}

/**
 * Updates a board's live status (online or offline) in:
 * - The Global Board Registry
 * - The school's isolated tenant boards
 * - Dispatches broadcast events for instant live UI reflection in Principal portal
 */
export function setBoardLiveStatus(
  pairingCodeOrId: string,
  status: 'online' | 'offline'
): BoardPairingInfo | null {
  if (typeof window === 'undefined') return null
  const clean = pairingCodeOrId.trim().toUpperCase()
  const board = findBoardByPairingCode(clean)
  if (!board) return null

  const nowText = status === 'online' ? 'Canlı (Şimdi)' : 'Az önce ayrıldı'
  board.status = status
  board.lastSeen = nowText
  if (status === 'online') {
    board.pairedAt = new Date().toISOString()
  }

  // 1. Update Global Registry
  const registry = getGlobalBoardRegistry()
  registry[board.code.toUpperCase()] = board
  localStorage.setItem(GLOBAL_BOARD_REGISTRY_KEY, JSON.stringify(registry))

  // 2. Update School Tenant Boards
  try {
    const tenantBoards = getTenantBoards(board.schoolCode) || []
    const updatedTenantBoards = tenantBoards.map((b: any) => {
      if (b.id === board.id || (b.code && b.code.toUpperCase() === board.code.toUpperCase())) {
        return {
          ...b,
          status,
          lastSeen: nowText,
        }
      }
      return b
    })
    saveTenantBoards(updatedTenantBoards, board.schoolCode)
  } catch (_) {}

  // 3. Update legacy demo board storage if applicable
  try {
    const legacyRaw = localStorage.getItem('oxonom_school_digital_boards')
    if (legacyRaw) {
      const legacyBoards = JSON.parse(legacyRaw)
      if (Array.isArray(legacyBoards)) {
        const nextLegacy = legacyBoards.map((b: any) => {
          if (b.id === board.id || (b.code && b.code.toUpperCase() === board.code.toUpperCase())) {
            return {
              ...b,
              status,
              lastSeen: nowText,
            }
          }
          return b
        })
        localStorage.setItem('oxonom_school_digital_boards', JSON.stringify(nextLegacy))
      }
    }
  } catch (_) {}

  // 4. Update currently active paired session if matching
  try {
    const active = getActivePairedBoardSession()
    if (active && active.code.toUpperCase() === board.code.toUpperCase()) {
      if (status === 'offline') {
        localStorage.removeItem(ACTIVE_PAIRED_BOARD_KEY)
      } else {
        localStorage.setItem(ACTIVE_PAIRED_BOARD_KEY, JSON.stringify(board))
      }
    }
  } catch (_) {}

  // 5. Broadcast to all open tabs & principal screen
  broadcastBoardUpdate(board.code, status)

  // 6. Notify server API asynchronously
  fetch('/api/pano/board-registry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'status',
      code: board.code,
      status,
      schoolCode: board.schoolCode,
    }),
    keepalive: true,
  }).catch(() => {})

  return board
}

/**
 * Gets the current active paired board session on this screen
 */
export function getActivePairedBoardSession(): BoardPairingInfo | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(ACTIVE_PAIRED_BOARD_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.code) {
        return parsed
      }
    }
  } catch (_) {}
  return null
}

/**
 * Sets or clears the active paired board session
 */
export function setActivePairedBoardSession(session: BoardPairingInfo | null): void {
  if (typeof window === 'undefined') return
  try {
    if (session) {
      localStorage.setItem(ACTIVE_PAIRED_BOARD_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(ACTIVE_PAIRED_BOARD_KEY)
    }
  } catch (_) {}
}

/**
 * Pairs the board screen using the principal's pairing code
 */
export function pairBoardWithCode(code: string): {
  success: boolean
  board?: BoardPairingInfo
  error?: string
} {
  const found = findBoardByPairingCode(code)
  if (!found) {
    return {
      success: false,
      error:
        'Geçersiz veya kayıtlı olmayan pano kodu! Lütfen okul müdürünüzün oluşturduğu kodu kontrol ediniz.',
    }
  }

  // Set status online
  const activated = setBoardLiveStatus(found.code, 'online') || found
  setActivePairedBoardSession(activated)

  return {
    success: true,
    board: activated,
  }
}

/**
 * Disconnects the board and reverts status to offline (red)
 */
export function disconnectActiveBoard(): void {
  const current = getActivePairedBoardSession()
  if (current) {
    setBoardLiveStatus(current.code, 'offline')
    setActivePairedBoardSession(null)
  }
}
