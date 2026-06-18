# Arquitetura — Vozes do Oziel

## Stack

| Camada | Tecnologia | Papel |
|--------|-----------|-------|
| Frontend | Next.js 16 App Router + React | Rendering, roteamento, UI |
| Estilo | Tailwind CSS + fontes customizadas | Design system zine/grafite |
| Animações | Framer Motion | Transições de card e tela |
| Backend | Next.js API Routes (Fluid Compute) | Toda lógica server-side |
| Banco de dados | Supabase (PostgreSQL) | Dados de jogo, pesquisa, inscrições, memes |
| Armazenamento | Vercel Blob | Vídeos (pílulas), áudios (trilha), imagens (memes) |
| Config runtime | GitHub API → `public/*.json` | CMS sem rebuild |
| Deploy | Vercel | CDN, Fluid Compute, preview deployments |

---

## Fluxo de dados geral

```mermaid
graph TD
    Browser["Browser (cliente)"]
    NextJS["Next.js (Vercel)"]
    StaticJSON["public/*.json (CDN)"]
    SupaDB["Supabase (PostgreSQL)"]
    Blob["Vercel Blob"]
    GitHub["GitHub API"]
    Admin["Admin /admin"]

    Browser -->|"fetch *.json"| StaticJSON
    Browser -->|"POST /api/track"| NextJS
    Browser -->|"POST /api/form"| NextJS
    Browser -->|"POST /api/register"| NextJS
    Browser -->|"GET /api/dados"| NextJS
    NextJS -->|"INSERT/SELECT"| SupaDB
    Admin -->|"PUT /api/admin/*"| NextJS
    NextJS -->|"GitHub Contents API"| GitHub
    GitHub -->|"atualiza public/*.json"| StaticJSON
    Admin -->|"upload via Blob client"| Blob
    Browser -->|"src= URL"| Blob
```

---

## Fluxo do usuário — landing → jogo

```mermaid
graph TD
    A["Landing / (aba Início)"]
    B{"tem senha\nfogonosracistas?"}
    C["JOGAR AGORA → /game"]
    D["PrankJogo: meme aleatório"]
    E["Reveal: 'libera em 20/07'"]
    F["SwipeCard: dilemas"]
    G["ConsequenceScreen"]
    H{"tem vídeo\nconfigurado?"}
    I["VideoScreen (pílula)"]
    J["EndScreen"]
    K["POST /api/track"]
    L["FormularioFinal → POST /api/form"]

    A --> B
    B -->|"sim"| C
    B -->|"não"| D
    D --> E
    E --> A
    C --> F
    F --> G
    G --> H
    H -->|"sim"| I
    H -->|"não"| F
    I --> F
    F -->|"todos os cards"| J
    J --> K
    J --> L
```

---

## Fluxo de inscrição e pesquisa

```mermaid
graph TD
    A["Landing / (aba Início)"]
    B["Link → /pesquisa"]
    C["/pesquisa: InscricaoForm"]
    D["POST /api/register → Supabase inscricoes"]
    E["PesquisaForm completa"]
    F["POST /api/form → Supabase formularios"]
    G["Confirmação"]

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
```

---

## Camada de configuração runtime (sem rebuild)

O CMS admin não faz deploy — ele atualiza JSONs no repositório via GitHub Contents API. A Vercel serve esses arquivos como estáticos do CDN.

```mermaid
sequenceDiagram
    participant Admin as Admin /admin
    participant API as /api/admin/*
    participant GitHub as GitHub API
    participant CDN as Vercel CDN
    participant Browser as Browser (jogo)

    Admin->>API: PUT /api/admin/videos { dilema_id, url }
    API->>GitHub: GET conteúdo atual video_urls.json
    GitHub-->>API: base64 + sha
    API->>GitHub: PUT conteúdo atualizado (commit)
    GitHub-->>CDN: trigger revalidação (~30s)
    Browser->>CDN: GET /video_urls.json
    CDN-->>Browser: JSON atualizado
```

**Arquivos gerenciados:**

| Arquivo | Conteúdo | Rota admin |
|---------|----------|-----------|
| `public/video_urls.json` | `{ [dilema_id]: url }` | `PUT /api/admin/videos` |
| `public/room_codes.json` | `{ [CODIGO]: { label, ativo } }` | `PUT /api/admin/codes` |
| `public/audio_config.json` | `{ trilhas: [{ nome, url }] }` | `PUT /api/admin/audio` |
| `public/site_config.json` | `{ spotniks_url }` | `PUT /api/admin/config` |
| `public/cards_ativos.json` | `{ [dilema_id]: boolean }` | `PUT /api/admin/cards` |
| `public/dilemas_importados.json` | `Dilema[]` | `POST /api/admin/dilemas-draft/publicar` + pipeline externo |
| `public/cards_ativos.json` | `{ [id]: boolean }` — novo dilema entra `false` | `PUT /api/admin/cards` + publicação automática |

---

## Modelo de dados (Supabase)

