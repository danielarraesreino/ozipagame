"use client"

import { useState } from "react"
import Link from "next/link"
import Logo from "@/components/Logo"
import MenuHamburger from "@/components/MenuHamburger"
import AvaliacaoForm from "@/components/AvaliacaoForm"

export default function AvaliacaoClient() {
  const [pronto, setPronto] = useState(false)

  return (
    <main className="bg-halftone bg-halftone-veil min-h-full">
      <div className="relative z-10 min-h-full px-6 py-10 max-w-md mx-auto">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Logo size={40} variant="cor" />
            <h1 className="brand-lockup text-creme text-3xl leading-none">
              Avaliação<br /><span className="text-laranja">do encontro</span>
            </h1>
          </div>
          <MenuHamburger />
        </div>

        <div className="bg-grafite-2 border border-grafite-3 rounded-2xl px-4 py-3 mb-6">
          <p className="brand-label text-[10px] text-laranja mb-1">pós-encontro · anônimo</p>
          <p className="text-creme-soft text-sm">Responde depois da oficina. Sem nome, sem e-mail — só tua opinião.</p>
        </div>

        <AvaliacaoForm onDone={() => setPronto(true)} />

        {pronto && (
          <Link
            href="/"
            className="mt-6 w-full py-3 border-2 border-grafite-3 text-creme/60 brand-lockup text-base rounded-xl text-center block hover:border-creme/30 hover:text-creme transition-all active:scale-95"
          >
            ← voltar ao início
          </Link>
        )}
      </div>
    </main>
  )
}
