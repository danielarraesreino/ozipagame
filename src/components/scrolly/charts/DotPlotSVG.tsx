"use client"

import { motion, useReducedMotion } from "framer-motion"
import { xScale, TICKS_15 } from "./scale"

// Dot plot na escala 1–5: cada linha (faixa etária / bairro) tem N pontos
// (afeta / voz / confiança). Princípio Storytelling-with-Data: cinza em tudo,
// cor só na linha em foco (`highlightIndex`). Eixo 1–5 compartilhado e honesto.
export type Dot = { value: number; color: string; label: string }
export type DotRow = { label: string; sub?: string; dots: Dot[] }

type Props = {
  rows: DotRow[]
  highlightIndex?: number   // linha em foco (vinda do ScrollyStage)
  titulo?: string
  eixo?: [string, string]   // rótulos extremos (1 → 5)
}

const W = 340
const PAD_L = 92
const PAD_R = 22
const X0 = PAD_L
const X1 = W - PAD_R
const ROW_H = 46
const TOP = 54
const GRAY = "#2A2A22"
const GRAY_TXT = "#B8B2A6"

export default function DotPlotSVG({ rows, highlightIndex, titulo, eixo }: Props) {
  const reduce = useReducedMotion()
  const H = TOP + rows.length * ROW_H + 36
  const focado = highlightIndex != null

  return (
    <figure className="w-full" role="img" aria-label={titulo ?? "gráfico de pontos na escala 1 a 5"}>
      {titulo && <figcaption className="brand-label text-[10px] text-creme-soft/70 mb-2 px-1">{titulo}</figcaption>}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* grade 1–5 */}
        {TICKS_15.map((t) => {
          const x = xScale(t, X0, X1)
          return (
            <g key={t}>
              <line x1={x} y1={TOP - 10} x2={x} y2={TOP + rows.length * ROW_H - 18} stroke={GRAY} strokeWidth={1} />
              <text x={x} y={TOP - 16} textAnchor="middle" fontSize={9} fill={GRAY_TXT} fontFamily="var(--font-mono)">{t}</text>
            </g>
          )
        })}
        {eixo && (
          <>
            <text x={X0} y={H - 12} textAnchor="start" fontSize={8} fill={GRAY_TXT} fontFamily="var(--font-mono)">{eixo[0]}</text>
            <text x={X1} y={H - 12} textAnchor="end" fontSize={8} fill={GRAY_TXT} fontFamily="var(--font-mono)">{eixo[1]}</text>
          </>
        )}
        {/* linhas */}
        {rows.map((row, i) => {
          const y = TOP + i * ROW_H + 6
          const on = !focado || i === highlightIndex
          return (
            <motion.g key={row.label} animate={{ opacity: on ? 1 : 0.3 }} transition={{ duration: 0.4 }}>
              <text x={PAD_L - 12} y={y + 4} textAnchor="end" fontSize={11} fontFamily="var(--font-mono)"
                fill={on ? "#F7F1E6" : GRAY_TXT} fontWeight={on && focado ? 700 : 400}>{row.label}</text>
              {row.sub && <text x={PAD_L - 12} y={y + 15} textAnchor="end" fontSize={7.5} fill={GRAY_TXT} fontFamily="var(--font-mono)">{row.sub}</text>}
              {/* trilho */}
              <line x1={X0} y1={y} x2={X1} y2={y} stroke={GRAY} strokeWidth={2} strokeLinecap="round" />
              {/* pontos */}
              {row.dots.map((d, j) => {
                const cx = xScale(d.value, X0, X1)
                return (
                  <motion.circle
                    key={d.label}
                    cx={cx} cy={y} r={5.5}
                    fill={on ? d.color : GRAY_TXT}
                    initial={reduce ? false : { scale: 0, opacity: 0 }}
                    whileInView={reduce ? undefined : { scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: 0.1 * j + 0.04 * i, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformOrigin: `${cx}px ${y}px` }}
                  />
                )
              })}
            </motion.g>
          )
        })}
      </svg>
    </figure>
  )
}
