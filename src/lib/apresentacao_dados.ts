/* ───────────────────────────────────────────────────────────────────────────
   DADOS DA APRESENTAÇÃO — "O lado oculto da quebrada"
   Dois encontros, dois retratos. Números reais, validados à mão a partir do
   banco (formularios + avaliacoes), recortados por data de coleta:

     · ENCONTRO 1 — Parque Oziel        fichas ≤ 2026-06-25   N=30
     · ENCONTRO 2 — EE Rui Rodrigues    fichas = 2026-06-26   N=44
     · AVALIAÇÃO pós-encontro (Rui Rodrigues)                 N=31

   Princípio: branco é DADO, não buraco ("não respondeu" entra como categoria).
   Denominador honesto = quem foi PERGUNTADO. Correlação de Pearson sobre fichas
   completas. n pequeno (<6) = tendência, nunca conclusão.
   ─────────────────────────────────────────────────────────────────────────── */

export type Par = readonly [string, number]

export interface Cohort {
  id: "oziel" | "rui"
  encontro: string
  local: string
  escola: string
  n: number
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
  idadeTab: { faixa: string; afeta: number; avontade: number; confia: number; n: number; hl?: boolean }[]
  bairroAfeta: { b: string; afeta: number; nunca: string; hl?: boolean }[]
  silencio: { mudo: number; nMudo: number; fala: number; nFala: number }
  infoGap: { naoSabiaPct: number; nuncaPct: number; naoSabiaN: number; naoSabiaNunca: number }
}

export const OZIEL: Cohort = {
  id: "oziel",
  encontro: "Encontro 01",
  local: "Parque Oziel",
  escola: "território / sede do projeto",
  n: 30,
  data: "jun · 2026",
  resumo: "O berço do projeto. Mais novos (53% têm 12–13). A esperança ainda lidera o sentimento — por pouco.",
  bairros: [["Parque Oziel", 10], ["Jardim Monte Cristo", 8], ["Gleba B", 5], ["Outro bairro", 4], ["Jardim do Lago", 2], ["Campo Grande", 1]],
  idades: [["12–13", 16], ["16–17", 6], ["18+", 5], ["14–15", 3]],
  publica: { pct: 70, abs: "21 de 30" },
  sentimentos: [["vontade de mudar algo", 11], ["não é pra mim", 9], ["curiosidade", 8], ["raiva / nojo", 2], ["medo de falar errado", 2], ["distante de mim", 2], ["desânimo", 1]],
  afasta: [["não muda nada", 9], ["é tudo corrupto", 6], ["não entendo do assunto", 6], ["medo de me expor", 5], ["nada me afasta", 4], ["ninguém escuta jovem", 4], ["não tenho tempo", 1], ["sem resposta", 4]],
  participou: [["nunca", 19], ["às vezes", 6], ["sempre que dá", 4], ["uma vez", 1]],
  onde: [["TikTok / Insta", 10], ["não discuto", 9], ["amigos", 6], ["WhatsApp da família", 5], ["escola", 5], ["na rua / bairro", 2], ["igreja", 1]],
  sabia: [["não sabia que dava", 14], ["sabia mas nunca fui", 9], ["sem resposta", 5], ["sabia e já fui", 2]],
  escalas: { afeta: 2.89, avontade: 2.68, confia: 2.12 },
  corr: { afetaVoz: 0.52, confiaVoz: -0.03, confiaAfeta: -0.04 },
  idadeTab: [
    { faixa: "12–13", afeta: 2.73, avontade: 2.67, confia: 2.20, n: 16 },
    { faixa: "14–15", afeta: 2.67, avontade: 2.33, confia: 2.00, n: 3 },
    { faixa: "16–17", afeta: 2.67, avontade: 3.00, confia: 1.67, n: 6, hl: true },
    { faixa: "18+", afeta: 4.00, avontade: 2.50, confia: 2.67, n: 5 },
  ],
  bairroAfeta: [
    { b: "Jardim Monte Cristo", afeta: 2.0, nunca: "7/8", hl: true },
    { b: "Parque Oziel (sede)", afeta: 2.7, nunca: "4/10" },
    { b: "Gleba B", afeta: 3.0, nunca: "4/5" },
    { b: "Jardim do Lago", afeta: 4.0, nunca: "0/2" },
    { b: "Outro bairro", afeta: 4.33, nunca: "3/4" },
  ],
  silencio: { mudo: 2.11, nMudo: 9, fala: 2.76, nFala: 17 },
  infoGap: { naoSabiaPct: 47, nuncaPct: 63, naoSabiaN: 14, naoSabiaNunca: 10 },
}

