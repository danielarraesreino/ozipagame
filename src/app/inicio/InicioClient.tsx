"use client"

import { useState } from "react"
import Link from "next/link"
import Logo from "@/components/Logo"
import MenuHamburger from "@/components/MenuHamburger"
import PesquisaForm from "@/components/PesquisaForm"

// Pesquisa de ENTRADA (baseline), aplicada no começo do encontro. Reusa a
// PesquisaForm completa e marca momento="inicio" pra separar no dashboard da
// versão curta do fim do jogo. Alimenta /api/form → /dados.
export default function InicioClient() {
  const [pronto, setPronto] = useState(false)

  return (
    <main className="bg-halftone bg-halftone-veil min-h-full">
      <div className="relative z-10 min-h-full px-6 py-10 max-w-md mx-auto">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Logo size={40} variant="cor" />
            <h1 className="brand-lockup text-creme text-3xl leading-none">
              Pesquisa<br /><span className="text-laranja">de entrada</span>
            </h1>
          </div>
          <MenuHamburger />
        </div>

        <div className="bg-grafite-2 border border-grafite-3 rounded-2xl px-4 py-3 mb-6">
          <p className="brand-label text-[10px] text-laranja mb-1">antes de começar · anônimo</p>
          <p className="text-creme-soft text-sm">Sem nome, sem e-mail. É um retrato de como a galera chega — pra comparar no fim.</p>
        </div>

        <PesquisaForm modo="completa" momento="inicio" onDone={() => setPronto(true)} />

        {pronto && (
          <Link
            href="/game"
            className="mt-6 zine-edge w-full py-4 bg-laranja text-grafite brand-lockup text-2xl rounded-xl text-center block active:scale-95 active:shadow-none transition-all"
          >
            ir pro jogo →
          </Link>
        )}
      </div>
    </main>
  )
}
