import { NextRequest, NextResponse } from "next/server"
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"

// Upload de vídeo pronto direto pro Vercel Blob.
// O navegador manda o arquivo direto pro Blob (sem passar pela função, então
// não há o limite de ~4,5MB das funções) — esta rota só assina o token de upload
// depois de conferir a senha de admin. A URL pública volta pro navegador, que a
// salva no video_urls.json pelo fluxo de sempre (/api/admin/videos).

const TIPOS_PERMITIDOS = [
  "video/mp4",
  "video/webm",
  "video/quicktime", // .mov do iPhone
  "video/x-m4v",
  // trilha sonora (rap) — formatos comuns de celular/web
  "audio/mpeg", // .mp3
  "audio/mp4",  // .m4a
  "audio/aac",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
]

const TAMANHO_MAX = 80 * 1024 * 1024 // 80MB — folga pra vídeo de celular ou faixa

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as HandleUploadBody
  // Cookie só existe quando o pedido vem do navegador da equipe logada.
  // O callback de "upload concluído" vem dos servidores do Blob (sem cookie),
  // por isso a checagem fica dentro de onBeforeGenerateToken, não no topo.
  const logado = req.cookies.get("ozipa_admin")?.value === "1"

  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => {
        if (!logado) throw new Error("não autorizado")
        return {
          allowedContentTypes: TIPOS_PERMITIDOS,
          maximumSizeInBytes: TAMANHO_MAX,
          addRandomSuffix: true,
        }
      },
      // Nada a fazer aqui: o navegador já recebe a URL no retorno do upload.
      onUploadCompleted: async () => {},
    })
    return NextResponse.json(json)
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 },
    )
  }
}
