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
    const { sessionId, role, target } = body

    if (sessionId) {
      await closePanoSession(sessionId)
    }

    const response = NextResponse.json({ success: true, message: 'Tahta oturumu sonlandırıldı.' })

    // Only clear browser cookies if the board itself is logging out (not a mobile remote logout)
    if (role !== 'phone' && target !== 'board_only') {
      const cookieOptions = getCookieOptions(req)
      const names = [ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, 'LH_session', 'LH_org', 'LH_custom_domain', 'LH_oauth_state']
      for (const name of names) {
        response.cookies.set(name, '', { ...cookieOptions, path: '/', maxAge: 0 })
        response.cookies.set(name, '', { path: '/', maxAge: 0 })
      }
    }

    return response
  } catch (error: any) {
    console.error('[PanoLogoutAPI] Error:', error)
    return NextResponse.json({ success: false, error: 'Oturum kapatılamadı' }, { status: 500 })
  }
}
