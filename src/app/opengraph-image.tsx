import { ImageResponse } from "next/og"

// Imagem de compartilhamento (WhatsApp, Instagram, X, etc.) — 1200x630
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Vozes da Quebrada — Cidadania Conectada"

// Símbolo da marca (balão de fala partido) como data URI SVG — espelha public/brand/logo.svg
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <clipPath id="b"><rect x="34" y="28" width="188" height="152" rx="60"/><path d="M 80 168 L 120 172 L 70 218 Z"/></clipPath>
  </defs>
  <g clip-path="url(#b)">
    <rect width="256" height="256" fill="#EA5B1E"/>
    <path d="M 132 18 C 112 70, 148 122, 128 204 L 256 256 L 256 0 Z" fill="#1C1C1E"/>
  </g>
  <circle cx="124" cy="100" r="38" fill="#F7F1E6"/>
  <polyline points="121,82 101,100 121,118" fill="none" stroke="#EA5B1E" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
  <polyline points="127,82 147,100 127,118" fill="none" stroke="#1C1C1E" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
const logoDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(logoSvg)}`

async function loadFont(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`font ${url}: ${res.status}`)
  return res.arrayBuffer()
}

export default async function Image() {
  const [archivoBlack, spaceMono] = await Promise.all([
    loadFont("https://raw.githubusercontent.com/google/fonts/main/ofl/archivoblack/ArchivoBlack-Regular.ttf"),
    loadFont("https://raw.githubusercontent.com/google/fonts/main/ofl/spacemono/SpaceMono-Bold.ttf"),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#13130E",
          backgroundImage:
            "radial-gradient(circle at 18% 22%, rgba(234,91,30,0.18) 0%, rgba(234,91,30,0) 42%), radial-gradient(circle at 88% 85%, rgba(38,199,154,0.12) 0%, rgba(38,199,154,0) 40%)",
          padding: "72px 80px",
          fontFamily: "Archivo Black",
        }}
      >
        {/* topo: símbolo + tagline */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoDataUri} width={120} height={120} alt="" />
          <div
            style={{
              fontFamily: "Space Mono",
              color: "#EA5B1E",
              fontSize: 26,
              letterSpacing: 8,
              textTransform: "uppercase",
            }}
          >
            Grupo Diálogos · CriaLab
          </div>
        </div>

        {/* lockup */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 150,
              lineHeight: 0.86,
              color: "#F7F1E6",
              textTransform: "uppercase",
              letterSpacing: -2,
            }}
          >
            Vozes
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 150,
              lineHeight: 0.86,
              color: "#EA5B1E",
              textTransform: "uppercase",
              letterSpacing: -2,
            }}
          >
            da Quebrada
          </div>
          <div
            style={{
              fontFamily: "Space Mono",
              color: "#FFD21E",
              fontSize: 30,
              letterSpacing: 10,
              textTransform: "uppercase",
              marginTop: 24,
            }}
          >
            Cidadania Conectada
          </div>
        </div>

        {/* rodapé: pitch + selos de decisão */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32 }}>
          <div style={{ display: "flex", fontFamily: "Space Mono", color: "#B8B2A6", fontSize: 25 }}>
            o que o meme apaga · 3 min
          </div>
          <div style={{ display: "flex", gap: 16, fontFamily: "Space Mono", fontSize: 24 }}>
            <div
              style={{
                display: "flex",
                background: "#26C79A",
                color: "#13130E",
                padding: "8px 18px",
                borderRadius: 8,
              }}
            >
              CONCORDO
            </div>
            <div
              style={{
                display: "flex",
                background: "#E8402F",
                color: "#13130E",
                padding: "8px 18px",
                borderRadius: 8,
              }}
            >
              DISCORDO
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Archivo Black", data: archivoBlack, weight: 400, style: "normal" },
        { name: "Space Mono", data: spaceMono, weight: 700, style: "normal" },
      ],
    },
  )
}
