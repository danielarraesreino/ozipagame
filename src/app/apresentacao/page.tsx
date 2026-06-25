"use client"

import { motion, useScroll, useSpring } from "framer-motion"
import Link from "next/link"

/* ───────────────────────────────────────────────────────────────────────────
   APRESENTAÇÃO — Dossiê de dados "Vozes do Oziel"
   Baseline validado N=30 (pesquisa de entrada). Números reais, curados à mão a
   partir da análise (docs/analise_pesquisa.md). Estética: zine/risograph de
   protesto — grafite, halftone, Archivo black, mono, sombra dura, grão.
   ─────────────────────────────────────────────────────────────────────────── */

const N = 30

const COR = {
  laranja: "var(--color-laranja)",
  amarelo: "var(--color-amarelo)",
  verde: "var(--color-verde)",
  vermelho: "var(--color-vermelho)",
  creme: "var(--color-creme)",
  cinza: "var(--color-grafite-3)",
}

// ── primitivas de animação ──────────────────────────────────────────────────
function Reveal({ children, delay = 0, y = 28, className = "" }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function Bar({ label, value, max, cor = COR.laranja, suffix = "", highlight = false, delay = 0 }: {
  label: string; value: number; max: number; cor?: string; suffix?: string; highlight?: boolean; delay?: number
}) {
  const pct = Math.max(2, (value / max) * 100)
  const naoResp = label.toLowerCase().includes("sem resposta")
  return (
    <div className={highlight ? "relative" : ""}>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className={`text-sm ${highlight ? "text-creme font-bold" : naoResp ? "text-creme-soft/40 italic" : "text-creme-soft"}`}>
          {highlight && "▸ "}{label}
        </span>
        <span className={`font-mono text-sm ${highlight ? "text-laranja font-bold" : naoResp ? "text-creme-soft/40" : "text-creme"}`}>{value}{suffix}</span>
      </div>
      <div className="h-3 bg-grafite rounded-sm overflow-hidden border border-grafite-3">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-sm"
          style={{ background: naoResp ? COR.cinza : cor, boxShadow: highlight ? `0 0 18px ${cor}66` : "none" }}
        />
      </div>
    </div>
  )
}

function Stamp({ children, cor = COR.laranja }: { children: React.ReactNode; cor?: string }) {
  return (
    <span className="brand-stamp inline-block text-[10px] px-3 py-1 rounded-full border-2" style={{ color: cor, borderColor: `${cor}66` }}>
      {children}
    </span>
  )
}

function Secao({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`relative px-6 py-24 md:py-32 max-w-3xl mx-auto ${className}`}>
      {children}
    </section>
  )
}

// dados (validados)
const BAIRROS = [["Parque Oziel", 10], ["Jardim Monte Cristo", 8], ["Gleba B", 5], ["Outro bairro", 4], ["Jardim do Lago", 2], ["Campo Grande", 1]] as const
const IDADES = [["12–13", 16], ["16–17", 6], ["18+", 5], ["14–15", 3]] as const
const SENTIMENTOS = [["vontade de mudar algo", 11], ["não é pra mim", 9], ["curiosidade", 8], ["raiva / nojo", 2], ["medo de falar errado", 2], ["distante de mim", 2], ["desânimo", 1]] as const
const AFASTA = [["não muda nada", 9], ["é tudo corrupto", 6], ["não entendo do assunto", 6], ["medo de me expor", 5], ["nada me afasta", 4], ["ninguém escuta jovem", 4], ["não tenho tempo", 1], ["sem resposta", 4]] as const
const PARTICIPOU = [["nunca", 19], ["às vezes", 6], ["sempre que dá", 4], ["uma vez", 1]] as const
const SABIA = [["não sabia que dava", 14], ["sabia mas nunca fui", 9], ["sem resposta", 5], ["sabia e já fui", 2]] as const
const IDADE_TAB = [
  { faixa: "12–13", afeta: 2.73, avontade: 2.67, confia: 2.20, n: 16 },
  { faixa: "14–15", afeta: 2.67, avontade: 2.33, confia: 2.00, n: 3 },
  { faixa: "16–17", afeta: 2.67, avontade: 3.00, confia: 1.67, n: 6, hl: true },
  { faixa: "18+", afeta: 4.00, avontade: 2.50, confia: 2.67, n: 5 },
]
const BAIRRO_AFETA = [
  { b: "Jardim Monte Cristo", afeta: 2.0, nunca: "7/8", hl: true },
  { b: "Parque Oziel (sede)", afeta: 2.7, nunca: "4/10" },
  { b: "Gleba B", afeta: 3.0, nunca: "4/5" },
  { b: "Outro bairro", afeta: 4.33, nunca: "3/4" },
]
const VOZES = ["se tivesse menos lixo", "ter parquinho conservado", "aula de vôlei", "aula de canto", "liberar o celular", "lutaria mais por moradia"]

