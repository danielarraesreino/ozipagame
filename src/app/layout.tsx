import type { Metadata, Viewport } from "next"
import { Archivo, Space_Mono } from "next/font/google"
import "./globals.css"

// Display + corpo: Archivo (variável, vai até 900 — usada no peso black do lockup)
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
})

// Rótulos / tagline em mono (estilo zine / risograph)
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Vozes do Oziel — Cidadania Conectada",
  description: "Serious game sobre participação popular para jovens do Jardim Oziel, Campinas.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#13130E",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`h-full ${archivo.variable} ${spaceMono.variable}`}>
      <body className="h-full bg-grafite text-creme antialiased">{children}</body>
    </html>
  )
}
