# Componentes — Vozes do Oziel

Todos os componentes ficam em `src/components/`. São client components (`"use client"`) exceto `Logo`.

---

## Logo

**Arquivo**: `src/components/Logo.tsx`
**Tipo**: Server component (puro SVG, sem estado)

Símbolo da marca — balão de fala partido em dois tons com gesto de deslize `‹ ›` no miolo.

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `size` | number | 56 | Largura e altura em pixels |
| `variant` | `"cor" \| "mono" \| "inverso"` | `"cor"` | Esquema de cores |

Variante `cor`: laranja + grafite escuro (uso padrão).
Variante `mono`: grafite claro sobre grafite escuro (impressão, fundo claro).
Variante `inverso`: creme sobre grafite (fundo escuro).

---

## SwipeCard

**Arquivo**: `src/components/SwipeCard.tsx`
**Dependências**: `framer-motion`, `@/lib/dilemas`, `@/lib/sfx`

Card arrastável que representa um dilema/meme político. Implementa a mecânica central de swipe do jogo.

### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `dilema` | `Dilema` | Dados do card a exibir |
| `onSwipe` | `(direction: "right" \| "left") => void` | Callback ao concluir o swipe |
| `isTop` | boolean | Se `true`, habilita o drag; caso contrário o card fica inerte |

### Comportamento

- Threshold de 90px para confirmar o swipe.
- Overlays "CONCORDO" (verde) / "DISCORDO" (vermelho) aparecem proporcionalmente ao arrasto.
- Ao confirmar: vibração haptica (50ms), som sintetizado (`playConcordo` / `playDiscordo`), animação de saída (`flyOff`).
- Conteúdo em ordem de prioridade: `meme_video` > `meme_imagem` > texto estilizado como print de WhatsApp.
- Quando há mídia, o texto `meme` aparece como legenda.

---

## ConsequenceScreen

**Arquivo**: `src/components/ConsequenceScreen.tsx`
**Dependências**: `framer-motion`, `@/lib/dilemas`

Tela exibida após cada swipe, revelando o contexto real que o meme omitia.

### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `dilema` | `Dilema` | Dilema respondido |
| `choice` | `"right" \| "left"` | Escolha do jogador |
| `onNext` | `() => void` | Avança para a próxima fase (vídeo ou próximo card) |
| `current` | number | Número do card atual |
| `total` | number | Total de cards na sessão |

Exibe: badge concordou/discordou, texto original do meme, badge de verificação fact-check, contexto oculto, fonte, pílula de sabedoria, botão "próxima →" ou "ver resultado →".

---

## VideoScreen

**Arquivo**: `src/components/VideoScreen.tsx`
**Dependências**: `framer-motion`, `@/lib/video`

Exibe o vídeo de pílula associado ao dilema. Retorna `null` se não houver `video_url`.

### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `dilema` | `Dilema` | Dilema com `video_url` preenchida |
| `onNext` | `() => void` | Avança para o próximo card |
| `current` | number | Número do card atual |
| `total` | number | Total de cards |

Detecta o tipo via `isArquivoVideo()`:
- **Arquivo** (`.mp4`, `.webm`, `.mov`, `.m4v`): usa `<video>` com `autoPlay` e `controls`.
- **TikTok / YouTube**: usa `<iframe>` com URL de embed via `getEmbedUrl()`.

Inclui botão "pular →" no header.

---

## AudioBg

**Arquivo**: `src/components/AudioBg.tsx`
**Dependências**: `@/lib/sfx` (isMuted, setMuted)

Player de trilha sonora de fundo. Lê `/audio_config.json` em runtime e suporta playlists.

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `startPaused` | boolean | `false` | Se `true`, começa pausado (usado na landing page) |

### Comportamento

- Carrega a playlist de `/audio_config.json` (array `trilhas` ou `trilha` legado).
- Volume fixo em 35%. Auto-play tenta iniciar imediatamente; se bloqueado, aguarda o primeiro `pointerdown`/`touchstart`.
- Estado de mudo sincronizado via `CustomEvent "ozipa-mute"` (compartilhado com SFX de swipe).
- Avança faixa automaticamente ao terminar (`onEnded`).
- Controles: play/pause, próxima faixa, mudo, nome da faixa atual, lista dropdown.
- Posicionado como `fixed bottom-3 right-3 z-50`.
- Retorna `null` se a playlist estiver vazia.

