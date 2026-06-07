"use client"

import { useState } from "react"

// Pesquisa qualitativa anônima ao fim do jogo. Múltipla escolha alimenta o
// dashboard agregado; texto livre fica só no admin (análise da equipe).
interface Props { bairro: string }

const FAIXAS = ["12–13", "14–15", "16–17", "18+"]
const SENTIMENTOS = [
  "distante de mim",
  "não é pra mim",
  "raiva / desânimo",
  "curiosidade",
  "vontade de mudar algo",
  "medo de falar",
]
const PARTICIPOU = ["nunca", "uma vez", "às vezes", "sempre que dá"]
const ONDE = ["WhatsApp da família", "TikTok / Insta", "escola", "amigos", "igreja", "não discuto"]

function Pills({
  options, value, onChange,
}: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`px-3 py-2 rounded-full text-sm border-2 transition-all active:scale-95 ${
            value === o
              ? "bg-laranja text-grafite border-laranja font-bold"
              : "bg-grafite-2 border-grafite-3 text-creme-soft hover:border-creme-soft/50"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="brand-label text-[10px] text-creme-soft mb-2">{label}</p>
      {children}
    </div>
  )
}

export default function FormularioFinal({ bairro }: Props) {
  const [aberto, setAberto] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [faixa, setFaixa] = useState("")
  const [sentimento, setSentimento] = useState("")
  const [participou, setParticipou] = useState("")
  const [importa, setImporta] = useState(0)
  const [onde, setOnde] = useState("")
  const [textoParticipar, setTextoParticipar] = useState("")
  const [textoDuvida, setTextoDuvida] = useState("")

  async function enviar() {
    setEnviando(true)
    try {
      await fetch("/api/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bairro,
          faixa_idade: faixa,
          sentimento,
          ja_participou: participou,
          opiniao_importa: importa || null,
          onde_discute: onde,
          texto_participar: textoParticipar.slice(0, 500),
          texto_duvida: textoDuvida.slice(0, 500),
        }),
      })
      setEnviado(true)
    } catch {
      setEnviado(true) // não trava o jogador por erro de rede
    }
    setEnviando(false)
  }

  if (enviado) {
    return (
      <div className="bg-verde/10 border-2 border-verde/40 rounded-2xl p-5 text-center">
        <p className="brand-lockup text-verde text-2xl mb-1">valeu! 🙌</p>
        <p className="text-creme-soft text-sm">sua voz foi registrada — anônima e aberta.</p>
      </div>
    )
  }

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="w-full py-3 rounded-xl border-2 border-grafite-3 text-creme-soft hover:border-laranja hover:text-creme font-mono text-sm transition-all active:scale-95"
      >
        📋 responde uma pesquisa rápida (anônima)
      </button>
    )
  }

  return (
    <div className="grain relative bg-grafite-2 border-2 border-grafite-3 rounded-2xl p-5 space-y-5">
      <div>
        <p className="brand-lockup text-creme text-2xl leading-none mb-1">tua voz conta</p>
        <p className="text-creme-soft/70 text-xs font-mono">
          anônimo · ajuda a entender a juventude do bairro
        </p>
      </div>

      <Campo label="sua idade">
        <Pills options={FAIXAS} value={faixa} onChange={setFaixa} />
      </Campo>

      <Campo label="quando o assunto é política, o que você sente?">
        <Pills options={SENTIMENTOS} value={sentimento} onChange={setSentimento} />
      </Campo>

      <Campo label="já participou de algo pra mudar o bairro?">
        <Pills options={PARTICIPOU} value={participou} onChange={setParticipou} />
      </Campo>

      <Campo label="sua opinião sobre política importa? (1 não, 5 muito)">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setImporta(n)}
              className={`flex-1 py-2 rounded-lg border-2 brand-lockup text-lg transition-all active:scale-95 ${
                importa === n
                  ? "bg-laranja text-grafite border-laranja"
                  : "bg-grafite border-grafite-3 text-creme-soft"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </Campo>

      <Campo label="onde você mais vê/discute política?">
        <Pills options={ONDE} value={onde} onChange={setOnde} />
      </Campo>

      <Campo label="o que te faria participar mais do bairro? (opcional)">
        <textarea
          value={textoParticipar}
          onChange={(e) => setTextoParticipar(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder="escreve do teu jeito…"
          className="w-full bg-grafite border-2 border-grafite-3 rounded-xl px-3 py-2 text-creme placeholder-creme-soft/30 focus:outline-none focus:border-laranja transition-colors text-sm resize-none"
        />
      </Campo>

      <Campo label="uma dúvida sua sobre política/eleição (opcional)">
        <textarea
          value={textoDuvida}
          onChange={(e) => setTextoDuvida(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder="pode perguntar…"
          className="w-full bg-grafite border-2 border-grafite-3 rounded-xl px-3 py-2 text-creme placeholder-creme-soft/30 focus:outline-none focus:border-laranja transition-colors text-sm resize-none"
        />
      </Campo>

      <button
        onClick={enviar}
        disabled={enviando}
        className="zine-edge w-full py-3 bg-laranja text-grafite brand-lockup text-xl rounded-xl active:scale-95 active:shadow-none transition-all disabled:opacity-50"
      >
        {enviando ? "enviando…" : "enviar minha voz →"}
      </button>
    </div>
  )
}
