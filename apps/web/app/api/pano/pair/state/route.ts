import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// State route removed — board no longer syncs state with phone.
// Board manages UI locally after QR/code pairing.
// Kept as empty 404 to avoid breaking existing clients gracefully.

export async function GET(_req: NextRequest) {
  return NextResponse.json({ success: false, error: 'State sync removed', code: 'not_implemented' }, { status: 404 })
}

export async function POST(_req: NextRequest) {
  return NextResponse.json({ success: false, error: 'State sync removed', code: 'not_implemented' }, { status: 404 })
}
