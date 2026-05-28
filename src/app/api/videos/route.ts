import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const { data, error } = await sb.from("video_urls").select("dilema_id,url")
    if (error) throw error

    const map: Record<string, string> = {}
    for (const row of data ?? []) map[row.dilema_id] = row.url
    return NextResponse.json(map)
  } catch {
    return NextResponse.json({})
  }
}
