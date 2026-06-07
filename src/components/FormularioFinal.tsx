"use client"

import { useState } from "react"
import PesquisaForm from "./PesquisaForm"

// Versão curta da pesquisa, exibida (opcional) na tela final do jogo.
interface Props { bairro: string }

export default function FormularioFinal({ bairro }: Props) {
  const [aberto, setAberto] = useState(false)

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="w-full py-3 rounded-xl border-2 border-grafite-3 text-creme-soft hover:border-laranja hover:text-creme font-mono text-sm transition-all active:scale-95"
      >
        📋 responde uma pesquisa rápida (anônima)
      </button>
    )
  }

  return (
    <div className="grain relative bg-grafite-2 border-2 border-grafite-3 rounded-2xl p-5">
      <div className="mb-4">
        <p className="brand-lockup text-creme text-2xl leading-none mb-1">tua voz conta</p>
        <p className="text-creme-soft/70 text-xs font-mono">anônimo · ajuda a entender a juventude do bairro</p>
      </div>
      <PesquisaForm modo="curta" bairro={bairro} />
      <p className="text-center text-creme-soft/50 text-[11px] font-mono mt-4">
        quer responder a pesquisa completa? <a href="/pesquisa" className="underline text-laranja">abre aqui</a>
      </p>
    </div>
  )
}
