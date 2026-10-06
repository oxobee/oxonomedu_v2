import { getAPIUrl } from '@services/config/config'
import {
  RequestBodyWithAuthHeader,
  errorHandling,
} from '@services/utils/ts/requests'
import { SYNCED_BOARDS } from '@services/demo/databaseSync'
import { ALL_CLASSROOM_BOARDS, generateClassroomBoards, getActiveClassroom } from '@services/demo/schoolDirectory'

const CUSTOM_BOARDS_STORAGE_KEY = 'oxonom_custom_created_boards_v2'

export function getStoredCustomBoards(orgId?: number): any[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CUSTOM_BOARDS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    if (orgId) {
      return parsed.filter((b) => !b.org_id || Number(b.org_id) === Number(orgId))
    }
    return parsed
  } catch (e) {
    console.warn('Failed to load custom boards from storage:', e)
    return []
  }
}

export function saveStoredCustomBoard(board: any): void {
  if (typeof window === 'undefined') return
  try {
    const current = getStoredCustomBoards()
    const filtered = current.filter(
      (b) => b.board_uuid !== board.board_uuid && String(b.id) !== String(board.id)
    )
    const updated = [board, ...filtered]
    localStorage.setItem(CUSTOM_BOARDS_STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('oxonom_boards_updated', { detail: board }))
  } catch (e) {
    console.warn('Failed to save custom board to storage:', e)
  }
}

