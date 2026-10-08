'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import GamesStoreClient from '@components/Games/GamesStoreClient'
import { OrgMenu } from '@components/Objects/Menus/OrgMenu'
import { GlobalEduFooter } from '@components/Footers/GlobalEduFooter'
import { useOrg } from '@components/Contexts/OrgContext'

export default function GamesPageClient() {
  const org = useOrg() as any
  const orgslug = org?.slug || 'neclagorer'
  const searchParams = useSearchParams()

  const [isIframe, setIsIframe] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsIframe(window.self !== window.top)
    }
  }, [])

  const isChromeless =
    isIframe ||
    searchParams?.get('chrome') === 'none' ||
    searchParams?.get('pano') === '1'

  return (
    <div className={`flex flex-col min-h-screen ${isChromeless ? 'bg-slate-950 p-2 sm:p-4' : 'bg-[#f8f8f8]'}`}>
      {!isChromeless && <OrgMenu orgslug={orgslug} />}
      <div className="flex-1">
        <GamesStoreClient />
      </div>
      {!isChromeless && <GlobalEduFooter />}
    </div>
  )
}
