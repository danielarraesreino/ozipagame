// Mantido para compatibilidade — o jogo lê /video_urls.json direto (arquivo estático)
import { NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

export async function GET() {
  try {
    const raw = readFileSync(join(process.cwd(), "public/video_urls.json"), "utf-8")
    return NextResponse.json(JSON.parse(raw))
  } catch {
    return NextResponse.json({})
  }
}
