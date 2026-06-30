"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

// fala usando a voz do navegador (Web Speech API). Disparada por gesto do
// usuário (clique no download), então o áudio é permitido.
function falar() {
  if (typeof window === "undefined" || !window.speechSynthesis) return
  const synth = window.speechSynthesis
  synth.cancel()
  const pt = new SpeechSynthesisUtterance(
    "Trabalho entregue. Nem sempre foi legal estar com vocês, mas o resultado aconteceu. Especialmente se a preocupação era entregar um ême-vê-pê-zinho e dados de realidade. Enjoy it!",
  )
  pt.lang = "pt-BR"; pt.rate = 1; pt.pitch = 1
  const de = new SpeechSynthesisUtterance("Die unglaubliche, fantastische... BANF!")
  de.lang = "de-DE"; de.rate = 0.95; de.pitch = 0.85
  synth.speak(pt)
  synth.speak(de)
}

// Rodapé de /apresentacao: dados abertos (público, de-identificado) + microdados
// brutos completos atrás de senha (pra Jansen). Simples — POST com senha → blob.
const PUBLICOS = [
  { href: "/exports/ozipa_formularios.csv", label: "pesquisa · csv" },
  { href: "/exports/ozipa_formularios.json", label: "pesquisa · json" },
  { href: "/exports/ozipa_avaliacoes.csv", label: "avaliação · csv" },
  { href: "/exports/ozipa_avaliacoes.json", label: "avaliação · json" },
]

type Combo = { dataset: "formularios" | "avaliacoes"; format: "csv" | "json"; label: string }
const COMPLETOS: Combo[] = [
  { dataset: "formularios", format: "csv", label: "pesquisa · csv" },
  { dataset: "formularios", format: "json", label: "pesquisa · json" },
  { dataset: "avaliacoes", format: "csv", label: "avaliação · csv" },
  { dataset: "avaliacoes", format: "json", label: "avaliação · json" },
]

// Noturno — ilustração original (azul, chifres, orelhas pontudas, auréola de
// santo, olhos dourados). Cara de demônio, ações de santo.
function Noturno({ size = 96 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.16} viewBox="0 0 120 140" role="img" aria-label="Noturno — cara de demônio, coração de santo" className="shrink-0">
      <ellipse cx="60" cy="16" rx="30" ry="7" fill="none" stroke="#FFD21E" strokeWidth="4" />
      <path d="M88 108 q34 2 27 -32 q-3 -13 -14 -9" fill="none" stroke="#2b7fd4" strokeWidth="5" strokeLinecap="round" />
      <path d="M99 60 l9 -5 l-2 11 z" fill="#2b7fd4" />
      <path d="M34 56 L 18 41 L 39 63 Z" fill="#2b7fd4" />
      <path d="M86 56 L 102 41 L 81 63 Z" fill="#2b7fd4" />
      <path d="M46 38 q-5 -15 4 -22 q-1 13 3 19 z" fill="#1b5fa8" />
      <path d="M74 38 q5 -15 -4 -22 q1 13 -3 19 z" fill="#1b5fa8" />
      <path d="M60 34 C 29 34, 27 72, 40 98 C 49 116, 71 116, 80 98 C 93 72, 91 34, 60 34 Z" fill="#2b7fd4" />
      <ellipse cx="50" cy="66" rx="6.5" ry="7.5" fill="#FFD21E" />
      <ellipse cx="70" cy="66" rx="6.5" ry="7.5" fill="#FFD21E" />
      <circle cx="50.5" cy="67" r="2" fill="#13130E" />
      <circle cx="69.5" cy="67" r="2" fill="#13130E" />
      <path d="M47 86 Q60 97 73 86" fill="none" stroke="#13130E" strokeWidth="3" strokeLinecap="round" />
      <path d="M54 88 l2 5 l2 -5 z" fill="#F7F1E6" />
      <path d="M64 88 l2 5 l2 -5 z" fill="#F7F1E6" />
    </svg>
  )
}

// Estouro de quadrinho — o "BANF!" do teleporte do Noturno (arte original).
function ComicBurst() {
  return (
    <div className="relative inline-block mt-1">
      <motion.svg
        viewBox="0 0 200 200" width="210" height="210"
        initial={{ scale: 0, rotate: -18 }} animate={{ scale: 1, rotate: -4 }}
        transition={{ type: "spring", stiffness: 260, damping: 13, delay: 0.35 }}>
        <polygon
          points="100,4 119,52 152,26 140,74 196,68 152,100 192,134 140,120 160,176 116,138 104,198 88,138 52,180 70,120 14,136 58,98 10,66 66,72 46,20 92,54"
          fill="#FFD21E" stroke="#EA5B1E" strokeWidth="5" strokeLinejoin="round" />
      </motion.svg>
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 12, delay: 0.5 }}>
        <span className="brand-lockup text-grafite text-5xl md:text-6xl -rotate-6 select-none">BANF!</span>
      </motion.div>
    </div>
  )
}

