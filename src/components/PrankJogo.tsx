"use client"

import { useRef, useState } from "react"

const MEMES = ["/memetepeguei.mp4", "/memetepeguei2.mp4", "/meme3.mp4"]

interface Props {
  label?: string
  className?: string
  onBeforePlay?: () => void
}

export default function PrankJogo({ label = "JOGAR AGORA →", className = "", onBeforePlay }: Props) {
  const [fase, setFase] = useState<"idle" | "video" | "got" | "reveal">("idle")
  const [meme] = useState(() => MEMES[Math.floor(Math.random() * MEMES.length)])
  const [muted, setMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  function disparar() {
    onBeforePlay?.()
    setFase("video")
    setTimeout(() => {
      const v = videoRef.current
      if (v) {
        v.muted = false
        v.play().catch(() => { v.muted = true; v.play().catch(() => {}) })
      }
    }, 50)
  }

  function aoTerminarVideo() {
    setFase("got")
    setTimeout(() => setFase("reveal"), 2200)
  }

  return (
    <>
      <button type="button" onClick={disparar} className={className}>
        {label}
      </button>

      {fase !== "idle" && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">

          {fase === "video" && (
            <div className="relative w-full h-full flex items-center justify-center p-6">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                ref={videoRef}
                src={meme}
                playsInline
                autoPlay
                className="max-h-[70vh] max-w-full rounded-2xl object-contain"
                onEnded={aoTerminarVideo}
              />
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = !videoRef.current.muted
                    setMuted(videoRef.current.muted)
                  }
                }}
                className="absolute bottom-6 right-6 px-3 py-2 rounded-full bg-black/60 text-white text-xs font-mono border border-white/20 active:scale-95"
              >
                {muted ? "🔇 som off" : "🔊 som on"}
              </button>
              <button
                onClick={aoTerminarVideo}
                className="absolute bottom-6 left-6 px-3 py-2 rounded-full bg-black/60 text-white/60 text-xs font-mono border border-white/10 active:scale-95"
              >
                pular →
              </button>
            </div>
          )}

          {fase === "got" && (
            <div className="space-y-4 animate-bounce text-center p-6">
              <p className="text-[5rem] leading-none">💀</p>
              <p className="brand-lockup text-laranja text-[clamp(3rem,18vw,5rem)] leading-none">
                VOCÊ<br />CAIU!!
              </p>
              <p className="text-creme-soft font-mono text-sm tracking-widest uppercase">
                não foi dessa vez...
              </p>
            </div>
          )}

          {fase === "reveal" && (
            <div className="max-w-sm w-full space-y-6 p-6 text-center">
              <p className="text-[3rem] leading-none">🎮</p>
              <div className="zine-edge bg-grafite-2 border-2 border-laranja rounded-2xl px-6 py-6 space-y-3 text-left">
                <p className="brand-label text-[10px] text-laranja uppercase tracking-widest">primeiro aprendizado</p>
                <p className="brand-lockup text-creme text-2xl leading-snug">
                  Nem tudo é o que parece.
                </p>
                <p className="text-creme-soft text-sm leading-relaxed">
                  O jogo estará disponível no{" "}
                  <strong className="text-laranja">dia 20 de julho</strong>,
                  no início da primeira turma.{" "}
                  Traz seu celular carregado. 📱
                </p>
              </div>
              <button
                onClick={() => setFase("idle")}
                className="w-full py-3 border-2 border-grafite-3 text-creme/60 brand-lockup text-base rounded-xl hover:border-creme/30 hover:text-creme transition-all active:scale-95"
              >
                ← voltar
              </button>
            </div>
          )}

        </div>
      )}
    </>
  )
}
