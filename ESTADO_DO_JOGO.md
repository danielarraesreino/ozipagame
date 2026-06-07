# Vozes do Oziel — Estado atual do jogo
> Atualizado: 06/06/2026

---

## O que é

Serious game web mobile-first para adolescentes de 12 a 17 anos do Jardim Oziel, Campinas-SP.
Formato Tinder/Reigns: o jogador arrasta memes políticos para a direita (concordo) ou esquerda (discordo).
Cada escolha revela o contexto real que o meme esconde — e por que aquilo importa pro bairro.

É o **EAD do curso híbrido** do Grupo Diálogos (CriaLab · Minha Campinas · Fundação FEAC). Não é suplemento — é o próprio jogo que ensina.

Duração: 3 a 5 minutos por sessão. Sem cadastro, sem senha, 100% anônimo. Só apelido + bairro (no celular, nunca no servidor).

---

## URLs

| Ambiente   | URL                                              |
|------------|--------------------------------------------------|
| Produção   | https://jogoozipa.vercel.app                     |
| Pesquisa   | https://jogoozipa.vercel.app/pesquisa            |
| Dados abertos | https://jogoozipa.vercel.app/dados            |
| Enviar meme | https://jogoozipa.vercel.app/enviar-meme        |
| Admin CMS  | https://jogoozipa.vercel.app/admin               |
| Repo       | github.com/danielarraesreino/ozipagame           |

---

## Identidade visual (guia de marca)

Sistema de marca oficial em `VozesDoOziel_Marca.pdf`. Conceito: um **balão de fala partido** em dois tons (o diálogo, os dois lados) com o gesto de deslize ‹ › no miolo (a mecânica concordo/discordo). Estética **zine/risograph/protesto**.

| Cor | Hex | Uso |
|-----|-----|-----|
| Grafite | `#13130E` | fundo |
| Creme | `#F7F1E6` | texto |
| Laranja | `#EA5B1E` | ação/destaque |
| Amarelo | `#FFD21E` | atenção/acento |
| Verde | `#26C79A` | concordo |
| Vermelho | `#E8402F` | discordo |

- Tipografia: **Archivo** (display black no lockup) + **Space Mono** (rótulos/tagline), via `next/font`.
- Logo reutilizável: `src/components/Logo.tsx` (variantes cor/mono/inverso). Assets tratados em `public/brand/`.
- Tokens Tailwind v4 em `src/app/globals.css` (`bg-grafite`, `text-laranja`, etc.) + utilitários zine (`.brand-lockup`, `.brand-label`, `.bg-halftone`, `.zine-edge`, `.grain`, `.pulse-glow`).

---

## Páginas e fluxo

```
/  (entrada)
  ├─ apelido + bairro + (código de oficina)
  ├─ card do vídeo Spotniks (a inspiração) — play pulsante → modal
  └─ "entrar no jogo" → /game
        SwipeCard (meme) — som ao concordo/discordo, trilha de fundo (playlist)
          └─ ConsequenceScreen — "o que o meme apaga" + fact-check + pílula
                └─ [se tiver vídeo] VideoScreen
                      └─ próxima card … → Tela Final
                            ├─ "{bairro} tem voz." + stats + breakdown
                            ├─ pesquisa rápida (anônima)
                            ├─ WhatsApp share · jogar de novo
                            └─ links: pesquisa · dados abertos · enviar meme
/pesquisa     — formulário qualitativo completo (standalone)
/enviar-meme  — envio colaborativo de meme (co-autoria) → fila de moderação
/dados        — dashboard aberto (agregados + CC BY-SA + baixar JSON)
/admin        — painel da equipe (senha)
```

### Componentes
`Logo` · `SwipeCard` (swipe + Framer Motion + vibração + sons) · `ConsequenceScreen` · `VideoScreen` (mp4 local / TikTok / YouTube) · `AudioBg` (playlist de fundo com mudo) · `FormularioFinal` (pesquisa curta) · `PesquisaForm` (motor da pesquisa, modo curta/completa).

---

## Backend — rotas `/api/*`

- **Coleta (público):** `track` (partida anônima) · `form` (pesquisa) · `memes` + `memes/upload` (envio) · `dados` (agregados abertos, `force-dynamic`).
- **Admin (cookie httpOnly, 8h):** `login` · `videos` · `cards` · `codes` · `audio` · `config` · `formularios` (ler) · `memes` (moderar) · `upload`.

---

## Camada de dados (3 lugares)

