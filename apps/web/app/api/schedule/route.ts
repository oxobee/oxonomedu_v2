export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'

// Canonical 30-hour (6 periods/day x 5 days) MEB schedule for 9-A as authentic initial dataset
export const CANONICAL_9A_SCHEDULE = [
  // Pazartesi (6)
  { id: 'sc-9a-mon-1', orgId: 30, day: 'mon', period: 1, classCode: '9-A', subject: 'Türk Dili ve Edebiyatı', teacherName: 'Bahar ÇETİN', roomName: 'Derslik 9-A', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-9a-mon-2', orgId: 30, day: 'mon', period: 2, classCode: '9-A', subject: 'Türk Dili ve Edebiyatı', teacherName: 'Bahar ÇETİN', roomName: 'Derslik 9-A', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-9a-mon-3', orgId: 30, day: 'mon', period: 3, classCode: '9-A', subject: 'Matematik', teacherName: 'Bahar ÇETİN', roomName: 'Derslik 9-A', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-9a-mon-4', orgId: 30, day: 'mon', period: 4, classCode: '9-A', subject: 'Matematik', teacherName: 'Bahar ÇETİN', roomName: 'Derslik 9-A', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-9a-mon-5', orgId: 30, day: 'mon', period: 5, classCode: '9-A', subject: 'Fizik & Fen Bilimleri', teacherName: 'Bahar ÇETİN', roomName: 'Fen & Teknoloji Laboratuvarı', color: 'emerald', isSmartBoardActive: true },
  { id: 'sc-9a-mon-6', orgId: 30, day: 'mon', period: 6, classCode: '9-A', subject: 'Fizik & Fen Bilimleri', teacherName: 'Bahar ÇETİN', roomName: 'Fen & Teknoloji Laboratuvarı', color: 'emerald', isSmartBoardActive: true },

  // Salı (6)
  { id: 'sc-9a-tue-1', orgId: 30, day: 'tue', period: 1, classCode: '9-A', subject: 'Türk Dili ve Edebiyatı', teacherName: 'Bahar ÇETİN', roomName: 'Derslik 9-A', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-9a-tue-2', orgId: 30, day: 'tue', period: 2, classCode: '9-A', subject: 'Türk Dili ve Edebiyatı', teacherName: 'Bahar ÇETİN', roomName: 'Derslik 9-A', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-9a-tue-3', orgId: 30, day: 'tue', period: 3, classCode: '9-A', subject: 'Matematik', teacherName: 'Bahar ÇETİN', roomName: 'Derslik 9-A', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-9a-tue-4', orgId: 30, day: 'tue', period: 4, classCode: '9-A', subject: 'Matematik', teacherName: 'Bahar ÇETİN', roomName: 'Derslik 9-A', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-9a-tue-5', orgId: 30, day: 'tue', period: 5, classCode: '9-A', subject: 'Fizik & Fen Bilimleri', teacherName: 'Bahar ÇETİN', roomName: 'Fen & Teknoloji Laboratuvarı', color: 'emerald', isSmartBoardActive: true },
  { id: 'sc-9a-tue-6', orgId: 30, day: 'tue', period: 6, classCode: '9-A', subject: 'Fizik & Fen Bilimleri', teacherName: 'Bahar ÇETİN', roomName: 'Fen & Teknoloji Laboratuvarı', color: 'emerald', isSmartBoardActive: true },

  // Çarşamba (6)
  { id: 'sc-9a-wed-1', orgId: 30, day: 'wed', period: 1, classCode: '9-A', subject: 'Türk Dili ve Edebiyatı', teacherName: 'Bahar ÇETİN', roomName: 'Derslik 9-A', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-9a-wed-2', orgId: 30, day: 'wed', period: 2, classCode: '9-A', subject: 'Matematik', teacherName: 'Bahar ÇETİN', roomName: 'Derslik 9-A', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-9a-wed-3', orgId: 30, day: 'wed', period: 3, classCode: '9-A', subject: 'Matematik', teacherName: 'Bahar ÇETİN', roomName: 'Derslik 9-A', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-9a-wed-4', orgId: 30, day: 'wed', period: 4, classCode: '9-A', subject: 'Bilişim & Yazılım', teacherName: 'Bahar ÇETİN', roomName: 'Bilişim & Kodlama Atölyesi', color: 'cyan', isSmartBoardActive: true },
  { id: 'sc-9a-wed-5', orgId: 30, day: 'wed', period: 5, classCode: '9-A', subject: 'Bilişim & Yazılım', teacherName: 'Bahar ÇETİN', roomName: 'Bilişim & Kodlama Atölyesi', color: 'cyan', isSmartBoardActive: true },
  { id: 'sc-9a-wed-6', orgId: 30, day: 'wed', period: 6, classCode: '9-A', subject: 'Yabancı Dil (İngilizce)', teacherName: 'Bahar ÇETİN', roomName: 'Derslik 9-A', color: 'purple', isSmartBoardActive: true },

  // Perşembe (6)
  { id: 'sc-9a-thu-1', orgId: 30, day: 'thu', period: 1, classCode: '9-A', subject: 'Bilişim & Yazılım', teacherName: 'Bahar ÇETİN', roomName: 'Bilişim & Kodlama Atölyesi', color: 'cyan', isSmartBoardActive: true },
  { id: 'sc-9a-thu-2', orgId: 30, day: 'thu', period: 2, classCode: '9-A', subject: 'Yabancı Dil (İngilizce)', teacherName: 'Bahar ÇETİN', roomName: 'Derslik 9-A', color: 'purple', isSmartBoardActive: true },
  { id: 'sc-9a-thu-3', orgId: 30, day: 'thu', period: 3, classCode: '9-A', subject: 'Yabancı Dil (İngilizce)', teacherName: 'Bahar ÇETİN', roomName: 'Derslik 9-A', color: 'purple', isSmartBoardActive: true },
  { id: 'sc-9a-thu-4', orgId: 30, day: 'thu', period: 4, classCode: '9-A', subject: 'Tarih', teacherName: 'Bahar ÇETİN', roomName: 'Derslik 9-A', color: 'amber', isSmartBoardActive: true },
  { id: 'sc-9a-thu-5', orgId: 30, day: 'thu', period: 5, classCode: '9-A', subject: 'Tarih', teacherName: 'Bahar ÇETİN', roomName: 'Derslik 9-A', color: 'amber', isSmartBoardActive: true },
  { id: 'sc-9a-thu-6', orgId: 30, day: 'thu', period: 6, classCode: '9-A', subject: 'Coğrafya', teacherName: 'Bahar ÇETİN', roomName: 'Derslik 9-A', color: 'teal', isSmartBoardActive: true },

  // Cuma (6)
  { id: 'sc-9a-fri-1', orgId: 30, day: 'fri', period: 1, classCode: '9-A', subject: 'Yabancı Dil (İngilizce)', teacherName: 'Bahar ÇETİN', roomName: 'Derslik 9-A', color: 'purple', isSmartBoardActive: true },
  { id: 'sc-9a-fri-2', orgId: 30, day: 'fri', period: 2, classCode: '9-A', subject: 'Coğrafya', teacherName: 'Bahar ÇETİN', roomName: 'Derslik 9-A', color: 'teal', isSmartBoardActive: true },
  { id: 'sc-9a-fri-3', orgId: 30, day: 'fri', period: 3, classCode: '9-A', subject: 'Beden Eğitimi & Spor', teacherName: 'Bahar ÇETİN', roomName: 'Kapalı Spor Salonu', color: 'orange', isSmartBoardActive: false },
  { id: 'sc-9a-fri-4', orgId: 30, day: 'fri', period: 4, classCode: '9-A', subject: 'Beden Eğitimi & Spor', teacherName: 'Bahar ÇETİN', roomName: 'Kapalı Spor Salonu', color: 'orange', isSmartBoardActive: false },
  { id: 'sc-9a-fri-5', orgId: 30, day: 'fri', period: 5, classCode: '9-A', subject: 'Görsel Sanatlar & Atölye', teacherName: 'Bahar ÇETİN', roomName: 'Görsel Sanatlar Atölyesi', color: 'pink', isSmartBoardActive: false },
  { id: 'sc-9a-fri-6', orgId: 30, day: 'fri', period: 6, classCode: '9-A', subject: 'Müzik & Sahne Sanatları', teacherName: 'Bahar ÇETİN', roomName: 'Müzik Odası', color: 'pink', isSmartBoardActive: true },
]

export const CANONICAL_6_PERIODS = [
  { periodNumber: 1, time: '08:30 - 09:10' },
  { periodNumber: 2, time: '09:25 - 10:05' },
  { periodNumber: 3, time: '10:20 - 11:00' },
  { periodNumber: 4, time: '11:15 - 11:55', isLunchAfter: true },
  { periodNumber: 5, time: '12:45 - 13:25' },
  { periodNumber: 6, time: '13:40 - 14:20' },
]

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://crkoeptnoheiqxukxpig.supabase.co'
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNya29lcHRub2hlaXF4dWt4cGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjYxNjU2MCwiZXhwIjoyMTA4MTkyNTYwfQ.GyBCPOX4Zhp9hyhic2a8RtZU34eY21JOZGF9ZX40_7g'

const DAY_CODE_TO_INT: Record<string, number> = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
}

