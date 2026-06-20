"use client"

import { useState } from "react"

interface Props {
  onDone: (turma: string) => void
}

const TURMAS = [
  "Sábado manhã — das 9:00 às 11:00",
  "Sábado tarde — das 14:30 às 16:30",
]

const CONTATOS = ["WhatsApp", "SMS", "Email", "não precisa"]

function Campo({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <p className="brand-label text-xs text-creme mb-2">
        {label}{required && <span className="text-laranja ml-1">*</span>}
      </p>
      {children}
    </div>
  )
}

export default function InscricaoForm({ onDone }: Props) {
  const [nome, setNome] = useState("")
  const [idade, setIdade] = useState("")
  const [turma, setTurma] = useState("")
  const [topou, setTopou] = useState(false)
  const [contatoTipo, setContatoTipo] = useState("")
  const [contatoValor, setContatoValor] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState("")

  const valido = nome.trim() && idade.trim() && turma && topou

  async function enviar() {
    if (!valido) {
      setErro("preenche todos os campos obrigatórios *")
      return
    }
    setErro("")
    setEnviando(true)
    try {
      await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          idade: idade.trim(),
          turma,
          confirmou_presenca: topou,
          contato_tipo: contatoTipo || null,
          contato_valor: contatoValor.trim() || null,
        }),
      })
    } catch {
      // fail silently — still advance
    }
    setEnviando(false)
    onDone(turma)
  }

  return (
    <div className="space-y-5">
      <Campo label="nome" required>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="seu nome"
          className="w-full bg-grafite border-2 border-grafite-3 rounded-xl px-3 py-3 text-creme placeholder-creme/30 focus:outline-none focus:border-laranja transition-colors text-base"
        />
      </Campo>

      <Campo label="idade" required>
        <input
          type="text"
          inputMode="numeric"
          value={idade}
          onChange={(e) => setIdade(e.target.value)}
          placeholder="ex: 16"
          className="w-full bg-grafite border-2 border-grafite-3 rounded-xl px-3 py-3 text-creme placeholder-creme/30 focus:outline-none focus:border-laranja transition-colors text-base"
        />
      </Campo>

      <Campo label="você participará em qual turma?" required>
        <div className="space-y-2">
          {TURMAS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTurma(t)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 text-base transition-all active:scale-[0.98] ${
                turma === t
                  ? "bg-laranja text-grafite border-laranja font-bold"
                  : "bg-grafite border-grafite-3 text-creme hover:border-creme/50"
              }`}
            >
              Dia 20 {t}
            </button>
          ))}
        </div>
      </Campo>

      <Campo label="quer receber confirmação?">
        <div className="flex flex-wrap gap-2 mb-3">
          {CONTATOS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => { setContatoTipo(c); setContatoValor("") }}
              className={`px-3 py-2 rounded-full text-sm border-2 transition-all active:scale-95 ${
                contatoTipo === c
                  ? "bg-laranja text-grafite border-laranja font-bold"
                  : "bg-grafite border-grafite-3 text-creme hover:border-creme/50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        {contatoTipo && contatoTipo !== "não precisa" && (
          <input
            type={contatoTipo === "Email" ? "email" : "tel"}
            value={contatoValor}
            onChange={(e) => setContatoValor(e.target.value)}
            placeholder={
              contatoTipo === "Email"
                ? "seu email"
                : "número com DDD — ex: 19 99999-9999"
            }
            className="w-full bg-grafite border-2 border-grafite-3 rounded-xl px-3 py-3 text-creme placeholder-creme/30 focus:outline-none focus:border-laranja transition-colors text-base"
          />
        )}
      </Campo>

      <button
        type="button"
        onClick={() => setTopou((v) => !v)}
        className={`w-full text-left px-4 py-3 rounded-xl border-2 text-base transition-all active:scale-[0.98] flex items-start gap-3 ${
          topou
            ? "bg-verde/15 text-creme border-verde font-bold"
            : "bg-grafite border-grafite-3 text-creme hover:border-creme/50"
        }`}
      >
        <span className="mt-px text-lg leading-none">{topou ? "☑" : "☐"}</span>
        <span>tô dentro! apareço no dia 20 e respondo a pesquisa lá 🤙 <span className="text-laranja">*</span></span>
      </button>

      {erro && <p className="text-vermelho text-sm font-mono">{erro}</p>}

      <button
        onClick={enviar}
        disabled={enviando}
        className="zine-edge w-full py-3 bg-laranja text-grafite brand-lockup text-xl rounded-xl active:scale-95 active:shadow-none transition-all disabled:opacity-50"
      >
        {enviando ? "inscrevendo…" : "confirmar inscrição →"}
      </button>
    </div>
  )
}
