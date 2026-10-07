import { NextRequest, NextResponse } from 'next/server'
import { verifyDeviceToken, createPanoTicket } from '@/lib/pano-pair/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { sessionId } = body
    const token = req.headers.get('x-device-token') || body.deviceToken

    if (!sessionId || !token) {
      return NextResponse.json(
        { success: false, error: 'sessionId ve token gereklidir', code: 'bad_request' },
        { status: 400 }
      )
    }

    let isAuth = false
    try {
      isAuth = await verifyDeviceToken(sessionId, token)
    } catch (err: any) {
      if (err?.code === 'store_unavailable' || err?.message?.includes('Veritabanı') || err?.message?.includes('MONGODB_')) {
        return NextResponse.json(
          { success: false, error: 'Veritabanı yapılandırılmamış', code: 'store_unavailable' },
          { status: 503 }
        )
      }
      console.error('[PanoTicketAPI] verifyDeviceToken error:', err)
      return NextResponse.json(
        { success: false, error: 'Sunucu doğrulama hatası', code: 'server_error' },
        { status: 500 }
      )
    }

    if (!isAuth) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim: Geçersiz deviceToken', code: 'token_invalid' },
        { status: 401 }
      )
    }

    const ticket = await createPanoTicket(sessionId, token)
    return NextResponse.json({ success: true, ticket })
  } catch (error: any) {
    console.error('[PanoTicketAPI] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası', code: 'server_error' },
      { status: 500 }
    )
  }
}
