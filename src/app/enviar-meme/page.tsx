"use client"

import { useState } from "react"
import Link from "next/link"
import { upload } from "@vercel/blob/client"
import Logo from "@/components/Logo"

const bairros = [
  "Parque Oziel",
  "Jardim Monte Cristo",
  "Gleba B",
  "Jardim Campo Belo",
  "Jardim São Marcos",
  "Jardim Florence",
  "Jardim Capivari",
  "Campo Grande",
  "DIC",
  "Jardim do Lago",
  "San Martin",
  "Outro bairro",
]

export default function EnviarMemePage() {
  const [apelido, setApelido] = useState("")
  const [bairro, setBairro] = useState("")
  const [descricao, setDescricao] = useState("")
  const [imagemUrl, setImagemUrl] = useState("")
  const [upState, setUpState] = useState<"idle" | "uploading" | "err">("idle")
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function handleImagem(file: File) {
    setUpState("uploading")
    try {
      const blob = await upload(`meme-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/memes/upload",
      })
      setImagemUrl(blob.url)
      setUpState("idle")
    } catch {
      setUpState("err")
    }
  }

  async function enviar() {
    if (!descricao.trim() && !imagemUrl) return
    setEnviando(true)
    try {
      await fetch("/api/memes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autor_apelido: apelido.trim(), bairro, descricao: descricao.trim(), imagem_url: imagemUrl }),
      })
      setEnviado(true)
    } catch {
      setEnviado(true)
    }
    setEnviando(false)
  }

  return (
    <main className="bg-halftone bg-halftone-veil min-h-full">
      <div className="relative z-10 min-h-full px-6 py-10 max-w-md mx-auto flex flex-col">
        <div className="flex items-center gap-3 mb-2">
          <Logo size={40} variant="cor" />
          <h1 className="brand-lockup text-creme text-3xl leading-none">
            Manda teu<br /><span className="text-laranja">meme</span>
          </h1>
        </div>

        {enviado ? (
          <div className="flex-1 flex flex-col justify-center">
            <div className="bg-verde/10 border-2 border-verde/40 rounded-2xl p-6 text-center">
              <p className="brand-lockup text-verde text-3xl mb-2">recebido! 🔥</p>
              <p className="text-creme-soft text-sm leading-relaxed">
                Teu meme entrou na fila — a equipe vai avaliar. Se rolar, vira conteúdo do jogo
                com teu crédito. Valeu por construir junto.
              </p>
            </div>
            <Link href="/" className="mt-6 text-center brand-stamp text-[11px] text-laranja underline">
              ← voltar pro início
            </Link>
          </div>
        ) : (
          <>
            <p className="text-creme-soft text-sm leading-relaxed mb-7 max-w-[40ch]">
              Viu um meme político rolando no grupo? Manda pra cá. A equipe avalia e ele pode
              virar um card do jogo — <strong>com teu crédito</strong>. Co-autoria da quebrada.
            </p>

            <div className="space-y-4 flex-1">
              <div>
                <label className="brand-label block text-[10px] text-creme-soft mb-2">o meme (descreve ou cola o texto)</label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  placeholder="ex: 'político é tudo igual' — vi no grupo da família…"
                  className="w-full bg-grafite-2 border-2 border-grafite-3 rounded-xl px-4 py-3 text-creme placeholder-creme-soft/40 focus:outline-none focus:border-laranja transition-colors text-base resize-none"
                />
              </div>

              <div>
                <label className="brand-label block text-[10px] text-creme-soft mb-2">print / imagem do meme (opcional)</label>
                {imagemUrl ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagemUrl} alt="meme enviado" className="w-full rounded-xl border-2 border-grafite-3" />
                    <button
                      onClick={() => setImagemUrl("")}
                      className="absolute top-2 right-2 bg-grafite/80 text-creme rounded-full w-8 h-8 text-sm"
                    >✕</button>
                  </div>
                ) : (
                  <label className={`flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed text-sm font-mono cursor-pointer transition-colors active:scale-95 ${
                    upState === "err" ? "border-vermelho/50 text-vermelho" : "border-grafite-3 text-creme-soft hover:text-creme hover:border-creme-soft/40"
                  } ${upState === "uploading" ? "opacity-60 pointer-events-none" : ""}`}>
                    {upState === "uploading" ? "enviando…" : upState === "err" ? "! falhou — tente de novo" : "📤 subir print (imagem)"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImagem(f); e.target.value = "" }}
                    />
                  </label>
                )}
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="brand-label block text-[10px] text-creme-soft mb-2">teu apelido (crédito)</label>
                  <input
                    type="text"
                    value={apelido}
                    onChange={(e) => setApelido(e.target.value)}
                    maxLength={24}
                    placeholder="opcional"
                    className="w-full bg-grafite-2 border-2 border-grafite-3 rounded-xl px-3 py-3 text-creme placeholder-creme-soft/40 focus:outline-none focus:border-laranja transition-colors text-base"
                  />
                </div>
                <div className="flex-1">
                  <label className="brand-label block text-[10px] text-creme-soft mb-2">bairro</label>
                  <select
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    className="w-full bg-grafite-2 border-2 border-grafite-3 rounded-xl px-3 py-3 text-creme focus:outline-none focus:border-laranja transition-colors text-base appearance-none"
                  >
                    <option value="" disabled>selecione teu bairro</option>
                    {bairros.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={enviar}
                disabled={enviando || (!descricao.trim() && !imagemUrl) || upState === "uploading"}
                className="zine-edge w-full py-4 bg-laranja text-grafite brand-lockup text-2xl rounded-xl disabled:opacity-30 disabled:shadow-none active:scale-95 active:shadow-none transition-all"
              >
                {enviando ? "enviando…" : "enviar meme →"}
              </button>
              <p className="text-center text-creme-soft/50 text-xs mt-3 font-mono">
                passa por avaliação antes de aparecer · <Link href="/" className="underline">voltar</Link>
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
