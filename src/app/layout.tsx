import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Vozes do Oziel",
  description: "Serious game sobre participação popular para jovens do Jardim Oziel, Campinas.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="h-full bg-[#0E0E0F] text-[#F5F0E8] antialiased">{children}</body>
    </html>
  )
}
