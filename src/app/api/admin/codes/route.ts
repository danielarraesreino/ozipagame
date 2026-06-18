import { NextRequest, NextResponse } from "next/server"

const REPO = "danielarraesreino/ozipagame"
const FILE = "public/room_codes.json"

function authed(req: NextRequest) {
  return req.cookies.get("ozipa_admin")?.value === "1"
}

async function ghGet() {
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}`, {
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
    cache: "no-store",
  })
  return res.json()
}

/**
 * PUT /api/admin/codes
 * Cria, atualiza ou remove um código de sala (desbloqueio pós-oficina).
 * Persiste `room_codes.json` via GitHub API (sem rebuild).
 * Requer cookie de sessão admin.
 * Body: { codigo: string, label?: string, ativo?: boolean }
 *   - Se `ativo === false`: remove o código.
 *   - Caso contrário: cria/atualiza com `{ label, ativo: true }`.
 * Retorna: { ok: true } | { ok: false } (400 sem codigo, 401 sem sessão)
 */
export async function PUT(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ ok: false }, { status: 401 })

  const { codigo, label, ativo } = await req.json()
  if (!codigo) return NextResponse.json({ ok: false }, { status: 400 })

  const file = await ghGet()
  const current = file.content
    ? JSON.parse(Buffer.from(file.content, "base64").toString())
    : {}

  if (ativo === false) {
    delete current[codigo.toUpperCase()]
  } else {
    current[codigo.toUpperCase()] = { label: label || codigo, ativo: true }
  }

  await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}`, {
    method: "PUT",
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `cms: ${ativo === false ? "remove" : "add"} código ${codigo.toUpperCase()}`,
      content: Buffer.from(JSON.stringify(current, null, 2)).toString("base64"),
      sha: file.sha,
    }),
  })

  return NextResponse.json({ ok: true })
}
