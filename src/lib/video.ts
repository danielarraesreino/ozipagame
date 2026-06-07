// Helpers de vídeo compartilhados (VideoScreen, modal do Spotniks na home).

// Vídeo de arquivo (mp4/webm/mov) — toca com <video>, não iframe.
export function isArquivoVideo(url: string): boolean {
  return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url) || url.startsWith("/videos/")
}

// Extrai o ID de um vídeo do YouTube (pra thumbnail etc). Null se não for YT.
export function getYouTubeId(url: string): string | null {
  const m =
    url.match(/youtube\.com\/shorts\/([^?&]+)/) ||
    url.match(/youtu\.be\/([^?&]+)/) ||
    url.match(/youtube\.com\/watch\?v=([^&]+)/) ||
    url.match(/youtube\.com\/embed\/([^?&]+)/)
  return m ? m[1] : null
}

// Converte uma URL de TikTok / YouTube em URL de embed (iframe).
export function getEmbedUrl(url: string): string {
  const tiktokMatch = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/)
  if (tiktokMatch) return `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`

  const ytShorts = url.match(/youtube\.com\/shorts\/([^?&]+)/)
  if (ytShorts) return `https://www.youtube.com/embed/${ytShorts[1]}?autoplay=1`

  const ytShort = url.match(/youtu\.be\/([^?&]+)/)
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}?autoplay=1`

  const ytWatch = url.match(/youtube\.com\/watch\?v=([^&]+)/)
  if (ytWatch) return `https://www.youtube.com/embed/${ytWatch[1]}?autoplay=1`

  return url
}
