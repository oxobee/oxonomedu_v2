// apps/web/app/api/pano/board-registry/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// In-memory board registry cache on the server
interface ServerBoardEntry {
  code: string
  id: string
  name: string
  location: string
  type: string
  classroom?: string
  schoolCode: string
  schoolName: string
  status: 'online' | 'offline'
  lastSeen: string
  updatedAt: string
}

declare global {
  // eslint-disable-next-line no-var
  var __oxonomServerBoardRegistry: Map<string, ServerBoardEntry> | undefined
}

const registryMap: Map<string, ServerBoardEntry> =
  globalThis.__oxonomServerBoardRegistry ||
  (globalThis.__oxonomServerBoardRegistry = new Map<string, ServerBoardEntry>())

// Seed default demo boards
if (registryMap.size === 0) {
  registryMap.set('ANA-PANO', {
    code: 'ANA-PANO',
    id: 'board-1',
    name: 'Ana Giriş & Lobi Panosu',
    location: 'Ana Bina · Zemin Kat Giriş Turnikeleri',
    type: 'lobby',
    schoolCode: '741295',
    schoolName: 'Necla Görer İlkokulu',
    status: 'offline',
    lastSeen: 'Bağlantı Bekliyor',
    updatedAt: new Date().toISOString(),
  })
  registryMap.set('1-A', {
    code: '1-A',
    id: 'board-3',
    name: '1-A Sınıfı Akıllı Tahta',
    location: 'B Blok · 1. Kat 101 Nolu Derslik',
    type: 'classroom',
    classroom: '1-A',
    schoolCode: '741295',
    schoolName: 'Necla Görer İlkokulu',
    status: 'offline',
    lastSeen: 'Bağlantı Bekliyor',
    updatedAt: new Date().toISOString(),
  })
}

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code')?.trim().toUpperCase()
    const schoolCode = req.nextUrl.searchParams.get('schoolCode')?.trim()

    if (code) {
      const entry = registryMap.get(code)
      if (entry) {
        return NextResponse.json({ success: true, board: entry })
      }
      return NextResponse.json({ success: false, error: 'Pano bulunamadı' }, { status: 404 })
    }

    if (schoolCode) {
      const list = Array.from(registryMap.values()).filter((b) => b.schoolCode === schoolCode)
      return NextResponse.json({ success: true, boards: list })
    }

    return NextResponse.json({
      success: true,
      count: registryMap.size,
      boards: Array.from(registryMap.values()),
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, board, code, status, schoolCode, schoolName } = body

    if (action === 'register' && board) {
      const normCode = String(board.code).trim().toUpperCase()
      const entry: ServerBoardEntry = {
        code: normCode,
        id: board.id || `board-${Date.now()}`,
        name: board.name,
        location: board.location || 'Genel Okul Alanı',
        type: board.type || 'corridor',
        classroom: board.classroom,
        schoolCode: schoolCode || board.schoolCode || '741295',
        schoolName: schoolName || board.schoolName || 'Okul Panosu',
        status: board.status || 'offline',
        lastSeen: board.lastSeen || (board.status === 'online' ? 'Canlı (Şimdi)' : 'Bağlantı Bekliyor'),
        updatedAt: new Date().toISOString(),
      }
      registryMap.set(normCode, entry)
      return NextResponse.json({ success: true, board: entry })
    }

    if (action === 'status' && code) {
      const normCode = String(code).trim().toUpperCase()
      const entry = registryMap.get(normCode)
      if (entry) {
        entry.status = status || 'offline'
        entry.lastSeen = status === 'online' ? 'Canlı (Şimdi)' : 'Az önce ayrıldı'
        entry.updatedAt = new Date().toISOString()
        return NextResponse.json({ success: true, board: entry })
      } else {
        // If not present, create stub
        const newEntry: ServerBoardEntry = {
          code: normCode,
          id: `board-${Date.now()}`,
          name: `${normCode} Panosu`,
          location: 'Okul Alanı',
          type: 'classroom',
          schoolCode: schoolCode || '741295',
          schoolName: 'Okul Panosu',
          status: status || 'offline',
          lastSeen: status === 'online' ? 'Canlı (Şimdi)' : 'Az önce ayrıldı',
          updatedAt: new Date().toISOString(),
        }
        registryMap.set(normCode, newEntry)
        return NextResponse.json({ success: true, board: newEntry })
      }
    }

    return NextResponse.json({ success: false, error: 'Geçersiz istek' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
