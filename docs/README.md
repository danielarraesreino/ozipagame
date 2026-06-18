# Vozes do Oziel — Documentação

Jogo educativo de dilemas políticos para a juventude do Parque Oziel (Campinas-SP). Feito por educadores, designers e jovens do próprio bairro.

**Produção**: https://jogoozipa.vercel.app  
**Licença**: CC BY-SA 4.0 (dados) · código aberto

---

## Índice

- [Visão geral](#visão-geral)
- [Setup local](#setup-local)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Scripts](#scripts)
- [Deploy](#deploy)
- [Documentação complementar](#documentação-complementar)

---

## Visão geral

| Aspecto | Detalhe |
|---------|---------|
| **Framework** | Next.js 16 (App Router) |
| **Banco de dados** | Supabase (PostgreSQL) |
| **Mídia** | Vercel Blob (vídeos, áudios, imagens) |
| **Config runtime** | GitHub API → JSONs em `public/` |
| **Deploy** | Vercel (Fluid Compute) |
| **Autenticação** | Cookie httpOnly (admin) + senha de testador (jogo) |

O jogo tem duas camadas de acesso:
- **Usuário comum** → clica JOGAR → vê prank (meme) → mensagem "libera em 20/07"
- **Testador** → digita `fogonosracistas` → vai direto para `/game`
- **Pós-oficina** → código de sala (ex: `CRIA26`) → desbloqueia módulo fase 2

---

## Setup local

### Pré-requisitos

- Node.js ≥ 18 (recomendado: 22 LTS)
- npm ou pnpm
- Conta no Supabase com projeto criado
- Conta na Vercel (para Blob)

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/danielarraesreino/ozipagame.git
cd ozipagame

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com seus valores (ver seção abaixo)

# 4. Aplique o schema no Supabase
# Cole o conteúdo de supabase/schema.sql no SQL Editor do painel Supabase

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

---

## Variáveis de ambiente

Configure em `.env.local` para desenvolvimento e no painel da Vercel para produção.

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `SUPABASE_URL` | ✓ | URL do projeto Supabase (também aceita `NEXT_PUBLIC_SUPABASE_URL`) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓ | Chave service role — **nunca expor no cliente** |
| `BLOB_READ_WRITE_TOKEN` | ✓ | Token Vercel Blob para upload de vídeos, áudios e imagens |
| `GITHUB_TOKEN` | ✓ | PAT com `contents:write` no repo — usado pelo CMS para persistir JSONs sem rebuild |
| `ADMIN_PASSWORD` | ✓ | Senha do painel `/admin` |

### Exemplo de `.env.local`

```bash
SUPABASE_URL=https://xyzxyzxyz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
GITHUB_TOKEN=ghp_...
ADMIN_PASSWORD=senha_segura_aqui
```

> **Segurança**: `SUPABASE_SERVICE_ROLE_KEY` ignora RLS — nunca importar `supa()` em componente cliente. `GITHUB_TOKEN` deve ter escopo mínimo.

---

## Estrutura do projeto

```
src/
├── app/
│   ├── page.tsx              # Landing page (tabs: Início, Pesquisa, Jogo, Equipe)
│   ├── game/page.tsx         # Jogo de dilemas (swipe cards)
│   ├── pesquisa/             # Inscrição + pesquisa qualitativa completa
│   ├── dados/page.tsx        # Dashboard de dados abertos
│   ├── enviar-meme/          # Envio de memes pela comunidade
│   ├── admin/page.tsx        # CMS interno (protegido por senha)
│   └── api/                  # API Routes
│       ├── register/         # POST — inscrição no encontro
│       ├── form/             # POST — pesquisa qualitativa anônima
│       ├── track/            # POST — registro de partida anônima
│       ├── dados/            # GET — dados abertos agregados (CC BY-SA)
│       ├── memes/            # POST — envio de meme
│       └── admin/            # Endpoints protegidos (login, videos, cards, etc.)
├── components/
│   ├── PrankJogo.tsx         # Botão JOGAR com fluxo de prank (meme + data)
│   ├── SwipeCard.tsx         # Card de dilema com swipe
│   ├── ConsequenceScreen.tsx # Tela de consequência após escolha
│   ├── VideoScreen.tsx       # Vídeo de pílula de sabedoria
│   ├── AudioBg.tsx           # Player de trilha sonora de fundo
│   ├── InscricaoForm.tsx     # Formulário de inscrição no encontro
│   ├── PesquisaForm.tsx      # Pesquisa qualitativa (versão curta e completa)
│   ├── TutorialModal.tsx     # Modal "como funciona?"
│   └── Logo.tsx              # Logo SVG
└── lib/
    ├── dilemas.ts            # Cards fixos do jogo
    ├── dilemas_gerados.ts    # Cards gerados por pipeline externo
    ├── store.ts              # LocalStorage: player, respostas, desbloqueios
    ├── supabase.ts           # Cliente Supabase (service role, lazy singleton)
    ├── cards.ts              # Fetch de cards importados e ativos
    └── video.ts              # Utilitários de URL de vídeo (YouTube embed)

public/
├── video_urls.json           # { [dilema_id]: url } — atualizado pelo admin
├── room_codes.json           # { [CODIGO]: { label, ativo } }
├── audio_config.json         # { trilhas: [{ nome, url }] }
├── site_config.json          # { spotniks_url }
├── cards_ativos.json         # { [dilema_id]: boolean }
└── dilemas_importados.json   # Dilema[] — pipeline externo

docs/
├── README.md                 # Este arquivo
├── ARCHITECTURE.md           # Fluxo de dados e diagramas
├── API.md                    # Referência completa de endpoints
├── database.md               # Schema do Supabase
├── components.md             # Componentes com props
├── env.md                    # Variáveis de ambiente detalhadas
└── flows.md                  # Fluxos de usuário com Mermaid
```

---

## Scripts

```bash
npm run dev      # Servidor de desenvolvimento (Turbopack)
npm run build    # Build de produção
npm run start    # Inicia servidor de produção local
npm run lint     # ESLint
```

---

## Deploy

O projeto é deployed na Vercel via CLI ou integração Git.

```bash
# Preview
vercel

# Produção
vercel --prod
```

Configuração de projeto em `.vercel/project.json`. Sem `vercel.json` — usa detecção automática de Next.js.

> O CMS admin persiste configurações em JSONs no repositório via GitHub API (sem rebuild necessário). O Vercel serve os arquivos de `public/` como estáticos com cache de CDN.

---

## Documentação complementar

| Arquivo | Conteúdo |
|---------|----------|
| `docs/ARCHITECTURE.md` | Fluxo de dados, modelo de dados, diagramas Mermaid |
| `docs/API.md` | Referência completa de todos os endpoints (request/response) |
| `docs/database.md` | Schema Supabase coluna a coluna + diagrama ER |
| `docs/components.md` | Componentes React com props e comportamento |
| `docs/flows.md` | Fluxos de usuário com diagramas Mermaid |
| `docs/env.md` | Variáveis de ambiente com notas de segurança |
