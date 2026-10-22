export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export interface PrincipalProfileData {
  id?: number
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

export const DEFAULT_CANONICAL_PRINCIPAL: PrincipalProfileData = {
  id: 50,
  name: 'Dr. Uğur UĞURLU',
  title: 'Okul Müdürü · Kurum Yetkilisi',
  email: 'mudur@oxonom.com',
  tcNo: '10000000001',
  phone: '+90 532 999 2200',
  twoFactorActive: true,
  schoolName: 'Oxonom Okulları',
  role: '1. Derece Kurum Müdürü (Baş Yönetici)',
  username: 'mudur',
  first_name: 'Dr. Uğur',
  last_name: 'UĞURLU',
  loginTime: 'Bugün, 08:30',
  institutionCode: '741295',
  updatedAt: new Date().toISOString(),
}

let inMemoryPrincipal: PrincipalProfileData = { ...DEFAULT_CANONICAL_PRINCIPAL }
const STORAGE_FILE = path.join('/tmp', 'oxonom_principal_profile.json')

function loadProfileFromFile(): PrincipalProfileData {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const content = fs.readFileSync(STORAGE_FILE, 'utf-8')
      const parsed = JSON.parse(content)
      if (parsed && typeof parsed.name === 'string' && parsed.name.trim().length > 0) {
        inMemoryPrincipal = { ...DEFAULT_CANONICAL_PRINCIPAL, ...parsed }
      }
    }
  } catch (_) {}
  return inMemoryPrincipal
}

function saveProfileToFile(data: PrincipalProfileData) {
  try {
    inMemoryPrincipal = data
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (_) {}
}

// Initial load
loadProfileFromFile()

export async function GET(request: Request) {
  let profile = loadProfileFromFile()

  // Always check cookie if cookie carries newer or customized data
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const match = cookieHeader.match(/oxonom_principal_profile=([^;]+)/)
    if (match && match[1]) {
      const decoded = JSON.parse(decodeURIComponent(match[1]))
      if (decoded && decoded.name && decoded.name.trim().length > 0) {
        const cookieTime = decoded.updatedAt ? new Date(decoded.updatedAt).getTime() : 0
        const serverTime = profile.updatedAt ? new Date(profile.updatedAt).getTime() : 0
        if (cookieTime >= serverTime || !profile.is_customized) {
          profile = { ...DEFAULT_CANONICAL_PRINCIPAL, ...decoded, is_customized: true }
          saveProfileToFile(profile)
        }
      }
    }
  } catch (_) {}

  return NextResponse.json(
    {
      success: true,
      profile,
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

    const current = loadProfileFromFile()
    const name = (updates.name ?? current.name ?? '').trim()
    const parts = name.split(/\s+/)
    const first_name = updates.first_name || parts[0] || 'Dr. Uğur'
    const last_name = updates.last_name || parts.slice(1).join(' ') || 'UĞURLU'

    const merged: any = {
      ...current,
      ...updates,
      name,
      first_name,
      last_name,
      title: (updates.title ?? current.title ?? '').trim(),
      email: (updates.email ?? current.email ?? '').trim(),
      phone: (updates.phone ?? current.phone ?? '').trim(),
      tcNo: (updates.tcNo ?? current.tcNo ?? '').trim(),
      schoolName: (updates.schoolName ?? current.schoolName ?? 'Oxonom Okulları').trim(),
      twoFactorActive: updates.twoFactorActive ?? current.twoFactorActive ?? true,
      is_customized: true,
      updatedAt: new Date().toISOString(),
    }

    saveProfileToFile(merged)

    const response = NextResponse.json(
      {
        success: true,
        message: 'Müdür profili başarıyla güncellendi ve tüm cihazlara eşitlendi.',
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
      response.cookies.set('oxonom_principal_name', encodeURIComponent(merged.name), { path: '/', maxAge: 31536000, sameSite: 'lax' })
      response.cookies.set('oxonom_principal_profile', encodeURIComponent(JSON.stringify(merged)), { path: '/', maxAge: 31536000, sameSite: 'lax' })
    } catch (_) {}

    return response
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Bilinmeyen sunucu hatası' },
      { status: 500 }
    )
  }
}
