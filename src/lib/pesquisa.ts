// Pesquisa inicial (baseline) — definição data-driven, espelha lib/avaliacao.ts.
// Fonte única das perguntas pra: form público (futuro) e tela de cadastro do
// admin (transcrição das fichas de papel). Editar conteúdo aqui, não no JSX.
//
// "não respondeu" NÃO é opção aqui: é estado da resposta (branco = null no banco).
// A agregação (/api/dados) deriva a taxa de não-resposta = total − respondidas.

import { BAIRROS } from "@/lib/bairros"

export type TipoCampo = "single" | "multi" | "escala" | "texto"

export interface CampoPergunta {
  id: string                 // = coluna na tabela `formularios`
  tipo: TipoCampo
  label: string
  opcoes?: string[]          // single | multi
  esq?: string               // escala: rótulo esquerdo (valor 1)
  dir?: string               // escala: rótulo direito (valor 5)
  ajuda?: string             // legenda (ex: "marca quantas quiser")
  adminOnly?: boolean        // texto livre: nunca vai pro dashboard público
}

export const PESQUISA_INICIAL: CampoPergunta[] = [
  { id: "bairro", tipo: "single", label: "de onde é?", opcoes: BAIRROS },
  { id: "faixa_idade", tipo: "single", label: "idade", opcoes: ["12–13", "14–15", "16–17", "18+"] },
  { id: "estuda", tipo: "single", label: "estuda?", opcoes: ["escola pública", "escola particular", "curso técnico", "não estudo agora"] },
  {
    id: "sentimentos", tipo: "multi", ajuda: "marca quantas quiser",
    label: "quando o assunto é política, sente…",
    opcoes: ["distante de mim", "não é pra mim", "raiva / nojo", "desânimo", "curiosidade", "vontade de mudar algo", "medo de falar errado"],
  },
  { id: "afeta_vida", tipo: "escala", label: "“política afeta minha vida no dia a dia”", esq: "discordo", dir: "concordo" },
  { id: "avontade_opinar", tipo: "escala", label: "“me sinto à vontade pra dar minha opinião sobre política”", esq: "nada", dir: "muito" },
  { id: "confia_eleitos", tipo: "escala", label: "“dá pra confiar em quem é eleito”", esq: "discordo", dir: "concordo" },
  {
    id: "afasta", tipo: "multi", ajuda: "marca quantas quiser",
    label: "o que mais afasta de participar?",
    opcoes: ["não entendo do assunto", "é tudo corrupto", "não muda nada", "medo de me expor", "ninguém escuta jovem", "não tenho tempo", "nada me afasta"],
  },
  { id: "ja_participou", tipo: "single", label: "já participou de algo pra mudar o bairro?", opcoes: ["nunca", "uma vez", "às vezes", "sempre que dá"] },
  {
    id: "onde_discute", tipo: "multi", ajuda: "marca quantas quiser",
    label: "onde vê/discute política?",
    opcoes: ["WhatsApp da família", "TikTok / Insta", "escola", "amigos", "igreja", "na rua / bairro", "não discuto"],
  },
  { id: "sabia_participar", tipo: "single", label: "sabia que dá pra participar de decisão do bairro?", opcoes: ["sabia e já fui", "sabia mas nunca fui", "não sabia que dava"] },
  { id: "texto_participar", tipo: "texto", label: "o que faria querer participar mais? (opcional)", adminOnly: true },
  { id: "texto_duvida", tipo: "texto", label: "uma dúvida sobre política/eleição (opcional)", adminOnly: true },
]

// momentos de aplicação — vira tag `momento` na linha (separa baseline × fim de jogo)
export const MOMENTOS: { value: string; label: string }[] = [
  { value: "inicio", label: "início (antes do jogo)" },
  { value: "fim_jogo", label: "fim do jogo" },
  { value: "completa", label: "página /pesquisa" },
]
