// apps/web/components/GameStudio/UzaySeruveni/UzaySeruveniGame.tsx
'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Play,
  ArrowRight,
  ArrowLeft,
  Pause,
  Home,
  Settings,
  HelpCircle,
  Sparkles,
  Trophy,
  CheckCircle2,
  Star,
  Award,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react'
import {
  SPACE_MISSIONS,
  SpaceMission,
  SpaceQuestion,
  SpaceGameProgress,
  loadSpaceProgress,
  saveSpaceProgress,
  recordMissionWin,
  resetSpaceProgress,
  GradeLevel,
} from '@/lib/gamestudio/uzaySeruveniData'
import {
  playSpaceClick,
  playTurboBoost,
  playCoinPickup,
  playShieldDeflect,
  playSpaceVictory,
  playChestOpen,
} from '@/lib/gamestudio/uzaySeruveniAudio'

interface UzaySeruveniGameProps {
  onExit?: () => void
}

type ScreenMode = 'start' | 'missions' | 'gameplay' | 'pause' | 'complete' | 'reward'

export default function UzaySeruveniGame({ onExit }: UzaySeruveniGameProps) {
  // State
  const [progress, setProgress] = useState<SpaceGameProgress>(loadSpaceProgress)
  const [currentScreen, setCurrentScreen] = useState<ScreenMode>('start')
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('1')
  const [activeMissionId, setActiveMissionId] = useState<number>(1)
  const [questionIdx, setQuestionIdx] = useState<number>(0)
  const [selectedOptId, setSelectedOptId] = useState<string | null>(null)
  const [feedbackState, setFeedbackState] = useState<'idle' | 'success' | 'mistake'>('idle')
  const [rocketLane, setRocketLane] = useState<number>(1) // 0: left, 1: center, 2: right
  const [showHint, setShowHint] = useState<boolean>(false)
  const [mistakesCount, setMistakesCount] = useState<number>(0)
  const [showPedagogyModal, setShowPedagogyModal] = useState<boolean>(false)
  const [chestOpened, setChestOpened] = useState<boolean>(false)
  const [earnedStarsTemp, setEarnedStarsTemp] = useState<number>(3)

  // Sync progress
  useEffect(() => {
    const loaded = loadSpaceProgress()
    setProgress(loaded)
    setSelectedGrade(loaded.selectedGrade || '1')
  }, [])

  // Filtered missions for active grade
  const currentGradeMissions = useMemo(() => {
    return SPACE_MISSIONS.filter((m) => m.grade === selectedGrade)
  }, [selectedGrade])

  const activeMission: SpaceMission = useMemo(() => {
    return SPACE_MISSIONS.find((m) => m.id === activeMissionId) || SPACE_MISSIONS[0]
  }, [activeMissionId])

  const currentQ: SpaceQuestion = useMemo(() => {
    if (!activeMission.questions || activeMission.questions.length === 0) {
      return {
        id: 'fallback',
        prompt: 'Roket Hazır!',
        kozmoAdvice: 'Uçuşa hazır ol Kaptan!',
        visualType: 'counting',
        correctAnswer: 1,
        options: [{ id: '1', value: 1 }],
        hintText: 'Başla!',
      }
    }
    return activeMission.questions[Math.min(questionIdx, activeMission.questions.length - 1)]
  }, [activeMission, questionIdx])

  // Sound toggle
  const toggleSound = () => {
    const updated = {
      ...progress,
      settings: {
        ...progress.settings,
        soundEnabled: !progress.settings.soundEnabled,
      },
    }
    setProgress(updated)
    saveSpaceProgress(updated)
    if (updated.settings.soundEnabled) playSpaceClick(true)
  }

  // Handle grade change
  const handleGradeSelect = (g: GradeLevel) => {
    playSpaceClick(progress.settings.soundEnabled)
    setSelectedGrade(g)
    const updated = { ...progress, selectedGrade: g }
    setProgress(updated)
    saveSpaceProgress(updated)
    const firstMissionOfGrade = g === '1' ? 1 : 6
    setActiveMissionId(firstMissionOfGrade)
  }

  // Start mission
  const handleLaunchMission = (missionId: number) => {
    playSpaceClick(progress.settings.soundEnabled)
    if (missionId > progress.unlockedMission) return

    setActiveMissionId(missionId)
    setQuestionIdx(0)
    setSelectedOptId(null)
    setFeedbackState('idle')
    setRocketLane(1)
    setShowHint(false)
    setMistakesCount(0)
    setCurrentScreen('gameplay')
  }

  // Core Verb: YÖNLENDİR & EŞLEŞTİR (Answer selection)
  const handleSelectOption = (opt: { id: string; value: number | string }, optIndex: number) => {
    if (feedbackState === 'success') return
    playSpaceClick(progress.settings.soundEnabled)
    setSelectedOptId(opt.id)
    setRocketLane(optIndex % 3)

    const isCorrect = String(opt.value).trim() === String(currentQ.correctAnswer).trim()

    if (isCorrect) {
      // SUCCESS! Turbo boost & stars
      setFeedbackState('success')
      playTurboBoost(progress.settings.soundEnabled)

      setTimeout(() => {
        playCoinPickup(progress.settings.soundEnabled)
      }, 350)

      setTimeout(() => {
        if (questionIdx + 1 < activeMission.questions.length) {
          setQuestionIdx((prev) => prev + 1)
          setSelectedOptId(null)
          setFeedbackState('idle')
          setShowHint(false)
        } else {
          // Mission Complete!
          handleMissionFinished()
        }
      }, 1200)
    } else {
      // SOFT MISTAKE: Shield deflect & Kozmo hint
      setFeedbackState('mistake')
      playShieldDeflect(progress.settings.soundEnabled)
      setMistakesCount((prev) => prev + 1)
      if (mistakesCount >= 1) {
        setShowHint(true)
      }

      setTimeout(() => {
        setFeedbackState('idle')
        setSelectedOptId(null)
      }, 700)
    }
  }

  // Mission Finished: calculate stars & reward
  const handleMissionFinished = () => {
    let stars = 3
    if (mistakesCount >= 2) stars = 1
    else if (mistakesCount === 1) stars = 2

    setEarnedStarsTemp(stars)
    const updated = recordMissionWin(
      activeMission.id,
      stars,
      activeMission.rewardCoins,
      activeMission.rewardName
    )
    setProgress(updated)
    playSpaceVictory(progress.settings.soundEnabled)
    setCurrentScreen('complete')
  }

  // Chest Open on Reward Screen
  const handleOpenChest = () => {
    if (chestOpened) return
    playChestOpen(progress.settings.soundEnabled)
    setChestOpened(true)
  }

  // Reset Progress
  const handleResetData = () => {
    if (confirm('Tüm uzay ilerlemen, altınların ve açılan ödüller sıfırlansın mı?')) {
      const reset = resetSpaceProgress()
      setProgress(reset)
      setActiveMissionId(1)
      setCurrentScreen('start')
      playSpaceClick(progress.settings.soundEnabled)
    }
  }

  return (
    <div className="relative w-full h-full min-h-screen bg-[#0E0620] text-white font-sans select-none overflow-hidden flex flex-col justify-between">
      {/* Background Space Image + Star Particles */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-80 pointer-events-none"
        style={{
          backgroundImage: "url('/games/uzay-seruveni/assets/screen_1_start.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.65)',
        }}
      />

      {/* Floating Space Dust & Stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-12 w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
        <div className="absolute top-1/4 right-20 w-3 h-3 rounded-full bg-amber-300 animate-pulse" />
        <div className="absolute bottom-32 left-1/4 w-2 h-2 rounded-full bg-purple-300 animate-ping delay-500" />
      </div>

      {/* ========================================================================= */}
      {/* SCREEN 1: START SCREEN (ORIGINAL EPS SCREEN 1) */}
      {/* ========================================================================= */}
      {currentScreen === 'start' && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-between p-4 sm:p-6 max-w-lg mx-auto w-full">
          {/* Top Bar with Pedagogy Report, Grade Toggle & Sound */}
          <div className="w-full flex items-center justify-between pt-2">
            <button
              onClick={() => setShowPedagogyModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold border border-white/20 backdrop-blur text-cyan-200 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Öğretmen & Veli Özeti</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleSound}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center border border-white/20 backdrop-blur transition-all cursor-pointer"
              >
                {progress.settings.soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <VolumeX className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {onExit && (
                <button
                  onClick={onExit}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-bold border border-rose-500/40 transition-all cursor-pointer"
                >
                  Çıkış
                </button>
              )}
            </div>
          </div>

          {/* Central Artwork: UFO + Stylized Title */}
          <div className="flex flex-col items-center text-center my-auto py-2">
            {/* UFO Hovering Animation */}
            <motion.div
              animate={{ y: [-8, 8, -8], rotate: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="relative w-44 h-28 sm:w-52 sm:h-32 mb-2"
            >
              <Image
                src="/games/uzay-seruveni/assets/ufo.png"
                alt="UFO"
                fill
                className="object-contain drop-shadow-[0_0_25px_rgba(56,189,248,0.7)]"
                priority
              />
            </motion.div>

            {/* Stylized Space Adventure Logo */}
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#22D3EE] via-[#06B6D4] to-[#0284C7] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] uppercase">
              Uzay Serüveni
            </h1>
            <p className="text-sm font-extrabold text-amber-300 tracking-widest uppercase mt-0.5">
              Matematik Roketi
            </p>

            {/* Sınıf Seçici (1. ve 2. Sınıf) */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-cyan-400/30 mt-4 backdrop-blur shadow-inner">
              <button
                onClick={() => handleGradeSelect('1')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  selectedGrade === '1'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md scale-105'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                1. Sınıf Modu
              </button>
              <button
                onClick={() => handleGradeSelect('2')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  selectedGrade === '2'
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md scale-105'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                2. Sınıf Modu
              </button>
            </div>

            {/* Toplanan Altın & Görev Sayısı */}
            <div className="flex items-center gap-4 mt-5">
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/70 border border-amber-400/40 text-amber-300 text-xs font-black">
                <Image
                  src="/games/uzay-seruveni/assets/coin.png"
                  alt="Altın"
                  width={18}
                  height={18}
                  className="object-contain"
                />
                <span>{progress.totalCoins} Altın</span>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/70 border border-cyan-400/40 text-cyan-300 text-xs font-black">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>
                  {Object.values(progress.missionStars).reduce((a, b) => a + b, 0)} / 30 Yıldız
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Launch Button & Progress Bar */}
          <div className="w-full flex flex-col items-center gap-3 pb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playSpaceClick(progress.settings.soundEnabled)
                setCurrentScreen('missions')
              }}
              className="relative w-64 sm:w-72 h-16 sm:h-20 transition-all cursor-pointer drop-shadow-[0_8px_25px_rgba(245,158,11,0.6)]"
            >
              <Image
                src="/games/uzay-seruveni/assets/btn_start.png"
                alt="BAŞLA"
                fill
                className="object-contain"
                priority
              />
              <span className="absolute inset-0 flex items-center justify-center font-black text-2xl sm:text-3xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] uppercase tracking-wide">
                BAŞLA
              </span>
            </motion.button>

            {/* Orijinal Çizgili İlerleme Barı */}
            <div className="relative w-64 sm:w-72 h-8 sm:h-9">
              <Image
                src="/games/uzay-seruveni/assets/progress_bar.png"
                alt="İlerleme Barı"
                fill
                className="object-contain"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-800">
                {Math.round((progress.completedMissions.length / 10) * 100)}%
              </span>
            </div>

            {progress.completedMissions.length > 0 && (
              <button
                onClick={handleResetData}
                className="text-[11px] font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1 mt-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>İlerlemeyi Sıfırla</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 2: MISSION SELECTOR MAP */}
      {/* ========================================================================= */}
      {currentScreen === 'missions' && (
        <div className="relative z-10 flex-1 flex flex-col p-4 sm:p-6 max-w-2xl mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <button
              onClick={() => {
                playSpaceClick(progress.settings.soundEnabled)
                setCurrentScreen('start')
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold border border-white/20 backdrop-blur transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ana Menü</span>
            </button>

            <div className="text-center">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                {selectedGrade}. Sınıf Görevleri
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-amber-400/40 text-amber-300 text-xs font-black">
              <Image
                src="/games/uzay-seruveni/assets/coin.png"
                alt="Altın"
                width={16}
                height={16}
              />
              <span>{progress.totalCoins}</span>
            </div>
          </div>

          {/* Missions List */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
            {currentGradeMissions.map((m) => {
              const isUnlocked = m.id <= progress.unlockedMission
              const isCompleted = progress.completedMissions.includes(m.id)
              const stars = progress.missionStars[m.id] || 0

              return (
                <div
                  key={m.id}
                  onClick={() => isUnlocked && handleLaunchMission(m.id)}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isUnlocked
                      ? 'bg-slate-900/85 hover:bg-slate-800/90 border-cyan-400/40 hover:border-cyan-300 shadow-lg cursor-pointer active:scale-[0.98]'
                      : 'bg-slate-950/40 border-white/5 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                        isCompleted
                          ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 shadow'
                          : isUnlocked
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {m.id}
                    </div>

                    <div>
                      <h3 className="font-black text-sm sm:text-base text-white">{m.title}</h3>
                      <p className="text-xs text-slate-300 mt-0.5">{m.pedagogicalObjective}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] font-bold text-amber-300">
                        <span>Ödül: {m.rewardName}</span>
                        <span>•</span>
                        <span>+{m.rewardCoins} Altın</span>
                      </div>
                    </div>
                  </div>

                  {/* Stars / Lock */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {isUnlocked ? (
                      <>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3].map((sNum) => (
                            <Star
                              key={sNum}
                              className={`w-4 h-4 ${
                                sNum <= stars
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-cyan-300 flex items-center gap-1">
                          <Play className="w-3 h-3 fill-cyan-300" />
                          <span>Uçuşa Başla</span>
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-slate-500 font-bold">🔒 Kilitli</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 3: GAMEPLAY SCREEN (ORIGINAL EPS SCREEN 2 WITH LIVE ROCKET) */}
      {/* ========================================================================= */}
      {currentScreen === 'gameplay' && (
        <div className="relative z-10 flex-1 flex flex-col justify-between p-3 sm:p-5 max-w-lg mx-auto w-full">
          {/* Top HUD: Menu / Level Title / Coins / Pause */}
          <div className="flex items-center justify-between pb-2">
            <button
              onClick={() => {
                playSpaceClick(progress.settings.soundEnabled)
                setCurrentScreen('pause')
              }}
              className="w-10 h-10 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center font-black shadow-md cursor-pointer"
              title="Oyunu Durdur"
            >
              <Pause className="w-5 h-5 fill-slate-950" />
            </button>

            <div className="text-center">
              <span className="text-[11px] font-black uppercase text-cyan-300">
                Görev {activeMission.id} • Soru {questionIdx + 1} / {activeMission.questions.length}
              </span>
              <div className="flex items-center justify-center gap-1.5 mt-0.5">
                {activeMission.questions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i < questionIdx
                        ? 'w-6 bg-emerald-400'
                        : i === questionIdx
                        ? 'w-8 bg-amber-400 animate-pulse'
                        : 'w-4 bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900/80 border border-amber-400/40 text-amber-300 text-xs font-black shadow">
              <Image
                src="/games/uzay-seruveni/assets/coin.png"
                alt="Altın"
                width={16}
                height={16}
              />
              <span>{progress.totalCoins}</span>
            </div>
          </div>

          {/* Central Cosmic Viewport: Moving Planets, Question & Rocket */}
          <div className="relative flex-1 rounded-3xl p-4 bg-slate-950/70 border-2 border-cyan-500/30 shadow-2xl flex flex-col justify-between overflow-hidden my-2">
            {/* Background Planets from EPS */}
            <div className="absolute top-4 left-3 w-16 h-16 opacity-70 pointer-events-none">
              <Image
                src="/games/uzay-seruveni/assets/planet_yellow.png"
                alt="Sarı Gezegen"
                fill
                className="object-contain"
              />
            </div>
            <div className="absolute top-16 right-4 w-14 h-14 opacity-70 pointer-events-none">
              <Image
                src="/games/uzay-seruveni/assets/planet_cyan.png"
                alt="Mavi Gezegen"
                fill
                className="object-contain"
              />
            </div>

            {/* Question Panel */}
            <div className="relative z-10 text-center py-2 px-3 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur">
              <h2 className="text-base sm:text-lg font-black text-white">{currentQ.prompt}</h2>
              {currentQ.subPrompt && (
                <p className="text-xs sm:text-sm font-bold text-amber-300 mt-0.5">
                  {currentQ.subPrompt}
                </p>
              )}

              {/* Visual Helper if counting/symbols */}
              {currentQ.visualType === 'counting' && currentQ.visualData?.count && (
                <div className="flex flex-wrap items-center justify-center gap-2 mt-2 py-1">
                  {Array.from({ length: currentQ.visualData.count }).map((_, idx) => (
                    <span key={idx} className="text-2xl animate-pulse">
                      {currentQ.visualData.symbol || '⭐'}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Rocket Lane Arena (3 Lanes: Left, Center, Right) */}
            <div className="relative flex-1 flex items-end justify-center py-4">
              <div className="w-full max-w-xs grid grid-cols-3 gap-2 items-end justify-items-center relative h-48">
                {/* Visual Lane Targets */}
                {[0, 1, 2].map((laneIdx) => (
                  <div
                    key={laneIdx}
                    className="w-full h-full flex flex-col items-center justify-start border-b-2 border-dashed border-cyan-400/20"
                  >
                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                      Rota {laneIdx + 1}
                    </span>
                  </div>
                ))}

                {/* Animated Rocket */}
                <motion.div
                  animate={{
                    x: rocketLane === 0 ? -90 : rocketLane === 2 ? 90 : 0,
                    y: feedbackState === 'success' ? -20 : 0,
                    scale: feedbackState === 'success' ? 1.15 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="absolute bottom-2 w-24 h-36 flex flex-col items-center justify-center pointer-events-none"
                >
                  <div className="relative w-20 h-28">
                    <Image
                      src="/games/uzay-seruveni/assets/rocket.png"
                      alt="Uzay Roketi"
                      fill
                      className="object-contain drop-shadow-[0_0_20px_rgba(34,211,238,0.7)]"
                      priority
                    />
                  </div>

                  {/* Rocket Engine Flame Animation */}
                  <motion.div
                    animate={{ scaleY: [0.8, 1.3, 0.8], opacity: [0.7, 1, 0.7] }}
                    transition={{ repeat: Infinity, duration: 0.35 }}
                    className="w-4 h-8 bg-gradient-to-b from-cyan-300 via-amber-400 to-transparent rounded-full -mt-1 blur-[1px]"
                  />
                </motion.div>
              </div>
            </div>

            {/* Kozmo (Alien Mascot) Turkish Speech Bubble */}
            <div className="relative z-10 flex items-end gap-2 p-2.5 rounded-2xl bg-cyan-950/80 border border-cyan-400/40 backdrop-blur">
              <div className="relative w-12 h-12 shrink-0">
                <Image
                  src="/games/uzay-seruveni/assets/alien_mascot.png"
                  alt="Kozmo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-xs">
                <span className="font-black text-cyan-300 block">Kozmo Rehber:</span>
                <p className="text-slate-200 font-medium">
                  {feedbackState === 'success'
                    ? '🌟 Harika manevra Kaptan! Roket tam gaz ilerliyor!'
                    : feedbackState === 'mistake'
                    ? '🛡️ Kalkan koruması devrede! Tekrar deneyelim, başarabilirsin!'
                    : currentQ.kozmoAdvice}
                </p>
              </div>
            </div>

            {/* Hint Panel */}
            {showHint && (
              <div className="p-2.5 mt-2 rounded-xl bg-amber-950/80 border border-amber-400/50 text-amber-200 text-xs font-bold flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>İpucu: {currentQ.hintText}</span>
              </div>
            )}
          </div>

          {/* Core Verb: EŞLEŞTİR - 3 Big Option Buttons */}
          <div className="w-full pt-1">
            <div className="text-center text-xs font-black uppercase tracking-wider text-cyan-300 mb-2">
              DOĞRU ROTA KAPISINI SEÇ
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {currentQ.options.map((opt, oIdx) => {
                const isSelected = selectedOptId === opt.id
                let btnStyle =
                  'bg-slate-800/90 hover:bg-slate-700/90 border-slate-600 text-white shadow-lg'

                if (isSelected && feedbackState === 'success') {
                  btnStyle =
                    'bg-emerald-500 border-emerald-300 text-slate-950 scale-105 shadow-[0_0_25px_rgba(16,185,129,0.9)]'
                } else if (isSelected && feedbackState === 'mistake') {
                  btnStyle =
                    'bg-rose-500 border-rose-300 text-white animate-shake shadow-[0_0_20px_rgba(244,63,94,0.8)]'
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt, oIdx)}
                    disabled={feedbackState === 'success'}
                    className={`min-h-[64px] sm:min-h-[74px] rounded-2xl border-2 sm:border-3 font-black text-2xl sm:text-3xl transition-all flex flex-col items-center justify-center p-2 active:scale-95 cursor-pointer ${btnStyle}`}
                  >
                    <span>{opt.label || opt.value}</span>
                  </button>
                )
              })}
            </div>

            {/* Bottom Arrow Steer Controls for Touch */}
            <div className="flex items-center justify-between gap-3 mt-3">
              <button
                onClick={() => {
                  playSpaceClick(progress.settings.soundEnabled)
                  setRocketLane((prev) => Math.max(0, prev - 1))
                }}
                className="flex-1 py-2.5 rounded-2xl bg-cyan-900/60 hover:bg-cyan-800/60 border border-cyan-400/40 text-cyan-200 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sola Kaydır</span>
              </button>

              <button
                onClick={() => {
                  playSpaceClick(progress.settings.soundEnabled)
                  setShowHint((prev) => !prev)
                }}
                className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span>İpucu</span>
              </button>

              <button
                onClick={() => {
                  playSpaceClick(progress.settings.soundEnabled)
                  setRocketLane((prev) => Math.min(2, prev + 1))
                }}
                className="flex-1 py-2.5 rounded-2xl bg-cyan-900/60 hover:bg-cyan-800/60 border border-cyan-400/40 text-cyan-200 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Sağa Kaydır</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 4: PAUSE MODAL (ORIGINAL EPS SCREEN 3) */}
      {/* ========================================================================= */}
      {currentScreen === 'pause' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-sm rounded-3xl p-6 border-2 border-cyan-400/60 shadow-[0_0_50px_rgba(6,182,212,0.5)] text-center flex flex-col items-center"
            style={{
              background:
                'linear-gradient(180deg, rgba(14, 116, 144, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
            }}
          >
            <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-6 drop-shadow">
              OYUNU DURDUR
            </h2>

            {/* 3 Yellow Action Buttons from EPS */}
            <div className="w-full space-y-3 mb-6">
              <button
                onClick={() => {
                  playSpaceClick(progress.settings.soundEnabled)
                  setCurrentScreen('gameplay')
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>DEVAM ET</span>
              </button>

              <button
                onClick={() => {
                  playSpaceClick(progress.settings.soundEnabled)
                  setCurrentScreen('missions')
                }}
                className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>GÖREV LİSTESİ</span>
              </button>

              <button
                onClick={toggleSound}
                className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {progress.settings.soundEnabled ? (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>SESLER: AÇIK</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 text-slate-400" />
                    <span>SESLER: KAPALI</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => {
                playSpaceClick(progress.settings.soundEnabled)
                setCurrentScreen('start')
              }}
              className="text-xs text-slate-300 hover:text-white font-bold transition-colors cursor-pointer"
            >
              Ana Ekrana Dön
            </button>
          </motion.div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 5: LEVEL COMPLETE (ORIGINAL EPS SCREEN 4) */}
      {/* ========================================================================= */}
      {currentScreen === 'complete' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-sm rounded-3xl p-6 border-2 border-cyan-400/60 shadow-[0_0_50px_rgba(6,182,212,0.5)] text-center flex flex-col items-center"
            style={{
              background:
                'linear-gradient(180deg, rgba(8, 145, 178, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
            }}
          >
            {/* 3 Golden Stars from EPS */}
            <div className="relative w-48 h-20 mb-2">
              <Image
                src="/games/uzay-seruveni/assets/stars_complete.png"
                alt="Yıldızlar"
                fill
                className="object-contain drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]"
              />
            </div>

            <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-1">
              BÖLÜM TAMAMLANDI!
            </h2>
            <p className="text-xs text-cyan-200 font-semibold mb-4">
              {activeMission.pedagogicalObjective}
            </p>

            {/* Coin Reward Banner */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-950/70 border border-amber-400/50 text-amber-300 font-black text-lg mb-5 shadow">
              <Image
                src="/games/uzay-seruveni/assets/coin.png"
                alt="Altın"
                width={24}
                height={24}
              />
              <span>+{activeMission.rewardCoins} Altın</span>
            </div>

            {/* Yellow NEXT Button from EPS */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playSpaceClick(progress.settings.soundEnabled)
                setChestOpened(false)
                setCurrentScreen('reward')
              }}
              className="relative w-56 h-16 transition-all cursor-pointer drop-shadow-[0_8px_20px_rgba(245,158,11,0.6)] mb-3"
            >
              <Image
                src="/games/uzay-seruveni/assets/btn_next.png"
                alt="SONRAKİ"
                fill
                className="object-contain"
              />
              <span className="absolute inset-0 flex items-center justify-center font-black text-xl text-white drop-shadow uppercase">
                ÖDÜLÜ GÖR
              </span>
            </motion.button>

            <button
              onClick={() => {
                playSpaceClick(progress.settings.soundEnabled)
                setCurrentScreen('missions')
              }}
              className="text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Görev Haritasına Dön
            </button>
          </motion.div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 6: YOU GOT A REWARD (ORIGINAL EPS SCREEN 5 WITH CHEST) */}
      {/* ========================================================================= */}
      {currentScreen === 'reward' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-sm rounded-3xl p-6 border-2 border-cyan-400/60 shadow-[0_0_50px_rgba(6,182,212,0.5)] text-center flex flex-col items-center"
            style={{
              background:
                'linear-gradient(180deg, rgba(8, 145, 178, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
            }}
          >
            {/* Metallic Futuristic Chest from EPS */}
            <motion.div
              animate={
                chestOpened
                  ? { scale: [1, 1.2, 1.1], rotate: [0, -5, 5, 0] }
                  : { y: [-5, 5, -5] }
              }
              transition={{ repeat: chestOpened ? 0 : Infinity, duration: 3 }}
              onClick={handleOpenChest}
              className="relative w-44 h-40 cursor-pointer my-2 drop-shadow-[0_0_25px_rgba(255,255,255,0.7)]"
            >
              <Image
                src="/games/uzay-seruveni/assets/reward_chest.png"
                alt="Hazine Sandığı"
                fill
                className="object-contain"
              />
              {!chestOpened && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs animate-bounce shadow">
                    Dokun & Aç!
                  </span>
                </div>
              )}
            </motion.div>

            <h2 className="text-xl font-black text-white uppercase tracking-wider mt-1">
              {chestOpened ? 'ÖDÜL KAZANDIN!' : 'GİZEMLİ SANDIK'}
            </h2>

            <div className="p-3 my-3 rounded-2xl bg-slate-950/70 border border-white/10 w-full text-center">
              <span className="text-xs text-slate-300 block">Kazanılan Donanım:</span>
              <strong className="text-sm font-black text-amber-300">
                {activeMission.rewardName}
              </strong>
            </div>

            {/* GET Button from EPS */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playSpaceClick(progress.settings.soundEnabled)
                if (activeMission.id < 10) {
                  handleLaunchMission(activeMission.id + 1)
                } else {
                  setCurrentScreen('missions')
                }
              }}
              className="relative w-52 h-16 transition-all cursor-pointer drop-shadow-[0_8px_20px_rgba(245,158,11,0.6)] mb-2"
            >
              <Image
                src="/games/uzay-seruveni/assets/btn_get.png"
                alt="AL"
                fill
                className="object-contain"
              />
              <span className="absolute inset-0 flex items-center justify-center font-black text-xl text-white drop-shadow uppercase">
                {activeMission.id < 10 ? 'SONRAKİ GÖREV' : 'TAMAMLA'}
              </span>
            </motion.button>

            <button
              onClick={() => {
                playSpaceClick(progress.settings.soundEnabled)
                setCurrentScreen('missions')
              }}
              className="text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Görev Haritasına Dön
            </button>
          </motion.div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TEACHER & PARENT REPORT */}
      {/* ========================================================================= */}
      {showPedagogyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-slate-900 border border-white/20 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-black text-white">
                  Öğretmen & Veli Gelişim Raporu
                </h3>
              </div>
              <button
                onClick={() => setShowPedagogyModal(false)}
                className="p-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[11px] text-slate-400 font-bold">Tamamlanan</span>
                  <div className="text-lg font-black text-cyan-300 mt-1">
                    {progress.completedMissions.length} / 10 Görev
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[11px] text-slate-400 font-bold">Yıldızlar</span>
                  <div className="text-lg font-black text-amber-300 mt-1">
                    {Object.values(progress.missionStars).reduce((a, b) => a + b, 0)} / 30
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[11px] text-slate-400 font-bold">Kozmik Altın</span>
                  <div className="text-lg font-black text-emerald-300 mt-1">
                    {progress.totalCoins}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-cyan-950/50 border border-cyan-400/30 text-xs text-slate-300 space-y-1.5">
                <span className="font-black text-cyan-300 block uppercase">
                  1. ve 2. Sınıf MEB Matematik Kazanımları:
                </span>
                <p>• 1-20 Arası Ritmik Sayma & Onluk Birlik Modellemesi</p>
                <p>• Basit Toplama ve Çıkarma Refleksleri</p>
                <p>• Büyüklük-Küçüklük Karşılaştırma & Ritmik Sayı Örüntüleri</p>
                <p className="text-slate-400 pt-1">
                  Oyun, çocuklara ceza uygulamadan nazik geri bildirimle matematiksel düşünme
                  özgüvenini pekiştirir.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
