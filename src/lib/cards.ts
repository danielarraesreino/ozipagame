"use client"

import type { Dilema } from "./dilemas"

// Cards importados do pipeline ozielmemes. São lidos em RUNTIME (sem rebuild),
// igual ao /video_urls.json. A exportação do ozielmemes grava esses dois arquivos
// em public/. O mapa de ativos é mantido pelo admin (commit no GitHub).

// Mapa { dilema_id → ativo }. Mantido pelo admin (commit no GitHub). Default:
// ausente = ativo; só fica fora do jogo quando explicitamente false.
export async function fetchAtivos(): Promise<Record<string, boolean>> {
  try {
    const res = await fetch("/cards_ativos.json", { cache: "no-store" })
    return res.ok ? await res.json() : {}
  } catch {
    return {}
  }
}

export async function fetchImportados(): Promise<Dilema[]> {
  try {
    const [cardsRes, ativosRes] = await Promise.all([
      fetch("/dilemas_importados.json", { cache: "no-store" }),
      fetch("/cards_ativos.json", { cache: "no-store" }),
    ])
    const cards: Dilema[] = cardsRes.ok ? await cardsRes.json() : []
    const ativos: Record<string, boolean> = ativosRes.ok ? await ativosRes.json() : {}

    // Default: card importado entra ATIVO, a menos que o admin tenha desligado.
    return cards
      .filter((c) => ativos[c.id] !== false)
      .map((c) => ({ ...c, importado: true }))
  } catch {
    return []
  }
}
