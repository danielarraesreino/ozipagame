"use client"

// Sons do jogo. A trilha (rap) é um arquivo; os efeitos de swipe são
// sintetizados no Web Audio API (sem arquivo). Mudo é compartilhado entre os
// dois e persiste no localStorage.

const MUTE_KEY = "ozipa_muted"

export function isMuted(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(MUTE_KEY) === "1"
}

export function setMuted(v: boolean) {
  if (typeof window === "undefined") return
  localStorage.setItem(MUTE_KEY, v ? "1" : "0")
  window.dispatchEvent(new CustomEvent("ozipa-mute", { detail: v }))
}

let ctx: AudioContext | null = null
function audioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ctx = new AC()
    }
    if (ctx.state === "suspended") ctx.resume()
    return ctx
  } catch {
    return null
  }
}

// Toca uma sequência curta de notas. notes: [freq, startOffset, dur]
function blip(notes: [number, number, number][], type: OscillatorType, gain: number) {
  if (isMuted()) return
  const ac = audioCtx()
  if (!ac) return
  const now = ac.currentTime
  for (const [freq, off, dur] of notes) {
    const osc = ac.createOscillator()
    const g = ac.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, now + off)
    g.gain.setValueAtTime(0.0001, now + off)
    g.gain.exponentialRampToValueAtTime(gain, now + off + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0001, now + off + dur)
    osc.connect(g).connect(ac.destination)
    osc.start(now + off)
    osc.stop(now + off + dur + 0.02)
  }
}

// Concordo → arpejo curto subindo (positivo, "joia")
export function playConcordo() {
  blip([[523.25, 0, 0.12], [659.25, 0.07, 0.12], [783.99, 0.14, 0.18]], "triangle", 0.16)
}

// Discordo → duas notas graves descendo (negação seca, sem ser desagradável)
export function playDiscordo() {
  blip([[311.13, 0, 0.14], [233.08, 0.1, 0.2]], "sawtooth", 0.12)
}
