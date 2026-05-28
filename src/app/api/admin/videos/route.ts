import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

function authed(req: NextRequest) {
  return req.cookies.get("ozipa_admin")?.value === "1"
}

export async function PUT(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ ok: false }, { status: 401 })

  const { dilema_id, url } = await req.json()
  if (!dilema_id) return NextResponse.json({ ok: false }, { status: 400 })

  const sb = adminClient()
  if (!url) {
    await sb.from("video_urls").delete().eq("dilema_id", dilema_id)
  } else {
    await sb.from("video_urls").upsert({ dilema_id, url }, { onConflict: "dilema_id" })
  }
  return NextResponse.json({ ok: true })
}
