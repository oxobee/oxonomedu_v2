// apps/web/lib/gamestudio/uzaySeruveniAudio.ts
'use client'

/**
 * Procedural Web Audio API sound synthesizer for Uzay Serüveni (Space Adventure).
 * 100% offline, procedural sound effects: Rocket thruster, star chime, warp jump, chest fanfare.
 */

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
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
 * Soft UI click / tap pop
 */
export function playSpaceClick(enabled = true) {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(600, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.06)

  gain.gain.setValueAtTime(0.12, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start()
  osc.stop(ctx.currentTime + 0.06)
}

/**
 * Correct answer / Turbo boost sound (cosmic rising glissando)
 */
export function playTurboBoost(enabled = true) {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  // Rocket whoosh + harmonic chime
  const osc1 = ctx.createOscillator()
  const osc2 = ctx.createOscillator()
  const gain = ctx.createGain()

  osc1.type = 'sawtooth'
  osc1.frequency.setValueAtTime(140, ctx.currentTime)
  osc1.frequency.exponentialRampToValueAtTime(580, ctx.currentTime + 0.35)

  osc2.type = 'triangle'
  osc2.frequency.setValueAtTime(320, ctx.currentTime)
  osc2.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.35)

  gain.gain.setValueAtTime(0.02, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 0.1)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)

  osc1.connect(gain)
  osc2.connect(gain)
  gain.connect(ctx.destination)

  osc1.start()
  osc2.start()
  osc1.stop(ctx.currentTime + 0.4)
  osc2.stop(ctx.currentTime + 0.4)
}

/**
 * Coin / Star pickup (sparkling high chime)
 */
export function playCoinPickup(enabled = true) {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  const notes = [987.77, 1318.51] // B5, E6
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06)

    const startTime = ctx.currentTime + idx * 0.06
    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(startTime)
    osc.stop(startTime + 0.3)
  })
}

/**
 * Gentle space shield deflection / soft mistake sound
 */
export function playShieldDeflect(enabled = true) {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(220, ctx.currentTime)
  osc.frequency.linearRampToValueAtTime(160, ctx.currentTime + 0.15)
  osc.frequency.linearRampToValueAtTime(190, ctx.currentTime + 0.25)

  gain.gain.setValueAtTime(0.14, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start()
  osc.stop(ctx.currentTime + 0.28)
}

/**
 * Level complete victory fanfare
 */
export function playSpaceVictory(enabled = true) {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  const melody = [
    { freq: 440.0, time: 0, dur: 0.12 },
    { freq: 554.37, time: 0.12, dur: 0.12 },
    { freq: 659.25, time: 0.24, dur: 0.14 },
    { freq: 880.0, time: 0.4, dur: 0.45 },
  ]

  melody.forEach((note) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.time)

    const startTime = ctx.currentTime + note.time
    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(0.18, startTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.dur)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(startTime)
    osc.stop(startTime + note.dur)
  })
}

/**
 * Chest open sound effect (magical opening sparkle)
 */
export function playChestOpen(enabled = true) {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98]
  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    const startTime = ctx.currentTime + idx * 0.05
    osc.frequency.setValueAtTime(freq, startTime)

    gain.gain.setValueAtTime(0.12, startTime)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(startTime)
    osc.stop(startTime + 0.38)
  })
}
