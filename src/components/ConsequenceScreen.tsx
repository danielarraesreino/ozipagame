"use client"

import { motion } from "framer-motion"
import type { Dilema } from "@/lib/dilemas"

interface Props {
  dilema: Dilema
  choice: "right" | "left"
  onNext: () => void
  current: number
  total: number
}

export default function ConsequenceScreen({ dilema, choice, onNext, current, total }: Props) {
  const agreed = choice === "right"

  return (
    <motion.div
      className="flex flex-col h-full"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Choice badge */}
      <div className="mb-6">
        <span
          className={`inline-block text-xs font-mono tracking-widest uppercase px-3 py-1 rounded-full border ${
            agreed
              ? "border-[#2DD4A0] text-[#2DD4A0]"
              : "border-[#E84040] text-[#E84040]"
          }`}
        >
          {agreed ? "você concordou" : "você discordou"}
        </span>
      </div>

      {/* Original meme */}
      <p className="text-base text-[#888] italic mb-6 leading-relaxed">
        {dilema.meme}
      </p>

      {/* Consequence */}
      <div className="flex-1 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-6 mb-6">
        <p className="text-[10px] font-mono tracking-widest uppercase text-[#E8431E] mb-4">
          o que o meme apaga
        </p>
        <p className="text-lg sm:text-xl text-[#F5F0E8] leading-relaxed">
          {dilema.contexto_oculto}
        </p>
        <p className="text-xs text-[#555] font-mono mt-6">
          fonte: {dilema.fonte}
        </p>
      </div>

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
