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
  video_url?: string    // vídeo da PÍLULA, exibido DEPOIS da escolha (não é o meme)
  meme_imagem?: string  // imagem do próprio meme, exibida NO card
  meme_video?: string   // vídeo do próprio meme, exibido NO card (tem prioridade sobre imagem)
  fase?: 1 | 2          // 1 = sempre disponível · 2 = pós-oficina (desbloqueado por código)
  espelho_de?: string   // id do dilema da fase 1 que este repete (para o sistema de mirror)
  importado?: boolean   // veio do pipeline ozielmemes via /dilemas_importados.json
}

export const MODULO_COR: Record<string, string> = {
  "participação": "#26C79A",
  "participacao": "#26C79A",
  "desinformação": "#E8402F",
  "desinformacao": "#E8402F",
  "eleição": "#3B82F6",
  "eleicao": "#3B82F6",
  "território": "#FFD21E",
  "territorio": "#FFD21E",
}

export const dilemas: Dilema[] = [
  {
    id: "d01",
    modulo: "participação",
    meme: '"Vereador é tudo ladrão, nem adianta votar"',
    contexto_oculto:
      "A creche do Parque Oziel vai fechar por falta de verba. A câmara votou ontem. Nenhum morador do bairro foi à audiência pública marcada há três semanas. O vereador que poderia ter salvado a verba perdeu por dois votos.",
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

  // ── Fase 2: pós-oficina — desbloqueados com código do encontro ───────────

  {
    id: "d04b",
    fase: 2,
    espelho_de: "d04",
    modulo: "eleição",
    meme: '"Depois do que vi hoje, ainda acho que política não é pra mim?"',
    contexto_oculto:
      "A facilitadora trouxe o caso real: 480 votos elegeram o vereador que fechou o posto. Vocês são mais de 3.000 jovens nesse bairro. A conta não fecha — a menos que a gente apareça.",
    pilula_sabedoria:
      "Não é sobre gostar de política. É sobre decidir quem decide pela sua vida.",
    fonte: "TSE — resultado eleições 2024 Campinas",
    verificacao_status: "enganoso",
    dificuldade: 2,
  },
  {
    id: "d01b",
    fase: 2,
    espelho_de: "d01",
    modulo: "participação",
    meme: '"Bom, depois da conversa de hoje, ainda acho que nem adianta ir?"',
    contexto_oculto:
      "A creche do Parque Oziel fechou por dois votos. O encontro de hoje mostrou que presença física em audiência pública tem peso de lei — e que 200 assinaturas não substituem três pessoas na sala.",
    pilula_sabedoria:
      "A mudança não precisa de todo mundo. Precisa de você — que agora já sabe disso.",
    fonte: "Câmara Municipal de Campinas",
    verificacao_status: "enganoso",
    dificuldade: 2,
  },
]
