export interface Dilema {
  id: string
  modulo: string
  meme: string
  contexto_oculto: string
  fonte: string
}

export const dilemas: Dilema[] = [
  {
    id: "d01",
    modulo: "participação",
    meme: '“Vereador é tudo ladrão, nem adianta votar”',
    contexto_oculto:
      "A creche do Jardim Oziel vai fechar por falta de verba. A câmara votou ontem. Nenhum morador do bairro foi à audiência pública marcada há três semanas. O vereador que poderia ter salvado a verba perdeu por dois votos.",
    fonte: "Câmara Municipal de Campinas",
  },
  {
    id: "d02",
    modulo: "desinformação",
    meme: '“Compartilha aí — o governo vai cortar o Bolsa Família semana que vem!”',
    contexto_oculto:
      "Sua tia acreditou, ficou com medo e parou de votar. O benefício não foi cortado. Mas a desinformação elegeu um vereador que depois votou contra a UBS do bairro. Agora ela precisa pegar dois ônibus para consulta.",
    fonte: "Agência Lupa / IBGE Campinas",
  },
  {
    id: "d03",
    modulo: "território",
    meme: '“Audiência pública é coisa de adulto chato, não muda nada mesmo”',
    contexto_oculto:
      "A proposta de construir uma quadra esportiva no Oziel foi rejeitada por falta de quórum. Compareceram 3 moradores. 200 assinaturas de apoio foram entregues, mas o regimento exige presença física. A quadra não foi feita.",
    fonte: "Câmara Municipal de Campinas — ata 14/2025",
  },
  {
    id: "d04",
    modulo: "eleição",
    meme: '“Política não é pra mim, prefiro ficar fora disso”',
    contexto_oculto:
      "O vereador que aprovou o fechamento do posto de saúde do Oziel foi eleito com 480 votos. No bairro moram mais de 3.000 jovens que não votaram porque “política não é pra mim”. A diferença de votos era menor que isso.",
    fonte: "TSE — resultado eleições 2024 Campinas",
  },
]
