export interface Dilema {
  id: string
  modulo: string
  meme: string
  contexto_oculto: string
  pilula_sabedoria: string
  fonte: string
  verificacao_status?: "falso" | "enganoso" | "contexto_ausente" | "verdadeiro"
  dificuldade?: 1 | 2 | 3
  impacto_real?: string
}

export const MODULO_COR: Record<string, string> = {
  "participação": "#2DD4A0",
  "participacao": "#2DD4A0",
  "desinformação": "#E84040",
  "desinformacao": "#E84040",
  "eleição": "#3B82F6",
  "eleicao": "#3B82F6",
  "território": "#F59E0B",
  "territorio": "#F59E0B",
}

export const dilemas: Dilema[] = [
  {
    id: "d01",
    modulo: "participação",
    meme: '"Vereador é tudo ladrão, nem adianta votar"',
    contexto_oculto:
      "A creche do Jardim Oziel vai fechar por falta de verba. A câmara votou ontem. Nenhum morador do bairro foi à audiência pública marcada há três semanas. O vereador que poderia ter salvado a verba perdeu por dois votos.",
    pilula_sabedoria:
      "Dois votos. Era isso que faltava. Quando o bairro não aparece, alguém aparece no lugar.",
    fonte: "Câmara Municipal de Campinas",
    verificacao_status: "enganoso",
    dificuldade: 1,
  },
  {
    id: "d02",
    modulo: "desinformação",
    meme: '"Compartilha aí — o governo vai cortar o Bolsa Família semana que vem!"',
    contexto_oculto:
      "Sua tia acreditou, ficou com medo e parou de votar. O benefício não foi cortado. Mas a desinformação elegeu um vereador que depois votou contra a UBS do bairro. Agora ela precisa pegar dois ônibus para consulta.",
    pilula_sabedoria:
      "Antes de compartilhar, pergunta: quem se beneficia se eu acreditar nisso?",
    fonte: "Agência Lupa / IBGE Campinas",
    verificacao_status: "falso",
    dificuldade: 1,
  },
  {
    id: "d03",
    modulo: "território",
    meme: '"Audiência pública é coisa de adulto chato, não muda nada mesmo"',
    contexto_oculto:
      "A proposta de construir uma quadra esportiva no Oziel foi rejeitada por falta de quórum. Compareceram 3 moradores. 200 assinaturas de apoio foram entregues, mas o regimento exige presença física. A quadra não foi feita.",
    pilula_sabedoria:
      "200 assinaturas. 3 pessoas. A quadra não foi feita. O espaço é seu — mas precisa aparecer.",
    fonte: "Câmara Municipal de Campinas — ata 14/2025",
    verificacao_status: "enganoso",
    dificuldade: 2,
  },
  {
    id: "d04",
    modulo: "eleição",
    meme: '"Política não é pra mim, prefiro ficar fora disso"',
    contexto_oculto:
      "O vereador que aprovou o fechamento do posto de saúde do Oziel foi eleito com 480 votos. No bairro moram mais de 3.000 jovens que não votaram porque \"política não é pra mim\". A diferença de votos era menor que isso.",
    pilula_sabedoria:
      "Ficar fora da política é uma escolha. Só que o posto fechou do mesmo jeito — com ou sem você.",
    fonte: "TSE — resultado eleições 2024 Campinas",
    verificacao_status: "enganoso",
    dificuldade: 1,
  },
]
