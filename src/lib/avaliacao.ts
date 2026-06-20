// Avaliação pós-encontro (pesquisa FIM) — definição data-driven.
// Importada do Google Form "Avaliação: Vozes do Oziel" e convertida pro nosso
// modelo (pills / marca-várias / texto). E-mail REMOVIDO de propósito: o app é
// anônimo (LGPD — participantes menores). Idade vira faixa pra agregar sem
// identificar. O renderer (AvaliacaoForm) só lê deste array — zero texto preso
// em componente. Editar conteúdo aqui, não no JSX.

export type TipoPergunta = "single" | "multi" | "texto"

export interface Pergunta {
  id: string              // = coluna na tabela `avaliacoes`
  tipo: TipoPergunta
  label: string
  obrigatoria?: boolean
  opcoes?: string[]       // single | multi
  placeholder?: string    // texto
  ajuda?: string          // legenda auxiliar (ex: "marca quantas quiser")
}

export const AVALIACAO_INTRO =
  "Conta pra gente como foi o encontro de hoje. É anônimo — tua resposta ajuda a melhorar a oficina pra próxima galera."

export const AVALIACAO: Pergunta[] = [
  {
    id: "genero",
    tipo: "single",
    label: "Com qual gênero você se identifica?",
    obrigatoria: true,
    opcoes: ["mulher cis", "mulher trans", "homem cis", "homem trans", "pessoa não binária", "prefiro não responder"],
  },
  {
    id: "faixa_idade",
    tipo: "single",
    label: "Sua idade",
    obrigatoria: true,
    opcoes: ["12–13", "14–15", "16–17", "18+"],
  },
  {
    id: "raca",
    tipo: "single",
    label: "Sua cor / raça",
    obrigatoria: true,
    opcoes: ["preta", "parda", "branca", "amarela", "indígena"],
  },
  {
    id: "dificulta",
    tipo: "multi",
    label: "O que dificulta teu acesso aos espaços de participação política na cidade?",
    ajuda: "marca quantas quiser",
    obrigatoria: true,
    opcoes: [
      "me falta tempo pra participar",
      "me falta grana pra transporte e comida",
      "me falta informação de como participar",
      "é difícil chegar nos locais (transporte)",
      "acho a linguagem desses espaços difícil",
      "sinto falta de grupo/coletivo que eu me identifique",
      "tenho dificuldade de falar minha opinião nesses espaços",
      "não acredito na política",
      "desanimo por causa da corrupção",
      "desanimo porque as pessoas não conseguem mais conversar com opinião diferente",
    ],
  },
  {
    id: "confianca_falar",
    tipo: "single",
    label: "Depois do encontro de hoje, como você se sente pra falar o que pensa sobre política?",
    obrigatoria: true,
    opcoes: ["bem mais confiante que antes", "um pouco mais confiante", "igual a antes", "menos confiante", "bem menos confiante"],
  },
  {
    id: "o_que_e_politica",
    tipo: "multi",
    label: "Pra você, quais dessas coisas são política?",
    ajuda: "marca quantas quiser",
    obrigatoria: true,
    opcoes: [
      "votar nas eleições",
      "cobrar o vereador ou a prefeitura por uma melhoria",
      "reclamar de buraco na rua ou falta de iluminação",
      "participar de um mutirão ou ação no bairro",
      "organizar um evento ou coletivo com a galera",
      "discutir os problemas da escola e propor mudanças",
      "falar dos problemas da cidade com amigos e família",
    ],
  },
  {
    id: "vontade_participar",
    tipo: "single",
    label: "Depois desse encontro, ficou com vontade de saber mais ou participar de algo sobre política no bairro ou na escola?",
    obrigatoria: true,
    opcoes: ["sim, fiquei com muito mais vontade", "um pouco mais de vontade", "igual a antes", "um pouco menos de vontade", "muito menos vontade"],
  },
  {
    id: "diminui_medo",
    tipo: "single",
    label: "Você acha que encontros de formação política como este diminuem o medo de conversar sobre política?",
    obrigatoria: true,
    opcoes: ["diminui muito", "diminui", "diminui um pouco", "não diminui"],
  },
  {
    id: "por_que",
    tipo: "texto",
    label: "Por quê?",
    obrigatoria: true,
    placeholder: "escreve do teu jeito…",
  },
  {
    id: "te_marcou",
    tipo: "texto",
    label: "O que te marcou hoje? Pode ser um meme, um assunto ou algo que você não sabia:",
    obrigatoria: true,
    placeholder: "o que ficou na tua cabeça…",
  },
  {
    id: "mudaria",
    tipo: "texto",
    label: "O que você mudaria nessa oficina pra ela ficar melhor pra galera?",
    obrigatoria: true,
    placeholder: "manda a real…",
  },
]

// Campos de texto livre — nunca expostos no dashboard público (/dados). Só admin.
export const CAMPOS_TEXTO_LIVRE = AVALIACAO.filter((p) => p.tipo === "texto").map((p) => p.id)
