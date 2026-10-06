import { NextRequest, NextResponse } from 'next/server'
import { createPanoSession, getPanoSession } from '@/lib/pano-pair/store'
import os from 'os'

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
    const session = createPanoSession()
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
        qrUrl,
      },
    })
  } catch (error: any) {
    console.error('[PanoSessionAPI] Create error:', error)
    return NextResponse.json({ success: false, error: 'Oturum oluşturulamadı' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId')
  if (!sessionId) {
    return NextResponse.json({ success: false, error: 'sessionId gereklidir' }, { status: 400 })
  }

  const session = getPanoSession(sessionId)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Oturum bulunamadı veya süresi doldu' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    status: session.status,
    expiresAt: session.expiresAt,
    teacherData: session.teacherData || null,
  })
}
