import { NextRequest, NextResponse } from "next/server"
import { supa } from "@/lib/supabase"

function authed(req: NextRequest) {
  return req.cookies.get("ozipa_admin")?.value === "1"
}

/**
 * GET /api/admin/memes
 * Lista os memes enviados pela comunidade (fila de moderação).
 * Requer cookie de sessão admin.
 * Retorna: { ok: true, memes: Meme[] } ordenados por criado_em desc (max 500)
 */
export async function GET(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ ok: false }, { status: 401 })
  try {
    const db = supa()
    const { data, error } = await db
      .from("memes")
      .select("*")
      .order("criado_em", { ascending: false })
      .limit(500)
    if (error) throw error
    return NextResponse.json({ ok: true, memes: data ?? [] })
  } catch {
    return NextResponse.json({ ok: false, memes: [] }, { status: 500 })
  }
}

/**
 * PUT /api/admin/memes
 * Modera um meme: aprova, recusa ou retorna para fila pendente.
 * Requer cookie de sessão admin.
 * Body: { id: number, status: "pendente" | "aprovado" | "recusado" }
 * Retorna: { ok: true } | { ok: false } (400 status inválido, 401 sem sessão)
 */
export async function PUT(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ ok: false }, { status: 401 })
  try {
    const { id, status } = await req.json()
    if (!id || !["pendente", "aprovado", "recusado"].includes(status)) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    const db = supa()
    const { error } = await db
      .from("memes")
      .update({ status, revisado_em: new Date().toISOString() })
      .eq("id", id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
