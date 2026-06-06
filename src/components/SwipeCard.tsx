"use client"

import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useRef } from "react"
import type { Dilema } from "@/lib/dilemas"
import { MODULO_COR } from "@/lib/dilemas"

interface Props {
  dilema: Dilema
  onSwipe: (direction: "right" | "left") => void
  isTop: boolean
}

const THRESHOLD = 90

export default function SwipeCard({ dilema, onSwipe, isTop }: Props) {
  const x = useMotionValue(0)
  const moduloCor = MODULO_COR[dilema.modulo] ?? "#888"
  const rotate = useTransform(x, [-200, 200], [-18, 18])
  const cardOpacity = useTransform(x, [-200, -THRESHOLD, 0, THRESHOLD, 200], [0.6, 1, 1, 1, 0.6])

  const agreeOpacity = useTransform(x, [0, THRESHOLD], [0, 1])
  const disagreeOpacity = useTransform(x, [-THRESHOLD, 0], [1, 0])

  const isDragging = useRef(false)

  async function flyOff(direction: "right" | "left") {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(40)
    await animate(x, direction === "right" ? 600 : -600, { duration: 0.3, ease: "easeIn" })
    onSwipe(direction)
  }

  // Mídia do meme: vídeo tem prioridade sobre imagem; sem nenhum, cai no "print" de texto.
  const temVideo = !!dilema.meme_video
  const temImagem = !!dilema.meme_imagem
  const temMidia = temVideo || temImagem

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
      style={{ x, rotate, opacity: cardOpacity }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragStart={() => { isDragging.current = true }}
      onDragEnd={(_, info) => {
        isDragging.current = false
        if (info.offset.x > THRESHOLD) flyOff("right")
        else if (info.offset.x < -THRESHOLD) flyOff("left")
        else animate(x, 0, { type: "spring", stiffness: 300, damping: 20 })
      }}
    >
      {/* Card */}
      <div className="relative h-full flex flex-col bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl select-none overflow-hidden">

        {/* Barra superior estilo "print": módulo + cara de post compartilhado */}
        <div className="flex justify-between items-center px-5 pt-4 pb-3 border-b border-[#2C2C2E]/60">
          <div className="flex items-center gap-2">
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-black"
              style={{ backgroundColor: moduloCor }}
            >
              {dilema.modulo.charAt(0).toUpperCase()}
            </span>
            <span
              className="text-[10px] tracking-widest uppercase font-mono"
              style={{ color: moduloCor }}
            >
              {dilema.modulo}
            </span>
          </div>
          <span className="text-[10px] tracking-widest uppercase text-[#555] font-mono">
            encaminhada ⤳
          </span>
        </div>

        {/* Overlays Concordo / Discordo */}
        <motion.div
          className="absolute top-16 left-5 z-20 border-4 border-[#2DD4A0] rounded-lg px-3 py-1 pointer-events-none -rotate-12"
          style={{ opacity: agreeOpacity }}
        >
          <span className="text-[#2DD4A0] font-black text-xl tracking-wider">CONCORDO</span>
        </motion.div>
        <motion.div
          className="absolute top-16 right-5 z-20 border-4 border-[#E84040] rounded-lg px-3 py-1 pointer-events-none rotate-12"
          style={{ opacity: disagreeOpacity }}
        >
          <span className="text-[#E84040] font-black text-xl tracking-wider">DISCORDO</span>
        </motion.div>

        {/* Corpo: mídia do meme OU "print" de texto viral */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 p-4">
          {temVideo ? (
            <video
              src={dilema.meme_video}
              className="max-h-full max-w-full rounded-xl object-contain pointer-events-none"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : temImagem ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dilema.meme_imagem}
              alt={dilema.meme}
              draggable={false}
              className="max-h-full max-w-full rounded-xl object-contain pointer-events-none"
            />
          ) : (
            // Sem mídia: estiliza o texto como um "print" de corrente/post viral
            <div className="w-full max-w-sm rounded-2xl rounded-tl-sm bg-[#0B141A] border border-[#222D34] px-5 py-5 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-[#2C3942] flex items-center justify-center text-xs">👤</span>
                <span className="text-[#8696A0] text-xs font-mono">recebida no grupo</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-[#F5F0E8] leading-snug">
                {dilema.meme}
              </p>
              <div className="flex justify-end mt-3">
                <span className="text-[#8696A0] text-[10px] font-mono">encaminhada muitas vezes ⤳</span>
              </div>
            </div>
          )}

          {/* Quando há mídia, mostra o texto do meme como legenda embaixo */}
          {temMidia && (
            <p className="text-base font-semibold text-[#F5F0E8] leading-snug text-center mt-3 px-2">
              {dilema.meme}
            </p>
          )}
        </div>

        {/* Rodapé: dica de arrastar */}
        <div className="flex justify-between text-xs text-[#555] font-mono px-5 py-3 border-t border-[#2C2C2E]/60">
          <span className="text-[#E84040]/70">← discordo</span>
          <span>arraste o card</span>
          <span className="text-[#2DD4A0]/70">concordo →</span>
        </div>
      </div>
    </motion.div>
  )
}
