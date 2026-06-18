import { NextRequest, NextResponse } from "next/server"

const COOKIE = "ozipa_admin"

/**
 * POST /api/admin/login
 * Autentica o admin com senha. Define cookie httpOnly `ozipa_admin=1` por 8h.
 * Body: { password: string }
 * Retorna: { ok: true } (200) | { ok: false } (401)
 */
export async function POST(req: NextRequest) {
  const { password } = await req.json()
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8h
  })
  return res
}

/**
 * DELETE /api/admin/login
 * Encerra a sessão do admin removendo o cookie `ozipa_admin`.
 * Retorna: { ok: true }
 */
export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete("ozipa_admin")
  return res
}
