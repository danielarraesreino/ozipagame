import { NextResponse } from "next/server"
import { supa } from "@/lib/supabase"

// GET — dados abertos (Creative Commons). SÓ agregados anônimos: nenhuma linha
// crua, nenhum apelido, nenhum texto livre. É a fonte do dashboard /dados e o
// endpoint público de dados abertos do projeto.
export const revalidate = 60 // cache leve

function tally(rows: Record<string, unknown>[], campo: string): Record<string, number> {
  const out: Record<string, number> = {}
  for (const r of rows) {
    const v = r[campo]
    if (typeof v === "string" && v) out[v] = (out[v] ?? 0) + 1
  }
  return out
}

export async function GET() {
  try {
    const db = supa()

    const [partidasRes, respostasRes, formsRes] = await Promise.all([
      db.from("partidas").select("bairro").limit(100000),
      db.from("respostas").select("dilema_id,modulo,escolha,verificacao_status").limit(200000),
      // só múltipla escolha — texto livre fica de fora por princípio
      db.from("formularios").select("bairro,faixa_idade,sentimento,ja_participou,opiniao_importa,onde_discute").limit(100000),
    ])

    const partidas = partidasRes.data ?? []
    const respostas = respostasRes.data ?? []
    const forms = formsRes.data ?? []

    // por dilema: concordo (right) x discordo (left)
    const porDilema: Record<string, { dilema_id: string; modulo: string | null; concordo: number; discordo: number }> = {}
    for (const r of respostas) {
      const id = String(r.dilema_id ?? "")
      if (!id) continue
      porDilema[id] ??= { dilema_id: id, modulo: (r.modulo as string) ?? null, concordo: 0, discordo: 0 }
      if (r.escolha === "right") porDilema[id].concordo++
      else if (r.escolha === "left") porDilema[id].discordo++
    }

    // distribuição de opinião importa (1–5)
    const importaDist: Record<string, number> = {}
    let importaSoma = 0, importaN = 0
    for (const f of forms) {
      const v = f.opiniao_importa
      if (typeof v === "number") {
        importaDist[String(v)] = (importaDist[String(v)] ?? 0) + 1
        importaSoma += v; importaN++
      }
    }

    return NextResponse.json({
      licenca: "CC BY-SA 4.0",
      projeto: "Vozes do Oziel — Grupo Diálogos / CriaLab",
      gerado_em: new Date().toISOString(),
      jogo: {
        total_partidas: partidas.length,
        por_bairro: tally(partidas, "bairro"),
        total_respostas: respostas.length,
        por_dilema: Object.values(porDilema).sort((a, b) =>
          (b.concordo + b.discordo) - (a.concordo + a.discordo)),
        fact_check: tally(respostas, "verificacao_status"),
      },
      pesquisa: {
        total: forms.length,
        faixa_idade: tally(forms, "faixa_idade"),
        sentimento: tally(forms, "sentimento"),
        ja_participou: tally(forms, "ja_participou"),
        onde_discute: tally(forms, "onde_discute"),
        opiniao_importa_media: importaN ? +(importaSoma / importaN).toFixed(2) : null,
        opiniao_importa_dist: importaDist,
      },
    })
  } catch {
    return NextResponse.json({ erro: "dados indisponíveis" }, { status: 500 })
  }
}
