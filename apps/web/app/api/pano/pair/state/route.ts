import { NextRequest, NextResponse } from 'next/server'
import { getPanoSession, updatePanoSharedState, getPanoSharedState, PanoSharedState } from '@/lib/pano-pair/store'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId')
  if (!sessionId) {
    return NextResponse.json({ success: false, error: 'sessionId gereklidir' }, { status: 400 })
  }

  const session = await getPanoSession(sessionId)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Oturum bulunamadı' }, { status: 404 })
  }

  if (session.status === 'closed') {
    return NextResponse.json({ success: false, error: 'Oturum kapatıldı', closed: true }, { status: 403 })
  }

  if (session.status !== 'paired') {
    return NextResponse.json({ success: false, error: 'Aktif eşleştirilmiş oturum bulunamadı' }, { status: 404 })
  }

  const state = await getPanoSharedState(sessionId)
  return NextResponse.json({ success: true, state })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { sessionId, deviceId, deviceType, state } = body

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'sessionId gereklidir' }, { status: 400 })
    }

    if (!deviceId) {
      return NextResponse.json({ success: false, error: 'deviceId gereklidir' }, { status: 400 })
    }

    const session = await getPanoSession(sessionId)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Oturum bulunamadı veya süresi doldu' }, { status: 404 })
    }

    if (session.status === 'closed') {
      return NextResponse.json({ success: false, error: 'Oturum kapatılmış', closed: true }, { status: 403 })
    }

    if (session.status !== 'paired') {
      return NextResponse.json({ success: false, error: 'Oturum henüz eşleştirilmemiş' }, { status: 403 })
    }

    if (!state || typeof state !== 'object') {
      return NextResponse.json({ success: false, error: 'Geçersiz state verisi' }, { status: 400 })
    }

    // Sanitize and validate patch fields
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

    if (typeof state.selectedClassId === 'number') {
      patch.selectedClassId = state.selectedClassId
    }

    if (typeof state.isLocked === 'boolean') {
      patch.isLocked = state.isLocked
    }

    const updated = await updatePanoSharedState(
      sessionId,
      patch,
      String(deviceId),
      deviceType === 'board' ? 'board' : 'phone'
    )

    if (!updated) {
      return NextResponse.json({ success: false, error: 'State güncellenemedi' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      state: updated,
    })
  } catch (error: any) {
    console.error('[PanoStateAPI] Error:', error)
    return NextResponse.json({ success: false, error: 'Sunucu hatası oluştu' }, { status: 500 })
  }
}
