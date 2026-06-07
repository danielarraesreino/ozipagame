import { NextRequest, NextResponse } from "next/server"
import { supa } from "@/lib/supabase"

const s = (v: unknown, max = 80) => (typeof v === "string" && v ? v.slice(0, max) : null)
const num = (v: unknown) => (typeof v === "number" && v >= 1 && v <= 5 ? v : null)
const arr = (v: unknown, max = 12) =>
  Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, max).map((x) => String(x).slice(0, 80)) : null

// POST — registra uma resposta da pesquisa qualitativa (anônima). Aceita tanto a
// versão curta (fim do jogo) quanto a completa (/pesquisa); campos ausentes ficam nulos.
export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    const db = supa()
    const { error } = await db.from("formularios").insert({
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
    })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
