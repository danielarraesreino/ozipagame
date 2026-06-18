# Arquitetura — Vozes do Oziel

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 16 (App Router), React, Tailwind CSS |
| Backend | Next.js API Routes (Fluid Compute / Vercel) |
| Banco de dados | Supabase (PostgreSQL) |
| Armazenamento de mídia | Vercel Blob (vídeos, áudios) |
| Deploy | Vercel (produção: jogoozipa.vercel.app) |

## Estrutura de Rotas

```
/                   → Landing page + tabs (Início, Pesquisa, Jogo, Equipe)
/game               → Jogo de dilemas (swipe cards)
/pesquisa           → Inscrição no encontro + pesquisa qualitativa completa
/dados              → Dashboard de dados abertos (CC BY-SA)
/enviar-meme        → Envio de memes pela comunidade
/admin              → CMS interno (senha protegida)
```

## API Endpoints

### Públicos

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/register` | Inscrição no encontro presencial |
| POST | `/api/inscricao` | Alias legado de `/api/register` |
| POST | `/api/form` | Resposta da pesquisa qualitativa (anônima) |
| POST | `/api/track` | Registro de partida anônima + respostas |
| GET | `/api/dados` | Dados abertos agregados (CC BY-SA) |
| GET | `/api/videos` | URLs de vídeos por dilema (alias de `/video_urls.json`) |
| POST | `/api/memes` | Metadados de meme enviado pela comunidade |
| POST | `/api/memes/upload` | Upload de imagem de meme → Vercel Blob |

### Admin (requer cookie de sessão)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST/DELETE | `/api/admin/login` | Autenticação / logout |
| PUT | `/api/admin/videos` | Salva URL de vídeo por dilema |
| PUT | `/api/admin/upload` | Upload de vídeo/áudio → Vercel Blob |
| PUT | `/api/admin/audio` | Gerencia playlist de trilha sonora |
| PUT | `/api/admin/cards` | Ativa/oculta card no jogo |
| PUT | `/api/admin/codes` | Cria/remove código de sala |
| PUT | `/api/admin/config` | Configurações do site (ex: URL Spotniks) |
| GET | `/api/admin/formularios` | Lista respostas da pesquisa |
| GET/PUT/DELETE | `/api/admin/registros` | CRUD de inscrições |
| GET/PUT | `/api/admin/memes` | Moderação de memes |

## Banco de Dados (Supabase)

```
partidas        → sessões de jogo anônimas (bairro, total_cards, qtd_discordou)
respostas       → escolhas por dilema por partida (dilema_id, escolha, verificacao_status)
formularios     → pesquisa qualitativa anônima
inscricoes      → inscrições no encontro presencial
memes           → memes enviados pela comunidade (pendente/aprovado/recusado)
```

## Arquivos Estáticos (public/)

Arquivos JSON atualizados pelo admin e lidos diretamente pelo cliente (sem latência de API):

```
/video_urls.json        → { [dilema_id]: url }
/room_codes.json        → { [codigo]: { label, ativo } }
/audio_config.json      → { trilhas: [{ nome, url }] }
/site_config.json       → { spotniks_url }
/cards_ativos.json      → { [dilema_id]: boolean }
/dilemas_importados.json → Dilema[]
```

## Fluxo do Jogo

```mermaid
graph TD
    A[Landing /] --> B{tem senha de testador?}
    B -- sim --> C[/game]
    B -- não --> D[PrankJogo: meme + data]
    C --> E[SwipeCard: dilemas]
    E --> F[ConsequenceScreen]
    F --> G{tem vídeo?}
    G -- sim --> H[VideoScreen]
    G -- não --> E
    E --> I[EndScreen]
    I --> J[POST /api/track]
    I --> K[FormularioFinal → POST /api/form]
```

## Controle de Acesso ao Jogo

- **Usuário comum**: clica JOGAR → vê prank (meme) → mensagem "libera em 20/07"
- **Testador**: digita `fogonosracistas` → vai direto para `/game`
- **Pós-oficina**: código de sala (ex: `CRIA26`) → desbloqueia módulo fase 2

## Camada de Configuração Runtime (sem rebuild)

Arquivos JSON em `public/` editados pelo admin via GitHub API e lidos diretamente pelo browser (sem latência de API):

| Arquivo | Conteúdo | Rota admin |
|---------|----------|-----------|
| `/video_urls.json` | `{ [dilema_id]: url }` | `PUT /api/admin/videos` |
| `/room_codes.json` | `{ [CODIGO]: { label, ativo } }` | `PUT /api/admin/codes` |
| `/audio_config.json` | `{ trilhas: [{ nome, url }], trilha }` | `PUT /api/admin/audio` |
| `/site_config.json` | `{ spotniks_url }` | `PUT /api/admin/config` |
| `/cards_ativos.json` | `{ [dilema_id]: boolean }` | `PUT /api/admin/cards` |
| `/dilemas_importados.json` | `Dilema[]` | Pipeline ozielmemes |

## Documentação Complementar

- `docs/api.md` — referência completa de todos os endpoints (request/response)
- `docs/database.md` — schema Supabase com diagrama ER
- `docs/components.md` — componentes com props e comportamento
- `docs/flows.md` — fluxos de usuário com diagramas Mermaid
- `docs/env.md` — variáveis de ambiente necessárias

## Configurações de Ambiente

Ver `docs/env.md` para variáveis necessárias: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `BLOB_READ_WRITE_TOKEN`, `GITHUB_TOKEN`, `ADMIN_PASSWORD`.
