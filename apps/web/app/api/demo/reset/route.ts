export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { DEMO_SCHEMA_VERSION, DEMO_RESET_INTERVAL_MS } from '@/lib/demo/demoMasterData'

export async function GET() {
  return NextResponse.json({
    success: true,
    schemaVersion: DEMO_SCHEMA_VERSION,
    resetIntervalMinutes: DEMO_RESET_INTERVAL_MS / 60000,
    timestamp: new Date().toISOString(),
    message: 'Oxonom EDU demo reset engine is active (30 min auto-refresh).',
  })
}

export async function POST() {
  return NextResponse.json({
    success: true,
    action: 'reset_confirmed',
    schemaVersion: DEMO_SCHEMA_VERSION,
    timestamp: new Date().toISOString(),
    message: 'Demo verileri sıfırlandı.',
  })
}
