import { NextRequest, NextResponse } from 'next/server'
import {
  verifyDeviceToken,
  getPanoSession,
  publishSessionEvent,
} from '@/lib/pano-pair/store'
import {
  ALLOWED_REMOTE_ACTIONS,
  RemoteActionMessage,
  RemoteActionType,
} from '@/lib/remote/protocol'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { sessionId, token, action, payload, id } = body

    if (!sessionId || !action) {
      return NextResponse.json(
        { success: false, error: 'sessionId ve action parametreleri gereklidir.', code: 'bad_request' },
        { status: 400 }
      )
    }

    // 1. Authorization check
    const isAuthorized = await verifyDeviceToken(sessionId, token)
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim: Geçersiz veya süresi dolmuş uzaktan kumanda yetkisi.', code: 'token_invalid' },
        { status: 401 }
      )
    }

    // 2. Action whitelist validation (Defense-in-depth: No arbitrary script or shell execution)
    if (!ALLOWED_REMOTE_ACTIONS.has(action as RemoteActionType)) {
      return NextResponse.json(
        { success: false, error: `İzin verilmeyen kumanda eylemi: ${action}`, code: 'action_rejected' },
        { status: 400 }
      )
    }

    // 3. Session state check
    const session = await getPanoSession(sessionId)
    if (!session || session.status === 'closed' || session.status === 'expired') {
      return NextResponse.json(
        { success: false, error: 'Tahta oturumu sonlandırılmış veya bulunamadı.', code: 'session_ended' },
        { status: 410 }
      )
    }

    // 4. Construct validated action message
    const actionId = id || (crypto.randomUUID ? crypto.randomUUID() : `act_${Date.now()}_${Math.random().toString(36).substring(2)}`)
    const timestamp = Date.now()

    const actionMessage: RemoteActionMessage = {
      type: 'remote_action',
      id: actionId,
      sessionId,
      action: action as RemoteActionType,
      payload: payload || {},
      timestamp,
      sourceDeviceId: token ? 'phone' : 'unknown',
    }

    // 5. Broadcast to the board in real time via in-process listeners & Redis channel
    await publishSessionEvent(sessionId, {
      type: 'remote_action',
      action: actionMessage,
    })

    return NextResponse.json({
      success: true,
      id: actionId,
      action,
      timestamp,
    })
  } catch (error: any) {
    console.error('[RemoteActionAPI] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası oluştu.', code: 'server_error' },
      { status: 500 }
    )
  }
}
