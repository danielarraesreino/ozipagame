"use client"

export interface Player {
  apelido: string
  bairro: string
}

export type Escolha = "right" | "left"
export type RespostasMap = Record<string, Escolha>

// ── Player ────────────────────────────────────────────────────────────────────

export function savePlayer(player: Player) {
  localStorage.setItem("ozipa_player", JSON.stringify(player))
}

export function loadPlayer(): Player | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem("ozipa_player")
  return raw ? JSON.parse(raw) : null
}

export function clearPlayer() {
  localStorage.removeItem("ozipa_player")
}

// ── Respostas por fase ────────────────────────────────────────────────────────

export function saveRespostas(respostas: RespostasMap, fase: 1 | 2) {
  localStorage.setItem(`ozipa_respostas_f${fase}`, JSON.stringify(respostas))
}

export function loadRespostas(fase: 1 | 2): RespostasMap {
  if (typeof window === "undefined") return {}
  const raw = localStorage.getItem(`ozipa_respostas_f${fase}`)
  return raw ? JSON.parse(raw) : {}
}

// ── Módulos desbloqueados ─────────────────────────────────────────────────────

export function unlockModulo(codigo: string) {
  if (typeof window === "undefined") return
  const atual = loadUnlocked()
  atual.pos_oficina = codigo
  localStorage.setItem("ozipa_unlocked", JSON.stringify(atual))
}

export function loadUnlocked(): Record<string, string> {
  if (typeof window === "undefined") return {}
  const raw = localStorage.getItem("ozipa_unlocked")
  return raw ? JSON.parse(raw) : {}
}

export function isPosOficinaUnlocked(): boolean {
  return !!loadUnlocked().pos_oficina
}
