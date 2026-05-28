"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { savePlayer, unlockModulo, isPosOficinaUnlocked } from "@/lib/store"

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
  const [codigo, setCodigo] = useState("")
  const [codigoStatus, setCodigoStatus] = useState<"idle" | "ok" | "err">("idle")
  const [mostrarCodigo, setMostrarCodigo] = useState(false)
  const jaDesbloqueado = isPosOficinaUnlocked()

  async function validarCodigo(c: string) {
    const val = c.trim().toUpperCase()
    if (!val) return
    try {
      const data = await fetch("/room_codes.json").then((r) => r.json())
      const entry = data[val]
      if (entry?.ativo) {
        unlockModulo(val)
        setCodigoStatus("ok")
      } else {
        setCodigoStatus("err")
      }
    } catch {
      setCodigoStatus("err")
    }
  }

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

          {/* Código de encontro */}
          <div>
            {jaDesbloqueado ? (
              <div className="flex items-center gap-2 px-4 py-3 bg-[#2DD4A0]/10 border border-[#2DD4A0]/30 rounded-xl">
                <span className="text-[#2DD4A0] text-sm">✓</span>
                <span className="text-[#2DD4A0] text-sm font-mono">modo pós-oficina ativo</span>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setMostrarCodigo(!mostrarCodigo)}
                  className="text-[10px] font-mono tracking-widest uppercase text-[#555] hover:text-[#888] transition-colors"
                >
                  {mostrarCodigo ? "▲" : "▼"} tenho um código de oficina
                </button>

                {mostrarCodigo && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={codigo}
                      onChange={(e) => { setCodigo(e.target.value.toUpperCase()); setCodigoStatus("idle") }}
                      placeholder="EX: CRIA26"
                      maxLength={16}
                      className={`flex-1 bg-[#1C1C1E] border rounded-xl px-4 py-3 text-[#F5F0E8] placeholder-[#444] focus:outline-none transition-colors text-base font-mono tracking-wider ${
                        codigoStatus === "ok" ? "border-[#2DD4A0]"
                        : codigoStatus === "err" ? "border-[#E84040]"
                        : "border-[#2C2C2E] focus:border-[#E8431E]"
                      }`}
                    />
                    <button
                      onClick={() => validarCodigo(codigo)}
                      className="px-4 py-3 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl text-[#888] font-mono text-sm hover:border-[#E8431E] transition-colors"
                    >
                      ok
                    </button>
                  </div>
                )}

                {codigoStatus === "ok" && (
                  <p className="mt-2 text-[#2DD4A0] text-xs font-mono">✓ módulo pós-oficina desbloqueado!</p>
                )}
                {codigoStatus === "err" && (
                  <p className="mt-2 text-[#E84040] text-xs font-mono">código inválido — confere com a facilitadora</p>
                )}
              </>
            )}
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
        <p className="text-center text-[#444] text-xs mt-2 font-mono">
          ou <a href="/jogo.html" className="underline text-[#E8431E]">jogar em HTML standalone</a>
          {" · "}
          <a href="/sobre.html" className="underline">sobre o projeto</a>
        </p>
      </div>
    </main>
  )
}
