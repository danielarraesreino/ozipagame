"use client"

import { motion } from "framer-motion"
import type { Dilema } from "@/lib/dilemas"
import { MODULO_COR } from "@/lib/dilemas"

interface Props {
  dilema: Dilema
  choice: "right" | "left"
  onNext: () => void
  current: number
  total: number
}

const VERIF_LABEL: Record<string, { label: string; color: string }> = {
  falso:           { label: "❌ falso",           color: "#E8402F" },
  enganoso:        { label: "⚠️ enganoso",        color: "#FFD21E" },
  contexto_ausente:{ label: "🔍 sem contexto",    color: "#B8B2A6" },
  verdadeiro:      { label: "✅ verdadeiro",       color: "#26C79A" },
}

export default function ConsequenceScreen({ dilema, choice, onNext, current, total }: Props) {
  const agreed = choice === "right"
  const moduloCor = MODULO_COR[dilema.modulo] ?? "#B8B2A6"
  const verif = dilema.verificacao_status ? VERIF_LABEL[dilema.verificacao_status] : null

  return (
    <motion.div
      className="flex flex-col h-full no-scrollbar"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Choice badge + module */}
      <div className="mb-6 flex items-center gap-3">
        <span
          className={`inline-block brand-stamp text-xs px-3 py-1 rounded-md ${
            agreed
              ? "bg-verde text-grafite"
              : "bg-vermelho text-creme"
          }`}
        >
          {agreed ? "você concordou" : "você discordou"}
        </span>
        <span
          className="brand-stamp text-[10px] px-2 py-1 rounded-md"
          style={{ color: moduloCor, border: `2px solid ${moduloCor}` }}
        >
          {dilema.modulo}
        </span>
      </div>

      {/* Original meme */}
      <p className="text-base text-creme-soft italic mb-6 leading-relaxed">
        {dilema.meme}
      </p>

      {/* Consequence */}
      <div className="grain relative flex-1 bg-grafite-2 border-2 border-grafite-3 rounded-2xl p-6 mb-6 zine-edge">
        <div className="flex items-center justify-between mb-4">
          <p className="brand-stamp text-[10px] text-laranja">
            o que o meme apaga
          </p>
          {verif && (
            <span
              className="brand-stamp text-[10px] px-2 py-0.5 rounded-md"
              style={{ color: verif.color, border: `2px solid ${verif.color}` }}
            >
              {verif.label}
            </span>
          )}
        </div>
        <p className="text-lg sm:text-xl text-creme leading-relaxed">
          {dilema.contexto_oculto}
        </p>
        <p className="text-xs text-creme-soft/60 font-mono mt-6">
          fonte: {dilema.fonte}
        </p>
      </div>

      {/* Pílula de sabedoria */}
      {dilema.pilula_sabedoria && (
        <div
          className="rounded-xl px-5 py-4 mb-6 bg-grafite-2"
          style={{ borderLeft: `5px solid ${moduloCor}` }}
        >
          <p className="brand-stamp text-[10px] mb-2" style={{ color: moduloCor }}>
            pílula de sabedoria
          </p>
          <p className="text-base text-creme leading-relaxed">
            {dilema.pilula_sabedoria}
          </p>
        </div>
      )}

      {/* Next button */}
      <button
        onClick={onNext}
        className="zine-edge w-full py-4 bg-laranja text-grafite brand-lockup text-2xl rounded-xl active:scale-95 active:shadow-none transition-all"
      >
        {current < total ? "próxima →" : "ver resultado →"}
      </button>
    </motion.div>
  )
}
