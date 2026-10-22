export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { getPanoDb } from '@/lib/pano-pair/store'
import type { SchoolAssignmentItem } from '@/services/school_assignments/school_assignments'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://crkoeptnoheiqxukxpig.supabase.co'
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNya29lcHRub2hlaXF4dWt4cGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjYxNjU2MCwiZXhwIjoyMTA4MTkyNTYwfQ.GyBCPOX4Zhp9hyhic2a8RtZU34eY21JOZGF9ZX40_7g'

export const CANONICAL_SCHOOL_ASSIGNMENTS: SchoolAssignmentItem[] = [
  {
    id: 1001,
    assignment_uuid: 'asg_dede_korkut_okuma',
    title: 'Dede Korkut Hikâyeleri Metin Tahlili & Karakter İncelemesi',
    description: 'Dede Korkut destanlarından "Dirse Han Oğlu Boğaç Han" boyunun ana fikri, olay örgüsü ve kültürel motiflerinin tahlili.',
    grade_level: '9. Sınıf',
    grade_category: 'Lise (9-12)',
    subject: 'Türk Dili ve Edebiyatı',
    tool_type: 'READING',
    classes: [{ id: 101, name: '9-A Şubesi', code: '9/A' }],
    due_date: '2026-10-30T23:59:00',
    max_score: 100,
    published: true,
    teacher_name: 'Ebru TEKNECİ',
    creation_date: '2026-10-06T09:00:00',
    tool_data: {
      readingBook: 'Dede Korkut Kitabı',
      readingPages: 'Sayfa 15-42',
      readingQuestions: '1) Boğaç Han boyunun teması nedir? 2) Dirse Han ve hatununun fedakarlığı neyi simgeler?',
    },
  },
  {
    id: 1002,
    assignment_uuid: 'asg_edebi_sanatlar_tahta',
    title: 'Edebi Sanatlar & Teşbih-Mecaz Kavram Haritası Çizimi',
    description: 'Divan ve Halk edebiyatında kullanılan teşbih, istiare ve mecaz-ı mürsel sanatlarını gösteren interaktif kavram haritası.',
    grade_level: '9. Sınıf',
    grade_category: 'Lise (9-12)',
    subject: 'Türk Dili ve Edebiyatı',
    tool_type: 'WHITEBOARD',
    board_uuid: 'board_edebi_sanatlar_9a',
    classes: [{ id: 101, name: '9-A Şubesi', code: '9/A' }],
    due_date: '2026-11-02T23:59:00',
    max_score: 100,
    published: true,
    teacher_name: 'Ebru TEKNECİ',
    creation_date: '2026-10-08T10:00:00',
    tool_data: {
      whiteboardTopic: 'Teşbih, İstiare ve Mecaz Sanatları Şeması',
      whiteboardCanvasType: 'İnteraktif Çizim Tuvali',
    },
  },
  {
    id: 1003,
    assignment_uuid: 'asg_paragraf_anlam_test',
    title: 'Sözcükte Anlam & Paragrafta Ana Düşünce Değerlendirme Quiz',
    description: 'ÖSYM ve MEB soru havuzuna uyumlu 10 soruluk paragraf yapısı ve cümlede anlam pekiştirme sınavı.',
    grade_level: '9. Sınıf',
    grade_category: 'Lise (9-12)',
    subject: 'Türk Dili ve Edebiyatı',
    tool_type: 'QUIZ',
    classes: [{ id: 101, name: '9-A Şubesi', code: '9/A' }],
    due_date: '2026-11-05T23:59:00',
    max_score: 100,
    published: true,
    teacher_name: 'Ebru TEKNECİ',
    creation_date: '2026-10-10T11:00:00',
    tool_data: {
      quizQuestions: [
        {
          id: 1,
          question: '"Gözlerini ufuktan bir an olsun ayırmıyordu." cümlesindeki edebi sanat hangisidir?',
          options: ['Teşbih', 'Mecaz-ı Mürsel', 'Kinaye', 'Tezat'],
          correctIndex: 1,
          points: 10,
        },
      ],
    },
  },
]

// In-memory cache for fast read within the same serverless instance
let memoryAssignmentsCache: SchoolAssignmentItem[] | null = null

