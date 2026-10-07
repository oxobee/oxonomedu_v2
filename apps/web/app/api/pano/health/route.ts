import { NextResponse } from 'next/server'
import { checkMongoHealth } from '@/lib/pano-pair/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const health = await checkMongoHealth()
    return NextResponse.json(health, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      {
        mongoConfigured: Boolean(process.env.MONGODB_URI),
        mongoPing: false,
        redisConfigured: Boolean(process.env.REDIS_URL || process.env.LEARNHOUSE_REDIS_URL),
        env: process.env.VERCEL ? 'vercel' : 'other',
        error: error?.message || 'Sağlık kontrolü başarısız',
      },
      { status: 500 }
    )
  }
}
