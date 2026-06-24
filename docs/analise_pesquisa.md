# Análise da Pesquisa — Vozes do Oziel

### Munição de apresentação (dia 31) · leitura estilo Freakonomics

> Este documento é o **roteiro de análise**: cada achado tem (a) a pergunta de fundo,
> (b) os campos exatos a cruzar, (c) como ler, (d) uma frase pronta pro slide, e
> (e) a armadilha de honestidade. Os números entram quando a transcrição fechar —
> os espaços `⟦N⟧` são pra preencher com o dado real.

---

## 0. De onde vem cada número

| Fonte | O que tem | Como pegar |
|---|---|---|
| **Painel público** `/api/dados` | agregados anônimos (contagens, médias, **não-resposta**) | abre `/dados` ou baixa o JSON |
| **Pesquisa inicial** (linha a linha) | `formularios` — todos os campos + `momento` | aba 📋 Pesquisa no `/admin` (`GET /api/admin/formularios`) |
| **Avaliação** (linha a linha) | `avaliacoes` — todos os campos | `GET /api/admin/avaliacao` |

> Os **cruzamentos** abaixo (idade × medo etc.) precisam de dado **linha a linha** —
> não dá só com o agregado público. Use os endpoints admin. Cada linha é uma ficha.

**Princípio que sustenta tudo:** branco é dado. A taxa de não-resposta por pergunta
é métrica de primeira classe, não nota de rodapé. E pré×pós é **cross-section anônimo**
(grupo antes × grupo depois), nunca painel individual.

---

## 1. O abismo percepção × ação  ⭐ (achado-âncora)

- **Pergunta de fundo:** a juventude *sabe* que política importa mas *não* age?
- **Cruzar:** `formularios.afeta_vida` (escala 1–5) × `formularios.ja_participou`.
- **Como ler:** % de fichas com `afeta_vida ≥ 4` **e** `ja_participou = "nunca"`. Esse é
  o tamanho do abismo: consciência alta, participação zero.
- **Frase-slide:** *"⟦N⟧% concordam que política afeta a vida deles — mas ⟦N⟧% desses
  nunca participaram de nada no bairro. O problema não é consciência, é porta de entrada."*
- **Armadilha:** se `afeta_vida` tiver muita não-resposta, reporte o denominador real.

---

## 2. Mapa do desconforto (não-resposta como sinal)

- **Pergunta de fundo:** qual tema faz a caneta travar?
- **Cruzar:** taxa de não-resposta por pergunta (já calculada no `/api/dados`), ranqueada.
- **Como ler:** as perguntas com mais branco. Hipótese: `confia_eleitos` e
  `avontade_opinar` lideram — desconforto, não preguiça (perguntas vizinhas respondidas).
- **Frase-slide:** *"A pergunta que mais ficou em branco foi ⟦pergunta⟧ (⟦N⟧% não
  responderam). O silêncio também é resposta."*
- **Armadilha:** separe não-resposta real de "não foi perguntado" — campos só-completa
  não aparecem na ficha curta (já tratado no cálculo, ciente de `momento`).

---

## 3. Idade × medo de falar

- **Pergunta de fundo:** os mais novos se calam mais?
- **Cruzar:** `formularios.faixa_idade` × sentimento `"medo de falar errado"` em
  `formularios.sentimentos[]` (e, no pós, `avaliacoes.faixa_idade` × `diminui_medo`).
- **Como ler:** % que marca "medo de falar errado" por faixa (12–13, 14–15, 16–17, 18+).
  Curva crescente ou decrescente conta uma história sobre onde a oficina mais alivia.
- **Frase-slide:** *"Entre os de ⟦faixa⟧, ⟦N⟧% sentiam medo de falar errado — a faixa
  onde o encontro mais derrubou essa barreira."*
- **Armadilha:** faixas com poucas fichas (ex: 18+) — marque "amostra pequena", não afirme.

---