---

## FormularioFinal

**Arquivo**: `src/components/FormularioFinal.tsx`
**Dependências**: `PesquisaForm`

Wrapper da versão curta da pesquisa qualitativa, exibido na tela de resultado do jogo.

### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `bairro` | string | Bairro do jogador (passado para `PesquisaForm`) |

Começa colapsado — um botão "📋 responde uma pesquisa rápida (anônima)" abre o formulário inline.
Renderiza `<PesquisaForm modo="curta" />` e inclui link para `/pesquisa` (versão completa).

---

## PesquisaForm

**Arquivo**: `src/components/PesquisaForm.tsx`

Formulário da pesquisa qualitativa anônima. Suporta dois modos.

### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `modo` | `"curta" \| "completa"` | Curta (fim do jogo): subconjunto de campos. Completa (página `/pesquisa`): todos os campos |
| `onDone` | `() => void` (opcional) | Callback ao enviar com sucesso |

### Campos

| Campo | Modo | Tipo |
|-------|------|------|
| Faixa de idade | ambos | Pills (seleção única) |
| Você estuda? | completa | Pills |
| Sentimentos sobre política | ambos | PillsMulti |
| "Política afeta minha vida" | ambos | Escala 1–5 |
| "Me sinto à vontade pra opinar" | completa | Escala 1–5 |
| "Dá pra confiar em eleitos" | completa | Escala 1–5 |
| O que te afasta | completa | PillsMulti |
| Já participou no bairro | ambos | Pills |
| Onde discute política | completa | PillsMulti |
| Sabia que dá pra participar | completa | Pills |
| Texto: o que te faria participar | ambos | textarea (max 500) |
| Texto: dúvida sobre política | completa | textarea (max 500) |

Submete para `POST /api/form`. Em caso de erro de rede, avança silenciosamente (`setEnviado(true)`).

Sub-componentes internos: `Pills`, `PillsMulti`, `Escala`, `Campo`.

---

## InscricaoForm

**Arquivo**: `src/components/InscricaoForm.tsx`

Formulário de inscrição no encontro presencial.

### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `onDone` | `(turma: string) => void` | Callback com a turma selecionada ao confirmar |

### Campos

- **Nome** (obrigatório)
- **Idade** (obrigatório)
- **Turma** (obrigatório): "Sábado manhã — das 9:00 às 11:00" ou "Sábado tarde — das 14:30 às 16:30"
- **Contato para confirmação** (opcional): WhatsApp / SMS / Email / não precisa
- **Checkbox confirmação de presença** (obrigatório)

Submete para `POST /api/register`. Em caso de erro de rede, avança silenciosamente (UX não penaliza falha de rede).

---

## PrankJogo

**Arquivo**: `src/components/PrankJogo.tsx`

Botão de entrada no jogo que exibe um meme viral antes de revelar a data real do evento. É o "primeiro aprendizado" — nem tudo é o que parece.

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `label` | string | `"JOGAR AGORA →"` | Texto do botão |
| `className` | string | `""` | Classes CSS para o botão |
| `onBeforePlay` | `() => void` (opcional) | — | Callback antes de iniciar a sequência (ex: salvar apelido) |

### Fluxo interno

```
idle → video (meme aleatório) → got ("VOCÊ CAIU!!") → reveal (data do evento) → idle
```

Sorteia aleatoriamente entre `/memetepeguei.mp4`, `/memetepeguei2.mp4`, `/meme3.mp4`.

---

## TutorialModal

**Arquivo**: `src/components/TutorialModal.tsx`

Modal de 5 passos explicando como participar do evento e usar o jogo.

### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `onClose` | `() => void` | Fecha o modal |

### Passos

1. Inscrição — preencher nome e turma
2. Traz o celular — carregado com internet
3. O jogo — mecânica de swipe
4. Som — controles de trilha
5. Discute — comparar respostas na turma

Navegação por dots clicáveis, botões "próximo →" / "← voltar". Clique fora fecha.
