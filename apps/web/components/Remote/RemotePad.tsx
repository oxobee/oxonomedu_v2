'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Home,
  ArrowLeft,
  Lock,
  Unlock,
  Maximize2,
  RotateCw,
} from 'lucide-react'
import { RemoteActionType } from '@/lib/remote/protocol'

interface RemotePadProps {
  isLocked: boolean
  onAction: (action: RemoteActionType, payload?: any) => void
  disabled?: boolean
}

export default function RemotePad({ isLocked, onAction, disabled = false }: RemotePadProps) {
  const handleTap = (action: RemoteActionType, payload?: any) => {
    if (disabled) return
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(35) } catch (_) {}
    }
    onAction(action, payload)
  }

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-md rounded-3xl p-4 border border-slate-800 shadow-xl space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
          Temel Kontroller
        </span>
        <span className="text-[10px] font-bold text-slate-500">
          Hızlı Dokunmatik Panel
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        {/* 1. ANA EKRAN */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => handleTap('HOME')}
          disabled={disabled}
          className="col-span-2 py-4 px-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 active:from-blue-700 active:to-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/40 border border-indigo-400/20 cursor-pointer disabled:opacity-40"
        >
          <Home className="w-5 h-5 shrink-0 stroke-[2.5]" />
          <span>Ana Ekran</span>
        </motion.button>

        {/* 2. GERİ / KAPAT */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => handleTap('BACK')}
          disabled={disabled}
          className="col-span-2 py-4 px-3 rounded-2xl bg-slate-800 hover:bg-slate-750 active:bg-slate-700 text-slate-100 font-black text-sm flex items-center justify-center gap-2 shadow-md border border-slate-700/80 cursor-pointer disabled:opacity-40"
        >
          <ArrowLeft className="w-5 h-5 shrink-0 stroke-[2.5]" />
          <span>Geri / Kapat</span>
        </motion.button>

        {/* 3. TAHTA TAM EKRAN */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => handleTap('FULLSCREEN')}
          disabled={disabled}
          className="col-span-2 py-3 px-3 rounded-2xl bg-slate-800/80 hover:bg-slate-750 active:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700/60 cursor-pointer disabled:opacity-40"
        >
          <Maximize2 className="w-4 h-4 shrink-0" />
          <span>Tahta Tam Ekran</span>
        </motion.button>

        {/* 4. KİLİTLE / AÇ */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => handleTap(isLocked ? 'UNLOCK' : 'LOCK')}
          disabled={disabled}
          className={`col-span-1 py-3 px-2 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border disabled:opacity-40 ${
            isLocked
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
              : 'bg-slate-800/80 text-slate-300 border-slate-700/60'
          }`}
          title={isLocked ? 'Tahta Kilidini Aç' : 'Tahtayı Kilitle'}
        >
          {isLocked ? <Unlock className="w-4 h-4 text-amber-400" /> : <Lock className="w-4 h-4 text-slate-400" />}
          <span>{isLocked ? 'Aç' : 'Kilitle'}</span>
        </motion.button>

        {/* 5. YENİLE */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => handleTap('RELOAD_WINDOW')}
          disabled={disabled}
          className="col-span-1 py-3 px-2 rounded-2xl bg-slate-800/80 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700/60 cursor-pointer disabled:opacity-40"
          title="Açık Pencereyi Yenile"
        >
          <RotateCw className="w-4 h-4 text-slate-400" />
          <span>Yenile</span>
        </motion.button>
      </div>
    </div>
  )
}
