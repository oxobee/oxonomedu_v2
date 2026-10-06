import { NextRequest, NextResponse } from 'next/server'
import { closePanoSession } from '@/lib/pano-pair/store'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { sessionId } = body

    if (sessionId) {
      closePanoSession(sessionId)
    }

    return NextResponse.json({ success: true, message: 'Tahta oturumu sonlandırıldı.' })
  } catch (error: any) {
    console.error('[PanoLogoutAPI] Error:', error)
    return NextResponse.json({ success: false, error: 'Oturum kapatılamadı' }, { status: 500 })
  }
}
