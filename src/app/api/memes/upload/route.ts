import { NextRequest, NextResponse } from "next/server"
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"

// Upload PÚBLICO de imagem de meme (sem login). Superfície de abuso — por isso
// só imagem, tamanho pequeno e sufixo aleatório. Mitigação extra (BotID/
// Turnstile) fica como follow-up se aparecer abuso.
const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX = 8 * 1024 * 1024 // 8MB

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as HandleUploadBody
  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: TIPOS,
        maximumSizeInBytes: MAX,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {},
    })
    return NextResponse.json(json)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 })
  }
}
