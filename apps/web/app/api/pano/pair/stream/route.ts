import { NextRequest } from 'next/server'
import {
  getPanoSession,
  subscribePanoSession,
  createRedisSubscriber,
  verifyDeviceToken,
  verifyAndConsumeTicket,
  PanoSessionEvent,
} from '@/lib/pano-pair/store'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId')
  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'sessionId gereklidir', code: 'bad_request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const ticket = req.nextUrl.searchParams.get('ticket')
  const token = req.nextUrl.searchParams.get('token') || req.headers.get('x-device-token')
  let isAuthorized = false
  try {
    if (ticket) {
      isAuthorized = await verifyAndConsumeTicket(sessionId, ticket)
    } else {
      isAuthorized = await verifyDeviceToken(sessionId, token)
    }
  } catch (err: any) {
    if (err?.code === 'store_unavailable' || err?.message?.includes('Veritabanı') || err?.message?.includes('MONGODB_')) {
      return new Response(JSON.stringify({ error: 'Veritabanı yapılandırılmamış', code: 'store_unavailable' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    console.error('[PanoStreamAPI] verify error:', err)
    return new Response(JSON.stringify({ error: 'Sunucu doğrulama hatası', code: 'server_error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!isAuthorized) {
    return new Response(JSON.stringify({ error: 'Yetkisiz erişim: Geçersiz deviceToken', code: 'token_invalid' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let session: any = null
  try {
    session = await getPanoSession(sessionId)
  } catch (err: any) {
    if (err?.code === 'store_unavailable' || err?.message?.includes('Veritabanı') || err?.message?.includes('MONGODB_')) {
      return new Response(JSON.stringify({ error: 'Veritabanı yapılandırılmamış', code: 'store_unavailable' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  if (!session) {
    return new Response(JSON.stringify({ error: 'Oturum bulunamadı veya süresi doldu', code: 'session_not_found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const lastEventId = req.headers.get('last-event-id')
  const qLastVersion = req.nextUrl.searchParams.get('lastVersion')
  const clientLastVersion = Number(lastEventId || qLastVersion || 0)

  let cleanupInProcess: (() => void) | null = null
  let redisSub: any = null
  let pingInterval: NodeJS.Timeout | null = null
  let fallbackSyncInterval: NodeJS.Timeout | null = null

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      let lastSentVersion = clientLastVersion
      let wasPaired = session.status === 'paired'

      // Keepalive heartbeat every 15s to keep SSE connection alive across firewalls/proxies
      pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`event: ping\ndata: {"time":${Date.now()}}\n\n`))
        } catch (_) {}
      }, 15000)

      // Initial state push (Full state sent on initial connection or missed reconnect)
      if (session.status === 'paired' && session.teacherData) {
        controller.enqueue(
          encoder.encode(`event: paired\ndata: ${JSON.stringify(session.teacherData)}\n\n`)
        )
        if (session.sharedState) {
          lastSentVersion = session.sharedState.version
          controller.enqueue(
            encoder.encode(
              `id: ${session.sharedState.version}\nevent: state\ndata: ${JSON.stringify(session.sharedState)}\n\n`
            )
          )
        }
      }

      const processEvent = (event: PanoSessionEvent) => {
        try {
          if (event.type === 'paired' && event.teacherData) {
            wasPaired = true
            controller.enqueue(
              encoder.encode(`event: paired\ndata: ${JSON.stringify(event.teacherData)}\n\n`)
            )
            if (event.session?.sharedState) {
              lastSentVersion = event.session.sharedState.version
              controller.enqueue(
                encoder.encode(
                  `id: ${event.session.sharedState.version}\nevent: state\ndata: ${JSON.stringify(event.session.sharedState)}\n\n`
                )
              )
            }
          } else if (event.type === 'state' && event.state) {
            if (event.state.version > lastSentVersion) {
              lastSentVersion = event.state.version
              controller.enqueue(
                encoder.encode(
                  `id: ${event.state.version}\nevent: state\ndata: ${JSON.stringify(event.state)}\n\n`
                )
              )
            }
          } else if (event.type === 'session_closed') {
            controller.enqueue(
              encoder.encode(`event: session_closed\ndata: ${JSON.stringify({ closed: true, reason: event.reason })}\n\n`)
            )
            try { controller.close() } catch (_) {}
          }
        } catch (err) {
          console.error('[PanoSSE] processEvent error:', err)
        }
      }

      // 1. Instant in-process listener (0ms for same process)
      cleanupInProcess = subscribePanoSession(sessionId, (event) => {
        processEvent(event)
      })

      // 2. Redis Pub/Sub subscription (FAZ 4)
      try {
        redisSub = createRedisSubscriber()
        if (redisSub) {
          await redisSub.subscribe(`pano:session:${sessionId}`)
          redisSub.on('message', (_channel: string, message: string) => {
            try {
              const event: PanoSessionEvent = JSON.parse(message)
              processEvent(event)
            } catch (_) {}
          })
        }
      } catch (err) {
        console.warn('[PanoSSE] Redis subscriber error, activating graceful DB fallback:', err)
        redisSub = null
      }

      // 3. Fallback: ONLY active if Redis is unavailable
      if (!redisSub) {
        fallbackSyncInterval = setInterval(async () => {
          try {
            const current = await getPanoSession(sessionId)
            if (!current) return

            if (!wasPaired && current.status === 'paired' && current.teacherData) {
              wasPaired = true
              processEvent({
                type: 'paired',
                teacherData: current.teacherData,
                session: current,
              })
            }

            if (current.sharedState && current.sharedState.version > lastSentVersion) {
              processEvent({
                type: 'state',
                state: current.sharedState,
              })
            }

            if (current.status === 'closed') {
              processEvent({
                type: 'session_closed',
                sessionId,
                reason: current.closedReason,
              })
              if (fallbackSyncInterval) clearInterval(fallbackSyncInterval)
            }
          } catch (_) {}
        }, 1000)
      }
    },
    cancel() {
      if (pingInterval) clearInterval(pingInterval)
      if (fallbackSyncInterval) clearInterval(fallbackSyncInterval)
      if (cleanupInProcess) cleanupInProcess()
      if (redisSub) {
        try {
          redisSub.unsubscribe(`pano:session:${sessionId}`).catch(() => {})
          redisSub.quit().catch(() => {})
        } catch (_) {}
      }
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
