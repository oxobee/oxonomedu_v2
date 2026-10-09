'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Share2, Copy, Check, Timer, Play, Pause, RotateCcw, X, SkipForward, Globe, Lock, RefreshCw, Camera, Eye, Pencil } from 'lucide-react'
import type { HocuspocusProvider } from '@hocuspocus/provider'
import * as Y from 'yjs'
import PresenceAvatars from './PresenceAvatars'
import ToolTip from '@components/Objects/StyledElements/Tooltip/Tooltip'
import { updateBoardShareSettings, getBoardPublicInfo } from '@services/boards/boards'
import toast from 'react-hot-toast'
import useAdminStatus from '@components/Hooks/useAdminStatus'

interface BoardTopRightProps {
  provider: HocuspocusProvider
  ydoc: Y.Doc
  board?: any
  accessToken?: string
}

interface TimerState {
  endTime: number | null
  duration: number
  paused: boolean
  pausedRemaining: number
}

const TIMER_PRESETS = [
  { label: '1m', seconds: 60 },
  { label: '3m', seconds: 180 },
  { label: '5m', seconds: 300 },
  { label: '10m', seconds: 600 },
  { label: '15m', seconds: 900 },
  { label: '30m', seconds: 1800 },
]

const frostedStyle = {
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
}

// ─── 7-Segment LCD Display ──────────────────────────────────────────────────

// Segments: A=top, B=top-right, C=bottom-right, D=bottom, E=bottom-left, F=top-left, G=middle
const DIGIT_SEGMENTS: Record<string, number[]> = {
  '0': [1,1,1,1,1,1,0],
  '1': [0,1,1,0,0,0,0],
  '2': [1,1,0,1,1,0,1],
  '3': [1,1,1,1,0,0,1],
  '4': [0,1,1,0,0,1,1],
  '5': [1,0,1,1,0,1,1],
  '6': [1,0,1,1,1,1,1],
  '7': [1,1,1,0,0,0,0],
  '8': [1,1,1,1,1,1,1],
  '9': [1,1,1,1,0,1,1],
}

const SEG_PATHS = [
  // A: top horizontal
  'M 1.8,0.2 L 8.2,0.2 L 8.8,0.8 L 8.0,1.6 L 2.0,1.6 L 1.2,0.8 Z',
  // B: top-right vertical
  'M 8.8,1.2 L 9.4,1.8 L 9.4,8.0 L 8.8,8.6 L 8.0,7.8 L 8.0,2.0 Z',
  // C: bottom-right vertical
  'M 8.8,9.4 L 9.4,10.0 L 9.4,16.2 L 8.8,16.8 L 8.0,16.0 L 8.0,10.2 Z',
  // D: bottom horizontal
  'M 2.0,16.4 L 8.0,16.4 L 8.8,17.2 L 8.2,17.8 L 1.8,17.8 L 1.2,17.2 Z',
  // E: bottom-left vertical
  'M 1.2,9.4 L 2.0,10.2 L 2.0,16.0 L 1.2,16.8 L 0.6,16.2 L 0.6,10.0 Z',
  // F: top-left vertical
  'M 1.2,1.2 L 2.0,2.0 L 2.0,7.8 L 1.2,8.6 L 0.6,8.0 L 0.6,1.8 Z',
  // G: middle horizontal
  'M 2.0,8.4 L 8.0,8.4 L 8.8,9.0 L 8.0,9.6 L 2.0,9.6 L 1.2,9.0 Z',
]

const LCD_BG = '#1a3a2a'
const LCD_ON = '#7ec850'
const LCD_OFF = '#284a36'

function LcdDigit({ char, size, onColor = LCD_ON, offColor = LCD_OFF }: { char: string; size: number; onColor?: string; offColor?: string }) {
  const segs = DIGIT_SEGMENTS[char]
  if (!segs) return null
  return (
    <svg width={size} height={size * 1.8} viewBox="0 0 10 18" style={{ display: 'block' }}>
      {SEG_PATHS.map((d, i) => (
        <path key={i} d={d} fill={segs[i] ? onColor : offColor} />
      ))}
    </svg>
  )
}

function LcdColon({ size, color = LCD_ON }: { size: number; color?: string }) {
  return (
    <svg width={size * 0.3} height={size * 1.8} viewBox="0 0 3 18" style={{ display: 'block' }}>
      <circle cx="1.5" cy="5.5" r="0.9" fill={color} />
      <circle cx="1.5" cy="12.5" r="0.9" fill={color} />
    </svg>
  )
}