export function deleteStoredCustomBoard(boardUuid: string): void {
  if (typeof window === 'undefined') return
  try {
    const cleanUuid = boardUuid.replace('board_', '')
    const current = getStoredCustomBoards()
    const updated = current.filter(
      (b) =>
        b.board_uuid !== boardUuid &&
        b.board_uuid !== `board_${cleanUuid}` &&
        String(b.id) !== boardUuid
    )
    localStorage.setItem(CUSTOM_BOARDS_STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(
      new CustomEvent('oxonom_boards_updated', { detail: { board_uuid: boardUuid } })
    )
  } catch (e) {
    console.warn('Failed to delete custom board from storage:', e)
  }
}

export async function createBoard(
  orgId: number,
  data: {
    name: string
    description?: string
    thumbnail_image?: string
    usergroup_id?: number
    features?: any
    share_type?: string
    share_code?: string | null
    creation_date?: string
    board_date?: string
    blank?: boolean
  },
  access_token?: string
) {
  let createdBoard: any = null

  try {
    const result = await fetch(
      `${getAPIUrl()}boards/?org_id=${orgId}`,
      RequestBodyWithAuthHeader('POST', data, null, access_token || '')
    )
    if (result.ok) {
      createdBoard = await errorHandling(result)
    }
  } catch (_err) {
    // Offline or proxy fallback
  }

  if (!createdBoard || !createdBoard.board_uuid) {
    const uniqueId = Date.now()
    const boardUuid = `board_${uniqueId}_${Math.random().toString(36).substring(2, 7)}`
    createdBoard = {
      id: uniqueId,
      board_uuid: boardUuid,
      org_id: orgId || 1,
      usergroup_id: data.usergroup_id || null,
      name: data.name,
      description: data.description || '',
      thumbnail_image: data.thumbnail_image || null,
      slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      published: true,
      creation_date: data.creation_date || new Date().toISOString(),
      board_date: data.board_date || new Date().toISOString().split('T')[0],
      update_date: new Date().toISOString(),
      is_owner: true,
      is_member: true,
      is_custom: true,
      blank: data.blank !== false,
      member_count: 1,
      share_type: data.share_type || 'public',
      share_code: data.share_code || null,
      features: {
        ...(data.features || {}),
        blank: data.blank !== false,
        board_date: data.board_date || new Date().toISOString().split('T')[0],
        effects_enabled: true,
        chat_enabled: true,
        reactions_enabled: true,
      },
      creator: {
        username: 'Öğretmen',
        avatar_image: null,
      },
    }
  } else {
    createdBoard.is_custom = true
    createdBoard.blank = data.blank !== false
    createdBoard.board_date = data.board_date || new Date().toISOString().split('T')[0]
    if (data.usergroup_id) createdBoard.usergroup_id = data.usergroup_id
  }

  saveStoredCustomBoard(createdBoard)

  if (!ALL_CLASSROOM_BOARDS.some((b: any) => b.board_uuid === createdBoard.board_uuid)) {
    ALL_CLASSROOM_BOARDS.unshift(createdBoard)
  }
  if (!SYNCED_BOARDS.some((b: any) => b.board_uuid === createdBoard.board_uuid)) {
    SYNCED_BOARDS.unshift(createdBoard)
  }

  return createdBoard
}

export async function getClassroomBoards(usergroupId: number, access_token?: string) {
  let serverBoards: any[] = []
  try {
    const result = await fetch(
      `${getAPIUrl()}boards/classroom/${usergroupId}`,
      RequestBodyWithAuthHeader('GET', null, null, access_token || '')
    )
    if (result.ok) {
      const data = await errorHandling(result)
      if (Array.isArray(data)) serverBoards = data
    }
  } catch (_err) {}

  const localCustom = getStoredCustomBoards()
  // Strictly filter custom boards by classroom's usergroupId
  const classCustom = localCustom.filter(
    (b) => Number(b.usergroup_id) === Number(usergroupId)
  )

  if (serverBoards.length > 0) {
    const uuids = new Set(serverBoards.map((b) => b.board_uuid))
    const uniqueLocal = classCustom.filter((b) => !uuids.has(b.board_uuid))
    return [...uniqueLocal, ...serverBoards]
  }

  // Strictly filter ALL_CLASSROOM_BOARDS by usergroupId (never leak boards from other classes)
  const match = ALL_CLASSROOM_BOARDS.filter((b) => Number(b.usergroup_id) === Number(usergroupId))
  const uuids = new Set(match.map((b) => b.board_uuid))
  const uniqueLocal = classCustom.filter((b) => !uuids.has(b.board_uuid))
  return [...uniqueLocal, ...match]
}

export async function getBoards(orgId: number, access_token?: string) {
  let serverBoards: any[] = []
  try {
    const result = await fetch(
      `${getAPIUrl()}boards/org/${orgId}`,
      RequestBodyWithAuthHeader('GET', null, null, access_token || '')
    )
    if (result.ok) {
      const data = await errorHandling(result)
      if (Array.isArray(data)) serverBoards = data
    }
  } catch (_err) {}

  const localCustom = getStoredCustomBoards(orgId)

  if (serverBoards.length > 0) {
    const uuids = new Set(serverBoards.map((b) => b.board_uuid))
    const uniqueLocal = localCustom.filter((b) => !uuids.has(b.board_uuid))
    return [...uniqueLocal, ...serverBoards]
  }

  let activeCode = '1-A'
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const cookieMatch = document.cookie?.match(/oxonom_demo_student_active_class=([^;]+)/)
    if (cookieMatch) activeCode = decodeURIComponent(cookieMatch[1])
    else activeCode = localStorage.getItem('oxonom_demo_student_active_class') || '1-A'
  }
  const cls = getActiveClassroom(activeCode)
  const baseBoards = generateClassroomBoards(cls)
  const uuids = new Set(baseBoards.map((b) => b.board_uuid))
  const uniqueLocal = localCustom.filter((b) => !uuids.has(b.board_uuid))
  return [...uniqueLocal, ...baseBoards]
}

export async function getBoard(boardUuid: string, access_token?: string) {
  const clean = boardUuid.replace('board_', '')
  const localCustom = getStoredCustomBoards()
  const customMatch = localCustom.find(
    (x: any) =>
      x.board_uuid === boardUuid ||
      x.board_uuid === `board_${clean}` ||
      String(x.id) === boardUuid
  )
  if (customMatch) return customMatch

  try {
    const result = await fetch(
      `${getAPIUrl()}boards/${boardUuid}`,
      RequestBodyWithAuthHeader('GET', null, null, access_token || '')
    )
    if (result.ok) {
      return await errorHandling(result)
    }
  } catch (_err) {}

  const b =
    ALL_CLASSROOM_BOARDS.find(
      (x: any) => x.board_uuid === boardUuid || x.board_uuid === `board_${clean}`
    ) ||
    SYNCED_BOARDS.find(
      (x: any) => x.board_uuid === boardUuid || x.board_uuid === `board_${clean}`
    )
  if (b) return b

  return {
    id: Date.now(),
    board_uuid: boardUuid.startsWith('board_') ? boardUuid : `board_${boardUuid}`,
    name: 'Akıllı Tahta',
    description: '',
    public: true,
    published: true,
    creation_date: new Date().toISOString(),
    update_date: new Date().toISOString(),
    is_owner: true,
    is_member: true,
    member_count: 1,
    share_type: 'public',
    features: {
      effects_enabled: true,
      chat_enabled: true,
      reactions_enabled: true,
    },
    creator: {
      username: 'Öğretmen',
      avatar_image: null,
    },
  }
}

