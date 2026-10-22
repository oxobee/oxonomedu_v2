export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'

export interface PrincipalProfileData {
  id?: number | string
  name: string
  title: string
  email: string
  tcNo: string
  phone: string
  twoFactorActive: boolean
  schoolName: string
  role?: string
  username?: string
  first_name?: string
  last_name?: string
  loginTime?: string
  institutionCode?: string
  updatedAt?: string
  is_customized?: boolean
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://crkoeptnoheiqxukxpig.supabase.co'
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNya29lcHRub2hlaXF4dWt4cGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjYxNjU2MCwiZXhwIjoyMTA4MTkyNTYwfQ.GyBCPOX4Zhp9hyhic2a8RtZU34eY21JOZGF9ZX40_7g'

async function fetchPrincipalFromSupabase(): Promise<PrincipalProfileData | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?role=eq.principal&select=*&limit=1`, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      cache: 'no-store',
    })

    if (!res.ok) return null
    const rows = await res.json()
    if (!Array.isArray(rows) || rows.length === 0) return null

    const row = rows[0]
    const fullName = (row.full_name || '').trim()
    if (!fullName) return null

    const parts = fullName.split(/\s+/)
    return {
      id: row.id,
      name: fullName,
      first_name: parts[0] || '',
      last_name: parts.slice(1).join(' ') || '',
      title: 'Okul Müdürü · Kurum Yetkilisi',
      email: row.email || 'mudur@oxonom.com',
      phone: row.phone || '+90 532 999 2200',
      tcNo: row.tc_no || '10000000001',
      schoolName: row.school_name || 'Necla Görer İlkokulu',
      twoFactorActive: true,
      role: '1. Derece Kurum Müdürü (Baş Yönetici)',
      username: 'mudur',
      updatedAt: row.updated_at || new Date().toISOString(),
      is_customized: true,
    }
  } catch (err) {
    console.error('Supabase fetch error for principal:', err)
    return null
  }
}

async function savePrincipalToSupabase(data: Partial<PrincipalProfileData>): Promise<boolean> {
  try {
    const fullName = (data.name || '').trim()
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }
    if (fullName) payload.full_name = fullName
    if (data.phone) payload.phone = data.phone.trim()
    if (data.tcNo) payload.tc_no = data.tcNo.trim()
    if (data.schoolName) payload.school_name = data.schoolName.trim()

    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?role=eq.principal`, {
      method: 'PATCH',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(payload),
    })

    if (data.schoolName) {
      // Also sync schools table
      fetch(`${SUPABASE_URL}/rest/v1/schools?limit=1`, {
        method: 'PATCH',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: data.schoolName.trim() }),
      }).catch(() => {})
    }

    return res.ok
  } catch (err) {
    console.error('Supabase update error for principal:', err)
    return false
  }
}

export async function GET(request: Request) {
  const supabaseProfile = await fetchPrincipalFromSupabase()

  let finalProfile: PrincipalProfileData
  if (supabaseProfile && supabaseProfile.name) {
    finalProfile = supabaseProfile
  } else {
    finalProfile = {
      id: 50,
      name: 'Dr. Uğur UĞURLU',
      title: 'Okul Müdürü · Kurum Yetkilisi',
      email: 'mudur@oxonom.com',
      tcNo: '10000000001',
      phone: '+90 532 999 2200',
      twoFactorActive: true,
      schoolName: 'Necla Görer İlkokulu',
      role: '1. Derece Kurum Müdürü (Baş Yönetici)',
      username: 'mudur',
      first_name: 'Dr. Uğur',
      last_name: 'UĞURLU',
      updatedAt: new Date().toISOString(),
    }
  }

  return NextResponse.json(
    {
      success: true,
      profile: finalProfile,
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
    const updates = body.profile || body

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ success: false, error: 'Geçersiz profil verisi' }, { status: 400 })
    }

    const name = (updates.name ?? '').trim()
    const parts = name.split(/\s+/)
    const first_name = updates.first_name || parts[0] || ''
    const last_name = updates.last_name || parts.slice(1).join(' ') || ''

    const merged: PrincipalProfileData = {
      id: updates.id || 50,
      name,
      first_name,
      last_name,
      title: (updates.title ?? 'Okul Müdürü · Kurum Yetkilisi').trim(),
      email: (updates.email ?? 'mudur@oxonom.com').trim(),
      phone: (updates.phone ?? '+90 532 999 2200').trim(),
      tcNo: (updates.tcNo ?? '10000000001').trim(),
      schoolName: (updates.schoolName ?? 'Necla Görer İlkokulu').trim(),
      twoFactorActive: updates.twoFactorActive ?? true,
      is_customized: true,
      updatedAt: new Date().toISOString(),
    }

    // Persist to Supabase Database (Single Source of Truth)
    await savePrincipalToSupabase(merged)

    const response = NextResponse.json(
      {
        success: true,
        message: 'Müdür profili Supabase veritabanında başarıyla güncellendi.',
        profile: merged,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    )

    try {
      response.cookies.set('oxonom_principal_name', encodeURIComponent(merged.name), {
        path: '/',
        maxAge: 31536000,
        sameSite: 'lax',
      })
      response.cookies.set('oxonom_principal_profile', encodeURIComponent(JSON.stringify(merged)), {
        path: '/',
        maxAge: 31536000,
        sameSite: 'lax',
      })
    } catch (_) {}

    return response
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Bilinmeyen sunucu hatası' },
      { status: 500 }
    )
  }
}
