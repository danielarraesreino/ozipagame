# Vozes do Oziel — Estado atual do jogo
> Atualizado: 27/05/2026 | Semana 2 do CriaLab

---

## O que é

Serious game mobile-first para adolescentes de 12 a 17 anos do Parque Oziel, Campinas-SP.
Formato Tinder: o jogador arrasta memes políticos para a direita (concordo) ou esquerda (discordo).
Cada escolha revela o contexto real que o meme esconde — e por que aquilo importa pro bairro.

Duração estimada: 3 a 5 minutos por sessão.
Sem cadastro. Sem senha. Sem rastreio. Só apelido + bairro.

---

## URLs

| Ambiente      | URL                                              |
|---------------|--------------------------------------------------|
| Produção      | https://jogoozipa.vercel.app                     |
| Admin CMS     | https://jogoozipa.vercel.app/admin               |
| Dev local     | http://localhost:3000                            |
| Repo          | github.com/danielarraesreino/ozipagame           |

---

## Flow completo do jogo

```
Tela de entrada
  └─ digita apelido + escolhe bairro → "entrar no jogo"
      └─ SwipeCard (meme)
            └─ swipe direita (concordo) ou esquerda (discordo)
                  └─ ConsequenceScreen
                        ├─ badge: "você concordou / discordou"
                        ├─ badge de módulo (cor por tema)
                        ├─ badge de fact-check (❌ falso / ⚠️ enganoso / ✅ verdadeiro)
                        ├─ bloco escuro: "o que o meme apaga" (contexto_oculto)
                        ├─ fonte
                        └─ pílula de sabedoria (borda colorida pelo módulo)
                              └─ [se tiver vídeo] VideoScreen
                                    ├─ embed TikTok ou YouTube Shorts
                                    └─ botão "pular" ou "próxima"
                                          └─ próxima card (ou Tela Final)

Tela Final
  ├─ "X bairro tem voz."
  ├─ resumo: dilemas vistos, vezes que discordou
  ├─ breakdown: quantos falso / enganoso / verdadeiro
  ├─ módulos percorridos
  ├─ botão WhatsApp (texto pré-formatado para compartilhar)
  └─ botão "jogar de novo"
```

---

## Telas e componentes

### `src/app/page.tsx` — Entrada
- Campo de apelido (texto livre, max 24 chars)
- Seleção de bairro: Parque Oziel, Jardim Florence, Campo Grande, DIC, Outro bairro
- Botão "entrar no jogo →" (desabilitado sem preencher)
- Links: jogar em HTML standalone · sobre o projeto
- Sem cadastro, sem senha, sem rastreio — LGPD-friendly para menores

### `src/components/SwipeCard.tsx` — Card de meme
- Arrastar para direita = concordo (overlay verde)
- Arrastar para esquerda = discordo (overlay vermelho)
- Tag do módulo colorida por tema (MODULO_COR)
- Animação de voo ao confirmar (Framer Motion)
- Vibração tátil ao confirmar: `navigator.vibrate(40ms)` no Android
- Botões físicos de concordo/discordo (além do swipe)
- Threshold de arraste: 90px

### `src/components/ConsequenceScreen.tsx` — Revelação
- Badge de escolha (concordou / discordou) + badge de módulo colorido
- Badge de fact-check: ❌ falso · ⚠️ enganoso · 🔍 sem contexto · ✅ verdadeiro
- Bloco escuro "o que o meme apaga" com o contexto_oculto
- Fonte da informação
- Pílula de sabedoria com borda colorida pelo módulo
- Botão "próxima →" ou "ver resultado →" (última card)

### `src/components/VideoScreen.tsx` — Vídeo (opcional por card)
- Aparece somente se a card tiver video_url
- Embed automático: detecta TikTok (`/embed/v2/`) ou YouTube (`/embed/`)
- Botão "pular →" no canto superior direito
- Botão "próxima →" ou "ver resultado →" embaixo

### `src/app/game/page.tsx` — Orquestração
- Phases: `swipe → consequence → video → end`
- Barra de progresso animada (Framer Motion)
- Contador de cards (ex: 2/4)
- Rastreia resultados: modulo, choice, verificacao_status por card
- Tela Final: stats + WhatsApp share + jogar de novo
- Lê `/video_urls.json` (estático) ao iniciar e injeta nas dilemas

### `src/app/admin/page.tsx` — CMS da equipe
- Login com senha (cookie httpOnly, validade 8h)
- Lista todos os dilemas com input de URL de vídeo
- Salvar → commit automático no GitHub via API → Vercel redeploy em ~30s
- Banner "✓ Salvo — publicando no jogo em ~30s" após cada save
- Mobile-friendly para a equipe usar no celular

---

## Conteúdo atual

### Dilemas hardcoded (4, em `src/lib/dilemas.ts`)

