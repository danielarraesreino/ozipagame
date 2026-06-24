"use client"

import { useState } from "react"
import type { CampoPergunta } from "@/lib/pesquisa"

// Tela de transcrição (admin). Renderiza qualquer lista de CampoPergunta e grava
// uma ficha por vez. Cada pergunta tem botão "não respondeu" → manda null, sem
// sujar o banco. Distinto de "deixar vazio" (que também é null): o botão é só
// pra equipe registrar conscientemente que a ficha de papel veio em branco ali.
//
// Reusado por: pesquisa inicial (formularios) e avaliação (avaliacoes).

type Valor = string | string[] | number | null

interface Props {
  perguntas: CampoPergunta[]
  endpoint: string                                  // POST destino (admin)
  momentos?: { value: string; label: string }[]     // opcional: seletor de momento
  titulo: string
  onSaved?: () => void
}

function vazio(perguntas: CampoPergunta[]): Record<string, Valor> {
  const o: Record<string, Valor> = {}
  for (const p of perguntas) o[p.id] = p.tipo === "multi" ? [] : p.tipo === "escala" ? 0 : ""
  return o
}

export default function CadastroForm({ perguntas, endpoint, momentos, titulo, onSaved }: Props) {
  const [resp, setResp] = useState<Record<string, Valor>>(() => vazio(perguntas))
  const [naoResp, setNaoResp] = useState<Set<string>>(new Set())
  const [momento, setMomento] = useState(momentos?.[0]?.value ?? "")
  const [enviando, setEnviando] = useState(false)
  const [estado, setEstado] = useState<"idle" | "ok" | "err">("idle")
  const [contador, setContador] = useState(0)

  const set = (id: string, v: Valor) => setResp((r) => ({ ...r, [id]: v }))

  function toggleNaoResp(id: string) {
    setNaoResp((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else { n.add(id); set(id, perguntas.find((p) => p.id === id)?.tipo === "multi" ? [] : perguntas.find((p) => p.id === id)?.tipo === "escala" ? 0 : "") }
      return n
    })
  }

  function toggleMulti(id: string, opt: string) {
    if (naoResp.has(id)) return
    setResp((r) => {
      const arr = Array.isArray(r[id]) ? (r[id] as string[]) : []
      return { ...r, [id]: arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt] }
    })
  }

  function payload() {
    const out: Record<string, unknown> = {}
    for (const p of perguntas) {
      if (naoResp.has(p.id)) { out[p.id] = null; continue }
      const v = resp[p.id]
      if (p.tipo === "escala") out[p.id] = typeof v === "number" && v >= 1 && v <= 5 ? v : null
      else if (p.tipo === "multi") out[p.id] = Array.isArray(v) && v.length ? v : null
      else out[p.id] = typeof v === "string" && v.trim() ? v.trim() : null
    }
    if (momentos) out.momento = momento
    return out
  }

  async function enviar() {
    setEnviando(true)
    setEstado("idle")
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload()),
      })
      if (!res.ok) throw new Error()
      setEstado("ok")
      setContador((c) => c + 1)
      setResp(vazio(perguntas))
      setNaoResp(new Set())
      onSaved?.()
      window.scrollTo({ top: 0, behavior: "smooth" })
      setTimeout(() => setEstado("idle"), 1500)
    } catch {
      setEstado("err")
    }
    setEnviando(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-mono tracking-widest uppercase text-laranja">{titulo}</p>
        <span className="text-xs font-mono text-verde">{contador} ficha(s) nesta sessão</span>
      </div>

      {momentos && (
        <div>
          <p className="brand-label text-[10px] text-creme-soft mb-2">momento da aplicação</p>
          <div className="flex flex-wrap gap-2">
            {momentos.map((m) => (
              <button key={m.value} type="button" onClick={() => setMomento(m.value)}
                className={`px-3 py-2 rounded-full text-sm border-2 transition-all active:scale-95 ${
                  momento === m.value ? "bg-laranja text-grafite border-laranja font-bold" : "bg-grafite-2 border-grafite-3 text-creme-soft"
                }`}>{m.label}</button>
            ))}
          </div>
        </div>
      )}

      {perguntas.map((p) => {
        const off = naoResp.has(p.id)
        return (
          <div key={p.id} className={`rounded-xl ${off ? "opacity-50" : ""}`}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="brand-label text-[10px] text-creme-soft">
                {p.label} {p.ajuda && <span className="text-creme-soft/40 normal-case">· {p.ajuda}</span>}
              </p>
              <button type="button" onClick={() => toggleNaoResp(p.id)}
                className={`shrink-0 text-[10px] font-mono px-2 py-1 rounded-full border transition-colors ${
                  off ? "bg-vermelho/20 border-vermelho/50 text-vermelho" : "border-grafite-3 text-creme-soft/50 hover:text-creme-soft"
                }`}>
                {off ? "✓ não respondeu" : "não respondeu"}
              </button>
            </div>

            {!off && p.tipo === "single" && (
              <div className="flex flex-wrap gap-2">
                {p.opcoes!.map((o) => (
                  <button key={o} type="button" onClick={() => set(p.id, o)}
                    className={`px-3 py-2 rounded-full text-sm border-2 transition-all active:scale-95 ${
                      resp[p.id] === o ? "bg-laranja text-grafite border-laranja font-bold" : "bg-grafite-2 border-grafite-3 text-creme-soft hover:border-creme-soft/50"
                    }`}>{o}</button>
                ))}
              </div>
            )}

            {!off && p.tipo === "multi" && (
              <div className="flex flex-wrap gap-2">
                {p.opcoes!.map((o) => {
                  const on = Array.isArray(resp[p.id]) && (resp[p.id] as string[]).includes(o)
                  return (
                    <button key={o} type="button" onClick={() => toggleMulti(p.id, o)}
                      className={`px-3 py-2 rounded-full text-sm border-2 transition-all active:scale-95 ${
                        on ? "bg-laranja text-grafite border-laranja font-bold" : "bg-grafite-2 border-grafite-3 text-creme-soft hover:border-creme-soft/50"
                      }`}>{on ? "✓ " : ""}{o}</button>
                  )
                })}
              </div>
            )}

            {!off && p.tipo === "escala" && (
              <div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => set(p.id, n)}
                      className={`flex-1 py-2 rounded-lg border-2 brand-lockup text-lg transition-all active:scale-95 ${
                        resp[p.id] === n ? "bg-laranja text-grafite border-laranja" : "bg-grafite border-grafite-3 text-creme-soft"
                      }`}>{n}</button>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] font-mono text-creme-soft/50 mt-1">
                  <span>{p.esq}</span><span>{p.dir}</span>
                </div>
              </div>
            )}

            {!off && p.tipo === "texto" && (
              <textarea value={(resp[p.id] as string) ?? ""} onChange={(e) => set(p.id, e.target.value)} maxLength={500} rows={2}
                placeholder="transcreve do jeito que está escrito…"
                className="w-full bg-grafite border-2 border-grafite-3 rounded-xl px-3 py-2 text-creme placeholder-creme-soft/30 focus:outline-none focus:border-laranja transition-colors text-sm resize-none" />
            )}
          </div>
        )
      })}

      <button onClick={enviar} disabled={enviando}
        className={`w-full py-3 brand-lockup text-xl rounded-xl active:scale-95 transition-all disabled:opacity-50 ${
          estado === "ok" ? "bg-verde text-grafite" : estado === "err" ? "bg-vermelho text-creme" : "bg-laranja text-grafite"
        }`}>
        {enviando ? "salvando…" : estado === "ok" ? "✓ salvo — próxima ficha" : estado === "err" ? "! erro — tenta de novo" : "salvar ficha + próxima →"}
      </button>
    </div>
  )
}
