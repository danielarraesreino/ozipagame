"use client"

import { motion } from "framer-motion"
import type { Dilema } from "@/lib/dilemas"

interface Props {
  dilema: Dilema
  onNext: () => void
  current: number
  total: number
}

// Vídeo de arquivo (mp4/webm/mov), local ou direto — toca com <video>, não iframe.
function isArquivoVideo(url: string): boolean {
  return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url) || url.startsWith("/videos/")
}

function getEmbedUrl(url: string): string {
  // TikTok: https://www.tiktok.com/@user/video/123456
  const tiktokMatch = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/)
  if (tiktokMatch) return `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`

  // YouTube Shorts: https://youtube.com/shorts/ABC ou youtu.be/ABC
  const ytShorts = url.match(/youtube\.com\/shorts\/([^?&]+)/)
  if (ytShorts) return `https://www.youtube.com/embed/${ytShorts[1]}?autoplay=1`

  const ytShort = url.match(/youtu\.be\/([^?&]+)/)
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}?autoplay=1`

  const ytWatch = url.match(/youtube\.com\/watch\?v=([^&]+)/)
  if (ytWatch) return `https://www.youtube.com/embed/${ytWatch[1]}?autoplay=1`

  // Já é um embed URL
  return url
}

export default function VideoScreen({ dilema, onNext, current, total }: Props) {
  if (!dilema.video_url) return null

  const arquivo = isArquivoVideo(dilema.video_url)
  const embedUrl = getEmbedUrl(dilema.video_url)

  return (
    <motion.div
      className="flex flex-col h-full"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="brand-stamp text-[10px] text-laranja">
          o vídeo do oziel
        </p>
        <button
          onClick={onNext}
          className="text-xs text-creme-soft/70 font-mono hover:text-creme transition-colors py-1 px-2"
        >
          pular →
        </button>
      </div>

      {/* Player: arquivo mp4 local toca com <video>; TikTok/YouTube via iframe */}
      <div className="flex-1 relative bg-grafite-2 border-2 border-grafite-3 rounded-2xl zine-edge overflow-hidden min-h-0">
        {arquivo ? (
          <video
            src={dilema.video_url}
            className="absolute inset-0 w-full h-full object-contain bg-black"
            autoPlay
            playsInline
            controls
          />
        ) : (
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
            style={{ border: "none" }}
            title={`Vídeo: ${dilema.modulo}`}
          />
        )}
      </div>

      {/* Next */}
      <button
        onClick={onNext}
        className="zine-edge mt-4 w-full py-4 bg-laranja text-grafite brand-lockup text-2xl rounded-xl active:scale-95 active:shadow-none transition-all"
      >
        {current < total ? "próxima →" : "ver resultado →"}
      </button>
    </motion.div>
  )
}
