import { NextRequest, NextResponse } from "next/server"

const REPO = "danielarraesreino/ozipagame"
const FILE = "public/cards_ativos.json"

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
 * PUT /api/admin/cards
 * Liga ou desliga a exibição de um card no jogo em tempo de execução.
 * Persiste `cards_ativos.json` via GitHub API (sem rebuild).
 * Requer cookie de sessão admin.
 * Body: { dilema_id: string, ativo: boolean }
 * Retorna: { ok: true } | { ok: false } (400 sem dilema_id, 401 sem sessão)
 */
export async function PUT(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ ok: false }, { status: 401 })

  const { dilema_id, ativo } = await req.json()
  if (!dilema_id) return NextResponse.json({ ok: false }, { status: 400 })

  const file = await ghGet()
  const current: Record<string, boolean> = file.content
    ? JSON.parse(Buffer.from(file.content, "base64").toString())
    : {}

  current[dilema_id] = !!ativo

  const newContent = Buffer.from(JSON.stringify(current, null, 2)).toString("base64")

  await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}`, {
    method: "PUT",
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `cms: ${ativo ? "ativa" : "desativa"} card → ${dilema_id}`,
      content: newContent,
      sha: file.sha,
    }),
  })

  return NextResponse.json({ ok: true })
}
