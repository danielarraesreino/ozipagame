import { NextResponse } from "next/server"
import { supa } from "@/lib/supabase"

// GET — dados abertos (Creative Commons). SÓ agregados anônimos: nenhuma linha
// crua, nenhum apelido, nenhum texto livre. Fonte do dashboard /dados e endpoint
// público de dados abertos do projeto. Sempre lê fresco (dashboard ao vivo).
export const dynamic = "force-dynamic"

type Row = Record<string, unknown>

// Bucket explícito de não-resposta. Princípio: branco é DADO, não buraco. O
// denominador honesto é "quem foi PERGUNTADO", por isso `aplicavel`: na pesquisa
// curta (fim de jogo) os campos só-completa não foram perguntados → não contam
// como "não respondeu".
const NAO_RESP = "não respondeu"

function tally(rows: Row[], campo: string, aplicavel?: (r: Row) => boolean): Record<string, number> {
  const out: Record<string, number> = {}
  let sem = 0
  for (const r of rows) {
    if (aplicavel && !aplicavel(r)) continue
    const v = r[campo]
    if (typeof v === "string" && v) out[v] = (out[v] ?? 0) + 1
    else sem++
  }
  if (sem) out[NAO_RESP] = sem
  return out
}

// arrays jsonb (marca-várias): conta cada item; linha sem nenhum item = não respondeu
function tallyArr(rows: Row[], campo: string, aplicavel?: (r: Row) => boolean): Record<string, number> {
  const out: Record<string, number> = {}
  let sem = 0
  for (const r of rows) {
    if (aplicavel && !aplicavel(r)) continue
    const v = r[campo]
    if (Array.isArray(v) && v.length) for (const item of v) { if (typeof item === "string") out[item] = (out[item] ?? 0) + 1 }
    else sem++
  }
  if (sem) out[NAO_RESP] = sem
  return out
}

function escala(rows: Row[], campo: string, aplicavel?: (r: Row) => boolean): { media: number | null; dist: Record<string, number>; nao_respondeu: number } {
  const dist: Record<string, number> = {}
  let soma = 0, n = 0, sem = 0
  for (const r of rows) {
    if (aplicavel && !aplicavel(r)) continue
    const v = r[campo]
    if (typeof v === "number") { dist[String(v)] = (dist[String(v)] ?? 0) + 1; soma += v; n++ }
    else sem++
  }
  return { media: n ? +(soma / n).toFixed(2) : null, dist, nao_respondeu: sem }
}

// fichas curtas (fim de jogo) não perguntam os campos só-completa → não entram no
// denominador de não-resposta desses campos. Momento null = formulário completo.
const fezCompleta = (r: Row) => r.momento !== "fim_jogo" && r.momento !== "curta"

export async function GET() {
  try {
    const db = supa()
    const [partidasRes, respostasRes, formsRes, avaliacoesRes] = await Promise.all([
      db.from("partidas").select("bairro").limit(100000),
      db.from("respostas").select("dilema_id,modulo,escolha,verificacao_status").limit(200000),
      db.from("formularios").select(
        "momento,bairro,faixa_idade,estuda,sentimentos,afeta_vida,avontade_opinar,confia_eleitos,afasta,ja_participou,onde_discute,sabia_participar",
      ).limit(100000),
      // Avaliação pós-encontro: SÓ múltipla escolha (texto livre fica de fora do público)
      db.from("avaliacoes").select(
        "genero,faixa_idade,raca,dificulta,confianca_falar,o_que_e_politica,vontade_participar,diminui_medo",
      ).limit(100000),
    ])

    const partidas = partidasRes.data ?? []
    const respostas = respostasRes.data ?? []
    const forms = formsRes.data ?? []
    const avals = avaliacoesRes.data ?? []

    const porDilema: Record<string, { dilema_id: string; modulo: string | null; concordo: number; discordo: number }> = {}
    for (const r of respostas) {
      const id = String(r.dilema_id ?? "")
      if (!id) continue
      porDilema[id] ??= { dilema_id: id, modulo: (r.modulo as string) ?? null, concordo: 0, discordo: 0 }
      if (r.escolha === "right") porDilema[id].concordo++
      else if (r.escolha === "left") porDilema[id].discordo++
    }

    return NextResponse.json({
      licenca: "CC BY-SA 4.0",
      projeto: "Vozes do Oziel — Grupo Diálogos / CriaLab",
      gerado_em: new Date().toISOString(),
      jogo: {
        total_partidas: partidas.length,
        por_bairro: tally(partidas, "bairro"),
        total_respostas: respostas.length,
        por_dilema: Object.values(porDilema).sort((a, b) => (b.concordo + b.discordo) - (a.concordo + a.discordo)),
        fact_check: tally(respostas, "verificacao_status"),
      },
      pesquisa: {
        total: forms.length,
        completas: forms.filter(fezCompleta).length,
        faixa_idade: tally(forms, "faixa_idade"),
        estuda: tally(forms, "estuda", fezCompleta),
        sentimentos: tallyArr(forms, "sentimentos"),
        afeta_vida: escala(forms, "afeta_vida"),
        avontade_opinar: escala(forms, "avontade_opinar", fezCompleta),
        confia_eleitos: escala(forms, "confia_eleitos", fezCompleta),
        afasta: tallyArr(forms, "afasta", fezCompleta),
        ja_participou: tally(forms, "ja_participou"),
        onde_discute: tallyArr(forms, "onde_discute", fezCompleta),
        sabia_participar: tally(forms, "sabia_participar", fezCompleta),
      },
      avaliacao: {
        total: avals.length,
        genero: tally(avals, "genero"),
        faixa_idade: tally(avals, "faixa_idade"),
        raca: tally(avals, "raca"),
        dificulta: tallyArr(avals, "dificulta"),
        confianca_falar: tally(avals, "confianca_falar"),
        o_que_e_politica: tallyArr(avals, "o_que_e_politica"),
        vontade_participar: tally(avals, "vontade_participar"),
        diminui_medo: tally(avals, "diminui_medo"),
      },
    })
  } catch {
    return NextResponse.json({ erro: "dados indisponíveis" }, { status: 500 })
  }
}
