"use client"

import { motion, useReducedMotion } from "framer-motion"

// Barras horizontais (HTML + Motion). Storytelling-with-Data: tudo cinza, cor só
// na(s) barra(s) em foco. "sem resposta" sempre por último, em cinza apagado.
export type Par = readonly [string, number]

type Props = {
  data: Par[]
  cor: string
  max?: number
  destaque?: (label: string, i: number) => boolean   // quais barras colorir
  valor?: (n: number) => string                       // formata o número à direita
  className?: string
}

const GRAY = "#2A2A22"
const GRAY_TXT = "#B8B2A6"
const SEM = "sem resposta"

export default function Bars({ data, cor, max, destaque, valor, className = "" }: Props) {
  const reduce = useReducedMotion()
  const teto = max ?? Math.max(1, ...data.map((d) => d[1]))

  return (
    <div className={`space-y-2.5 ${className}`}>
      {data.map(([label, n], i) => {
        const sem = label === SEM
        const on = sem ? false : destaque ? destaque(label, i) : true
        const c = on ? cor : sem ? GRAY : GRAY_TXT
        const pct = Math.max(2, (n / teto) * 100)
        return (
          <div key={label}>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-[13px]" style={{ color: on ? "#F7F1E6" : GRAY_TXT, opacity: sem ? 0.55 : 1 }}>{label}</span>
              <span className="brand-label text-[10px]" style={{ color: c }}>{valor ? valor(n) : n}</span>
            </div>
            <div className="h-2.5 rounded-sm overflow-hidden" style={{ background: GRAY }}>
              <motion.div
                className="h-full rounded-sm"
                style={{ width: `${pct}%`, background: c, transformOrigin: "left" }}
                initial={reduce ? false : { scaleX: 0 }}
                whileInView={reduce ? undefined : { scaleX: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.8, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
