import { NextRequest, NextResponse } from "next/server"
import { supa } from "@/lib/supabase"

const s = (v: unknown, max = 200) =>
  typeof v === "string" && v ? v.slice(0, max) : null

export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    const db = supa()
    const { error } = await db.from("inscricoes").insert({
      nome: s(b.nome, 200),
      idade: s(b.idade, 10),
      turma: s(b.turma, 100),
      confirmou_presenca: typeof b.confirmou_presenca === "boolean" ? b.confirmou_presenca : null,
      contato_tipo: s(b.contato_tipo, 20),
      contato_valor: s(b.contato_valor, 200),
    })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
