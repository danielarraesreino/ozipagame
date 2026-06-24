import { NextRequest, NextResponse } from "next/server"
import { supa } from "@/lib/supabase"

function authed(req: NextRequest) {
  return req.cookies.get("ozipa_admin")?.value === "1"
}

const s = (v: unknown, max = 80) => (typeof v === "string" && v ? v.slice(0, max) : null)
const arr = (v: unknown, max = 12) =>
  Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, max).map((x) => String(x).slice(0, 120)) : null

// POST — transcrição de uma ficha de papel (avaliação pós-encontro) pela equipe.
// Espelha /api/avaliacao mas exige admin. "não respondeu"/branco → null.
export async function POST(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ ok: false }, { status: 401 })
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

// GET — lista as avaliações (inclui texto livre) pra equipe. Texto nunca vai ao público.
export async function GET(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ ok: false }, { status: 401 })
  try {
    const db = supa()
    const { data, error } = await db
      .from("avaliacoes")
      .select("*")
      .order("criado_em", { ascending: false })
      .limit(500)
    if (error) throw error
    return NextResponse.json({ ok: true, avaliacoes: data ?? [] })
  } catch {
    return NextResponse.json({ ok: false, avaliacoes: [] }, { status: 500 })
  }
}
