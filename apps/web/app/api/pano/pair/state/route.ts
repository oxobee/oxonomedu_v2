import { NextRequest, NextResponse } from 'next/server'
import {
  getPanoSession,
  updatePanoSharedState,
  applyPanoAction,
  getPanoSharedState,
  verifyDeviceToken,
  PanoSharedState,
  PanoAction,
  PanoPairSession,
} from '@/lib/pano-pair/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId')
  if (!sessionId) {
    return NextResponse.json({ success: false, error: 'sessionId gereklidir', code: 'bad_request' }, { status: 400 })
  }

  const token = req.nextUrl.searchParams.get('token') || req.headers.get('x-device-token')
  let isAuthorized = false
  try {
    isAuthorized = await verifyDeviceToken(sessionId, token)
  } catch (err: any) {
    if (err?.code === 'store_unavailable' || err?.message?.includes('Veritabanı') || err?.message?.includes('MONGODB_')) {
      return NextResponse.json({ success: false, error: 'Veritabanı yapılandırılmamış', code: 'store_unavailable' }, { status: 503 })
    }
    console.error('[PanoStateAPI] GET verifyDeviceToken error:', err)
    return NextResponse.json({ success: false, error: 'Sunucu doğrulama hatası', code: 'server_error' }, { status: 500 })
  }

  if (!isAuthorized) {
    return NextResponse.json({ success: false, error: 'Yetkisiz erişim: Geçersiz deviceToken', code: 'token_invalid' }, { status: 401 })
  }

  let session: PanoPairSession | null = null
  try {
    session = await getPanoSession(sessionId)
  } catch (err: any) {
    if (err?.code === 'store_unavailable' || err?.message?.includes('Veritabanı') || err?.message?.includes('MONGODB_')) {
      return NextResponse.json({ success: false, error: 'Veritabanı yapılandırılmamış', code: 'store_unavailable' }, { status: 503 })
    }
  }

  if (!session) {
    return NextResponse.json({ success: false, error: 'Oturum bulunamadı veya süresi doldu', code: 'session_not_found' }, { status: 404 })
  }

  if (session.status === 'closed') {
    return NextResponse.json({ success: false, error: 'Oturum kapatıldı', code: 'session_closed', closed: true }, { status: 403 })
  }

  if (session.status !== 'paired') {
    return NextResponse.json({ success: false, error: 'Aktif eşleştirilmiş oturum bulunamadı', code: 'session_not_paired' }, { status: 403 })
  }

  const state = await getPanoSharedState(sessionId)
  if (!state) {
    return NextResponse.json({ success: false, error: 'Oturum state verisi bulunamadı', code: 'session_not_found' }, { status: 404 })
  }

  // Version check for fast serverless polling (FAZ 4 Vercel Realtime)
  const sinceParam = req.nextUrl.searchParams.get('since')
  if (sinceParam !== null) {
    const sinceVersion = parseInt(sinceParam, 10)
    if (!isNaN(sinceVersion) && state.version <= sinceVersion) {
      return NextResponse.json({ success: true, changed: false, version: state.version })
    }
  }

  // Single source of truth for the class list: server-side teacher data (same list for board and phone)
  const classrooms = session.teacherData?.classrooms || []
  return NextResponse.json({ success: true, changed: true, state, classrooms })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { sessionId, deviceId, deviceToken, deviceType, state, action } = body

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'sessionId gereklidir', code: 'bad_request' }, { status: 400 })
    }

    if (!deviceId) {
      return NextResponse.json({ success: false, error: 'deviceId gereklidir', code: 'bad_request' }, { status: 400 })
    }

    const headerToken = req.headers.get('x-device-token')
    const effectiveToken = deviceToken || headerToken
    let isAuthorized = false
    try {
      isAuthorized = await verifyDeviceToken(sessionId, effectiveToken)
    } catch (err: any) {
      if (err?.code === 'store_unavailable' || err?.message?.includes('Veritabanı') || err?.message?.includes('MONGODB_')) {
        return NextResponse.json({ success: false, error: 'Veritabanı yapılandırılmamış', code: 'store_unavailable' }, { status: 503 })
      }
      console.error('[PanoStateAPI] POST verifyDeviceToken error:', err)
      return NextResponse.json({ success: false, error: 'Sunucu doğrulama hatası', code: 'server_error' }, { status: 500 })
    }

    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim: Geçersiz deviceToken', code: 'token_invalid' }, { status: 401 })
    }

    let session: PanoPairSession | null = null
    try {
      session = await getPanoSession(sessionId)
    } catch (err: any) {
      if (err?.code === 'store_unavailable' || err?.message?.includes('Veritabanı') || err?.message?.includes('MONGODB_')) {
        return NextResponse.json({ success: false, error: 'Veritabanı yapılandırılmamış', code: 'store_unavailable' }, { status: 503 })
      }
    }

    if (!session) {
      return NextResponse.json({ success: false, error: 'Oturum bulunamadı veya süresi doldu', code: 'session_not_found' }, { status: 404 })
    }

    if (session.status === 'closed') {
      return NextResponse.json({ success: false, error: 'Oturum kapatılmış', code: 'session_closed', closed: true }, { status: 403 })
    }

    if (session.status !== 'paired') {
      return NextResponse.json({ success: false, error: 'Oturum henüz eşleştirilmemiş', code: 'session_not_paired' }, { status: 403 })
    }

    // 1. Action-based Synchronization
    if (action && typeof action === 'object' && typeof action.type === 'string') {
      const updated = await applyPanoAction(
        sessionId,
        action as PanoAction,
        String(deviceId),
        deviceType === 'board' ? 'board' : 'phone'
      )

      if (!updated) {
        return NextResponse.json({ success: false, error: 'Aksiyon uygulanamadı', code: 'action_failed' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        state: updated,
      })
    }

    // 2. Backward compatibility: If state patch is provided
    if (state && typeof state === 'object') {
      const patch: Partial<PanoSharedState> = {}

      if (Array.isArray(state.openWindows)) {
        patch.openWindows = state.openWindows
      }

      if (state.activeWindowId !== undefined) {
        patch.activeWindowId = state.activeWindowId ? String(state.activeWindowId) : null
      }

      if (state.currentView === 'home' || state.currentView === 'window') {
        patch.currentView = state.currentView
      }

      if (typeof state.selectedClassId === 'number' || state.selectedClassId === null) {
        patch.selectedClassId = state.selectedClassId
      }

      if (typeof state.isLocked === 'boolean') {
        patch.isLocked = state.isLocked
      }

      if (state.ui && typeof state.ui === 'object') {
        patch.ui = state.ui
      }

      const updated = await updatePanoSharedState(
        sessionId,
        patch,
        String(deviceId),
        deviceType === 'board' ? 'board' : 'phone'
      )

      if (!updated) {
        return NextResponse.json({ success: false, error: 'State güncellenemedi', code: 'update_failed' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        state: updated,
      })
    }

    return NextResponse.json({ success: false, error: 'Aksiyon veya state verisi gereklidir', code: 'bad_request' }, { status: 400 })
  } catch (error: any) {
    console.error('[PanoStateAPI] Error:', error)
    if (error?.code === 'store_unavailable' || error?.message?.includes('Veritabanı') || error?.message?.includes('MONGODB_')) {
      return NextResponse.json({ success: false, error: 'Veritabanı yapılandırılmamış', code: 'store_unavailable' }, { status: 503 })
    }
    return NextResponse.json({ success: false, error: 'Sunucu hatası oluştu', code: 'server_error' }, { status: 500 })
  }
}
