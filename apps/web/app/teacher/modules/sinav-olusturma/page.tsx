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
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react'

export default function ExamStudioModulePage() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [iframeKey, setIframeKey] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 900)
    return () => clearTimeout(t)
  }, [iframeKey])

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

  return (
    <div
      className={`font-jakarta flex flex-col transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#FCF9FD] dark:bg-[#17101C] p-2 sm:p-4'
          : 'p-3 sm:p-5 lg:p-6 space-y-3'
      }`}
    >
      {/* ── TOP ACTION BAR ── */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#211729] px-4 py-3 rounded-2xl border border-[#E8DFEB] dark:border-[#49364F] shadow-xs shrink-0">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/teacher/modules"
            className="w-9 h-9 rounded-xl bg-[#F7F0FA] dark:bg-[#2D2035] hover:bg-[#F0D8FA] dark:hover:bg-[#49364F] text-[#4B075F] dark:text-[#C58ADB] flex items-center justify-center transition-colors shrink-0"
            title="Tüm Modüllere Dön"
          >
            <ArrowLeft size={16} />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-[#241329] dark:text-white truncate">
                Sınav Oluşturma & Dizgi Masası
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Oxonom Edu Entegre
              </span>
            </div>
            <p className="text-[11px] text-[#716779] dark:text-[#B5A5BD] hidden sm:block truncate">
              PDF ve görsellerden soru kırpma, otomatik A4 dizgisi ve test stüdyosu
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            className="w-9 h-9 rounded-xl bg-[#F7F0FA] dark:bg-[#2D2035] hover:bg-[#F0D8FA] dark:hover:bg-[#49364F] text-[#716779] dark:text-[#D2C5D8] flex items-center justify-center transition-colors cursor-pointer"
            title="Modülü Yenile"
          >
            <RotateCcw size={15} />
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-9 px-3 rounded-xl bg-[#F7F0FA] dark:bg-[#2D2035] hover:bg-[#F0D8FA] dark:hover:bg-[#49364F] text-[#4B075F] dark:text-[#C58ADB] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-[#E8DFEB] dark:border-[#49364F]"
            title={isFullscreen ? 'Tam Ekrandan Çık (Esc)' : 'Geniş Çalışma Alanı'}
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

      {/* ── EMBEDDED MODULE CONTAINER ── */}
      <div
        className={`relative w-full rounded-2xl overflow-hidden border border-[#E8DFEB] dark:border-[#49364F] shadow-sm bg-[#FCF9FD] dark:bg-[#180320] flex-1 ${
          isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[calc(100vh-145px)] min-h-[640px]'
        }`}
      >
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
          onLoad={() => setIsLoading(false)}
          className="w-full h-full border-0 select-none"
          allow="clipboard-read; clipboard-write; fullscreen"
        />
      </div>
    </div>
  )
}
