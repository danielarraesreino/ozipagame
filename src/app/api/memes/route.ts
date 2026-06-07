import { NextRequest, NextResponse } from "next/server"
import { supa } from "@/lib/supabase"

const s = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : null)

// POST — recebe um meme enviado pela comunidade. Entra como 'pendente' na fila
// de moderação do admin. Nada aparece em público sem aprovação.
export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    const descricao = s(b.descricao, 1000)
    const imagem_url = typeof b.imagem_url === "string" ? b.imagem_url.slice(0, 600) : null
    if (!descricao && !imagem_url) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    const db = supa()
    const { error } = await db.from("memes").insert({
      autor_apelido: s(b.autor_apelido, 40),
      bairro: s(b.bairro, 40),
      descricao,
      imagem_url,
      status: "pendente",
    })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
