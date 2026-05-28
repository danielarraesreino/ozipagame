import { NextRequest, NextResponse } from "next/server"

const COOKIE = "ozipa_admin"

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

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete("ozipa_admin")
  return res
}
