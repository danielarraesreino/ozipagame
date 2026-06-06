"use client"

import { useEffect, useRef, useState } from "react"
import { upload } from "@vercel/blob/client"
import { dilemas as hardcoded } from "@/lib/dilemas"
import { dilemas as gerados } from "@/lib/dilemas_gerados"
import type { Dilema } from "@/lib/dilemas"

const allDilemas: Dilema[] = [...hardcoded, ...gerados]

type VideoMap = Record<string, string>
type SaveState = "idle" | "saving" | "ok" | "err"
type UploadState = "idle" | "uploading" | "ok" | "err"
type Aba = "videos" | "cards" | "codigos"

interface RoomCode { label: string; ativo: boolean }
type CodesMap = Record<string, RoomCode>

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState("")
  const [loginErr, setLoginErr] = useState(false)
  const [videos, setVideos] = useState<VideoMap>({})
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({})
  const [uploadStates, setUploadStates] = useState<Record<string, UploadState>>({})
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [aba, setAba] = useState<Aba>("videos")
  const [codes, setCodes] = useState<CodesMap>({})
  const [novoCodigo, setNovoCodigo] = useState("")
  const [novoLabel, setNovoLabel] = useState("")
  const [codeState, setCodeState] = useState<SaveState>("idle")
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const [importados, setImportados] = useState<Dilema[]>([])
  const [ativos, setAtivos] = useState<Record<string, boolean>>({})
  const [cardBusy, setCardBusy] = useState<string | null>(null)

  // Verifica se já tem sessão e carrega URLs salvas
  useEffect(() => {
    fetch("/video_urls.json")
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => setVideos(data))
      .catch(() => {})

    fetch("/room_codes.json")
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => setCodes(data))
      .catch(() => {})

    fetch("/dilemas_importados.json")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Dilema[]) => setImportados(Array.isArray(data) ? data : []))
      .catch(() => {})

    fetch("/cards_ativos.json")
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => setAtivos(data))
      .catch(() => {})

    // Testa cookie de admin
    fetch("/api/admin/videos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dilema_id: "__check__", url: "" }),
    })
      .then((r) => { if (r.status !== 401) setAuthed(true) })
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginErr(false)
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      setAuthed(true)
    } else {
      setLoginErr(true)
      setPassword("")
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" })
    setAuthed(false)
  }

  async function handleSave(dilemaId: string) {
    const url = inputRefs.current[dilemaId]?.value ?? ""
    setSaveStates((s) => ({ ...s, [dilemaId]: "saving" }))
    const res = await fetch("/api/admin/videos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dilema_id: dilemaId, url }),
    })
    const state: SaveState = res.ok ? "ok" : "err"
    setSaveStates((s) => ({ ...s, [dilemaId]: state }))
    if (res.ok) {
      setVideos((v) => ({ ...v, [dilemaId]: url }))
      setLastSaved(dilemaId)
    }
    setTimeout(() => setSaveStates((s) => ({ ...s, [dilemaId]: "idle" })), 2000)
  }

  // Sobe o mp4 direto pro Blob e salva a URL pública no video_urls.json.
  async function handleUploadVideo(dilemaId: string, file: File) {
    setUploadStates((u) => ({ ...u, [dilemaId]: "uploading" }))
    try {
      const blob = await upload(`${dilemaId}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
      })
      const res = await fetch("/api/admin/videos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dilema_id: dilemaId, url: blob.url }),
      })
      if (!res.ok) throw new Error("falha ao salvar a URL")
      setVideos((v) => ({ ...v, [dilemaId]: blob.url }))
      if (inputRefs.current[dilemaId]) inputRefs.current[dilemaId]!.value = blob.url
      setLastSaved(dilemaId)
      setUploadStates((u) => ({ ...u, [dilemaId]: "ok" }))
    } catch {
      setUploadStates((u) => ({ ...u, [dilemaId]: "err" }))
    }
    setTimeout(() => setUploadStates((u) => ({ ...u, [dilemaId]: "idle" })), 2500)
  }

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0F0F10]">
        <span className="text-[#555] font-mono text-sm">carregando…</span>
      </main>
    )
  }

  // ── Login ────────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#0F0F10] px-6">
        <div className="w-full max-w-sm">
          <p className="text-[11px] font-mono tracking-widest uppercase text-[#E8431E] mb-6">
            Admin · Vozes do Oziel
          </p>
          <h1 className="text-3xl font-black text-[#F5F0E8] mb-8">Área restrita</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="senha da equipe"
              autoFocus
              className="w-full bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl px-4 py-3 text-[#F5F0E8] placeholder-[#444] focus:outline-none focus:border-[#E8431E] transition-colors text-base"
            />
            {loginErr && (
              <p className="text-[#E84040] text-sm font-mono">senha incorreta</p>
            )}
            <button
              type="submit"
              disabled={!password}
              className="w-full py-4 bg-[#E8431E] text-white font-bold text-base rounded-xl disabled:opacity-30 active:scale-95 transition-transform"
            >
              entrar
            </button>
          </form>
        </div>
      </main>
    )
  }

  async function handleAddCode() {
    if (!novoCodigo.trim()) return
    setCodeState("saving")
    const res = await fetch("/api/admin/codes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo: novoCodigo.trim(), label: novoLabel.trim() || novoCodigo.trim(), ativo: true }),
    })
    if (res.ok) {
      setCodes((c) => ({ ...c, [novoCodigo.toUpperCase()]: { label: novoLabel || novoCodigo, ativo: true } }))
      setNovoCodigo("")
      setNovoLabel("")
      setCodeState("ok")
      setLastSaved("code")
    } else {
      setCodeState("err")
    }
    setTimeout(() => setCodeState("idle"), 2000)
  }

  // Card importado entra ativo por padrão; só fica inativo se explicitamente false.
  function cardAtivo(id: string) {
    return ativos[id] !== false
  }

  async function handleToggleCard(id: string) {
    const novo = !cardAtivo(id)
    setCardBusy(id)
    const res = await fetch("/api/admin/cards", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dilema_id: id, ativo: novo }),
    })
    if (res.ok) {
      setAtivos((a) => ({ ...a, [id]: novo }))
      setLastSaved(id)
    }
    setCardBusy(null)
  }

  async function handleRemoveCode(codigo: string) {
    await fetch("/api/admin/codes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo, ativo: false }),
    })
    setCodes((c) => { const n = { ...c }; delete n[codigo]; return n })
    setLastSaved("code")
  }

  // ── CMS ──────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#0F0F10] px-4 py-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[11px] font-mono tracking-widest uppercase text-[#E8431E] mb-1">
            Admin · Vozes do Oziel
          </p>
          <h1 className="text-2xl font-black text-[#F5F0E8]">Painel da equipe</h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-[#555] font-mono hover:text-[#888] transition-colors"
        >
          sair →
        </button>
      </div>

      {/* Abas */}
      <div className="flex gap-2 mb-6">
        {(["videos", "cards", "codigos"] as Aba[]).map((a) => (
          <button
            key={a}
            onClick={() => setAba(a)}
            className={`px-4 py-2 rounded-xl text-sm font-mono transition-colors ${
              aba === a
                ? "bg-[#E8431E] text-white"
                : "bg-[#1C1C1E] border border-[#2C2C2E] text-[#888] hover:text-[#F5F0E8]"
            }`}
          >
            {a === "videos" ? "🎬 Vídeos" : a === "cards" ? "📥 Cards" : "🔑 Códigos"}
          </button>
        ))}
      </div>

      {lastSaved && (
        <div className="mb-6 bg-[#2DD4A0]/10 border border-[#2DD4A0]/30 rounded-xl px-4 py-3 text-[#2DD4A0] text-sm font-mono">
          ✓ Salvo — publicando no jogo em ~30s
        </div>
      )}

      {/* ── Aba Vídeos ──────────────────────────────────────────────────── */}
      {aba === "videos" && (
        <>
          <p className="text-[#888] text-sm mb-6 leading-relaxed">
            Cole a URL do TikTok / YouTube Shorts <strong>ou</strong> suba um vídeo
            pronto (.mp4) do celular. Aparece no jogo após a pílula de sabedoria.
          </p>
          <div className="space-y-4">
            {allDilemas.map((d) => {
          const state = saveStates[d.id] ?? "idle"
          const hasVideo = !!videos[d.id]
          return (
            <div
              key={d.id}
              className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-4"
            >
              {/* Cabeçalho do card */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono text-[#555] uppercase tracking-widest">
                  {d.id}
                </span>
                <span className="text-[10px] font-mono text-[#E8431E] uppercase tracking-widest">
                  {d.modulo}
                </span>
                {hasVideo && (
                  <span className="text-[10px] font-mono text-[#2DD4A0]">✓ com vídeo</span>
                )}
              </div>

              {/* Texto do meme */}
              <p className="text-[#888] text-sm italic mb-4 line-clamp-2">
                {d.meme}
              </p>

              {/* Input URL + botão */}
              <div className="flex gap-2">
                <input
                  ref={(el) => { inputRefs.current[d.id] = el }}
                  type="url"
                  defaultValue={videos[d.id] ?? ""}
                  placeholder="https://www.tiktok.com/@usuario/video/..."
                  className="flex-1 bg-[#0F0F10] border border-[#2C2C2E] rounded-xl px-3 py-2 text-[#F5F0E8] placeholder-[#333] focus:outline-none focus:border-[#E8431E] transition-colors text-sm font-mono"
                />
                <button
                  onClick={() => handleSave(d.id)}
                  disabled={state === "saving"}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                    state === "ok"
                      ? "bg-[#2DD4A0] text-black"
                      : state === "err"
                      ? "bg-[#E84040] text-white"
                      : "bg-[#E8431E] text-white disabled:opacity-50"
                  }`}
                >
                  {state === "saving" ? "…" : state === "ok" ? "✓" : state === "err" ? "!" : "salvar"}
                </button>
              </div>

              {/* Upload de mp4 pronto (alternativa a colar link) */}
              {(() => {
                const up = uploadStates[d.id] ?? "idle"
                return (
                  <label
                    className={`mt-2 flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed text-xs font-mono cursor-pointer transition-colors active:scale-95 ${
                      up === "ok"
                        ? "border-[#2DD4A0]/50 text-[#2DD4A0]"
                        : up === "err"
                        ? "border-[#E84040]/50 text-[#E84040]"
                        : "border-[#2C2C2E] text-[#888] hover:text-[#F5F0E8] hover:border-[#444]"
                    } ${up === "uploading" ? "opacity-60 pointer-events-none" : ""}`}
                  >
                    {up === "uploading"
                      ? "enviando vídeo…"
                      : up === "ok"
                      ? "✓ vídeo enviado"
                      : up === "err"
                      ? "! falhou — tente de novo"
                      : "📤 subir vídeo (.mp4)"}
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) handleUploadVideo(d.id, f)
                        e.target.value = ""
                      }}
                    />
                  </label>
                )
              })()}
            </div>
          )
        })}
          </div>
        </>
      )}

      {/* ── Aba Cards importados ────────────────────────────────────────── */}
      {aba === "cards" && (
        <>
          <p className="text-[#888] text-sm mb-2 leading-relaxed">
            Cards vindos do pipeline OzielMemes. Já entram <strong>ativos</strong> no jogo —
            desligue aqui qualquer um que ainda não deva aparecer.
          </p>
          <p className="text-[#555] text-xs font-mono mb-6">
            {importados.length} importado(s) · {importados.filter((d) => cardAtivo(d.id)).length} ativo(s)
          </p>

          {importados.length === 0 ? (
            <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-6 text-center">
              <p className="text-[#888] text-sm mb-2">Nenhum card importado ainda.</p>
              <p className="text-[#555] text-xs font-mono leading-relaxed">
                No painel OzielMemes (Streamlit), use a página 🎬 Vídeos →
                &ldquo;Exportar vídeos + cards pro jogo&rdquo;. Os cards aparecem aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {importados.map((d) => {
                const on = cardAtivo(d.id)
                const busy = cardBusy === d.id
                return (
                  <div key={d.id} className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-mono text-[#555] uppercase tracking-widest">{d.id}</span>
                      <span className="text-[10px] font-mono text-[#E8431E] uppercase tracking-widest">{d.modulo}</span>
                      {d.meme_video && <span className="text-[10px] font-mono text-[#2DD4A0]">🎬 vídeo</span>}
                      {!d.meme_video && d.meme_imagem && <span className="text-[10px] font-mono text-[#2DD4A0]">🖼️ imagem</span>}
                    </div>
                    <p className="text-[#F5F0E8] text-sm font-semibold mb-1 line-clamp-2">{d.meme}</p>
                    {d.pilula_sabedoria && (
                      <p className="text-[#888] text-xs italic mb-4 line-clamp-2">💡 {d.pilula_sabedoria}</p>
                    )}
                    <button
                      onClick={() => handleToggleCard(d.id)}
                      disabled={busy}
                      className={`w-full py-2 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                        on
                          ? "bg-[#2DD4A0]/15 border border-[#2DD4A0]/40 text-[#2DD4A0]"
                          : "bg-[#1C1C1E] border border-[#2C2C2E] text-[#666]"
                      } disabled:opacity-50`}
                    >
                      {busy ? "…" : on ? "✓ no jogo — toque pra tirar" : "fora do jogo — toque pra ativar"}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ── Aba Códigos ─────────────────────────────────────────────────── */}
      {aba === "codigos" && (
        <>
          <p className="text-[#888] text-sm mb-6 leading-relaxed">
            Crie um código curto para revelar na lousa no final do encontro presencial.
            Quando o jovem digita na tela inicial, desbloqueia o módulo pós-oficina.
          </p>

          {/* Criar novo código */}
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-4 mb-6">
            <p className="text-[10px] font-mono tracking-widest uppercase text-[#555] mb-4">novo código</p>
            <div className="space-y-2">
              <input
                type="text"
                value={novoCodigo}
                onChange={(e) => setNovoCodigo(e.target.value.toUpperCase())}
                placeholder="EX: CRIA26"
                maxLength={12}
                className="w-full bg-[#0F0F10] border border-[#2C2C2E] rounded-xl px-3 py-2 text-[#F5F0E8] placeholder-[#333] focus:outline-none focus:border-[#E8431E] transition-colors text-sm font-mono tracking-wider"
              />
              <input
                type="text"
                value={novoLabel}
                onChange={(e) => setNovoLabel(e.target.value)}
                placeholder="descrição (ex: Encontro Mai/2026)"
                className="w-full bg-[#0F0F10] border border-[#2C2C2E] rounded-xl px-3 py-2 text-[#F5F0E8] placeholder-[#333] focus:outline-none focus:border-[#E8431E] transition-colors text-sm"
              />
              <button
                onClick={handleAddCode}
                disabled={!novoCodigo.trim() || codeState === "saving"}
                className={`w-full py-2 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                  codeState === "ok" ? "bg-[#2DD4A0] text-black"
                  : codeState === "err" ? "bg-[#E84040] text-white"
                  : "bg-[#E8431E] text-white disabled:opacity-30"
                }`}
              >
                {codeState === "saving" ? "criando…" : codeState === "ok" ? "✓ criado" : "criar código"}
              </button>
            </div>
          </div>

          {/* Lista de códigos ativos */}
          <div className="space-y-3">
            {Object.keys(codes).length === 0 ? (
              <p className="text-[#555] text-sm font-mono text-center py-8">nenhum código ativo</p>
            ) : (
              Object.entries(codes).map(([code, info]) => (
                <div key={code} className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[#F5F0E8] font-mono font-bold tracking-widest">{code}</p>
                    <p className="text-[#555] text-xs mt-1">{info.label}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveCode(code)}
                    className="text-[#555] hover:text-[#E84040] font-mono text-xs transition-colors"
                  >
                    remover
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      <p className="text-[#333] text-xs font-mono text-center mt-12">
        Vozes do Oziel · equipe CriaLab
      </p>
    </main>
  )
}
