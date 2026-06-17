"use client"

import { useEffect, useState } from "react"

const STEPS = [
  {
    emoji: "📝",
    titulo: "Inscrição",
    desc: "Acesse o link, preencha seu nome e escolha sua turma — manhã ou tarde. Leva 1 minuto.",
    cor: "border-laranja",
    tag: "passo 1 de 5",
  },
  {
    emoji: "📱",
    titulo: "Traz o celular",
    desc: "Carregado e com internet. É com ele que você vai jogar no dia 20 de julho na E.E. Parque Oziel.",
    cor: "border-verde",
    tag: "passo 2 de 5",
  },
  {
    emoji: "🎮",
    titulo: "O jogo",
    desc: "Arrasta o card pra direita se concorda, pra esquerda se discorda. Cada escolha tem consequência.",
    cor: "border-laranja",
    tag: "passo 3 de 5",
    demo: true,
  },
  {
    emoji: "🔊",
    titulo: "Som",
    desc: 'Tem trilha sonora! Toca ▶ pra ligar. Use ⏭ pra mudar de faixa e 🔇 pra silenciar quando quiser.',
    cor: "border-verde",
    tag: "passo 4 de 5",
    audio: true,
  },
  {
    emoji: "💬",
    titulo: "Discute",
    desc: "Ao fim do jogo a turma compara as respostas. Sem certo ou errado — tem a tua opinião.",
    cor: "border-laranja",
    tag: "passo 5 de 5",
  },
]

interface Props {
  onClose: () => void
}

export default function TutorialModal({ onClose }: Props) {
  const [step, setStep] = useState(0)
  const [saindo, setSaindo] = useState(false)
  const [entrando, setEntrando] = useState(true)
  const [dir, setDir] = useState<"right" | "left">("right")

  useEffect(() => {
    const t = setTimeout(() => setEntrando(false), 50)
    return () => clearTimeout(t)
  }, [])

  function avancar() {
    if (step < STEPS.length - 1) {
      setDir("left")
      setSaindo(true)
      setTimeout(() => {
        setStep((s) => s + 1)
        setSaindo(false)
        setDir("right")
      }, 220)
    } else {
      fechar()
    }
  }

  function voltar() {
    if (step === 0) return
    setDir("right")
    setSaindo(true)
    setTimeout(() => {
      setStep((s) => s - 1)
      setSaindo(false)
      setDir("left")
    }, 220)
  }

  function fechar() {
    onClose()
  }

  const s = STEPS[step]
  const ultimo = step === STEPS.length - 1

  const slideOut = saindo
    ? dir === "left"
      ? "opacity-0 -translate-x-8"
      : "opacity-0 translate-x-8"
    : "opacity-100 translate-x-0"

  return (
    <div
      className={`fixed inset-0 z-50 bg-grafite/95 backdrop-blur flex flex-col items-center justify-center p-6 transition-opacity duration-300 ${entrando ? "opacity-0" : "opacity-100"}`}
      onClick={fechar}
    >
      <div
        className="w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between mb-6">
          <p className="brand-label text-[10px] text-laranja uppercase tracking-widest">como funciona</p>
          <button onClick={fechar} className="text-creme-soft/60 hover:text-creme text-sm font-mono transition-colors">
            fechar ✕
          </button>
        </div>

        {/* card animado */}
        <div
          className={`transition-all duration-200 ease-out ${slideOut}`}
        >
          <div className={`bg-grafite-2 border-2 ${s.cor} rounded-2xl px-6 py-7 mb-6 space-y-4 zine-edge`}>
            <div className="flex items-start gap-4">
              <span className="text-5xl leading-none">{s.emoji}</span>
              <div>
                <p className="brand-label text-[9px] text-creme/40 uppercase tracking-widest mb-1">{s.tag}</p>
                <p className="brand-lockup text-creme text-2xl leading-tight">{s.titulo}</p>
              </div>
            </div>

            <p className="text-creme text-base leading-relaxed">{s.desc}</p>

            {/* demo de swipe */}
            {s.demo && (
              <div className="flex items-center justify-center gap-4 py-2">
                <span className="text-verde text-sm font-mono animate-pulse">← discorda</span>
                <div className="w-12 h-16 bg-laranja/20 border-2 border-laranja/40 rounded-xl flex items-center justify-center text-2xl rotate-2">
                  🃏
                </div>
                <span className="text-laranja text-sm font-mono animate-pulse">concorda →</span>
              </div>
            )}

            {/* demo do player */}
            {s.audio && (
              <div className="flex items-center gap-2 bg-grafite border border-grafite-3 rounded-full px-3 py-2 w-fit">
                <span className="text-laranja text-sm">▶</span>
                <span className="text-creme-soft text-xs font-mono truncate max-w-[80px]">faixa 1</span>
                <span className="text-creme-soft text-sm">⏭</span>
                <span className="text-creme-soft text-sm">🔊</span>
              </div>
            )}
          </div>
        </div>

        {/* dots de progresso */}
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDir(i > step ? "left" : "right")
                setSaindo(true)
                setTimeout(() => { setStep(i); setSaindo(false) }, 220)
              }}
              className={`rounded-full transition-all duration-300 ${
                i === step
                  ? "w-6 h-2 bg-laranja"
                  : "w-2 h-2 bg-grafite-3 hover:bg-creme/30"
              }`}
            />
          ))}
        </div>

        {/* botões nav */}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={voltar}
              className="flex-1 py-3 border-2 border-grafite-3 text-creme/60 brand-lockup text-base rounded-xl hover:border-creme/30 hover:text-creme transition-all active:scale-95"
            >
              ← voltar
            </button>
          )}
          <button
            onClick={avancar}
            className={`flex-1 py-3 brand-lockup text-base rounded-xl active:scale-95 active:shadow-none transition-all ${
              ultimo
                ? "zine-edge bg-laranja text-grafite"
                : "bg-laranja/90 text-grafite hover:bg-laranja"
            }`}
          >
            {ultimo ? "entendido! →" : "próximo →"}
          </button>
        </div>
      </div>
    </div>
  )
}
