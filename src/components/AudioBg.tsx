"use client"

import { useEffect, useRef, useState } from "react"
import { isMuted, setMuted } from "@/lib/sfx"

// Trilha sonora de fundo (rap). Lê a URL de /audio_config.json (mantido pelo
// admin). Toca em loop, baixinho, e só começa depois do primeiro toque do
// jogador — navegadores bloqueiam autoplay com som antes de interação.
// Botão flutuante de mudo controla trilha + efeitos (estado compartilhado).
export default function AudioBg() {
  const ref = useRef<HTMLAudioElement | null>(null)
  const [src, setSrc] = useState<string>("")
  const [muted, setMutedState] = useState(false)

  // estado de mudo inicial + sincroniza com mudanças vindas de outros pontos
  useEffect(() => {
    setMutedState(isMuted())
    const onMute = (e: Event) => setMutedState((e as CustomEvent).detail as boolean)
    window.addEventListener("ozipa-mute", onMute)
    return () => window.removeEventListener("ozipa-mute", onMute)
  }, [])

  // carrega a URL da trilha
  useEffect(() => {
    fetch("/audio_config.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { trilha: "" }))
      .then((cfg) => setSrc(typeof cfg.trilha === "string" ? cfg.trilha : ""))
      .catch(() => {})
  }, [])

  // começa a tocar no primeiro gesto do usuário (regra de autoplay)
  useEffect(() => {
    if (!src) return
    const el = ref.current
    if (!el) return
    el.volume = 0.35

    const tryPlay = () => {
      if (!isMuted()) el.play().catch(() => {})
    }
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
  }, [src])

  // reflete o mudo no elemento de áudio
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.muted = muted
    if (muted) el.pause()
    else if (src) el.play().catch(() => {})
  }, [muted, src])

  if (!src) return null

  function toggle() {
    const next = !muted
    setMuted(next) // persiste + dispara evento
    setMutedState(next)
  }

  return (
    <>
      <audio ref={ref} src={src} loop preload="auto" />
      <button
        onClick={toggle}
        aria-label={muted ? "ativar som" : "silenciar"}
        className="fixed bottom-4 right-4 z-50 w-11 h-11 rounded-full bg-grafite-2/90 border-2 border-grafite-3 backdrop-blur flex items-center justify-center text-lg active:scale-90 transition-transform"
      >
        {muted ? "🔇" : "🔊"}
      </button>
    </>
  )
}
