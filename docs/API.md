# API Reference — Vozes do Oziel

**Base URL**: `https://jogoozipa.vercel.app`

**Autenticação admin**: cookie httpOnly `ozipa_admin=1` obtido via `POST /api/admin/login` (válido 8h). Todos os endpoints `/api/admin/*` exigem esse cookie, exceto `login`.

---

## Endpoints Públicos

### `POST /api/register`
Registra inscrição de participante no encontro presencial.

**Body**
```json
{
  "nome": "string (max 200)",
  "idade": "string (max 10)",
  "turma": "string (max 100)",
  "confirmou_presenca": true,
  "contato_tipo": "WhatsApp | SMS | Email | não precisa",
  "contato_valor": "string (opcional, max 200)"
}
```

**Resposta**
- `200` `{ ok: true }`
- `500` `{ ok: false }`

---

### `POST /api/inscricao`
Alias legado de `/api/register`. Mantido para compatibilidade — aceita o mesmo body e grava na mesma tabela.

---

### `POST /api/form`
Registra resposta da pesquisa qualitativa anônima. Suporta versão curta (fim do jogo) e completa (`/pesquisa`). Campos ausentes ficam `null` no banco.

**Body**
```json
{
  "bairro": "string (max 40, opcional)",
  "faixa_idade": "12–13 | 14–15 | 16–17 | 18+",
  "estuda": "string (max 40, opcional — só versão completa)",
  "sentimentos": ["string", "..."],
  "afeta_vida": 3,
  "avontade_opinar": 4,
  "confia_eleitos": 2,
  "afasta": ["string", "..."],
  "ja_participou": "nunca | uma vez | às vezes | sempre que dá",
  "onde_discute": ["string", "..."],
  "sabia_participar": "string (max 60)",
  "texto_participar": "string (max 500, opcional)",
  "texto_duvida": "string (max 500, opcional)"
}
```

**Resposta**
- `200` `{ ok: true }`
- `500` `{ ok: false }`

> Texto livre (`texto_participar`, `texto_duvida`) nunca é exposto no dashboard público.

---

### `POST /api/track`
Registra partida e respostas ao término do jogo. O campo `apelido` é gravado em `partidas` para análise interna mas **nunca aparece no endpoint público `/api/dados`**.

**Body**
```json
{
  "bairro": "string (max 40)",
  "qtd_discordou": 2,
  "apelido": "string (max 40, opcional)",
  "results": [
    {
      "modulo": "participação",
      "dilemaId": "d01",
      "choice": "right | left",
      "status": "falso | enganoso | contexto_ausente | verdadeiro"
    }
  ]
}
```

**Resposta**
- `200` `{ ok: true }`
- `400` `{ ok: false }` — `results` vazio ou ausente
- `500` `{ ok: false }`

> Clientes que não enviam `apelido` continuam funcionando (campo opcional).

---

### `GET /api/dados`
Dados abertos agregados (Creative Commons BY-SA 4.0). Sem linhas cruas, sem apelidos, sem texto livre. Sempre lê ao vivo (`force-dynamic`).

**Resposta** `200`
```json
{
  "licenca": "CC BY-SA 4.0",
  "projeto": "Vozes do Oziel — Grupo Diálogos / CriaLab",
  "gerado_em": "2026-06-17T12:00:00.000Z",
  "jogo": {
    "total_partidas": 42,
    "por_bairro": { "Oziel": 42 },
    "total_respostas": 210,
    "por_dilema": [
      { "dilema_id": "d01", "modulo": "participação", "concordo": 30, "discordo": 12 }
    ],
    "fact_check": { "falso": 15, "enganoso": 8, "contexto_ausente": 5, "verdadeiro": 2 }
  },
  "pesquisa": {
    "total": 38,
    "faixa_idade": { "14–15": 20, "16–17": 18 },
    "estuda": { "escola pública": 35 },
    "sentimentos": { "distante de mim": 10 },
    "afeta_vida": { "media": 3.8, "dist": { "4": 15, "5": 10 } },
    "avontade_opinar": { "media": 2.9, "dist": {} },
    "confia_eleitos": { "media": 1.5, "dist": {} },
    "afasta": { "é tudo corrupto": 20 },
    "ja_participou": { "nunca": 18 },
    "onde_discute": { "TikTok / Insta": 25 },
    "sabia_participar": { "não sabia que dava": 22 }
  }
}
```

---

