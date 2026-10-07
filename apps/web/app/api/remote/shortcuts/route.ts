import { NextRequest, NextResponse } from 'next/server'
import {
  verifyDeviceToken,
  getPanoSession,
  getPanoDb,
} from '@/lib/pano-pair/store'
import {
  DEFAULT_REMOTE_SHORTCUTS,
  RemoteShortcutItem,
  ALLOWED_REMOTE_ACTIONS,
} from '@/lib/remote/protocol'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('sessionId')
    const token = req.nextUrl.searchParams.get('token')

    if (!sessionId) {
      return NextResponse.json({ shortcuts: DEFAULT_REMOTE_SHORTCUTS })
    }

    if (token) {
      const isAuthorized = await verifyDeviceToken(sessionId, token)
      if (!isAuthorized) {
        return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
      }
    }

    // Try reading custom shortcuts from database
    const db = await getPanoDb()
    if (db) {
      const doc = await db.collection('pano_remote_shortcuts').findOne({ sessionId })
      if (doc && Array.isArray(doc.shortcuts) && doc.shortcuts.length > 0) {
        return NextResponse.json({ shortcuts: doc.shortcuts })
      }
    }

    return NextResponse.json({ shortcuts: DEFAULT_REMOTE_SHORTCUTS })
  } catch (error) {
    console.error('[RemoteShortcutsAPI] GET error:', error)
    return NextResponse.json({ shortcuts: DEFAULT_REMOTE_SHORTCUTS })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { sessionId, token, shortcuts } = body

    if (!sessionId || !Array.isArray(shortcuts)) {
      return NextResponse.json(
        { success: false, error: 'sessionId ve shortcuts listesi gereklidir.' },
        { status: 400 }
      )
    }

    const isAuthorized = await verifyDeviceToken(sessionId, token)
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim.' },
        { status: 401 }
      )
    }

    // Sanitize and validate shortcuts against whitelist
    const validatedShortcuts: RemoteShortcutItem[] = shortcuts
      .filter((s: any) => s && s.id && s.label && ALLOWED_REMOTE_ACTIONS.has(s.action))
      .map((s: any, idx: number) => ({
        id: String(s.id),
        label: String(s.label).slice(0, 30),
        icon: String(s.icon || 'Sparkles'),
        color: String(s.color || 'from-blue-600 to-indigo-700'),
        action: s.action,
        payload: s.payload || {},
        order: Number(s.order ?? idx + 1),
      }))

    const db = await getPanoDb()
    if (db) {
      await db.collection('pano_remote_shortcuts').updateOne(
        { sessionId },
        {
          $set: {
            sessionId,
            shortcuts: validatedShortcuts,
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      )
    }

    return NextResponse.json({
      success: true,
      shortcuts: validatedShortcuts,
    })
  } catch (error) {
    console.error('[RemoteShortcutsAPI] POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Kısayollar kaydedilemedi.' },
      { status: 500 }
    )
  }
}
