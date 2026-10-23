export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { CANONICAL_SCHOOL_EXAMS, SchoolExamItem } from '@/lib/teacher/teacherAgendaStorage'
import { getPanoDb } from '@/lib/pano-pair/store'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://crkoeptnoheiqxukxpig.supabase.co'
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNya29lcHRub2hlaXF4dWt4cGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjYxNjU2MCwiZXhwIjoyMTA4MTkyNTYwfQ.GyBCPOX4Zhp9hyhic2a8RtZU34eY21JOZGF9ZX40_7g'

let memoryExamsCache: SchoolExamItem[] | null = null

async function getExamsFromSupabase(): Promise<SchoolExamItem[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/exams_and_tests?select=*&order=created_at.desc`, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      cache: 'no-store',
    })

    if (res.ok) {
      const rows = await res.json()
      if (Array.isArray(rows) && rows.length > 0) {
        const exams: SchoolExamItem[] = rows.map((r: any) => {
          const extra = typeof r.questions === 'object' && r.questions ? r.questions : {}
          return {
            id: r.id,
            title: r.topic || extra.title || `${r.course_name} Yazılı Sınavı`,
            courseName: r.course_name || 'Türkçe',
            className: r.class_name || '1/A',
            type: extra.type || 'exam',
            date: extra.date || '2026-10-30',
            time: extra.time || '09:25',
            durationMinutes: extra.durationMinutes || 40,
            location: extra.location || 'Derslik 101 (1/A)',
            teacherName: extra.teacherName || 'Bahar ÇETİN',
            isPublished: extra.isPublished !== undefined ? !!extra.isPublished : true,
            status: extra.status || 'upcoming',
            scores: extra.scores || {},
          }
        })
        memoryExamsCache = exams
        return exams
      }
    }
  } catch (err) {
    console.error('[api/exams] Supabase fetch error:', err)
  }

  // Also check MongoDB if available
  try {
    const db = await getPanoDb()
    if (db) {
      const examsCol = db.collection('school_exams')
      const docs = await examsCol.find({}).toArray()
      if (docs && docs.length > 0) {
        const exams = docs.map((d: any) => {
          const { _id, ...rest } = d
          return rest as SchoolExamItem
        })
        memoryExamsCache = exams
        return exams
      }
    }
  } catch (_) {}

  return memoryExamsCache || CANONICAL_SCHOOL_EXAMS
}

export async function GET(request: Request) {
  const exams = await getExamsFromSupabase()

  const { searchParams } = new URL(request.url)
  const className = searchParams.get('className')

  let filtered = exams
  if (className && className !== 'all' && className !== 'Tüm Sınıflar') {
    filtered = exams.filter(
      (e) => e.className === className || e.className === 'Tüm Sınıflar'
    )
  }

  return NextResponse.json(
    {
      success: true,
      exams: filtered,
      totalCount: filtered.length,
      updatedAt: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  )
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { exam, exams } = body

    const itemsToSave: SchoolExamItem[] = exam ? [exam] : Array.isArray(exams) ? exams : []

    if (itemsToSave.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Eksik veya geçersiz sınav verisi' },
        { status: 400 }
      )
    }

    // 1. Save directly into Supabase PostgreSQL database
    for (const item of itemsToSave) {
      const supabasePayload = {
        course_name: item.courseName || 'Türk Dili ve Edebiyatı',
        class_name: item.className || '9-A',
        topic: item.title,
        questions: {
          title: item.title,
          type: item.type || 'exam',
          date: item.date,
          time: item.time,
          durationMinutes: item.durationMinutes,
          location: item.location,
          teacherName: item.teacherName,
          isPublished: item.isPublished,
          status: item.status,
          scores: item.scores || {},
        },
      }

      await fetch(`${SUPABASE_URL}/rest/v1/exams_and_tests`, {
        method: 'POST',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(supabasePayload),
      })
    }

    // 2. Also mirror into MongoDB if connected
    try {
      const db = await getPanoDb()
      if (db) {
        const examsCol = db.collection('school_exams')
        for (const item of itemsToSave) {
          const { _id, ...cleanItem } = item as any
          await examsCol.updateOne({ id: item.id }, { $set: cleanItem }, { upsert: true })
        }
      }
    } catch (_) {}

    // Refresh memory cache
    const current = (memoryExamsCache || CANONICAL_SCHOOL_EXAMS).filter(
      (e) => !itemsToSave.some((it) => it.id === e.id)
    )
    const updated = [...itemsToSave, ...current]
    memoryExamsCache = updated

    return NextResponse.json({
      success: true,
      message: 'Sınav Supabase kalıcı veritabanına başarıyla kaydedildi.',
      exam: itemsToSave[0],
      exams: updated,
      totalCount: updated.length,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Sınav ID belirtilmedi' }, { status: 400 })
    }

    // 1. Delete from Supabase
    await fetch(`${SUPABASE_URL}/rest/v1/exams_and_tests?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
    })

    // 2. Delete from MongoDB if available
    try {
      const db = await getPanoDb()
      if (db) {
        const examsCol = db.collection('school_exams')
        await examsCol.deleteMany({ id })
      }
    } catch (_) {}

    // Update memory cache
    const current = memoryExamsCache || CANONICAL_SCHOOL_EXAMS
    const updated = current.filter((e) => String(e.id) !== id)
    memoryExamsCache = updated

    return NextResponse.json({
      success: true,
      message: 'Sınav Supabase veritabanından kalıcı olarak silindi.',
      deletedId: id,
      totalCount: updated.length,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
