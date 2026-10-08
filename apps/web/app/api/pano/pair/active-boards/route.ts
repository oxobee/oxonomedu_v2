import { NextRequest, NextResponse } from 'next/server'
import { getActivePanoSessionsForTeacher } from '@/lib/pano-pair/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    let teacherId = req.nextUrl.searchParams.get('teacherId')
    let email = req.nextUrl.searchParams.get('email')
    const sessionId = req.nextUrl.searchParams.get('sessionId')

    if (!teacherId && !email) {
      const lhAccess = req.cookies.get('LH_access')?.value
      if (lhAccess) {
        try {
          const parts = lhAccess.split('.')
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'))
            if (payload.sub || payload.user_id) teacherId = String(payload.user_id || payload.sub)
            if (payload.email) email = payload.email
          }
        } catch (_) {}
      }
    }

    const sessions = await getActivePanoSessionsForTeacher(teacherId, email, sessionId)

    const boards = sessions.map((s) => ({
      sessionId: s.sessionId,
      code: s.code,
      status: s.status,
      pairedAt: s.pairedAt || s.createdAt,
      expiresAt: s.expiresAt,
      className:
        s.sharedState?.selectedClass?.name ||
        s.sharedState?.selectedClass?.title ||
        (s.teacherData as any)?.activeClassName ||
        (s.sharedState?.selectedClassId ? `Sınıf #${s.sharedState.selectedClassId}` : null),
      classId: s.sharedState?.selectedClassId || s.teacherData?.selectedClassId || null,
      teacherName: `${s.teacherData?.first_name || ''} ${s.teacherData?.last_name || ''}`.trim() || 'Öğretmen',
      boardName: 'Oxonom Akıllı Tahta',
    }))

    return NextResponse.json({
      success: true,
      boards,
    })
  } catch (err: any) {
    console.error('[ActiveBoardsAPI] Error:', err)
    return NextResponse.json({ success: false, error: 'Sunucu hatası', boards: [] }, { status: 500 })
  }
}
