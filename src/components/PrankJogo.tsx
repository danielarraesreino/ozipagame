"use client"

import { useState } from "react"

interface Props {
  label?: string
  className?: string
}

export default function PrankJogo({ label = "JOGAR AGORA →", className = "" }: Props) {
  const [fase, setFase] = useState<"idle" | "got" | "reveal">("idle")

  function disparar() {
    setFase("got")
    setTimeout(() => setFase("reveal"), 2200)
  }

  return (
    <>
      <button
        type="button"
        onClick={disparar}
        className={className}
      >
        {label}
      </button>

      {fase !== "idle" && (
        <div className="fixed inset-0 z-50 bg-grafite flex flex-col items-center justify-center p-6 text-center">
          {fase === "got" ? (
            <div className="space-y-4 animate-bounce">
              <p className="text-[5rem] leading-none">💀</p>
              <p className="brand-lockup text-laranja text-[clamp(3rem,18vw,5rem)] leading-none">
                VOCÊ<br />CAIU!!
              </p>
              <p className="text-creme-soft font-mono text-sm tracking-widest uppercase">
                não foi dessa vez...
              </p>
            </div>
          ) : (
            <div className="max-w-sm space-y-6">
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