export default function Apresentacao() {
  const { scrollYProgress } = useScroll()
  const barra = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })

  return (
    <main className="bg-grafite text-creme overflow-x-hidden">
      {/* barra de progresso */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 z-50 origin-left" style={{ scaleX: barra, background: COR.laranja }} />

      {/* link discreto */}
      <Link href="/" className="fixed top-4 right-5 z-50 brand-stamp text-[10px] text-creme-soft/60 hover:text-laranja transition-colors">← início</Link>

      {/* ░░ CAPA ░░ */}
      <section className="bg-halftone bg-halftone-veil min-h-screen flex flex-col justify-center px-6">
        <div className="relative z-10 max-w-3xl mx-auto w-full">
          <Reveal><Stamp>Dossiê de dados · Grupo Diálogos / CriaLab</Stamp></Reveal>
          <Reveal delay={0.1}>
            <h1 className="brand-lockup text-creme mt-6 text-[16vw] md:text-[7rem] leading-[0.82]">
              O que a<br /><span className="text-laranja">quebrada</span><br />respondeu
            </h1>
          </Reveal>
          <Reveal delay={0.25}>
            <p className="text-creme-soft text-base md:text-lg mt-6 max-w-[44ch] leading-relaxed">
              Pesquisa de entrada com a juventude do Parque Oziel, Campinas. O retrato
              de antes da oficina — e o que os números escondem nas entrelinhas.
            </p>
          </Reveal>
          <Reveal delay={0.4} className="mt-8 flex flex-wrap gap-3 items-center">
            <span className="brand-lockup text-laranja text-6xl md:text-7xl">{N}</span>
            <div className="font-mono text-xs text-creme-soft/70 leading-tight">
              fichas reais validadas<br />
              <span className="text-creme-soft/40">testes removidos · brancos = sem resposta</span>
            </div>
          </Reveal>
          <motion.div
            animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}
            className="mt-16 brand-stamp text-[10px] text-creme-soft/50"
          >↓ role pra ver</motion.div>
        </div>
      </section>

      {/* ░░ A TURMA ░░ */}
      <Secao>
        <Reveal><Stamp cor={COR.amarelo}>01 · quem respondeu</Stamp></Reveal>
        <Reveal delay={0.1}>
          <h2 className="brand-lockup text-4xl md:text-6xl mt-5 mb-3">A turma</h2>
          <p className="text-creme-soft text-lg leading-relaxed max-w-[46ch] mb-10">
            Jovem e de escola pública. <strong className="text-creme">53%</strong> têm 12–13 anos.
            <strong className="text-creme"> 70%</strong> estudam em escola pública. É da quebrada que vem a voz.
          </p>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
          <Reveal>
            <p className="brand-label text-[10px] text-laranja mb-3">de onde vêm</p>
            <div className="space-y-3">{BAIRROS.map(([l, v], i) => <Bar key={l} label={l} value={v} max={10} delay={i * 0.05} highlight={l === "Jardim Monte Cristo"} />)}</div>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="brand-label text-[10px] text-amarelo mb-3">idade</p>
            <div className="space-y-3 mb-8">{IDADES.map(([l, v], i) => <Bar key={l} label={l} value={v} max={16} cor={COR.amarelo} delay={i * 0.05} />)}</div>
            <div className="zine-edge bg-grafite-2 border-2 border-grafite-3 rounded-2xl p-5">
              <p className="brand-lockup text-creme text-5xl">70%</p>
              <p className="text-creme-soft text-sm mt-1">escola pública (21 de 30)</p>
            </div>
          </Reveal>
        </div>
        <Reveal className="mt-12">
          <p className="brand-label text-[10px] text-laranja mb-3">quando o assunto é política, sentem…</p>
          <div className="space-y-3">{SENTIMENTOS.map(([l, v], i) => <Bar key={l} label={l} value={v} max={11} delay={i * 0.04} highlight={l === "vontade de mudar algo" || l === "não é pra mim"} />)}</div>
          <p className="text-creme-soft text-sm mt-4 max-w-[46ch] leading-relaxed">
            A tensão central: <strong className="text-creme">esperança</strong> (&ldquo;vontade de mudar algo&rdquo;, 11) empatada com
            <strong className="text-creme"> alienação</strong> (&ldquo;não é pra mim&rdquo;, 9).
          </p>
        </Reveal>
      </Secao>

      {/* ░░ ACHADO 1 — cinismo não mata a voz ░░ */}
      <div className="bg-grafite-2 border-y-2 border-grafite-3">
        <Secao>
          <Reveal><Stamp>02 · o achado que vira a mesa</Stamp></Reveal>
          <Reveal delay={0.1}>
            <h2 className="brand-lockup text-4xl md:text-6xl mt-5 mb-8 leading-[0.9]">
              Cinismo <span className="text-vermelho">não</span><br />mata a voz
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            <Reveal className="zine-edge bg-grafite border-2 border-grafite-3 rounded-2xl p-6 text-center">
              <p className="brand-lockup text-vermelho text-6xl md:text-7xl">−0,03</p>
              <p className="text-creme-soft text-xs md:text-sm mt-3">confiar em político <br />× vontade de opinar</p>
              <p className="text-creme/60 text-[11px] mt-2 font-mono">≈ zero</p>
            </Reveal>
            <Reveal delay={0.15} className="zine-edge bg-grafite border-2 border-laranja/40 rounded-2xl p-6 text-center">
              <p className="brand-lockup text-laranja text-6xl md:text-7xl">+0,52</p>
              <p className="text-creme-soft text-xs md:text-sm mt-3">sentir que afeta a vida<br />× vontade de opinar</p>
              <p className="text-laranja/80 text-[11px] mt-2 font-mono">a alavanca</p>
            </Reveal>
          </div>
          <Reveal delay={0.25}>
            <p className="text-creme text-lg md:text-xl leading-relaxed mt-10 max-w-[48ch]">
              Quem desconfia de político quer falar <em className="text-laranja not-italic font-bold">do mesmo jeito</em> que
              quem confia. A juventude do Oziel não está apática — está <strong>descrente</strong>. E
              isso é outra coisa: <strong className="text-creme">a voz está intacta</strong>. Não precisamos
              devolver a fé na política pra mobilizar.
            </p>
          </Reveal>
        </Secao>
      </div>

      {/* ░░ ACHADO 2 — a alavanca é relevância ░░ */}
      <Secao>
        <Reveal><Stamp cor={COR.verde}>03 · a alavanca</Stamp></Reveal>
        <Reveal delay={0.1}>
          <h2 className="brand-lockup text-4xl md:text-6xl mt-5 mb-4">A porta é o concreto</h2>
          <p className="text-creme-soft text-lg leading-relaxed max-w-[46ch] mb-8">
            O que abre a fala não é ideologia — é sentir que política mexe com a vida.
            Perguntados o que os faria participar, responderam <strong className="text-creme">serviço e atividade</strong>, não partido:
          </p>
        </Reveal>
        <div className="flex flex-wrap gap-3">
          {VOZES.map((v, i) => (
            <Reveal key={v} delay={i * 0.07}>
              <span className="inline-block zine-edge bg-grafite-2 border-2 border-grafite-3 rounded-xl px-4 py-3 text-creme italic">&ldquo;{v}&rdquo;</span>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <p className="text-creme-soft text-base mt-8 max-w-[48ch] leading-relaxed">
            Menos lixo, parquinho, quadra, moradia. Eles entram pela porta do cotidiano —
            <strong className="text-creme"> mostra que política é isso, e a fala destrava.</strong>
          </p>
        </Reveal>
      </Secao>

      {/* ░░ ACHADO 3 — info-gap ░░ */}
      <div className="bg-halftone bg-halftone-veil">
        <Secao>
          <div className="relative z-10">
            <Reveal><Stamp cor={COR.amarelo}>04 · o gargalo</Stamp></Reveal>
            <Reveal delay={0.1}>
              <h2 className="brand-lockup text-4xl md:text-6xl mt-5 mb-8">O gargalo é a porta,<br />não a vontade</h2>
            </Reveal>
            <div className="grid grid-cols-2 gap-4 md:gap-8 mb-10">
              <Reveal className="text-center">
                <p className="brand-lockup text-amarelo text-7xl md:text-8xl">47%</p>
                <p className="text-creme-soft text-sm mt-2">não sabiam que dá<br />pra participar</p>
              </Reveal>
              <Reveal delay={0.15} className="text-center">
                <p className="brand-lockup text-laranja text-7xl md:text-8xl">63%</p>
                <p className="text-creme-soft text-sm mt-2">nunca participaram<br />de nada no bairro</p>
              </Reveal>
            </div>
            <Reveal delay={0.2}>
              <div className="zine-edge bg-grafite-2 border-2 border-grafite-3 rounded-2xl p-5">
                <p className="brand-label text-[10px] text-creme-soft mb-3">quem NÃO sabia que dava → participou?</p>
                <Bar label="nunca participou" value={10} max={14} cor={COR.vermelho} highlight />
                <p className="text-creme-soft/70 text-xs mt-3 font-mono">10 de 14 (71%). Saber que existe canal É participar: &ldquo;sabia e já fui&rdquo; = só 2 de 30.</p>
              </div>
            </Reveal>
            <div className="grid md:grid-cols-2 gap-x-10 gap-y-8 mt-10">
              <Reveal>
                <p className="brand-label text-[10px] text-amarelo mb-3">sabia que dá pra participar?</p>
                <div className="space-y-3">{SABIA.map(([l, v], i) => <Bar key={l} label={l} value={v} max={14} cor={COR.amarelo} delay={i * 0.05} highlight={l === "não sabia que dava"} />)}</div>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="brand-label text-[10px] text-laranja mb-3">já participou de algo no bairro?</p>
                <div className="space-y-3">{PARTICIPOU.map(([l, v], i) => <Bar key={l} label={l} value={v} max={19} delay={i * 0.05} highlight={l === "nunca"} />)}</div>
              </Reveal>
            </div>
            <Reveal delay={0.28}>
              <p className="text-creme text-lg md:text-xl leading-relaxed mt-10 max-w-[48ch]">
                Informar os canais é a intervenção <strong className="text-laranja">mais barata que existe</strong> —
                e a de maior efeito.
              </p>
            </Reveal>
          </div>
        </Secao>
      </div>

      {/* ░░ ACHADO 4 — cohort 16-17 ░░ */}
      <Secao>
        <Reveal><Stamp>05 · o cohort-alavanca</Stamp></Reveal>
        <Reveal delay={0.1}>
          <h2 className="brand-lockup text-4xl md:text-6xl mt-5 mb-4">16–17: confia menos,<br />fala mais</h2>
          <p className="text-creme-soft text-lg leading-relaxed max-w-[46ch] mb-8">
            Desconfiados e vocais. É onde a energia pra canalizar mora — e onde a oficina rende mais.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="zine-edge bg-grafite-2 border-2 border-grafite-3 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 brand-label text-[9px] text-creme-soft/60 px-4 py-3 border-b border-grafite-3">
              <span>idade</span><span className="text-right">afeta</span><span className="text-right">à vontade</span><span className="text-right">confia</span>
            </div>
            {IDADE_TAB.map((r) => (
              <div key={r.faixa} className={`grid grid-cols-4 px-4 py-3 items-center text-sm ${r.hl ? "bg-laranja/10" : ""} border-b border-grafite-3/50 last:border-0`}>
                <span className={r.hl ? "text-laranja font-bold" : "text-creme"}>{r.hl && "▸ "}{r.faixa} <span className="text-creme-soft/40 font-mono text-[10px]">n{r.n}</span></span>
                <span className="text-right font-mono text-creme-soft">{r.afeta.toFixed(2)}</span>
                <span className={`text-right font-mono ${r.hl ? "text-laranja font-bold" : "text-creme-soft"}`}>{r.avontade.toFixed(2)}</span>
                <span className={`text-right font-mono ${r.hl ? "text-vermelho font-bold" : "text-creme-soft"}`}>{r.confia.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <p className="text-creme-soft/50 text-[11px] font-mono mt-3">escala 1–5 · células pequenas (n3–n6) = tendência, não conclusão</p>
        </Reveal>
      </Secao>

      {/* ░░ ACHADO 5 — CEP do desengajamento ░░ */}
      <div className="bg-grafite-2 border-y-2 border-grafite-3">
        <Secao>
          <Reveal><Stamp cor={COR.vermelho}>06 · o mapa</Stamp></Reveal>
          <Reveal delay={0.1}>
            <h2 className="brand-lockup text-4xl md:text-6xl mt-5 mb-4">O desengajamento<br />tem CEP</h2>
            <p className="text-creme-soft text-lg leading-relaxed max-w-[46ch] mb-8">
              Quanto menos a turma sente que política afeta a vida, menos participa. E isso varia por bairro.
            </p>
          </Reveal>
          <div className="space-y-4">
            {BAIRRO_AFETA.map((r, i) => (
              <Reveal key={r.b} delay={i * 0.08}>
                <div className={`flex items-center gap-4 rounded-xl p-4 border-2 ${r.hl ? "border-vermelho/50 bg-vermelho/5 zine-edge" : "border-grafite-3 bg-grafite"}`}>
                  <div className="flex-1">
                    <p className={`text-sm ${r.hl ? "text-creme font-bold" : "text-creme-soft"}`}>{r.hl && "▸ "}{r.b}</p>
                    <p className="text-creme-soft/50 text-xs font-mono mt-0.5">{r.nunca} nunca participaram</p>
                  </div>
                  <div className="text-right">
                    <p className={`brand-lockup text-3xl ${r.hl ? "text-vermelho" : "text-creme-soft"}`}>{r.afeta.toFixed(2)}</p>
                    <p className="text-creme-soft/40 text-[10px] font-mono">afeta /5</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3}>
            <p className="text-creme text-lg leading-relaxed mt-8 max-w-[48ch]">
              <strong className="text-vermelho">Jardim Monte Cristo</strong>: 7 de 8 nunca participaram, menor
              percepção de relevância. <strong className="text-creme">É onde a oficina precisa chegar primeiro.</strong>
            </p>
          </Reveal>
        </Secao>
      </div>

      {/* ░░ ACHADO 6+7 — silêncio & fatalismo ░░ */}
      <Secao>
        <Reveal><Stamp cor={COR.verde}>07 · o que dá pra mudar</Stamp></Reveal>
        <Reveal delay={0.1}>
          <h2 className="brand-lockup text-4xl md:text-6xl mt-5 mb-10">Silêncio é treinável</h2>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-6 mb-14">
          <Reveal className="zine-edge bg-grafite-2 border-2 border-grafite-3 rounded-2xl p-6 text-center">
            <p className="brand-lockup text-creme-soft text-5xl">2,11</p>
            <p className="text-creme-soft text-sm mt-2">à vontade de quem<br /><strong className="text-creme">&ldquo;não discuto&rdquo;</strong></p>
          </Reveal>
          <Reveal delay={0.15} className="zine-edge bg-grafite-2 border-2 border-verde/40 rounded-2xl p-6 text-center">
            <p className="brand-lockup text-verde text-5xl">2,95</p>
            <p className="text-creme-soft text-sm mt-2">à vontade de quem<br /><strong className="text-creme">discute em algum lugar</strong></p>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <p className="text-creme text-lg leading-relaxed max-w-[48ch] mb-12">
            Falar gera conforto pra falar. O próprio <strong className="text-verde">espaço de conversa é a intervenção</strong> —
            não precisa de mais nada além de abrir a roda.
          </p>
        </Reveal>

        <Reveal><h3 className="brand-lockup text-3xl md:text-4xl mb-2">Fatalismo, não ignorância</h3></Reveal>
        <Reveal delay={0.1}><p className="text-creme-soft text-base mb-6 max-w-[46ch]">A barreira nº1 pra participar não é &ldquo;não entendo&rdquo; — é &ldquo;não muda nada&rdquo;.</p></Reveal>
        <div className="space-y-3">
          {AFASTA.map(([l, v], i) => <Bar key={l} label={l} value={v} max={9} cor={COR.vermelho} delay={i * 0.04} highlight={l === "não muda nada"} />)}
        </div>
      </Secao>

      {/* ░░ CORRELAÇÕES ░░ */}
      <div className="bg-grafite-2 border-y-2 border-grafite-3">
        <Secao>
          <Reveal><Stamp>08 · o resumo numérico</Stamp></Reveal>
          <Reveal delay={0.1}><h2 className="brand-lockup text-4xl md:text-6xl mt-5 mb-10">Três números<br />que contam tudo</h2></Reveal>
          <div className="space-y-4">
            {[
              { par: "afeta a vida × vontade de opinar", r: "+0,52", cor: COR.laranja, txt: "relevância destrava a voz" },
              { par: "confia em eleitos × vontade de opinar", r: "−0,03", cor: COR.creme, txt: "descrença não tira a voz" },
              { par: "confia em eleitos × afeta a vida", r: "−0,04", cor: COR.creme, txt: "independentes" },
            ].map((c, i) => (
              <Reveal key={c.par} delay={i * 0.1}>
                <div className="flex items-center gap-4 md:gap-6 bg-grafite border-2 border-grafite-3 rounded-xl p-5">
                  <p className="brand-lockup text-4xl md:text-5xl leading-none whitespace-nowrap w-32 md:w-40 shrink-0" style={{ color: c.cor }}>{c.r}</p>
                  <div className="min-w-0">
                    <p className="text-creme text-sm font-bold">{c.par}</p>
                    <p className="text-creme-soft/60 text-xs mt-0.5">{c.txt}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2}><p className="text-creme-soft/50 text-[11px] font-mono mt-5">Pearson · N=30 · indicativo, não conclusivo</p></Reveal>
        </Secao>
      </div>

      {/* ░░ ANTES × DEPOIS (pendente) ░░ */}
      <Secao>
        <Reveal><Stamp cor={COR.amarelo}>09 · o que vem aí</Stamp></Reveal>
        <Reveal delay={0.1}><h2 className="brand-lockup text-4xl md:text-6xl mt-5 mb-4">Antes × Depois</h2></Reveal>
        <Reveal delay={0.15}>
          <p className="text-creme-soft text-lg leading-relaxed max-w-[48ch] mb-8">
            Este é o <strong className="text-creme">antes</strong>. Quando a avaliação pós-encontro entrar,
            medimos o delta de cada alavanca — relevância subiu? o info-gap caiu? o medo diminuiu? —
            e a prova de impacto aparece sozinha.
          </p>
        </Reveal>
        <div className="grid grid-cols-2 gap-4">
          {[["afeta a vida", "2,89", "?"], ["à vontade pra opinar", "2,68", "?"], ["não sabia que dava", "47%", "?"], ["nunca participou", "63%", "?"]].map(([l, antes, depois], i) => (
            <Reveal key={l} delay={i * 0.08} className="bg-grafite-2 border-2 border-grafite-3 rounded-xl p-4">
              <p className="brand-label text-[9px] text-creme-soft/50 mb-2">{l}</p>
              <div className="flex items-end gap-2">
                <span className="brand-lockup text-creme text-3xl">{antes}</span>
                <span className="text-creme-soft/40 text-xl">→</span>
                <span className="brand-lockup text-amarelo/40 text-3xl">{depois}</span>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}><p className="text-creme-soft/40 text-[11px] font-mono mt-5">comparação de grupo (cross-section anônimo), nunca de pessoa.</p></Reveal>
      </Secao>

      {/* ░░ CTA — escolas ░░ */}
      <section className="bg-halftone bg-halftone-veil">
        <div className="relative z-10 px-6 py-28 md:py-36 max-w-3xl mx-auto">
          <Reveal><Stamp cor={COR.verde}>10 · pra escola adotar</Stamp></Reveal>
          <Reveal delay={0.1}>
            <h2 className="brand-lockup text-5xl md:text-7xl mt-6 mb-8 leading-[0.85]">
              Da quebrada,<br /><span className="text-laranja">pra quebrada</span>
            </h2>
          </Reveal>
          <div className="space-y-4">
            {[
              ["Diagnóstico grátis e não-partidário", "47% dos alunos não sabem que dá pra participar — lacuna de currículo, sem briga ideológica."],
              ["Intervenção barata, efeito alto", "só informar os canais já move o ponteiro. Não precisa de programa caro."],
              ["Prova de impacto", "o Antes×Depois vira número pra relatório, edital e financiamento da própria escola."],
              ["Painel por escola/bairro", "cada unidade vê o próprio dado — senso de dono e comparação saudável."],
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
              A juventude não desistiu de si.<br />
              <span className="text-laranja">desistiu do sistema.</span><br />
              a voz tá aí — falta a porta.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="flex flex-wrap gap-3 mt-12">
              <Link href="/dados" className="zine-edge bg-laranja text-grafite brand-lockup text-lg px-6 py-3 rounded-xl">ver dados ao vivo →</Link>
              <Link href="/" className="border-2 border-grafite-3 text-creme-soft brand-lockup text-lg px-6 py-3 rounded-xl hover:border-creme/30 transition-colors">jogar</Link>
            </div>
          </Reveal>
          <p className="brand-stamp text-[10px] text-creme-soft/40 mt-16 leading-relaxed">
            Vozes do Oziel · Grupo Diálogos / CriaLab · baseline N=30 · dados abertos CC BY-SA 4.0
          </p>
        </div>
      </section>
    </main>
  )
}
