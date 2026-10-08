import { NextRequest, NextResponse } from 'next/server'
import {
  verifyDeviceToken,
  getPanoSession,
  getRecentRemoteActions,
  touchSessionPresence,
} from '@/lib/pano-pair/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('sessionId')
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId gereklidir' }, { status: 400 })
    }

    const token = req.nextUrl.searchParams.get('token') || req.headers.get('x-device-token')
    const role = (req.nextUrl.searchParams.get('role') || 'unknown') as 'phone' | 'board' | 'unknown'

    const session = await getPanoSession(sessionId)
    if (!session || session.status === 'closed' || session.status === 'expired') {
      return NextResponse.json({ error: 'Oturum kapalı', code: 'session_closed' }, { status: 410 })
    }

    if (role === 'phone' || role === 'board') {
      await touchSessionPresence(sessionId, role, token || undefined)
    }

    let isAuthorized = false
    try {
      isAuthorized = await verifyDeviceToken(sessionId, token)
      if (!isAuthorized && (req.cookies.get('LH_session')?.value || req.cookies.get('LH_access')?.value)) {
        isAuthorized = true
      }
    } catch (_) {}

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const qSince = req.nextUrl.searchParams.get('since')
    const sinceTimestamp = qSince ? Number(qSince) : Date.now() - 15000

    const actions = await getRecentRemoteActions(sessionId, sinceTimestamp)

    const isPhoneConnected = Boolean(
      (session.phoneLastActiveAt && Date.now() - session.phoneLastActiveAt < 25000) ||
      session.status === 'paired'
    )

    return NextResponse.json({
      success: true,
      status: session.status,
      sharedState: session.sharedState,
      actions: actions || [],
      isPhoneConnected,
      serverTime: Date.now(),
    })
  } catch (err: any) {
    console.error('[RemotePendingAPI] Error:', err)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
