// apps/web/components/GameStudio/SayiKasifleri/SayiKasifleriGame.tsx
'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  Play,
  ArrowRight,
  ArrowLeft,
  Star,
  Trophy,
  CheckCircle2,
  HelpCircle,
  Gem,
  Award,
  BookOpen,
  X,
  Compass,
  Layers,
  ChevronRight,
  Flame,
  Home,
  MapPin,
  RefreshCw,
} from 'lucide-react'
import {
  WORLDS_CONFIG,
  LEVELS_DATA,
  GameLevel,
  LevelQuestion,
  GameProgress,
  loadGameProgress,
  recordLevelCompletion,
  resetGameProgress,
  saveGameProgress,
} from '@/lib/gamestudio/sayiKasifleriData'
import {
  playClickSound,
  playMatchSuccess,
  playMatchError,
  playCrystalPickup,
  playLevelVictory,
  playStarEarned,
} from '@/lib/gamestudio/sayiKasifleriAudio'

interface SayiKasifleriGameProps {
  onExit?: () => void
}

type ScreenState = 'title' | 'world_map' | 'gameplay' | 'level_complete' | 'mastery'

export default function SayiKasifleriGame({ onExit }: SayiKasifleriGameProps) {
  // Persistence State
  const [progress, setProgress] = useState<GameProgress>(loadGameProgress)
  const [screen, setScreen] = useState<ScreenState>('title')
  const [activeWorldIndex, setActiveWorldIndex] = useState<number>(0)
  const [activeLevelId, setActiveLevelId] = useState<number>(1)

  // Gameplay State
  const [questionIndex, setQuestionIndex] = useState<number>(0)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [matchStatus, setMatchStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [showHint, setShowHint] = useState<boolean>(false)
  const [errorsInCurrentLevel, setErrorsInCurrentLevel] = useState<number>(0)
  const [hintsUsedInLevel, setHintsUsedInLevel] = useState<number>(0)
  const [levelScore, setLevelScore] = useState<number>(0)
  const [isMechanismActive, setIsMechanismActive] = useState<boolean>(false)
  const [showParentReport, setShowParentReport] = useState<boolean>(false)
  const [mascotMood, setMascotMood] = useState<'idle' | 'happy' | 'think' | 'celebrate'>('idle')
  const [earnedStarsTemp, setEarnedStarsTemp] = useState<number>(3)

  // Sync state with localStorage
  useEffect(() => {
    setProgress(loadGameProgress())
  }, [])

  const currentLevel: GameLevel = useMemo(() => {
    return LEVELS_DATA.find((l) => l.id === activeLevelId) || LEVELS_DATA[0]
  }, [activeLevelId])

  const currentQuestion: LevelQuestion = useMemo(() => {
    if (!currentLevel.questions || currentLevel.questions.length === 0) {
      return {
        prompt: 'Kristali Etkinleştir!',
        targetVisualType: 'number-blocks',
        correctAnswer: 10,
        options: [{ id: '1', value: 10, label: '10' }],
        hintText: 'Onluğu seç.',
        mathPedagogy: 'Sayı tanıma',
      }
    }
    return currentLevel.questions[Math.min(questionIndex, currentLevel.questions.length - 1)]
  }, [currentLevel, questionIndex])

  const currentWorld = useMemo(() => {
    return WORLDS_CONFIG[activeWorldIndex] || WORLDS_CONFIG[0]
  }, [activeWorldIndex])

  // Sound toggle helper
  const toggleSound = () => {
    const updated = {
      ...progress,
      settings: {
        ...progress.settings,
        soundEnabled: !progress.settings.soundEnabled,
      },
    }
    setProgress(updated)
    saveGameProgress(updated)
    if (updated.settings.soundEnabled) {
      playClickSound(true)
    }
  }

  // Handle Level Selection
  const handleSelectLevel = (levelId: number) => {
    playClickSound(progress.settings.soundEnabled)
    if (levelId > progress.unlockedLevel) return

    setActiveLevelId(levelId)
    const targetLvl = LEVELS_DATA.find((l) => l.id === levelId)
    if (targetLvl) {
      const wIdx = WORLDS_CONFIG.findIndex((w) => w.id === targetLvl.worldId)
      if (wIdx >= 0) setActiveWorldIndex(wIdx)
    }

    setQuestionIndex(0)
    setSelectedOptionId(null)
    setMatchStatus('idle')
    setShowHint(false)
    setErrorsInCurrentLevel(0)
    setHintsUsedInLevel(0)
    setLevelScore(0)
    setIsMechanismActive(false)
    setMascotMood('idle')
    setScreen('gameplay')
  }

  // Handle Match Selection (Nintendo Single Core Verb: EŞLEŞTİR)
  const handleMatchSelect = (opt: { id: string; value: number | string }) => {
    if (matchStatus === 'success') return // Prevent multiple clicks during transition
    playClickSound(progress.settings.soundEnabled)
    setSelectedOptionId(opt.id)

    const isCorrect = String(opt.value).trim() === String(currentQuestion.correctAnswer).trim()

    if (isCorrect) {
      // SUCCESS!
      setMatchStatus('success')
      setMascotMood('happy')
      setIsMechanismActive(true)
      playMatchSuccess(progress.settings.soundEnabled)
      setLevelScore((prev) => prev + 100)

      setTimeout(() => {
        playCrystalPickup(progress.settings.soundEnabled)
      }, 350)

      // Transition to next question or level complete
      setTimeout(() => {
        if (questionIndex + 1 < currentLevel.questions.length) {
          setQuestionIndex((prev) => prev + 1)
          setSelectedOptionId(null)
          setMatchStatus('idle')
          setShowHint(false)
          setIsMechanismActive(false)
          setMascotMood('idle')
        } else {
          // Level Completed!
          completeCurrentLevel()
        }
      }, 1200)
    } else {
      // SOFT ERROR: No harsh penalties, gentle rethink wobble
      setMatchStatus('error')
      setMascotMood('think')
      playMatchError(progress.settings.soundEnabled)
      setErrorsInCurrentLevel((prev) => prev + 1)

      // Auto-show hint if failed twice
      if (errorsInCurrentLevel >= 1) {
        setShowHint(true)
      }

      // Reset selection wobble after 600ms
      setTimeout(() => {
        setMatchStatus('idle')
        setSelectedOptionId(null)
      }, 650)
    }
  }

  // Complete Current Level & Calculate Stars (0 - 3)
  const completeCurrentLevel = () => {
    let stars = 3
    if (errorsInCurrentLevel > 2 || hintsUsedInLevel > 1) {
      stars = 1
    } else if (errorsInCurrentLevel > 0 || hintsUsedInLevel > 0) {
      stars = 2
    }
    setEarnedStarsTemp(stars)

    const updated = recordLevelCompletion(currentLevel.id, stars, levelScore + 100, 1)
    setProgress(updated)
    setMascotMood('celebrate')
    playLevelVictory(progress.settings.soundEnabled)

    // Stagger star sounds
    for (let i = 0; i < stars; i++) {
      setTimeout(() => {
        playStarEarned(progress.settings.soundEnabled, i)
      }, 400 + i * 280)
    }

    setScreen('level_complete')
  }

  // Reset all game progress
  const handleReset = () => {
    if (confirm('Tüm ilerlemen ve topladığın kristaller sıfırlansın mı?')) {
      const reset = resetGameProgress()
      setProgress(reset)
      setActiveLevelId(1)
      setActiveWorldIndex(0)
      setScreen('title')
      playClickSound(progress.settings.soundEnabled)
    }
  }

  return (
    <div className="relative w-full h-full min-h-screen bg-[#070D18] text-white font-sans select-none overflow-hidden flex flex-col justify-between">
      {/* Dynamic Background World Lighting */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000 opacity-60"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${currentWorld.color}22 0%, transparent 70%)`,
        }}
      />

      {/* Floating Sparkles in the background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-12 left-10 w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
        <div className="absolute top-1/3 right-16 w-3 h-3 rounded-full bg-amber-300 animate-pulse" />
        <div className="absolute bottom-24 left-1/4 w-2 h-2 rounded-full bg-purple-300 animate-ping delay-700" />
        <div className="absolute top-2/3 right-1/3 w-2.5 h-2.5 rounded-full bg-emerald-300 animate-pulse delay-500" />
      </div>

      {/* ========================================================================= */}
      {/* SCREEN 1: TITLE & INTRO SCREEN */}
      {/* ========================================================================= */}
      {screen === 'title' && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-between p-4 sm:p-8 max-w-4xl mx-auto w-full">
          {/* Top Bar with sound and pedagogical report */}
          <div className="w-full flex items-center justify-between pt-2">
            <button
              onClick={() => setShowParentReport(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-semibold backdrop-blur transition-all border border-white/10 text-cyan-200"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Öğretmen & Veli Özeti</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleSound}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur transition-all border border-white/10"
                title={progress.settings.soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
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
                  className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs sm:text-sm font-bold border border-red-500/30 transition-all"
                >
                  Çıkış
                </button>
              )}
            </div>
          </div>

          {/* Central Logo & Mascot */}
          <div className="flex flex-col items-center text-center my-auto py-4">
            {/* Mascot SVG Leo */}
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-cyan-500/30 blur-2xl rounded-full scale-125 animate-pulse" />
              <MascotCharacter mood="celebrate" />
            </div>

            {/* Badges */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs sm:text-sm font-bold mb-3 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Oxonom Edu • 2. Sınıf Matematik Macerası</span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-cyan-200 via-teal-100 to-amber-200 bg-clip-text text-transparent drop-shadow-lg">
              Sayı Kaşifleri
            </h1>
            <p className="text-lg sm:text-xl font-bold text-cyan-300/90 mt-1 flex items-center gap-2">
              <Gem className="w-5 h-5 text-cyan-400 animate-bounce" />
              Kayıp Kristaller
            </p>

            <p className="text-sm text-slate-300 max-w-md mt-3 font-medium">
              Sayılar Adası&apos;nın sönen kristallerini yeniden uyandır! Onlukları birleştir, kayıp sayıları bul ve büyük kristali kurtar.
            </p>

            {/* Summary Chips */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-amber-300">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>
                  {Object.values(progress.levelStars).reduce((a, b) => a + b, 0)} / 36 Yıldız
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-cyan-300">
                <Gem className="w-4 h-4 text-cyan-400" />
                <span>{progress.totalCrystals} Kristal</span>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{progress.completedLevels.length} / 12 Seviye</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 pb-4">
            <button
              onClick={() => {
                playClickSound(progress.settings.soundEnabled)
                setScreen('world_map')
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-black text-lg sm:text-xl shadow-[0_10px_30px_rgba(20,184,166,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-emerald-700"
            >
              <Play className="w-6 h-6 fill-slate-950" />
              <span>{progress.completedLevels.length > 0 ? 'Maceraya Devam Et' : 'Oyuna Başla'}</span>
            </button>

            {progress.completedLevels.length > 0 && (
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-bold transition-all border border-white/10 flex items-center justify-center gap-2"
                title="İlerlemeyi Sıfırla"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Sıfırla</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 2: WORLD & LEVEL SELECTION MAP */}
      {/* ========================================================================= */}
      {screen === 'world_map' && (
        <div className="relative z-10 flex-1 flex flex-col p-4 sm:p-6 max-w-5xl mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <button
              onClick={() => {
                playClickSound(progress.settings.soundEnabled)
                setScreen('title')
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-bold backdrop-blur transition-all border border-white/10"
            >
              <Home className="w-4 h-4" />
              <span>Ana Menü</span>
            </button>

            {/* Crystals & Stars */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-black">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{Object.values(progress.levelStars).reduce((a, b) => a + b, 0)}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-black">
                <Gem className="w-4 h-4 text-cyan-400" />
                <span>{progress.totalCrystals}</span>
              </div>
            </div>
          </div>

          {/* World Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4">
            {WORLDS_CONFIG.map((w, idx) => {
              const isSelected = activeWorldIndex === idx
              const isUnlocked = progress.unlockedLevel >= w.levels[0]

              return (
                <button
                  key={w.id}
                  onClick={() => {
                    playClickSound(progress.settings.soundEnabled)
                    setActiveWorldIndex(idx)
                  }}
                  className={`p-3 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                    isSelected
                      ? `bg-gradient-to-br ${w.bgGradient} border-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.3)] scale-[1.02]`
                      : isUnlocked
                      ? 'bg-slate-900/60 border-white/10 hover:bg-slate-800/60 opacity-90'
                      : 'bg-slate-950/40 border-white/5 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-black">
                    <span
                      style={{ color: w.color }}
                      className="px-2 py-0.5 rounded-full bg-white/10 text-[10px]"
                    >
                      DÜNYA {w.number}
                    </span>
                    {!isUnlocked && <span className="text-[10px] text-gray-400">🔒 Kilitli</span>}
                  </div>
                  <div className="mt-2">
                    <div className="font-black text-sm text-white truncate">{w.title}</div>
                    <div className="text-[11px] text-slate-400 truncate">{w.themeName}</div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* World Banner Info */}
          <div
            className={`p-4 rounded-3xl border border-white/15 bg-gradient-to-r ${currentWorld.bgGradient} mb-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}
          >
            <div>
              <div className="text-xs font-black tracking-wider uppercase text-cyan-300">
                Dünya {currentWorld.number} • {currentWorld.themeName}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{currentWorld.title}</h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                {currentWorld.description}
              </p>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="text-xs font-bold text-slate-300">Seviyeler:</span>
              <span className="px-2.5 py-1 rounded-xl bg-white/10 text-xs font-black text-cyan-200">
                {currentWorld.levels[0]} — {currentWorld.levels[currentWorld.levels.length - 1]}
              </span>
            </div>
          </div>

          {/* Level Nodes in World */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {currentWorld.levels.map((lvlId) => {
                const lvl = LEVELS_DATA.find((l) => l.id === lvlId)!
                const isUnlocked = lvlId <= progress.unlockedLevel
                const isCompleted = progress.completedLevels.includes(lvlId)
                const stars = progress.levelStars[lvlId] || 0

                return (
                  <div
                    key={lvlId}
                    onClick={() => isUnlocked && handleSelectLevel(lvlId)}
                    className={`relative rounded-3xl p-5 border transition-all ${
                      isUnlocked
                        ? 'bg-slate-900/90 border-cyan-500/40 hover:border-cyan-300 hover:scale-[1.03] cursor-pointer shadow-[0_8px_25px_rgba(0,0,0,0.5)] active:scale-95'
                        : 'bg-slate-950/50 border-white/5 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm text-slate-950 shadow"
                          style={{
                            background: isUnlocked
                              ? `linear-gradient(135deg, ${lvl.crystalColor}, #FFFFFF)`
                              : '#475569',
                          }}
                        >
                          {lvl.id}
                        </div>
                        <span className="text-xs font-bold text-slate-400">{lvl.concept}</span>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3].map((starNum) => (
                          <Star
                            key={starNum}
                            className={`w-4 h-4 ${
                              starNum <= stars
                                ? 'fill-amber-400 text-amber-400 drop-shadow'
                                : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                      {lvl.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {lvl.pedagogicalObjective}
                    </p>

                    {/* Footer badge */}
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                        <Gem className="w-3.5 h-3.5" style={{ color: lvl.crystalColor }} />
                        <span>{lvl.crystalName}</span>
                      </div>

                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Tamamlandı
                        </span>
                      ) : isUnlocked ? (
                        <span className="flex items-center gap-1 text-cyan-400 font-bold">
                          <Play className="w-3 h-3 fill-cyan-400" />
                          Oyna
                        </span>
                      ) : (
                        <span className="text-slate-500 font-bold">Kilitli</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 3: GAMEPLAY VIEWPORT */}
      {/* ========================================================================= */}
      {screen === 'gameplay' && (
        <div className="relative z-10 flex-1 flex flex-col justify-between p-3 sm:p-6 max-w-4xl mx-auto w-full">
          {/* Top HUD */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
            {/* Back to map button */}
            <button
              onClick={() => {
                playClickSound(progress.settings.soundEnabled)
                setScreen('world_map')
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all border border-white/10 text-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Harita</span>
            </button>

            {/* Level Title & Progress */}
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400">
                Seviye {currentLevel.id}: {currentLevel.title}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {currentLevel.questions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx < questionIndex
                        ? 'w-6 bg-emerald-400'
                        : idx === questionIndex
                        ? 'w-8 bg-cyan-400 animate-pulse'
                        : 'w-4 bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Actions: Sound & Hint */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playClickSound(progress.settings.soundEnabled)
                  setShowHint((prev) => !prev)
                  setHintsUsedInLevel((prev) => prev + 1)
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  showHint
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                    : 'bg-white/10 hover:bg-white/20 text-amber-300 border-white/10'
                }`}
                title="İpucu Al"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">İpucu</span>
              </button>
              <button
                onClick={toggleSound}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all border border-white/10"
              >
                {progress.settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Interactive World Viewport: Mascot + Physical World Mechanism */}
          <div className="relative my-2 sm:my-4 rounded-3xl p-4 sm:p-6 bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden">
            {/* World Ambience glow */}
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20"
              style={{ backgroundColor: currentLevel.crystalColor }}
            />

            {/* Top row in viewport: Mascot & Mechanism reaction */}
            <div className="flex items-center justify-between mb-4">
              {/* Mascot */}
              <div className="flex items-center gap-3">
                <MascotCharacter mood={mascotMood} size="sm" />
                <div>
                  <div className="text-xs font-black text-cyan-300 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Kaşif Can</span>
                  </div>
                  <div className="text-xs text-slate-300 font-medium">
                    {matchStatus === 'success'
                      ? 'Harika eşleştirme! Kristal etkinleşti! ✨'
                      : matchStatus === 'error'
                      ? 'Biraz düşünelim, tekrar deneyebilirsin! 🤔'
                      : 'Hangi taş kapıyı açar?'}
                  </div>
                </div>
              </div>

              {/* Physical Reaction Mechanism (Nintendo Physicality: Gate / Bridge / Crystal) */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-950/70 border border-white/10">
                <Gem
                  className={`w-6 h-6 transition-all duration-500 ${
                    isMechanismActive ? 'scale-125 rotate-12 drop-shadow-[0_0_15px_#38BDF8]' : 'opacity-70'
                  }`}
                  style={{ color: currentLevel.crystalColor }}
                />
                <div className="text-[11px] font-bold">
                  <span className="text-slate-400">Kapı: </span>
                  <span className={isMechanismActive ? 'text-emerald-400' : 'text-amber-300'}>
                    {isMechanismActive ? 'AÇILDI ✓' : 'KİLİTLİ 🔒'}
                  </span>
                </div>
              </div>
            </div>

            {/* Question Prompt */}
            <div className="text-center py-1 sm:py-2">
              <h2 className="text-lg sm:text-2xl font-black text-white drop-shadow">
                {currentQuestion.prompt}
              </h2>
              {currentQuestion.subPrompt && (
                <p className="text-xs sm:text-sm text-cyan-200 mt-1 font-semibold">
                  {currentQuestion.subPrompt}
                </p>
              )}
            </div>

            {/* Central Mathematical Visualizer */}
            <div className="my-3 py-4 px-2 sm:px-6 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-center min-h-[140px] sm:min-h-[170px]">
              <MathVisualRenderer
                type={currentQuestion.targetVisualType}
                visualData={currentQuestion.visualData}
                correctAnswer={currentQuestion.correctAnswer}
                accentColor={currentLevel.crystalColor}
              />
            </div>

            {/* Visual Hint Panel (If toggled or failed twice) */}
            {showHint && (
              <div className="p-3 rounded-2xl bg-amber-950/70 border border-amber-500/40 text-amber-200 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fadeIn">
                <HelpCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <span>{currentQuestion.hintText}</span>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* THE NINTENDO SINGLE CORE VERB: EŞLEŞTİR (MATCH STONES) */}
          {/* ========================================================================= */}
          <div className="w-full">
            <div className="text-center text-xs font-black uppercase tracking-wider text-cyan-300 mb-2 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>DOĞRU TAŞI SEÇ VE EŞLEŞTİR</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id
                let buttonStyle = 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-700 text-white'

                if (isSelected && matchStatus === 'success') {
                  buttonStyle =
                    'bg-emerald-500 border-emerald-400 text-slate-950 scale-105 shadow-[0_0_25px_rgba(16,185,129,0.8)]'
                } else if (isSelected && matchStatus === 'error') {
                  buttonStyle =
                    'bg-rose-500/80 border-rose-400 text-white animate-shake shadow-[0_0_20px_rgba(244,63,94,0.6)]'
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleMatchSelect(opt)}
                    disabled={matchStatus === 'success'}
                    className={`relative min-h-[64px] sm:min-h-[76px] rounded-2xl border-2 sm:border-3 font-black text-xl sm:text-2xl transition-all flex flex-col items-center justify-center p-2 active:scale-95 shadow-lg ${buttonStyle}`}
                  >
                    <span>{opt.label || opt.value}</span>
                    {opt.visualCount && (
                      <span className="text-[10px] font-normal text-slate-300">
                        {opt.visualCount} adet
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 4: LEVEL COMPLETE SCREEN */}
      {/* ========================================================================= */}
      {screen === 'level_complete' && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-lg mx-auto w-full text-center">
          <div className="w-full bg-slate-900/95 border-2 border-cyan-400/50 rounded-3xl p-6 sm:p-8 shadow-[0_15px_50px_rgba(0,0,0,0.8)] backdrop-blur">
            {/* Mascot */}
            <div className="flex justify-center mb-2">
              <MascotCharacter mood="celebrate" />
            </div>

            {/* Title */}
            <div className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-1">
              BÖLÜM TAMAMLANDI!
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {currentLevel.title}
            </h2>
            <p className="text-xs text-slate-300 mt-1">{currentLevel.concept}</p>

            {/* Stars Won (0-3) */}
            <div className="flex items-center justify-center gap-3 my-5">
              {[1, 2, 3].map((starIdx) => (
                <div
                  key={starIdx}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    starIdx <= earnedStarsTemp
                      ? 'bg-amber-400/20 border-2 border-amber-400 scale-110 shadow-[0_0_20px_rgba(251,191,36,0.6)]'
                      : 'bg-slate-800 border border-slate-700 opacity-40'
                  }`}
                >
                  <Star
                    className={`w-8 h-8 sm:w-10 sm:h-10 ${
                      starIdx <= earnedStarsTemp
                        ? 'fill-amber-400 text-amber-400 animate-bounce'
                        : 'text-slate-600'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Performance note */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold text-cyan-200 mb-6">
              {earnedStarsTemp === 3
                ? '🌟 Muhteşem! Hatasız ve bağımsız çözerek 3 yıldız kazandın!'
                : earnedStarsTemp === 2
                ? '👍 Çok iyi! Başarılı bir keşif yaptın!'
                : '✨ Tebrikler! Seviyeyi tamamlayıp kristali uyandırdın!'}
            </div>

            {/* Crystal Awarded */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-sm font-bold mb-6">
              <Gem className="w-5 h-5 text-cyan-400 animate-pulse" />
              <span>+1 {currentLevel.crystalName} Toplandı</span>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => {
                  playClickSound(progress.settings.soundEnabled)
                  setScreen('world_map')
                }}
                className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all border border-white/10 flex items-center justify-center gap-2"
              >
                <Layers className="w-4 h-4" />
                <span>Haritaya Dön</span>
              </button>

              {currentLevel.id < 12 ? (
                <button
                  onClick={() => {
                    handleSelectLevel(currentLevel.id + 1)
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm transition-all shadow-[0_5px_20px_rgba(20,184,166,0.4)] flex items-center justify-center gap-2"
                >
                  <span>Sonraki Seviye</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    playClickSound(progress.settings.soundEnabled)
                    setScreen('mastery')
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-sm transition-all shadow-[0_5px_20px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Büyük Kristal Zaferi</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 5: FINAL MASTERY CELEBRATION (KISHŌTENKETSU FINAL) */}
      {/* ========================================================================= */}
      {screen === 'mastery' && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-xl mx-auto w-full text-center">
          <div className="w-full bg-gradient-to-b from-amber-950/90 via-slate-900/95 to-slate-950/95 border-2 border-amber-400 rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(245,158,11,0.4)] backdrop-blur">
            <Trophy className="w-16 h-16 text-amber-400 mx-auto animate-bounce mb-3" />

            <div className="text-xs font-black uppercase tracking-widest text-amber-300">
              KISHŌTENKETSU BÜYÜK ZAFERİ
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
              Sayılar Adası Kurtarıldı!
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
              Tüm 12 seviyeyi tamamladın, Büyük Ustalık Kristali&apos;ni birleştirdin ve adanın tüm matematik mekanizmalarını yeniden canlandırdın!
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 my-6">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-2xl font-black text-amber-400">12 / 12</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Seviye</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-2xl font-black text-cyan-400">
                  {Object.values(progress.levelStars).reduce((a, b) => a + b, 0)} / 36
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Yıldız</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-2xl font-black text-emerald-400">
                  {progress.totalCrystals}
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Kristal</div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => {
                  playClickSound(progress.settings.soundEnabled)
                  setScreen('world_map')
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-sm transition-all shadow-[0_5px_20px_rgba(245,158,11,0.5)]"
              >
                Haritaya Göz At
              </button>
              <button
                onClick={() => setShowParentReport(true)}
                className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all border border-white/10 flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Öğrenme Karnesi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TEACHER & PARENT PEDAGOGICAL REPORT */}
      {/* ========================================================================= */}
      {showParentReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-white/20 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-black text-white">
                  Öğretmen & Veli Matematiksel Gelişim Raporu
                </h3>
              </div>
              <button
                onClick={() => setShowParentReport(false)}
                className="p-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <div className="text-xs text-slate-400 font-bold">Tamamlanan</div>
                  <div className="text-xl font-black text-emerald-400 mt-1">
                    {progress.completedLevels.length} / 12 Bölüm
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <div className="text-xs text-slate-400 font-bold">Kazanılan Yıldız</div>
                  <div className="text-xl font-black text-amber-400 mt-1">
                    {Object.values(progress.levelStars).reduce((a, b) => a + b, 0)} / 36
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <div className="text-xs text-slate-400 font-bold">Toplanan Kristal</div>
                  <div className="text-xl font-black text-cyan-400 mt-1">
                    {progress.totalCrystals} Adet
                  </div>
                </div>
              </div>

              {/* Pedagogy Goals */}
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/20">
                <h4 className="text-xs font-black text-cyan-300 uppercase tracking-wider mb-2">
                  2. Sınıf Matematik Kazanım Matrisi
                </h4>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span>1. Sayıları Tanıma, Basamak Değeri (Onluk-Birlik)</span>
                    <span className="font-bold text-emerald-400">
                      {progress.completedLevels.includes(3) ? 'Kazanıldı ✓' : 'Sürüyor'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span>2. Sayı Karşılaştırma (&gt;, &lt;, =)</span>
                    <span className="font-bold text-emerald-400">
                      {progress.completedLevels.includes(2) ? 'Kazanıldı ✓' : 'Sürüyor'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span>3. Somut Modellerle Toplama ve Eksik Toplanan</span>
                    <span className="font-bold text-emerald-400">
                      {progress.completedLevels.includes(5) ? 'Kazanıldı ✓' : 'Sürüyor'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span>4. Sayı Doğrusunda Geriye Sayma ve Çıkarma</span>
                    <span className="font-bold text-emerald-400">
                      {progress.completedLevels.includes(8) ? 'Kazanıldı ✓' : 'Sürüyor'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span>5. Sayı Örüntüleri ve Problem Çözme</span>
                    <span className="font-bold text-emerald-400">
                      {progress.completedLevels.includes(10) ? 'Kazanıldı ✓' : 'Sürüyor'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pedagogy Note */}
              <p className="text-xs text-slate-400 leading-relaxed">
                Bu oyun, Tracy Fullerton ve Nintendo oyun tasarımı metodolojisine uygun olarak
                geliştirilmiştir. Çocuklar hız baskısı olmaksızın, görsel modeller ve anında geri
                bildirimle kendi tempolarıyla öğrenirler.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// =========================================================================
// SUB-COMPONENT: KAŞİF CAN MASCOT (ANIMATED SVG CHARACTER)
// =========================================================================
function MascotCharacter({
  mood = 'idle',
  size = 'md',
}: {
  mood?: 'idle' | 'happy' | 'think' | 'celebrate'
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClasses =
    size === 'sm' ? 'w-14 h-14' : size === 'lg' ? 'w-32 h-32' : 'w-24 h-24'

  return (
    <div
      className={`relative ${sizeClasses} flex items-center justify-center transition-transform ${
        mood === 'celebrate'
          ? 'animate-bounce'
          : mood === 'happy'
          ? 'scale-110'
          : mood === 'think'
          ? '-rotate-6'
          : ''
      }`}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        {/* Shadow */}
        <ellipse cx="50" cy="92" rx="28" ry="6" fill="#000000" opacity="0.3" />

        {/* Explorer Hat */}
        <ellipse cx="50" cy="30" rx="36" ry="10" fill="#D97706" />
        <path d="M28 30 C 28 12, 72 12, 72 30 Z" fill="#F59E0B" />
        <rect x="30" y="27" width="40" height="4" fill="#78350F" />

        {/* Face */}
        <circle cx="50" cy="50" r="22" fill="#FDE68A" />

        {/* Eyes */}
        {mood === 'happy' || mood === 'celebrate' ? (
          <>
            <path
              d="M40 48 Q 44 42, 48 48"
              stroke="#1E293B"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M52 48 Q 56 42, 60 48"
              stroke="#1E293B"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </>
        ) : mood === 'think' ? (
          <>
            <circle cx="43" cy="46" r="3" fill="#1E293B" />
            <circle cx="57" cy="44" r="3" fill="#1E293B" />
          </>
        ) : (
          <>
            <circle cx="43" cy="48" r="3" fill="#1E293B" />
            <circle cx="57" cy="48" r="3" fill="#1E293B" />
          </>
        )}

        {/* Cheeks */}
        <circle cx="36" cy="54" r="3.5" fill="#F87171" opacity="0.6" />
        <circle cx="64" cy="54" r="3.5" fill="#F87171" opacity="0.6" />

        {/* Smile */}
        {mood === 'happy' || mood === 'celebrate' ? (
          <path
            d="M44 56 Q 50 64, 56 56"
            stroke="#B91C1C"
            strokeWidth="2.5"
            fill="#EF4444"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M45 56 Q 50 60, 55 56"
            stroke="#1E293B"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* Explorer Shirt & Scarf */}
        <path d="M36 70 L 64 70 L 60 88 L 40 88 Z" fill="#0D9488" />
        {/* Red Neckerchief */}
        <polygon points="46,70 54,70 50,78" fill="#EF4444" />
      </svg>
    </div>
  )
}

// =========================================================================
// SUB-COMPONENT: MATHEMATICAL VISUAL RENDERER
// Renders Onluk-Birlik, Comparison, Number-Line, Missing Addend, Pattern
// =========================================================================
function MathVisualRenderer({
  type,
  visualData,
  correctAnswer,
  accentColor,
}: {
  type: LevelQuestion['targetVisualType']
  visualData?: any
  correctAnswer: number | string
  accentColor: string
}) {
  // 1. ONLUK VE BİRLİK TABAN BLOKLARI
  if (type === 'number-blocks') {
    const tens = visualData?.tens || 0
    const ones = visualData?.ones || 0

    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-end justify-center gap-4 sm:gap-6">
          {/* Onluk Çubuklar (Her biri 10 birim) */}
          {tens > 0 && (
            <div className="flex items-end gap-1.5 p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/20">
              {Array.from({ length: tens }).map((_, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-5 sm:w-6 h-24 sm:h-28 rounded-md bg-gradient-to-t from-cyan-600 to-cyan-400 border border-cyan-200 flex flex-col justify-between p-0.5 shadow">
                    {Array.from({ length: 10 }).map((_, cIdx) => (
                      <div key={cIdx} className="w-full h-1.5 sm:h-2 rounded-[1px] bg-cyan-300/40" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-cyan-300 mt-1">10</span>
                </div>
              ))}
            </div>
          )}

          {/* Birlik Küpler (Tekil 1 birim) */}
          {ones > 0 && (
            <div className="flex flex-wrap items-center justify-center max-w-[120px] gap-1.5 p-2 rounded-xl bg-amber-950/40 border border-amber-500/20">
              {Array.from({ length: ones }).map((_, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-200 shadow flex items-center justify-center text-[10px] font-black text-slate-950">
                    1
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
          {tens > 0 && <span className="text-cyan-300">{tens} Onluk ({tens * 10})</span>}
          {tens > 0 && ones > 0 && <span>+</span>}
          {ones > 0 && <span className="text-amber-300">{ones} Birlik ({ones})</span>}
        </div>
      </div>
    )
  }

  // 2. SAYI KARŞILAŞTIRMA (BÜYÜK / KÜÇÜK / EŞİT)
  if (type === 'comparison') {
    const num1 = visualData?.num1 ?? 15
    const num2 = visualData?.num2 ?? 25

    return (
      <div className="flex items-center justify-center gap-4 sm:gap-8">
        <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-cyan-900/60 border-2 border-cyan-400 flex flex-col items-center justify-center shadow-lg">
          <span className="text-2xl sm:text-3xl font-black text-white">{num1}</span>
        </div>

        <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-slate-800/80 border-2 border-amber-400/80 flex items-center justify-center shadow animate-pulse">
          <span className="text-2xl sm:text-3xl font-black text-amber-300">?</span>
        </div>

        <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-teal-900/60 border-2 border-teal-400 flex flex-col items-center justify-center shadow-lg">
          <span className="text-2xl sm:text-3xl font-black text-white">{num2}</span>
        </div>
      </div>
    )
  }

  // 3. SAYI DOĞRUSU (NUMBER LINE)
  if (type === 'number-line') {
    const start = visualData?.start ?? 10
    const end = visualData?.end ?? 20
    const steps = visualData?.steps || []
    const range = end - start || 10

    return (
      <div className="w-full max-w-md flex flex-col items-center py-2">
        <div className="relative w-full h-12 flex items-center">
          {/* Main Line */}
          <div className="w-full h-2 rounded-full bg-slate-700 relative">
            {/* Range points */}
            {Array.from({ length: range + 1 }).map((_, idx) => {
              const val = start + idx
              const pct = (idx / range) * 100
              const isMarked = steps.includes(val) || val === start || val === end

              return (
                <div
                  key={idx}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${pct}%` }}
                >
                  <div
                    className={`w-1.5 transition-all ${
                      isMarked ? 'h-5 bg-cyan-300' : 'h-3 bg-slate-500'
                    } rounded-full`}
                  />
                  {isMarked && (
                    <span className="text-[10px] font-bold text-slate-300 mt-2">{val}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // 4. NESNE GRUPLARI (OBJECT GROUPS)
  if (type === 'object-groups') {
    const group1 = visualData?.group1 || 5
    const group2 = visualData?.group2 || 4
    const itemSymbol = visualData?.symbol || '💎'

    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
        <div className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-[140px]">
            {Array.from({ length: group1 }).map((_, i) => (
              <span key={i} className="text-xl sm:text-2xl animate-pulse">
                {itemSymbol}
              </span>
            ))}
          </div>
          <span className="text-xs font-bold text-cyan-300 mt-2">{group1} kristal</span>
        </div>

        <span className="text-2xl font-black text-amber-300">+</span>

        <div className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-[140px]">
            {Array.from({ length: group2 }).map((_, i) => (
              <span key={i} className="text-xl sm:text-2xl animate-pulse">
                {itemSymbol}
              </span>
            ))}
          </div>
          <span className="text-xs font-bold text-cyan-300 mt-2">{group2} kristal</span>
        </div>
      </div>
    )
  }

  // 5. EKSİK TOPLANAN (MISSING ADDEND)
  if (type === 'missing-addend') {
    const a = visualData?.a ?? 8
    const total = visualData?.total ?? 13

    return (
      <div className="flex items-center justify-center gap-3 sm:gap-5 text-2xl sm:text-4xl font-black">
        <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-slate-800 border-2 border-cyan-400 flex items-center justify-center text-white shadow">
          {a}
        </div>
        <span className="text-amber-400">+</span>
        <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-amber-500/20 border-2 border-amber-400 border-dashed flex items-center justify-center text-amber-300 animate-pulse">
          ?
        </div>
        <span className="text-cyan-400">=</span>
        <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-emerald-950 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shadow">
          {total}
        </div>
      </div>
    )
  }

  // 6. SAYI ÖRÜNTÜSÜ (PATTERN)
  if (type === 'pattern') {
    const sequence = visualData?.sequence || [4, 8, 12, '?', 20]

    return (
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {sequence.map((item: any, idx: number) => {
          const isMissing = item === '?'

          return (
            <div
              key={idx}
              className={`w-12 sm:w-16 h-12 sm:h-16 rounded-2xl flex items-center justify-center font-black text-lg sm:text-2xl transition-all shadow ${
                isMissing
                  ? 'bg-amber-400/20 border-2 border-amber-400 border-dashed text-amber-300 animate-pulse scale-105'
                  : 'bg-slate-800 border border-slate-700 text-white'
              }`}
            >
              {item}
            </div>
          )
        })}
      </div>
    )
  }

  // Default: Crystal gate
  return (
    <div className="flex items-center justify-center gap-3 text-2xl font-black text-cyan-300">
      <Gem className="w-10 h-10 animate-bounce" style={{ color: accentColor }} />
      <span>Kristal Eşleştirme</span>
    </div>
  )
}
