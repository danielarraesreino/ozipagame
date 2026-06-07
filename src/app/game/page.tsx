"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { dilemas as hardcoded } from "@/lib/dilemas"
import { dilemas as gerados } from "@/lib/dilemas_gerados"
import { loadPlayer, loadRespostas, saveRespostas, isPosOficinaUnlocked } from "@/lib/store"
import type { RespostasMap } from "@/lib/store"
import SwipeCard from "@/components/SwipeCard"
import ConsequenceScreen from "@/components/ConsequenceScreen"
import VideoScreen from "@/components/VideoScreen"
import { fetchImportados, fetchAtivos } from "@/lib/cards"
import { AnimatePresence, motion } from "framer-motion"
import Logo from "@/components/Logo"
import AudioBg from "@/components/AudioBg"
import FormularioFinal from "@/components/FormularioFinal"

type Phase = "swipe" | "consequence" | "video" | "end"

interface CardResult {
  modulo: string
  dilemaId: string
  choice: "right" | "left"
  status?: string
}

const STATUS_LABEL: Record<string, string> = {
  falso: "❌ falso",
  enganoso: "⚠️ enganoso",
  contexto_ausente: "🔍 sem contexto",
  verdadeiro: "✅ verdadeiro",
}

function buildDilemas() {
  const todos = [...hardcoded, ...gerados]
  const desbloqueado = isPosOficinaUnlocked()
  return todos.filter((d) => !d.fase || d.fase === 1 || (d.fase === 2 && desbloqueado))
}

// ── Tela de resultado ──────────────────────────────────────────────────────────

