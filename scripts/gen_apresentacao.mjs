// ────────────────────────────────────────────────────────────────────────────
// GERADOR DOS DADOS DA APRESENTAÇÃO  ·  Vozes do Oziel
//
// Recalcula TODOS os números de /apresentacao direto do banco (formularios +
// avaliacoes — NUNCA lexbr_* nem outra tabela) e grava:
//   · src/lib/apresentacao_stats.json   (números puros, consumidos pelo .ts)
//   · docs/apresentacao_stats.json       (cópia p/ auditoria)
//   · public/exports/ozipa_*.{csv,json}  (microdados PÚBLICOS, SEM texto livre)
//
// Espelha a lógica de src/app/api/dados/route.ts (tally/escala/fezCompleta) pra
// os números baterem entre /apresentacao, /dados e o export.
//
// Rodar:  node --env-file=.env.local scripts/gen_apresentacao.mjs
// ────────────────────────────────────────────────────────────────────────────
import { createClient } from "@supabase/supabase-js"
import { writeFileSync, mkdirSync } from "fs"

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

// ── helpers de agregação (iguais ao route.ts) ──────────────────────────────
const SEM = "sem resposta" // rótulo do bucket de não-resposta na apresentação
const fezCompleta = (r) => r.momento !== "fim_jogo" && r.momento !== "curta"

// tally → Par[] ordenado desc, "sem resposta" sempre por último
function tallyPar(rows, campo, aplicavel) {
  const out = {}
  let sem = 0
  for (const r of rows) {
    if (aplicavel && !aplicavel(r)) continue
    const v = r[campo]
    if (typeof v === "string" && v) out[v] = (out[v] ?? 0) + 1
    else sem++
  }
  const pares = Object.entries(out).sort((a, b) => b[1] - a[1])
  if (sem) pares.push([SEM, sem])
  return pares
}
function tallyArrPar(rows, campo, aplicavel) {
  const out = {}
  let sem = 0
  for (const r of rows) {
    if (aplicavel && !aplicavel(r)) continue
    const v = r[campo]
    if (Array.isArray(v) && v.length) for (const it of v) { if (typeof it === "string") out[it] = (out[it] ?? 0) + 1 }
    else sem++
  }
  const pares = Object.entries(out).sort((a, b) => b[1] - a[1])
  if (sem) pares.push([SEM, sem])
  return pares
}
function media(rows, campo, aplicavel) {
  let soma = 0, n = 0
  for (const r of rows) {
    if (aplicavel && !aplicavel(r)) continue
    const v = r[campo]
    if (typeof v === "number") { soma += v; n++ }
  }
  return n ? +(soma / n).toFixed(2) : null
}
function contar(rows, pred) { let n = 0; for (const r of rows) if (pred(r)) n++; return n }

