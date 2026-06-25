"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getEmbedUrl, getYouTubeId } from "@/lib/video"
import Logo from "@/components/Logo"
import MenuHamburger from "@/components/MenuHamburger"
import InstallButton from "@/components/InstallButton"

// Ações rápidas do hub (home). Botões grandes, cor de destaque por tema.
// "Jogar" é o primário (fora desta lista). Admin fica só no menu hamburger.
const ACOES = [
  { href: "/pesquisa",    icon: "📋", label: "Inscrição",  sub: "garante tua vaga dia 20", cor: "var(--color-verde)"    },
  { href: "/inicio",      icon: "📝", label: "Pesquisa",   sub: "tua voz no começo",       cor: "var(--color-amarelo)"  },
  { href: "/avaliacao",   icon: "⭐", label: "Avaliação",  sub: "como foi o encontro",     cor: "var(--color-laranja)"  },
  { href: "/dados",       icon: "📊", label: "Dados",      sub: "o que o Oziel respondeu", cor: "var(--color-verde)"    },
  { href: "/enviar-meme", icon: "📨", label: "Teu meme",   sub: "manda o teu",             cor: "var(--color-vermelho)" },
  { href: "/equipe",      icon: "👥", label: "Equipe",     sub: "quem tá por trás",        cor: "var(--color-amarelo)"  },
]

export default function Home() {
  const [spotniksUrl, setSpotniksUrl] = useState("")
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    fetch("/site_config.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((cfg: { spotniks_url?: string }) => setSpotniksUrl(cfg.spotniks_url || ""))
      .catch(() => {})
  }, [])

  return (
    <main className="bg-halftone bg-halftone-veil min-h-full">
      <div className="relative z-10 min-h-full px-6 py-10 max-w-md mx-auto">
        {/* Lockup da marca + menu hamburger */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            <Logo size={52} variant="cor" />
            <div>
              <p className="brand-stamp text-[9px] text-creme-soft leading-none mb-1">
                Grupo Diálogos · CriaLab
              </p>
              <p className="brand-stamp text-[9px] text-creme-soft leading-none">
                Campinas
              </p>
            </div>
          </div>
          <MenuHamburger />
        </div>

        <h1 className="brand-lockup text-creme text-[clamp(3rem,16vw,4.75rem)] mb-3 relative inline-block">
          Vozes
          <br />
          <span className="text-laranja">do Oziel</span>
          <span className="zine-edge absolute -top-3 -right-6 bg-laranja text-grafite brand-lockup text-xl sm:text-2xl px-3 py-1 rounded-xl rotate-6 shadow-[4px_4px_0_0_rgba(0,0,0,0.45)] pulse-glow">
            Será? 🤔
          </span>
        </h1>
        <p className="brand-label text-laranja text-[11px] mb-5">
          Cidadania Conectada
        </p>
        <p className="text-creme-soft text-base leading-relaxed mb-7 max-w-[32ch]">
          Memes, dilemas e o que eles escondem. 3 minutos, sem certo ou errado. Escolhe por onde começar 👇
        </p>

        {/* Vídeo que inspirou (se configurado) */}
        {spotniksUrl && (() => {
          const ytId = getYouTubeId(spotniksUrl)
          return (
            <button
              type="button"
              onClick={() => setShowVideo(true)}
              className="group relative w-full mb-7 rounded-xl overflow-hidden border-2 border-laranja zine-edge active:scale-[0.98] transition-transform"
            >
              {ytId ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                  alt="vídeo que inspirou o jogo"
                  className="w-full aspect-video object-cover opacity-75 group-hover:opacity-90 transition-opacity"
                />
              ) : (
                <div className="w-full aspect-video bg-grafite-2" />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-grafite/35">
                <span className="pulse-glow w-16 h-16 rounded-full bg-laranja flex items-center justify-center">
                  <span className="text-grafite text-2xl ml-1 leading-none">▶</span>
                </span>
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-grafite/85 backdrop-blur-sm px-3 py-2 flex items-center gap-2">
                <span className="brand-label text-[10px] text-laranja">assista o que inspirou o jogo</span>
                <span className="brand-stamp text-[9px] text-creme-soft/60 ml-auto">▶ 2 min</span>
              </div>
            </button>
          )
        })()}

        {/* Ação primária: jogar */}
        <Link
          href="/game"
          className="zine-edge group flex items-center justify-between gap-3 w-full p-5 mb-4 bg-laranja text-grafite rounded-2xl active:scale-[0.98] active:shadow-none transition-all"
        >
          <span className="flex items-center gap-3">
            <span className="text-3xl leading-none">🎮</span>
            <span>
              <span className="brand-lockup text-3xl leading-none block">Jogar</span>
              <span className="text-grafite/80 text-xs font-bold">arrasta os memes e descobre o que tá por trás</span>
            </span>
          </span>
          <span className="brand-lockup text-3xl leading-none group-active:translate-x-1 transition-transform">→</span>
        </Link>

        {/* Ações rápidas */}
        <div className="grid grid-cols-2 gap-3">
          {ACOES.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="zine-edge flex flex-col gap-1 bg-grafite-2 border-2 rounded-2xl p-4 active:scale-95 active:shadow-none transition-all"
              style={{ borderColor: a.cor }}
            >
              <span className="text-2xl leading-none mb-1">{a.icon}</span>
              <span className="brand-lockup text-creme text-lg leading-none">{a.label}</span>
              <span className="text-creme-soft/70 text-[11px] leading-tight">{a.sub}</span>
            </Link>
          ))}
        </div>

        <InstallButton />

        <p className="text-center text-creme-soft/50 text-xs mt-7 font-mono">
          sem cadastro · sem login · 100% anônimo
        </p>
        <p className="text-center text-creme-soft/50 text-xs mt-1 font-mono">
          <a href="/sobre.html" className="underline hover:text-creme transition-colors">sobre o projeto</a>
        </p>
      </div>

      {/* Modal do vídeo do Spotniks (a inspiração) */}
      {showVideo && spotniksUrl && (
        <div
          className="fixed inset-0 z-50 bg-grafite/95 backdrop-blur flex flex-col items-center justify-center p-4"
          onClick={() => setShowVideo(false)}
        >
          <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="brand-label text-[10px] text-laranja">o que inspirou o jogo</p>
              <button
                onClick={() => setShowVideo(false)}
                className="text-creme-soft hover:text-creme text-xl leading-none px-2"
                aria-label="fechar"
              >
                ✕
              </button>
            </div>
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden zine-edge">
              <iframe
                src={getEmbedUrl(spotniksUrl)}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                style={{ border: "none" }}
                title="Vídeo do Spotniks"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
