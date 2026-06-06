import { NextRequest, NextResponse } from "next/server"

const REPO = "danielarraesreino/ozipagame"
const FILE = "public/audio_config.json"

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

interface Faixa { nome: string; url: string }

// PUT { trilhas: Faixa[] } — substitui a playlist inteira da trilha de fundo.
export async function PUT(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ ok: false }, { status: 401 })

  const body = await req.json()
  const trilhas: Faixa[] = Array.isArray(body.trilhas)
    ? body.trilhas
        .filter((f: Faixa) => f && typeof f.url === "string" && f.url)
        .map((f: Faixa) => ({ nome: String(f.nome || "faixa").slice(0, 80), url: f.url }))
    : []

  const file = await ghGet()
  // Mantém compat: grava a lista nova e espelha a 1ª faixa em `trilha`.
  const novo = { trilhas, trilha: trilhas[0]?.url ?? "" }

  const newContent = Buffer.from(JSON.stringify(novo, null, 2)).toString("base64")

  await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}`, {
    method: "PUT",
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `cms: atualiza playlist (${trilhas.length} faixa(s))`,
      content: newContent,
      sha: file.sha,
    }),
  })

  return NextResponse.json({ ok: true })
}