export default function DownloadGate() {
  const [aberto, setAberto] = useState(false)
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState<string | null>(null)
  const [baixou, setBaixou] = useState(false)

  // quando entrega, o Noturno fala (voz do navegador)
  useEffect(() => { if (baixou) falar() }, [baixou])

  async function baixarUm(c: Combo): Promise<boolean> {
    const res = await fetch("/api/apresentacao/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: senha, dataset: c.dataset, format: c.format }),
    })
    if (res.status === 401) { setErro("senha incorreta"); return false }
    if (!res.ok) { setErro("falha ao gerar arquivo"); return false }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ozipa_${c.dataset}_completo.${c.format}`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    return true
  }

  async function baixar(c: Combo) {
    setErro(""); setCarregando(c.dataset + c.format)
    try { if (await baixarUm(c)) setBaixou(true) }
    catch { setErro("erro de rede") }
    finally { setCarregando(null) }
  }

  async function baixarTudo() {
    setErro(""); setCarregando("tudo")
    try {
      for (const c of COMPLETOS) {
        const ok = await baixarUm(c)
        if (!ok) return
        await new Promise((r) => setTimeout(r, 400)) // evita o browser bloquear downloads múltiplos
      }
      setBaixou(true)
    } catch { setErro("erro de rede") }
    finally { setCarregando(null) }
  }

  return (
    <div className="mt-10 border-t border-grafite-3 pt-6">
      {/* dados abertos — público */}
      <p className="brand-label text-[9px] text-creme-soft/70 mb-2">dados abertos · CC BY-SA 4.0 · sem texto livre</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {PUBLICOS.map((p) => (
          <a key={p.href} href={p.href} download
            className="brand-label text-[10px] text-creme-soft border border-grafite-3 rounded-md px-2.5 py-1.5 hover:border-creme/30 hover:text-creme transition-colors">
            {p.label}
          </a>
        ))}
      </div>

      {/* microdados brutos — equipe (senha) */}
      <button onClick={() => setAberto((v) => !v)}
        className="brand-label text-[11px] text-creme-soft hover:text-creme transition-colors">
        {aberto ? "▾" : "▸"} baixar microdados brutos (equipe)
      </button>

      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden">
            <div className="mt-4 bg-grafite-2 border border-grafite-3 rounded-2xl p-5 max-w-lg">
              {!baixou ? (
                <>
                  {/* Noturno explica a senha */}
                  <div className="flex items-start gap-3 mb-4">
                    <Noturno size={84} />
                    <div className="relative bg-grafite border border-grafite-3 rounded-xl p-3 text-creme-soft text-[13px] leading-relaxed">
                      <span className="absolute -left-2 top-4 w-3 h-3 bg-grafite border-l border-b border-grafite-3 rotate-45" />
                      A senha é <strong className="text-amarelo">o nome dela</strong>. Cara de capeta,
                      coração de santo — igual a mim. Digita e leva os dados <strong className="text-creme">brutos, todos</strong>.
                      Tem texto livre aí dentro: trata com respeito. <span className="text-creme/60">(vai com Deus — e com o diabo.)</span>
                    </div>
                  </div>
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => { setSenha(e.target.value); setErro("") }}
                    placeholder="senha"
                    className="w-full bg-grafite border border-grafite-3 rounded-md px-3 py-2.5 text-creme text-sm mb-3 focus:border-laranja outline-none"
                  />
                  <button
                    onClick={baixarTudo}
                    disabled={!senha || carregando !== null}
                    className="w-full brand-lockup text-grafite bg-amarelo rounded-lg px-4 py-3 text-base hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed mb-3">
                    {carregando === "tudo" ? "baixando…" : "baixar TUDO (bruto)"}
                  </button>
                  <p className="brand-label text-[9px] text-creme-soft/70 mb-2">…ou um por um</p>
                  <div className="grid grid-cols-2 gap-2">
                    {COMPLETOS.map((c) => (
                      <button
                        key={c.dataset + c.format}
                        onClick={() => baixar(c)}
                        disabled={!senha || carregando !== null}
                        className="brand-label text-[10px] text-grafite bg-creme-soft rounded-md px-2.5 py-2 hover:bg-creme transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        {carregando === c.dataset + c.format ? "…" : c.label}
                      </button>
                    ))}
                  </div>
                  {erro && <p className="text-vermelho text-[12px] mt-3">{erro}</p>}
                </>
              ) : (
                /* mensagem de entrega — aparece depois do download */
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-2">
                  <div className="flex justify-center mb-3"><Noturno size={104} /></div>
                  <p className="brand-lockup text-2xl md:text-3xl text-amarelo mb-3">trabalho entregue</p>
                  <p className="text-creme-soft text-[15px] leading-relaxed max-w-[40ch] mx-auto">
                    Nem sempre foi legal estar com vocês — mas o resultado aconteceu.
                    Especialmente se a preocupação era entregar um <strong className="text-creme">MVPzinho</strong> e
                    dados de realidade.
                  </p>
                  <p className="brand-lockup text-xl text-laranja mt-4">Enjoy it!</p>

                  {/* tira de quadrinho — teleporte do Noturno */}
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
                    className="brand-lockup italic text-amarelo text-base md:text-lg mt-8">
                    Die unglaubliche, fantastische…
                  </motion.p>
                  <ComicBurst />

                  <div className="flex items-center justify-center gap-4 mt-4">
                    <button onClick={falar} className="brand-label text-[10px] text-creme-soft hover:text-creme transition-colors">🔊 ouvir de novo</button>
                    <button onClick={() => setBaixou(false)} className="brand-label text-[10px] text-creme-soft/70 hover:text-creme transition-colors">↺ baixar de novo</button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
