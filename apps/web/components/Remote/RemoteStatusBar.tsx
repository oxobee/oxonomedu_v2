'use client'

import React from 'react'
import {
  Maximize,
  Minimize,
  LogOut,
  Wifi,
  WifiOff,
  Tv,
} from 'lucide-react'
import { RemoteConnectionState } from '@/lib/remote/protocol'

interface RemoteStatusBarProps {
  status: RemoteConnectionState
  boardName?: string
  className?: string
  isFullscreen: boolean
  onToggleFullscreen: () => void
  onDisconnect: () => void
}

export default function RemoteStatusBar({
  status,
  boardName = 'Oxonom Akıllı Tahta',
  className = '',
  isFullscreen,
  onToggleFullscreen,
  onDisconnect,
}: RemoteStatusBarProps) {
  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Bağlı</span>
          </span>
        )
      case 'connecting':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Bağlanıyor...</span>
          </span>
        )
      case 'reconnecting':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
            <span>Yeniden Bağlanıyor</span>
          </span>
        )
      case 'ended':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Oturum Kapandı</span>
          </span>
        )
      case 'disconnected':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <WifiOff className="w-3 h-3" />
            <span>Bağlantı Yok</span>
          </span>
        )
    }
  }

  return (
    <header className="w-full px-4 py-3 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 text-white flex items-center justify-between gap-3 sticky top-0 z-40 select-none">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center text-white shadow-md shrink-0">
          <Tv className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xs sm:text-sm font-black truncate tracking-tight">{boardName}</h1>
            {getStatusBadge()}
          </div>
          {className && (
            <p className="text-[11px] font-bold text-slate-400 truncate">
              {className}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {/* Fullscreen Button */}
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-slate-700/60"
          title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekrana Geç'}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        {/* Disconnect Button */}
        <button
          type="button"
          onClick={onDisconnect}
          className="w-9 h-9 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 active:scale-95 text-rose-300 hover:text-rose-100 flex items-center justify-center transition-all cursor-pointer border border-rose-800/40"
          title="Bağlantıyı Kes"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
