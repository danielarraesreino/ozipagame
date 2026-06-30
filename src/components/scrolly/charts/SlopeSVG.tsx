"use client"

import { motion, useReducedMotion } from "framer-motion"

// Slope chart (antes→depois / mudo→fala): cada par é uma linha ligando dois
// pontos numa escala 1–5. A inclinação = a história. Cor só no que importa.
export type SlopePair = { label: string; a: number; b: number; cor: string; hl?: boolean }

type Props = {
  pares: SlopePair[]
  extremos: [string, string]   // rótulo do ponto A e do ponto B
  titulo?: string
  min?: number
  max?: number
}

const W = 340
const H = 240
const PAD_T = 40
const PAD_B = 40
const XA = 96
const XB = W - 96
const GRAY = "#2A2A22"
const GRAY_TXT = "#B8B2A6"

// y invertido: valor alto em cima
const yFor = (v: number, min: number, max: number) => {
  const t = (v - min) / (max - min)
  return H - PAD_B - t * (H - PAD_T - PAD_B)
}

export default function SlopeSVG({ pares, extremos, titulo, min = 1, max = 5 }: Props) {
  const reduce = useReducedMotion()
  return (
    <figure className="w-full" role="img" aria-label={titulo ?? "gráfico de inclinação"}>
      {titulo && <figcaption className="brand-label text-[10px] text-creme-soft/70 mb-2 px-1">{titulo}</figcaption>}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* eixos verticais A e B */}
        <line x1={XA} y1={PAD_T - 12} x2={XA} y2={H - PAD_B + 12} stroke={GRAY} strokeWidth={1} />
        <line x1={XB} y1={PAD_T - 12} x2={XB} y2={H - PAD_B + 12} stroke={GRAY} strokeWidth={1} />
        <text x={XA} y={PAD_T - 20} textAnchor="middle" fontSize={9} fill={GRAY_TXT} fontFamily="var(--font-mono)">{extremos[0]}</text>
        <text x={XB} y={PAD_T - 20} textAnchor="middle" fontSize={9} fill={GRAY_TXT} fontFamily="var(--font-mono)">{extremos[1]}</text>

        {pares.map((p, i) => {
          const ya = yFor(p.a, min, max)
          const yb = yFor(p.b, min, max)
          const cor = p.hl ? p.cor : GRAY_TXT
          const op = p.hl ? 1 : 0.5
          return (
            <g key={p.label} opacity={op}>
              <motion.line
                x1={XA} y1={ya} x2={XB} y2={yb} stroke={cor} strokeWidth={p.hl ? 3 : 1.5} strokeLinecap="round"
                initial={reduce ? false : { pathLength: 0 }}
                whileInView={reduce ? undefined : { pathLength: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.8, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
              />
              <circle cx={XA} cy={ya} r={4.5} fill={cor} />
              <circle cx={XB} cy={yb} r={4.5} fill={cor} />
              {/* valores nas pontas */}
              <text x={XA - 10} y={ya + 3} textAnchor="end" fontSize={10} fill={cor} fontFamily="var(--font-mono)" fontWeight={p.hl ? 700 : 400}>{p.a.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</text>
              <text x={XB + 10} y={yb + 3} textAnchor="start" fontSize={10} fill={cor} fontFamily="var(--font-mono)" fontWeight={p.hl ? 700 : 400}>{p.b.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</text>
              {/* rótulo do par perto do ponto B */}
              {p.hl && <text x={XB + 10} y={yb - 9} textAnchor="start" fontSize={8} fill={cor} fontFamily="var(--font-mono)">{p.label}</text>}
            </g>
          )
        })}
      </svg>
    </figure>
  )
}
