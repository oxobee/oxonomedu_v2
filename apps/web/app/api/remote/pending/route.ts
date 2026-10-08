import { NextRequest, NextResponse } from 'next/server'
import {
  verifyDeviceToken,
  getPanoSession,
  getRecentRemoteActions,
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

    const session = await getPanoSession(sessionId)
    if (!session || session.status === 'closed') {
      return NextResponse.json({ error: 'Oturum kapalı', code: 'session_closed' }, { status: 410 })
    }

    const qSince = req.nextUrl.searchParams.get('since')
    const sinceTimestamp = qSince ? Number(qSince) : Date.now() - 5000

    const actions = await getRecentRemoteActions(sessionId, sinceTimestamp)

    return NextResponse.json({
      success: true,
      status: session.status,
      sharedState: session.sharedState,
      actions: actions || [],
      serverTime: Date.now(),
    })
  } catch (err: any) {
    console.error('[RemotePendingAPI] Error:', err)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
