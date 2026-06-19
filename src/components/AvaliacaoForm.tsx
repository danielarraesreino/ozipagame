"use client"

import { useState } from "react"
import { AVALIACAO, AVALIACAO_INTRO, type Pergunta } from "@/lib/avaliacao"

// Renderiza a Avaliação pós-encontro a partir da config em lib/avaliacao.ts.
// Mesmo visual da PesquisaForm (pills / marca-várias / texto). Anônima.
// Envia pra /api/avaliacao. Nada de conteúdo hardcoded aqui — só apresentação.

interface Props { onDone?: () => void }

function Pills({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o} type="button" onClick={() => onChange(o)}
          className={`px-3 py-2 rounded-full text-sm border-2 transition-all active:scale-95 ${
            value === o ? "bg-laranja text-grafite border-laranja font-bold" : "bg-grafite-2 border-grafite-3 text-creme-soft hover:border-creme-soft/50"
          }`}>{o}</button>
      ))}
    </div>
  )
}

function PillsMulti({ options, values, onToggle }: { options: string[]; values: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = values.includes(o)
        return (
          <button key={o} type="button" onClick={() => onToggle(o)}
            className={`px-3 py-2 rounded-full text-sm border-2 transition-all active:scale-95 ${
              on ? "bg-laranja text-grafite border-laranja font-bold" : "bg-grafite-2 border-grafite-3 text-creme-soft hover:border-creme-soft/50"
            }`}>{on ? "✓ " : ""}{o}</button>
        )
      })}
    </div>
  )
}

function Campo({ label, ajuda, children }: { label: string; ajuda?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="brand-label text-[11px] text-creme-soft mb-2">
        {label}{ajuda && <span className="text-creme-soft/50 normal-case font-normal"> ({ajuda})</span>}
      </p>
      {children}
    </div>
  )
}

export default function AvaliacaoForm({ onDone }: Props) {
  // estado dinâmico: single/texto = string; multi = string[]
  const [single, setSingle] = useState<Record<string, string>>({})
  const [multi, setMulti] = useState<Record<string, string[]>>({})
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState("")

  const setS = (id: string, v: string) => setSingle((m) => ({ ...m, [id]: v }))
  const toggleM = (id: string) => (v: string) =>
    setMulti((m) => {
      const arr = m[id] ?? []
      return { ...m, [id]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] }
    })

  function faltando(): Pergunta | null {
    for (const p of AVALIACAO) {
      if (!p.obrigatoria) continue
      if (p.tipo === "multi") { if (!(multi[p.id]?.length)) return p }
      else if (!single[p.id]?.trim()) return p
    }
    return null
  }

  async function enviar() {
    const falta = faltando()
    if (falta) { setErro(`falta responder: ${falta.label}`); return }
    setErro("")
    setEnviando(true)
    const payload: Record<string, unknown> = {}
    for (const p of AVALIACAO) {
      payload[p.id] = p.tipo === "multi" ? (multi[p.id] ?? []) : (single[p.id] ?? "")
    }
    try {
      const res = await fetch("/api/avaliacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("falha no envio")
      setEnviado(true)
      onDone?.()
    } catch {
      setErro("não rolou enviar — confere a conexão e tenta de novo 🔁")
    }
    setEnviando(false)
  }

  if (enviado) {
    return (
      <div className="bg-verde/10 border-2 border-verde/40 rounded-2xl p-6 text-center">
        <p className="brand-lockup text-verde text-3xl mb-1">valeu! 🙌</p>
        <p className="text-creme-soft text-sm">tua avaliação foi registrada — anônima. obrigado pela real.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <p className="text-creme-soft/80 text-sm leading-relaxed">{AVALIACAO_INTRO}</p>

      {AVALIACAO.map((p) => (
        <Campo key={p.id} label={p.label} ajuda={p.ajuda}>
          {p.tipo === "single" && (
            <Pills options={p.opcoes ?? []} value={single[p.id] ?? ""} onChange={(v) => setS(p.id, v)} />
          )}
          {p.tipo === "multi" && (
            <PillsMulti options={p.opcoes ?? []} values={multi[p.id] ?? []} onToggle={toggleM(p.id)} />
          )}
          {p.tipo === "texto" && (
            <textarea
              value={single[p.id] ?? ""}
              onChange={(e) => setS(p.id, e.target.value)}
              maxLength={500}
              rows={2}
              placeholder={p.placeholder}
              className="w-full bg-grafite border-2 border-grafite-3 rounded-xl px-3 py-2 text-creme placeholder-creme-soft/30 focus:outline-none focus:border-laranja transition-colors text-sm resize-none"
            />
          )}
        </Campo>
      ))}

      {erro && <p className="text-vermelho text-sm font-mono">{erro}</p>}

      <button onClick={enviar} disabled={enviando}
        className="zine-edge w-full py-3 bg-laranja text-grafite brand-lockup text-xl rounded-xl active:scale-95 active:shadow-none transition-all disabled:opacity-50">
        {enviando ? "enviando…" : erro ? "tentar de novo 🔁" : "enviar avaliação →"}
      </button>
    </div>
  )
}
