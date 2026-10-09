'use client'

import React, { useEffect, useState } from 'react'
import { Download, Share2, PlusSquare, X, Smartphone, CheckCircle2 } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export default function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [installedSuccess, setInstalledSuccess] = useState(false)

  useEffect(() => {
    // 1. Service Worker Registration
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registered with scope:', registration.scope)
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err)
          })
      })
    }

    // 2. Check if already running in standalone mode (installed PWA)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://')
      setIsStandalone(Boolean(isStandaloneMode))
      return Boolean(isStandaloneMode)
    }

    const alreadyStandalone = checkStandalone()
    if (alreadyStandalone) {
      return
    }

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream
    setIsIOS(isIOSDevice)

    // Check if dismissed recently (24 hours)
    const dismissedTime = localStorage.getItem('oxonom_pwa_prompt_dismissed')
    const isRecentlyDismissed = dismissedTime && Date.now() - Number(dismissedTime) < 24 * 60 * 60 * 1000

    // 4. Android / Chromium install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      if (!isRecentlyDismissed) {
        setShowPrompt(true)
      }
    }

    // App installed event
    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setShowPrompt(false)
      setInstalledSuccess(true)
      setTimeout(() => setInstalledSuccess(false), 4000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Show iOS install hint after a slight delay if mobile and not dismissed
    if (isIOSDevice && !isRecentlyDismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 3500)
      return () => {
        clearTimeout(timer)
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.removeEventListener('appinstalled', handleAppInstalled)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true)
      return
    }

    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') {
        setShowPrompt(false)
      }
      setDeferredPrompt(null)
    } catch (err) {
      console.error('[PWA] Error calling install prompt:', err)
    }
  }

  const dismissPrompt = () => {
    setShowPrompt(false)
    setShowIOSGuide(false)
    localStorage.setItem('oxonom_pwa_prompt_dismissed', Date.now().toString())
  }

  // If already standalone or nothing to show
  if (isStandalone) return null

  return (
    <>
      {/* Success Toast */}
      {installedSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-emerald-600/95 backdrop-blur-md text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-400/40 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>Oxonom EDU başarıyla cihazınıza yüklendi!</span>
        </div>
      )}

      {/* Modern App Install Banner */}
      {showPrompt && !installedSuccess && (
        <div
          className="fixed left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-[9990] bg-[#101422]/95 border border-indigo-500/30 backdrop-blur-xl rounded-2xl p-4 shadow-2xl shadow-indigo-950/40 text-slate-100 animate-fade-in"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
        >
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0 border border-indigo-400/30 overflow-hidden p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/pwa-icon.svg"
                alt="Oxonom EDU"
                className="w-full h-full object-contain drop-shadow-sm"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none'
                }}
              />
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-white">Oxonom EDU</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-1.5 py-0.2 rounded-full font-medium">
                  Uygulama
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Ana ekrana ekleyerek bildirimler, tam ekran deneyimi ve çevrimdışı hızla kullanın.
              </p>
            </div>
            <button
              onClick={dismissPrompt}
              className="text-slate-400 hover:text-slate-200 p-1 -mr-1 -mt-1 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3.5 flex items-center gap-2">
            <button
              onClick={dismissPrompt}
              className="flex-1 py-2 px-3 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-colors border border-slate-700/50"
            >
              Daha Sonra
            </button>
            <button
              onClick={handleInstallClick}
              className="flex-[1.5] py-2 px-3 text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 active:scale-95 border border-indigo-400/40"
            >
              {isIOS ? (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Nasıl Yüklenir?</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Uygulamayı Yükle</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari Step-by-Step Installation Modal Sheet */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-3">
          <div className="w-full max-w-sm bg-[#121626] border border-slate-700/60 rounded-3xl p-5 shadow-2xl text-white animate-fade-in relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">iPhone / iPad&apos;e Yükle</h3>
                <p className="text-[11px] text-slate-400">Safari üzerinden ana ekrana ekleyin</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div>
                  <span className="font-semibold text-slate-200">Paylaş butonuna dokunun:</span>
                  <p className="text-slate-400 text-[11px] mt-0.5 flex items-center gap-1">
                    Safari alt çubuğundaki <Share2 className="w-3.5 h-3.5 text-indigo-400 inline" /> simgesine tıklayın.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div>
                  <span className="font-semibold text-slate-200">&apos;Ana Ekrana Ekle&apos;yi seçin:</span>
                  <p className="text-slate-400 text-[11px] mt-0.5 flex items-center gap-1">
                    Menüyü aşağı kaydırıp <PlusSquare className="w-3.5 h-3.5 text-indigo-400 inline" /> &apos;Ana Ekrana Ekle&apos; seçeneğine dokunun.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div>
                  <span className="font-semibold text-slate-200">Ekle butonuna dokunun:</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Sağ üst köşedeki <strong className="text-indigo-300">Ekle</strong> tuşuna basarak kurulumu tamamlayın.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs transition-colors shadow-lg shadow-indigo-600/30"
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </>
  )
}