function EndScreen({
  player, results, respostas1, onReplay,
}: {
  player: { apelido: string; bairro: string }
  results: CardResult[]
  respostas1: RespostasMap
  onReplay: () => void
}) {
  const statusCount: Record<string, number> = {}
  const moduloSet = new Set<string>()
  let discordou = 0

  for (const r of results) {
    if (r.status) statusCount[r.status] = (statusCount[r.status] ?? 0) + 1
    moduloSet.add(r.modulo)
    if (r.choice === "left") discordou++
  }

  // Mirror: detecta mudanças de opinião em relação à fase 1
  const mudancas: { de: string; para: string; meme: string }[] = []
  const todosD = buildDilemas()
  for (const r of results) {
    const dilema = todosD.find((d) => d.id === r.dilemaId)
    if (dilema?.espelho_de && respostas1[dilema.espelho_de]) {
      const antes = respostas1[dilema.espelho_de]
      const depois = r.choice
      if (antes !== depois) {
        mudancas.push({
          de: antes === "right" ? "concordou" : "discordou",
          para: depois === "right" ? "concordou" : "discordou",
          meme: dilema.meme.replace(/^"/, "").replace(/"$/, ""),
        })
      }
    }
  }

  const topStatus = Object.entries(statusCount).sort((a, b) => b[1] - a[1])

  // Registra a partida anônima (sem apelido) uma única vez ao chegar no fim.
  const tracked = useRef(false)
  useEffect(() => {
    if (tracked.current || results.length === 0) return
    tracked.current = true
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bairro: player.bairro, qtd_discordou: discordou, results }),
    }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const whatsappText = encodeURIComponent(
    `Joguei Vozes do Oziel 🎮\n` +
    `${results.length} dilemas do bairro analisados.\n` +
    topStatus.map(([s, n]) => `${STATUS_LABEL[s] ?? s}: ${n}`).join(" · ") +
    (mudancas.length ? `\n\nMudei de ideia ${mudancas.length}x depois da oficina.` : "") +
    `\n\nVocê também sabe mais do que pensa 👇\nhttps://jogoozipa.vercel.app`
  )

  return (
    <main className="bg-halftone bg-halftone-veil h-full overflow-y-auto no-scrollbar">
      <div className="relative z-10 min-h-full flex flex-col px-4 py-8 max-w-md mx-auto">
        <motion.div
          className="flex flex-col flex-1 justify-between"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Logo size={32} variant="cor" />
              <p className="brand-stamp text-[10px] text-laranja">
                você chegou até aqui
              </p>
            </div>
            <h2 className="brand-lockup text-creme text-[clamp(2.5rem,12vw,3.5rem)] mb-3">
              {player.bairro}
              <br />
              <span className="text-laranja">tem voz.</span>
            </h2>
            <p className="text-creme-soft leading-relaxed mb-6 max-w-[36ch]">
              Cada escolha nesse jogo acontece de verdade no bairro.
              Você já sabe mais do que a maioria.
            </p>

            {/* Mirror — epifania de mudança */}
            {mudancas.length > 0 && (
              <motion.div
                className="bg-verde/10 border-2 border-verde/40 rounded-2xl p-5 mb-6"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="brand-stamp text-[10px] text-verde mb-3">
                  você evoluiu
                </p>
                {mudancas.map((m, i) => (
                  <p key={i} className="text-creme text-sm leading-relaxed mb-2">
                    Antes da oficina você <strong>{m.de}</strong> com{" "}
                    <em>"{m.meme}"</em>. Hoje você <strong>{m.para}</strong>.
                  </p>
                ))}
                <p className="text-verde text-xs font-mono mt-3">
                  isso é o que a informação faz — muda o que a gente pensa.
                </p>
              </motion.div>
            )}

            {/* Stats */}
            <div className="grain relative bg-grafite-2 border-2 border-grafite-3 rounded-2xl p-5 space-y-3 zine-edge">
              <p className="brand-stamp text-[10px] text-creme-soft mb-4">
                seu resumo
              </p>
              <div className="flex justify-between">
                <span className="text-creme-soft text-sm">dilemas vistos</span>
                <span className="text-creme brand-lockup text-xl">{results.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-creme-soft text-sm">vezes que discordou</span>
                <span className="text-creme brand-lockup text-xl">{discordou}</span>
              </div>
              {topStatus.map(([s, n]) => (
                <div key={s} className="flex justify-between">
                  <span className="text-creme-soft text-sm">{STATUS_LABEL[s] ?? s}</span>
                  <span className="text-creme brand-lockup text-xl">{n}</span>
                </div>
              ))}
              {mudancas.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-creme-soft text-sm">mudanças de opinião</span>
                  <span className="text-verde brand-lockup text-xl">{mudancas.length}</span>
                </div>
              )}
              {moduloSet.size > 0 && (
                <div className="pt-2 border-t-2 border-grafite-3">
                  <span className="text-creme-soft/70 text-xs font-mono">
                    módulos: {[...moduloSet].join(" · ")}
                  </span>
                </div>
              )}
            </div>

            {/* Pesquisa qualitativa anônima */}
            <div className="mt-6">
              <FormularioFinal bairro={player.bairro} />
            </div>
          </div>

          <div className="space-y-3 mt-8">
            <a
              href={`https://wa.me/?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="zine-edge flex items-center justify-center gap-2 w-full py-4 bg-laranja text-grafite brand-lockup text-2xl rounded-xl active:scale-95 active:shadow-none transition-all"
            >
              compartilhar no WhatsApp
            </a>
            <button
              onClick={onReplay}
              className="w-full py-4 border-2 border-grafite-3 text-creme-soft font-bold text-base rounded-xl hover:border-laranja hover:text-creme active:scale-95 transition-all"
            >
              jogar de novo
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  )
}

// ── Game ──────────────────────────────────────────────────────────────────────

export default function GamePage() {
  const router = useRouter()
  const [player, setPlayer] = useState<{ apelido: string; bairro: string } | null>(null)
  const [dilemas, setDilemas] = useState(() => buildDilemas())
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>("swipe")
  const [lastChoice, setLastChoice] = useState<"right" | "left">("right")
  const [cardKey, setCardKey] = useState(0)
  const [results, setResults] = useState<CardResult[]>([])
  const [respostas1] = useState<RespostasMap>(() => loadRespostas(1))
  const [respostasAtuais, setRespostasAtuais] = useState<RespostasMap>({})

  useEffect(() => {
    const p = loadPlayer()
    if (!p) router.replace("/")
    else setPlayer(p)
  }, [router])

  // Monta a lista final no runtime (sem rebuild): cards fixos + importados,
  // filtrando por fase (pós-oficina trava sem código) e por ocultar/mostrar do
  // admin (cards_ativos.json). Ausente no mapa = ativo; só sai com false.
  useEffect(() => {
    const desbloqueado = isPosOficinaUnlocked()
    const faseOk = (d: { fase?: 1 | 2 }) =>
      !d.fase || d.fase === 1 || (d.fase === 2 && desbloqueado)

    Promise.all([fetchImportados(), fetchAtivos()]).then(([extras, ativos]) => {
      const base = [...hardcoded, ...gerados].filter(
        (d) => faseOk(d) && ativos[d.id] !== false,
      )
      const ids = new Set(base.map((d) => d.id))
      const novos = extras.filter((d) => !ids.has(d.id) && faseOk(d))
      setDilemas([...base, ...novos])
    })
  }, [])

  useEffect(() => {
    fetch("/video_urls.json")
      .then((r) => (r.ok ? r.json() : {}))
      .then((map: Record<string, string>) => {
        for (const d of dilemas) {
          if (map[d.id]) d.video_url = map[d.id]
        }
      })
      .catch(() => {})
  }, [dilemas])

  function handleSwipe(direction: "right" | "left") {
    setLastChoice(direction)
    setPhase("consequence")
  }

  function handleConsequenceNext() {
    const d = dilemas[index]
    const novasRespostas = { ...respostasAtuais, [d.id]: lastChoice }
    setRespostasAtuais(novasRespostas)

    const r: CardResult = { modulo: d.modulo, dilemaId: d.id, choice: lastChoice, status: d.verificacao_status }
    setResults((prev) => [...prev, r])

    if (d.video_url) {
      setPhase("video")
    } else {
      advanceCard()
    }
  }

  function advanceCard() {
    if (index + 1 >= dilemas.length) {
      // Salva respostas antes de ir para a tela final
      const fase1Ids = dilemas.filter((d) => !d.fase || d.fase === 1).map((d) => d.id)
      const rf1: RespostasMap = {}
      for (const [id, v] of Object.entries(respostasAtuais)) {
        if (fase1Ids.includes(id)) rf1[id] = v
      }
      saveRespostas(rf1, 1)
      setPhase("end")
    } else {
      setIndex((i) => i + 1)
      setCardKey((k) => k + 1)
      setPhase("swipe")
    }
  }

  if (!player) return null

  // Trilha de fundo montada uma única vez — toca contínua por todas as fases,
  // incluindo a tela final ("no jogo todo").
  if (phase === "end") {
    return (
      <>
        <AudioBg />
        <EndScreen
          player={player}
          results={results}
          respostas1={respostas1}
          onReplay={() => {
            setIndex(0)
            setCardKey((k) => k + 1)
            setResults([])
            setRespostasAtuais({})
            setPhase("swipe")
          }}
        />
      </>
    )
  }

  const current = dilemas[index]
  const progressIndex = index + (phase !== "swipe" ? 1 : 0)
  const progress = (progressIndex / dilemas.length) * 100

  return (
    <main className="h-full flex flex-col px-4 py-6 max-w-md mx-auto">
      <AudioBg />
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-creme-soft">
          oi, <strong className="text-creme">{player.apelido}</strong>
        </span>
        <span className="brand-stamp text-[11px] text-creme-soft/70">
          {index + 1}/{dilemas.length}
        </span>
      </div>

      <div className="w-full h-1.5 bg-grafite-2 rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-laranja rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

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
              <SwipeCard key={cardKey} dilema={current} onSwipe={handleSwipe} isTop />
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