1. **Supabase (Postgres)** — o que os jovens geram. Tabelas: `partidas`, `respostas`, `formularios`, `memes`. RLS **travado**; acesso só via API com service-role. Schema em `supabase/schema.sql`. **Sem apelido — anônimo.**
2. **JSON no GitHub** (editado pelo admin, versionado): `video_urls`, `cards_ativos`, `room_codes`, `audio_config` (playlist), `site_config` (Spotniks), `dilemas_importados` (pipeline).
3. **localStorage** (celular do jogador): apelido+bairro, respostas, módulo desbloqueado, mudo.

---

## Privacidade (regra de ouro — menores 12–17)

- **Nenhum apelido vai pro banco** nas partidas — só bairro (grosso) + respostas.
- **Dashboard público = 100% agregado** (só números/gráficos). Linhas cruas nunca saem do servidor.
- **Texto livre só no admin** — nunca publicado.
- **Memes só aparecem após aprovação** da equipe.
- Veja `docs/LICENCA-DADOS-ABERTOS.md`.

---

## Funcionalidades por área

### Jogo
- Swipe (arraste 90px) com overlays concordo (verde) / discordo (vermelho) tipo carimbo.
- 1º card sem vídeo vira **print de corrente de WhatsApp** convincente.
- **Sons** de swipe sintetizados (Web Audio) + **trilha de fundo (playlist de raps)** com mudo, troca de faixa e lista.
- Sistema de **mirror** (fase 2 pós-oficina) detecta mudança de opinião.

### Pesquisa qualitativa (`/pesquisa` + curta no fim)
Idade · estudo · sentimentos sobre política (marca-várias) · 3 escalas (afeta minha vida · à vontade pra opinar · confio em eleitos) · o que afasta · participação · onde discute · sabia que dá pra participar · 2 textos abertos (só equipe).

### Dados abertos (`/dados`)
Agregados anônimos: partidas, por bairro, concordo×discordo por dilema, fact-check, e todos os agregados da pesquisa. Badge CC BY-SA + download do JSON (`/api/dados` é o endpoint de dados abertos).

### Co-autoria (`/enviar-meme`)
Comunidade envia meme (descrição + print + apelido p/ crédito) → **fila de moderação** no admin → aprovar/recusar.

### Admin (`/admin`)
Abas: 🎬 Vídeos · 🃏 Cards (ocultar/mostrar todos) · 🎵 Trilha (playlist) · 📺 Conteúdo (Spotniks) · 📋 Pesquisa (ler respostas) · 🖼️ Memes (moderar) · 🔑 Códigos. Salva via GitHub API (configs) ou Supabase (leitura/moderação).

---

## Conteúdo do jogo

- `src/lib/dilemas.ts` — 4 dilemas fixos + interface + `MODULO_COR`.
- `src/lib/dilemas_gerados.ts` — pipeline (stub).
- `public/dilemas_importados.json` — 26 cards do OzielMemes (com vídeo/imagem).
- Mesclados em runtime, filtrados por **fase** (pós-oficina) e por **ativo/oculto** (`cards_ativos.json`).

| Módulo | Cor |
|--------|-----|
| participação | `#26C79A` |
| desinformação | `#E8402F` |
| eleição | `#3B82F6` |
| território | `#FFD21E` |

---

## Stack técnica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) · React 19 · TypeScript |
| Estilo | Tailwind CSS v4 · Framer Motion |
| Banco | Supabase (Postgres, RLS) |
| Arquivos | Vercel Blob (vídeos, imagens, áudio) |
| Configs | GitHub API (JSON versionado) |
| Deploy | Vercel (push → deploy automático) |

### Env vars (produção)
`SUPABASE_URL` · `SUPABASE_SERVICE_ROLE_KEY` · `BLOB_READ_WRITE_TOKEN` · `GITHUB_TOKEN` · `ADMIN_PASSWORD`.

---

## Como operar

- **Adicionar vídeo a um dilema:** `/admin` → 🎬 Vídeos → colar URL ou subir mp4.
- **Ocultar/mostrar card:** `/admin` → 🃏 Cards.
- **Trocar a trilha:** `/admin` → 🎵 Trilha (sobe raps, vira playlist).
- **Vídeo do Spotniks:** `/admin` → 📺 Conteúdo.
- **Ler a pesquisa / moderar memes:** `/admin` → 📋 Pesquisa / 🖼️ Memes.
- **Ver dados abertos:** `/dados` (ou baixar `/api/dados`).
- **Schema do banco:** rodar `supabase/schema.sql` no SQL editor do Supabase.

---

*Vozes do Oziel — Grupo Diálogos · CriaLab · Minha Campinas · Fundação FEAC*
*Jardim Oziel, Campinas-SP*
