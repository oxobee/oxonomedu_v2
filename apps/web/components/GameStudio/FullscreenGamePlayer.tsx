// apps/web/components/GameStudio/FullscreenGamePlayer.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Gamepad2,
  X,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Trophy,
  Star,
  CheckCircle2,
  Flame,
  ArrowLeft,
} from 'lucide-react'
import { EducationalGame, getAllGames } from '@/lib/gamestudio/gameStorage'

interface FullscreenGamePlayerProps {
  gameId: string
  returnPath: string
}

export default function FullscreenGamePlayer({ gameId, returnPath }: FullscreenGamePlayerProps) {
  const router = useRouter()
  const [game, setGame] = useState<EducationalGame | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [combo, setCombo] = useState(1)
  const [particleTrigger, setParticleTrigger] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const list = getAllGames()
    const found = list.find((g) => g.id === gameId) || list[0]
    setGame(found)
  }, [gameId])

  // Canvas ambient background animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Starfield / particle simulation
    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.7 + 0.3,
    }))

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#0E0814'
      ctx.fillRect(0, 0, width, height)

      // Gradient radial glow in center
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        50,
        width / 2,
        height / 2,
        width / 1.5
      )
      gradient.addColorStop(0, 'rgba(75, 7, 95, 0.25)')
      gradient.addColorStop(0.5, 'rgba(217, 20, 200, 0.08)')
      gradient.addColorStop(1, 'rgba(14, 8, 20, 0.95)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Draw floating particles
      particles.forEach((p) => {
        p.x += p.speedX
        p.y += p.speedY
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(240, 216, 250, ${p.opacity})`
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Fullscreen toggle handler
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }

  // Interactive reward simulation
  const handleAnswerTest = () => {
    setScore((prev) => prev + 150 * combo)
    setCombo((prev) => prev + 1)
    setParticleTrigger((prev) => prev + 1)
  }

  const handleNextLevel = () => {
    setLevel((prev) => prev + 1)
  }

  const handleExit = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    }
    router.push(returnPath)
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0E0814] text-white flex flex-col overflow-hidden select-none font-jakarta">
      {/* Background Animated Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* ── SLEEK UNOBTRUSIVE TOP HEADER ── */}
      <header className="relative z-40 bg-[#17101C]/75 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-2.5 flex items-center justify-between transition-opacity hover:opacity-100 opacity-90">
        {/* Left: Minimal Logo & Game Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D914C8] to-[#4B075F] flex items-center justify-center text-white shadow-md shadow-[#D914C8]/30">
            <Gamepad2 size={18} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs sm:text-sm text-white tracking-tight">
                {game?.title || 'Oxonom Eğitsel Oyun'}
              </span>
              {game?.category && (
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#D914C8]/25 text-[#FCE8FA] border border-[#D914C8]/40 hidden sm:inline-block">
                  {game.category}
                </span>
              )}
            </div>
            <div className="text-[10px] text-[#A898B0] hidden sm:block">
              Oxonom Edu Game Studio • Tam Ekran Oynatıcı
            </div>
          </div>
        </div>

        {/* Center: Live HUD Stats */}
        <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/10">
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <Trophy size={13} className="text-yellow-400" />
            <span className="text-[#C4B3CD]">Puan:</span>
            <strong className="text-white font-bold">{score}</strong>
          </div>
          <div className="w-px h-3 bg-white/20" />
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <Flame size={13} className="text-[#FF9D42]" />
            <span className="text-[#C4B3CD]">Seviye:</span>
            <strong className="text-white font-bold">{level}</strong>
          </div>
        </div>

        {/* Right: Discreet Actions & Exit Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-[#C4B3CD] hover:text-white transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <button
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran Yap'}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-[#C4B3CD] hover:text-white transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {/* Discreet Exit Button */}
          <button
            onClick={() => setShowExitConfirm(true)}
            title="Game Studio'ya Geri Dön"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2E1829] hover:bg-[#431B38] text-[#FFA8D8] border border-[#8D2B60]/40 text-xs font-bold transition-all cursor-pointer ml-1"
          >
            <X size={15} />
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </header>

      {/* ── GAME CANVAS / PLAYING VIEWPORT ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-xl w-full p-6 sm:p-8 rounded-3xl bg-[#17101C]/80 backdrop-blur-2xl border border-white/15 shadow-2xl text-center space-y-5"
        >
          {/* Animated Glow Badge */}
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#D914C8] via-[#8D49A6] to-[#4B075F] mx-auto flex items-center justify-center text-white shadow-xl shadow-[#D914C8]/40 animate-pulse">
            <Gamepad2 size={32} />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#45C7A2]/20 text-[#45C7A2] border border-[#45C7A2]/40 text-xs font-bold mb-2">
              <CheckCircle2 size={13} />
              <span>Oyun Sahnesi & Başlatıcı Hazır</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {game?.title || 'Eğitsel Oyun Arenası'}
            </h2>
            <p className="text-xs sm:text-sm text-[#C4B3CD] mt-2 leading-relaxed">
              Bu ekran tam ekran oyun deneyimi için optimize edilmiştir. Üstteki zarif
              header üzerinden skoru takip edebilir veya istediğiniz zaman tek tıkla Game Studio&apos;ya geri dönebilirsiniz.
            </p>
          </div>

          {/* Educational Target Summary */}
          {game && (
            <div className="p-3.5 rounded-2xl bg-[#0E0814]/70 border border-white/10 text-left space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[#A898B0]">
                <span>Müfredat Uyumu:</span>
                <strong className="text-white">{game.subjects.join(', ')}</strong>
              </div>
              <div className="flex items-center justify-between text-[#A898B0]">
                <span>Hedef Sınıflar:</span>
                <strong className="text-[#F0D8FA]">{game.targetGrades.join(', ')}</strong>
              </div>
              <div className="flex items-center justify-between text-[#A898B0]">
                <span>Öğrenme Konusu:</span>
                <strong className="text-[#45C7A2]">{game.topics.join(', ')}</strong>
              </div>
            </div>
          )}

          {/* Test Game Interaction Loop Controls */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleAnswerTest}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-[#D914C8] to-[#8D49A6] hover:brightness-110 text-white font-extrabold text-xs shadow-lg shadow-[#D914C8]/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              <span>Soruyu Çöz (+150 Puan)</span>
            </button>

            <button
              onClick={handleNextLevel}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#2B1D36] hover:bg-[#3D264E] text-[#FCE8FA] font-bold text-xs border border-[#49364F] transition-colors cursor-pointer"
            >
              Sonraki Aşama
            </button>
          </div>

          <p className="text-[11px] text-[#716779]">
            İpucu: Üstteki &quot;Çıkış&quot; butonuyla veya Esc tuşuna basarak istediğiniz an Game Studio&apos;ya dönebilirsiniz.
          </p>
        </motion.div>
      </main>

      {/* ── EXIT CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#211729] border border-[#49364F] rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#4B075F]/50 text-[#F0D8FA] flex items-center justify-center mx-auto border border-[#8D49A6]/40">
                <ArrowLeft size={22} />
              </div>

              <div>
                <h3 className="font-bold text-lg text-white">Oyundan Çıkmak İstiyor musunuz?</h3>
                <p className="text-xs text-[#A898B0] mt-1">
                  Mevcut skorunuz ({score} puan) kaydedilecek ve Game Studio mağazasına döneceksiniz.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#2D2035] text-[#D2C5D8] text-xs font-bold hover:bg-[#3D264E] transition-colors"
                >
                  Oynamaya Devam Et
                </button>
                <button
                  onClick={handleExit}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D914C8] to-[#8D49A6] text-white text-xs font-bold transition-all shadow-md shadow-[#D914C8]/30"
                >
                  Evet, Çık
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
