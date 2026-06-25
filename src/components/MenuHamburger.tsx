"use client"

import { useState } from "react"
import Link from "next/link"

// Menu hamburger reutilizável (canto superior direito). Lista única de rotas do
// site. Usar em qualquer página/header. Fonte única dos links de navegação.
export const MENU_LINKS = [
  { href: "/",            icon: "🏠", label: "Início"              },
  { href: "/game",        icon: "🎮", label: "Jogo"                },
  { href: "/pesquisa",    icon: "📋", label: "Inscrição"           },
  { href: "/inicio",      icon: "📝", label: "Pesquisa de entrada" },
  { href: "/avaliacao",   icon: "⭐", label: "Avaliação"           },
  { href: "/dados",       icon: "📊", label: "Dados abertos"       },
  { href: "/apresentacao", icon: "📈", label: "Apresentação"        },
  { href: "/enviar-meme", icon: "📨", label: "Manda teu meme"      },
  { href: "/equipe",      icon: "👥", label: "Equipe"              },
  { href: "/admin",       icon: "🔒", label: "Admin"               },
]

export default function MenuHamburger() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setMenuOpen((o) => !o)}
        className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-grafite-3 hover:border-laranja transition-colors active:scale-95"
        aria-label="menu"
        aria-expanded={menuOpen}
      >
        <span className={`block w-5 h-0.5 bg-creme transition-transform duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
        <span className={`block w-5 h-0.5 bg-creme transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
        <span className={`block w-5 h-0.5 bg-creme transition-transform duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-60 z-50 bg-grafite-2/98 border-2 border-grafite-3 rounded-2xl overflow-hidden backdrop-blur shadow-[6px_6px_0_0_rgba(0,0,0,0.4)]">
          {MENU_LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-4 px-5 py-4 text-creme hover:bg-grafite-3/30 transition-colors ${i < MENU_LINKS.length - 1 ? "border-b border-grafite-3/60" : ""}`}
            >
              <span className="text-xl">{l.icon}</span>
              <span className="brand-lockup text-lg">{l.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
