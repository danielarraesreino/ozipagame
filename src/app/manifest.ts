import type { MetadataRoute } from "next"

// Web App Manifest — torna o jogo instalável ("adicionar à tela inicial").
// Next serve isto em /manifest.webmanifest e injeta o <link rel="manifest">.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vozes da Quebrada",
    short_name: "Quebrada",
    description: "Memes, dilemas e o que eles escondem. Cidadania conectada, do Parque Oziel.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#13130E",
    theme_color: "#13130E",
    lang: "pt-BR",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
