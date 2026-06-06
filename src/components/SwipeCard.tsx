"use client"

import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useRef } from "react"
import type { Dilema } from "@/lib/dilemas"
import { MODULO_COR } from "@/lib/dilemas"
import { playConcordo, playDiscordo } from "@/lib/sfx"

interface Props {
  dilema: Dilema
  onSwipe: (direction: "right" | "left") => void
  isTop: boolean
}

const THRESHOLD = 90

export default function SwipeCard({ dilema, onSwipe, isTop }: Props) {
  const x = useMotionValue(0)
  const moduloCor = MODULO_COR[dilema.modulo] ?? "#B8B2A6"
  const rotate = useTransform(x, [-200, 200], [-18, 18])
  const cardOpacity = useTransform(x, [-200, -THRESHOLD, 0, THRESHOLD, 200], [0.6, 1, 1, 1, 0.6])

  const agreeOpacity = useTransform(x, [0, THRESHOLD], [0, 1])
  const disagreeOpacity = useTransform(x, [-THRESHOLD, 0], [1, 0])

  const isDragging = useRef(false)

  async function flyOff(direction: "right" | "left") {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(40)
    if (direction === "right") playConcordo()
    else playDiscordo()
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
      <div className="grain relative h-full flex flex-col bg-grafite-2 border-2 border-grafite-3 rounded-2xl zine-edge select-none overflow-hidden">

        {/* Barra superior estilo "print": módulo + cara de post compartilhado */}
        <div className="flex justify-between items-center px-5 pt-4 pb-3 border-b-2 border-grafite-3/60">
          <div className="flex items-center gap-2">
            <span
              className="w-7 h-7 rounded-md flex items-center justify-center text-[12px] brand-lockup text-grafite"
              style={{ backgroundColor: moduloCor }}
            >
              {dilema.modulo.charAt(0).toUpperCase()}
            </span>
            <span
              className="brand-stamp text-[10px]"
              style={{ color: moduloCor }}
            >
              {dilema.modulo}
            </span>
          </div>
          <span className="brand-stamp text-[10px] text-creme-soft/60">
            encaminhada ⤳
          </span>
        </div>

        {/* Overlays Concordo / Discordo */}
        <motion.div
          className="absolute top-16 left-5 z-20 bg-verde rounded-lg px-3 py-1 pointer-events-none -rotate-12 zine-edge"
          style={{ opacity: agreeOpacity }}
        >
          <span className="verdict-stamp text-grafite text-xl">CONCORDO</span>
        </motion.div>
        <motion.div
          className="absolute top-16 right-5 z-20 bg-vermelho rounded-lg px-3 py-1 pointer-events-none rotate-12 zine-edge"
          style={{ opacity: disagreeOpacity }}
        >
          <span className="verdict-stamp text-creme text-xl">DISCORDO</span>
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
            // Sem mídia: estiliza o texto como um print de corrente de WhatsApp
            <div className="w-full max-w-sm select-none">
              {/* topo do "app": grupo + horário */}
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="w-8 h-8 rounded-full bg-verde/90 flex items-center justify-center text-base">👥</span>
                <div className="leading-tight">
                  <p className="text-creme text-sm font-bold">Família ❤️</p>
                  <p className="text-creme-soft/50 text-[10px] font-mono">12 participantes</p>
                </div>
              </div>

              {/* balão da mensagem encaminhada */}
              <div className="relative bg-[#0F2A22] border border-verde/20 rounded-2xl rounded-tl-sm px-4 pt-2.5 pb-2 shadow-[4px_4px_0_0_rgba(0,0,0,0.4)]">
                <div className="flex items-center gap-1 mb-1.5 text-creme-soft/55">
                  <span className="text-[11px]">↪</span>
                  <span className="text-[10px] font-mono italic">Encaminhada muitas vezes</span>
                </div>
                <p className="text-lg sm:text-xl font-bold text-creme leading-snug">
                  {dilema.meme}
                </p>
                <div className="flex items-center justify-end gap-1 mt-2">
                  <span className="text-creme-soft/45 text-[10px] font-mono">09:41</span>
                  <span className="text-[#53BDEB] text-[11px] leading-none">✓✓</span>
                </div>
              </div>

              {/* "digitando" — dá vida de conversa real */}
              <p className="text-creme-soft/40 text-[10px] font-mono mt-2 px-1">
                tio zé está digitando…
              </p>
            </div>
          )}

          {/* Quando há mídia, mostra o texto do meme como legenda embaixo */}
          {temMidia && (
            <p className="text-base font-semibold text-creme leading-snug text-center mt-3 px-2">
              {dilema.meme}
            </p>
          )}
        </div>

        {/* Rodapé: dica de arrastar */}
        <div className="flex justify-between text-xs font-mono px-5 py-3 border-t-2 border-grafite-3/60">
          <span className="text-vermelho">← discordo</span>
          <span className="text-creme-soft/60">arraste o card</span>
          <span className="text-verde">concordo →</span>
        </div>
      </div>
    </motion.div>
  )
}
