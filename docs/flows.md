# Fluxos de Usuário — Vozes do Oziel

---

## Fluxo Principal: Landing → Jogo

```mermaid
graph TD
    A[Acessa jogoozipa.vercel.app] --> B[Landing page /]
    B --> C{Tab ativa}

    C --> D[Início]
    C --> E[Pesquisa]
    C --> F[Jogo]
    C --> G[Equipe]

    D --> D1[Botão JOGAR AGORA →]
    D1 --> D2{senha testador?}
    D2 -- fogonosracistas --> D3[Link direto /game]
    D2 -- não --> D4[PrankJogo: meme viral]
    D4 --> D5[VOCÊ CAIU!!]
    D5 --> D6[Revelação: data 20/jul]
    D6 --> D7[Volta para landing]

    F --> F1[Digita apelido]
    F1 --> F2{tem código de oficina?}
    F2 -- sim --> F3[Valida em /room_codes.json]
    F3 --> F4{código válido?}
    F4 -- sim --> F5[Salva localStorage: pos_oficina]
    F4 -- não --> F6[Erro: código inválido]
    F2 -- não --> F7[Prossegue sem desbloqueio]
    F5 --> F8[PrankJogo + savePlayer]
    F7 --> F8
    F8 --> F9[Redireciona /game]
```

---

## Fluxo do Jogo (/game)

```mermaid
graph TD
    A[/game carregado] --> B{player no localStorage?}
    B -- não --> C[router.replace /]
    B -- sim --> D[Carrega dilemas runtime]

    D --> D1[fetchImportados do dilemas_importados.json]
    D1 --> D2[Filtra por fase + cards_ativos.json]
    D2 --> D3[Carrega video_urls.json]
    D3 --> E[Fase: swipe]

    E --> F[SwipeCard exibe dilema]
    F --> G{Usuário arrasta ≥90px}
    G -- direita → concordou --> H[Vibra + playConcordo]
    G -- esquerda → discordou --> I[Vibra + playDiscordo]
    H --> J[Fase: consequence]
    I --> J

    J --> K[ConsequenceScreen]
    K --> L{dilema tem video_url?}
    L -- sim --> M[Fase: video → VideoScreen]
    L -- não --> N{último card?}
    M --> O[Usuário assiste/pula]
    O --> N

    N -- não --> P[Avança índice → Fase: swipe]
    P --> F
    N -- sim --> Q[Salva respostas fase 1 em localStorage]
    Q --> R[Fase: end → EndScreen]

    R --> S[POST /api/track bairro + results]
    R --> T[Exibe stats + mirror]
    T --> U{mudou opinião pós-oficina?}
    U -- sim --> V[Mostra comparação antes/depois]
    U --> W[FormularioFinal pesquisa rápida]
    W --> X[POST /api/form]
    R --> Y[Compartilhar WhatsApp]
    R --> Z[Jogar de novo → reinicia estado]
```

---

## Fluxo de Inscrição (/pesquisa)

```mermaid
graph TD
    A[Acessa /pesquisa] --> B[Exibe landing de inscrição]
    B --> C{aba selecionada}
    C --> D[Inscrição — InscricaoForm]
    C --> E[Pesquisa qualitativa — PesquisaForm completa]

    D --> D1[Preenche nome, idade, turma, confirmação]
    D1 --> D2[POST /api/register]
    D2 --> D3{sucesso?}
    D3 -- sim --> D4[Tela de confirmação com turma]
    D3 -- não → falha silenciosa --> D4

    E --> E1[Responde campos]
    E1 --> E2[POST /api/form]
    E2 --> E3[valeu! 🙌]
```

---

## Fluxo de Envio de Meme (/enviar-meme)

```mermaid
graph TD
    A[Acessa /enviar-meme] --> B[Formulário: apelido, bairro, descrição, imagem]
    B --> C{tem imagem?}
    C -- sim --> D[POST /api/memes/upload via Vercel Blob client]
    D --> E[Recebe URL pública do Blob]
    C -- não --> F
    E --> F[POST /api/memes com metadados + imagem_url]
    F --> G[Entra como 'pendente' no admin]
    G --> H[Confirmação para o usuário]
```

---

## Fluxo de Moderação Admin (/admin)

```mermaid
graph TD
    A[Acessa /admin] --> B{cookie ozipa_admin?}
    B -- não --> C[Tela de login]
    C --> D[POST /api/admin/login senha]
    D --> E{senha correta?}
    E -- não --> F[Erro 401]
    E -- sim --> G[Define cookie 8h → redireciona]
    B -- sim --> H[Painel CMS]

    H --> I{Aba selecionada}
    I --> J[Vídeos → PUT /api/admin/videos]
    I --> K[Cards → PUT /api/admin/cards]
    I --> L[Trilha → PUT /api/admin/audio]
    I --> M[Conteúdo → PUT /api/admin/config]
    I --> N[Pesquisa → GET /api/admin/formularios]
    I --> O[Memes → GET+PUT /api/admin/memes]
    I --> P[Códigos → PUT /api/admin/codes]
    I --> Q[Inscrições → GET+PUT+DELETE /api/admin/registros]

    J --> J1[Upload via POST /api/admin/upload → Vercel Blob]
    J1 --> J2[Salva URL em video_urls.json → GitHub API]
    K --> K1[Edita cards_ativos.json → GitHub API]
    L --> L1[Upload faixa → Blob]
    L1 --> L2[Salva playlist em audio_config.json → GitHub API]
    M --> M1[Salva site_config.json → GitHub API]
    P --> P1[Salva room_codes.json → GitHub API]
```

---

## Sistema de Fases e Desbloqueio

```mermaid
graph TD
    A[Jogador acessa /game] --> B[buildDilemas]
    B --> C[Dilemas fixos src/lib/dilemas.ts]
    B --> D[Dilemas gerados src/lib/dilemas_gerados.ts]
    B --> E[Dilemas importados public/dilemas_importados.json]

    C --> F{fase?}
    D --> F
    E --> F

    F -- fase 1 ou sem fase --> G[Sempre disponível]
    F -- fase 2 --> H{isPosOficinaUnlocked?}
    H -- sim --> G
    H -- não --> I[Filtrado — não aparece]

    G --> J[Verificar cards_ativos.json]
    J -- ativo !== false --> K[Inclui no jogo]
    J -- ativo === false --> L[Oculta]

    K --> M[Aplica video_urls.json]
    M --> N[Lista final de dilemas]
```

---

## Módulos Temáticos e Cores

| Módulo | Cor | Hex |
|--------|-----|-----|
| participação | Verde | `#26C79A` |
| desinformação | Vermelho | `#E8402F` |
| eleição | Azul | `#3B82F6` |
| território | Amarelo | `#FFD21E` |

---

## Sistema Mirror (Fase 2)

Dilemas de fase 2 podem referenciar dilemas de fase 1 via campo `espelho_de`. Ao chegar na `EndScreen`, o sistema compara as respostas atuais com as da fase 1 (salvas em `localStorage ozipa_respostas_f1`):

- Se a escolha mudou: exibe bloco "você evoluiu" com a comparação explícita.
- Se não mudou: não mostra nada.

O objetivo é visualizar o impacto da oficina presencial na reflexão do jovem.
