import { NextRequest, NextResponse } from 'next/server'
import {
  getPanoSession,
  updatePanoSharedState,
  verifyDeviceToken,
} from '@/lib/pano-pair/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('sessionId')
    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'sessionId gereklidir' }, { status: 400 })
    }

    const token = req.nextUrl.searchParams.get('token') || req.headers.get('x-device-token')
    const isAuthorized = await verifyDeviceToken(sessionId, token)
    if (!isAuthorized && !req.cookies.get('LH_session')?.value) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const session = await getPanoSession(sessionId)
    if (!session || session.status === 'closed') {
      return NextResponse.json({ success: false, error: 'Oturum bulunamadı veya kapalı', code: 'session_closed' }, { status: 410 })
    }

    return NextResponse.json({
      success: true,
      status: session.status,
      sharedState: session.sharedState,
      teacherData: session.teacherData ? {
        id: session.teacherData.id,
        first_name: session.teacherData.first_name,
        last_name: session.teacherData.last_name,
        orgSlug: session.teacherData.orgSlug,
        classrooms: session.teacherData.classrooms || [],
        selectedClassId: session.sharedState?.selectedClassId ?? session.teacherData.selectedClassId ?? null,
      } : null,
    })
  } catch (err: any) {
    console.error('[PanoStateAPI] GET error:', err)
    return NextResponse.json({ success: false, error: 'Sunucu hatası' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { sessionId, token, patch, sourceDeviceId } = body

    if (!sessionId || !patch) {
      return NextResponse.json({ success: false, error: 'sessionId ve patch gereklidir' }, { status: 400 })
    }

    const resolvedToken = token || req.nextUrl.searchParams.get('token') || req.headers.get('x-device-token')
    let isAuthorized = await verifyDeviceToken(sessionId, resolvedToken)
    if (!isAuthorized && (req.cookies.get('LH_session')?.value || req.cookies.get('LH_access')?.value)) {
      isAuthorized = true
    }
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const updatedState = await updatePanoSharedState(
      sessionId,
      patch,
      sourceDeviceId || 'board',
      token
    )

    return NextResponse.json({
      success: true,
      sharedState: updatedState,
    })
  } catch (err: any) {
    console.error('[PanoStateAPI] POST error:', err)
    return NextResponse.json({ success: false, error: 'Sunucu hatası' }, { status: 500 })
  }
}
