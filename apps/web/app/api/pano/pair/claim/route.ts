import { NextRequest, NextResponse } from 'next/server'
import { getPanoSession, TeacherPairData } from '@/lib/pano-pair/store'
import { findDemoUser, createDemoJwt, DEMO_USERS } from '@services/auth/demoAuth'
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
  getCookieOptions,
} from '@services/auth/cookies'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { sessionId, teacherData: clientTeacherData } = body

    let teacherData: TeacherPairData | undefined = clientTeacherData

    if (sessionId) {
      const session = await getPanoSession(sessionId)
      if (session && session.teacherData) {
        teacherData = {
          ...session.teacherData,
          ...(clientTeacherData || {}),
        }
      }
    }

    if (!teacherData || (!teacherData.id && !teacherData.email && !teacherData.username)) {
      return NextResponse.json(
        { success: false, error: 'Eşleştirilmiş öğretmen bilgisi bulunamadı.' },
        { status: 400 }
      )
    }

    // Ensure access token is present or mint demo JWT for teacher
    let token = teacherData.token
    let refreshToken = teacherData.refreshToken

    if (!token) {
      // FAZ 5: In production, demo JWT fallback is strictly disabled!
      if (process.env.NODE_ENV !== 'production') {
        const demoUser =
          findDemoUser(teacherData.email || teacherData.username || '') ||
          DEMO_USERS['ogretmen@oxonom.com']
        if (demoUser) {
          token = createDemoJwt(demoUser)
          refreshToken = token
          if (!teacherData.first_name) teacherData.first_name = demoUser.first_name
          if (!teacherData.last_name) teacherData.last_name = demoUser.last_name
          if (!teacherData.email) teacherData.email = demoUser.email
          if (!teacherData.username) teacherData.username = demoUser.username
          if (!teacherData.id) teacherData.id = demoUser.id
        }
      }
    }

    if (!refreshToken && token) {
      refreshToken = token
    }

    const orgSlug = teacherData.orgSlug || 'neclagorer'

    const enrichedTeacherData: TeacherPairData = {
      ...teacherData,
      token,
      refreshToken,
      orgSlug,
      role: 'teacher',
    }

    const response = NextResponse.json({
      success: true,
      message: 'Akıllı tahta oturumu başarıyla doğrulandı ve yetkilendirildi.',
      teacherData: enrichedTeacherData,
      tokens: {
        access_token: token,
        refresh_token: refreshToken,
        expiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
      },
    })

    // Establish official LearnHouse / Oxonom Edu authentication cookies on the board's browser
    const cookieOptions = getCookieOptions(req)

    if (token) {
      response.cookies.set(ACCESS_TOKEN_COOKIE, token, {
        ...cookieOptions,
        maxAge: ACCESS_TOKEN_MAX_AGE,
      })
    }

    if (refreshToken) {
      response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
        ...cookieOptions,
        maxAge: REFRESH_TOKEN_MAX_AGE,
      })
    }

    // LH_session: readable by client-side JS so SessionProvider recognizes active session
    response.cookies.set('LH_session', '1', {
      ...cookieOptions,
      httpOnly: false,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    })

    // LH_org: active school organization slug for routing and context
    response.cookies.set('LH_org', orgSlug, {
      ...cookieOptions,
      httpOnly: false,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    })

    return response
  } catch (error: any) {
    console.error('[PanoClaimAPI] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Yetkilendirme sırasında sunucu hatası oluştu.' },
      { status: 500 }
    )
  }
}