| ID  | Módulo        | Meme (resumo)                             | Fact-check  | Dif |
|-----|---------------|-------------------------------------------|-------------|-----|
| d01 | participação  | "Vereador é tudo ladrão, nem adianta votar" | enganoso  | 1   |
| d02 | desinformação | "Governo vai cortar o Bolsa Família"      | falso       | 1   |
| d03 | território    | "Audiência pública não muda nada"         | enganoso    | 2   |
| d04 | eleição       | "Política não é pra mim"                 | enganoso    | 1   |

### Dilemas do pipeline (`src/lib/dilemas_gerados.ts`)
- Arquivo stub vazio por enquanto
- Preenchido pelo botão "Exportar pro jogo" no Streamlit (ozielmemes)
- 26 cards disponíveis no banco prontos para exportar

### Módulos e cores
| Módulo        | Cor      |
|---------------|----------|
| participação  | #2DD4A0 (verde) |
| desinformação | #E84040 (vermelho) |
| eleição       | #3B82F6 (azul) |
| território    | #F59E0B (âmbar) |

---

## Stack técnica

### Frontend
| Tecnologia       | Versão   | Papel                                      |
|------------------|----------|--------------------------------------------|
| Next.js          | 16.2.6   | Framework React — App Router               |
| React            | 19.2.4   | UI                                         |
| TypeScript       | 5.x      | Tipagem estática                           |
| Tailwind CSS     | 4.x      | Estilização (utility-first)                |
| Framer Motion    | 12.40    | Animações de swipe, transições de fase     |

### Backend / Infra
| Tecnologia         | Papel                                              |
|--------------------|----------------------------------------------------|
| Next.js API Routes | /api/admin/login · /api/admin/videos · /api/videos |
| Vercel             | Deploy automático no push ao GitHub (grátis)       |
| GitHub API         | Admin CMS: commits automáticos do video_urls.json  |
| Supabase (parcial) | Tabela video_urls criada, não usada ainda no game  |

### Dados / Conteúdo
| Arquivo                          | Papel                                    |
|----------------------------------|------------------------------------------|
| `src/lib/dilemas.ts`             | Dilemas hardcoded (4) + interface + cores|
| `src/lib/dilemas_gerados.ts`     | Dilemas do pipeline (stub, sobrescrito)  |
| `public/video_urls.json`         | Mapa { dilema_id → video_url }, versionado |

### Armazenamento local
- `localStorage["ozipa_player"]` → `{ apelido, bairro }`
- Sem cookies de sessão para o jogador
- Cookie httpOnly `ozipa_admin` para o CMS (8h)

### Pipeline de conteúdo (ozielmemes separado)
- Streamlit dashboard: catalogação, fact-check, geração de contextos via Gemini
- `gerar_cards.py`: converte banco → dilemas_gerados.ts (com video_url)
- "Exportar pro jogo" no Streamlit copia dilemas_gerados.ts direto para o projeto
- 37 testes TDD (pytest) cobrindo a pipeline

---

## Identidade visual

- Fundo: `#0E0E0F` (quase preto)
- Texto principal: `#F5F0E8` (off-white quente)
- Destaque: `#E8431E` (laranja-vermelho)
- Cards: `#1C1C1E` com borda `#2C2C2E`
- Fonte: system-ui (sem Google Fonts, carrega na hora)
- Modo escuro sempre ativo
- Mobile-first, viewport fixo (sem zoom)

---

## O que ainda não existe (backlog pensado)

- Módulos progressivos (desbloquear temas conforme joga)
- Painel da facilitadora (ver respostas do grupo em tempo real)
- Canal de submissão de vídeos-flagrantes pelos jovens
- Som ambiente / efeitos sonoros
- Modo offline completo (PWA / Service Worker)
- Placar coletivo do bairro ("o Oziel respondeu X% enganoso")
- Compartilhar card individual (imagem gerada)
- Múltiplos idiomas (Libras / acessibilidade)

---

## Como adicionar novos dilemas

1. Catalogar no banco: `~/ozielmemes/` (Streamlit ou `memes.json`)
2. Gerar: Streamlit → Pipeline → "Gerar cards"
3. Exportar: Streamlit → Pipeline → "🚀 Exportar pro jogo"
4. Push: `git add src/lib/dilemas_gerados.ts && git commit && git push`
5. Vercel redeploy automático em ~30s

## Como adicionar vídeo a um dilema

1. Filmar e publicar no TikTok / YouTube Shorts
2. Acessar https://jogoozipa.vercel.app/admin (senha: ozipa2025)
3. Colar a URL ao lado do dilema → salvar
4. Em ~30s o vídeo aparece no jogo

---

*Vozes do Oziel — Grupo Diálogos · CriaLab · FEAC*
*Parque Oziel, Campinas-SP — Semana Cívica 2026*
