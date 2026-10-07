import { NextRequest, NextResponse } from 'next/server'
import { pairPanoSession, recordFailedAttempt } from '@/lib/pano-pair/store'
import { findDemoUser, createDemoJwt, DEMO_USERS } from '@services/auth/demoAuth'
import { ALL_CLASSROOMS } from '@services/demo/schoolDirectory'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// IP-based Rate Limiting (FAZ 5 Security)
const ipRateLimits = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = ipRateLimits.get(ip)
  if (!record || record.resetAt < now) {
    ipRateLimits.set(ip, { count: 1, resetAt: now + 60000 })
    return true
  }
  if (record.count >= 15) return false
  record.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Çok fazla istek gönderildi. Lütfen bir dakika sonra tekrar deneyin.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const { code, sessionId, teacherData, deviceToken } = body

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

    if (!teacherData.classrooms || !Array.isArray(teacherData.classrooms) || teacherData.classrooms.length === 0) {
      // Demo: send ALL classrooms across all schools so teacher sees the full list (58 classes)
      const allOrgClassrooms = ALL_CLASSROOMS
      if (allOrgClassrooms.length > 0) {
        teacherData.classrooms = allOrgClassrooms.map(c => ({
          id: c.id,
          name: c.name,
          gradeLevel: c.grade_level,
          studentCount: c.student_count || 30,
          boardCount: c.boards_count || 4,
          attendance: '%100',
          teacherName: c.teacher_name,
          subject: 'Sınıf Öğretmeni',
        }))
      }
    }

    const result = await pairPanoSession({ code, sessionId }, teacherData, deviceToken)

    if (!result.success) {
      if (code) {
        const failCheck = await recordFailedAttempt(code)
        if (failCheck.locked) {
          return NextResponse.json(
            { success: false, error: '5 hatalı deneme nedeniyle bu eşleştirme kodu iptal edildi. Lütfen tahtadaki yeni kodu deneyin.' },
            { status: 403 }
          )
        }
      }
      return NextResponse.json(
        { success: false, error: result.error || 'Eşleştirme başarısız oldu.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Akıllı tahta başarıyla eşleştirildi!',
      sessionId: result.session?.sessionId,
      phoneDeviceToken: result.phoneDeviceToken,
      session: {
        sessionId: result.session?.sessionId,
        status: result.session?.status,
      },
    })
  } catch (error: any) {
    console.error('[PanoPairConfirmAPI] Error:', error)
    if (error?.code === 'store_unavailable' || error?.message?.includes('Veritabanı') || error?.message?.includes('MONGODB_')) {
      return NextResponse.json(
        { success: false, error: 'Veritabanı yapılandırılmamış (MongoDB bağlantısı kurulamadı)', code: 'store_unavailable' },
        { status: 503 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası oluştu.', code: 'server_error' },
      { status: 500 }
    )
  }
}
