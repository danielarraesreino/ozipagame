"use client"

import { useState } from "react"
import { savePlayer, unlockModulo, isPosOficinaUnlocked } from "@/lib/store"
import { BAIRROS } from "@/lib/bairros"
import Logo from "@/components/Logo"
import MenuHamburger from "@/components/MenuHamburger"

// Porta de entrada do jogo: apelido + bairro (+ código de oficina opcional).
// Vive DENTRO do /game (mostrada quando ainda não há player). A home (/) é só
// hub de ações. Ao confirmar: salva o player e chama onReady.
interface Props { onReady: (p: { apelido: string; bairro: string }) => void }

export default function EntradaJogo({ onReady }: Props) {
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
    const p = { apelido: apelido.trim(), bairro }
    savePlayer(p)
    onReady(p)
  }

  return (
    <main className="bg-halftone bg-halftone-veil min-h-full">
      <div className="relative z-10 min-h-full flex flex-col justify-between px-6 py-10 max-w-md mx-auto">
        <div>
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-3">
              <Logo size={44} variant="cor" />
              <h1 className="brand-lockup text-creme text-3xl leading-none">
                Bora<br /><span className="text-laranja">jogar</span>
              </h1>
            </div>
            <MenuHamburger />
          </div>

          <p className="text-creme-soft text-base leading-relaxed mb-7 max-w-[32ch]">
            Só teu apelido e teu bairro — sem cadastro, sem login. Arrasta os memes e descobre o que tá por trás.
          </p>

          <div className="space-y-4">
            <div>
              <label className="brand-label block text-[10px] text-creme-soft mb-2">
                Como te chamam?
              </label>
              <input
                type="text"
                value={apelido}
                onChange={(e) => setApelido(e.target.value)}
                placeholder="seu apelido"
                maxLength={24}
                className="w-full bg-grafite-2 border-2 border-grafite-3 rounded-xl px-4 py-3 text-creme placeholder-creme-soft/40 focus:outline-none focus:border-laranja transition-colors text-base"
              />
            </div>

            <div>
              <label className="brand-label block text-[10px] text-creme-soft mb-2">
                De onde você é?
              </label>
              <select
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                className="w-full bg-grafite-2 border-2 border-grafite-3 rounded-xl px-4 py-3 text-creme focus:outline-none focus:border-laranja transition-colors text-base appearance-none"
              >
                <option value="" disabled>escolha seu bairro</option>
                {BAIRROS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Código de encontro */}
            <div>
              {jaDesbloqueado ? (
                <div className="flex items-center gap-2 px-4 py-3 bg-verde/10 border-2 border-verde/40 rounded-xl">
                  <span className="text-verde text-sm">✓</span>
                  <span className="text-verde text-sm font-mono">modo pós-oficina ativo</span>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setMostrarCodigo(!mostrarCodigo)}
                    className="brand-label text-[10px] text-creme-soft hover:text-creme transition-colors"
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
                        className={`flex-1 bg-grafite-2 border-2 rounded-xl px-4 py-3 text-creme placeholder-creme-soft/40 focus:outline-none transition-colors text-base font-mono tracking-wider ${
                          codigoStatus === "ok" ? "border-verde"
                          : codigoStatus === "err" ? "border-vermelho"
                          : "border-grafite-3 focus:border-laranja"
                        }`}
                      />
                      <button
                        onClick={() => validarCodigo(codigo)}
                        className="px-4 py-3 bg-grafite-2 border-2 border-grafite-3 rounded-xl text-creme-soft font-mono text-sm hover:border-laranja transition-colors"
                      >
                        ok
                      </button>
                    </div>
                  )}

                  {codigoStatus === "ok" && (
                    <p className="mt-2 text-verde text-xs font-mono">✓ módulo pós-oficina desbloqueado!</p>
                  )}
                  {codigoStatus === "err" && (
                    <p className="mt-2 text-vermelho text-xs font-mono">código inválido — confere com a facilitadora</p>
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
            className="zine-edge w-full py-4 bg-laranja text-grafite brand-lockup text-2xl rounded-xl disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none active:scale-95 active:shadow-none transition-all"
          >
            Começar →
          </button>
          <p className="text-center text-creme-soft/60 text-xs mt-4 font-mono">
            sem cadastro · sem login · 100% anônimo
          </p>
        </div>
      </div>
    </main>
  )
}
