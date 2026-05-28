"use client"

import { useEffect, useRef, useState } from "react"
import { dilemas as hardcoded } from "@/lib/dilemas"
import { dilemas as gerados } from "@/lib/dilemas_gerados"
import type { Dilema } from "@/lib/dilemas"

const allDilemas: Dilema[] = [...hardcoded, ...gerados]

type VideoMap = Record<string, string>
type SaveState = "idle" | "saving" | "ok" | "err"

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState("")
  const [loginErr, setLoginErr] = useState(false)
  const [videos, setVideos] = useState<VideoMap>({})
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({})
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // Verifica se já tem sessão
  useEffect(() => {
    fetch("/api/videos")
      .then((r) => r.json())
      .then((data) => {
        setVideos(data)
        // Testa se tem cookie de admin
        return fetch("/api/admin/videos", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dilema_id: "__check__", url: "" }) })
      })
      .then((r) => {
        if (r.status !== 401) setAuthed(true)
      })
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
      const data = await fetch("/api/videos").then((r) => r.json())
      setVideos(data)
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
    if (res.ok) setVideos((v) => ({ ...v, [dilemaId]: url }))
    setTimeout(() => setSaveStates((s) => ({ ...s, [dilemaId]: "idle" })), 2000)
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

  // ── CMS ──────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#0F0F10] px-4 py-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[11px] font-mono tracking-widest uppercase text-[#E8431E] mb-1">
            Admin · Vozes do Oziel
          </p>
          <h1 className="text-2xl font-black text-[#F5F0E8]">Gerenciar Vídeos</h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-[#555] font-mono hover:text-[#888] transition-colors"
        >
          sair →
        </button>
      </div>

      <p className="text-[#888] text-sm mb-8 leading-relaxed">
        Cole a URL do TikTok ou YouTube Shorts em cada dilema. O vídeo aparece no jogo logo depois da pílula de sabedoria.
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
            </div>
          )
        })}
      </div>

      <p className="text-[#333] text-xs font-mono text-center mt-12">
        Vozes do Oziel · equipe CriaLab
      </p>
    </main>
  )
}