### `GET /api/videos`
Lê `public/video_urls.json` e retorna mapa de URLs por dilema. O cliente prefere consumir o arquivo estático diretamente — este endpoint existe para compatibilidade.

**Resposta** `200` `{ "d01": "https://...", "d02": "https://..." }`

---

### `POST /api/memes`
Envia metadados de meme da comunidade. Entra como `pendente` na fila de moderação.

**Body**
```json
{
  "autor_apelido": "string (max 40, opcional)",
  "bairro": "string (max 40, opcional)",
  "descricao": "string (max 1000)",
  "imagem_url": "string (max 600, opcional)"
}
```

Ao menos `descricao` ou `imagem_url` devem estar presentes.

**Resposta**
- `200` `{ ok: true }`
- `400` `{ ok: false }` — sem conteúdo
- `500` `{ ok: false }`

---

### `POST /api/memes/upload`
Upload de imagem de meme para o Vercel Blob. Usa protocolo `@vercel/blob/client` — o browser envia o arquivo diretamente ao Blob; esta rota apenas assina o token.

**Tipos aceitos**: `image/jpeg`, `image/png`, `image/webp`, `image/gif`  
**Tamanho máximo**: 8MB

---

## Endpoints Admin

> Todos requerem cookie `ozipa_admin=1` (exceto `POST /api/admin/login`). Retornam `401` sem autenticação.

---

### `POST /api/admin/login`
Autentica o admin. Define cookie `ozipa_admin=1` (httpOnly, 8h).

**Body** `{ "password": "string" }`

**Resposta**
- `200` `{ ok: true }`
- `401` `{ ok: false }`

---

### `DELETE /api/admin/login`
Encerra a sessão removendo o cookie.

**Resposta** `200` `{ ok: true }`

---

### `PUT /api/admin/videos`
Associa ou remove URL de vídeo (pílula de sabedoria) a um dilema. Persiste em `public/video_urls.json` via GitHub API.

**Body**
```json
{ "dilema_id": "d01", "url": "https://..." }
```
Para remover o vídeo, omitir `url` ou passar string vazia.

**Resposta** `200 { ok: true }` | `400/401 { ok: false }`

---

### `POST /api/admin/upload`
Upload de vídeo ou áudio para o Vercel Blob via protocolo cliente. Assina token após verificar sessão admin.

**Tipos aceitos**: `video/mp4`, `video/webm`, `video/quicktime`, `video/x-m4v`, `audio/mpeg`, `audio/mp4`, `audio/aac`, `audio/wav`, `audio/x-wav`, `audio/ogg`  
**Tamanho máximo**: 80MB

---

### `PUT /api/admin/audio`
Substitui a playlist completa da trilha de fundo. Persiste em `public/audio_config.json` via GitHub API.

**Body**
```json
{ "trilhas": [{ "nome": "Nome da Faixa", "url": "https://..." }] }
```

**Resposta** `200 { ok: true }` | `401 { ok: false }`

---

### `PUT /api/admin/cards`
Ativa ou desativa a exibição de um card no jogo em runtime. Persiste em `public/cards_ativos.json` via GitHub API.

**Body** `{ "dilema_id": "d01", "ativo": true }`

**Resposta** `200 { ok: true }` | `400/401 { ok: false }`

---

### `PUT /api/admin/codes`
Cria, atualiza ou remove código de sala (desbloqueio pós-oficina). Persiste em `public/room_codes.json` via GitHub API.

**Body**
```json
{ "codigo": "CRIA26", "label": "Encontro Jul/2026", "ativo": true }
```
Para remover: `{ "codigo": "CRIA26", "ativo": false }`.

**Resposta** `200 { ok: true }` | `400/401 { ok: false }`

---

### `PUT /api/admin/config`
Atualiza configurações gerais do site. Persiste em `public/site_config.json` via GitHub API.

**Body** `{ "spotniks_url": "https://youtu.be/..." }`

**Resposta** `200 { ok: true }` | `401 { ok: false }`

---

### `GET /api/admin/formularios`
Lista respostas da pesquisa qualitativa incluindo texto livre (admin-only). Máximo 500 registros, ordenados por `criado_em` desc.

**Resposta** `200 { ok: true, formularios: Formulario[] }` | `401/500 { ok: false, formularios: [] }`

---

### `GET /api/admin/registros`
Lista todas as inscrições no encontro, ordenadas por `criado_em` desc.

