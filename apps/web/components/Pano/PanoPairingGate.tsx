// apps/web/components/Pano/PanoPairingGate.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RotateCw,
  AlertCircle,
  Delete,
  Sparkles,
  CheckCircle2,
  Tv,
} from 'lucide-react'
import {
  pairBoardWithCode,
  BoardPairingInfo,
} from '@/lib/pano/boardPairingManager'

interface PanoPairingGateProps {
  onSuccess: (board: BoardPairingInfo) => void
  initialCode?: string
}

export default function PanoPairingGate({ onSuccess, initialCode = '' }: PanoPairingGateProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isShaking, setIsShaking] = useState(false)
  const [showKeypad, setShowKeypad] = useState(true)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // If initialCode has digits, prefill them
  useEffect(() => {
    if (initialCode) {
      const clean = initialCode.replace(/[^0-9]/g, '').slice(0, 6)
      if (clean.length > 0) {
        const next = ['', '', '', '', '', '']
        for (let i = 0; i < clean.length; i++) {
          next[i] = clean[i]
        }
        setDigits(next)
        if (clean.length === 6) {
          validateAndPair(clean)
        } else {
          setActiveIndex(clean.length)
        }
      }
    }
  }, [initialCode])

  // Focus active input box
  useEffect(() => {
    if (!isLoading && activeIndex >= 0 && activeIndex < 6) {
      inputRefs.current[activeIndex]?.focus()
    }
  }, [activeIndex, isLoading])

  // Core pairing validation
  const validateAndPair = (codeString: string) => {
    setIsLoading(true)
    setErrorMessage(null)

    setTimeout(() => {
      const result = pairBoardWithCode(codeString)
      if (result.success && result.board) {
        setIsSuccess(true)
        setTimeout(() => {
          onSuccess(result.board!)
        }, 600)
      } else {
        // Trigger shake, show error and auto-reset
        setIsShaking(true)
        setErrorMessage(
          result.error || 'Girdiğiniz pano kodu bulunamadı. Lütfen kontrol ediniz.'
        )
        setIsLoading(false)

        setTimeout(() => {
          setIsShaking(false)
          setDigits(['', '', '', '', '', ''])
          setActiveIndex(0)
          inputRefs.current[0]?.focus()
        }, 1100)
      }
    }, 450)
  }

  // Handle single digit input
  const handleDigitChange = (index: number, val: string) => {
    if (isLoading || isSuccess) return

    // Allow only numeric digit
    const char = val.replace(/[^0-9]/g, '').slice(-1)
    if (!char) {
      // Cleared
      const next = [...digits]
      next[index] = ''
      setDigits(next)
      return
    }

    const next = [...digits]
    next[index] = char
    setDigits(next)
    setErrorMessage(null)

    // Check if full 6 digits are filled
    const fullCode = next.join('')
    if (fullCode.length === 6 && !next.includes('')) {
      validateAndPair(fullCode)
    } else if (index < 5) {
      setActiveIndex(index + 1)
    }
  }

  // Handle backspace / navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isLoading || isSuccess) return

    if (e.key === 'Backspace') {
      if (digits[index] === '' && index > 0) {
        const next = [...digits]
        next[index - 1] = ''
        setDigits(next)
        setActiveIndex(index - 1)
      } else {
        const next = [...digits]
        next[index] = ''
        setDigits(next)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setActiveIndex(index - 1)
    } else if (e.key === 'ArrowRight' && index < 5) {
      setActiveIndex(index + 1)
    }
  }

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6)
    if (!pasted) return

    const next = [...digits]
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i]
    }
    setDigits(next)

    if (pasted.length === 6) {
      validateAndPair(pasted)
    } else {
      setActiveIndex(Math.min(5, pasted.length))
    }
  }

  // Virtual Keypad Button Press
  const handleVirtualKeyPress = (key: string) => {
    if (isLoading || isSuccess) return
    setShowKeypad(true)

    if (key === 'clear') {
      setDigits(['', '', '', '', '', ''])
      setActiveIndex(0)
      setErrorMessage(null)
      inputRefs.current[0]?.focus()
      return
    }

    if (key === 'backspace') {
      const targetIdx = digits[activeIndex] !== '' ? activeIndex : Math.max(0, activeIndex - 1)
      const next = [...digits]
      next[targetIdx] = ''
      setDigits(next)
      setActiveIndex(targetIdx)
      inputRefs.current[targetIdx]?.focus()
      return
    }

    // Number key 0-9
    let targetIdx = activeIndex
    // If current box already has a digit and we're not at the end, find next empty or move to next
    if (digits[targetIdx] !== '' && targetIdx < 5) {
      targetIdx = targetIdx + 1
    }

    const next = [...digits]
    next[targetIdx] = key
    setDigits(next)
    setErrorMessage(null)

    const fullCode = next.join('')
    if (fullCode.length === 6 && !next.includes('')) {
      validateAndPair(fullCode)
    } else if (targetIdx < 5) {
      setActiveIndex(targetIdx + 1)
    }
  }

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#0B030F] text-white flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto select-none font-sans z-[9999]">
      {/* ── Ambient Background Lighting ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-[#4B075F]/35 blur-[140px] animate-pulse" />
        <div
          className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-[#8D49A6]/25 blur-[150px] animate-pulse"
          style={{ animationDuration: '8s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-[#D914C8]/15 blur-[160px]"
        />

        {/* Floating Geometric Dots */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.08]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="gate-grid" width="36" height="36" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#D914C8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gate-grid)" />
        </svg>
      </div>

      {/* ── Mascot & Main Pairing Card ── */}
      <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center">
        {/* Mascot Peeking Over Top */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative -mb-10 z-20 pointer-events-none flex flex-col items-center select-none"
        >
          <img
            src="/mascot-scholar.png"
            alt="Oxonom Maskotu"
            className="w-32 h-32 sm:w-36 sm:h-36 object-contain drop-shadow-[0_12px_24px_rgba(217,20,200,0.4)] animate-bounce"
            style={{ animationDuration: '4s' }}
          />
        </motion.div>

        {/* Main Card with Shake Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={
            isShaking
              ? { x: [-12, 12, -9, 9, -5, 5, 0], scale: 1, y: 0 }
              : { opacity: 1, scale: 1, y: 0 }
          }
          transition={{ duration: isShaking ? 0.45 : 0.35, ease: 'easeOut' }}
          className="relative w-full rounded-[2.5rem] bg-[#160B20]/95 backdrop-blur-2xl border border-[#49364F]/80 shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-6 sm:p-8 pt-12 sm:pt-14 text-center flex flex-col items-center"
        >
          {/* Logo & Header */}
          <div className="mb-5 flex flex-col items-center">
            <div className="h-8 sm:h-9 mb-3 flex items-center justify-center">
              <img
                src="/brand/oxonom_edu_logo_white.png"
                alt="Oxonom Edu"
                className="h-7 sm:h-8 w-auto object-contain drop-shadow-md"
                onError={(e) => {
                  const target = e.currentTarget
                  target.src = '/oxonom-logo-dark.png'
                }}
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8D49A6]/20 border border-[#8D49A6]/40 text-[#F0D8FA] text-[11px] font-black uppercase tracking-wider mb-2">
              <Tv size={13} className="text-[#D914C8]" />
              <span>Akıllı Tahta Girişi</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
              Cihaz Eşleştirme
            </h1>

            <p className="text-xs sm:text-sm text-[#C4B3CD] mt-1.5 max-w-xs leading-relaxed">
              Okul müdürünüzden aldığınız 6 haneli{' '}
              <strong className="text-white font-bold">Pano Kodunu</strong> giriniz.
            </p>
          </div>

          {/* ── 6-Digit OTP / PIN Entry Boxes ── */}
          <div
            onClick={() => setShowKeypad(true)}
            className="w-full flex items-center justify-center gap-1.5 sm:gap-2.5 my-3 cursor-pointer"
          >
            {digits.map((digit, idx) => {
              const isCurrent = activeIndex === idx
              const hasVal = digit !== ''
              return (
                <div key={idx} className="relative">
                  <input
                    ref={(el) => {
                      inputRefs.current[idx] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onFocus={() => {
                      setActiveIndex(idx)
                      setShowKeypad(true)
                    }}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    disabled={isLoading || isSuccess}
                    className={`w-11 h-14 sm:w-13 sm:h-16 text-center text-2xl sm:text-3xl font-mono font-black rounded-2xl transition-all duration-200 outline-none select-none caret-transparent cursor-pointer ${
                      isShaking
                        ? 'border-2 border-rose-500 bg-rose-500/10 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                        : isSuccess
                        ? 'border-2 border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                        : isCurrent
                        ? 'border-2 border-[#D914C8] bg-[#261533] text-white shadow-[0_0_20px_rgba(217,20,200,0.45)] scale-105'
                        : hasVal
                        ? 'border border-[#8D49A6]/70 bg-[#20102C] text-white shadow-sm'
                        : 'border border-[#49364F] bg-[#1A0E24]/80 text-[#716779] hover:border-[#8D49A6]/50'
                    }`}
                  />
                  {/* Subtle dash divider between 3rd and 4th box */}
                  {idx === 2 && (
                    <div className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 w-1 sm:w-1.5 h-0.5 bg-[#49364F] rounded-full pointer-events-none hidden" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Feedback & Status Message */}
          <div className="min-h-[28px] my-1 flex items-center justify-center w-full">
            <AnimatePresence mode="wait">
              {isLoading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#D914C8]"
                >
                  <RotateCw size={14} className="animate-spin" />
                  <span>Pano doğrulanıyor...</span>
                </motion.div>
              )}

              {isSuccess && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400"
                >
                  <CheckCircle2 size={16} />
                  <span>Eşleşme başarılı! Tahta açılıyor...</span>
                </motion.div>
              )}

              {errorMessage && !isLoading && !isSuccess && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold text-center"
                >
                  <AlertCircle size={14} className="shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Virtual On-Screen Numeric Keypad ── */}
          <AnimatePresence>
            {showKeypad && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: 10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: 10 }}
                transition={{ duration: 0.25 }}
                className="w-full mt-3 pt-3 border-t border-[#49364F]/50 flex flex-col items-center gap-2 select-none"
              >
                <div className="grid grid-cols-3 gap-2 w-full max-w-[320px]">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleVirtualKeyPress(num.toString())}
                      disabled={isLoading || isSuccess}
                      className="h-12 sm:h-13 rounded-2xl bg-[#241330] hover:bg-[#341B45] active:bg-[#4B075F] active:scale-95 text-white font-mono text-xl sm:text-2xl font-black border border-[#49364F]/80 shadow-md transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                    >
                      {num}
                    </button>
                  ))}

                  {/* Row 4: Clear, 0, Backspace */}
                  <button
                    type="button"
                    onClick={() => handleVirtualKeyPress('clear')}
                    disabled={isLoading || isSuccess}
                    className="h-12 sm:h-13 rounded-2xl bg-[#241330] hover:bg-rose-500/20 active:scale-95 text-rose-300 font-bold text-xs uppercase tracking-wider border border-[#49364F]/80 shadow-md transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                    title="Temizle"
                  >
                    Temizle
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVirtualKeyPress('0')}
                    disabled={isLoading || isSuccess}
                    className="h-12 sm:h-13 rounded-2xl bg-[#241330] hover:bg-[#341B45] active:bg-[#4B075F] active:scale-95 text-white font-mono text-xl sm:text-2xl font-black border border-[#49364F]/80 shadow-md transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                  >
                    0
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVirtualKeyPress('backspace')}
                    disabled={isLoading || isSuccess}
                    className="h-12 sm:h-13 rounded-2xl bg-[#241330] hover:bg-[#341B45] active:scale-95 text-[#D914C8] border border-[#49364F]/80 shadow-md transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                    title="Sil"
                  >
                    <Delete size={20} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
