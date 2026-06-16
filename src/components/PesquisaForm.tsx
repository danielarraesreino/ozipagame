"use client"

import { useState } from "react"

// Pesquisa qualitativa anônima. modo "curta" (fim do jogo) mostra um subconjunto;
// "completa" (página /pesquisa) mostra tudo. Múltipla escolha/escala alimenta o
// dashboard agregado; texto livre fica só no admin.
interface Props {
  modo: "curta" | "completa"
  onDone?: () => void
}

const FAIXAS = ["12–13", "14–15", "16–17", "18+"]
const ESTUDA = ["escola pública", "escola particular", "curso técnico", "não estudo agora"]
const SENTIMENTOS = ["distante de mim", "não é pra mim", "raiva / nojo", "desânimo", "curiosidade", "vontade de mudar algo", "medo de falar errado"]
const AFASTA = ["não entendo do assunto", "é tudo corrupto", "não muda nada", "medo de me expor", "ninguém escuta jovem", "não tenho tempo", "nada me afasta"]
const PARTICIPOU = ["nunca", "uma vez", "às vezes", "sempre que dá"]
const ONDE = ["WhatsApp da família", "TikTok / Insta", "escola", "amigos", "igreja", "na rua / bairro", "não discuto"]
const SABIA = ["sabia e já fui", "sabia mas nunca fui", "não sabia que dava"]

