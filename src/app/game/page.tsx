"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { dilemas } from "@/lib/dilemas"
import { loadPlayer } from "@/lib/store"
import SwipeCard from "@/components/SwipeCard"
import ConsequenceScreen from "@/components/ConsequenceScreen"
import { AnimatePresence, motion } from "framer-motion"

type Phase = "swipe" | "consequence" | "end"

export default function GamePage() {
  const router = useRouter()
  const [player, setPlayer] = useState<{ apelido: string; bairro: string } | null>(null)
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>("swipe")
  const [lastChoice, setLastChoice] = useState<"right" | "left">("right")
  const [cardKey, setCardKey] = useState(0)

  useEffect(() => {
    const p = loadPlayer()
    if (!p) router.replace("/")
    else setPlayer(p)
  }, [router])

  function handleSwipe(direction: "right" | "left") {
    setLastChoice(direction)
    setPhase("consequence")
  }

  function handleNext() {
    if (index + 1 >= dilemas.length) {
      setPhase("end")
    } else {
      setIndex((i) => i + 1)
      setCardKey((k) => k + 1)
      setPhase("swipe")
    }
  }

  if (!player) return null

  const current = dilemas[index]
  const progress = ((index + (phase === "consequence" ? 1 : 0)) / dilemas.length) * 100

  return (
    <main className="h-full flex flex-col px-4 py-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-[#888]">
          oi, <strong className="text-[#F5F0E8]">{player.apelido}</strong>
        </span>
        <span className="text-[11px] font-mono text-[#555]">
          {index + 1}/{dilemas.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-[#1C1C1E] rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-[#E8431E] rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Main area */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {phase === "swipe" && (
            <motion.div
              key={`card-${cardKey}`}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SwipeCard
                key={cardKey}
                dilema={current}
                onSwipe={handleSwipe}
                isTop
              />
            </motion.div>
          )}

          {phase === "consequence" && (
            <motion.div
              key={`consequence-${index}`}
              className="absolute inset-0 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ConsequenceScreen
                dilema={current}
                choice={lastChoice}
                onNext={handleNext}
                current={index + 1}
                total={dilemas.length}
              />
            </motion.div>
          )}

          {phase === "end" && (
            <motion.div
              key="end"
              className="absolute inset-0 flex flex-col justify-center items-center text-center gap-6"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-[11px] font-mono tracking-widest uppercase text-[#E8431E]">
                você chegou até aqui
              </p>
              <h2 className="text-4xl font-black leading-tight text-[#F5F0E8]">
                {player.bairro} tem voz.
              </h2>
              <p className="text-[#888] leading-relaxed max-w-xs">
                Cada escolha nesse jogo acontece de verdade no bairro. Você já sabe mais do que a maioria.
              </p>
              <button
                onClick={() => { setIndex(0); setCardKey((k) => k + 1); setPhase("swipe") }}
                className="mt-4 w-full max-w-xs py-4 bg-[#E8431E] text-white font-bold text-base rounded-xl active:scale-95 transition-transform"
              >
                jogar de novo
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
