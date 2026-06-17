"use client"

import { useEffect, useRef, useState } from "react"
import { isMuted, setMuted } from "@/lib/sfx"

interface Faixa { nome: string; url: string }

interface Props { startPaused?: boolean }

export default function AudioBg({ startPaused = false }: Props) {
  const ref = useRef<HTMLAudioElement | null>(null)
  const [tracks, setTracks] = useState<Faixa[]>([])
  const [idx, setIdx] = useState(0)
  const [muted, setMutedState] = useState(false)
  const [open, setOpen] = useState(false)
  const [playing, setPlaying] = useState(!startPaused)

  useEffect(() => {
    setMutedState(isMuted())
    const onMute = (e: Event) => setMutedState((e as CustomEvent).detail as boolean)
    window.addEventListener("ozipa-mute", onMute)
    return () => window.removeEventListener("ozipa-mute", onMute)
  }, [])

  useEffect(() => {
    fetch("/audio_config.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((cfg: { trilhas?: Faixa[]; trilha?: string }) => {
        if (Array.isArray(cfg.trilhas) && cfg.trilhas.length) {
          setTracks(cfg.trilhas.filter((f) => f?.url))
        } else if (typeof cfg.trilha === "string" && cfg.trilha) {
          setTracks([{ nome: "trilha", url: cfg.trilha }])
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!tracks.length) return
    const el = ref.current
    if (!el) return
    el.volume = 0.35
    if (startPaused) return
    const tryPlay = () => { if (!isMuted()) el.play().catch(() => {}) }
    tryPlay()
    const onFirst = () => {
      tryPlay()
      window.removeEventListener("pointerdown", onFirst)
      window.removeEventListener("touchstart", onFirst)
    }
    window.addEventListener("pointerdown", onFirst, { once: true })
    window.addEventListener("touchstart", onFirst, { once: true })
    return () => {
      window.removeEventListener("pointerdown", onFirst)
      window.removeEventListener("touchstart", onFirst)
    }
  }, [tracks, idx, startPaused])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.muted = muted
    if (muted || !playing) el.pause()
    else if (tracks.length) el.play().catch(() => {})
  }, [muted, playing, tracks])

  if (!tracks.length) return null

  function toggleMute() {
    const next = !muted
    setMuted(next)
    setMutedState(next)
  }
  function togglePlay() {
    const next = !playing
    setPlaying(next)
    if (next && muted) { setMuted(false); setMutedState(false) }
  }
  function nextTrack() {
    setIdx((i) => (i + 1) % tracks.length)
    if (!playing) setPlaying(true)
    if (muted) { setMuted(false); setMutedState(false) }
  }
  function pick(i: number) {
    setIdx(i)
    setOpen(false)
    if (!playing) setPlaying(true)
    if (muted) { setMuted(false); setMutedState(false) }
  }

  const atual = tracks[idx]

  return (
    <div className="fixed bottom-3 right-3 z-50 flex flex-col items-end gap-2">
      {/* lista de faixas (abre pra cima) */}
      {open && tracks.length > 1 && (
        <div className="mb-1 w-52 max-w-[70vw] bg-grafite-2/95 border-2 border-grafite-3 rounded-xl backdrop-blur overflow-hidden">
          {tracks.map((t, i) => (
            <button
              key={t.url}
              onClick={() => pick(i)}
              className={`w-full text-left px-3 py-2 text-xs font-mono truncate transition-colors ${
                i === idx ? "bg-laranja/20 text-laranja" : "text-creme-soft hover:text-creme hover:bg-grafite-3/40"
              }`}
            >
              {i === idx ? "▶ " : ""}{t.nome}
            </button>
          ))}
        </div>
      )}

      {/* controles compactos */}
      <div className="flex items-center gap-1 bg-grafite-2/90 border-2 border-grafite-3 rounded-full backdrop-blur px-1.5 py-1">
        {/* play/pause — sempre visível */}
        <button
          onClick={togglePlay}
          aria-label={playing ? "pausar" : "tocar"}
          className="w-7 h-7 rounded-full flex items-center justify-center text-sm active:scale-90 transition-transform text-creme hover:text-laranja"
        >
          {playing && !muted ? "⏸" : "▶"}
        </button>

        {tracks.length > 1 && (
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="playlist"
            className="max-w-[80px] truncate px-2 py-1 text-[10px] font-mono text-creme-soft hover:text-creme transition-colors"
          >
            {atual?.nome}
          </button>
        )}
        {tracks.length > 1 && (
          <button
            onClick={nextTrack}
            aria-label="próxima faixa"
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm text-creme-soft hover:text-creme active:scale-90 transition-all"
          >
            ⏭
          </button>
        )}
        <button
          onClick={toggleMute}
          aria-label={muted ? "ativar som" : "silenciar"}
          className="w-7 h-7 rounded-full flex items-center justify-center text-sm active:scale-90 transition-transform"
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>

      <audio
        ref={ref}
        src={atual?.url}
        preload="auto"
        onEnded={() => setIdx((i) => (i + 1) % tracks.length)}
      />
    </div>
  )
}
