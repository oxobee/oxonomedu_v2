import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// =============================================================================
// Oxonom EDU Unified Edge Router (proxy.ts)
// =============================================================================

interface InstanceInfo {
  multi_org_enabled: boolean
  default_org_slug: string
  mode: 'saas' | 'oss' | 'ee'
  tenancy: 'single'
  frontend_domain: string
  top_domain: string
}

const DEFAULT_INSTANCE: InstanceInfo = {
  multi_org_enabled: false,
  default_org_slug: 'demo',
  mode: 'saas',
  tenancy: 'single',
  frontend_domain: 'edu.oxonom.com',
  top_domain: 'oxonom.com',
}

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const fullhost = req.headers.get('host') || 'edu.oxonom.com'

  // -------------------------------------------------------------------------
  // 1. Static asset bypass
  // -------------------------------------------------------------------------
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/games/') ||
    pathname.startsWith('/fonts/') ||
    pathname.startsWith('/images/') ||
    pathname.includes('.') // file extension like favicon.ico, images, manifest
  ) {
    return NextResponse.next()
  }

  // -------------------------------------------------------------------------
  // 2. Blocked obsolete endpoints
  // -------------------------------------------------------------------------
  const cleanPath = pathname.toLowerCase().replace(/\/+$/, '')
  const blockedPrefixes = [
    '/communities',
    '/dash/communities',
    '/developers',
    '/dash/developers',
    '/podcasts',
    '/dash/podcasts',
    '/analytics',
    '/dash/analytics',
  ]
  if (blockedPrefixes.some((prefix) => cleanPath === prefix || cleanPath.startsWith(`${prefix}/`))) {
    return new NextResponse('Not Found', { status: 404 })
  }

  // -------------------------------------------------------------------------
  // 3. Smartboard shortcuts (/1-A, /9-A, /tahta/...)
  // -------------------------------------------------------------------------
  if (pathname.startsWith('/tahta/')) {
    const rawBoard = pathname.replace(/^\/tahta\//, '').trim()
    if (rawBoard) {
      return NextResponse.redirect(new URL(`/pano/${encodeURIComponent(rawBoard.toUpperCase())}/tahta${search}`, req.url), 307)
    }
  }

  const shortBoardMatch = pathname.match(/^\/([1-9][0-9]?[A-Za-z](?:-[0-9]{1,3})?|[1-9][0-9]?-[A-Za-z](?:-[0-9]{1,3})?)$/i)
  if (shortBoardMatch) {
    const code = shortBoardMatch[1].toUpperCase()
    return NextResponse.redirect(new URL(`/pano/${encodeURIComponent(code)}${search}`, req.url), 307)
  }

  // -------------------------------------------------------------------------
  // 4. Legacy auth & dashboard redirects to Oxonom EDU canonical paths
  // -------------------------------------------------------------------------
  if (
    cleanPath === '/auth/login' ||
    cleanPath === '/auth' ||
    cleanPath === '/m-login' ||
    cleanPath === '/loginv2'
  ) {
    return NextResponse.redirect(new URL(`/login${search}`, req.url), 307)
  }

  const PRINCIPAL_LEGACY_MAP: Record<string, string> = {
    '/dash': '/principal/dashboard',
    '/dashv2': '/principal/dashboard',
    '/m-dashv2': '/principal/dashboard',
    '/m-admin': '/principal/dashboard',
    '/m-admin-teachers': '/principal/teachers',
    '/m-admin-students': '/principal/students',
    '/m-admin-classes': '/principal/classes',
    '/m-admin-schedule': '/principal/schedule',
    '/m-admin-boards': '/principal/boards',
    '/m-admin-reports': '/principal/reports',
    '/m-admin-curriculum': '/principal/curriculum',
    '/m-student': '/student/dashboard',
  }
  if (PRINCIPAL_LEGACY_MAP[cleanPath]) {
    return NextResponse.redirect(new URL(`${PRINCIPAL_LEGACY_MAP[cleanPath]}${search}`, req.url), 307)
  }

  // -------------------------------------------------------------------------
  // 5. Oxonom EDU Core Routes: /login, /student, /teacher, /principal, etc.
  // -------------------------------------------------------------------------
  if (
    pathname === '/login' ||
    pathname.startsWith('/login/') ||
    pathname === '/pricing' ||
    pathname.startsWith('/pricing/') ||
    pathname === '/student' ||
    pathname.startsWith('/student/') ||
    pathname === '/teacher' ||
    pathname.startsWith('/teacher/') ||
    pathname === '/principal' ||
    pathname.startsWith('/principal/') ||
    pathname === '/superadmin' ||
    pathname.startsWith('/superadmin/') ||
    pathname === '/gamestudio' ||
    pathname.startsWith('/gamestudio/') ||
    pathname === '/pano' ||
    pathname.startsWith('/pano/')
  ) {
    const response = NextResponse.rewrite(new URL(pathname + search, req.url))
    response.cookies.set({ name: 'LH_org', value: 'demo', path: '/' })
    response.cookies.set({ name: 'LH_tenancy', value: 'single', path: '/' })
    return response
  }

  // -------------------------------------------------------------------------
  // 6. Direct API and Health Pass-through
  // -------------------------------------------------------------------------
  if (pathname.startsWith('/api/') || pathname === '/api') {
    return NextResponse.next()
  }

  if (pathname.startsWith('/health')) {
    return NextResponse.rewrite(new URL(`/api/health`, req.url))
  }

  // -------------------------------------------------------------------------
  // 7. Apex Root & Default Fallback: Always serve /login
  // -------------------------------------------------------------------------
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/login${search}`, req.url), 307)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