export const RUI: Cohort = {
  id: "rui",
  encontro: "Encontro 02",
  local: "EE Rui Rodrigues",
  escola: "escola estadual · Campo Grande",
  n: 44,
  data: "26 jun · 2026",
  resumo: "Outra escola, outra psicologia. Mais velhos (61% têm 16–17). Aqui a alienação ('não é pra mim') passa a esperança pela primeira vez.",
  bairros: [["Campo Grande", 32], ["Outro bairro", 11], ["sem resposta", 1]],
  idades: [["16–17", 27], ["14–15", 12], ["18+", 3], ["sem resposta", 2]],
  publica: { pct: 91, abs: "40 de 44" },
  sentimentos: [["não é pra mim", 15], ["vontade de mudar algo", 13], ["curiosidade", 13], ["distante de mim", 9], ["raiva / nojo", 6], ["medo de falar errado", 5], ["desânimo", 4]],
  afasta: [["não muda nada", 18], ["não entendo do assunto", 15], ["ninguém escuta jovem", 11], ["é tudo corrupto", 10], ["medo de me expor", 5], ["não tenho tempo", 3], ["nada me afasta", 1]],
  participou: [["nunca", 32], ["às vezes", 6], ["uma vez", 4], ["sempre que dá", 1]],
  onde: [["não discuto", 17], ["TikTok / Insta", 16], ["escola", 11], ["amigos", 10], ["WhatsApp da família", 4], ["na rua / bairro", 4]],
  sabia: [["não sabia que dava", 21], ["sabia mas nunca fui", 18], ["sabia e já fui", 1], ["sem resposta", 1]],
  escalas: { afeta: 3.28, avontade: 2.95, confia: 1.88 },
  corr: { afetaVoz: 0.21, confiaVoz: 0.22, confiaAfeta: 0.18 },
  idadeTab: [
    { faixa: "14–15", afeta: 3.42, avontade: 2.36, confia: 1.36, n: 12, hl: true },
    { faixa: "16–17", afeta: 3.11, avontade: 3.12, confia: 2.08, n: 27 },
    { faixa: "18+", afeta: 4.33, avontade: 4.00, confia: 2.00, n: 3 },
  ],
  bairroAfeta: [
    { b: "Outro bairro", afeta: 2.45, nunca: "9/11", hl: true },
    { b: "Campo Grande", afeta: 3.56, nunca: "23/32" },
  ],
  silencio: { mudo: 2.47, nMudo: 17, fala: 3.30, nFala: 23 },
  infoGap: { naoSabiaPct: 51, nuncaPct: 73, naoSabiaN: 21, naoSabiaNunca: 17 },
}

export const COHORTS = [OZIEL, RUI] as const

// Avaliação pós-encontro (auto-relato) — só Rui Rodrigues tem no banco.
export const AVALIACAO = {
  n: 31,
  local: "EE Rui Rodrigues",
  cards: [
    { l: "o medo de falar diminuiu", pct: 84, n: "26 de 31", nota: "só 5 saíram iguais", cor: "verde" },
    { l: "mais vontade de participar", pct: 55, n: "17 de 31", nota: "2 saíram com menos", cor: "laranja" },
    { l: "mais confiança pra falar", pct: 45, n: "14 de 31", nota: "só 1 saiu com menos", cor: "amarelo" },
  ],
  perfil: { genero: "58% mulheres cis", idade: "65% 16–17", raca: "65% pretas e pardas" },
  // o que os jovens JÁ entendem como política (concepção pós-oficina)
  politica: [["votar nas eleições", 22], ["cobrar vereador / prefeitura", 20], ["mutirão ou ação no bairro", 16], ["discutir a escola e propor", 15], ["organizar coletivo com a galera", 14], ["falar de problemas com amigos", 14], ["reclamar de buraco / falta de luz", 13]] as Par[],
  dificulta: [["gente não conversa com quem pensa diferente", 11], ["falta informação de como participar", 11], ["falta tempo", 10], ["dificuldade de falar nesses espaços", 9]] as Par[],
}

// vozes livres (o que faria participar) — texto curado das fichas
export const VOZES = ["se tivesse menos lixo", "ter parquinho conservado", "aula de vôlei", "aula de canto", "liberar o celular", "lutaria mais por moradia"]

export const TOTAIS = { fichas: OZIEL.n + RUI.n, encontros: 2, avaliacoes: AVALIACAO.n }
