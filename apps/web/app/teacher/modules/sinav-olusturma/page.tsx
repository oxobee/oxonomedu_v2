'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  FileCheck2,
} from 'lucide-react'

export default function ExamStudioModulePage() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [iframeKey, setIframeKey] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 850)
    return () => clearTimeout(t)
  }, [iframeKey])

  // Sync expanded / fullscreen mode with the iframe document
  useEffect(() => {
    const syncViewMode = () => {
      try {
        const iframeWin = iframeRef.current?.contentWindow
        const iframeDoc = iframeRef.current?.contentDocument

        if (iframeDoc) {
          iframeDoc.body.classList.toggle('oxonom-expanded-mode', isFullscreen)
          iframeDoc.documentElement.classList.toggle('oxonom-expanded-mode', isFullscreen)
        }

        if (iframeWin) {
          iframeWin.postMessage({ type: 'OXONOM_VIEW_MODE', isFullscreen }, '*')
        }
      } catch (_) {}
    }

    syncViewMode()
    const timer = setTimeout(syncViewMode, 300)
    return () => clearTimeout(timer)
  }, [isFullscreen])

  // Listen to escape key for fullscreen exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  const handleRefresh = () => {
    setIsLoading(true)
    setIframeKey((prev) => prev + 1)
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
    try {
      const iframeWin = iframeRef.current?.contentWindow
      const iframeDoc = iframeRef.current?.contentDocument
      if (iframeDoc) {
        iframeDoc.body.classList.toggle('oxonom-expanded-mode', isFullscreen)
        iframeDoc.documentElement.classList.toggle('oxonom-expanded-mode', isFullscreen)
      }
      if (iframeWin) {
        iframeWin.postMessage({ type: 'OXONOM_VIEW_MODE', isFullscreen }, '*')
      }
    } catch (_) {}
  }

  return (
    <div
      className={`font-jakarta flex flex-col transition-all duration-300 w-full ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#FCF9FD] dark:bg-[#17101C] p-1 sm:p-2.5 h-screen'
          : 'flex-1 min-h-0 h-[calc(100dvh-125px)] lg:h-[calc(100dvh-76px)] p-1.5 sm:p-3 lg:p-3.5 space-y-1.5 sm:space-y-2'
      }`}
    >
      {/* ── TOP ACTION BAR ── */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 bg-white dark:bg-[#211729] px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-[#E8DFEB] dark:border-[#49364F] shadow-xs shrink-0">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/teacher/modules"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F7F0FA] dark:bg-[#2D2035] hover:bg-[#F0D8FA] dark:hover:bg-[#49364F] text-[#4B075F] dark:text-[#C58ADB] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            title="Tüm Modüllere Dön"
          >
            <ArrowLeft size={16} />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-base font-extrabold text-[#241329] dark:text-white truncate">
                Sınav Oluşturma & Dizgi Masası
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Oxonom Edu Entegre
              </span>
            </div>
            <p className="text-[11px] text-[#716779] dark:text-[#B5A5BD] hidden md:block truncate">
              PDF ve görsellerden soru kırpma, otomatik A4 dizgisi ve test stüdyosu
            </p>
          </div>
        </div>

        {/* Right: Actions & Sweet Hint Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Sweet friendly hint badge */}
          {!isFullscreen && (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-linear-to-r from-[#D914C8]/10 via-[#8D49A6]/10 to-[#4B075F]/10 border border-[#D914C8]/30 text-[#4B075F] dark:text-[#FCE8FA] text-[11px] font-bold shadow-xs select-none">
              <Sparkles size={13} className="text-[#D914C8] animate-pulse" />
              <span>Daha rahat çalışabilmek için modülü genişletin</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleRefresh}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F7F0FA] dark:bg-[#2D2035] hover:bg-[#F0D8FA] dark:hover:bg-[#49364F] text-[#716779] dark:text-[#D2C5D8] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Modülü Yenile"
          >
            <RotateCcw size={15} />
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl bg-[#F7F0FA] dark:bg-[#2D2035] hover:bg-[#F0D8FA] dark:hover:bg-[#49364F] text-[#4B075F] dark:text-[#C58ADB] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-[#E8DFEB] dark:border-[#49364F] shrink-0"
            title={isFullscreen ? 'Pencereli Görünüme Dön (Esc)' : 'Geniş Çalışma Alanı'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 size={14} />
                <span className="hidden sm:inline">Pencereli Görünüm</span>
              </>
            ) : (
              <>
                <Maximize2 size={14} />
                <span className="hidden sm:inline">Genişletilmiş Ekran</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── EMBEDDED MODULE CONTAINER (Ekrana Tam Oturan Yükseklik) ── */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-[#E8DFEB] dark:border-[#49364F] shadow-sm bg-[#FCF9FD] dark:bg-[#180320] flex-1 min-h-0 h-full">
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#FCF9FD] dark:bg-[#180320]">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-[#4B075F] to-[#D914C8] flex items-center justify-center animate-bounce shadow-lg">
              <FileCheck2 size={24} className="text-white" />
            </div>
            <div className="mt-4 text-xs font-bold text-[#241329] dark:text-white">
              Sınav Stüdyosu Yükleniyor...
            </div>
            <div className="text-[11px] text-[#716779] dark:text-[#B5A5BD] mt-1">
              Dizgi masası ve soru kütüphanesi hazırlanıyor
            </div>
          </div>
        )}

        {/* Embedded Application Frame */}
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src="/modules/exam-studio/index.html"
          title="Oxonom Edu Sınav Oluşturma Modülü"
          onLoad={handleIframeLoad}
          className="absolute inset-0 w-full h-full border-0 select-none"
          allow="clipboard-read; clipboard-write; fullscreen"
        />
      </div>
    </div>
  )
}
