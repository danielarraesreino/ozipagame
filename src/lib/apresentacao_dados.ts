/* ───────────────────────────────────────────────────────────────────────────
   DADOS DA APRESENTAÇÃO — "O lado oculto da quebrada"
   Números COMPUTADOS vêm de ./apresentacao_stats.json (gerado por
   `node --env-file=.env.local scripts/gen_apresentacao.mjs`, recortado do banco
   formularios+avaliacoes). Aqui só mora a CURADORIA editorial (rótulos, resumos,
   notas, destaques `hl`) — mesclada com os números via build().

     · ENCONTRO 1 — Parque Oziel        fichas ≤ 2026-06-25
     · ENCONTRO 2 — EE Rui Rodrigues    fichas = 2026-06-26 / 2026-06-30
     · AVALIAÇÃO pós-encontro (Rui Rodrigues)

   Princípio: branco é DADO, não buraco ("sem resposta" entra como categoria).
   Denominador honesto = quem foi PERGUNTADO. Correlação de Pearson sobre pares
   completos. n pequeno = tendência, nunca conclusão.

   ⚠️ NÃO edite números à mão aqui — rode o gerador. Edite só texto/curadoria.
   ─────────────────────────────────────────────────────────────────────────── */

import stats from "./apresentacao_stats.json"

export type Par = readonly [string, number]

export interface Cohort {
  id: "oziel" | "rui"
  encontro: string
  local: string
  escola: string
  n: number
  completas: number
  data: string
  resumo: string
  bairros: Par[]
  idades: Par[]
  publica: { pct: number; abs: string }
  sentimentos: Par[]
  afasta: Par[]
  participou: Par[]
  onde: Par[]
  sabia: Par[]
  escalas: { afeta: number; avontade: number; confia: number }
  corr: { afetaVoz: number; confiaVoz: number; confiaAfeta: number }
  corrN: { afetaVoz: number; confiaVoz: number; confiaAfeta: number }
  idadeTab: { faixa: string; afeta: number; avontade: number; confia: number; n: number; hl?: boolean }[]
  bairroAfeta: { b: string; afeta: number; nunca: string; hl?: boolean }[]
  silencio: { mudo: number; nMudo: number; fala: number; nFala: number }
  infoGap: { naoSabiaPct: number; nuncaPct: number; naoSabiaN: number; naoSabiaNunca: number }
}

// curadoria por coorte (texto + quais linhas destacar)
interface Editorial {
  id: "oziel" | "rui"
  encontro: string
  local: string
  escola: string
  data: string
  resumo: string
  hlIdade: string   // faixa destacada na idadeTab
  hlBairro: string  // bairro destacado na bairroAfeta
}

type RawCohort = typeof stats.oziel

function build(raw: RawCohort, ed: Editorial): Cohort {
  const rOf = (c: { r: number | null; n: number }) => c.r ?? 0
  return {
    id: ed.id,
    encontro: ed.encontro,
    local: ed.local,
    escola: ed.escola,
    data: ed.data,
    resumo: ed.resumo,
    n: raw.n,
    completas: raw.completas,
    bairros: raw.bairros as unknown as Par[],
    idades: raw.idades as unknown as Par[],
    publica: raw.publica,
    sentimentos: raw.sentimentos as unknown as Par[],
    afasta: raw.afasta as unknown as Par[],
    participou: raw.participou as unknown as Par[],
    onde: raw.onde as unknown as Par[],
    sabia: raw.sabia as unknown as Par[],
    escalas: raw.escalas as { afeta: number; avontade: number; confia: number },
    corr: { afetaVoz: rOf(raw.corr.afetaVoz), confiaVoz: rOf(raw.corr.confiaVoz), confiaAfeta: rOf(raw.corr.confiaAfeta) },
    corrN: { afetaVoz: raw.corr.afetaVoz.n, confiaVoz: raw.corr.confiaVoz.n, confiaAfeta: raw.corr.confiaAfeta.n },
    idadeTab: raw.idadeTab.map((t) => ({
      faixa: t.faixa, afeta: t.afeta ?? 0, avontade: t.avontade ?? 0, confia: t.confia ?? 0, n: t.n,
      ...(t.faixa === ed.hlIdade ? { hl: true } : {}),
    })),
    bairroAfeta: raw.bairroAfeta.map((b) => ({
      b: b.b, afeta: b.afeta ?? 0, nunca: b.nunca,
      ...(b.b === ed.hlBairro ? { hl: true } : {}),
    })),
    silencio: raw.silencio,
    infoGap: raw.infoGap,
  }
}

export const OZIEL: Cohort = build(stats.oziel, {
  id: "oziel",
  encontro: "Encontro 01",
  local: "Parque Oziel",
  escola: "território / sede do projeto",
  data: "jun · 2026",
  resumo: "O berço do projeto. Mais novos (53% têm 12–13). A esperança ainda lidera o sentimento — por pouco.",
  hlIdade: "16–17",
  hlBairro: "Jardim Monte Cristo",
})

export const RUI: Cohort = build(stats.rui, {
  id: "rui",
  encontro: "Encontro 02",
  local: "EE Rui Rodrigues",
  escola: "escola estadual · Campo Grande",
  data: "26 jun · 2026",
  resumo: "Outra escola, outra psicologia. Mais velhos (61% têm 16–17). Aqui a alienação (“não é pra mim”) passa a esperança pela primeira vez.",
  hlIdade: "14–15",
  hlBairro: "Outro bairro",
})

export const COHORTS = [OZIEL, RUI] as const

// Avaliação pós-encontro (auto-relato) — só Rui Rodrigues tem no banco.
const av = stats.avaliacao
export const AVALIACAO = {
  n: av.n,
  local: "EE Rui Rodrigues",
  cards: [
    { l: "o medo de falar diminuiu", pct: av.cards.medo.pct, n: av.cards.medo.abs, nota: "saíram iguais ou mais travados, minoria", cor: "verde" },
    { l: "mais vontade de participar", pct: av.cards.vontade.pct, n: av.cards.vontade.abs, nota: "pouquíssimos saíram com menos", cor: "laranja" },
    { l: "mais confiança pra falar", pct: av.cards.confianca.pct, n: av.cards.confianca.abs, nota: "quase ninguém saiu com menos", cor: "amarelo" },
  ],
  perfil: { genero: "58% mulheres cis", idade: "65% 16–17", raca: "65% pretas e pardas" },
  politica: av.politica as unknown as Par[],
  dificulta: av.dificulta as unknown as Par[],
}

// vozes livres (o que faria participar) — texto curado das fichas
export const VOZES = ["se tivesse menos lixo", "ter parquinho conservado", "aula de vôlei", "aula de canto", "liberar o celular", "lutaria mais por moradia"]

export const TOTAIS = stats.totais

// quando os dados foram recalculados do banco
export const GERADO_EM = stats.gerado_em
