import { NextRequest, NextResponse } from "next/server"

const REPO = "danielarraesreino/ozipagame"
const FILE = "public/video_urls.json"

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
 * PUT /api/admin/videos
 * Associa ou remove uma URL de vídeo de pílula a um dilema.
 * Persiste `video_urls.json` via GitHub API (sem rebuild).
 * Requer cookie de sessão admin.
 * Body: { dilema_id: string, url?: string }
 *   - Se `url` presente: associa o vídeo ao dilema.
 *   - Se `url` ausente/vazio: remove o vídeo do dilema.
 * Retorna: { ok: true } | { ok: false } (400 sem dilema_id, 401 sem sessão)
 */
export async function PUT(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ ok: false }, { status: 401 })

  const { dilema_id, url } = await req.json()
  if (!dilema_id) return NextResponse.json({ ok: false }, { status: 400 })

  const file = await ghGet()
  const current: Record<string, string> = file.content
    ? JSON.parse(Buffer.from(file.content, "base64").toString())
    : {}

  if (url) current[dilema_id] = url
  else delete current[dilema_id]

  const newContent = Buffer.from(JSON.stringify(current, null, 2)).toString("base64")

  await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}`, {
    method: "PUT",
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `cms: ${url ? "add" : "remove"} video → ${dilema_id}`,
      content: newContent,
      sha: file.sha,
    }),
  })

  return NextResponse.json({ ok: true })
}
