"use client"

import { useRef, useState, type ReactNode } from "react"
import { motion, useScroll, useTransform, useMotionValueEvent, useReducedMotion } from "framer-motion"

// Sticky-graphic scroller (padrão NYT/The Pudding): um gráfico fica fixo enquanto
// os passos de texto rolam ao lado. UM só useScroll por stage (não por passo) —
// deriva o passo ativo e só re-renderiza o React na virada de passo. O stage faz
// o dim dos passos internamente (passo ativo aceso, resto apagado).
//
// Mobile (<md): gráfico sticky no topo (~58vh), passos rolam embaixo.
type Props = {
  steps: ReactNode[]
  graphic: (active: number) => ReactNode
  className?: string
}

export default function ScrollyStage({ steps, graphic, className = "" }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [active, setActive] = useState(0)
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] })
  const idx = useTransform(scrollYProgress, (p) => Math.min(steps.length - 1, Math.max(0, Math.floor(p * steps.length))))
  useMotionValueEvent(idx, "change", (v) => setActive(v as number))

  return (
    <div ref={trackRef} className={`relative ${className}`}>
      <div className="md:grid md:grid-cols-2 md:gap-10">
        {/* gráfico fixo */}
        <div className="sticky top-0 z-0 h-[52vh] md:h-screen flex items-center justify-center md:order-2">
          <div className="w-full max-w-md mx-auto">{graphic(active)}</div>
        </div>
        {/* passos de texto */}
        <div className="relative z-10 md:order-1">
          {steps.map((s, i) => (
            <div key={i} className="min-h-[62vh] md:min-h-[78vh] flex items-center">
              <motion.div
                animate={reduce ? undefined : { opacity: i === active ? 1 : 0.26, filter: i === active ? "blur(0px)" : "blur(0.6px)" }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[42ch]">
                {s}
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