function LcdPanel({ time, size = 16, bg = LCD_BG, onColor = LCD_ON, offColor = LCD_OFF }: {
  time: string; size?: number; bg?: string; onColor?: string; offColor?: string
}) {
  return (
    <div
      className="flex items-center gap-[1px] rounded-lg px-2.5 py-1.5"
      style={{
        background: bg,
        boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {time.split('').map((ch, i) =>
        ch === ':' ? (
          <LcdColon key={i} size={size} color={onColor} />
        ) : (
          <LcdDigit key={i} char={ch} size={size} onColor={onColor} offColor={offColor} />
        )
      )}
    </div>
  )
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false
  if (navigator?.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (_) {}
  }
  try {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    const successful = document.execCommand('copy')
    textArea.remove()
    return successful
  } catch (err) {
    console.error('Fallback copy error:', err)
    return false
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function BoardTopRight({ provider, ydoc, board, accessToken }: BoardTopRightProps) {
  const { t } = useTranslation()
  const [showShare, setShowShare] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showTimerPicker, setShowTimerPicker] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [timerState, setTimerState] = useState<TimerState>({
    endTime: null,
    duration: 0,
    paused: false,
    pausedRemaining: 0,
  })
  const tickRef = useRef<ReturnType<typeof setInterval>>(null)
  const [timesUpPhase, setTimesUpPhase] = useState<'hidden' | 'dramatic' | 'bar'>('hidden')
  const prevExpiredRef = useRef(false)

  // Share state (Public vs 4-digit code)
  const [shareType, setShareType] = useState<'public' | 'code'>(
    board?.share_type || (board?.public === false ? 'code' : 'public')
  )
  const [sharePermission, setSharePermission] = useState<'edit' | 'view'>('edit')
  const [shareCode, setShareCode] = useState<string>(board?.share_code || '')
  const [shortCode, setShortCode] = useState<string>(board?.short_code || '')
  const { isStudent, canManageOrg, isTeacher, isAdmin } = useAdminStatus()
  const canManageBoard = !isStudent && (canManageOrg || isTeacher || isAdmin)

  const [savingShare, setSavingShare] = useState(false)
  const [snapshotting, setSnapshotting] = useState(false)

  const handleCaptureThumbnail = async () => {
    if (!board?.board_uuid || !accessToken) return
    setSnapshotting(true)
    try {
      const c = document.createElement('canvas')
      c.width = 640
      c.height = 360
      const ctx = c.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#14261b'
        ctx.fillRect(0, 0, 640, 360)
        ctx.strokeStyle = 'rgba(255,255,255,0.06)'
        ctx.lineWidth = 1
        for (let x = 0; x < 640; x += 24) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 360); ctx.stroke()
        }
        for (let y = 0; y < 360; y += 24) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(640, y); ctx.stroke()
        }
        ctx.fillStyle = '#fef08a'
        ctx.font = 'bold 26px sans-serif'
        ctx.fillText(board?.name || 'Akıllı Tahta', 36, 75)
        ctx.fillStyle = 'rgba(110, 231, 183, 0.85)'
        ctx.font = '14px monospace'
        ctx.fillText('CANLI AKILLI TAHTA • ' + new Date().toLocaleDateString('tr-TR'), 36, 110)

        ctx.strokeStyle = '#6ee7b7'
        ctx.lineWidth = 3.5
        ctx.beginPath()
        ctx.moveTo(36, 170); ctx.lineTo(150, 240); ctx.lineTo(260, 180); ctx.lineTo(380, 250); ctx.stroke()

        ctx.strokeStyle = '#38bdf8'
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.arc(480, 200, 45, 0, Math.PI * 2)
        ctx.stroke()
      }

      c.toBlob(async (blob) => {
        if (!blob) {
          toast.error('Görsel oluşturulamadı')
          setSnapshotting(false)
          return
        }
        const file = new File([blob], `board_${Date.now()}.png`, { type: 'image/png' })
        const { updateBoardThumbnail } = await import('@services/boards/boards')
        await updateBoardThumbnail(board.board_uuid, file, accessToken)
        toast.success('Pano kapağı tuvalden güncellendi! 📸')
        setSnapshotting(false)
      }, 'image/png')
    } catch {
      toast.error('Kapak güncellenirken hata oluştu')
      setSnapshotting(false)
    }
  }

  // Sync / fetch public info for short code if not present
  useEffect(() => {
    if (board?.board_uuid && (!shortCode || !shareType)) {
      getBoardPublicInfo(board.board_uuid)
        .then((info) => {
          if (info?.short_code) setShortCode(info.short_code)
          if (info?.share_type) setShareType(info.share_type)
          if (info?.share_code) setShareCode(info.share_code)
        })
        .catch(() => {})
    }
  }, [board?.board_uuid, shortCode, shareType])

  const handleShareTypeChange = async (newType: 'public' | 'code') => {
    setShareType(newType)
    let code = shareCode
    if (newType === 'code' && (!code || code.length < 4)) {
      code = Math.floor(1000 + Math.random() * 9000).toString()
      setShareCode(code)
    }
    if (board?.board_uuid && accessToken) {
      setSavingShare(true)
      try {
        const res = await updateBoardShareSettings(
          board.board_uuid,
          newType,
          newType === 'code' ? code : null,
          accessToken
        )
        if (res?.short_code) setShortCode(res.short_code)
        toast.success(newType === 'public' ? 'Pano herkese açık yapıldı' : 'Pano 4 haneli PIN ile korumaya alındı')
      } catch (err) {
        toast.error('Paylaşım ayarı kaydedilemedi')
      } finally {
        setSavingShare(false)
      }
    }
  }

  const handleRegenerateCode = async () => {
    const newCode = Math.floor(1000 + Math.random() * 9000).toString()
    setShareCode(newCode)
    if (board?.board_uuid && accessToken) {
      setSavingShare(true)
      try {
        const res = await updateBoardShareSettings(
          board.board_uuid,
          'code',
          newCode,
          accessToken
        )
        if (res?.short_code) setShortCode(res.short_code)
        toast.success(`Yeni PIN: ${newCode}`)
      } catch (err) {
        toast.error('PIN güncellenemedi')
      } finally {
        setSavingShare(false)
      }
    }
  }

  const getShareUrl = () => {
    if (typeof window === 'undefined') return ''
    const origin = window.location.origin
    const base = shortCode
      ? `${origin}/b/${shortCode}`
      : `${origin}/board/${board?.board_uuid?.replace('board_', '') || ''}`
    if (sharePermission === 'view') {
      return `${base}?permission=view`
    }
    return base
  }

  const handleCopyLink = async () => {
    const url = getShareUrl()
    const textToCopy = shareType === 'code' && shareCode
      ? `${url} (PIN: ${shareCode})`
      : url

    const success = await copyToClipboard(textToCopy)
    if (success) {
      setCopied(true)
      toast.success(shareType === 'code' ? `Link ve PIN (${shareCode}) kopyalandı!` : 'Kısa link panoya kopyalandı!')
      setTimeout(() => setCopied(false), 2500)
    } else {
      toast.error('Link kopyalanamadı')
    }
  }

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const timerMap = ydoc.getMap<any>('board-timer')
    const sync = () => {
      const endTime = timerMap.get('endTime') as number | null ?? null
      const duration = timerMap.get('duration') as number ?? 0
      const paused = timerMap.get('paused') as boolean ?? false
      const pausedRemaining = timerMap.get('pausedRemaining') as number ?? 0
      setTimerState({ endTime, duration, paused, pausedRemaining })
    }
    timerMap.observe(sync)
    sync()
    return () => timerMap.unobserve(sync)
  }, [ydoc])

  useEffect(() => {
    if (timerState.endTime && !timerState.paused) {
      tickRef.current = setInterval(() => setNow(Date.now()), 100)
      return () => { if (tickRef.current) clearInterval(tickRef.current) }
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [timerState.endTime, timerState.paused])

  const startTimer = useCallback((seconds: number) => {
    const timerMap = ydoc.getMap<any>('board-timer')
    timerMap.set('endTime', Date.now() + seconds * 1000)
    timerMap.set('duration', seconds)
    timerMap.set('paused', false)
    timerMap.set('pausedRemaining', 0)
    setShowTimerPicker(false)
  }, [ydoc])

  const pauseTimer = useCallback(() => {
    const timerMap = ydoc.getMap<any>('board-timer')
    const endTime = timerMap.get('endTime') as number | null
    if (!endTime) return
    const remaining = Math.max(0, endTime - Date.now())
    timerMap.set('paused', true)
    timerMap.set('pausedRemaining', remaining)
  }, [ydoc])

  const resumeTimer = useCallback(() => {
    const timerMap = ydoc.getMap<any>('board-timer')
    const remaining = timerMap.get('pausedRemaining') as number ?? 0
    if (remaining <= 0) return
    timerMap.set('endTime', Date.now() + remaining)
    timerMap.set('paused', false)
    timerMap.set('pausedRemaining', 0)
  }, [ydoc])

  const restartTimer = useCallback(() => {
    const timerMap = ydoc.getMap<any>('board-timer')
    const duration = timerMap.get('duration') as number ?? 0
    if (duration <= 0) return
    prevExpiredRef.current = false
    setTimesUpPhase('hidden')
    timerMap.set('endTime', Date.now() + duration * 1000)
    timerMap.set('paused', false)
    timerMap.set('pausedRemaining', 0)
  }, [ydoc])

  const clearTimer = useCallback(() => {
    const timerMap = ydoc.getMap<any>('board-timer')
    timerMap.set('endTime', null)
    timerMap.set('duration', 0)
    timerMap.set('paused', false)
    timerMap.set('pausedRemaining', 0)
  }, [ydoc])

  const formatTime = (date: Date) => {
    const h = date.getHours().toString().padStart(2, '0')
    const m = date.getMinutes().toString().padStart(2, '0')
    const s = date.getSeconds().toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  const getTimerRemaining = (): { mm: string; ss: string; totalMs: number } => {
    let remaining = 0
    if (timerState.paused) {
      remaining = timerState.pausedRemaining
    } else if (timerState.endTime) {
      remaining = Math.max(0, timerState.endTime - now)
    }
    const mins = Math.floor(remaining / 60000)
    const secs = Math.floor((remaining % 60000) / 1000)
    return {
      mm: mins.toString().padStart(2, '0'),
      ss: secs.toString().padStart(2, '0'),
      totalMs: remaining,
    }
  }

  const isTimerActive = timerState.endTime !== null
  const isTimerExpired = isTimerActive && !timerState.paused && timerState.endTime! <= now
  const timer = getTimerRemaining()
  const timerDisplay = `${timer.mm}:${timer.ss}`
  const currentTime = formatTime(new Date(now))

  // Track "Time's up" banner — phases: 'hidden' → 'dramatic' (50% screen) → 'bar' (small top bar, stays)
  useEffect(() => {
    if (isTimerExpired && !prevExpiredRef.current) {
      prevExpiredRef.current = true
      setTimesUpPhase('dramatic')
      const shrinkTimer = setTimeout(() => {
        setTimesUpPhase('bar')
      }, 3000)
      return () => clearTimeout(shrinkTimer)
    }
    if (!isTimerExpired && !isTimerActive) {
      prevExpiredRef.current = false
      setTimesUpPhase('hidden')
    }
  }, [isTimerExpired, isTimerActive])

  const dismissTimesUp = useCallback(() => {
    setTimesUpPhase('hidden')
    clearTimer()
  }, [clearTimer])

  return (
    <>
      {/* Top right bar */}
      <div className="absolute top-4 end-4 z-20 flex items-center gap-2 pointer-events-none board-topright">
        {/* Main bar: avatars + clock + timer btn + share */}
        <div
          className="flex items-center gap-2 rounded-xl px-2 py-1.5 nice-shadow pointer-events-auto"
          style={frostedStyle}
        >
          <PresenceAvatars provider={provider} />
          {/* Hide digital clock on mobile screens to save space and avoid collisions */}
          <div className="hidden sm:block">
            <LcdPanel time={currentTime} size={13} />
          </div>

          {/* Timer button */}
          <div className="relative">
            <ToolTip content={t('boards.timer.set_timer')}>
              <div
                onClick={() => setShowTimerPicker(!showTimerPicker)}
                className={`editor-tool-btn ${showTimerPicker ? 'is-active' : ''}`}
              >
                <Timer size={15} />
              </div>
            </ToolTip>

            {showTimerPicker && (
              <div
                className="absolute top-full end-0 mt-2 rounded-xl p-3 nice-shadow animate-fade-in"
                style={{
                  ...frostedStyle,
                  background: 'rgba(255, 255, 255, 0.98)',
                  minWidth: 180,
                }}
              >
                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-2 px-1">{t('boards.timer.set_timer_title')}</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {TIMER_PRESETS.map((preset) => (
                    <button
                      key={preset.seconds}
                      onClick={() => startTimer(preset.seconds)}
                      className="px-2 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
                    >
                      {preset.label.replace('m', ` ${t('boards.timer.minute_short')}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Snapshot cover button */}
          {canManageBoard && (
            <ToolTip content="Pano Kapağını Tuvalden Güncelle">
              <button
                onClick={handleCaptureThumbnail}
                disabled={snapshotting}
                className="editor-tool-btn hover:text-indigo-600 cursor-pointer disabled:opacity-50"
                title="Kapağı Tuvalden Güncelle"
              >
                <Camera size={15} className={snapshotting ? 'animate-pulse text-indigo-600' : ''} />
              </button>
            </ToolTip>
          )}

          {/* Share button */}
          <div className="relative">
            <ToolTip content={t('boards.share.share_board')}>
              <div
                onClick={() => setShowShare(!showShare)}
                className="editor-tool-btn"
              >
                <Share2 size={15} />
              </div>
            </ToolTip>

            {showShare && (
              <div
                className="absolute top-full end-0 mt-2 w-80 rounded-2xl p-4 nice-shadow animate-fade-in border border-neutral-200/80"
                style={{
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Share2 size={13} className="text-neutral-500" />
                    {t('boards.share.share_this_board', 'Panoyu Paylaş')}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-medium">Giriş / Kayıt Gerekmez</span>
                </div>

                {/* Mode Selector Tabs (Teachers/Admins only) */}
                {canManageBoard ? (
                  <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-100 rounded-xl mb-3.5">
                    <button
                      type="button"
                      onClick={() => handleShareTypeChange('public')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                        shareType === 'public'
                          ? 'bg-white text-neutral-900 shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      <Globe size={13} />
                      <span>Herkese Açık</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShareTypeChange('code')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                        shareType === 'code'
                          ? 'bg-white text-neutral-900 shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      <Lock size={13} />
                      <span>4 Haneli PIN</span>
                    </button>
                  </div>
                ) : (
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700">
                      {shareType === 'code' ? <Lock size={12} /> : <Globe size={12} />}
                      <span>{shareType === 'code' ? 'PIN Korumalı Pano' : 'Herkese Açık Pano'}</span>
                    </span>
                  </div>
                )}

                {/* Mode Details */}
                {shareType === 'code' ? (
                  <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3 mb-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-amber-900">Katılım PIN Kodu:</span>
                      {canManageBoard && (
                        <button
                          type="button"
                          onClick={handleRegenerateCode}
                          disabled={savingShare}
                          className="flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-900 font-medium transition-colors cursor-pointer"
                          title="Yeni PIN Üret"
                        >
                          <RefreshCw size={11} className={savingShare ? 'animate-spin' : ''} />
                          <span>Yeni Kod</span>
                        </button>
                      )}
                    </div>
                    <div className="flex justify-center items-center py-1">
                      <span className="font-mono text-2xl font-black tracking-[0.3em] text-amber-950 bg-white/80 px-4 py-1.5 rounded-lg border border-amber-300/80 shadow-xs">
                        {shareCode || '----'}
                      </span>
                    </div>
                    <p className="text-[10px] text-amber-800/80 text-center leading-tight">
                      Öğrencileriniz linki açtığında bu 4 haneli PIN kodunu girerek kayıt olmadan doğrudan tahtaya katılır.
                    </p>
                  </div>
                ) : (
                  <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-2.5 mb-3.5 text-center">
                    <p className="text-[11px] text-emerald-800 leading-tight font-medium">
                      🌐 Bağlantıya sahip olan herkes şifresiz ve anında tahtayı görüntüleyip katılabilir.
                    </p>
                  </div>
                )}

                {/* Permission Selector (Edit vs View) */}
                <div className="mb-3.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Katılımcı Yetkisi
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setSharePermission('edit')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        sharePermission === 'edit'
                          ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-500/20'
                          : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      <Pencil size={12} />
                      <span>İşlem Yapılabilir</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSharePermission('view')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        sharePermission === 'view'
                          ? 'bg-white text-amber-600 shadow-sm ring-1 ring-amber-500/20'
                          : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      <Eye size={12} />
                      <span>Sadece Görüntüle</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1 px-1">
                    {sharePermission === 'edit'
                      ? '✓ Katılımcılar çizim yapabilir, kart ve not ekleyebilir (Varsayılan).'
                      : '🔒 Katılımcılar tahtayı sadece izleyebilir, çizim yapamaz.'}
                  </p>
                </div>

                {/* Ultra-Short Link + Copy */}
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                    Kısa Paylaşım Bağlantısı
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={getShareUrl()}
                      className="flex-1 text-xs bg-neutral-100 rounded-xl px-3 py-2 text-neutral-700 font-mono outline-none truncate border border-neutral-200/60"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shrink-0 text-xs font-medium cursor-pointer shadow-sm"
                    >
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timer banner — slides down from top center when active */}
      <style jsx>{`
        @keyframes timer-slide-down {
          from { transform: translateX(-50%) translateY(-100%); }
          to { transform: translateX(-50%) translateY(0); }
        }
        @keyframes timesup-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes timesup-expand {
          from { height: 0; opacity: 0; }
          to { height: 50vh; opacity: 1; }
        }
        @keyframes timesup-shrink-to-bar {
          from { transform: translateX(-50%) translateY(-40px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Active timer banner */}
      {isTimerActive && !isTimerExpired && (
        <div
          className="absolute top-0 left-1/2 z-30 pointer-events-auto"
          style={{
            animation: 'timer-slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          <div
            className="flex items-center gap-3 rounded-b-2xl px-5 py-2.5 nice-shadow"
            style={{
              background: '#2a0808',
              borderTop: 'none',
              boxShadow: `0 4px 20px rgba(0,0,0,0.3), inset 0 -1px 0 rgba(255,255,255,0.05)`,
            }}
          >
            <LcdPanel
              time={timerDisplay}
              size={18}
              bg="#2a0808"
              onColor="#ef4444"
              offColor="#3d1818"
            />

            {timerState.paused ? (
              <button
                onClick={resumeTimer}
                className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors bg-red-500/15"
                title={t('boards.timer.resume')}
              >
                <Play size={13} className="text-red-400" />
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors bg-red-500/15"
                title={t('boards.timer.pause')}
              >
                <Pause size={13} className="text-red-400" />
              </button>
            )}

            <button
              onClick={restartTimer}
              className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors bg-red-500/15"
              title={t('boards.timer.restart')}
            >
              <RotateCcw size={13} className="text-red-400" />
            </button>

            <button
              onClick={clearTimer}
              className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors bg-red-500/15"
              title={t('boards.timer.close')}
            >
              <X size={13} className="text-red-400" />
            </button>
          </div>
        </div>
      )}

      {/* Time's up — dramatic phase: takes 50% of screen */}
      {timesUpPhase === 'dramatic' && (
        <div
          className="absolute inset-x-0 top-0 z-40 pointer-events-auto flex items-center justify-center"
          style={{
            height: '50vh',
            background: 'linear-gradient(180deg, #1a0505 0%, #1a0505 70%, transparent 100%)',
            animation: 'timesup-expand 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <LcdPanel
              time="00:00"
              size={48}
              bg="transparent"
              onColor="#ff4444"
              offColor="#3d1515"
            />
            <span
              className="text-2xl font-black tracking-widest uppercase"
              style={{ color: '#ff4444', animation: 'timesup-pulse 0.6s ease-in-out infinite' }}
            >
              {t('boards.timer.times_up')}
            </span>
          </div>
        </div>
      )}

      {/* Time's up — bar phase: small banner at top, stays permanently */}
      {timesUpPhase === 'bar' && (
        <div
          className="absolute top-0 left-1/2 z-30 pointer-events-auto"
          style={{
            animation: 'timesup-shrink-to-bar 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          <div
            className="flex items-center gap-3 rounded-b-2xl px-5 py-2.5 nice-shadow"
            style={{
              background: '#1a0505',
              boxShadow: '0 4px 24px rgba(239,68,68,0.3), inset 0 -1px 0 rgba(239,68,68,0.2)',
            }}
          >
            <LcdPanel
              time="00:00"
              size={16}
              bg="#1a0505"
              onColor="#ff4444"
              offColor="#3d1515"
            />
            <span
              className="text-red-400 text-xs font-bold tracking-wide uppercase"
              style={{ animation: 'timesup-pulse 1s ease-in-out infinite' }}
            >
              {t('boards.timer.times_up')}
            </span>

            <button
              onClick={restartTimer}
              className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
              style={{ background: 'rgba(239,68,68,0.15)' }}
              title={t('boards.timer.restart')}
            >
              <RotateCcw size={13} className="text-red-400" />
            </button>

            <button
              onClick={dismissTimesUp}
              className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
              style={{ background: 'rgba(239,68,68,0.15)' }}
              title={t('boards.timer.close')}
            >
              <X size={13} className="text-red-400" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
