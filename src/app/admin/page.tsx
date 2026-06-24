"use client"

import { useEffect, useRef, useState } from "react"
import { upload } from "@vercel/blob/client"
import { dilemas as hardcoded } from "@/lib/dilemas"
import { dilemas as gerados } from "@/lib/dilemas_gerados"
import type { Dilema } from "@/lib/dilemas"
import MenuHamburger from "@/components/MenuHamburger"
import CadastroForm from "@/components/CadastroForm"
import { PESQUISA_INICIAL, MOMENTOS, type CampoPergunta } from "@/lib/pesquisa"
import { AVALIACAO } from "@/lib/avaliacao"

const allDilemas: Dilema[] = [...hardcoded, ...gerados]

type VideoMap = Record<string, string>
type SaveState = "idle" | "saving" | "ok" | "err"
type UploadState = "idle" | "uploading" | "ok" | "err"
type Aba = "inscricoes" | "cadastro" | "videos" | "cards" | "trilha" | "conteudo" | "forms" | "memes" | "codigos"

interface InscricaoRow {
  id: number
  nome?: string
  idade?: string
  turma?: string
  confirmou_presenca?: boolean
  contato_tipo?: string
  contato_valor?: string
  presenca_confirmada?: boolean
  criado_em?: string
}

interface MemeRow {
  id: number
  autor_apelido?: string
  bairro?: string
  descricao?: string
  imagem_url?: string
  status: "pendente" | "aprovado" | "recusado"
  criado_em?: string
}

interface FormRow {
  id: number
  bairro?: string
  faixa_idade?: string
  estuda?: string
  sentimentos?: string[]
  afeta_vida?: number
  avontade_opinar?: number
  confia_eleitos?: number
  afasta?: string[]
  ja_participou?: string
  onde_discute?: string[]
  sabia_participar?: string
  texto_participar?: string
  texto_duvida?: string
  criado_em?: string
}

