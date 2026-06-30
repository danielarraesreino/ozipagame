import type { Metadata, Viewport } from "next"
import { Archivo, Space_Mono } from "next/font/google"
import "./globals.css"
import PWARegister from "@/components/PWARegister"

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

const SITE_URL = "https://jogoozipa.vercel.app"
const TITLE = "Vozes da Quebrada — Cidadania Conectada"
const DESCRIPTION =
  "Memes, dilemas e as consequências que eles escondem. Um jogo de 3 minutos sobre participação popular, feito por e para a juventude do Parque Oziel, Campinas."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Vozes da Quebrada",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Oziel" },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
  keywords: ["Parque Oziel", "Campinas", "cidadania", "participação popular", "desinformação", "serious game", "juventude"],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "Vozes da Quebrada",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
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
      <body className="h-full bg-grafite text-creme antialiased">
        <PWARegister />
        {children}
      </body>
    </html>
  )
}
