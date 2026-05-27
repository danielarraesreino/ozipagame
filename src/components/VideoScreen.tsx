"use client"

import { motion } from "framer-motion"
import type { Dilema } from "@/lib/dilemas"

interface Props {
  dilema: Dilema
  onNext: () => void
  current: number
  total: number
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
        <p className="text-[10px] font-mono tracking-widest uppercase text-[#E8431E]">
          o vídeo do oziel
        </p>
        <button
          onClick={onNext}
          className="text-xs text-[#555] font-mono hover:text-[#888] transition-colors py-1 px-2"
        >
          pular →
        </button>
      </div>

      {/* Embed */}
      <div className="flex-1 relative bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl overflow-hidden min-h-0">
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
          style={{ border: "none" }}
          title={`Vídeo: ${dilema.modulo}`}
        />
      </div>

      {/* Next */}
      <button
        onClick={onNext}
        className="mt-4 w-full py-4 bg-[#E8431E] text-white font-bold text-base rounded-xl active:scale-95 transition-transform"
      >
        {current < total ? "próxima →" : "ver resultado →"}
      </button>
    </motion.div>
  )
}
