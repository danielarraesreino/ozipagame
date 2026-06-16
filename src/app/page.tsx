"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { savePlayer, unlockModulo, isPosOficinaUnlocked } from "@/lib/store"
import { getEmbedUrl, getYouTubeId } from "@/lib/video"
import Logo from "@/components/Logo"

export default function Home() {
  const router = useRouter()
  const [apelido, setApelido] = useState("")
  const [codigo, setCodigo] = useState("")
  const [codigoStatus, setCodigoStatus] = useState<"idle" | "ok" | "err">("idle")
  const [mostrarCodigo, setMostrarCodigo] = useState(false)
  const [spotniksUrl, setSpotniksUrl] = useState("")
  const [showVideo, setShowVideo] = useState(false)
  const jaDesbloqueado = isPosOficinaUnlocked()

  useEffect(() => {
    fetch("/site_config.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((cfg: { spotniks_url?: string }) => setSpotniksUrl(cfg.spotniks_url || ""))
      .catch(() => {})
  }, [])

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
    if (!apelido.trim()) return
    savePlayer({ apelido: apelido.trim(), bairro: "Oziel" })
    router.push("/game")
  }

  return (
    <main className="bg-halftone bg-halftone-veil min-h-full">
      <div className="relative z-10 min-h-full flex flex-col justify-between px-6 py-10 max-w-md mx-auto">
        <div>
          {/* Lockup da marca */}
          <div className="flex items-center gap-3 mb-8">
            <Logo size={52} variant="cor" />
            <div>
              <p className="brand-stamp text-[9px] text-creme-soft leading-none mb-1">
                Grupo Diálogos · CriaLab
              </p>
              <p className="brand-stamp text-[9px] text-creme-soft leading-none">
                Campinas
              </p>
            </div>
          </div>

          <h1 className="brand-lockup text-creme text-[clamp(3.25rem,17vw,5rem)] mb-3">
            Vozes
            <br />
            <span className="text-laranja">do Oziel</span>
          </h1>
          <p className="brand-label text-laranja text-[11px] mb-7">
            Cidadania Conectada
          </p>

          <p className="text-creme text-base leading-relaxed mb-5 max-w-[34ch]">
            Memes, dilemas e as consequências que eles escondem. 3 minutos. Sem certo ou errado.
          </p>

          {spotniksUrl && (() => {
            const ytId = getYouTubeId(spotniksUrl)
            return (
              <button
                type="button"
                onClick={() => setShowVideo(true)}
                className="group relative w-full mb-9 rounded-xl overflow-hidden border-2 border-laranja zine-edge active:scale-[0.98] transition-transform"
              >
                {ytId ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                    alt="vídeo que inspirou o jogo"
                    className="w-full aspect-video object-cover opacity-75 group-hover:opacity-90 transition-opacity"
                  />
                ) : (
                  <div className="w-full aspect-video bg-grafite-2" />
                )}
                {/* overlay escuro + play pulsante */}
                <div className="absolute inset-0 flex items-center justify-center bg-grafite/35">
                  <span className="pulse-glow w-16 h-16 rounded-full bg-laranja flex items-center justify-center">
                    <span className="text-grafite text-2xl ml-1 leading-none">▶</span>
                  </span>
                </div>
                {/* faixa de legenda */}
                <div className="absolute bottom-0 inset-x-0 bg-grafite/85 backdrop-blur-sm px-3 py-2 flex items-center gap-2">
                  <span className="brand-label text-[10px] text-laranja">assista o que inspirou o jogo</span>
                  <span className="brand-stamp text-[9px] text-creme-soft/60 ml-auto">▶ 2 min</span>
                </div>
              </button>
            )
          })()}

          <div className="space-y-4">
            <div>
              <label className="brand-label block text-xs text-creme mb-2">
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
            disabled={!apelido.trim()}
            className="zine-edge w-full py-4 bg-laranja text-grafite brand-lockup text-2xl rounded-xl disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none active:scale-95 active:shadow-none transition-all"
          >
            Entrar no jogo →
          </button>
          <p className="text-center text-creme/70 text-sm mt-4 font-mono">
            sem cadastro · sem login · 100% anônimo
          </p>
          <p className="text-center text-creme/70 text-sm mt-2 font-mono leading-relaxed">
            <a href="/pesquisa" className="underline text-laranja">responder pesquisa</a>
            {" · "}
            <a href="/dados" className="underline text-laranja">dados abertos</a>
            <br />
            <a href="/enviar-meme" className="underline">manda teu meme</a>
            {" · "}
            <a href="/sobre.html" className="underline">sobre</a>
          </p>
        </div>
      </div>

      {/* Modal do vídeo do Spotniks (a inspiração) */}
      {showVideo && spotniksUrl && (
        <div
          className="fixed inset-0 z-50 bg-grafite/95 backdrop-blur flex flex-col items-center justify-center p-4"
          onClick={() => setShowVideo(false)}
        >
          <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="brand-label text-[10px] text-laranja">o que inspirou o jogo</p>
              <button
                onClick={() => setShowVideo(false)}
                className="text-creme-soft hover:text-creme text-xl leading-none px-2"
                aria-label="fechar"
              >
                ✕
              </button>
            </div>
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden zine-edge">
              <iframe
                src={getEmbedUrl(spotniksUrl)}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                style={{ border: "none" }}
                title="Vídeo do Spotniks"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
