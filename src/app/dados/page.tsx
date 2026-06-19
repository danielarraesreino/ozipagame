"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Logo from "@/components/Logo"
import { dilemas as hardcoded } from "@/lib/dilemas"
import { dilemas as gerados } from "@/lib/dilemas_gerados"
import type { Dilema } from "@/lib/dilemas"

interface Dados {
  licenca: string
  gerado_em: string
  jogo: {
    total_partidas: number
    por_bairro: Record<string, number>
    total_respostas: number
    por_dilema: { dilema_id: string; modulo: string | null; concordo: number; discordo: number }[]
    fact_check: Record<string, number>
  }
  pesquisa: {
    total: number
    faixa_idade: Record<string, number>
    estuda: Record<string, number>
    sentimentos: Record<string, number>
    afeta_vida: Escala
    avontade_opinar: Escala
    confia_eleitos: Escala
    afasta: Record<string, number>
    ja_participou: Record<string, number>
    onde_discute: Record<string, number>
    sabia_participar: Record<string, number>
  }
}

interface Escala { media: number | null; dist: Record<string, number> }

function Barras({ data, cor = "var(--color-laranja)" }: { data: Record<string, number>; cor?: string }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1])
  const max = Math.max(1, ...entries.map(([, n]) => n))
  if (!entries.length) return <p className="text-creme-soft/40 text-xs font-mono">sem dados ainda</p>
  return (
    <div className="space-y-2">
      {entries.map(([k, n]) => (
        <div key={k}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-creme-soft">{k}</span>
            <span className="text-creme font-mono">{n}</span>
          </div>
          <div className="h-2 bg-grafite-2 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(n / max) * 100}%`, background: cor }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function EscalaView({ e }: { e: Escala }) {
  if (e.media == null) return <p className="text-creme-soft/40 text-xs font-mono">sem dados ainda</p>
  return (
    <>
      <p className="brand-lockup text-creme text-3xl mb-3">
        {e.media}<span className="text-creme-soft/50 text-lg">/5</span>
      </p>
      <Barras data={e.dist} />
    </>
  )
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="grain relative bg-grafite-2 border-2 border-grafite-3 rounded-2xl p-5">
      <p className="brand-label text-[10px] text-laranja mb-4">{titulo}</p>
      {children}
    </section>
  )
}

export default function DadosPage() {
  const [d, setD] = useState<Dados | null>(null)
  const [erro, setErro] = useState(false)
  const [memeMap, setMemeMap] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch("/api/dados")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setD)
      .catch(() => setErro(true))

    // mapa id → texto do meme (pra mostrar a frase, não "d05")
    const base: Dilema[] = [...hardcoded, ...gerados]
    const m: Record<string, string> = {}
    base.forEach((x) => { m[x.id] = x.meme })
    fetch("/dilemas_importados.json")
      .then((r) => (r.ok ? r.json() : []))
      .then((arr: Dilema[]) => {
        arr.forEach((x) => { m[x.id] = x.meme })
        setMemeMap({ ...m })
      })
      .catch(() => setMemeMap(m))
  }, [])

  const meme = (id: string) => (memeMap[id] || id).replace(/^"|"$/g, "")

  return (
    <main className="bg-halftone bg-halftone-veil min-h-full">
      <div className="relative z-10 min-h-full px-5 py-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Logo size={40} variant="cor" />
          <h1 className="brand-lockup text-creme text-3xl">Dados abertos</h1>
        </div>
        <p className="text-creme-soft text-sm leading-relaxed mb-4 max-w-[48ch]">
          O que a juventude do Parque Oziel respondeu no jogo — <strong>100% anônimo</strong> e
          agregado. Nenhuma resposta individual, nenhum nome. Conhecimento da quebrada, aberto pra quebrada.
        </p>
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="brand-stamp text-[10px] text-verde border-2 border-verde/40 rounded-full px-3 py-1">
            CC BY-SA 4.0
          </span>
          <a
            href="/api/dados"
            target="_blank"
            rel="noopener noreferrer"
            className="brand-stamp text-[10px] text-creme-soft border-2 border-grafite-3 rounded-full px-3 py-1 hover:text-creme hover:border-laranja transition-colors"
          >
            ↓ baixar JSON
          </a>
          <Link
            href="/"
            className="brand-stamp text-[10px] text-creme-soft border-2 border-grafite-3 rounded-full px-3 py-1 hover:text-creme hover:border-laranja transition-colors"
          >
            ← jogar
          </Link>
        </div>

        {erro && (
          <div className="bg-grafite-2 border-2 border-grafite-3 rounded-2xl p-6 text-center">
            <p className="text-creme-soft text-sm">Dados ainda não disponíveis.</p>
            <p className="text-creme-soft/50 text-xs font-mono mt-1">
              (Supabase precisa estar configurado e com partidas registradas.)
            </p>
          </div>
        )}

        {!d && !erro && (
          <p className="text-creme-soft/50 text-sm font-mono text-center py-12">carregando…</p>
        )}

        {d && (
          <div className="space-y-5">
            {/* Resumo */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-grafite-2 border-2 border-grafite-3 rounded-2xl p-4 zine-edge">
                <p className="brand-lockup text-laranja text-4xl leading-none">{d.jogo.total_partidas}</p>
                <p className="text-creme-soft text-xs mt-1">partidas jogadas</p>
              </div>
              <div className="bg-grafite-2 border-2 border-grafite-3 rounded-2xl p-4 zine-edge">
                <p className="brand-lockup text-laranja text-4xl leading-none">{d.pesquisa.total}</p>
                <p className="text-creme-soft text-xs mt-1">vozes na pesquisa</p>
              </div>
            </div>

            <Secao titulo="de onde vêm as vozes">
              <Barras data={d.jogo.por_bairro} />
            </Secao>

            <Secao titulo="concordo × discordo — por dilema">
              {d.jogo.por_dilema.length === 0 ? (
                <p className="text-creme-soft/40 text-xs font-mono">sem respostas ainda</p>
              ) : (
                <div className="space-y-4">
                  {d.jogo.por_dilema.map((row) => {
                    const tot = row.concordo + row.discordo || 1
                    const pc = Math.round((row.concordo / tot) * 100)
                    return (
                      <div key={row.dilema_id}>
                        <p className="text-creme text-sm mb-1 line-clamp-2">"{meme(row.dilema_id)}"</p>
                        <div className="flex h-5 rounded-full overflow-hidden border border-grafite-3">
                          <div className="bg-verde flex items-center justify-start pl-2" style={{ width: `${pc}%` }}>
                            {pc >= 18 && <span className="text-grafite text-[10px] font-bold">{pc}%</span>}
                          </div>
                          <div className="bg-vermelho flex items-center justify-end pr-2" style={{ width: `${100 - pc}%` }}>
                            {100 - pc >= 18 && <span className="text-grafite text-[10px] font-bold">{100 - pc}%</span>}
                          </div>
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-creme-soft/60 mt-1">
                          <span className="text-verde">concordou {row.concordo}</span>
                          <span className="text-vermelho">discordou {row.discordo}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Secao>

            <Secao titulo="o que os memes escondiam (fact-check)">
              <Barras data={d.jogo.fact_check} cor="var(--color-amarelo)" />
            </Secao>

            {d.pesquisa.total > 0 && (
              <>
                <Secao titulo="quando o assunto é política, eles sentem…">
                  <Barras data={d.pesquisa.sentimentos} />
                </Secao>
                <Secao titulo='"política afeta minha vida no dia a dia"'>
                  <EscalaView e={d.pesquisa.afeta_vida} />
                </Secao>
                <Secao titulo='"me sinto à vontade pra opinar sobre política"'>
                  <EscalaView e={d.pesquisa.avontade_opinar} />
                </Secao>
                <Secao titulo='"dá pra confiar em quem é eleito"'>
                  <EscalaView e={d.pesquisa.confia_eleitos} />
                </Secao>
                <Secao titulo="o que mais afasta de participar">
                  <Barras data={d.pesquisa.afasta} cor="var(--color-vermelho)" />
                </Secao>
                <Secao titulo="já participaram de algo no bairro?">
                  <Barras data={d.pesquisa.ja_participou} cor="var(--color-verde)" />
                </Secao>
                <Secao titulo="sabiam que dá pra participar de decisão do bairro?">
                  <Barras data={d.pesquisa.sabia_participar} cor="var(--color-verde)" />
                </Secao>
                <Secao titulo="onde discutem política">
                  <Barras data={d.pesquisa.onde_discute} />
                </Secao>
                <div className="grid grid-cols-2 gap-3">
                  <Secao titulo="idade"><Barras data={d.pesquisa.faixa_idade} cor="var(--color-amarelo)" /></Secao>
                  <Secao titulo="estuda?"><Barras data={d.pesquisa.estuda} cor="var(--color-amarelo)" /></Secao>
                </div>
              </>
            )}

            <p className="text-creme-soft/40 text-[11px] font-mono text-center pt-2 pb-6 leading-relaxed">
              Licença Creative Commons CC BY-SA 4.0 · use, remixe e cite.<br />
              Vozes do Oziel · Grupo Diálogos · CriaLab · atualizado {new Date(d.gerado_em).toLocaleDateString("pt-BR")}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
