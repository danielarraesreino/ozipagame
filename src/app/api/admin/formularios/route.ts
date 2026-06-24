import { NextRequest, NextResponse } from "next/server"
import { supa } from "@/lib/supabase"

function authed(req: NextRequest) {
  return req.cookies.get("ozipa_admin")?.value === "1"
}

// coerção igual à /api/form: null preserva "não respondeu" (branco) sem sujar banco
const s = (v: unknown, max = 80) => (typeof v === "string" && v ? v.slice(0, max) : null)
const num = (v: unknown) => (typeof v === "number" && v >= 1 && v <= 5 ? v : null)
const arr = (v: unknown, max = 12) =>
  Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, max).map((x) => String(x).slice(0, 80)) : null

// POST — transcrição de uma ficha de papel (pesquisa inicial) pela equipe.
// Espelha /api/form mas exige admin. Campos ausentes/"não respondeu" → null.
export async function POST(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ ok: false }, { status: 401 })
  try {
    const b = await req.json()
    const db = supa()
    const base = {
      bairro: s(b.bairro, 40),
      faixa_idade: s(b.faixa_idade, 20),
      estuda: s(b.estuda, 40),
      sentimentos: arr(b.sentimentos),
      afeta_vida: num(b.afeta_vida),
      avontade_opinar: num(b.avontade_opinar),
      confia_eleitos: num(b.confia_eleitos),
      afasta: arr(b.afasta),
      ja_participou: s(b.ja_participou, 40),
      onde_discute: arr(b.onde_discute),
      sabia_participar: s(b.sabia_participar, 60),
      texto_participar: s(b.texto_participar, 500),
      texto_duvida: s(b.texto_duvida, 500),
    }
    // tenta com momento; se a coluna não existir (avaliacao.sql não rodado), reinsere sem ela
    let { error } = await db.from("formularios").insert({ momento: s(b.momento, 20), ...base })
    if (error) ({ error } = await db.from("formularios").insert(base))
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

// GET — lista as respostas do formulário (inclui texto livre) pra equipe.
// Acesso só admin; o texto livre nunca aparece no público.
export async function GET(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ ok: false }, { status: 401 })
  try {
    const db = supa()
    const { data, error } = await db
      .from("formularios")
      .select("*")
      .order("criado_em", { ascending: false })
      .limit(500)
    if (error) throw error
    return NextResponse.json({ ok: true, formularios: data ?? [] })
  } catch {
    return NextResponse.json({ ok: false, formularios: [] }, { status: 500 })
  }
}
