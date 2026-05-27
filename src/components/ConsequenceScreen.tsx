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
  falso:           { label: "❌ falso",           color: "#E84040" },
  enganoso:        { label: "⚠️ enganoso",        color: "#F59E0B" },
  contexto_ausente:{ label: "🔍 sem contexto",    color: "#888" },
  verdadeiro:      { label: "✅ verdadeiro",       color: "#2DD4A0" },
}

export default function ConsequenceScreen({ dilema, choice, onNext, current, total }: Props) {
  const agreed = choice === "right"
  const moduloCor = MODULO_COR[dilema.modulo] ?? "#888"
  const verif = dilema.verificacao_status ? VERIF_LABEL[dilema.verificacao_status] : null

  return (
    <motion.div
      className="flex flex-col h-full"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Choice badge + module */}
      <div className="mb-6 flex items-center gap-3">
        <span
          className={`inline-block text-xs font-mono tracking-widest uppercase px-3 py-1 rounded-full border ${
            agreed
              ? "border-[#2DD4A0] text-[#2DD4A0]"
              : "border-[#E84040] text-[#E84040]"
          }`}
        >
          {agreed ? "você concordou" : "você discordou"}
        </span>
        <span
          className="text-[10px] font-mono tracking-widest uppercase px-2 py-1 rounded-full"
          style={{ color: moduloCor, border: `1px solid ${moduloCor}` }}
        >
          {dilema.modulo}
        </span>
      </div>

      {/* Original meme */}
      <p className="text-base text-[#888] italic mb-6 leading-relaxed">
        {dilema.meme}
      </p>

      {/* Consequence */}
      <div className="flex-1 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-mono tracking-widest uppercase text-[#E8431E]">
            o que o meme apaga
          </p>
          {verif && (
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
              style={{ color: verif.color, borderColor: verif.color }}
            >
              {verif.label}
            </span>
          )}
        </div>
        <p className="text-lg sm:text-xl text-[#F5F0E8] leading-relaxed">
          {dilema.contexto_oculto}
        </p>
        <p className="text-xs text-[#555] font-mono mt-6">
          fonte: {dilema.fonte}
        </p>
      </div>

      {/* Pílula de sabedoria */}
      {dilema.pilula_sabedoria && (
        <div
          className="rounded-xl px-5 py-4 mb-6"
          style={{ borderLeft: `3px solid ${moduloCor}`, background: "#1C1C1E" }}
        >
          <p className="text-[10px] font-mono tracking-widest uppercase mb-2" style={{ color: moduloCor }}>
            pílula de sabedoria
          </p>
          <p className="text-base text-[#F5F0E8] leading-relaxed">
            {dilema.pilula_sabedoria}
          </p>
        </div>
      )}

      {/* Next button */}
      <button
        onClick={onNext}
        className="w-full py-4 bg-[#E8431E] text-white font-bold text-base rounded-xl active:scale-95 transition-transform"
      >
        {current < total ? "próxima →" : "ver resultado →"}
      </button>
    </motion.div>
  )
}