export async function updateBoard(
  boardUuid: string,
  data: {
    name?: string
    description?: string
    thumbnail_image?: string
    public?: boolean
    features?: any
    share_type?: string
    share_code?: string | null
  },
  access_token?: string
) {
  const localCustom = getStoredCustomBoards()
  const clean = boardUuid.replace('board_', '')
  const found = localCustom.find(
    (b) => b.board_uuid === boardUuid || b.board_uuid === `board_${clean}`
  )
  if (found) {
    const updated = { ...found, ...data, update_date: new Date().toISOString() }
    saveStoredCustomBoard(updated)
  }

  try {
    const result = await fetch(
      `${getAPIUrl()}boards/${boardUuid}`,
      RequestBodyWithAuthHeader('PUT', data, null, access_token || '')
    )
    if (result.ok) {
      return await errorHandling(result)
    }
  } catch (_err) {}

  return found || { ...data, board_uuid: boardUuid }
}

export async function duplicateBoard(boardUuid: string, access_token?: string) {
  try {
    const result = await fetch(
      `${getAPIUrl()}boards/${boardUuid}/duplicate`,
      RequestBodyWithAuthHeader('POST', null, null, access_token || '')
    )
    if (result.ok) {
      const dup = await errorHandling(result)
      if (dup?.board_uuid) {
        saveStoredCustomBoard(dup)
        return dup
      }
    }
  } catch (_err) {}

  const orig = await getBoard(boardUuid, access_token)
  const uniqueId = Date.now()
  const newUuid = `board_${uniqueId}_${Math.random().toString(36).substring(2, 7)}`
  const duplicate = {
    ...orig,
    id: uniqueId,
    board_uuid: newUuid,
    name: `${orig.name} (Kopya)`,
    creation_date: new Date().toISOString(),
    update_date: new Date().toISOString(),
  }
  saveStoredCustomBoard(duplicate)
  ALL_CLASSROOM_BOARDS.unshift(duplicate as any)
  SYNCED_BOARDS.unshift(duplicate as any)
  return duplicate
}

export async function deleteBoard(boardUuid: string, access_token?: string) {
  deleteStoredCustomBoard(boardUuid)
  const clean = boardUuid.replace('board_', '')
  const indexCls = ALL_CLASSROOM_BOARDS.findIndex(
    (b: any) => b.board_uuid === boardUuid || b.board_uuid === `board_${clean}`
  )
  if (indexCls !== -1) ALL_CLASSROOM_BOARDS.splice(indexCls, 1)

  const indexSync = SYNCED_BOARDS.findIndex(
    (b: any) => b.board_uuid === boardUuid || b.board_uuid === `board_${clean}`
  )
  if (indexSync !== -1) SYNCED_BOARDS.splice(indexSync, 1)

  try {
    const result = await fetch(
      `${getAPIUrl()}boards/${boardUuid}`,
      RequestBodyWithAuthHeader('DELETE', null, null, access_token || '')
    )
    if (result.ok) {
      return await errorHandling(result)
    }
  } catch (_err) {}

  return { success: true }
}

export async function addBoardMember(
  boardUuid: string,
  data: { user_id: number; role?: string },
  access_token: string
) {
  const result = await fetch(
    `${getAPIUrl()}boards/${boardUuid}/members`,
    RequestBodyWithAuthHeader('POST', data, null, access_token)
  )
  return errorHandling(result)
}

