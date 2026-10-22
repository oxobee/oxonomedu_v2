export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import {
  CANONICAL_ACADEMIC_EVENTS,
  AcademicCalendarEvent,
} from '@/lib/calendar/academicCalendarStorage'
import { getPanoDb } from '@/lib/pano-pair/store'

let memoryEventsCache: AcademicCalendarEvent[] | null = null

async function loadEvents(): Promise<AcademicCalendarEvent[]> {
  try {
    const db = await getPanoDb()
    if (db) {
      const col = db.collection('academic_calendar')
      const docs = await col.find({}).sort({ startDate: 1 }).toArray()
      if (docs && docs.length > 0) {
        const events = docs.map((d: any) => {
          const { _id, ...rest } = d
          return rest as AcademicCalendarEvent
        })
        memoryEventsCache = events
        return events
      }
    }
  } catch (err) {
    console.warn('[academic-calendar] MongoDB fetch error:', err)
  }

  return memoryEventsCache || CANONICAL_ACADEMIC_EVENTS
}

async function persistEvents(events: AcademicCalendarEvent[]) {
  memoryEventsCache = events
  try {
    const db = await getPanoDb()
    if (db) {
      const col = db.collection('academic_calendar')
      await col.deleteMany({})
      if (events.length > 0) {
        await col.insertMany(events.map((e) => ({ ...e })))
      }
    }
  } catch (err) {
    console.warn('[academic-calendar] MongoDB persist error:', err)
  }
}

export async function GET() {
  const events = await loadEvents()
  return NextResponse.json(
    { success: true, events },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  )
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const newEvent: AcademicCalendarEvent = body.event || body

    if (!newEvent || !newEvent.title || !newEvent.startDate) {
      return NextResponse.json(
        { success: false, error: 'Etkinlik başlığı ve başlangıç tarihi zorunludur.' },
        { status: 400 }
      )
    }

    const current = await loadEvents()
    const updated = [newEvent, ...current.filter((e) => e.id !== newEvent.id)]
    await persistEvents(updated)

    return NextResponse.json({
      success: true,
      message: 'Etkinlik başarıyla takvime eklendi.',
      events: updated,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Bilinmeyen hata' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Etkinlik kimliği (ID) belirtilmelidir.' },
        { status: 400 }
      )
    }

    const current = await loadEvents()
    const updated = current.map((ev) =>
      ev.id === id ? { ...ev, ...updates, updatedAt: new Date().toISOString() } : ev
    )
    await persistEvents(updated)

    return NextResponse.json({
      success: true,
      message: 'Etkinlik başarıyla güncellendi.',
      events: updated,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Bilinmeyen hata' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Silinecek etkinlik ID gereklidir.' },
        { status: 400 }
      )
    }

    const current = await loadEvents()
    const updated = current.filter((e) => e.id !== id)
    await persistEvents(updated)

    return NextResponse.json({
      success: true,
      message: 'Etkinlik takvimden kaldırıldı.',
      events: updated,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Bilinmeyen hata' },
      { status: 500 }
    )
  }
}
