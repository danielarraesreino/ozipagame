"use client"

import { useState } from "react"
import Link from "next/link"
import Logo from "@/components/Logo"
import InscricaoForm from "@/components/InscricaoForm"
import PrankJogo from "@/components/PrankJogo"

const MENU_LINKS = [
  { href: "/",            icon: "🏠", label: "Início"   },
  { href: "/#pesquisa",   icon: "📋", label: "Pesquisa" },
  { href: "/#jogo",       icon: "🎮", label: "Jogo"     },
  { href: "/equipe",      icon: "👥", label: "Equipe"   },
  { href: "/admin",       icon: "🔒", label: "Admin"    },
]

export default function PesquisaClient() {
  const [confirmado, setConfirmado] = useState(false)
  const [turmaEscolhida, setTurmaEscolhida] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main className="bg-halftone bg-halftone-veil min-h-full">
      <div className="relative z-10 min-h-full px-6 py-10 max-w-md mx-auto">

        {!confirmado ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Logo size={40} variant="cor" />
                <h1 className="brand-lockup text-creme text-3xl leading-none">
                  Inscrição<br /><span className="text-laranja">no evento</span>
                </h1>
              </div>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-grafite-3 hover:border-laranja transition-colors active:scale-95 shrink-0"
                aria-label="menu"
              >
                <span className={`block w-5 h-0.5 bg-creme transition-transform duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
                <span className={`block w-5 h-0.5 bg-creme transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
                <span className={`block w-5 h-0.5 bg-creme transition-transform duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
              </button>
            </div>

            {menuOpen && (
              <div className="mb-4 bg-grafite-2/98 border-2 border-grafite-3 rounded-2xl overflow-hidden backdrop-blur">
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

            <div className="bg-grafite-2 border border-grafite-3 rounded-2xl px-4 py-3 mb-6 space-y-1">
              <p className="brand-label text-[10px] text-laranja mb-1">data e local</p>
              <p className="text-creme text-base font-bold">Dia 20 de Julho — sábado</p>
              <p className="text-creme text-sm">E.E Parque Oziel</p>
              <div className="flex gap-4 mt-1 text-sm text-creme/70 font-mono">
                <span>manhã: 9h–11h</span>
                <span>tarde: 14h30–16h30</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6 px-4 py-3 bg-laranja/10 border-2 border-laranja rounded-2xl">
              <span className="text-2xl animate-bounce shrink-0">📱</span>
              <p className="brand-lockup text-laranja text-base leading-snug">
                TRAZ SEU CELULAR<br />
                <span className="text-creme text-sm font-normal">carregado no dia 20 — vai precisar!</span>
              </p>
              <span className="pulse-glow shrink-0 w-3 h-3 rounded-full bg-laranja" />
            </div>

            <InscricaoForm onDone={(t) => { setTurmaEscolhida(t); setConfirmado(true) }} />

            <Link
              href="/"
              className="mt-6 w-full py-3 border-2 border-grafite-3 text-creme/60 brand-lockup text-base rounded-xl text-center block hover:border-creme/30 hover:text-creme transition-all active:scale-95"
            >
              ← voltar ao início
            </Link>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center gap-6">
            <p className="brand-lockup text-verde text-4xl">inscrito(a)! 🎉</p>

            <div className="w-full bg-grafite-2 border-2 border-laranja rounded-2xl px-6 py-6 space-y-3 text-left">
              <p className="brand-label text-[10px] text-laranja">sua inscrição confirmada</p>
              <p className="text-creme text-xl font-bold">Dia 20 de Julho — Sábado</p>
              <p className="text-creme text-base">{turmaEscolhida}</p>
              <div className="border-t border-grafite-3 pt-3 mt-1">
                <p className="text-creme/70 text-sm font-mono">E.E Parque Oziel</p>
              </div>
            </div>

            <p className="text-creme/70 text-sm leading-relaxed max-w-[36ch]">
              Te vemos lá!
            </p>

            <PrankJogo
              label="JOGAR AGORA →"
              className="zine-edge w-full py-4 bg-laranja text-grafite brand-lockup text-2xl rounded-xl text-center active:scale-95 active:shadow-none transition-all"
            />
          </div>
        )}

      </div>
    </main>
  )
}