async function getAssignmentsFromSupabase(): Promise<SchoolAssignmentItem[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/assignments?select=*&order=created_at.desc`, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      cache: 'no-store',
    })

    if (res.ok) {
      const rows = await res.json()
      if (Array.isArray(rows) && rows.length > 0) {
        const mapped: SchoolAssignmentItem[] = rows.map((r: any, idx: number) => ({
          id: r.id,
          assignment_uuid: r.id,
          title: r.title,
          description: r.description || '',
          grade_level: '9. Sınıf',
          grade_category: 'Lise (9-12)',
          subject: r.course_name || 'Türk Dili ve Edebiyatı',
          tool_type: 'READING',
          classes: [{ id: 101, name: `${r.class_name || '9-A'} Şubesi`, code: r.class_name || '9/A' }],
          due_date: r.due_date || new Date().toISOString(),
          max_score: 100,
          published: true,
          teacher_name: r.teacher_name || 'Ebru TEKNECİ',
          creation_date: r.created_at || new Date().toISOString(),
          tool_data: {},
        }))
        memoryAssignmentsCache = mapped
        return mapped
      }
    }
  } catch (err) {
    console.error('[api/assignments] Supabase fetch error:', err)
  }

  // Also check MongoDB if available
  try {
    const db = await getPanoDb()
    if (db) {
      const col = db.collection('school_assignments')
      const docs = await col.find({}).toArray()
      if (docs && docs.length > 0) {
        const mapped = docs.map((d: any) => {
          const { _id, ...rest } = d
          return rest as SchoolAssignmentItem
        })
        memoryAssignmentsCache = mapped
        return mapped
      }
    }
  } catch (_) {}

  // Fallback to canonical sample assignments
  return memoryAssignmentsCache || CANONICAL_SCHOOL_ASSIGNMENTS
}

export async function GET(request: Request) {
  const assignments = await getAssignmentsFromSupabase()

  const { searchParams } = new URL(request.url)
  const subject = searchParams.get('subject')
  const toolType = searchParams.get('tool_type')

  let filtered = assignments
  if (subject && subject !== 'all') {
    filtered = filtered.filter((a) => a.subject === subject)
  }
  if (toolType && toolType !== 'all') {
    filtered = filtered.filter((a) => a.tool_type === toolType)
  }

  return NextResponse.json(
    {
      success: true,
      assignments: filtered,
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
    const { assignment, assignments } = body

    const itemsToSave: SchoolAssignmentItem[] = assignment
      ? [assignment]
      : Array.isArray(assignments)
      ? assignments
      : []

    if (itemsToSave.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Eksik veya geçersiz ödev verisi' },
        { status: 400 }
      )
    }

    // 1. Save directly into Supabase PostgreSQL database
    for (const item of itemsToSave) {
      const className = Array.isArray(item.classes) && item.classes[0]?.name
        ? item.classes[0].name.replace(' Şubesi', '')
        : '9-A'

      const supabasePayload = {
        title: item.title,
        description: item.description || '',
        class_name: className,
        course_name: item.subject || 'Türk Dili ve Edebiyatı',
        teacher_name: item.teacher_name || 'Ebru TEKNECİ',
        due_date: item.due_date || new Date().toISOString(),
      }

      await fetch(`${SUPABASE_URL}/rest/v1/assignments`, {
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
        const col = db.collection('school_assignments')
        for (const item of itemsToSave) {
          const { _id, ...cleanItem } = item as any
          const searchKey = item.assignment_uuid
            ? { assignment_uuid: item.assignment_uuid }
            : { id: item.id }
          await col.updateOne(searchKey, { $set: cleanItem }, { upsert: true })
        }
      }
    } catch (_) {}

    // Refresh memory cache
    const current = (memoryAssignmentsCache || CANONICAL_SCHOOL_ASSIGNMENTS).filter(
      (e) => !itemsToSave.some((it) => it.id === e.id || it.assignment_uuid === e.assignment_uuid)
    )
    const updated = [...itemsToSave, ...current]
    memoryAssignmentsCache = updated

    return NextResponse.json({
      success: true,
      message: 'Ödev Supabase kalıcı veritabanına başarıyla kaydedildi.',
      assignment: itemsToSave[0],
      assignments: updated,
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
      return NextResponse.json({ success: false, error: 'Ödev ID belirtilmedi' }, { status: 400 })
    }

    // 1. Delete from Supabase
    await fetch(`${SUPABASE_URL}/rest/v1/assignments?id=eq.${encodeURIComponent(id)}`, {
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
        const col = db.collection('school_assignments')
        await col.deleteMany({
          $or: [{ id: isNaN(Number(id)) ? -1 : Number(id) }, { assignment_uuid: id }],
        })
      }
    } catch (_) {}

    // Update memory cache
    const current = memoryAssignmentsCache || CANONICAL_SCHOOL_ASSIGNMENTS
    const updated = current.filter((e) => String(e.id) !== id && e.assignment_uuid !== id)
    memoryAssignmentsCache = updated

    return NextResponse.json({
      success: true,
      message: 'Ödev Supabase veritabanından kalıcı olarak silindi.',
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
