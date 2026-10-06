'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import ToolTip from '@components/Objects/StyledElements/Tooltip/Tooltip'
import { getUriWithOrg } from '@services/config/config'

interface BoardTopBarProps {
  boardName: string
  orgslug: string
  board?: any
  accessToken?: string
}

export default function BoardTopBar({
  boardName,
  orgslug,
  board,
  accessToken,
}: BoardTopBarProps) {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const [isInIframe, setIsInIframe] = useState(false)

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.self !== window.top) {
        setIsInIframe(true)
      }
    } catch (_) {
      setIsInIframe(true)
    }
  }, [])

  const isPanoWindow =
    searchParams?.get('chrome') === 'none' ||
    searchParams?.get('isPano') === '1' ||
    isInIframe

  // If opened inside Pano window, hide the top bar pill as requested
  if (isPanoWindow) {
    return null
  }

  return (
    <>
      <div className="absolute top-4 start-4 z-20 pointer-events-none board-backbar">
        {/* Left group: back + logo + title + settings */}
        <div
          className="flex items-center gap-2 rounded-xl px-2.5 py-2 nice-shadow pointer-events-auto"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <ToolTip content={t('boards.back_to_boards')}>
            <Link href={getUriWithOrg(orgslug, '/boards')}>
              <div className="editor-tool-btn">
                <ArrowLeft size={15} />
              </div>
            </Link>
          </ToolTip>

          <Link href={getUriWithOrg(orgslug, '/boards')}>
            <div className="bg-black rounded-md w-[25px] h-[25px] flex items-center justify-center hover:opacity-80 transition-opacity">
              <Image
                src="/lrn.svg"
                alt="LearnHouse"
                width={14}
                height={14}
                className="invert"
              />
            </div>
          </Link>

          <span className="text-sm font-bold text-neutral-800 truncate max-w-[220px] sm:max-w-[340px] md:max-w-[460px]">
            {boardName}
          </span>

          {(board?.is_demo || board?.board_uuid?.startsWith('board_')) && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              MEB Demo
            </span>
          )}

        </div>
      </div>
    </>
  )
}