export async function addBoardMembersBatch(
  boardUuid: string,
  members: { user_id: number; role: string }[],
  access_token: string
) {
  const result = await fetch(
    `${getAPIUrl()}boards/${boardUuid}/members/batch`,
    RequestBodyWithAuthHeader('POST', { members }, null, access_token)
  )
  return errorHandling(result)
}

export async function removeBoardMember(
  boardUuid: string,
  userId: number,
  access_token: string
) {
  const result = await fetch(
    `${getAPIUrl()}boards/${boardUuid}/members/${userId}`,
    RequestBodyWithAuthHeader('DELETE', null, null, access_token)
  )
  return errorHandling(result)
}

export async function getBoardMembers(
  boardUuid: string,
  access_token: string
) {
  const result = await fetch(
    `${getAPIUrl()}boards/${boardUuid}/members`,
    RequestBodyWithAuthHeader('GET', null, null, access_token)
  )
  return errorHandling(result)
}

export async function updateBoardThumbnail(
  boardUuid: string,
  file: File,
  access_token: string
) {
  const formData = new FormData()
  formData.append('thumbnail', file)
  const result = await fetch(
    `${getAPIUrl()}boards/${boardUuid}/thumbnail`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      body: formData,
    }
  )
  return errorHandling(result)
}

export async function getBoardPublicInfo(boardUuid: string) {
  const clean = boardUuid.replace('board_', '')
  const cleanUuid = boardUuid.startsWith('board_') ? boardUuid : `board_${boardUuid}`

  const localCustom = getStoredCustomBoards()
  const customMatch = localCustom.find(
    (x: any) =>
      x.board_uuid === boardUuid ||
      x.board_uuid === cleanUuid ||
      x.board_uuid === `board_${clean}` ||
      String(x.id) === boardUuid
  )
  if (customMatch) {
    return {
      board_uuid: customMatch.board_uuid,
      name: customMatch.name || 'Akıllı Tahta',
      description: customMatch.description || '',
      public: true,
      share_type: customMatch.share_type || 'public',
      has_code: Boolean(customMatch.share_code),
      share_code: customMatch.share_code || null,
    }
  }

  try {
    const result = await fetch(`${getAPIUrl()}boards/${cleanUuid}/public-info`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (result.ok) {
      return await errorHandling(result)
    }
  } catch (_err) {}

  const b =
    ALL_CLASSROOM_BOARDS.find((x: any) => x.board_uuid === boardUuid || x.board_uuid === `board_${clean}`) ||
    SYNCED_BOARDS.find((x: any) => x.board_uuid === boardUuid || x.board_uuid === `board_${clean}`)

  return {
    board_uuid: boardUuid,
    name: b?.name || 'Akıllı Tahta',
    description: b?.description || '',
    public: true,
    share_type: 'public',
    has_code: false,
    share_code: null,
  }
}

export async function getBoardByShortCode(shortCode: string) {
  try {
    const result = await fetch(`${getAPIUrl()}boards/by-short/${shortCode}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (result.ok) {
      return await errorHandling(result)
    }
  } catch (_err) {}

  const b = SYNCED_BOARDS.find((x: any) => x.short_code === shortCode)
  return b || null
}

export async function updateBoardShareSettings(
  boardUuid: string,
  shareType: 'public' | 'code' | 'view' | string,
  shareCode: string | null,
  access_token: string
) {
  const cleanUuid = boardUuid.startsWith('board_') ? boardUuid : `board_${boardUuid}`
  const result = await fetch(
    `${getAPIUrl()}boards/${cleanUuid}/share-settings`,
    RequestBodyWithAuthHeader(
      'PUT',
      JSON.stringify({
        share_type: shareType,
        share_code: shareCode,
      }),
      'application/json',
      access_token
    )
  )
  return errorHandling(result)
}

export async function getBoardGuestAccess(boardUuid: string, code?: string) {
  const cleanUuid = boardUuid.startsWith('board_') ? boardUuid : `board_${boardUuid}`
  try {
    const result = await fetch(`${getAPIUrl()}boards/${cleanUuid}/guest-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code || null }),
    })
    if (result.ok) {
      return await errorHandling(result)
    }
  } catch (_err) {}

  return {
    access_token: 'demo_guest_token_' + Date.now(),
    username: 'Misafir Katılımcı',
    role: 'guest',
  }
}