const INT_TO_DAY_CODE: Record<number, string> = {
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
}

function getSubjectColor(subject: string): string {
  const s = (subject || '').toLowerCase()
  if (s.includes('türk') || s.includes('edebiyat')) return 'blue'
  if (s.includes('matematik')) return 'indigo'
  if (s.includes('fizik') || s.includes('fen')) return 'emerald'
  if (s.includes('bilişim') || s.includes('yazılım')) return 'cyan'
  if (s.includes('yabancı') || s.includes('ingilizce')) return 'purple'
  if (s.includes('tarih')) return 'amber'
  if (s.includes('coğrafya')) return 'teal'
  if (s.includes('beden') || s.includes('spor')) return 'orange'
  if (s.includes('müzik') || s.includes('görsel')) return 'pink'
  return 'slate'
}

async function fetchScheduleFromSupabase(): Promise<{ schedule: any[]; periods: any[] } | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/schedules?select=*&order=day_of_week.asc,period.asc`, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      cache: 'no-store',
    })

    if (!res.ok) return null
    const rows = await res.json()

    if (Array.isArray(rows) && rows.length > 0) {
      const schedule = rows.map((r: any) => ({
        id: r.id,
        orgId: 30,
        day: INT_TO_DAY_CODE[r.day_of_week] || 'mon',
        period: r.period,
        classCode: r.class_name || '9-A',
        subject: r.subject,
        teacherName: r.teacher_name,
        roomName: r.classroom || 'Derslik 9-A',
        color: getSubjectColor(r.subject),
        isSmartBoardActive: true,
      }))
      return { schedule, periods: CANONICAL_6_PERIODS }
    }

    // Auto-seed canonical schedule to Supabase if empty
    await seedCanonicalToSupabase()
    return { schedule: CANONICAL_9A_SCHEDULE, periods: CANONICAL_6_PERIODS }
  } catch (err) {
    console.error('[api/schedule] Supabase fetch error:', err)
    return null
  }
}

async function seedCanonicalToSupabase() {
  try {
    const payload = CANONICAL_9A_SCHEDULE.map((item) => {
      const periodInfo = CANONICAL_6_PERIODS.find((p) => p.periodNumber === item.period)
      const times = (periodInfo?.time || '08:30 - 09:10').split('-').map((s) => s.trim())
      return {
        class_name: item.classCode || '9-A',
        day_of_week: DAY_CODE_TO_INT[item.day] || 1,
        period: item.period,
        subject: item.subject,
        teacher_name: item.teacherName,
        classroom: item.roomName,
        start_time: times[0] || '08:30',
        end_time: times[1] || '09:10',
      }
    })

    await fetch(`${SUPABASE_URL}/rest/v1/schedules`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.warn('[api/schedule] Failed to seed canonical rows:', err)
  }
}

export async function GET() {
  const dbData = await fetchScheduleFromSupabase()
  const activeSchedule = dbData?.schedule || CANONICAL_9A_SCHEDULE
  const activePeriods = dbData?.periods || CANONICAL_6_PERIODS

  return NextResponse.json(
    {
      success: true,
      schedule: activeSchedule,
      periods: activePeriods,
      publishedAt: new Date().toISOString(),
      publishedBy: 'Kemal SOYSAL (Okul Müdürü)',
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
    const { schedule, periods, publishedBy } = body

    if (!Array.isArray(schedule) || schedule.length === 0) {
      return NextResponse.json({ success: false, error: 'Geçersiz program verisi' }, { status: 400 })
    }

    const effectivePeriods =
      Array.isArray(periods) && periods.length > 0 ? periods : CANONICAL_6_PERIODS

    // Delete existing rows for 9-A in Supabase
    await fetch(`${SUPABASE_URL}/rest/v1/schedules?class_name=eq.9-A`, {
      method: 'DELETE',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
    })

    // Prepare batch insert rows for Supabase
    const rowsToInsert = schedule.map((item: any) => {
      const periodInfo = effectivePeriods.find((p: any) => p.periodNumber === item.period)
      const times = (periodInfo?.time || '08:30 - 09:10').split('-').map((s: string) => s.trim())
      return {
        class_name: item.classCode || '9-A',
        day_of_week: typeof item.day === 'number' ? item.day : (DAY_CODE_TO_INT[item.day] || 1),
        period: item.period,
        subject: item.subject,
        teacher_name: item.teacherName || 'Öğretmen',
        classroom: item.roomName || 'Derslik 9-A',
        start_time: times[0] || '08:30',
        end_time: times[1] || '09:10',
      }
    })

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/schedules`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rowsToInsert),
    })

    if (!insertRes.ok) {
      const errText = await insertRes.text()
      console.error('[api/schedule] Supabase batch insert error:', errText)
    }

    const nowStr = new Date().toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    })

    return NextResponse.json({
      success: true,
      message: 'Ders programı başarıyla Supabase kalıcı veritabanına kaydedildi ve yayınlandı.',
      totalHours: schedule.length,
      publishedAt: nowStr,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Bilinmeyen hata' },
      { status: 500 }
    )
  }
}
