import { NextRequest, NextResponse } from "next/server"
import { supa } from "@/lib/supabase"

function authed(req: NextRequest) {
  return req.cookies.get("ozipa_admin")?.value === "1"
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
