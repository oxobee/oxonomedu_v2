import { NextRequest } from 'next/server'
import { getPanoSession, subscribePanoSession } from '@/lib/pano-pair/store'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId')
  if (!sessionId) {
    return new Response('sessionId gereklidir', { status: 400 })
  }

  const session = getPanoSession(sessionId)
  if (!session) {
    return new Response('Oturum bulunamadı veya süresi doldu', { status: 404 })
  }

  let cleanup: (() => void) | null = null
  let pingInterval: NodeJS.Timeout | null = null

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      // Initial heartbeat ping
      controller.enqueue(encoder.encode(`event: ping\ndata: {"time":${Date.now()}}\n\n`))

      // Keepalive heartbeat every 15s to keep SSE connection alive across firewalls/proxies
      pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`event: ping\ndata: {"time":${Date.now()}}\n\n`))
        } catch (_) {}
      }, 15000)

      // If already paired before connection was opened
      if (session.status === 'paired' && session.teacherData) {
        controller.enqueue(
          encoder.encode(`event: paired\ndata: ${JSON.stringify(session.teacherData)}\n\n`)
        )
        if (session.sharedState) {
          controller.enqueue(
            encoder.encode(`event: state\ndata: ${JSON.stringify(session.sharedState)}\n\n`)
          )
        }
      }

      cleanup = subscribePanoSession(sessionId, (event) => {
        try {
          if (event.type === 'paired' && event.teacherData) {
            controller.enqueue(
              encoder.encode(`event: paired\ndata: ${JSON.stringify(event.teacherData)}\n\n`)
            )
            if (event.session.sharedState) {
              controller.enqueue(
                encoder.encode(`event: state\ndata: ${JSON.stringify(event.session.sharedState)}\n\n`)
              )
            }
          } else if (event.type === 'state' && event.state) {
            controller.enqueue(
              encoder.encode(`event: state\ndata: ${JSON.stringify(event.state)}\n\n`)
            )
          } else if (event.type === 'session_closed') {
            controller.enqueue(
              encoder.encode(`event: session_closed\ndata: ${JSON.stringify({ closed: true, reason: event.reason })}\n\n`)
            )
            try {
              controller.close()
            } catch (_) {}
          }
        } catch (err) {
          console.error('[PanoSSE] Enqueue error:', err)
        }
      })
    },
    cancel() {
      if (pingInterval) clearInterval(pingInterval)
      if (cleanup) cleanup()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