## 4. Geografia da (des)mobilização — bairro

- **Pergunta de fundo:** onde a juventude já se organiza e onde está isolada?
- **Cruzar:** `formularios.bairro` × `ja_participou` × `afasta[]`.
- **Como ler:** participação prévia por bairro, e qual barreira domina em cada um
  ("não muda nada" vs "ninguém escuta jovem" vs "não tenho tempo" desenham causas distintas).
- **Frase-slide:** *"No ⟦bairro⟧, ⟦N⟧% nunca participaram e a barreira nº1 é ⟦afasta⟧ —
  desmobilização com endereço."*
- **Armadilha:** bairro costuma ter cauda longa de poucas fichas; agrupe os raros em "outros".

---

## 5. O que é "política" pra eles (efeito formativo)

- **Pergunta de fundo:** o encontro **alargou** a ideia de política?
- **Ler:** `avaliacoes.o_que_e_politica[]` — quantos marcam só "votar nas eleições" vs
  quantos incluem ação cotidiana (mutirão, cobrar prefeitura, organizar a galera).
- **Frase-slide:** *"Depois do encontro, ⟦N⟧% já enxergam política no dia a dia — não só
  na urna. Política deixou de ser distante e virou cotidiano."*
- **Armadilha:** sem baseline idêntico da mesma pergunta; enquadre como "estado pós", não delta.

---

## 6. Confiança em eleitos × vontade de participar

- **Pergunta de fundo:** desconfiança no sistema mata a vontade de agir — ou não?
- **Cruzar:** `formularios.confia_eleitos` (1–5) × `avontade_opinar` (1–5).
- **Como ler:** correlação. Surpresa freakonomics se for **fraca/nula**: quem não confia
  em eleito ainda quer opinar → a energia existe apesar da descrença no sistema.
- **Frase-slide:** *"Confiança em eleitos é baixa (média ⟦N⟧/5), mas a vontade de opinar
  não acompanha a queda — a juventude desacredita do sistema, não da própria voz."*
- **Armadilha:** correlação ≠ causa; só descreva o padrão.

---

## 7. Onde discutem × disposição (canais)

- **Pergunta de fundo:** por onde entra a conversa política — e isso muda o engajamento?
- **Cruzar:** `formularios.onde_discute[]` × `avontade_opinar` / `ja_participou`.
- **Como ler:** quem discute "na rua/bairro" ou "escola" participa mais que quem só vê em
  "TikTok/Insta"? Canal presencial vs digital × ação real.
- **Frase-slide:** *"Quem debate política no espaço físico do bairro participa ⟦N⟧× mais
  que quem só consome no feed."*

---

## Pré × Depois — os pares (resumo)

| Construto | Antes (`formularios`) | Depois (`avaliacoes`) |
|---|---|---|
| Falar o que pensa | `avontade_opinar` (1–5) | `confianca_falar` + `vontade_participar` |
| Medo de falar | sentimento "medo de falar errado" | `diminui_medo` |
| Barreiras | `afasta[]` | `dificulta[]` |
| Demografia comparável | `faixa_idade` | `faixa_idade` |

> Só `faixa_idade` cruza nos dois instrumentos. Gênero/raça só existem no pós →
> servem pra perfilar a turma do encontro, não pra comparar antes/depois.

---

## Checklist de honestidade (pra não furar na apresentação)

- [ ] Todo % com o **denominador** ao lado (e quanto foi não-resposta).
- [ ] "Antes × depois" sempre rotulado **comparação de grupo**, não de pessoa.
- [ ] Amostra pequena (< ⟦definir corte⟧ fichas) → "indício", não "conclusão".
- [ ] Texto livre nunca citado de forma que identifique alguém (anonimato de menor).
- [ ] Correlação descrita como padrão, nunca como causa.

---

*Vozes do Oziel · Grupo Diálogos · CriaLab · dados abertos CC BY-SA 4.0*
