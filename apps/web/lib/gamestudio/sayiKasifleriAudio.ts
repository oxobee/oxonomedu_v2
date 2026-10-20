// apps/web/lib/gamestudio/sayiKasifleriAudio.ts
'use client'

/**
 * Procedural Web Audio API sound synthesizer for Sayı Kaşifleri.
 * No external mp3 files needed; completely offline, responsive, zero-latency.
 */

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioContextClass) {
        audioCtx = new AudioContextClass()
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume()
    }
    return audioCtx
  } catch {
    return null
  }
}

/**
 * Tap / Click sound (short woody pop)
 */
export function playClickSound(enabled = true) {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(480, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.05)

  gain.gain.setValueAtTime(0.12, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start()
  osc.stop(ctx.currentTime + 0.05)
}

/**
 * Correct match chord (delightful high arpeggio / chime)
 */
export function playMatchSuccess(enabled = true) {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06)

    const startTime = ctx.currentTime + idx * 0.06
    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(0.18, startTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(startTime)
    osc.stop(startTime + 0.32)
  })
}

/**
 * Gentle soft error / rethink wobble (not punishing, warm low wobble)
 */
export function playMatchError(enabled = true) {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(280, ctx.currentTime)
  osc.frequency.linearRampToValueAtTime(210, ctx.currentTime + 0.12)
  osc.frequency.linearRampToValueAtTime(240, ctx.currentTime + 0.22)

  gain.gain.setValueAtTime(0.12, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.26)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start()
  osc.stop(ctx.currentTime + 0.26)
}

/**
 * Crystal pickup sparkle sound (sparkling bell tone)
 */
export function playCrystalPickup(enabled = true) {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  const freqs = [880, 1174.66, 1760, 2093]
  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04)

    const startTime = ctx.currentTime + idx * 0.04
    gain.gain.setValueAtTime(0.15, startTime)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(startTime)
    osc.stop(startTime + 0.38)
  })
}

/**
 * Level victory fanfare
 */
export function playLevelVictory(enabled = true) {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  // Fanfare: G4, C5, E5, G5, high flourish
  const melody = [
    { freq: 392.0, time: 0, dur: 0.1 },
    { freq: 523.25, time: 0.12, dur: 0.1 },
    { freq: 659.25, time: 0.24, dur: 0.12 },
    { freq: 783.99, time: 0.38, dur: 0.35 },
    { freq: 1046.5, time: 0.55, dur: 0.45 },
  ]

  melody.forEach((note) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.time)

    const startTime = ctx.currentTime + note.time
    gain.gain.setValueAtTime(0.18, startTime)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.dur)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(startTime)
    osc.stop(startTime + note.dur)
  })
}

/**
 * Star earned whoosh sound
 */
export function playStarEarned(enabled = true, starIndex = 0) {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  const baseFreq = 587.33 * Math.pow(1.25, starIndex) // D5 base
  osc.type = 'sine'
  osc.frequency.setValueAtTime(baseFreq, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.2)

  gain.gain.setValueAtTime(0.15, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start()
  osc.stop(ctx.currentTime + 0.25)
}
