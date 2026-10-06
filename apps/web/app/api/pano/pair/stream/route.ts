import { NextRequest } from 'next/server'
import { getPanoSession, subscribePanoSession } from '@/lib/pano-pair/store'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId')
  if (!sessionId) {
    return new Response('sessionId gereklidir', { status: 400 })
  }

  const session = await getPanoSession(sessionId)
  if (!session) {
    return new Response('Oturum bulunamadı veya süresi doldu', { status: 404 })
  }

  let cleanup: (() => void) | null = null
  let pingInterval: NodeJS.Timeout | null = null
  let syncInterval: NodeJS.Timeout | null = null

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      let lastSentVersion = session.sharedState?.version || 0
      let wasPaired = session.status === 'paired'

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
          lastSentVersion = session.sharedState.version
          controller.enqueue(
            encoder.encode(`event: state\ndata: ${JSON.stringify(session.sharedState)}\n\n`)
          )
        }
      }

      // Cross-container DB monitor: checks persistent MongoDB every 800ms for updates
      syncInterval = setInterval(async () => {
        try {
          const current = await getPanoSession(sessionId)
          if (!current) return

          // 1. Detection of pairing status change
          if (!wasPaired && current.status === 'paired' && current.teacherData) {
            wasPaired = true
            controller.enqueue(
              encoder.encode(`event: paired\ndata: ${JSON.stringify(current.teacherData)}\n\n`)
            )
            if (current.sharedState) {
              lastSentVersion = current.sharedState.version
              controller.enqueue(
                encoder.encode(`event: state\ndata: ${JSON.stringify(current.sharedState)}\n\n`)
              )
            }
          }

          // 2. Detection of shared state version change from another serverless container
          if (current.sharedState && current.sharedState.version > lastSentVersion) {
            lastSentVersion = current.sharedState.version
            controller.enqueue(
              encoder.encode(`event: state\ndata: ${JSON.stringify(current.sharedState)}\n\n`)
            )
          }

          // 3. Detection of session closure / logout
          if (current.status === 'closed') {
            controller.enqueue(
              encoder.encode(`event: session_closed\ndata: ${JSON.stringify({ closed: true, reason: current.closedReason || 'logout' })}\n\n`)
            )
            if (syncInterval) clearInterval(syncInterval)
            try { controller.close() } catch (_) {}
          }
        } catch (err) {
          // Silently handle transient errors
        }
      }, 800)

      // Instant in-process listener (0ms for requests hitting the same instance)
      cleanup = subscribePanoSession(sessionId, (event) => {
        try {
          if (event.type === 'paired' && event.teacherData) {
            wasPaired = true
            controller.enqueue(
              encoder.encode(`event: paired\ndata: ${JSON.stringify(event.teacherData)}\n\n`)
            )
            if (event.session.sharedState) {
              lastSentVersion = event.session.sharedState.version
              controller.enqueue(
                encoder.encode(`event: state\ndata: ${JSON.stringify(event.session.sharedState)}\n\n`)
              )
            }
          } else if (event.type === 'state' && event.state) {
            if (event.state.version > lastSentVersion) {
              lastSentVersion = event.state.version
              controller.enqueue(
                encoder.encode(`event: state\ndata: ${JSON.stringify(event.state)}\n\n`)
              )
            }
          } else if (event.type === 'session_closed') {
            controller.enqueue(
              encoder.encode(`event: session_closed\ndata: ${JSON.stringify({ closed: true, reason: event.reason })}\n\n`)
            )
            if (syncInterval) clearInterval(syncInterval)
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
      if (syncInterval) clearInterval(syncInterval)
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
