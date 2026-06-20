import { NextRequest, NextResponse } from "next/server"
import { supa } from "@/lib/supabase"

const s = (v: unknown, max = 80) => (typeof v === "string" && v ? v.slice(0, max) : null)
const arr = (v: unknown, max = 12) =>
  Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, max).map((x) => String(x).slice(0, 120)) : null

// POST — registra uma avaliação pós-encontro (pesquisa FIM, anônima). Sem e-mail,
// sem nada identificável. Texto livre limitado e só visível no admin. Campos
// ausentes ficam nulos. Espelha /api/form.
export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    const db = supa()
    const { error } = await db.from("avaliacoes").insert({
      genero: s(b.genero, 40),
      faixa_idade: s(b.faixa_idade, 20),
      raca: s(b.raca, 20),
      dificulta: arr(b.dificulta),
      confianca_falar: s(b.confianca_falar, 60),
      o_que_e_politica: arr(b.o_que_e_politica),
      vontade_participar: s(b.vontade_participar, 60),
      diminui_medo: s(b.diminui_medo, 40),
      por_que: s(b.por_que, 500),
      te_marcou: s(b.te_marcou, 500),
      mudaria: s(b.mudaria, 500),
    })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
