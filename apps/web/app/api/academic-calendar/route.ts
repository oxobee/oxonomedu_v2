export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import {
  CANONICAL_ACADEMIC_EVENTS,
  AcademicCalendarEvent,
} from '@/lib/calendar/academicCalendarStorage'

const STORAGE_FILE = path.join('/tmp', 'oxonom_academic_calendar.json')

function loadEvents(): AcademicCalendarEvent[] {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const content = fs.readFileSync(STORAGE_FILE, 'utf-8')
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (_) {}
  return CANONICAL_ACADEMIC_EVENTS
}

function saveEvents(events: AcademicCalendarEvent[]) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(events, null, 2), 'utf-8')
  } catch (_) {}
}

export async function GET() {
  const events = loadEvents()
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

    const current = loadEvents()
    const updated = [newEvent, ...current.filter((e) => e.id !== newEvent.id)]
    saveEvents(updated)

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

    const current = loadEvents()
    const updated = current.map((ev) =>
      ev.id === id ? { ...ev, ...updates, updatedAt: new Date().toISOString() } : ev
    )
    saveEvents(updated)

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

    const current = loadEvents()
    const updated = current.filter((e) => e.id !== id)
    saveEvents(updated)

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
