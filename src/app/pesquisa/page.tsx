"use client"

import { useState } from "react"
import Link from "next/link"
import Logo from "@/components/Logo"
import InscricaoForm from "@/components/InscricaoForm"
import PesquisaForm from "@/components/PesquisaForm"

type Etapa = "inscricao" | "pesquisa" | "confirmado"

export default function PesquisaPage() {
  const [etapa, setEtapa] = useState<Etapa>("inscricao")
  const [turmaEscolhida, setTurmaEscolhida] = useState("")

  return (
    <main className="bg-halftone bg-halftone-veil min-h-full">
      <div className="relative z-10 min-h-full px-6 py-10 max-w-md mx-auto">

        {etapa === "inscricao" && (
          <>
            <div className="flex items-center gap-3 mb-3">
              <Logo size={40} variant="cor" />
              <h1 className="brand-lockup text-creme text-3xl leading-none">
                Inscrição<br /><span className="text-laranja">no evento</span>
              </h1>
            </div>

            <div className="bg-grafite-2 border border-grafite-3 rounded-2xl px-4 py-3 mb-6 space-y-1">
              <p className="brand-label text-[10px] text-laranja mb-1">data e local</p>
              <p className="text-creme text-base font-bold">Dia 20 de Julho — sábado</p>
              <p className="text-creme text-sm">E.E Parque Oziel</p>
              <div className="flex gap-4 mt-1 text-sm text-creme/70 font-mono">
                <span>manhã: 9h</span>
                <span>tarde: 14h30</span>
              </div>
            </div>

            <InscricaoForm onDone={(t) => { setTurmaEscolhida(t); setEtapa("pesquisa") }} />

            <Link
              href="/"
              className="mt-6 w-full py-3 border-2 border-grafite-3 text-creme/60 brand-lockup text-base rounded-xl text-center block hover:border-creme/30 hover:text-creme transition-all active:scale-95"
            >
              ← voltar ao início
            </Link>
          </>
        )}

        {etapa === "pesquisa" && (
          <>
            <div className="flex items-center gap-3 mb-3">
              <Logo size={40} variant="cor" />
              <h1 className="brand-lockup text-creme text-3xl leading-none">
                Pesquisa<br /><span className="text-laranja">da quebrada</span>
              </h1>
            </div>
            <p className="text-creme text-base leading-relaxed mb-2 max-w-[44ch]">
              Uma pesquisa rápida e <strong>100% anônima</strong> sobre como a juventude do
              Oziel se relaciona com política. Não tem resposta certa — tem a tua.
            </p>
            <p className="brand-stamp text-[10px] text-creme/50 mb-8">
              sem cadastro · os números viram dados abertos · texto fica só com a equipe
            </p>

            <PesquisaForm modo="completa" onDone={() => setEtapa("confirmado")} />

            <div className="mt-6 space-y-3">
              <Link
                href="/"
                className="zine-edge w-full py-4 bg-laranja text-grafite brand-lockup text-2xl rounded-xl text-center block active:scale-95 active:shadow-none transition-all"
              >
                JOGAR AGORA →
              </Link>
              <Link
                href="/dados"
                className="w-full py-3 border-2 border-grafite-3 text-creme/60 brand-lockup text-base rounded-xl text-center block hover:border-laranja hover:text-laranja transition-all active:scale-95"
              >
                ver dados abertos
              </Link>
            </div>
          </>
        )}

        {etapa === "confirmado" && (
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
              Sua voz foi registrada — obrigado por participar da pesquisa. Te vemos lá!
            </p>

            <Link
              href="/"
              className="zine-edge w-full py-4 bg-laranja text-grafite brand-lockup text-2xl rounded-xl text-center block active:scale-95 transition-all"
            >
              JOGAR AGORA →
            </Link>

            <p className="text-center text-creme/40 text-xs font-mono">
              <Link href="/dados" className="underline text-laranja/70">ver dados abertos</Link>
            </p>
          </div>
        )}

      </div>
    </main>
  )
}
