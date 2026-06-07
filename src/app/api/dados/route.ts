import { NextResponse } from "next/server"
import { supa } from "@/lib/supabase"

// GET — dados abertos (Creative Commons). SÓ agregados anônimos: nenhuma linha
// crua, nenhum apelido, nenhum texto livre. Fonte do dashboard /dados e endpoint
// público de dados abertos do projeto. Sempre lê fresco (dashboard ao vivo).
export const dynamic = "force-dynamic"

type Row = Record<string, unknown>

function tally(rows: Row[], campo: string): Record<string, number> {
  const out: Record<string, number> = {}
  for (const r of rows) {
    const v = r[campo]
    if (typeof v === "string" && v) out[v] = (out[v] ?? 0) + 1
  }
  return out
}

// arrays jsonb (marca-várias): conta cada item
function tallyArr(rows: Row[], campo: string): Record<string, number> {
  const out: Record<string, number> = {}
  for (const r of rows) {
    const v = r[campo]
    if (Array.isArray(v)) for (const item of v) if (typeof item === "string") out[item] = (out[item] ?? 0) + 1
  }
  return out
}

function escala(rows: Row[], campo: string): { media: number | null; dist: Record<string, number> } {
  const dist: Record<string, number> = {}
  let soma = 0, n = 0
  for (const r of rows) {
    const v = r[campo]
    if (typeof v === "number") { dist[String(v)] = (dist[String(v)] ?? 0) + 1; soma += v; n++ }
  }
  return { media: n ? +(soma / n).toFixed(2) : null, dist }
}

export async function GET() {
  try {
    const db = supa()
    const [partidasRes, respostasRes, formsRes] = await Promise.all([
      db.from("partidas").select("bairro").limit(100000),
      db.from("respostas").select("dilema_id,modulo,escolha,verificacao_status").limit(200000),
      db.from("formularios").select(
        "bairro,faixa_idade,estuda,sentimentos,afeta_vida,avontade_opinar,confia_eleitos,afasta,ja_participou,onde_discute,sabia_participar",
      ).limit(100000),
    ])

    const partidas = partidasRes.data ?? []
    const respostas = respostasRes.data ?? []
    const forms = formsRes.data ?? []

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
        faixa_idade: tally(forms, "faixa_idade"),
        estuda: tally(forms, "estuda"),
        sentimentos: tallyArr(forms, "sentimentos"),
        afeta_vida: escala(forms, "afeta_vida"),
        avontade_opinar: escala(forms, "avontade_opinar"),
        confia_eleitos: escala(forms, "confia_eleitos"),
        afasta: tallyArr(forms, "afasta"),
        ja_participou: tally(forms, "ja_participou"),
        onde_discute: tallyArr(forms, "onde_discute"),
        sabia_participar: tally(forms, "sabia_participar"),
      },
    })
  } catch {
    return NextResponse.json({ erro: "dados indisponíveis" }, { status: 500 })
  }
}
