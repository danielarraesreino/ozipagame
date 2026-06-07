import { NextRequest, NextResponse } from "next/server"
import { supa } from "@/lib/supabase"

interface ResultadoCard {
  modulo?: string
  dilemaId?: string
  choice?: "right" | "left"
  status?: string
}

// POST { bairro, qtd_discordou, results[] } — registra uma partida anônima
// (sem apelido) + suas respostas. Disparado ao fim do jogo.
export async function POST(req: NextRequest) {
  try {
    const { bairro, qtd_discordou, results } = await req.json()
    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const db = supa()
    const { data: partida, error } = await db
      .from("partidas")
      .insert({
        bairro: typeof bairro === "string" ? bairro.slice(0, 40) : null,
        total_cards: results.length,
        qtd_discordou: typeof qtd_discordou === "number" ? qtd_discordou : null,
      })
      .select("id")
      .single()
    if (error || !partida) throw error ?? new Error("sem partida")

    const rows = (results as ResultadoCard[])
      .slice(0, 200)
      .map((r) => ({
        partida_id: partida.id,
        dilema_id: String(r.dilemaId ?? "").slice(0, 40),
        modulo: r.modulo ? String(r.modulo).slice(0, 40) : null,
        escolha: r.choice === "left" ? "left" : r.choice === "right" ? "right" : null,
        verificacao_status: r.status ? String(r.status).slice(0, 40) : null,
      }))
      .filter((r) => r.escolha)

    if (rows.length) await db.from("respostas").insert(rows)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
