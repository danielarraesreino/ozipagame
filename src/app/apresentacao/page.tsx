"use client"

import { useState } from "react"
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion"
import Link from "next/link"
import MenuHamburger from "@/components/MenuHamburger"
import DownloadGate from "@/components/DownloadGate"
import { COHORTS, OZIEL, RUI, AVALIACAO, VOZES, TOTAIS, type Cohort } from "@/lib/apresentacao_dados"

/* ───────────────────────────────────────────────────────────────────────────
   APRESENTAÇÃO — "O lado oculto da quebrada"
   Dossiê de dados Vozes do Oziel. Dois encontros (Parque Oziel N=30 · EE Rui
   Rodrigues N=44) + avaliação pós (N=31). Ótica Freakonomics: o que o número
   esconde, o contraintuitivo, o branco como dado. Estética zine/risograph.
   Fonte única dos números: src/lib/apresentacao_dados.ts
   ─────────────────────────────────────────────────────────────────────────── */

const COR = {
  laranja: "var(--color-laranja)",
  amarelo: "var(--color-amarelo)",
  verde: "var(--color-verde)",
  vermelho: "var(--color-vermelho)",
  creme: "var(--color-creme)",
  cinza: "var(--color-grafite-3)",
} as const
const corOf = (k: string) => (COR as Record<string, string>)[k] ?? COR.laranja
const ease = [0.22, 1, 0.36, 1] as const

// legenda dos símbolos — fonte única (seção 00 + widget flutuante)
const LEGENDA: [string, string, string][] = [
  ["N", "total de fichas de um encontro", "ex.: N=44 = 44 jovens responderam em Rui Rodrigues."],
  ["n", "tamanho de um pedaço menor", "ex.: n6 = só 6 pessoas naquele recorte. n baixo (<6) = pista, não prova."],
  ["escala 1–5", "o quanto concorda", "1 = discordo total · 5 = concordo total. A “média” é a nota típica do grupo."],
  ["r", "o quanto duas coisas andam juntas", "0 = nada a ver · +1 = sobem juntas · −1 = uma sobe, a outra cai."],
  ["branco", "deixou a pergunta em branco", "vira a barra cinza “sem resposta”. Sinal de onde a pergunta travou."],
]

// ── primitivas ───────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, y = 28, className = "" }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, delay, ease }}
      className={className}
    >{children}</motion.div>
  )
}

function Stamp({ children, cor = COR.laranja }: { children: React.ReactNode; cor?: string }) {
  return <span className="brand-stamp inline-block text-[10px] px-3 py-1 rounded-full border-2" style={{ color: cor, borderColor: `${cor}66` }}>{children}</span>
}

function Secao({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return <section id={id} className={`relative px-6 py-24 md:py-32 max-w-3xl mx-auto ${className}`}>{children}</section>
}

function Bar({ label, value, max, cor = COR.laranja, suffix = "", highlight = false, delay = 0 }: {
  label: string; value: number; max: number; cor?: string; suffix?: string; highlight?: boolean; delay?: number
}) {
  const pct = Math.max(2, (value / max) * 100)
  const mudo = label.toLowerCase().includes("sem resposta")
  return (
    <div className={highlight ? "relative" : ""}>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className={`text-sm ${highlight ? "text-creme font-bold" : mudo ? "text-creme-soft/40 italic" : "text-creme-soft"}`}>{highlight && "▸ "}{label}</span>
        <span className={`font-mono text-sm ${highlight ? "text-laranja font-bold" : mudo ? "text-creme-soft/40" : "text-creme"}`}>{value}{suffix}</span>
      </div>
      <div className="h-3 bg-grafite rounded-sm overflow-hidden border border-grafite-3">
        <motion.div
          initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }}
          transition={{ duration: 0.9, delay, ease }} className="h-full rounded-sm"
          style={{ background: mudo ? COR.cinza : cor, boxShadow: highlight ? `0 0 18px ${cor}66` : "none" }}
        />
      </div>
    </div>
  )
}

function Tag({ children, cor }: { children: React.ReactNode; cor: string }) {
  return <span className="brand-label text-[10px] mb-3 block" style={{ color: cor }}>{children}</span>
}

// ── número grande estilo "achado" ────────────────────────────────────────────
function BigNum({ valor, cor, sub, nota }: { valor: string; cor: string; sub: React.ReactNode; nota?: string }) {
  return (
    <Reveal className="zine-edge bg-grafite border-2 rounded-2xl p-4 md:p-6 text-center" >
      <p className="brand-lockup text-4xl sm:text-6xl md:text-7xl leading-none" style={{ color: cor }}>{valor}</p>
      <p className="text-creme-soft text-xs md:text-sm mt-3 leading-tight">{sub}</p>
      {nota && <p className="text-creme/50 text-[11px] mt-2 font-mono">{nota}</p>}
    </Reveal>
  )
}