function Pills({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o} type="button" onClick={() => onChange(o)}
          className={`px-3 py-2 rounded-full text-base border-2 transition-all active:scale-95 ${
            value === o ? "bg-laranja text-grafite border-laranja font-bold" : "bg-grafite border-grafite-3 text-creme hover:border-creme/50"
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
            className={`px-3 py-2 rounded-full text-base border-2 transition-all active:scale-95 ${
              on ? "bg-laranja text-grafite border-laranja font-bold" : "bg-grafite border-grafite-3 text-creme hover:border-creme/50"
            }`}>{on ? "✓ " : ""}{o}</button>
        )
      })}
    </div>
  )
}

function Escala({ value, onChange, esq, dir }: { value: number; onChange: (n: number) => void; esq: string; dir: string }) {
  return (
    <div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => onChange(n)}
            className={`flex-1 py-2 rounded-lg border-2 brand-lockup text-lg transition-all active:scale-95 ${
              value === n ? "bg-laranja text-grafite border-laranja" : "bg-grafite border-grafite-3 text-creme-soft"
            }`}>{n}</button>
        ))}
      </div>
      <div className="flex justify-between text-[10px] font-mono text-creme/60 mt-1">
        <span>{esq}</span><span>{dir}</span>
      </div>
    </div>
  )
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="brand-label text-xs text-creme mb-2">{label}</p>
      {children}
    </div>
  )
}

export default function PesquisaForm({ modo, onDone }: Props) {
  const completa = modo === "completa"
  const [faixa, setFaixa] = useState("")
  const [estuda, setEstuda] = useState("")
  const [sentimentos, setSentimentos] = useState<string[]>([])
  const [afetaVida, setAfetaVida] = useState(0)
  const [avontade, setAvontade] = useState(0)
  const [confia, setConfia] = useState(0)
  const [afasta, setAfasta] = useState<string[]>([])
  const [participou, setParticipou] = useState("")
  const [onde, setOnde] = useState<string[]>([])
  const [sabia, setSabia] = useState("")
  const [textoParticipar, setTextoParticipar] = useState("")
  const [textoDuvida, setTextoDuvida] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const toggle = (set: React.Dispatch<React.SetStateAction<string[]>>) => (v: string) =>
    set((arr) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]))

  async function enviar() {
    setEnviando(true)
    try {
      await fetch("/api/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bairro: "Oziel",
          faixa_idade: faixa,
          estuda: completa ? estuda : undefined,
          sentimentos,
          afeta_vida: afetaVida || null,
          avontade_opinar: completa ? (avontade || null) : undefined,
          confia_eleitos: completa ? (confia || null) : undefined,
          afasta: completa ? afasta : undefined,
          ja_participou: participou,
          onde_discute: completa ? onde : undefined,
          sabia_participar: completa ? sabia : undefined,
          texto_participar: textoParticipar.slice(0, 500),
          texto_duvida: completa ? textoDuvida.slice(0, 500) : undefined,
        }),
      })
      setEnviado(true)
      onDone?.()
    } catch {
      setEnviado(true)
    }
    setEnviando(false)
  }

  if (enviado) {
    return (
      <div className="bg-verde/10 border-2 border-verde/40 rounded-2xl p-6 text-center">
        <p className="brand-lockup text-verde text-3xl mb-1">valeu! 🙌</p>
        <p className="text-creme-soft text-sm">tua voz foi registrada — anônima e aberta.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <Campo label="sua idade">
        <Pills options={FAIXAS} value={faixa} onChange={setFaixa} />
      </Campo>

      {completa && (
        <Campo label="você estuda?">
          <Pills options={ESTUDA} value={estuda} onChange={setEstuda} />
        </Campo>
      )}

      <Campo label="quando o assunto é política, eu sinto… (marca quantas quiser)">
        <PillsMulti options={SENTIMENTOS} values={sentimentos} onToggle={toggle(setSentimentos)} />
      </Campo>

      <Campo label="“política afeta minha vida no dia a dia”">
        <Escala value={afetaVida} onChange={setAfetaVida} esq="discordo" dir="concordo" />
      </Campo>

      {completa && (
        <>
          <Campo label="“me sinto à vontade pra dar minha opinião sobre política”">
            <Escala value={avontade} onChange={setAvontade} esq="nada" dir="muito" />
          </Campo>
          <Campo label="“dá pra confiar em quem é eleito”">
            <Escala value={confia} onChange={setConfia} esq="discordo" dir="concordo" />
          </Campo>
          <Campo label="o que mais te afasta de participar? (marca quantas quiser)">
            <PillsMulti options={AFASTA} values={afasta} onToggle={toggle(setAfasta)} />
          </Campo>
        </>
      )}

      <Campo label="já participou de algo pra mudar o bairro?">
        <Pills options={PARTICIPOU} value={participou} onChange={setParticipou} />
      </Campo>

      {completa && (
        <>
          <Campo label="onde você vê/discute política? (marca quantas quiser)">
            <PillsMulti options={ONDE} values={onde} onToggle={toggle(setOnde)} />
          </Campo>
          <Campo label="sabia que dá pra participar de decisão do bairro (audiência, conselho, orçamento)?">
            <Pills options={SABIA} value={sabia} onChange={setSabia} />
          </Campo>
        </>
      )}

      <Campo label="o que te faria querer participar mais do bairro? (opcional)">
        <textarea value={textoParticipar} onChange={(e) => setTextoParticipar(e.target.value)} maxLength={500} rows={2}
          placeholder="escreve do teu jeito…"
          className="w-full bg-grafite border-2 border-grafite-3 rounded-xl px-3 py-2 text-creme placeholder-creme/30 focus:outline-none focus:border-laranja transition-colors text-sm resize-none" />
      </Campo>

      {completa && (
        <Campo label="uma dúvida sua sobre política/eleição (opcional)">
          <textarea value={textoDuvida} onChange={(e) => setTextoDuvida(e.target.value)} maxLength={500} rows={2}
            placeholder="pode perguntar…"
            className="w-full bg-grafite border-2 border-grafite-3 rounded-xl px-3 py-2 text-creme placeholder-creme/30 focus:outline-none focus:border-laranja transition-colors text-sm resize-none" />
        </Campo>
      )}

      <button onClick={enviar} disabled={enviando}
        className="zine-edge w-full py-3 bg-laranja text-grafite brand-lockup text-xl rounded-xl active:scale-95 active:shadow-none transition-all disabled:opacity-50">
        {enviando ? "enviando…" : "enviar minha voz →"}
      </button>
    </div>
  )
}
