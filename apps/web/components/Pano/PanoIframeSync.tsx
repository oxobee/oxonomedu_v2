'use client'

import { useEffect, useRef, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function PanoIframeSyncInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastReportedPathRef = useRef<string>('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Only active inside an iframe
    if (window === window.parent) return

    const searchStr = window.location.search || ''
    const isPanoEmbedded =
      searchStr.includes('chrome=none') ||
      searchStr.includes('pano=1') ||
      (document.referrer && document.referrer.includes('/pano'))

    if (!isPanoEmbedded) return

    // Clean out chrome=none and pano=1 from synced path
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '')
    params.delete('chrome')
    params.delete('pano')
    const cleanQuery = params.toString() ? `?${params.toString()}` : ''
    const cleanPath = `${pathname}${cleanQuery}`

    if (cleanPath === lastReportedPathRef.current) return
    lastReportedPathRef.current = cleanPath

    try {
      window.parent.postMessage(
        {
          type: 'pano:navigate',
          path: cleanPath,
        },
        window.location.origin
      )
    } catch (_) {}
  }, [pathname, searchParams])

  return null
}

export default function PanoIframeSync() {
  return (
    <Suspense fallback={null}>
      <PanoIframeSyncInner />
    </Suspense>
  )
}
