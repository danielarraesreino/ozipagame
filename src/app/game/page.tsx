"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { dilemas as hardcoded } from "@/lib/dilemas"
import { dilemas as gerados } from "@/lib/dilemas_gerados"
import { loadPlayer } from "@/lib/store"
import SwipeCard from "@/components/SwipeCard"
import ConsequenceScreen from "@/components/ConsequenceScreen"
import VideoScreen from "@/components/VideoScreen"
import { AnimatePresence, motion } from "framer-motion"

const dilemas = [...hardcoded, ...gerados]

type Phase = "swipe" | "consequence" | "video" | "end"

interface CardResult {
  modulo: string
  choice: "right" | "left"
  status?: string
}

const STATUS_LABEL: Record<string, string> = {
  falso: "❌ falso",
  enganoso: "⚠️ enganoso",
  contexto_ausente: "🔍 sem contexto",
  verdadeiro: "✅ verdadeiro",
}

export default function GamePage() {
  const router = useRouter()
  const [player, setPlayer] = useState<{ apelido: string; bairro: string } | null>(null)
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>("swipe")
  const [lastChoice, setLastChoice] = useState<"right" | "left">("right")
  const [cardKey, setCardKey] = useState(0)
  const [results, setResults] = useState<CardResult[]>([])

  useEffect(() => {
    const p = loadPlayer()
    if (!p) router.replace("/")
    else setPlayer(p)
  }, [router])

  // Busca video_urls do Supabase e injeta nos dilemas
  useEffect(() => {
    fetch("/api/videos")
      .then((r) => r.json())
      .then((map: Record<string, string>) => {
        for (const d of dilemas) {
          if (map[d.id]) d.video_url = map[d.id]
        }
      })
      .catch(() => {})
  }, [])

  function handleSwipe(direction: "right" | "left") {
    setLastChoice(direction)
    setPhase("consequence")
  }

  function handleConsequenceNext() {
    const d = dilemas[index]
    setResults((prev) => [
      ...prev,
      { modulo: d.modulo, choice: lastChoice, status: d.verificacao_status },
    ])
    if (d.video_url) {
      setPhase("video")
    } else {
      advanceCard()
    }
  }

  function advanceCard() {
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
  const progressIndex = index + (phase !== "swipe" ? 1 : 0)
  const progress = (progressIndex / dilemas.length) * 100

  // ── Tela de resultado ──────────────────────────────────────────────────────
  if (phase === "end") {
    const statusCount: Record<string, number> = {}
    const moduloSet = new Set<string>()
    let discordou = 0

    for (const r of results) {
      if (r.status) statusCount[r.status] = (statusCount[r.status] ?? 0) + 1
      moduloSet.add(r.modulo)
      if (r.choice === "left") discordou++
    }

    const topStatus = Object.entries(statusCount).sort((a, b) => b[1] - a[1])

    const whatsappText = encodeURIComponent(
      `Joguei Vozes do Oziel 🎮\n` +
      `${results.length} dilemas do bairro analisados.\n` +
      topStatus.map(([s, n]) => `${STATUS_LABEL[s] ?? s}: ${n}`).join(" · ") +
      `\n\nVocê também sabe mais do que pensa 👇\nlocalhost:3000`
    )

    return (
      <main className="h-full flex flex-col px-4 py-8 max-w-md mx-auto">
        <motion.div
          className="flex flex-col flex-1 justify-between"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <p className="text-[11px] font-mono tracking-widest uppercase text-[#E8431E] mb-6">
              você chegou até aqui
            </p>
            <h2 className="text-4xl font-black leading-tight text-[#F5F0E8] mb-2">
              {player.bairro} tem voz.
            </h2>
            <p className="text-[#888] leading-relaxed mb-8">
              Cada escolha nesse jogo acontece de verdade no bairro.
              Você já sabe mais do que a maioria.
            </p>

            {/* Stats */}
            <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-5 space-y-3">
              <p className="text-[10px] font-mono tracking-widest uppercase text-[#555] mb-4">
                seu resumo
              </p>
              <div className="flex justify-between">
                <span className="text-[#888] text-sm">dilemas vistos</span>
                <span className="text-[#F5F0E8] font-bold">{results.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888] text-sm">vezes que discordou</span>
                <span className="text-[#F5F0E8] font-bold">{discordou}</span>
              </div>
              {topStatus.map(([s, n]) => (
                <div key={s} className="flex justify-between">
                  <span className="text-[#888] text-sm">{STATUS_LABEL[s] ?? s}</span>
                  <span className="text-[#F5F0E8] font-bold">{n}</span>
                </div>
              ))}
              {moduloSet.size > 0 && (
                <div className="pt-2 border-t border-[#2C2C2E]">
                  <span className="text-[#555] text-xs font-mono">
                    módulos: {[...moduloSet].join(" · ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 mt-8">
            <a
              href={`https://wa.me/?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-4 bg-[#25D366] text-white font-bold text-base rounded-xl active:scale-95 transition-transform"
            >
              <span>compartilhar no WhatsApp</span>
            </a>
            <button
              onClick={() => {
                setIndex(0)
                setCardKey((k) => k + 1)
                setResults([])
                setPhase("swipe")
              }}
              className="w-full py-4 border border-[#2C2C2E] text-[#888] font-bold text-base rounded-xl active:scale-95 transition-transform"
            >
              jogar de novo
            </button>
          </div>
        </motion.div>
      </main>
    )
  }

  // ── Jogo ──────────────────────────────────────────────────────────────────
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
      <div className="flex-1 relative min-h-0">
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
                onNext={handleConsequenceNext}
                current={index + 1}
                total={dilemas.length}
              />
            </motion.div>
          )}

          {phase === "video" && (
            <motion.div
              key={`video-${index}`}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <VideoScreen
                dilema={current}
                onNext={advanceCard}
                current={index + 1}
                total={dilemas.length}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
