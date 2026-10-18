'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw, LayoutDashboard } from 'lucide-react'

export default function StudentErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Student portal route error caught:', error)
  }, [error])

  return (
    <div className="w-full max-w-2xl mx-auto p-6 lg:p-12 my-8 font-jakarta">
      <div className="p-8 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200 dark:border-gray-800 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <AlertCircle size={32} />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            Sayfa Yüklenirken Bir Sorun Oluştu
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            İlgili modül verileri yüklenirken geçici bir senkronizasyon hatası meydana geldi. Sayfayı yeniden deneyebilir veya ana sayfaya dönebilirsiniz.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Tekrar Dene</span>
          </button>

          <Link
            href="/student/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <LayoutDashboard size={14} />
            <span>Öğrenci Ana Sayfası</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
