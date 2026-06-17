import { NextRequest, NextResponse } from "next/server"
import { supa } from "@/lib/supabase"

function authed(req: NextRequest) {
  return req.cookies.get("ozipa_admin")?.value === "1"
}

export async function GET(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "401" }, { status: 401 })
  const db = supa()
  const { data, error } = await db
    .from("inscricoes")
    .select("id, nome, idade, turma, confirmou_presenca, contato_tipo, contato_valor, presenca_confirmada, criado_em")
    .order("criado_em", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ inscricoes: data })
}

export async function PUT(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "401" }, { status: 401 })
  const b = await req.json()
  const { id, ...fields } = b
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  const allowed = ["nome", "idade", "turma", "contato_tipo", "contato_valor", "presenca_confirmada"]
  const update: Record<string, unknown> = {}
  for (const k of allowed) if (k in fields) update[k] = fields[k]
  const db = supa()
  const { error } = await db.from("inscricoes").update(update).eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "401" }, { status: 401 })
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  const db = supa()
  const { error } = await db.from("inscricoes").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