// ── switcher de encontro ──────────────────────────────────────────────────────
function Switcher({ ativo, set }: { ativo: Cohort; set: (c: Cohort) => void }) {
  return (
    <div className="inline-flex p-1.5 rounded-2xl bg-grafite-2 border-2 border-grafite-3 gap-1 relative">
      {COHORTS.map((c) => {
        const on = c.id === ativo.id
        return (
          <button key={c.id} onClick={() => set(c)} className="relative px-4 md:px-6 py-3 rounded-xl z-10 text-left transition-colors">
            {on && <motion.span layoutId="switch-bg" className="absolute inset-0 rounded-xl bg-laranja" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            <span className="relative z-10 block">
              <span className={`brand-lockup text-sm md:text-base leading-none ${on ? "text-grafite" : "text-creme"}`}>{c.encontro}</span>
              <span className={`block brand-label text-[9px] mt-1 ${on ? "text-grafite/70" : "text-creme-soft/50"}`}>{c.local} · N={c.n}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ── painel de um encontro (dentro do switcher) ────────────────────────────────
function Painel({ c }: { c: Cohort }) {
  const acc = c.id === "oziel" ? COR.laranja : COR.verde
  const maxB = c.bairros[0][1], maxI = c.idades[0][1]
  return (
    <motion.div
      key={c.id}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.45, ease }}
    >
      <div className="flex flex-wrap items-end gap-x-4 gap-y-1 mb-2">
        <h3 className="brand-lockup text-3xl md:text-4xl" style={{ color: acc }}>{c.local}</h3>
        <span className="brand-label text-[10px] text-creme-soft/60">{c.escola} · {c.data}</span>
      </div>
      <p className="text-creme-soft text-base md:text-lg leading-relaxed max-w-[48ch] mb-8">{c.resumo}</p>

      {/* escalas-chave */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {[["afeta a vida", c.escalas.afeta, COR.laranja], ["à vontade p/ opinar", c.escalas.avontade, COR.amarelo], ["confia em eleitos", c.escalas.confia, COR.vermelho]].map(([l, v, cr]) => (
          <div key={l as string} className="bg-grafite border-2 border-grafite-3 rounded-xl p-3 md:p-4 text-center">
            <p className="brand-lockup text-3xl md:text-4xl leading-none" style={{ color: cr as string }}>{(v as number).toFixed(2)}</p>
            <p className="text-creme-soft/60 text-[10px] md:text-xs mt-1.5 leading-tight">{l}</p>
          </div>
        ))}
      </div>
      <p className="brand-label text-[9px] text-creme-soft/40 -mt-7 mb-9 text-center">médias na escala 1–5</p>

      <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
        <div>
          <Tag cor={acc}>de onde vêm</Tag>
          <div className="space-y-3">{c.bairros.map(([l, v], i) => <Bar key={l} label={l} value={v} max={maxB} cor={acc} delay={i * 0.04} highlight={i === 0} />)}</div>
        </div>
        <div>
          <Tag cor={COR.amarelo}>idade</Tag>
          <div className="space-y-3 mb-6">{c.idades.map(([l, v], i) => <Bar key={l} label={l} value={v} max={maxI} cor={COR.amarelo} delay={i * 0.04} highlight={i === 0} />)}</div>
          <div className="zine-edge bg-grafite-2 border-2 border-grafite-3 rounded-2xl p-4">
            <p className="brand-lockup text-creme text-4xl">{c.publica.pct}%</p>
            <p className="text-creme-soft text-sm mt-1">escola pública ({c.publica.abs})</p>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <Tag cor={acc}>quando o assunto é política, sentem…</Tag>
        <div className="space-y-3">{c.sentimentos.map(([l, v], i) => <Bar key={l} label={l} value={v} max={c.sentimentos[0][1]} cor={acc} delay={i * 0.03} highlight={i < 2} />)}</div>
      </div>
    </motion.div>
  )
}

// ── linha de comparação dos dois encontros ────────────────────────────────────
function VS({ label, a, b, fmt = (x: number) => x.toFixed(2), invert = false, nota }: {
  label: string; a: number; b: number; fmt?: (x: number) => string; invert?: boolean; nota?: string
}) {
  const aWins = invert ? a < b : a > b
  return (
    <Reveal className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-5 bg-grafite border-2 border-grafite-3 rounded-xl p-4">
      <div className="text-right">
        <p className="brand-lockup text-3xl md:text-4xl leading-none" style={{ color: aWins ? COR.laranja : COR.creme }}>{fmt(a)}</p>
        <p className="brand-label text-[9px] text-creme-soft/50 mt-1">Oziel</p>
      </div>
      <div className="text-center min-w-0 px-1">
        <p className="text-creme text-[11px] md:text-sm font-bold leading-tight">{label}</p>
        {nota && <p className="text-creme-soft/50 text-[10px] mt-1 leading-tight">{nota}</p>}
      </div>
      <div className="text-left">
        <p className="brand-lockup text-3xl md:text-4xl leading-none" style={{ color: !aWins ? COR.verde : COR.creme }}>{fmt(b)}</p>
        <p className="brand-label text-[9px] text-creme-soft/50 mt-1">Rui Rodrigues</p>
      </div>
    </Reveal>
  )
}

// ── chip de correlação ────────────────────────────────────────────────────────
function Corr({ r, label, txt, cor }: { r: number; label: string; txt: string; cor: string }) {
  const s = (r >= 0 ? "+" : "−") + Math.abs(r).toFixed(2).replace(".", ",")
  return (
    <div className="flex items-center gap-4 md:gap-6 bg-grafite border-2 border-grafite-3 rounded-xl p-4 md:p-5">
      <p className="brand-lockup text-4xl md:text-5xl leading-none whitespace-nowrap w-28 md:w-36 shrink-0" style={{ color: cor }}>{s}</p>
      <div className="min-w-0">
        <p className="text-creme text-sm font-bold">{label}</p>
        <p className="text-creme-soft/60 text-xs mt-0.5">{txt}</p>
      </div>
    </div>
  )
}

// ── legenda flutuante recolhível (segue a rolagem) ───────────────────────────
function LegendaFlutuante() {
  const [aberta, setAberta] = useState(false)
  return (
    <div className="fixed bottom-4 left-4 z-50 print:hidden">
      <AnimatePresence>
        {aberta && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.25, ease }}
            className="zine-edge bg-grafite-2 border-2 border-grafite-3 rounded-2xl p-4 mb-3 w-[min(88vw,22rem)] max-h-[70vh] overflow-y-auto"
          >
            <p className="brand-label text-[10px] text-amarelo mb-3">o alfabeto dos números</p>
            <div className="space-y-2.5">
              {LEGENDA.map(([sig, t, d]) => (
                <div key={sig} className="flex gap-3">
                  <span className="brand-lockup text-laranja text-base leading-tight shrink-0 w-16">{sig}</span>
                  <div className="min-w-0">
                    <p className="text-creme font-bold text-xs">{t}</p>
                    <p className="text-creme-soft text-[11px] mt-0.5 leading-snug">{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setAberta((v) => !v)}
        aria-expanded={aberta}
        aria-label="Legenda dos números"
        className="zine-edge bg-laranja text-grafite brand-lockup text-sm pl-4 pr-5 py-3 rounded-full flex items-center gap-2"
      >
        <span className="text-lg leading-none">{aberta ? "×" : "?"}</span>
        legenda
      </button>
    </div>
  )
}

export default function Apresentacao() {
  const { scrollYProgress } = useScroll()
  const barra = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })
  const [cohort, setCohort] = useState<Cohort>(OZIEL)

  return (
    <main className="bg-grafite text-creme overflow-x-hidden">
      <motion.div className="fixed top-0 left-0 right-0 h-1 z-50 origin-left" style={{ scaleX: barra, background: COR.laranja }} />
      <div className="fixed top-4 right-4 z-50"><MenuHamburger /></div>
      <LegendaFlutuante />

      {/* ░░ CAPA ░░ */}
      <section className="bg-halftone bg-halftone-veil min-h-screen flex flex-col justify-center px-6">
        <div className="relative z-10 max-w-3xl mx-auto w-full">
          <Reveal><Stamp>Dossiê de dados · Grupo Diálogos / CriaLab</Stamp></Reveal>
          <Reveal delay={0.1}>
            <h1 className="brand-lockup text-creme mt-6 text-[clamp(2rem,11vw,6.6rem)] leading-[0.82]">
              O lado<br /><span className="text-laranja">oculto</span><br />da quebrada
            </h1>
          </Reveal>
          <Reveal delay={0.25}>
            <p className="text-creme-soft text-base md:text-lg mt-6 max-w-[46ch] leading-relaxed">
              Dois encontros, duas escolas, dois retratos da juventude de Campinas. Não o que
              a pesquisa diz na primeira leitura — o que ela <strong className="text-creme">esconde</strong> nas entrelinhas.
            </p>
          </Reveal>
          <Reveal delay={0.4} className="mt-8 flex flex-wrap gap-6 items-end">
            <div className="flex items-end gap-2">
              <span className="brand-lockup text-laranja text-5xl sm:text-7xl">{TOTAIS.fichas}</span>
              <span className="font-mono text-xs text-creme-soft/70 leading-tight pb-1">fichas reais<br />validadas</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="brand-lockup text-creme text-4xl sm:text-6xl">{TOTAIS.encontros}</span>
              <span className="font-mono text-xs text-creme-soft/70 leading-tight pb-1">encontros<br />comparados</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="brand-lockup text-verde text-4xl sm:text-6xl">{TOTAIS.avaliacoes}</span>
              <span className="font-mono text-xs text-creme-soft/70 leading-tight pb-1">avaliações<br />pós-encontro</span>
            </div>
          </Reveal>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }} className="mt-14 brand-stamp text-[10px] text-creme-soft/50">↓ role pra ver</motion.div>
        </div>
      </section>

      {/* ░░ MÉTODO OCULTO ░░ */}
      <Secao>
        <Reveal><Stamp cor={COR.amarelo}>00 · como ler isto</Stamp></Reveal>
        <Reveal delay={0.1}><h2 className="brand-lockup text-[2rem] leading-[0.95] sm:text-5xl md:text-6xl mt-5 mb-6">O branco também<br />é resposta</h2></Reveal>
        <Reveal delay={0.15}>
          <p className="text-creme-soft text-lg leading-relaxed max-w-[48ch] mb-4">
            Pesquisa comum joga fora quem deixou em branco. A gente não. Aqui o
            <strong className="text-creme"> não-respondeu é dado</strong> — diz onde a pergunta travou.
            Tiramos testes, nunca arredondamos pra cima, e tratamos cada encontro como um
            retrato próprio.
          </p>
        </Reveal>

        {/* como foi coletado — passo a passo */}
        <Reveal delay={0.18}>
          <div className="zine-edge bg-grafite-2 border-2 border-grafite-3 rounded-2xl p-5 md:p-6 mb-10">
            <p className="brand-label text-[10px] text-amarelo mb-4">como esses dados nasceram</p>
            <ol className="space-y-3">
              {[
                ["1", "Ficha de papel", "Cada jovem respondeu à mão, no encontro. Sem nome, sem login — anônimo de origem."],
                ["2", "Transcrição", "A equipe digitou ficha por ficha no sistema. Resposta em branco virou “não respondeu”, não foi inventada."],
                ["3", "Soma honesta", "O computador só contou. Cada gráfico aqui é a contagem direta dessas fichas — nada estimado."],
              ].map(([num, t, d]) => (
                <li key={num} className="flex gap-4">
                  <span className="brand-lockup text-laranja text-2xl leading-none shrink-0 w-7">{num}</span>
                  <div>
                    <p className="text-creme font-bold text-sm">{t}</p>
                    <p className="text-creme-soft text-xs mt-0.5 leading-relaxed">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        {/* legenda — decodifica os símbolos */}
        <Reveal delay={0.22}>
          <p className="brand-label text-[10px] text-creme-soft/60 mb-4">o alfabeto dos números — guarde estes 5</p>
          <div className="grid sm:grid-cols-2 gap-3 mb-10">
            {LEGENDA.map(([sig, t, d], i) => (
              <div key={sig as string} className={`flex gap-4 bg-grafite border-2 border-grafite-3 rounded-xl p-4 ${i === 4 ? "sm:col-span-2" : ""}`}>
                <span className="brand-lockup text-laranja text-xl leading-tight shrink-0 w-20">{sig}</span>
                <div className="min-w-0">
                  <p className="text-creme font-bold text-sm">{t}</p>
                  <p className="text-creme-soft text-xs mt-0.5 leading-relaxed">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-3 gap-4">
          {[
            ["Dois territórios", "Parque Oziel (sede do projeto) e EE Rui Rodrigues (Campo Grande). Públicos diferentes, alavancas diferentes."],
            ["n pequeno = pista", "Recorte com poucas fichas vira tendência sinalizada, nunca conclusão fechada."],
            ["Comparar grupo, não pessoa", "O antes×depois é do coletivo. Ninguém é rastreado individualmente."],
          ].map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.08} className="bg-grafite-2 border-2 border-grafite-3 rounded-2xl p-5">
              <p className="text-creme font-bold text-sm">{t}</p>
              <p className="text-creme-soft text-xs mt-2 leading-relaxed">{d}</p>
            </Reveal>
          ))}
        </div>
      </Secao>

      {/* ░░ OS DOIS RETRATOS — switcher ░░ */}
      <div className="bg-grafite-2 border-y-2 border-grafite-3">
        <Secao>
          <Reveal><Stamp>01 · os dois retratos</Stamp></Reveal>
          <Reveal delay={0.1}><h2 className="brand-lockup text-[2rem] leading-[0.95] sm:text-5xl md:text-6xl mt-5 mb-4">Quem respondeu</h2></Reveal>
          <Reveal delay={0.15}><p className="text-creme-soft text-base leading-relaxed max-w-[46ch] mb-7">Troca o encontro e vê o retrato mudar. Mesma pesquisa, duas juventudes.</p></Reveal>
          <Reveal delay={0.2} className="mb-10"><Switcher ativo={cohort} set={setCohort} /></Reveal>
          <AnimatePresence mode="wait"><Painel c={cohort} /></AnimatePresence>
        </Secao>
      </div>

      {/* ░░ ACHADO OCULTO 1 — cinismo ≠ apatia ░░ */}
      <Secao>
        <Reveal><Stamp cor={COR.vermelho}>02 · o achado que vira a mesa</Stamp></Reveal>
        <Reveal delay={0.1}>
          <h2 className="brand-lockup text-[2rem] leading-[0.95] sm:text-5xl md:text-6xl mt-5 mb-8 leading-[0.9]">
            Desconfiar <span className="text-vermelho">não</span><br />é desistir
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="text-creme-soft text-sm leading-relaxed max-w-[46ch] mb-5">
            Os dois números abaixo são <strong className="text-creme">r</strong> — o quanto duas respostas andam juntas.
            Perto de <strong className="text-creme">0</strong>, não têm relação. Perto de <strong className="text-laranja">+1</strong>, sobem juntas.
          </p>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 md:gap-8">
          <Corr r={OZIEL.corr.confiaVoz} label="confiar em político × querer opinar" txt="Oziel · praticamente zero" cor={COR.creme} />
          <Corr r={OZIEL.corr.afetaVoz} label="sentir que afeta × querer opinar" txt="Oziel · a alavanca real" cor={COR.laranja} />
        </div>
        <Reveal delay={0.25}>
          <p className="text-creme text-lg md:text-xl leading-relaxed mt-10 max-w-[48ch]">
            No Oziel, quem despreza político quer falar <em className="text-laranja not-italic font-bold">do mesmo jeito</em> de
            quem confia. A juventude não está apática — está <strong>descrente</strong>. E descrença
            <strong className="text-creme"> não cala a voz</strong>. Não precisamos devolver a fé na política pra mobilizar:
            a voz já está aí, intacta.
          </p>
        </Reveal>
        <Reveal delay={0.35} className="mt-8 zine-edge bg-grafite-2 border-2 border-amarelo/40 rounded-2xl p-5">
          <p className="brand-label text-[10px] text-amarelo mb-2">o dado oculto</p>
          <p className="text-creme-soft text-sm leading-relaxed">
            Em Rui Rodrigues o mesmo cruzamento dá <strong className="text-creme">+0,22</strong> — confiar e querer falar
            começam a andar juntos. Outra escola, outra física social. <strong className="text-creme">A alavanca muda de bairro pra bairro</strong> — e é isso que a próxima seção mostra.
          </p>
        </Reveal>
      </Secao>

      {/* ░░ ACHADO OCULTO 2 — a alavanca muda de CEP ░░ */}
      <div className="bg-halftone bg-halftone-veil">
        <Secao>
          <div className="relative z-10">
            <Reveal><Stamp cor={COR.verde}>03 · a alavanca tem CEP</Stamp></Reveal>
            <Reveal delay={0.1}><h2 className="brand-lockup text-[2rem] leading-[0.95] sm:text-5xl md:text-6xl mt-5 mb-4">A mesma porta abre<br />com chaves diferentes</h2></Reveal>
            <Reveal delay={0.15}>
              <p className="text-creme-soft text-lg leading-relaxed max-w-[48ch] mb-9">
                O que destrava a fala não é o mesmo nos dois lugares. No Oziel, é
                <strong className="text-creme"> sentir que política mexe com a vida</strong> (r&nbsp;+0,52). Em Rui Rodrigues
                eles <strong className="text-creme">já sentem</strong> isso — e mesmo assim não participam. Lá a chave é outra: <strong className="text-verde">informação</strong>.
              </p>
            </Reveal>
            <div className="space-y-4">
              <VS label="política afeta minha vida" a={OZIEL.escalas.afeta} b={RUI.escalas.afeta} nota="Rui sente mais que importa" />
              <VS label="% que nunca participaram" a={OZIEL.infoGap.nuncaPct} b={RUI.infoGap.nuncaPct} fmt={(x) => `${x}%`} invert nota="…e mesmo assim, age menos" />
              <VS label="afeta × querer opinar (r)" a={OZIEL.corr.afetaVoz} b={RUI.corr.afetaVoz} fmt={(x) => (x >= 0 ? "+" : "−") + Math.abs(x).toFixed(2).replace(".", ",")} nota="no Oziel relevância destrava; em Rui já é alta" />
            </div>
            <Reveal delay={0.2}>
              <p className="text-creme text-lg md:text-xl leading-relaxed mt-10 max-w-[48ch]">
                Em Campo Grande o jovem <strong>sabe</strong> que política afeta a vida dele (3,56/5) — e ainda
                assim <strong className="text-vermelho">72% nunca participaram</strong>. Não falta consciência. Falta a porta.
              </p>
            </Reveal>
          </div>
        </Secao>
      </div>

      {/* ░░ ACHADO OCULTO 3 — info-gap ░░ */}
      <Secao>
        <Reveal><Stamp cor={COR.amarelo}>04 · o gargalo invisível</Stamp></Reveal>
        <Reveal delay={0.1}><h2 className="brand-lockup text-[2rem] leading-[0.95] sm:text-5xl md:text-6xl mt-5 mb-8">Ninguém disse<br />que dava</h2></Reveal>
        <div className="grid grid-cols-2 gap-4 md:gap-8 mb-10">
          <BigNum valor={`${RUI.infoGap.naoSabiaPct}%`} cor={COR.amarelo} sub={<>não sabiam que dá<br />pra participar</>} nota="Rui Rodrigues" />
          <BigNum valor={`${RUI.infoGap.nuncaPct}%`} cor={COR.laranja} sub={<>nunca participaram<br />de nada no bairro</>} nota="Rui Rodrigues" />
        </div>
        <Reveal delay={0.2} className="zine-edge bg-grafite-2 border-2 border-grafite-3 rounded-2xl p-5 mb-10">
          <p className="brand-label text-[10px] text-creme-soft mb-3">quem NÃO sabia que dava → participou?</p>
          <Bar label="nunca participou" value={RUI.infoGap.naoSabiaNunca} max={RUI.infoGap.naoSabiaN} cor={COR.vermelho} highlight />
          <p className="text-creme-soft/70 text-xs mt-3 font-mono">{RUI.infoGap.naoSabiaNunca} de {RUI.infoGap.naoSabiaN} ({Math.round(100 * RUI.infoGap.naoSabiaNunca / RUI.infoGap.naoSabiaN)}%). Saber que o canal existe já É meio caminho — &ldquo;sabia e já fui&rdquo; foi só 1 em 44.</p>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
          <div>
            <Tag cor={COR.amarelo}>sabia que dá pra participar? (Rui)</Tag>
            <div className="space-y-3">{RUI.sabia.map(([l, v], i) => <Bar key={l} label={l} value={v} max={RUI.sabia[0][1]} cor={COR.amarelo} delay={i * 0.05} highlight={l === "não sabia que dava"} />)}</div>
          </div>
          <div>
            <Tag cor={COR.laranja}>já participou de algo? (Rui)</Tag>
            <div className="space-y-3">{RUI.participou.map(([l, v], i) => <Bar key={l} label={l} value={v} max={RUI.participou[0][1]} delay={i * 0.05} highlight={l === "nunca"} />)}</div>
          </div>
        </div>
        <Reveal delay={0.28}>
          <p className="text-creme text-lg md:text-xl leading-relaxed mt-10 max-w-[48ch]">
            Informar os canais é a intervenção <strong className="text-laranja">mais barata que existe</strong> — e
            a de maior efeito. Vale nos dois encontros: no Oziel, {OZIEL.infoGap.naoSabiaPct}% também não sabiam.
          </p>
        </Reveal>
      </Secao>

      {/* ░░ ACHADO OCULTO 4 — silêncio treinável ░░ */}
      <div className="bg-grafite-2 border-y-2 border-grafite-3">
        <Secao>
          <Reveal><Stamp cor={COR.verde}>05 · o que dá pra mudar</Stamp></Reveal>
          <Reveal delay={0.1}><h2 className="brand-lockup text-[2rem] leading-[0.95] sm:text-5xl md:text-6xl mt-5 mb-4">Silêncio é treinável</h2></Reveal>
          <Reveal delay={0.15}><p className="text-creme-soft text-lg leading-relaxed max-w-[48ch] mb-9">Quem discute política em <em>algum</em> lugar se sente mais à vontade pra opinar. Nos dois encontros. Falar gera conforto pra falar — e isso a oficina entrega de graça.</p></Reveal>
          <div className="grid sm:grid-cols-2 gap-6">
            {[OZIEL, RUI].map((c) => {
              const acc = c.id === "oziel" ? COR.laranja : COR.verde
              return (
                <Reveal key={c.id} className="bg-grafite border-2 border-grafite-3 rounded-2xl p-5">
                  <p className="brand-label text-[10px] mb-4" style={{ color: acc }}>{c.local}</p>
                  <div className="flex items-end justify-between gap-4">
                    <div className="text-center flex-1">
                      <p className="brand-lockup text-4xl text-creme-soft/70">{c.silencio.mudo.toFixed(2)}</p>
                      <p className="text-creme-soft/60 text-[11px] mt-1">&ldquo;não discuto&rdquo;<br /><span className="font-mono text-creme-soft/40">n{c.silencio.nMudo}</span></p>
                    </div>
                    <span className="brand-lockup text-2xl text-creme-soft/30 pb-5">→</span>
                    <div className="text-center flex-1">
                      <p className="brand-lockup text-4xl" style={{ color: acc }}>{c.silencio.fala.toFixed(2)}</p>
                      <p className="text-creme-soft/60 text-[11px] mt-1">discute em algum lugar<br /><span className="font-mono text-creme-soft/40">n{c.silencio.nFala}</span></p>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
          <Reveal delay={0.1}><p className="brand-label text-[9px] text-creme-soft/40 mt-4 text-center">à vontade pra opinar · escala 1–5</p></Reveal>

          <Reveal className="mt-14"><h3 className="brand-lockup text-3xl md:text-4xl mb-2">Fatalismo, não ignorância</h3></Reveal>
          <Reveal delay={0.1}><p className="text-creme-soft text-base mb-6 max-w-[46ch]">A barreira nº1 pra participar — nos dois lugares — não é &ldquo;não entendo&rdquo;. É &ldquo;não muda nada&rdquo;.</p></Reveal>
          <div className="space-y-3">{RUI.afasta.map(([l, v], i) => <Bar key={l} label={l} value={v} max={RUI.afasta[0][1]} cor={COR.vermelho} delay={i * 0.04} highlight={l === "não muda nada"} />)}</div>
          <Reveal delay={0.1}><p className="brand-label text-[9px] text-creme-soft/40 mt-3">o que mais afasta de participar · Rui Rodrigues</p></Reveal>
        </Secao>
      </div>

      {/* ░░ PROVA DE IMPACTO — avaliação ░░ */}
      <Secao>
        <Reveal><Stamp cor={COR.verde}>06 · a prova de impacto</Stamp></Reveal>
        <Reveal delay={0.1}><h2 className="brand-lockup text-[2rem] leading-[0.95] sm:text-5xl md:text-6xl mt-5 mb-4">Antes × Depois</h2></Reveal>
        <Reveal delay={0.15}>
          <p className="text-creme-soft text-lg leading-relaxed max-w-[48ch] mb-9">
            Em Rui Rodrigues a avaliação pós-encontro entrou (<strong className="text-creme">N={AVALIACAO.n}</strong>).
            Cada jovem reportou o próprio salto. O delta apareceu <strong className="text-creme">sozinho</strong> —
            e o maior deles foi o <strong className="text-verde">medo</strong>.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {AVALIACAO.cards.map((c, i) => (
            <Reveal key={c.l} delay={i * 0.08} className="bg-grafite-2 border-2 border-grafite-3 rounded-xl p-5">
              <p className="brand-label text-[9px] text-creme-soft/50 mb-3">{c.l}</p>
              <p className="brand-lockup text-5xl leading-none" style={{ color: corOf(c.cor) }}>{c.pct}%</p>
              <p className="font-mono text-xs text-creme-soft/70 mt-2">{c.n}</p>
              <p className="font-mono text-[10px] text-creme-soft/40 mt-1">{c.nota}</p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2} className="mt-8 zine-edge bg-grafite-2 border-2 border-verde/40 rounded-2xl p-5">
          <p className="brand-label text-[10px] text-verde mb-2">o dado oculto da avaliação</p>
          <p className="text-creme-soft text-sm leading-relaxed">
            Confiança subiu menos (45%) que vontade (55%) e medo (84%). Faz sentido:
            <strong className="text-creme"> um encontro tira o medo antes de dar confiança</strong>. Coragem vem primeiro,
            domínio vem com repetição. O número desenha o próximo passo — mais encontros.
          </p>
        </Reveal>
        <Reveal delay={0.25}><p className="text-creme-soft/40 text-[11px] font-mono mt-5">auto-relato pós-encontro · N={AVALIACAO.n} · {AVALIACAO.perfil.genero}, {AVALIACAO.perfil.raca} · comparação de grupo, nunca de pessoa · indicativo, não conclusivo.</p></Reveal>
      </Secao>

      {/* ░░ A PORTA É O CONCRETO — vozes ░░ */}
      <div className="bg-grafite-2 border-y-2 border-grafite-3">
        <Secao>
          <Reveal><Stamp cor={COR.laranja}>07 · pela porta do cotidiano</Stamp></Reveal>
          <Reveal delay={0.1}><h2 className="brand-lockup text-[2rem] leading-[0.95] sm:text-5xl md:text-6xl mt-5 mb-4">A porta é o concreto</h2></Reveal>
          <Reveal delay={0.15}>
            <p className="text-creme-soft text-lg leading-relaxed max-w-[46ch] mb-8">
              Perguntados o que os faria participar, ninguém falou em partido. Falaram do que dá pra tocar:
            </p>
          </Reveal>
          <div className="flex flex-wrap gap-3 mb-12">
            {VOZES.map((v, i) => (
              <Reveal key={v} delay={i * 0.06}>
                <span className="inline-block zine-edge bg-grafite border-2 border-grafite-3 rounded-xl px-4 py-3 text-creme italic">&ldquo;{v}&rdquo;</span>
              </Reveal>
            ))}
          </div>
          <Reveal><h3 className="brand-lockup text-2xl md:text-3xl mb-4">…e o que eles já chamam de política</h3></Reveal>
          <Reveal delay={0.1}><p className="text-creme-soft text-sm max-w-[46ch] mb-6">Depois da oficina, em Rui Rodrigues, &ldquo;política&rdquo; deixou de ser só urna:</p></Reveal>
          <div className="space-y-3">{AVALIACAO.politica.map(([l, v], i) => <Bar key={l} label={l} value={v} max={AVALIACAO.politica[0][1]} cor={COR.verde} delay={i * 0.04} highlight={i < 3} />)}</div>
        </Secao>
      </div>

      {/* ░░ TRÊS NÚMEROS ░░ */}
      <Secao>
        <Reveal><Stamp>08 · o resumo numérico</Stamp></Reveal>
        <Reveal delay={0.1}><h2 className="brand-lockup text-[2rem] leading-[0.95] sm:text-5xl md:text-6xl mt-5 mb-10">Três números<br />que contam tudo</h2></Reveal>
        <div className="space-y-4">
          <Corr r={OZIEL.corr.afetaVoz} label="afeta a vida × vontade de opinar" txt="relevância destrava a voz (Oziel)" cor={COR.laranja} />
          <Corr r={OZIEL.corr.confiaVoz} label="confiar em eleitos × vontade de opinar" txt="descrença não tira a voz (Oziel)" cor={COR.creme} />
          <Corr r={RUI.infoGap.nuncaPct / 100} label="sente que afeta, mas nunca agiu" txt="o gargalo é a porta, não a vontade (Rui)" cor={COR.vermelho} />
        </div>
        <Reveal delay={0.2}><p className="text-creme-soft/50 text-[11px] font-mono mt-5">Pearson · fichas completas · indicativo, não conclusivo</p></Reveal>
      </Secao>

      {/* ░░ CTA escolas ░░ */}
      <section className="bg-halftone bg-halftone-veil">
        <div className="relative z-10 px-6 py-28 md:py-36 max-w-3xl mx-auto">
          <Reveal><Stamp cor={COR.verde}>09 · pra escola adotar</Stamp></Reveal>
          <Reveal delay={0.1}><h2 className="brand-lockup text-5xl md:text-7xl mt-6 mb-8 leading-[0.85]">Da quebrada,<br /><span className="text-laranja">pra quebrada</span></h2></Reveal>
          <div className="space-y-4">
            {[
              ["Diagnóstico grátis e não-partidário", "metade dos alunos não sabe que dá pra participar — lacuna de currículo, sem briga ideológica."],
              ["Alavanca certa por escola", "Oziel destrava por relevância; Rui Rodrigues por informação. O painel mostra qual chave usar onde."],
              ["Prova de impacto", "84% saíram com menos medo de falar. Vira número pra relatório, edital e financiamento da própria escola."],
              ["Comparável e replicável", "dois encontros já mostram padrão. Cada nova turma entra no mesmo retrato."],
            ].map(([t, d], i) => (
              <Reveal key={t} delay={i * 0.08}>
                <div className="flex gap-4 bg-grafite-2/80 border-2 border-grafite-3 rounded-2xl p-5">
                  <span className="brand-lockup text-laranja text-3xl shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="text-creme font-bold">{t}</p>
                    <p className="text-creme-soft text-sm mt-1 leading-relaxed">{d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2}>
            <p className="text-creme text-xl md:text-2xl leading-snug mt-12 max-w-[40ch] brand-lockup">
              A juventude não desistiu de si.<br /><span className="text-laranja">desistiu do sistema.</span><br />a voz tá aí — falta a porta.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="flex flex-wrap gap-3 mt-12">
              <Link href="/dados" className="zine-edge bg-laranja text-grafite brand-lockup text-lg px-6 py-3 rounded-xl">ver dados ao vivo →</Link>
              <Link href="/" className="border-2 border-grafite-3 text-creme-soft brand-lockup text-lg px-6 py-3 rounded-xl hover:border-creme/30 transition-colors">jogar</Link>
            </div>
          </Reveal>
          <p className="brand-stamp text-[10px] text-creme-soft/40 mt-16 leading-relaxed">
            Vozes do Oziel · Grupo Diálogos / CriaLab · {TOTAIS.fichas} fichas · {TOTAIS.encontros} encontros · dados abertos CC BY-SA 4.0
          </p>
          <DownloadGate />
        </div>
      </section>
    </main>
  )
}