**Resposta** `200 { inscricoes: Inscricao[] }` | `401/500 { error: string }`

---

### `PUT /api/admin/registros`
Atualiza campos de uma inscrição. Campos ausentes são ignorados.

**Body**
```json
{
  "id": 42,
  "nome": "string (opcional)",
  "turma": "string (opcional)",
  "contato_valor": "string (opcional)",
  "presenca_confirmada": true
}
```

**Resposta** `200 { ok: true }` | `400/401/500 { error: string }`

---

### `DELETE /api/admin/registros`
Remove uma inscrição pelo id.

**Body** `{ "id": 42 }`

**Resposta** `200 { ok: true }` | `400/401/500 { error: string }`

---

### `GET /api/admin/memes`
Lista memes enviados (fila de moderação). Máximo 500, ordenados por `criado_em` desc.

**Resposta** `200 { ok: true, memes: Meme[] }` | `401/500 { ok: false, memes: [] }`

---

### `PUT /api/admin/memes`
Modera um meme (aprova, recusa ou volta para pendente).

**Body** `{ "id": 7, "status": "aprovado | recusado | pendente" }`

**Resposta** `200 { ok: true }` | `400/401/500 { ok: false }`

---

### `GET /api/admin/dilemas-draft`
Lista todos os rascunhos de dilema da comunidade, ordenados por `criado_em` desc.

**Resposta** `200 { ok: true, drafts: DraftRow[] }` | `401/500 { ok: false, drafts: [] }`

---

### `PUT /api/admin/dilemas-draft`
Cria ou atualiza um rascunho de dilema.

**Criar a partir de meme aprovado (idempotente — mesmo `meme_id` não duplica)**
```json
{
  "meme_id": 7,
  "meme_url": "https://... (opcional)",
  "autor_apelido": "nomedojovem (opcional)"
}
```
Resposta: `200 { ok: true, id: "uuid", already_exists?: true }`

**Atualizar campos de rascunho existente**
```json
{
  "id": "uuid-do-rascunho",
  "situacao_md": "string",
  "escolha_a_texto": "string",
  "escolha_a_efeitos": { "confianca": 1, "informacao": -1, "participacao": 0 },
  "escolha_b_texto": "string",
  "escolha_b_efeitos": { "confianca": -1, "informacao": 2, "participacao": 1 },
  "contexto_oculto_md": "string",
  "modulo": "participação | desinformação | eleição | território",
  "fonte_url": "https://...",
  "validado_por": "nome do revisor"
}
```
Resposta: `200 { ok: true }` | `400/401/500 { ok: false }`

> Rascunho com `status=publicado` não pode ser editado.

---

### `POST /api/admin/dilemas-draft/publicar`
Publica um rascunho no jogo: injeta em `dilemas_importados.json` e cria `cards_ativos[id] = false` via GitHub API. Marca rascunho como `publicado`.

**Guardrail obrigatório**: rejeita se `escolha_a_texto`, `escolha_b_texto` ou `contexto_oculto_md` estiverem vazios.

**Body** `{ "draft_id": "uuid-do-rascunho" }`

**Resposta**
- `200` `{ ok: true, dilema_id: "imp_xxxxxxxx" }`
- `401` não autenticado
- `404` rascunho não encontrado ou já publicado
- `409` dilema_id já existe em dilemas_importados.json
- `422` `{ ok: false, error: "validação falhou", detalhes: ["escolha_a_texto vazia"] }`
- `500` erro interno

> O dilema publicado entra com `cards_ativos[id] = false`. O facilitador usa a aba "Cards" para ligar quando quiser.

---

## Padrão de autenticação admin

```typescript
// Verificação em todos os handlers /api/admin/* (exceto login)
function authed(req: NextRequest): boolean {
  return req.cookies.get("ozipa_admin")?.value === "1"
}
```

Cookie definido como `httpOnly`, `sameSite: lax`, `path: /`, `maxAge: 28800` (8h).

> **Upload**: o callback `onUploadCompleted` do Vercel Blob vem dos servidores da Vercel (sem cookie de browser). A verificação de auth fica dentro de `onBeforeGenerateToken`, não no topo do handler.

---

## Códigos de status comuns

| Código | Significado |
|--------|-------------|
| `200` | Sucesso |
| `400` | Body inválido ou campo obrigatório ausente |
| `401` | Não autenticado (cookie ausente ou inválido) |
| `500` | Erro interno (geralmente falha no Supabase ou GitHub API) |
