import { NextRequest, NextResponse } from "next/server"
import { supa } from "@/lib/supabase"

function authed(req: NextRequest) {
  return req.cookies.get("ozipa_admin")?.value === "1"
}

/**
 * GET /api/admin/registros
 * Lista todas as inscrições no encontro presencial.
 * Requer cookie de sessão admin.
 * Retorna: { inscricoes: Inscricao[] } ordenadas por criado_em desc
 */
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

/**
 * PUT /api/admin/registros
 * Atualiza campos permitidos de uma inscrição.
 * Requer cookie de sessão admin.
 * Body: { id: number, nome?, idade?, turma?, contato_tipo?, contato_valor?, presenca_confirmada? }
 * Retorna: { ok: true } | { error: string } (400 sem id, 401 sem sessão, 500 DB)
 */
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

/**
 * DELETE /api/admin/registros
 * Remove uma inscrição pelo id.
 * Requer cookie de sessão admin.
 * Body: { id: number }
 * Retorna: { ok: true } | { error: string } (400 sem id, 401 sem sessão, 500 DB)
 */
export async function DELETE(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "401" }, { status: 401 })
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  const db = supa()
  const { error } = await db.from("inscricoes").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
