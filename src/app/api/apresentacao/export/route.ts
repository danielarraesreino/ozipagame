import { NextRequest, NextResponse } from "next/server"
import { supa } from "@/lib/supabase"

// Download dos MICRODADOS COMPLETOS (inclui texto livre) — só pra equipe, atrás
// de senha. Re-consulta o banco ao vivo (formularios | avaliacoes — NUNCA outra
// tabela). O export público de-identificado fica em /exports/* (sem texto livre).
export const dynamic = "force-dynamic"

// colunas completas (com texto livre) por dataset
const COLS: Record<string, string[]> = {
  formularios: ["momento", "bairro", "faixa_idade", "estuda", "sentimentos", "afeta_vida", "avontade_opinar", "confia_eleitos", "afasta", "ja_participou", "onde_discute", "sabia_participar", "texto_participar", "texto_duvida", "criado_em"],
  avaliacoes: ["genero", "faixa_idade", "raca", "dificulta", "confianca_falar", "o_que_e_politica", "vontade_participar", "diminui_medo", "por_que", "te_marcou", "mudaria", "criado_em"],
}

function toCSV(rows: Record<string, unknown>[], cols: string[]): string {
  const esc = (v: unknown) => {
    if (v == null) return '""'
    if (Array.isArray(v)) v = v.join("; ")
    return `"${String(v).replace(/"/g, '""')}"`
  }
  const head = cols.map(esc).join(",")
  const body = rows.map((r) => cols.map((c) => esc(r[c])).join(",")).join("\r\n")
  return "﻿" + head + "\r\n" + body + "\r\n" // BOM p/ Excel + acentos
}

export async function POST(req: NextRequest) {
  let body: { password?: string; dataset?: string; format?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, erro: "json inválido" }, { status: 400 })
  }
  const { password, dataset, format } = body

  if (!process.env.APRESENTACAO_DOWNLOAD_PASSWORD || password !== process.env.APRESENTACAO_DOWNLOAD_PASSWORD) {
    return NextResponse.json({ ok: false, erro: "senha incorreta" }, { status: 401 })
  }
  if (dataset !== "formularios" && dataset !== "avaliacoes") {
    return NextResponse.json({ ok: false, erro: "dataset inválido" }, { status: 400 })
  }
  const fmt = format === "csv" ? "csv" : "json"

  try {
    const db = supa()
    const cols = COLS[dataset]
    const { data, error } = await db.from(dataset).select(cols.join(",")).order("criado_em", { ascending: true }).limit(100000)
    if (error) throw error
    const rows = (data ?? []) as unknown as Record<string, unknown>[]

    const stamp = new Date().toISOString().slice(0, 10)
    const filename = `ozipa_${dataset}_completo_${stamp}.${fmt}`
    const payload = fmt === "csv" ? toCSV(rows, cols) : JSON.stringify(rows, null, 2)

    return new NextResponse(payload, {
      status: 200,
      headers: {
        "Content-Type": fmt === "csv" ? "text/csv; charset=utf-8" : "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch {
    return NextResponse.json({ ok: false, erro: "falha ao gerar export" }, { status: 500 })
  }
}
