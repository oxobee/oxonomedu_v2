import { NextRequest, NextResponse } from 'next/server'
import { closePanoSession } from '@/lib/pano-pair/store'
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  getCookieOptions,
} from '@services/auth/cookies'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { sessionId } = body

    if (sessionId) {
      closePanoSession(sessionId)
    }

    const response = NextResponse.json({ success: true, message: 'Tahta oturumu sonlandırıldı.' })
    const cookieOptions = getCookieOptions(req)

    response.cookies.set(ACCESS_TOKEN_COOKIE, '', { ...cookieOptions, maxAge: 0 })
    response.cookies.set(REFRESH_TOKEN_COOKIE, '', { ...cookieOptions, maxAge: 0 })
    response.cookies.set('LH_session', '', { ...cookieOptions, httpOnly: false, maxAge: 0 })
    response.cookies.set('LH_org', '', { ...cookieOptions, httpOnly: false, maxAge: 0 })

    return response
  } catch (error: any) {
    console.error('[PanoLogoutAPI] Error:', error)
    return NextResponse.json({ success: false, error: 'Oturum kapatılamadı' }, { status: 500 })
  }
}
