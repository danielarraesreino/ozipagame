"use client"

import Link from "next/link"
import Logo from "@/components/Logo"
import PesquisaForm from "@/components/PesquisaForm"

export default function PesquisaPage() {
  return (
    <main className="bg-halftone bg-halftone-veil min-h-full">
      <div className="relative z-10 min-h-full px-6 py-10 max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-3">
          <Logo size={40} variant="cor" />
          <h1 className="brand-lockup text-creme text-3xl leading-none">
            Pesquisa<br /><span className="text-laranja">da quebrada</span>
          </h1>
        </div>
        <p className="text-creme-soft text-sm leading-relaxed mb-2 max-w-[44ch]">
          Uma pesquisa rápida e <strong>100% anônima</strong> sobre como a juventude do
          Jardim Oziel se relaciona com política. Não tem resposta certa — tem a tua.
        </p>
        <p className="brand-stamp text-[10px] text-creme-soft/50 mb-8">
          sem cadastro · os números viram dados abertos · texto fica só com a equipe
        </p>

        <PesquisaForm modo="completa" />

        <p className="text-center text-creme-soft/50 text-xs mt-6 font-mono">
          <Link href="/dados" className="underline text-laranja">ver dados abertos</Link>
          {" · "}
          <Link href="/" className="underline">voltar</Link>
        </p>
      </div>
    </main>
  )
}
