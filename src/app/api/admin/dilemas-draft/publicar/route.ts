import { NextRequest, NextResponse } from "next/server"
import { supa } from "@/lib/supabase"
import type { Dilema } from "@/lib/dilemas"

const REPO = "danielarraesreino/ozipagame"
const FILE_DILEMAS = "public/dilemas_importados.json"
const FILE_ATIVOS = "public/cards_ativos.json"

function authed(req: NextRequest) {
  return req.cookies.get("ozipa_admin")?.value === "1"
}

async function ghGet(file: string) {
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${file}`, {
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
    cache: "no-store",
  })
  return res.json() as Promise<{ content?: string; sha?: string }>
}

async function ghPut(file: string, sha: string, content: string, message: string) {
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${file}`, {
    method: "PUT",
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString("base64"),
      sha,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GitHub PUT falhou: ${res.status} ${err}`)
  }
}

/**
 * POST /api/admin/dilemas-draft/publicar
 * Publica um rascunho de dilema no dilemas_importados.json via GitHub API.
 * Também cria entrada cards_ativos[id] = false (facilitador liga quando quiser).
 * Guardrail: rejeita se escolha_a_texto, escolha_b_texto ou contexto_oculto_md estiverem vazios.
 * NUNCA auto-publica — requer ação humana explícita nesta rota.
 */
export async function POST(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ ok: false }, { status: 401 })

  try {
    const { draft_id } = await req.json()
    if (!draft_id) return NextResponse.json({ ok: false, error: "draft_id obrigatório" }, { status: 400 })

    const db = supa()
    const { data: draft, error: draftErr } = await db
      .from("dilemas_draft")
      .select("*")
      .eq("id", draft_id)
      .eq("status", "rascunho")
      .single()
    if (draftErr || !draft) {
      return NextResponse.json({ ok: false, error: "rascunho não encontrado ou já publicado" }, { status: 404 })
    }

    // Validação dura — guardrail pedagógico
    const erros: string[] = []
    if (!draft.escolha_a_texto?.trim()) erros.push("escolha_a_texto vazia")
    if (!draft.escolha_b_texto?.trim()) erros.push("escolha_b_texto vazia")
    if (!draft.contexto_oculto_md?.trim()) erros.push("contexto_oculto_md vazio")
    if (erros.length) {
      return NextResponse.json({ ok: false, error: "validação falhou", detalhes: erros }, { status: 422 })
    }

    // ID do dilema: imp_ + primeiros 8 chars do uuid do rascunho
    const dilema_id = `imp_${draft_id.replace(/-/g, "").slice(0, 8)}`

    // Converte rascunho → formato Dilema
    const novoDilema: Dilema & { escolha_a?: string; escolha_b?: string } = {
      id: dilema_id,
      modulo: draft.modulo ?? "participação",
      meme: draft.situacao_md ?? "",
      contexto_oculto: draft.contexto_oculto_md ?? "",
      pilula_sabedoria: "",
      fonte: draft.fonte_url ?? (draft.validado_por ? `validado por ${draft.validado_por}` : "comunidade Oziel"),
      importado: true,
      origem: "comunidade",
      autor_apelido: draft.autor_apelido ?? undefined,
      meme_imagem: draft.meme_url ?? undefined,
      // Escolhas ficam nos campos extras (não fazem parte da interface base Dilema
      // mas são preservadas no JSON para eventual uso futuro)
      escolha_a: draft.escolha_a_texto ?? undefined,
      escolha_b: draft.escolha_b_texto ?? undefined,
    }

    // Remove undefined para JSON limpo
    const dilemaJson = Object.fromEntries(
      Object.entries(novoDilema).filter(([, v]) => v !== undefined)
    )

    // Lê dilemas_importados.json atual
    const dilemFile = await ghGet(FILE_DILEMAS)
    const dilemList: Dilema[] = dilemFile.content
      ? JSON.parse(Buffer.from(dilemFile.content, "base64").toString())
      : []
    if (!dilemFile.sha) throw new Error("SHA do arquivo dilemas_importados.json não encontrado")

    // Verifica duplicata
    if (dilemList.some((d) => d.id === dilema_id)) {
      return NextResponse.json({ ok: false, error: "dilema já publicado (id duplicado)" }, { status: 409 })
    }

    dilemList.push(dilemaJson as Dilema)

    // Lê cards_ativos.json
    const ativosFile = await ghGet(FILE_ATIVOS)
    const ativos: Record<string, boolean> = ativosFile.content
      ? JSON.parse(Buffer.from(ativosFile.content, "base64").toString())
      : {}
    if (!ativosFile.sha) throw new Error("SHA do arquivo cards_ativos.json não encontrado")

    // Dilema entra DESLIGADO — facilitador liga quando quiser
    ativos[dilema_id] = false

    // Faz os dois commits
    await ghPut(
      FILE_DILEMAS,
      dilemFile.sha,
      JSON.stringify(dilemList, null, 2),
      `cms: publica dilema da comunidade → ${dilema_id} (@${draft.autor_apelido ?? "anonimo"})`,
    )
    await ghPut(
      FILE_ATIVOS,
      ativosFile.sha,
      JSON.stringify(ativos, null, 2),
      `cms: cards_ativos → ${dilema_id} = false (aguarda facilitador)`,
    )

    // Marca rascunho como publicado
    await db
      .from("dilemas_draft")
      .update({ status: "publicado", publicado_em: new Date().toISOString() })
      .eq("id", draft_id)

    return NextResponse.json({ ok: true, dilema_id })
  } catch (e) {
    console.error("publicar dilema:", e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