```mermaid
erDiagram
    partidas {
        uuid id PK
        text bairro
        int total_cards
        int qtd_discordou
        timestamptz criado_em
    }
    respostas {
        bigint id PK
        uuid partida_id FK
        text dilema_id
        text modulo
        text escolha
        text verificacao_status
        timestamptz criado_em
    }
    formularios {
        bigint id PK
        text bairro
        text faixa_idade
        jsonb sentimentos
        int afeta_vida
        int avontade_opinar
        int confia_eleitos
        jsonb afasta
        text ja_participou
        text texto_participar
        timestamptz criado_em
    }
    inscricoes {
        bigint id PK
        text nome
        text turma
        boolean confirmou_presenca
        boolean presenca_confirmada
        timestamptz criado_em
    }
    memes {
        bigint id PK
        text autor_apelido
        text bairro
        text descricao
        text imagem_url
        text status
        timestamptz criado_em
        timestamptz revisado_em
    }
    dilemas_draft {
        uuid id PK
        bigint meme_id FK
        text meme_url
        text autor_apelido
        text situacao_md
        text escolha_a_texto
        jsonb escolha_a_efeitos
        text escolha_b_texto
        jsonb escolha_b_efeitos
        text contexto_oculto_md
        text modulo
        text fonte_url
        text validado_por
        text status
        timestamptz criado_em
        timestamptz publicado_em
    }

    partidas {
        bigint id PK
        text bairro
        int total_cards
        int qtd_discordou
        text apelido
        timestamptz criado_em
    }

    partidas ||--o{ respostas : "tem"
    memes ||--o| dilemas_draft : "origina"
```

**Princípio de privacidade**: projeto lida com público jovem de 12 a 18+ anos. Apelido é gravado em `partidas` somente para análise interna — **nunca exposto** no endpoint público `/api/dados`. Dashboard público expõe apenas agregados anônimos. Texto livre fica exclusivamente no admin.

---

## Fluxo meme → rascunho → dilema (comunidade)

O guardrail pedagógico central: nenhum meme vira card automaticamente.

```mermaid
graph TD
    A["Usuário envia meme\nPOST /api/memes"]
    B["Supabase memes\nstatus=pendente"]
    C["Admin modera\nPUT /api/admin/memes\nstatus=aprovado"]
    D{"Botão\n'Virar dilema'"}
    E["PUT /api/admin/dilemas-draft\nrascunho idempotente (meme_id UNIQUE)"]
    F["Editor admin\npreenche situação, 2 escolhas,\ncontexto oculto, módulo, fonte"]
    G{"Validação dura:\nescolha_a + escolha_b\n+ contexto_oculto?"}
    H["Bloqueado até completar"]
    I["POST /api/admin/dilemas-draft/publicar\nATO HUMANO EXPLÍCITO"]
    J["dilemas_importados.json via GitHub API\nautor_apelido + origem=comunidade"]
    K["cards_ativos[id] = false\nfacilitador liga quando quiser"]
    L["Jogo: ConsequenceScreen\ncredita 'dilema da galera: @apelido'"]

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G -->|"incompleto"| H
    G -->|"completo"| I
    I --> J
    I --> K
    J --> L
```

**Invariantes do guardrail:**
- Meme cru NUNCA vira card automaticamente
- Rascunho NUNCA vaza para produção (só em `dilemas_draft`, não no JSON público)
- Publicação é ato humano explícito via botão no admin
- Dilema publicado entra com `cards_ativos[id] = false` — facilitador ativa na hora certa
- `/api/dados` permanece só agregado, nunca expõe `apelido`

---

## Controle de acesso ao jogo

```mermaid
graph LR
    A["Clica JOGAR"] --> B{"senha\nfogonosracistas?"}
    B -->|"sim"| C["/game direto"]
    B -->|"não"| D["Prank → data 20/07"]

    C --> E{"código de\noficina?"}
    E -->|"sim (ex: CRIA26)"| F["Fase 1 + Fase 2"]
    E -->|"não"| G["Só Fase 1"]
```

| Perfil | Acesso |
|--------|--------|
| Usuário comum | Prank → mensagem de data |
| Testador (`fogonosracistas`) | `/game` direto, fase 1 |
| Pós-oficina (código de sala) | `/game` com módulo fase 2 desbloqueado |

---

## Autenticação admin

Cookie httpOnly `ozipa_admin=1`, `sameSite: lax`, `maxAge: 28800` (8h). Verificado em todos os endpoints `/api/admin/*` exceto `login`.

```typescript
function authed(req: NextRequest): boolean {
  return req.cookies.get("ozipa_admin")?.value === "1"
}
```

---

## Rotas da aplicação

| Rota | Tipo | Descrição |
|------|------|-----------|
| `/` | Static (SSG) | Landing page com tabs |
| `/game` | Static (SSG) | Jogo de dilemas |
| `/pesquisa` | Dynamic (force-dynamic) | Inscrição + pesquisa |
| `/dados` | Static (SSG) | Dashboard de dados abertos |
| `/enviar-meme` | Static (SSG) | Envio de memes |
| `/admin` | Static (SSG) | CMS interno |
| `/api/*` | Dynamic | Todos os endpoints de API |
