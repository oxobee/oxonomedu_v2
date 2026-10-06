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

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      // Initial heartbeat ping
      controller.enqueue(encoder.encode(`event: ping\ndata: {"time":${Date.now()}}\n\n`))

      // If already paired before connection was opened
      if (session.status === 'paired' && session.teacherData) {
        controller.enqueue(
          encoder.encode(`event: paired\ndata: ${JSON.stringify(session.teacherData)}\n\n`)
        )
      }

      cleanup = subscribePanoSession(sessionId, (updated) => {
        if (updated.status === 'paired' && updated.teacherData) {
          try {
            controller.enqueue(
              encoder.encode(`event: paired\ndata: ${JSON.stringify(updated.teacherData)}\n\n`)
            )
          } catch (err) {
            console.error('[PanoSSE] Enqueue error:', err)
          }
        }
      })
    },
    cancel() {
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