interface RoomCode { label: string; ativo: boolean }
type CodesMap = Record<string, RoomCode>
interface Faixa { nome: string; url: string }

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
  const [cadTipo, setCadTipo] = useState<"pesquisa" | "avaliacao">("pesquisa")
  const [codes, setCodes] = useState<CodesMap>({})
  const [novoCodigo, setNovoCodigo] = useState("")
  const [novoLabel, setNovoLabel] = useState("")
  const [codeState, setCodeState] = useState<SaveState>("idle")
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const [importados, setImportados] = useState<Dilema[]>([])
  const [ativos, setAtivos] = useState<Record<string, boolean>>({})
  const [cardBusy, setCardBusy] = useState<string | null>(null)
  const [trilhas, setTrilhas] = useState<Faixa[]>([])
  const [trilhaState, setTrilhaState] = useState<SaveState>("idle")
  const [trilhaUpload, setTrilhaUpload] = useState<UploadState>("idle")
  const trilhaUrlRef = useRef<HTMLInputElement | null>(null)
  const trilhaNomeRef = useRef<HTMLInputElement | null>(null)
  const [spotniksUrl, setSpotniksUrl] = useState("")
  const [spotniksState, setSpotniksState] = useState<SaveState>("idle")
  const spotniksRef = useRef<HTMLInputElement | null>(null)
  const [forms, setForms] = useState<FormRow[]>([])
  const [formsState, setFormsState] = useState<"idle" | "loading" | "err">("idle")
  const [memes, setMemes] = useState<MemeRow[]>([])
  const [memesState, setMemesState] = useState<"idle" | "loading" | "err">("idle")
  const [memeBusy, setMemeBusy] = useState<number | null>(null)
  const [inscricoes, setInscricoes] = useState<InscricaoRow[]>([])
  const [inscricoesState, setInscricoesState] = useState<"idle" | "loading" | "err">("idle")
  const [inscricaoBusy, setInscricaoBusy] = useState<number | null>(null)
  const [editando, setEditando] = useState<number | null>(null)
  const [editNome, setEditNome] = useState("")
  const [editTurma, setEditTurma] = useState("")
  const [editContato, setEditContato] = useState("")

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

    fetch("/audio_config.json")
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: { trilhas?: Faixa[]; trilha?: string }) => {
        if (Array.isArray(data.trilhas) && data.trilhas.length) {
          setTrilhas(data.trilhas.filter((f) => f?.url))
        } else if (typeof data.trilha === "string" && data.trilha) {
          setTrilhas([{ nome: "trilha", url: data.trilha }])
        }
      })
      .catch(() => {})

    fetch("/site_config.json")
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: { spotniks_url?: string }) => setSpotniksUrl(data.spotniks_url || ""))
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

  // ── Trilha sonora (playlist de rap) ─────────────────────────────────────────
  // Salva a playlist inteira (a API substitui o array). Atualiza a UI ao OK.
  async function salvarTrilhas(lista: Faixa[]) {
    setTrilhaState("saving")
    const res = await fetch("/api/admin/audio", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trilhas: lista }),
    })
    setTrilhaState(res.ok ? "ok" : "err")
    if (res.ok) {
      setTrilhas(lista)
      setLastSaved("trilha")
    }
    setTimeout(() => setTrilhaState("idle"), 2000)
  }

  async function handleAddUrl() {
    const url = trilhaUrlRef.current?.value?.trim()
    if (!url) return
    const nome = trilhaNomeRef.current?.value?.trim() || "faixa"
    await salvarTrilhas([...trilhas, { nome, url }])
    if (trilhaUrlRef.current) trilhaUrlRef.current.value = ""
    if (trilhaNomeRef.current) trilhaNomeRef.current.value = ""
  }

  async function handleUploadTrilha(file: File) {
    setTrilhaUpload("uploading")
    try {
      const blob = await upload(`trilha-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
      })
      const nome = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ")
      await salvarTrilhas([...trilhas, { nome, url: blob.url }])
      setTrilhaUpload("ok")
    } catch {
      setTrilhaUpload("err")
    }
    setTimeout(() => setTrilhaUpload("idle"), 2500)
  }

  async function handleRemoveTrilha(url: string) {
    await salvarTrilhas(trilhas.filter((t) => t.url !== url))
  }

  async function carregarInscricoes() {
    setInscricoesState("loading")
    try {
      const res = await fetch("/api/admin/registros")
      if (!res.ok) throw new Error()
      const d = await res.json()
      setInscricoes(d.inscricoes || [])
      setInscricoesState("idle")
    } catch {
      setInscricoesState("err")
    }
  }

  async function confirmarInscricao(id: number, valor: boolean) {
    setInscricaoBusy(id)
    const res = await fetch("/api/admin/registros", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, presenca_confirmada: valor }),
    })
    if (res.ok) setInscricoes((l) => l.map((x) => x.id === id ? { ...x, presenca_confirmada: valor } : x))
    setInscricaoBusy(null)
  }

  async function salvarEdicao(id: number) {
    setInscricaoBusy(id)
    const res = await fetch("/api/admin/registros", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, nome: editNome, turma: editTurma, contato_valor: editContato }),
    })
    if (res.ok) {
      setInscricoes((l) => l.map((x) => x.id === id ? { ...x, nome: editNome, turma: editTurma, contato_valor: editContato } : x))
      setEditando(null)
    }
    setInscricaoBusy(null)
  }

  async function excluirInscricao(id: number) {
    if (!confirm("Excluir essa inscrição?")) return
    setInscricaoBusy(id)
    const res = await fetch("/api/admin/registros", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    if (res.ok) setInscricoes((l) => l.filter((x) => x.id !== id))
    setInscricaoBusy(null)
  }

  // ── Formulários (leitura) ───────────────────────────────────────────────────
  async function carregarForms() {
    setFormsState("loading")
    try {
      const res = await fetch("/api/admin/formularios")
      if (!res.ok) throw new Error()
      const d = await res.json()
      setForms(d.formularios || [])
      setFormsState("idle")
    } catch {
      setFormsState("err")
    }
  }

  // ── Memes (moderação) ───────────────────────────────────────────────────────
  async function carregarMemes() {
    setMemesState("loading")
    try {
      const res = await fetch("/api/admin/memes")
      if (!res.ok) throw new Error()
      const d = await res.json()
      setMemes(d.memes || [])
      setMemesState("idle")
    } catch {
      setMemesState("err")
    }
  }

  async function moderarMeme(id: number, status: "aprovado" | "recusado" | "pendente") {
    setMemeBusy(id)
    const res = await fetch("/api/admin/memes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    if (res.ok) setMemes((m) => m.map((x) => (x.id === id ? { ...x, status } : x)))
    setMemeBusy(null)
  }

  // ── Conteúdo (vídeo Spotniks etc) ──────────────────────────────────────────
  async function handleSaveSpotniks() {
    const url = spotniksRef.current?.value?.trim() ?? ""
    setSpotniksState("saving")
    const res = await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spotniks_url: url }),
    })
    setSpotniksState(res.ok ? "ok" : "err")
    if (res.ok) {
      setSpotniksUrl(url)
      setLastSaved("conteudo")
    }
    setTimeout(() => setSpotniksState("idle"), 2000)
  }

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-grafite">
        <span className="text-creme-soft/70 font-mono text-sm">carregando…</span>
      </main>
    )
  }

  // ── Login ────────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-grafite px-6">
        <div className="w-full max-w-sm">
          <p className="text-[11px] font-mono tracking-widest uppercase text-laranja mb-6">
            Admin · Vozes do Oziel
          </p>
          <h1 className="text-3xl font-black text-creme mb-8">Área restrita</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="senha da equipe"
              autoFocus
              className="w-full bg-grafite-2 border border-grafite-3 rounded-xl px-4 py-3 text-creme placeholder-creme-soft/40 focus:outline-none focus:border-laranja transition-colors text-base"
            />
            {loginErr && (
              <p className="text-vermelho text-sm font-mono">senha incorreta</p>
            )}
            <button
              type="submit"
              disabled={!password}
              className="w-full py-4 bg-laranja text-grafite font-bold text-base rounded-xl disabled:opacity-30 active:scale-95 transition-transform"
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
    <main className="min-h-screen bg-grafite px-4 py-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[11px] font-mono tracking-widest uppercase text-laranja mb-1">
            Admin · Vozes do Oziel
          </p>
          <h1 className="text-2xl font-black text-creme">Painel da equipe</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="text-xs text-creme-soft/70 font-mono hover:text-creme transition-colors"
          >
            sair →
          </button>
          <MenuHamburger />
        </div>
      </div>

      {/* Abas */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["inscricoes", "cadastro", "videos", "cards", "trilha", "conteudo", "forms", "memes", "codigos"] as Aba[]).map((a) => (
          <button
            key={a}
            onClick={() => { setAba(a); if (a === "forms") carregarForms(); if (a === "memes") carregarMemes(); if (a === "inscricoes") carregarInscricoes() }}
            className={`px-3 py-2 rounded-xl text-sm font-mono transition-colors ${
              aba === a
                ? "bg-laranja text-grafite"
                : "bg-grafite-2 border border-grafite-3 text-creme-soft hover:text-creme"
            }`}
          >
            {a === "inscricoes" ? "📝 Inscrições" : a === "cadastro" ? "✍️ Cadastrar" : a === "videos" ? "🎬 Vídeos" : a === "cards" ? "🃏 Cards" : a === "trilha" ? "🎵 Trilha" : a === "conteudo" ? "📺 Conteúdo" : a === "forms" ? "📋 Pesquisa" : a === "memes" ? "🖼️ Memes" : "🔑 Códigos"}
          </button>
        ))}
      </div>

      {lastSaved && (
        <div className="mb-6 bg-verde/10 border border-verde/30 rounded-xl px-4 py-3 text-verde text-sm font-mono">
          ✓ Salvo — publicando no jogo em ~30s
        </div>
      )}

      {/* ── Aba Cadastrar (transcrição das fichas de papel) ─────────────── */}
      {aba === "cadastro" && (
        <>
          <p className="text-creme-soft text-sm mb-4 leading-relaxed">
            Transcreva as fichas de papel do encontro, <strong>uma por vez</strong>. Quando
            a pessoa deixou uma pergunta em branco no papel, toque <strong>&ldquo;não respondeu&rdquo;</strong> —
            isso é dado, não erro. Tudo anônimo.
          </p>

          <div className="flex gap-2 mb-6">
            <button onClick={() => setCadTipo("pesquisa")}
              className={`flex-1 py-2 rounded-xl text-sm font-mono transition-colors ${
                cadTipo === "pesquisa" ? "bg-laranja text-grafite" : "bg-grafite-2 border border-grafite-3 text-creme-soft"
              }`}>pesquisa inicial</button>
            <button onClick={() => setCadTipo("avaliacao")}
              className={`flex-1 py-2 rounded-xl text-sm font-mono transition-colors ${
                cadTipo === "avaliacao" ? "bg-laranja text-grafite" : "bg-grafite-2 border border-grafite-3 text-creme-soft"
              }`}>avaliação (pós)</button>
          </div>

          {cadTipo === "pesquisa" ? (
            <CadastroForm
              key="pesquisa"
              titulo="pesquisa inicial · baseline"
              perguntas={PESQUISA_INICIAL}
              momentos={MOMENTOS}
              endpoint="/api/admin/formularios"
            />
          ) : (
            <CadastroForm
              key="avaliacao"
              titulo="avaliação pós-encontro"
              perguntas={AVALIACAO as CampoPergunta[]}
              endpoint="/api/admin/avaliacao"
            />
          )}
        </>
      )}

      {/* ── Aba Inscrições ──────────────────────────────────────────────── */}
      {aba === "inscricoes" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-creme-soft text-sm leading-relaxed">
              Inscrições no encontro de 20 de junho.
            </p>
            <button onClick={carregarInscricoes} className="shrink-0 text-xs font-mono text-creme-soft/70 hover:text-creme transition-colors">↻</button>
          </div>

          {inscricoes.length > 0 && (() => {
            const total = inscricoes.length
            const confirmados = inscricoes.filter((i) => i.presenca_confirmada).length
            const manha = inscricoes.filter((i) => i.turma?.toLowerCase().includes("manhã")).length
            const tarde = inscricoes.filter((i) => i.turma?.toLowerCase().includes("tarde")).length
            const comContato = inscricoes.filter((i) => i.contato_valor?.trim()).length
            return (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-grafite-2 border-2 border-laranja/40 rounded-2xl px-4 py-3 text-center">
                  <p className="text-laranja text-3xl font-bold leading-none">{total}</p>
                  <p className="text-creme-soft/70 text-xs font-mono mt-1">inscritos</p>
                </div>
                <div className="bg-grafite-2 border-2 border-verde/40 rounded-2xl px-4 py-3 text-center">
                  <p className="text-verde text-3xl font-bold leading-none">{confirmados}</p>
                  <p className="text-creme-soft/70 text-xs font-mono mt-1">confirmados</p>
                </div>
                <div className="bg-grafite-2 border border-grafite-3 rounded-2xl px-4 py-3">
                  <p className="brand-label text-[9px] text-creme/40 uppercase tracking-widest mb-2">turmas</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-creme">🌅 manhã</span>
                    <span className="text-laranja font-bold">{manha}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-creme">🌇 tarde</span>
                    <span className="text-laranja font-bold">{tarde}</span>
                  </div>
                </div>
                <div className="bg-grafite-2 border border-grafite-3 rounded-2xl px-4 py-3">
                  <p className="brand-label text-[9px] text-creme/40 uppercase tracking-widest mb-2">contato</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-creme">com</span>
                    <span className="text-verde font-bold">{comContato}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-creme">sem</span>
                    <span className="text-creme-soft/50 font-bold">{total - comContato}</span>
                  </div>
                </div>
              </div>
            )
          })()}

          {inscricoesState === "loading" ? (
            <p className="text-creme-soft/60 text-sm font-mono text-center py-8">carregando…</p>
          ) : inscricoesState === "err" ? (
            <p className="text-vermelho/80 text-sm font-mono text-center py-8">erro ao carregar</p>
          ) : inscricoes.length === 0 ? (
            <p className="text-creme-soft/60 text-sm font-mono text-center py-8">nenhuma inscrição ainda</p>
          ) : (
            <div className="space-y-3">
              {inscricoes.map((insc) => {
                const busy = inscricaoBusy === insc.id
                const editandoEste = editando === insc.id
                return (
                  <div key={insc.id} className={`bg-grafite-2 border-2 rounded-2xl p-4 ${insc.presenca_confirmada ? "border-verde/50" : "border-grafite-3"}`}>
                    {editandoEste ? (
                      <div className="space-y-2">
                        <input value={editNome} onChange={(e) => setEditNome(e.target.value)}
                          className="w-full bg-grafite border border-grafite-3 rounded-xl px-3 py-2 text-creme text-sm focus:outline-none focus:border-laranja" />
                        <select value={editTurma} onChange={(e) => setEditTurma(e.target.value)}
                          className="w-full bg-grafite border border-grafite-3 rounded-xl px-3 py-2 text-creme text-sm focus:outline-none focus:border-laranja">
                          <option value="Sábado manhã — das 9:00 às 11:00">Manhã — 9h às 11h</option>
                          <option value="Sábado tarde — das 14:30 às 16:30">Tarde — 14h30 às 16h30</option>
                        </select>
                        <input value={editContato} onChange={(e) => setEditContato(e.target.value)}
                          placeholder="contato (opcional)"
                          className="w-full bg-grafite border border-grafite-3 rounded-xl px-3 py-2 text-creme text-sm focus:outline-none focus:border-laranja" />
                        <div className="flex gap-2">
                          <button onClick={() => salvarEdicao(insc.id)} disabled={busy}
                            className="flex-1 py-2 rounded-xl text-sm font-bold bg-laranja text-grafite active:scale-95 transition-all disabled:opacity-40">
                            {busy ? "…" : "salvar"}
                          </button>
                          <button onClick={() => setEditando(null)}
                            className="px-4 py-2 rounded-xl text-sm font-mono text-creme-soft/70 border border-grafite-3 hover:text-creme transition-colors">
                            cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="text-creme font-bold text-base">{insc.nome}</p>
                            <p className="text-creme-soft/70 text-xs font-mono">{insc.idade} anos</p>
                          </div>
                          {insc.presenca_confirmada && (
                            <span className="text-[10px] font-mono text-verde uppercase tracking-widest shrink-0">✓ confirmado</span>
                          )}
                        </div>
                        <p className="text-creme-soft text-sm mb-1">{insc.turma}</p>
                        {insc.contato_tipo && insc.contato_tipo !== "não precisa" && (
                          <p className="text-creme-soft/60 text-xs font-mono mb-3">
                            {insc.contato_tipo}: {insc.contato_valor}
                          </p>
                        )}
                        <div className="flex gap-2 flex-wrap mt-3">
                          <button onClick={() => confirmarInscricao(insc.id, !insc.presenca_confirmada)} disabled={busy}
                            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-40 ${
                              insc.presenca_confirmada
                                ? "bg-grafite border border-grafite-3 text-creme-soft/70"
                                : "bg-verde/15 border border-verde/40 text-verde"
                            }`}>
                            {busy ? "…" : insc.presenca_confirmada ? "desmarcar" : "✓ confirmar"}
                          </button>
                          <button onClick={() => { setEditando(insc.id); setEditNome(insc.nome ?? ""); setEditTurma(insc.turma ?? ""); setEditContato(insc.contato_valor ?? "") }}
                            className="px-4 py-2 rounded-xl text-sm font-mono text-creme-soft/70 border border-grafite-3 hover:text-creme transition-colors">
                            editar
                          </button>
                          <button onClick={() => excluirInscricao(insc.id)} disabled={busy}
                            className="px-4 py-2 rounded-xl text-sm font-mono text-vermelho/70 border border-vermelho/30 hover:text-vermelho transition-colors disabled:opacity-40">
                            excluir
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ── Aba Vídeos ──────────────────────────────────────────────────── */}
      {aba === "videos" && (
        <>
          <p className="text-creme-soft text-sm mb-6 leading-relaxed">
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
              className="bg-grafite-2 border border-grafite-3 rounded-2xl p-4"
            >
              {/* Cabeçalho do card */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono text-creme-soft/70 uppercase tracking-widest">
                  {d.id}
                </span>
                <span className="text-[10px] font-mono text-laranja uppercase tracking-widest">
                  {d.modulo}
                </span>
                {hasVideo && (
                  <span className="text-[10px] font-mono text-verde">✓ com vídeo</span>
                )}
              </div>

              {/* Texto do meme */}
              <p className="text-creme-soft text-sm italic mb-4 line-clamp-2">
                {d.meme}
              </p>

              {/* Input URL + botão */}
              <div className="flex gap-2">
                <input
                  ref={(el) => { inputRefs.current[d.id] = el }}
                  type="url"
                  defaultValue={videos[d.id] ?? ""}
                  placeholder="https://www.tiktok.com/@usuario/video/..."
                  className="flex-1 bg-grafite border border-grafite-3 rounded-xl px-3 py-2 text-creme placeholder-creme-soft/30 focus:outline-none focus:border-laranja transition-colors text-sm font-mono"
                />
                <button
                  onClick={() => handleSave(d.id)}
                  disabled={state === "saving"}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                    state === "ok"
                      ? "bg-verde text-grafite"
                      : state === "err"
                      ? "bg-vermelho text-creme"
                      : "bg-laranja text-grafite disabled:opacity-50"
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
                        ? "border-verde/50 text-verde"
                        : up === "err"
                        ? "border-vermelho/50 text-vermelho"
                        : "border-grafite-3 text-creme-soft hover:text-creme hover:border-creme-soft/40"
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

      {/* ── Aba Cards: ocultar/mostrar (todos os cards) ─────────────────── */}
      {aba === "cards" && (() => {
        // Lista completa: cards fixos + gerados + importados (sem duplicar id).
        const todosCards = [
          ...allDilemas,
          ...importados.filter((i) => !allDilemas.some((a) => a.id === i.id)),
        ]
        const ativosCount = todosCards.filter((d) => cardAtivo(d.id)).length
        return (
          <>
            <p className="text-creme-soft text-sm mb-2 leading-relaxed">
              Todos os cards do jogo. Toque para <strong>tirar</strong> (ocultar) ou
              <strong> mostrar</strong> qualquer um — fixos ou importados. Salva na hora,
              sem apagar o conteúdo.
            </p>
            <p className="text-creme-soft/70 text-xs font-mono mb-6">
              {todosCards.length} card(s) · {ativosCount} no jogo · {todosCards.length - ativosCount} oculto(s)
            </p>

            <div className="space-y-4">
              {todosCards.map((d) => {
                const on = cardAtivo(d.id)
                const busy = cardBusy === d.id
                const fixo = !importados.some((i) => i.id === d.id)
                return (
                  <div key={d.id} className={`bg-grafite-2 border rounded-2xl p-4 ${on ? "border-grafite-3" : "border-grafite-3/40 opacity-70"}`}>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-[10px] font-mono text-creme-soft/70 uppercase tracking-widest">{d.id}</span>
                      <span className="text-[10px] font-mono text-laranja uppercase tracking-widest">{d.modulo}</span>
                      <span className="text-[10px] font-mono text-creme-soft/40 uppercase tracking-widest">{fixo ? "fixo" : "importado"}</span>
                      {d.meme_video && <span className="text-[10px] font-mono text-verde">🎬 vídeo</span>}
                      {!d.meme_video && d.meme_imagem && <span className="text-[10px] font-mono text-verde">🖼️ imagem</span>}
                    </div>
                    <p className="text-creme text-sm font-semibold mb-1 line-clamp-2">{d.meme}</p>
                    {d.pilula_sabedoria && (
                      <p className="text-creme-soft text-xs italic mb-4 line-clamp-2">💡 {d.pilula_sabedoria}</p>
                    )}
                    <button
                      onClick={() => handleToggleCard(d.id)}
                      disabled={busy}
                      className={`w-full py-2 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                        on
                          ? "bg-verde/15 border border-verde/40 text-verde"
                          : "bg-grafite-2 border border-grafite-3 text-creme-soft/60"
                      } disabled:opacity-50`}
                    >
                      {busy ? "…" : on ? "✓ no jogo — toque pra ocultar" : "oculto — toque pra mostrar"}
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        )
      })()}

      {/* ── Aba Trilha sonora (playlist) ────────────────────────────────── */}
      {aba === "trilha" && (
        <>
          <p className="text-creme-soft text-sm mb-2 leading-relaxed">
            Playlist de <strong>raps</strong> que tocam de fundo no jogo. Suba quantas
            quiser (.mp3, .m4a, .wav) ou cole URLs. O jogador troca de faixa ou silencia
            por botões pequenos no canto da tela.
          </p>
          <p className="text-creme-soft/70 text-xs font-mono mb-6">
            {trilhas.length} faixa(s) na playlist
          </p>

          {/* Faixas atuais */}
          <div className="space-y-3 mb-6">
            {trilhas.length === 0 && (
              <p className="text-creme-soft/60 text-sm font-mono text-center py-4">
                nenhuma faixa ainda
              </p>
            )}
            {trilhas.map((t, i) => (
              <div key={t.url} className="bg-grafite-2 border border-grafite-3 rounded-2xl p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-creme text-sm font-bold truncate">
                    {i + 1}. {t.nome}
                  </span>
                  <button
                    onClick={() => handleRemoveTrilha(t.url)}
                    className="shrink-0 text-creme-soft/70 hover:text-vermelho font-mono text-xs transition-colors"
                  >
                    remover
                  </button>
                </div>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio src={t.url} controls preload="none" className="w-full" />
              </div>
            ))}
          </div>

          {/* Adicionar faixa */}
          <div className="bg-grafite-2 border border-grafite-3 rounded-2xl p-4">
            <p className="text-[10px] font-mono tracking-widest uppercase text-creme-soft/70 mb-4">
              adicionar faixa
            </p>

            <label
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed text-sm font-mono cursor-pointer transition-colors active:scale-95 ${
                trilhaUpload === "ok" ? "border-verde/50 text-verde"
                : trilhaUpload === "err" ? "border-vermelho/50 text-vermelho"
                : "border-grafite-3 text-creme-soft hover:text-creme hover:border-creme-soft/40"
              } ${trilhaUpload === "uploading" ? "opacity-60 pointer-events-none" : ""}`}
            >
              {trilhaUpload === "uploading" ? "enviando faixa…"
                : trilhaUpload === "ok" ? "✓ faixa adicionada"
                : trilhaUpload === "err" ? "! falhou — tente de novo"
                : "📤 subir rap (.mp3 / .m4a / .wav)"}
              <input
                type="file"
                accept="audio/mpeg,audio/mp4,audio/aac,audio/wav,audio/x-wav,audio/ogg,.mp3,.m4a,.wav,.ogg"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleUploadTrilha(f)
                  e.target.value = ""
                }}
              />
            </label>

            <p className="text-center text-creme-soft/40 text-[10px] font-mono my-3">ou cole uma URL</p>

            <div className="space-y-2">
              <input
                ref={trilhaNomeRef}
                type="text"
                placeholder="nome da faixa (ex: Laranja no Horizonte)"
                className="w-full bg-grafite border border-grafite-3 rounded-xl px-3 py-2 text-creme placeholder-creme-soft/30 focus:outline-none focus:border-laranja transition-colors text-sm"
              />
              <div className="flex gap-2">
                <input
                  ref={trilhaUrlRef}
                  type="url"
                  placeholder="https://…/rap.mp3"
                  className="flex-1 bg-grafite border border-grafite-3 rounded-xl px-3 py-2 text-creme placeholder-creme-soft/30 focus:outline-none focus:border-laranja transition-colors text-sm font-mono"
                />
                <button
                  onClick={handleAddUrl}
                  disabled={trilhaState === "saving"}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                    trilhaState === "ok" ? "bg-verde text-grafite"
                    : trilhaState === "err" ? "bg-vermelho text-creme"
                    : "bg-laranja text-grafite disabled:opacity-50"
                  }`}
                >
                  {trilhaState === "saving" ? "…" : trilhaState === "ok" ? "✓" : trilhaState === "err" ? "!" : "+ add"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Aba Conteúdo (vídeo Spotniks) ───────────────────────────────── */}
      {aba === "conteudo" && (
        <>
          <p className="text-creme-soft text-sm mb-6 leading-relaxed">
            Vídeo de <strong>inspiração</strong> (Spotniks) que aparece na tela de entrada
            no botão &ldquo;assista o que inspirou&rdquo;. Cole o link do YouTube.
          </p>

          <div className="bg-grafite-2 border border-grafite-3 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono text-laranja uppercase tracking-widest">vídeo Spotniks</span>
              {spotniksUrl
                ? <span className="text-[10px] font-mono text-verde">📺 definido</span>
                : <span className="text-[10px] font-mono text-creme-soft/50">nenhum</span>}
            </div>

            <div className="flex gap-2">
              <input
                ref={spotniksRef}
                type="url"
                defaultValue={spotniksUrl}
                placeholder="https://youtu.be/… ou youtube.com/watch?v=…"
                className="flex-1 bg-grafite border border-grafite-3 rounded-xl px-3 py-2 text-creme placeholder-creme-soft/30 focus:outline-none focus:border-laranja transition-colors text-sm font-mono"
              />
              <button
                onClick={handleSaveSpotniks}
                disabled={spotniksState === "saving"}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                  spotniksState === "ok" ? "bg-verde text-grafite"
                  : spotniksState === "err" ? "bg-vermelho text-creme"
                  : "bg-laranja text-grafite disabled:opacity-50"
                }`}
              >
                {spotniksState === "saving" ? "…" : spotniksState === "ok" ? "✓" : spotniksState === "err" ? "!" : "salvar"}
              </button>
            </div>

            {spotniksUrl && (
              <button
                onClick={() => { if (spotniksRef.current) spotniksRef.current.value = ""; handleSaveSpotniks() }}
                className="mt-3 w-full py-2 rounded-xl text-xs font-mono text-creme-soft/70 hover:text-vermelho transition-colors"
              >
                remover vídeo
              </button>
            )}
          </div>
        </>
      )}

      {/* ── Aba Pesquisa (formulários) ──────────────────────────────────── */}
      {aba === "forms" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-creme-soft text-sm leading-relaxed pr-3">
              Respostas da pesquisa qualitativa (anônimas). O texto livre é
              <strong> só pra equipe</strong> — nunca vai pro dashboard público.
            </p>
            <button
              onClick={carregarForms}
              className="shrink-0 text-xs font-mono text-creme-soft/70 hover:text-creme transition-colors"
            >
              ↻
            </button>
          </div>

          {formsState === "loading" ? (
            <p className="text-creme-soft/60 text-sm font-mono text-center py-8">carregando…</p>
          ) : formsState === "err" ? (
            <p className="text-vermelho/80 text-sm font-mono text-center py-8">
              erro — Supabase configurado? rode o schema.sql
            </p>
          ) : forms.length === 0 ? (
            <p className="text-creme-soft/60 text-sm font-mono text-center py-8">nenhuma resposta ainda</p>
          ) : (
            <div className="space-y-3">
              <p className="text-creme-soft/70 text-xs font-mono mb-2">{forms.length} resposta(s)</p>
              {forms.map((f) => (
                <div key={f.id} className="bg-grafite-2 border border-grafite-3 rounded-2xl p-4">
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-mono text-creme-soft/80 mb-2">
                    {f.bairro && <span>📍 {f.bairro}</span>}
                    {f.faixa_idade && <span>· {f.faixa_idade}</span>}
                    {f.estuda && <span>· {f.estuda}</span>}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {(f.sentimentos ?? []).map((x) => <span key={x} className="text-[11px] bg-grafite border border-grafite-3 rounded-full px-2 py-0.5 text-laranja">{x}</span>)}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-mono text-creme-soft/70 mb-2">
                    {typeof f.afeta_vida === "number" && <span>afeta vida: {f.afeta_vida}/5</span>}
                    {typeof f.avontade_opinar === "number" && <span>· à vontade: {f.avontade_opinar}/5</span>}
                    {typeof f.confia_eleitos === "number" && <span>· confia: {f.confia_eleitos}/5</span>}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {f.ja_participou && <span className="text-[11px] bg-grafite border border-grafite-3 rounded-full px-2 py-0.5 text-creme-soft">participou: {f.ja_participou}</span>}
                    {f.sabia_participar && <span className="text-[11px] bg-grafite border border-grafite-3 rounded-full px-2 py-0.5 text-creme-soft">{f.sabia_participar}</span>}
                    {(f.afasta ?? []).map((x) => <span key={x} className="text-[11px] bg-grafite border border-grafite-3 rounded-full px-2 py-0.5 text-vermelho/80">afasta: {x}</span>)}
                    {(f.onde_discute ?? []).map((x) => <span key={x} className="text-[11px] bg-grafite border border-grafite-3 rounded-full px-2 py-0.5 text-creme-soft/70">{x}</span>)}
                  </div>
                  {f.texto_participar && (
                    <p className="text-creme text-sm mt-2"><span className="text-creme-soft/50">participar+:</span> {f.texto_participar}</p>
                  )}
                  {f.texto_duvida && (
                    <p className="text-creme text-sm mt-1"><span className="text-creme-soft/50">dúvida:</span> {f.texto_duvida}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Aba Memes (moderação) ───────────────────────────────────────── */}
      {aba === "memes" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-creme-soft text-sm leading-relaxed pr-3">
              Memes enviados pela comunidade. <strong>Avalie</strong> antes de qualquer uso —
              nada aparece em público sem aprovação.
            </p>
            <button onClick={carregarMemes} className="shrink-0 text-xs font-mono text-creme-soft/70 hover:text-creme transition-colors">↻</button>
          </div>

          {memesState === "loading" ? (
            <p className="text-creme-soft/60 text-sm font-mono text-center py-8">carregando…</p>
          ) : memesState === "err" ? (
            <p className="text-vermelho/80 text-sm font-mono text-center py-8">erro — Supabase configurado? rode o schema.sql</p>
          ) : memes.length === 0 ? (
            <p className="text-creme-soft/60 text-sm font-mono text-center py-8">nenhum meme enviado ainda</p>
          ) : (
            <div className="space-y-4">
              <p className="text-creme-soft/70 text-xs font-mono">
                {memes.filter((m) => m.status === "pendente").length} pendente(s) · {memes.length} no total
              </p>
              {memes.map((m) => {
                const busy = memeBusy === m.id
                const cor = m.status === "aprovado" ? "border-verde/50" : m.status === "recusado" ? "border-vermelho/40 opacity-60" : "border-grafite-3"
                return (
                  <div key={m.id} className={`bg-grafite-2 border-2 rounded-2xl p-4 ${cor}`}>
                    <div className="flex items-center gap-2 mb-2 flex-wrap text-[11px] font-mono">
                      <span className={`uppercase tracking-widest ${m.status === "aprovado" ? "text-verde" : m.status === "recusado" ? "text-vermelho" : "text-laranja"}`}>{m.status}</span>
                      {m.autor_apelido && <span className="text-creme-soft">por {m.autor_apelido}</span>}
                      {m.bairro && <span className="text-creme-soft/60">· {m.bairro}</span>}
                    </div>
                    {m.imagem_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.imagem_url} alt="meme" className="w-full rounded-xl border border-grafite-3 mb-2" />
                    )}
                    {m.descricao && <p className="text-creme text-sm mb-3">{m.descricao}</p>}
                    <div className="flex gap-2">
                      <button
                        onClick={() => moderarMeme(m.id, "aprovado")}
                        disabled={busy || m.status === "aprovado"}
                        className="flex-1 py-2 rounded-xl text-sm font-bold bg-verde/15 border border-verde/40 text-verde active:scale-95 transition-all disabled:opacity-40"
                      >✓ aprovar</button>
                      <button
                        onClick={() => moderarMeme(m.id, "recusado")}
                        disabled={busy || m.status === "recusado"}
                        className="flex-1 py-2 rounded-xl text-sm font-bold bg-vermelho/10 border border-vermelho/40 text-vermelho active:scale-95 transition-all disabled:opacity-40"
                      >✕ recusar</button>
                    </div>
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
          <p className="text-creme-soft text-sm mb-6 leading-relaxed">
            Crie um código curto para revelar na lousa no final do encontro presencial.
            Quando o jovem digita na tela inicial, desbloqueia o módulo pós-oficina.
          </p>

          {/* Criar novo código */}
          <div className="bg-grafite-2 border border-grafite-3 rounded-2xl p-4 mb-6">
            <p className="text-[10px] font-mono tracking-widest uppercase text-creme-soft/70 mb-4">novo código</p>
            <div className="space-y-2">
              <input
                type="text"
                value={novoCodigo}
                onChange={(e) => setNovoCodigo(e.target.value.toUpperCase())}
                placeholder="EX: CRIA26"
                maxLength={12}
                className="w-full bg-grafite border border-grafite-3 rounded-xl px-3 py-2 text-creme placeholder-creme-soft/30 focus:outline-none focus:border-laranja transition-colors text-sm font-mono tracking-wider"
              />
              <input
                type="text"
                value={novoLabel}
                onChange={(e) => setNovoLabel(e.target.value)}
                placeholder="descrição (ex: Encontro Mai/2026)"
                className="w-full bg-grafite border border-grafite-3 rounded-xl px-3 py-2 text-creme placeholder-creme-soft/30 focus:outline-none focus:border-laranja transition-colors text-sm"
              />
              <button
                onClick={handleAddCode}
                disabled={!novoCodigo.trim() || codeState === "saving"}
                className={`w-full py-2 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                  codeState === "ok" ? "bg-verde text-grafite"
                  : codeState === "err" ? "bg-vermelho text-creme"
                  : "bg-laranja text-grafite disabled:opacity-30"
                }`}
              >
                {codeState === "saving" ? "criando…" : codeState === "ok" ? "✓ criado" : "criar código"}
              </button>
            </div>
          </div>

          {/* Lista de códigos ativos */}
          <div className="space-y-3">
            {Object.keys(codes).length === 0 ? (
              <p className="text-creme-soft/70 text-sm font-mono text-center py-8">nenhum código ativo</p>
            ) : (
              Object.entries(codes).map(([code, info]) => (
                <div key={code} className="bg-grafite-2 border border-grafite-3 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-creme font-mono font-bold tracking-widest">{code}</p>
                    <p className="text-creme-soft/70 text-xs mt-1">{info.label}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveCode(code)}
                    className="text-creme-soft/70 hover:text-vermelho font-mono text-xs transition-colors"
                  >
                    remover
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      <p className="text-creme-soft/40 text-xs font-mono text-center mt-12">
        Vozes do Oziel · equipe CriaLab
      </p>
    </main>
  )
}
