"use client"

import { useState, useEffect } from "react"
import { savePlayer, unlockModulo, isPosOficinaUnlocked } from "@/lib/store"
import { getEmbedUrl, getYouTubeId } from "@/lib/video"
import Logo from "@/components/Logo"
import PrankJogo from "@/components/PrankJogo"
import AudioBg from "@/components/AudioBg"
import TutorialModal from "@/components/TutorialModal"
import PesquisaForm from "@/components/PesquisaForm"

type Tab = "inicio" | "pesquisa" | "jogo" | "equipe"
const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: "inicio",   icon: "🏠", label: "Início"   },
  { id: "pesquisa", icon: "📋", label: "Pesquisa"  },
  { id: "jogo",     icon: "🎮", label: "Jogo"      },
  { id: "equipe",   icon: "👥", label: "Equipe"    },
]
const TAB_ORDER: Tab[] = ["inicio", "pesquisa", "jogo", "equipe"]

export default function Home() {
  const [tab, setTab] = useState<Tab>("inicio")
  const [prev, setPrev] = useState<Tab | null>(null)
  const [dir, setDir] = useState<"left" | "right">("left")
  const [animating, setAnimating] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const [pesquisaDone, setPesquisaDone] = useState(false)

  const [apelido, setApelido] = useState("")
  const [codigo, setCodigo] = useState("")
  const [codigoStatus, setCodigoStatus] = useState<"idle" | "ok" | "err">("idle")
  const [mostrarCodigo, setMostrarCodigo] = useState(false)
  const [spotniksUrl, setSpotniksUrl] = useState("")
  const [senhaTesteiro, setSenhaTesteiro] = useState("")
  const [testeiroOk, setTesteiroOk] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const jaDesbloqueado = isPosOficinaUnlocked()

  useEffect(() => {
    fetch("/site_config.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((cfg: { spotniks_url?: string }) => setSpotniksUrl(cfg.spotniks_url || ""))
      .catch(() => {})
  }, [])

  function goTab(next: Tab) {
    setMenuOpen(false)
    if (next === tab || animating) return
    const from = TAB_ORDER.indexOf(tab)
    const to   = TAB_ORDER.indexOf(next)
    setDir(to > from ? "left" : "right")
    setAnimating(true)
    setPrev(tab)
    setTimeout(() => {
      setTab(next)
      setPrev(null)
      setAnimating(false)
    }, 220)
  }

  function verificarSenhaTesteiro(s: string) {
    if (s.trim().toLowerCase() === "fogonosracistas") setTesteiroOk(true)
  }

  async function validarCodigo(c: string) {
    const val = c.trim().toUpperCase()
    if (!val) return
    try {
      const data = await fetch("/room_codes.json").then((r) => r.json())
      const entry = data[val]
      if (entry?.ativo) { unlockModulo(val); setCodigoStatus("ok") }
      else setCodigoStatus("err")
    } catch { setCodigoStatus("err") }
  }

  const slideOut = animating ? (dir === "left" ? "-translate-x-8 opacity-0" : "translate-x-8 opacity-0") : ""
  const ytId = spotniksUrl ? getYouTubeId(spotniksUrl) : null

  return (
    <main className="bg-halftone bg-halftone-veil min-h-full flex flex-col">

      {/* ── Cabeçalho com hambúrguer ───────────────────────────────────── */}
      <header className="relative z-40 flex items-center justify-between px-5 pt-8 pb-4 max-w-md mx-auto w-full">
        <div className="flex items-center gap-3">
          <Logo size={36} variant="cor" />
          <div>
            <h1 className="brand-lockup text-creme text-2xl leading-none">
              Vozes <span className="text-laranja">do Oziel</span>
            </h1>
            <p className="brand-label text-[9px] text-creme/40 mt-0.5">Grupo Diálogos · CriaLab</p>
          </div>
        </div>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-grafite-3 hover:border-laranja transition-colors active:scale-95"
          aria-label="menu"
        >
          <span className={`block w-5 h-0.5 bg-creme transition-transform duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-creme transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-creme transition-transform duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </header>

      {/* ── Dropdown menu ─────────────────────────────────────────────── */}
      {menuOpen && (
        <div className="relative z-30 max-w-md mx-auto w-full px-5 pb-2">
          <div className="bg-grafite-2/98 border-2 border-grafite-3 rounded-2xl overflow-hidden backdrop-blur">
            {TABS.map((t, i) => (
              <button
                key={t.id}
                onClick={() => goTab(t.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors ${
                  tab === t.id ? "bg-laranja/10 text-laranja" : "text-creme hover:bg-grafite-3/30"
                } ${i < TABS.length - 1 ? "border-b border-grafite-3/60" : ""}`}
              >
                <span className="text-xl">{t.icon}</span>
                <span className="brand-lockup text-lg">{t.label}</span>
                {tab === t.id && <span className="ml-auto text-laranja text-xs font-mono">● atual</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Conteúdo ───────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 overflow-hidden">
        <div
          className={`px-5 pb-12 max-w-md mx-auto w-full transition-all duration-200 ease-out ${slideOut}`}
          key={tab}
        >

          {/* ── ABA INÍCIO ─────────────────────────────────────────────── */}
          {tab === "inicio" && (
            <div className="space-y-6 pt-2">
              <div>
                <p className="brand-label text-laranja text-[11px] mb-3">Cidadania Conectada</p>
                <p className="text-creme text-base leading-relaxed max-w-[38ch]">
                  Memes, dilemas e as consequências que eles escondem.
                  Um jogo de 3 minutos feito pela e para a juventude do Oziel.
                </p>
              </div>

              <div className="bg-grafite-2 border border-grafite-3 rounded-2xl px-4 py-4 space-y-2">
                <p className="brand-label text-[10px] text-laranja">próximo encontro</p>
                <p className="text-creme text-base font-bold">Dia 20 de Julho — sábado</p>
                <p className="text-creme text-sm">E.E Parque Oziel, Campinas</p>
                <div className="flex gap-4 mt-1 text-sm text-creme/60 font-mono">
                  <span>manhã: 9h</span>
                  <span>tarde: 14h30</span>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 bg-laranja/10 border-2 border-laranja rounded-2xl">
                <span className="text-2xl animate-bounce shrink-0">📱</span>
                <p className="brand-lockup text-laranja text-base leading-snug">
                  TRAZ SEU CELULAR<br />
                  <span className="text-creme text-sm font-normal">carregado no dia 20 — vai precisar!</span>
                </p>
                <span className="pulse-glow shrink-0 w-3 h-3 rounded-full bg-laranja" />
              </div>

              {/* ── Botão do jogo ── */}
              <div className="space-y-2">
                {testeiroOk ? (
                  <a
                    href="/game"
                    className="zine-edge w-full py-4 bg-laranja text-grafite brand-lockup text-2xl rounded-xl active:scale-95 active:shadow-none transition-all flex items-center justify-center"
                  >
                    JOGAR AGORA →
                  </a>
                ) : (
                  <PrankJogo
                    label="JOGAR AGORA →"
                    className="zine-edge w-full py-4 bg-laranja text-grafite brand-lockup text-2xl rounded-xl active:scale-95 active:shadow-none transition-all"
                  />
                )}
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={senhaTesteiro}
                    onChange={(e) => { setSenhaTesteiro(e.target.value); setTesteiroOk(false) }}
                    onKeyDown={(e) => e.key === "Enter" && verificarSenhaTesteiro(senhaTesteiro)}
                    placeholder="senha dos testadores"
                    className="flex-1 bg-grafite-2 border-2 border-grafite-3 rounded-xl px-4 py-2 text-creme placeholder-creme-soft/30 focus:outline-none focus:border-laranja transition-colors text-sm font-mono"
                  />
                  <button
                    onClick={() => verificarSenhaTesteiro(senhaTesteiro)}
                    className="px-4 py-2 bg-grafite-2 border-2 border-grafite-3 rounded-xl text-creme-soft font-mono text-sm hover:border-laranja transition-colors"
                  >
                    ok
                  </button>
                </div>
                {testeiroOk && (
                  <p className="text-verde text-xs font-mono text-center">✓ acesso de testador ativo</p>
                )}
              </div>

              <a
                href="/pesquisa"
                className="block w-full py-3 text-center border-2 border-grafite-3 text-creme/70 brand-lockup text-base rounded-xl hover:border-laranja hover:text-laranja transition-all active:scale-95"
              >
                📋 quero me inscrever no encontro →
              </a>

              <div className="flex justify-center gap-4 pt-2 text-xs font-mono text-creme/40">
                <a href="/dados" className="underline hover:text-laranja transition-colors">dados abertos</a>
                <span>·</span>
                <a href="/enviar-meme" className="underline hover:text-laranja transition-colors">manda teu meme</a>
              </div>
            </div>
          )}

          {/* ── ABA PESQUISA ───────────────────────────────────────────── */}
          {tab === "pesquisa" && (
            <div className="space-y-5 pt-2">
              <div>
                <h2 className="brand-lockup text-creme text-2xl mb-1">
                  Pesquisa<br /><span className="text-laranja">da quebrada</span>
                </h2>
                <p className="text-creme text-sm leading-relaxed max-w-[40ch]">
                  Rápida e <strong>100% anônima</strong> sobre como a juventude do Oziel
                  se relaciona com política. Não tem resposta certa — tem a tua.
                </p>
                <p className="brand-stamp text-[10px] text-creme/40 mt-2">
                  sem cadastro · dados ficam abertos · texto fica só com a equipe
                </p>
              </div>

              {!pesquisaDone ? (
                <PesquisaForm modo="completa" onDone={() => setPesquisaDone(true)} />
              ) : (
                <div className="bg-verde/10 border-2 border-verde/40 rounded-2xl p-6 text-center space-y-4">
                  <p className="brand-lockup text-verde text-3xl">valeu! 🙌</p>
                  <p className="text-creme-soft text-sm">tua voz foi registrada — anônima e aberta.</p>
                  <a href="/dados" className="block text-sm font-mono underline text-laranja/70 hover:text-laranja">ver dados abertos →</a>
                </div>
              )}
            </div>
          )}

          {/* ── ABA JOGO ───────────────────────────────────────────────── */}
          {tab === "jogo" && (
            <div className="space-y-5 pt-2">
              {spotniksUrl && (
                <div className="space-y-2">
                  <p className="brand-label text-[10px] text-laranja">o que inspirou o jogo</p>
                  <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden zine-edge border-2 border-laranja/40">
                    {ytId ? (
                      <iframe
                        src={getEmbedUrl(spotniksUrl)}
                        className="absolute inset-0 w-full h-full"
                        allow="autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                        style={{ border: "none" }}
                        title="Vídeo do Spotniks"
                      />
                    ) : (
                      <div className="w-full h-full bg-grafite-2 flex items-center justify-center">
                        <span className="text-creme-soft/40 text-sm font-mono">vídeo não configurado</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="brand-label block text-xs text-creme mb-2">Como te chamam?</label>
                  <input
                    type="text"
                    value={apelido}
                    onChange={(e) => setApelido(e.target.value)}
                    placeholder="seu apelido"
                    maxLength={24}
                    className="w-full bg-grafite-2 border-2 border-grafite-3 rounded-xl px-4 py-3 text-creme placeholder-creme-soft/40 focus:outline-none focus:border-laranja transition-colors text-base"
                  />
                </div>

                {jaDesbloqueado ? (
                  <div className="flex items-center gap-2 px-4 py-3 bg-verde/10 border-2 border-verde/40 rounded-xl">
                    <span className="text-verde text-sm">✓</span>
                    <span className="text-verde text-sm font-mono">modo pós-oficina ativo</span>
                  </div>
                ) : (
                  <div>
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
                            codigoStatus === "ok" ? "border-verde" : codigoStatus === "err" ? "border-vermelho" : "border-grafite-3 focus:border-laranja"
                          }`}
                        />
                        <button onClick={() => validarCodigo(codigo)} className="px-4 py-3 bg-grafite-2 border-2 border-grafite-3 rounded-xl text-creme-soft font-mono text-sm hover:border-laranja transition-colors">ok</button>
                      </div>
                    )}
                    {codigoStatus === "ok" && <p className="mt-2 text-verde text-xs font-mono">✓ módulo pós-oficina desbloqueado!</p>}
                    {codigoStatus === "err" && <p className="mt-2 text-vermelho text-xs font-mono">código inválido — confere com a facilitadora</p>}
                  </div>
                )}
              </div>

              {apelido.trim() ? (
                <PrankJogo
                  label="Entrar no jogo →"
                  className="zine-edge w-full py-4 bg-laranja text-grafite brand-lockup text-2xl rounded-xl active:scale-95 active:shadow-none transition-all"
                  onBeforePlay={() => savePlayer({ apelido: apelido.trim(), bairro: "Oziel" })}
                />
              ) : (
                <button disabled className="zine-edge w-full py-4 bg-laranja text-grafite brand-lockup text-2xl rounded-xl opacity-30 cursor-not-allowed shadow-none">
                  Entrar no jogo →
                </button>
              )}

              <button
                onClick={() => setShowTutorial(true)}
                className="w-full py-2.5 border-2 border-grafite-3 text-creme/60 brand-lockup text-sm rounded-xl hover:border-laranja hover:text-laranja transition-all active:scale-95"
              >
                ❓ como funciona?
              </button>

              <p className="text-center text-creme/40 text-xs font-mono">
                sem cadastro · sem login · 100% anônimo
              </p>
            </div>
          )}

          {/* ── ABA EQUIPE ─────────────────────────────────────────────── */}
          {tab === "equipe" && (
            <div className="space-y-6 pt-2">
              <div>
                <h2 className="brand-lockup text-creme text-2xl mb-1">
                  Quem fez<br /><span className="text-laranja">isso aqui</span>
                </h2>
                <p className="text-creme text-sm leading-relaxed max-w-[40ch]">
                  Um jogo feito por educadores, designers e jovens do próprio Oziel.
                  Sem ranqueamento. Sem anúncio. Só pra pensar junto.
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-grafite-2 border border-grafite-3 rounded-2xl px-5 py-5 space-y-2">
                  <p className="brand-label text-[10px] text-laranja">projeto</p>
                  <p className="text-creme font-bold text-base">Grupo Diálogos</p>
                  <p className="text-creme-soft text-sm leading-relaxed">
                    Cidadania conectada para jovens da periferia de Campinas.
                    Educação política sem paternalismos — com memes, narrativa e debate real.
                  </p>
                </div>

                <div className="bg-grafite-2 border border-grafite-3 rounded-2xl px-5 py-5 space-y-2">
                  <p className="brand-label text-[10px] text-laranja">tecnologia & design</p>
                  <p className="text-creme font-bold text-base">CriaLab</p>
                  <p className="text-creme-soft text-sm leading-relaxed">
                    Laboratório de mídia, cultura digital e criação jovem.
                    Código aberto, marca livre.
                  </p>
                </div>

                <div className="bg-grafite-2 border border-grafite-3 rounded-2xl px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="brand-label text-[10px] text-laranja">parceiros</p>
                    <p className="text-creme text-sm mt-1">Minha Campinas · Fundação FEAC</p>
                  </div>
                </div>
              </div>

              <div className="bg-grafite-2 border border-grafite-3 rounded-2xl px-5 py-4 space-y-3">
                <p className="brand-label text-[10px] text-laranja">contato</p>
                <a
                  href="mailto:coletivoaruatemvoz@gmail.com"
                  className="text-creme text-sm font-mono underline hover:text-laranja transition-colors block"
                >
                  coletivoaruatemvoz@gmail.com
                </a>
                <div className="flex flex-wrap gap-3 pt-1 text-xs font-mono">
                  <a href="/dados" className="text-laranja/70 underline hover:text-laranja transition-colors">dados abertos</a>
                  <a href="/enviar-meme" className="text-laranja/70 underline hover:text-laranja transition-colors">enviar meme</a>
                  <a href="/admin" className="text-creme/30 underline hover:text-creme/60 transition-colors">admin</a>
                </div>
              </div>

              <p className="text-center text-creme/30 text-[10px] font-mono">
                Licença CC BY-SA · código aberto · dados abertos
              </p>
            </div>
          )}

        </div>
      </div>

      <AudioBg startPaused />
      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
    </main>
  )
}
