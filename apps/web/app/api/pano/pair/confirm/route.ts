import { NextRequest, NextResponse } from 'next/server'
import { pairPanoSession } from '@/lib/pano-pair/store'

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

    const result = pairPanoSession({ code, sessionId }, teacherData)

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
