import { NextRequest, NextResponse } from 'next/server'
import { createPanoSession, getPanoSession } from '@/lib/pano-pair/store'
import os from 'os'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getLanIp(): string {
  try {
    const interfaces = os.networkInterfaces()
    for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name] || []) {
        if (net.family === 'IPv4' && !net.internal && net.address) {
          return net.address
        }
      }
    }
  } catch (_) {}
  return 'localhost'
}

export async function POST(req: NextRequest) {
  try {
    const session = await createPanoSession()
    let host = req.headers.get('host') || 'localhost:3010'
    const protocol = req.headers.get('x-forwarded-proto') || 'http'

    // If accessed as localhost or 127.0.0.1 on the Mac, replace with LAN IP so mobile devices can reach it
    if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
      const port = host.split(':')[1] || '3010'
      const lanIp = getLanIp()
      if (lanIp && lanIp !== 'localhost') {
        host = `${lanIp}:${port}`
      }
    }

    const origin = `${protocol}://${host}`

    // Deep link URL for mobile teacher direct connection
    const qrUrl = `${origin}/dash/connect-board?code=${session.code}&session=${session.sessionId}`

    return NextResponse.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        code: session.code,
        expiresAt: session.expiresAt,
        boardDeviceToken: session.boardDeviceToken,
        qrUrl,
      },
    })
  } catch (error: any) {
    console.error('[PanoSessionAPI] Create error:', error?.message || error)
    if (error?.code === 'store_unavailable' || error?.message?.includes('Veritabanı') || error?.message?.includes('MONGODB_')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Veritabanı yapılandırılmamış (MongoDB bağlantısı kurulamadı)',
          code: 'store_unavailable',
        },
        { status: 503 }
      )
    }
    return NextResponse.json({ success: false, error: 'Oturum oluşturulamadı', code: 'server_error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId')
  if (!sessionId) {
    return NextResponse.json({ success: false, error: 'sessionId gereklidir', code: 'bad_request' }, { status: 400 })
  }

  try {
    const session = await getPanoSession(sessionId)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Oturum bulunamadı veya süresi doldu', code: 'session_not_found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      status: session.status,
      expiresAt: session.expiresAt,
      teacherData: session.teacherData || null,
    })
  } catch (error: any) {
    if (error?.code === 'store_unavailable' || error?.message?.includes('Veritabanı') || error?.message?.includes('MONGODB_')) {
      return NextResponse.json(
        { success: false, error: 'Veritabanı yapılandırılmamış', code: 'store_unavailable' },
        { status: 503 }
      )
    }
    return NextResponse.json({ success: false, error: 'Sunucu hatası', code: 'server_error' }, { status: 500 })
  }
}
