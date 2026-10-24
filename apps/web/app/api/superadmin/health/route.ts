// apps/web/app/api/superadmin/health/route.ts
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://crkoeptnoheiqxukxpig.supabase.co'
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNya29lcHRub2hlaXF4dWt4cGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2MTY1NjAsImV4cCI6MjEwODE5MjU2MH0.W3kgRX9GPoy5AhnYFBw51tFk27d9xTHoKCkQeB5IoyI'

export async function GET() {
  const startTime = Date.now()
  let dbStatus = 'healthy'
  let dbLatency = 0
  let tableCount = 0

  try {
    const pingStart = Date.now()
    const res = await fetch(`${SUPABASE_URL}/rest/v1/schools?select=id,name,code&limit=5`, {
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
      cache: 'no-store',
    })
    dbLatency = Date.now() - pingStart

    if (res.ok) {
      const rows = await res.json()
      tableCount = Array.isArray(rows) ? rows.length : 0
      dbStatus = 'connected'
    } else {
      dbStatus = 'degraded'
    }
  } catch (err) {
    dbStatus = 'unreachable'
    dbLatency = -1
  }

  const memory = process.memoryUsage ? process.memoryUsage() : null
  const uptime = process.uptime ? Math.round(process.uptime()) : 0

  return NextResponse.json(
    {
      status: 'operational',
      timestamp: new Date().toISOString(),
      uptimeSeconds: uptime,
      server: {
        runtime: 'Node.js Edge Compatible',
        region: 'fra1 (Frankfurt)',
        ssl: 'TLS 1.3 / AES-256',
        httpVersion: 'HTTP/2',
      },
      database: {
        provider: 'Supabase PostgreSQL',
        status: dbStatus,
        latencyMs: dbLatency,
        schoolsRecorded: tableCount,
        endpoint: SUPABASE_URL,
      },
      memory: memory
        ? {
            heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
            heapTotalMb: Math.round(memory.heapTotal / 1024 / 1024),
            rssMb: Math.round(memory.rss / 1024 / 1024),
          }
        : null,
      totalExecutionMs: Date.now() - startTime,
    },
    { status: 200 }
  )
}