// Pearson sobre pares completos (ambos não-nulos). Retorna {r, n}.
function pearson(rows, cx, cy) {
  const xs = [], ys = []
  for (const r of rows) {
    const x = r[cx], y = r[cy]
    if (typeof x === "number" && typeof y === "number") { xs.push(x); ys.push(y) }
  }
  const n = xs.length
  if (n < 3) return { r: null, n }
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n
  let sxy = 0, sxx = 0, syy = 0
  for (let i = 0; i < n; i++) { const dx = xs[i] - mx, dy = ys[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy }
  if (sxx === 0 || syy === 0) return { r: null, n }
  return { r: +(sxy / Math.sqrt(sxx * syy)).toFixed(2), n }
}

const PUBLICA = "escola pública"
const FAIXAS = ["12–13", "14–15", "16–17", "18+"]

// ── monta um cohort a partir das fichas do recorte ─────────────────────────
function cohort(rows) {
  const n = rows.length
  const compl = rows.filter(fezCompleta)
  const escalas = {
    afeta: media(rows, "afeta_vida"),
    avontade: media(compl, "avontade_opinar"),
    confia: media(compl, "confia_eleitos"),
  }
  const corr = {
    afetaVoz: pearson(compl, "afeta_vida", "avontade_opinar"),
    confiaVoz: pearson(compl, "confia_eleitos", "avontade_opinar"),
    confiaAfeta: pearson(compl, "confia_eleitos", "afeta_vida"),
  }
  // idadeTab — por faixa
  const idadeTab = FAIXAS.map((faixa) => {
    const sub = rows.filter((r) => r.faixa_idade === faixa)
    const subC = sub.filter(fezCompleta)
    return { faixa, afeta: media(sub, "afeta_vida"), avontade: media(subC, "avontade_opinar"), confia: media(subC, "confia_eleitos"), n: sub.length }
  }).filter((t) => t.n > 0)
  // bairroAfeta — por bairro (>=2 fichas), ordenado por afeta asc
  const bairros = [...new Set(rows.map((r) => r.bairro).filter(Boolean))]
  const bairroAfeta = bairros.map((b) => {
    const sub = rows.filter((r) => r.bairro === b)
    const nunca = contar(sub, (r) => r.ja_participou === "nunca")
    return { b, afeta: media(sub, "afeta_vida"), nunca: `${nunca}/${sub.length}`, _n: sub.length }
  }).filter((x) => x._n >= 2).sort((a, b) => (a.afeta ?? 9) - (b.afeta ?? 9)).map(({ _n, ...x }) => x)
  // silêncio — por onde_discute (mudo = "não discuto"; fala = ≥1 lugar real)
  const mudoRows = compl.filter((r) => Array.isArray(r.onde_discute) && r.onde_discute.includes("não discuto"))
  const falaRows = compl.filter((r) => Array.isArray(r.onde_discute) && r.onde_discute.some((x) => x !== "não discuto"))
  const silencio = {
    mudo: media(mudoRows, "avontade_opinar"), nMudo: mudoRows.length,
    fala: media(falaRows, "avontade_opinar"), nFala: falaRows.length,
  }
  // infoGap
  const sabiaResp = compl.filter((r) => typeof r.sabia_participar === "string" && r.sabia_participar)
  const naoSabiaN = contar(rows, (r) => r.sabia_participar === "não sabia que dava")
  const naoSabiaNunca = contar(rows, (r) => r.sabia_participar === "não sabia que dava" && r.ja_participou === "nunca")
  const infoGap = {
    naoSabiaPct: sabiaResp.length ? Math.round((100 * naoSabiaN) / sabiaResp.length) : 0,
    nuncaPct: n ? Math.round((100 * contar(rows, (r) => r.ja_participou === "nunca")) / n) : 0,
    naoSabiaN, naoSabiaNunca,
  }
  const pubN = contar(rows, (r) => r.estuda === PUBLICA)
  return {
    n,
    completas: compl.length,
    bairros: tallyPar(rows, "bairro"),
    idades: tallyPar(rows, "faixa_idade"),
    publica: { pct: n ? Math.round((100 * pubN) / n) : 0, abs: `${pubN} de ${n}` },
    sentimentos: tallyArrPar(rows, "sentimentos"),
    afasta: tallyArrPar(rows, "afasta", fezCompleta),
    participou: tallyPar(rows, "ja_participou"),
    onde: tallyArrPar(rows, "onde_discute", fezCompleta),
    sabia: tallyPar(rows, "sabia_participar", fezCompleta),
    escalas, corr, idadeTab, bairroAfeta, silencio, infoGap,
  }
}

// ── avaliação pós (só Rui) ─────────────────────────────────────────────────
function avaliacaoStats(avals) {
  const n = avals.length
  const pct = (pred) => (n ? Math.round((100 * contar(avals, pred)) / n) : 0)
  const abs = (pred) => `${contar(avals, pred)} de ${n}`
  const medoOk = (r) => r.diminui_medo && r.diminui_medo !== "não diminui"
  const vontadeOk = (r) => r.vontade_participar === "sim, fiquei com muito mais vontade" || r.vontade_participar === "um pouco mais de vontade"
  const confiancaOk = (r) => r.confianca_falar === "bem mais confiante que antes" || r.confianca_falar === "um pouco mais confiante"
  const topPct = (campo) => {
    const t = tallyPar(avals, campo).filter(([k]) => k !== SEM)
    if (!t.length) return null
    return { label: t[0][0], pct: Math.round((100 * t[0][1]) / n) }
  }
  return {
    n,
    cards: {
      medo: { pct: pct(medoOk), abs: abs(medoOk) },
      vontade: { pct: pct(vontadeOk), abs: abs(vontadeOk) },
      confianca: { pct: pct(confiancaOk), abs: abs(confiancaOk) },
    },
    politica: tallyArrPar(avals, "o_que_e_politica"),
    dificulta: tallyArrPar(avals, "dificulta"),
    perfil: { genero: topPct("genero"), idade: topPct("faixa_idade"), raca: topPct("raca") },
  }
}

// ── CSV (BOM UTF-8, tudo entre aspas, arrays juntados por "; ") ─────────────
function toCSV(rows, cols) {
  const esc = (v) => {
    if (v == null) return '""'
    if (Array.isArray(v)) v = v.join("; ")
    return `"${String(v).replace(/"/g, '""')}"`
  }
  const head = cols.map(esc).join(",")
  const body = rows.map((r) => cols.map((c) => esc(r[c])).join(",")).join("\r\n")
  return "﻿" + head + "\r\n" + body + "\r\n"
}

// ── run ────────────────────────────────────────────────────────────────────
const COLS_FORM = ["momento", "bairro", "faixa_idade", "estuda", "sentimentos", "afeta_vida", "avontade_opinar", "confia_eleitos", "afasta", "ja_participou", "onde_discute", "sabia_participar", "criado_em"]
const COLS_AVAL = ["genero", "faixa_idade", "raca", "dificulta", "confianca_falar", "o_que_e_politica", "vontade_participar", "diminui_medo", "criado_em"]

const { data: forms, error: e1 } = await db.from("formularios").select("*").limit(100000)
const { data: avals, error: e2 } = await db.from("avaliacoes").select("*").limit(100000)
if (e1 || e2) { console.error("erro query:", e1?.message, e2?.message); process.exit(1) }

const dia = (r) => r.criado_em.slice(0, 10)
const ozielRows = forms.filter((r) => dia(r) <= "2026-06-25")
const ruiRows = forms.filter((r) => ["2026-06-26", "2026-06-30"].includes(dia(r)))

const stats = {
  gerado_em: new Date().toISOString(),
  fonte: { formularios: forms.length, avaliacoes: avals.length },
  oziel: cohort(ozielRows),
  rui: cohort(ruiRows),
  avaliacao: avaliacaoStats(avals),
  totais: { fichas: ozielRows.length + ruiRows.length, encontros: 2, avaliacoes: avals.length },
}

// grava stats (sem o campo interno gerado_em na cópia de dados? mantém)
mkdirSync("src/lib", { recursive: true })
mkdirSync("docs", { recursive: true })
mkdirSync("public/exports", { recursive: true })
const json = JSON.stringify(stats, null, 2)
writeFileSync("src/lib/apresentacao_stats.json", json)
writeFileSync("docs/apresentacao_stats.json", json)

// exports PÚBLICOS — de-identificados (sem texto livre)
const formPub = forms.map((r) => Object.fromEntries(COLS_FORM.map((c) => [c, r[c]])))
const avalPub = avals.map((r) => Object.fromEntries(COLS_AVAL.map((c) => [c, r[c]])))
writeFileSync("public/exports/ozipa_formularios.json", JSON.stringify(formPub, null, 2))
writeFileSync("public/exports/ozipa_avaliacoes.json", JSON.stringify(avalPub, null, 2))
writeFileSync("public/exports/ozipa_formularios.csv", toCSV(formPub, COLS_FORM))
writeFileSync("public/exports/ozipa_avaliacoes.csv", toCSV(avalPub, COLS_AVAL))

// ── relatório de verificação ───────────────────────────────────────────────
const r2 = (x) => (x == null ? "—" : x)
console.log("✓ gerado", stats.gerado_em)
console.log(`fonte: formularios=${forms.length} avaliacoes=${avals.length}`)
for (const [k, c] of [["OZIEL", stats.oziel], ["RUI", stats.rui]]) {
  console.log(`\n== ${k} == N=${c.n} (completas ${c.completas}) · pública ${c.publica.pct}% (${c.publica.abs})`)
  console.log(`  escalas afeta/avontade/confia: ${r2(c.escalas.afeta)} / ${r2(c.escalas.avontade)} / ${r2(c.escalas.confia)}`)
  console.log(`  corr afetaVoz=${r2(c.corr.afetaVoz.r)}(n${c.corr.afetaVoz.n}) confiaVoz=${r2(c.corr.confiaVoz.r)}(n${c.corr.confiaVoz.n}) confiaAfeta=${r2(c.corr.confiaAfeta.r)}(n${c.corr.confiaAfeta.n})`)
  console.log(`  silencio mudo=${r2(c.silencio.mudo)}(n${c.silencio.nMudo}) fala=${r2(c.silencio.fala)}(n${c.silencio.nFala})`)
  console.log(`  infoGap naoSabia=${c.infoGap.naoSabiaPct}% nunca=${c.infoGap.nuncaPct}% (naoSabiaN=${c.infoGap.naoSabiaN}, naoSabiaNunca=${c.infoGap.naoSabiaNunca})`)
  console.log(`  idadeTab: ${c.idadeTab.map((t) => `${t.faixa}:afeta${r2(t.afeta)}/voz${r2(t.avontade)}/conf${r2(t.confia)}(n${t.n})`).join("  ")}`)
  console.log(`  bairroAfeta: ${c.bairroAfeta.map((b) => `${b.b}:${r2(b.afeta)}(nunca ${b.nunca})`).join("  ")}`)
}
const a = stats.avaliacao
console.log(`\n== AVALIAÇÃO == N=${a.n}`)
console.log(`  medo↓ ${a.cards.medo.pct}% (${a.cards.medo.abs}) · vontade↑ ${a.cards.vontade.pct}% (${a.cards.vontade.abs}) · confiança↑ ${a.cards.confianca.pct}% (${a.cards.confianca.abs})`)
console.log(`  perfil: ${a.perfil.genero?.label} ${a.perfil.genero?.pct}% · ${a.perfil.idade?.label} ${a.perfil.idade?.pct}% · ${a.perfil.raca?.label} ${a.perfil.raca?.pct}%`)
console.log(`\n✓ escritos: src/lib/apresentacao_stats.json, docs/apresentacao_stats.json, public/exports/ozipa_*.{csv,json}`)
