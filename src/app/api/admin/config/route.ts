import { NextRequest, NextResponse } from "next/server"

const REPO = "danielarraesreino/ozipagame"
const FILE = "public/site_config.json"

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
 * PUT /api/admin/config
 * Atualiza configurações gerais do site (ex: URL do vídeo Spotniks).
 * Persiste `site_config.json` via GitHub API (sem rebuild).
 * Requer cookie de sessão admin.
 * Body: { spotniks_url?: string }
 * Retorna: { ok: true } | { ok: false } (401 sem sessão)
 */
export async function PUT(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ ok: false }, { status: 401 })

  const body = await req.json()

  const file = await ghGet()
  const current: Record<string, string> = file.content
    ? JSON.parse(Buffer.from(file.content, "base64").toString())
    : {}

  if (typeof body.spotniks_url === "string") current.spotniks_url = body.spotniks_url

  const newContent = Buffer.from(JSON.stringify(current, null, 2)).toString("base64")

  await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}`, {
    method: "PUT",
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "cms: atualiza site_config",
      content: newContent,
      sha: file.sha,
    }),
  })

  return NextResponse.json({ ok: true })
}
