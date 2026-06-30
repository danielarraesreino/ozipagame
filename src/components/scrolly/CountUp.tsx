"use client"

import { useEffect, useRef } from "react"
import { motion, useInView, useReducedMotion, useMotionValue, useTransform, animate } from "framer-motion"

// Número que conta de 0 até `to` quando entra na viewport. pt-BR (vírgula
// decimal). Usa MotionValue (sem setState) → zero re-render do React por frame.
// Respeita prefers-reduced-motion (mostra o valor final direto).
type Props = {
  to: number
  decimals?: number
  prefix?: string
  suffix?: string
  signed?: boolean        // mostra "+" em positivos (correlações)
  durationMs?: number
  className?: string
}

const fmt = (v: number, decimals: number, signed: boolean) => {
  const s = v.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  return signed && v > 0 ? `+${s}` : s
}

export default function CountUp({ to, decimals = 0, prefix = "", suffix = "", signed = false, durationMs = 1100, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const reduce = useReducedMotion()
  const mv = useMotionValue(0)
  const text = useTransform(mv, (v) => `${prefix}${fmt(v, decimals, signed)}${suffix}`)

  useEffect(() => {
    if (!inView) return
    if (reduce) { mv.set(to); return }
    const controls = animate(mv, to, { duration: durationMs / 1000, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [inView, reduce, to, durationMs, mv])

  return <motion.span ref={ref} className={className}>{text}</motion.span>
}
