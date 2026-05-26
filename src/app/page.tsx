"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { savePlayer } from "@/lib/store"

const bairros = [
  "Jardim Oziel",
  "Jardim Florence",
  "Campo Grande",
  "DIC",
  "Outro bairro",
]

export default function Home() {
  const router = useRouter()
  const [apelido, setApelido] = useState("")
  const [bairro, setBairro] = useState("")

  function handleStart() {
    if (!apelido.trim() || !bairro) return
    savePlayer({ apelido: apelido.trim(), bairro })
    router.push("/game")
  }

  return (
    <main className="min-h-full flex flex-col justify-between px-6 py-12 max-w-md mx-auto">
      <div>
        <p className="text-[11px] font-mono tracking-widest uppercase text-[#E8431E] mb-8">
          Grupo Diálogos · CriaLab · Campinas
        </p>

        <h1 className="text-5xl font-black leading-none text-[#F5F0E8] mb-3">
          Vozes<br />do Oziel
        </h1>
        <p className="text-[#888] text-base leading-relaxed mb-12">
          Memes, dilemas e as consequências que eles escondem. 3 minutos. Sem certo ou errado.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono tracking-widest uppercase text-[#555] mb-2">
              Como te chamam?
            </label>
            <input
              type="text"
              value={apelido}
              onChange={(e) => setApelido(e.target.value)}
              placeholder="seu apelido"
              maxLength={24}
              className="w-full bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl px-4 py-3 text-[#F5F0E8] placeholder-[#444] focus:outline-none focus:border-[#E8431E] transition-colors text-base"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono tracking-widest uppercase text-[#555] mb-2">
              De onde você é?
            </label>
            <select
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              className="w-full bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl px-4 py-3 text-[#F5F0E8] focus:outline-none focus:border-[#E8431E] transition-colors text-base appearance-none"
            >
              <option value="" disabled>escolha seu bairro</option>
              {bairros.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <button
          onClick={handleStart}
          disabled={!apelido.trim() || !bairro}
          className="w-full py-4 bg-[#E8431E] text-white font-bold text-base rounded-xl disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform"
        >
          entrar no jogo →
        </button>
        <p className="text-center text-[#444] text-xs mt-4 font-mono">
          sem cadastro · sem senha · sem rastreio
        </p>
      </div>
    </main>
  )
}
