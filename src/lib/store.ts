"use client"

export interface Player {
  apelido: string
  bairro: string
}

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
