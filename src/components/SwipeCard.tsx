"use client"

import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useRef } from "react"
import type { Dilema } from "@/lib/dilemas"

interface Props {
  dilema: Dilema
  onSwipe: (direction: "right" | "left") => void
  isTop: boolean
}

const THRESHOLD = 90

export default function SwipeCard({ dilema, onSwipe, isTop }: Props) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-18, 18])
  const cardOpacity = useTransform(x, [-200, -THRESHOLD, 0, THRESHOLD, 200], [0.6, 1, 1, 1, 0.6])

  const agreeOpacity = useTransform(x, [0, THRESHOLD], [0, 1])
  const disagreeOpacity = useTransform(x, [-THRESHOLD, 0], [1, 0])

  const isDragging = useRef(false)

  async function flyOff(direction: "right" | "left") {
    await animate(x, direction === "right" ? 600 : -600, { duration: 0.3, ease: "easeIn" })
    onSwipe(direction)
  }

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
      <div className="relative h-full flex flex-col justify-between bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-6 shadow-2xl select-none overflow-hidden">

        {/* Module tag */}
        <div className="flex justify-between items-center">
          <span className="text-[10px] tracking-widest uppercase text-[#888] font-mono">
            {dilema.modulo}
          </span>
          <span className="text-[10px] tracking-widest uppercase text-[#555] font-mono">
            arrastar →
          </span>
        </div>

        {/* Agree / Disagree overlays */}
        <motion.div
          className="absolute top-6 left-6 border-4 border-[#2DD4A0] rounded-lg px-3 py-1 pointer-events-none"
          style={{ opacity: agreeOpacity }}
        >
          <span className="text-[#2DD4A0] font-black text-xl tracking-wider">CONCORDO</span>
        </motion.div>
        <motion.div
          className="absolute top-6 right-6 border-4 border-[#E84040] rounded-lg px-3 py-1 pointer-events-none"
          style={{ opacity: disagreeOpacity }}
        >
          <span className="text-[#E84040] font-black text-xl tracking-wider">DISCORDO</span>
        </motion.div>

        {/* Meme text */}
        <div className="flex-1 flex items-center justify-center py-8">
          <p className="text-2xl sm:text-3xl font-bold text-[#F5F0E8] leading-snug text-center">
            {dilema.meme}
          </p>
        </div>

        {/* Bottom hint */}
        <div className="flex justify-between text-xs text-[#555] font-mono">
          <span>← discordo</span>
          <span>concordo →</span>
        </div>
      </div>
    </motion.div>
  )
}
