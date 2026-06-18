import { NextRequest, NextResponse } from "next/server"
import { supa } from "@/lib/supabase"

function authed(req: NextRequest) {
  return req.cookies.get("ozipa_admin")?.value === "1"
}

/**
 * GET /api/admin/dilemas-draft
 * Lista todos os rascunhos de dilema.
 * Requer cookie de sessão admin.
 */
export async function GET(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ ok: false }, { status: 401 })
  try {
    const db = supa()
    const { data, error } = await db
      .from("dilemas_draft")
      .select("*")
      .order("criado_em", { ascending: false })
      .limit(500)
    if (error) throw error
    return NextResponse.json({ ok: true, drafts: data ?? [] })
  } catch {
    return NextResponse.json({ ok: false, drafts: [] }, { status: 500 })
  }
}

/**
 * PUT /api/admin/dilemas-draft
 * Cria ou atualiza um rascunho de dilema.
 * Para criar a partir de um meme: inclui meme_id (idempotente — mesmo meme não duplica).
 * Para atualizar: inclui id do rascunho + campos a atualizar.
 * Requer cookie de sessão admin.
 */
export async function PUT(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ ok: false }, { status: 401 })
  try {
    const body = await req.json()
    const db = supa()

    // Se tem meme_id, é promoção de meme → rascunho (idempotente via UNIQUE constraint)
    if (body.meme_id != null) {
      const { meme_id, meme_url, autor_apelido } = body

      // Verifica se já existe rascunho para esse meme
      const { data: existing } = await db
        .from("dilemas_draft")
        .select("id, status")
        .eq("meme_id", meme_id)
        .maybeSingle()

      if (existing) {
        return NextResponse.json({ ok: true, id: existing.id, already_exists: true })
      }

      const { data, error } = await db
        .from("dilemas_draft")
        .insert({ meme_id, meme_url: meme_url ?? null, autor_apelido: autor_apelido ?? null })
        .select("id")
        .single()
      if (error) throw error
      return NextResponse.json({ ok: true, id: data.id })
    }

    // Atualização de rascunho existente
    const { id, ...fields } = body
    if (!id) return NextResponse.json({ ok: false, error: "id obrigatório" }, { status: 400 })

    const allowed = [
      "situacao_md", "escolha_a_texto", "escolha_a_efeitos",
      "escolha_b_texto", "escolha_b_efeitos", "contexto_oculto_md",
      "modulo", "fonte_url", "validado_por", "meme_url", "autor_apelido",
    ]
    const update: Record<string, unknown> = {}
    for (const k of allowed) {
      if (k in fields) update[k] = fields[k]
    }
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ ok: false, error: "nenhum campo válido" }, { status: 400 })
    }

    const { error } = await db
      .from("dilemas_draft")
      .update(update)
      .eq("id", id)
      .neq("status", "publicado") // nunca reedita publicado
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
