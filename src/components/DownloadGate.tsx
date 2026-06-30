"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

// Rodapé de /apresentacao: dados abertos (público, de-identificado) + microdados
// completos atrás de senha (texto livre incluso). POST → blob → download.
const PUBLICOS = [
  { href: "/exports/ozipa_formularios.csv", label: "pesquisa · csv" },
  { href: "/exports/ozipa_formularios.json", label: "pesquisa · json" },
  { href: "/exports/ozipa_avaliacoes.csv", label: "avaliação · csv" },
  { href: "/exports/ozipa_avaliacoes.json", label: "avaliação · json" },
]

const COMPLETOS: { dataset: "formularios" | "avaliacoes"; format: "csv" | "json"; label: string }[] = [
  { dataset: "formularios", format: "csv", label: "pesquisa · csv" },
  { dataset: "formularios", format: "json", label: "pesquisa · json" },
  { dataset: "avaliacoes", format: "csv", label: "avaliação · csv" },
  { dataset: "avaliacoes", format: "json", label: "avaliação · json" },
]

export default function DownloadGate() {
  const [aberto, setAberto] = useState(false)
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState<string | null>(null)

  async function baixar(dataset: "formularios" | "avaliacoes", format: "csv" | "json") {
    setErro("")
    setCarregando(dataset + format)
    try {
      const res = await fetch("/api/apresentacao/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: senha, dataset, format }),
      })
      if (res.status === 401) { setErro("senha incorreta"); return }
      if (!res.ok) { setErro("falha ao gerar arquivo"); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `ozipa_${dataset}_completo.${format}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      setErro("erro de rede")
    } finally {
      setCarregando(null)
    }
  }

  return (
    <div className="mt-10 border-t border-grafite-3 pt-6">
      {/* dados abertos — público */}
      <p className="brand-label text-[9px] text-creme-soft/40 mb-2">dados abertos · CC BY-SA 4.0 · sem texto livre</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {PUBLICOS.map((p) => (
          <a key={p.href} href={p.href} download
            className="brand-label text-[10px] text-creme-soft/70 border border-grafite-3 rounded-md px-2.5 py-1.5 hover:border-creme/30 hover:text-creme transition-colors">
            {p.label}
          </a>
        ))}
      </div>

      {/* microdados completos — equipe (senha) */}
      <button onClick={() => setAberto((v) => !v)}
        className="brand-label text-[10px] text-creme-soft/40 hover:text-creme-soft transition-colors">
        {aberto ? "▾" : "▸"} baixar microdados completos (equipe)
      </button>

      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden">
            <div className="mt-3 bg-grafite-2 border border-grafite-3 rounded-xl p-4 max-w-md">
              <p className="text-creme-soft/60 text-[11px] mb-3 leading-relaxed">
                Inclui respostas em texto livre. Uso restrito à equipe — anônimo, mas sensível (LGPD).
              </p>
              <input
                type="password"
                value={senha}
                onChange={(e) => { setSenha(e.target.value); setErro("") }}
                placeholder="senha"
                className="w-full bg-grafite border border-grafite-3 rounded-md px-3 py-2 text-creme text-sm mb-3 focus:border-laranja outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                {COMPLETOS.map((c) => (
                  <button
                    key={c.dataset + c.format}
                    onClick={() => baixar(c.dataset, c.format)}
                    disabled={!senha || carregando !== null}
                    className="brand-label text-[10px] text-grafite bg-creme-soft rounded-md px-2.5 py-2 hover:bg-creme transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    {carregando === c.dataset + c.format ? "…" : c.label}
                  </button>
                ))}
              </div>
              {erro && <p className="text-vermelho text-[11px] mt-3">{erro}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
