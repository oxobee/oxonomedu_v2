import { NextRequest, NextResponse } from 'next/server'
import { pairPanoSession } from '@/lib/pano-pair/store'
import { findDemoUser, createDemoJwt, DEMO_USERS } from '@services/auth/demoAuth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, sessionId, teacherData } = body

    if (!code && !sessionId) {
      return NextResponse.json(
        { success: false, error: 'Lütfen 6 haneli eşleştirme kodunu girin veya QR kodu okutun.' },
        { status: 400 }
      )
    }

    if (!teacherData || !teacherData.id) {
      return NextResponse.json(
        { success: false, error: 'Öğretmen oturum bilgisi eksik.' },
        { status: 401 }
      )
    }

    // Ensure teacher token and auth metadata are complete
    if (!teacherData.token) {
      const demoUser =
        findDemoUser(teacherData.email || teacherData.username || '') ||
        DEMO_USERS['ogretmen@oxonom.com']
      if (demoUser) {
        teacherData.token = createDemoJwt(demoUser)
        teacherData.refreshToken = teacherData.token
        if (!teacherData.first_name) teacherData.first_name = demoUser.first_name
        if (!teacherData.last_name) teacherData.last_name = demoUser.last_name
        if (!teacherData.email) teacherData.email = demoUser.email
      }
    }

    if (!teacherData.refreshToken && teacherData.token) {
      teacherData.refreshToken = teacherData.token
    }

    if (!teacherData.orgSlug) {
      teacherData.orgSlug = 'neclagorer'
    }

    const result = await pairPanoSession({ code, sessionId }, teacherData)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Eşleştirme başarısız oldu.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Akıllı tahta başarıyla eşleştirildi!',
      session: {
        sessionId: result.session?.sessionId,
        status: result.session?.status,
      },
    })
  } catch (error: any) {
    console.error('[PanoPairConfirmAPI] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası oluştu.' },
      { status: 500 }
    )
  }
}
