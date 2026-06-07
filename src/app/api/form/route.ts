import { NextRequest, NextResponse } from "next/server"
import { supa } from "@/lib/supabase"

const s = (v: unknown, max = 80) => (typeof v === "string" ? v.slice(0, max) : null)

// POST — registra uma resposta do formulário qualitativo (anônimo).
export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    const db = supa()
    const { error } = await db.from("formularios").insert({
      bairro: s(b.bairro, 40),
      faixa_idade: s(b.faixa_idade, 20),
      sentimento: s(b.sentimento, 60),
      ja_participou: s(b.ja_participou, 40),
      opiniao_importa: typeof b.opiniao_importa === "number" ? b.opiniao_importa : null,
      onde_discute: s(b.onde_discute, 60),
      texto_participar: s(b.texto_participar, 500),
      texto_duvida: s(b.texto_duvida, 500),
    })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
