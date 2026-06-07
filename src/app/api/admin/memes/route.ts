import { NextRequest, NextResponse } from "next/server"
import { supa } from "@/lib/supabase"

function authed(req: NextRequest) {
  return req.cookies.get("ozipa_admin")?.value === "1"
}

// GET — lista memes enviados (fila de moderação).
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

// PUT { id, status } — modera (aprovar/recusar/voltar pra pendente).
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
