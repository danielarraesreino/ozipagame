# API Reference — Vozes do Oziel

Base URL de produção: `https://jogoozipa.vercel.app`

Autenticação admin: cookie httpOnly `ozipa_admin=1`, obtido via `POST /api/admin/login`, válido por 8h.

---

## Endpoints Públicos

### POST /api/register
Registra inscrição de participante no encontro presencial.

**Body**
```json
{
  "nome": "string (max 200)",
  "idade": "string (max 10)",
  "turma": "string (max 100)",
  "confirmou_presenca": true,
  "contato_tipo": "WhatsApp | SMS | Email | não precisa (opcional)",
  "contato_valor": "string (opcional, max 200)"
}
```
**Resposta** `200 { ok: true }` | `500 { ok: false }`

---

### POST /api/inscricao
Alias legado de `/api/register`. Mantido para compatibilidade. Aceita o mesmo body.

---

### POST /api/form
Registra resposta da pesquisa qualitativa anônima. Campos ausentes ficam nulos (suporta versão curta e completa).

**Body**
```json
{
  "bairro": "string (max 40, opcional)",
  "faixa_idade": "string (max 20, opcional)",
  "estuda": "string (max 40, opcional)",
  "sentimentos": ["string", "..."],
  "afeta_vida": 1,
  "avontade_opinar": 3,
  "confia_eleitos": 2,
  "afasta": ["string", "..."],
  "ja_participou": "string (max 40)",
  "onde_discute": ["string", "..."],
  "sabia_participar": "string (max 60)",
  "texto_participar": "string (max 500, opcional)",
  "texto_duvida": "string (max 500, opcional)"
}
```
**Resposta** `200 { ok: true }` | `500 { ok: false }`

---

### POST /api/track
Registra partida anônima e respostas ao fim do jogo. Nenhum dado pessoal é gravado.

**Body**
```json
{
  "bairro": "string (max 40)",
  "qtd_discordou": 2,
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
**Resposta** `200 { ok: true }` | `400 { ok: false }` (results vazio) | `500 { ok: false }`

---

### GET /api/dados
Dados abertos agregados (Creative Commons BY-SA 4.0). Nunca expõe linhas cruas nem texto livre. Configurado com `force-dynamic` para leitura ao vivo.

**Resposta**
```json
{
  "licenca": "CC BY-SA 4.0",
  "projeto": "Vozes do Oziel — Grupo Diálogos / CriaLab",
  "gerado_em": "ISO8601",
  "jogo": {
    "total_partidas": 0,
    "por_bairro": { "Oziel": 0 },
    "total_respostas": 0,
    "por_dilema": [
      { "dilema_id": "d01", "modulo": "participação", "concordo": 0, "discordo": 0 }
    ],
    "fact_check": { "falso": 0, "enganoso": 0 }
  },
  "pesquisa": {
    "total": 0,
    "faixa_idade": {},
    "estuda": {},
    "sentimentos": {},
    "afeta_vida": { "media": null, "dist": {} },
    "avontade_opinar": { "media": null, "dist": {} },
    "confia_eleitos": { "media": null, "dist": {} },
    "afasta": {},
    "ja_participou": {},
    "onde_discute": {},
    "sabia_participar": {}
  }
}
```

---

### GET /api/videos
Lê `public/video_urls.json` e retorna mapa `{ [dilema_id]: url }`. Mantido para compatibilidade — o jogo prefere o arquivo estático direto.

---

### POST /api/memes
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
Pelo menos `descricao` ou `imagem_url` devem estar presentes.

**Resposta** `200 { ok: true }` | `400 { ok: false }` | `500 { ok: false }`

---

### POST /api/memes/upload
Upload de imagem de meme para o Vercel Blob (endpoint público). Usa o protocolo `@vercel/blob/client` — o browser envia o arquivo diretamente ao Blob; esta rota apenas assina o token.

**Restrições**: apenas `image/jpeg`, `image/png`, `image/webp`, `image/gif`; máximo 8MB.

---

## Endpoints Admin (requerem cookie `ozipa_admin=1`)

### POST /api/admin/login
Autentica o admin. Define cookie httpOnly por 8h.

**Body** `{ "password": "string" }`
**Resposta** `200 { ok: true }` | `401 { ok: false }`

---

### DELETE /api/admin/login
Encerra a sessão removendo o cookie.

**Resposta** `200 { ok: true }`

---

### PUT /api/admin/videos
Associa ou remove URL de vídeo de pílula a um dilema. Persiste em `video_urls.json` via GitHub API.

**Body** `{ "dilema_id": "string", "url": "string (omitir para remover)" }`
**Resposta** `200 { ok: true }` | `400/401 { ok: false }`

---

### POST /api/admin/upload
Upload de vídeo ou áudio para o Vercel Blob via protocolo cliente. Assina o token após verificar sessão.

**Tipos aceitos**: `video/mp4`, `video/webm`, `video/quicktime`, `video/x-m4v`, `audio/mpeg`, `audio/mp4`, `audio/aac`, `audio/wav`, `audio/x-wav`, `audio/ogg`
**Tamanho máximo**: 80MB

---

### PUT /api/admin/audio
Substitui a playlist inteira da trilha de fundo. Persiste em `audio_config.json` via GitHub API.

**Body** `{ "trilhas": [{ "nome": "string", "url": "string" }] }`
**Resposta** `200 { ok: true }` | `401 { ok: false }`

---

### PUT /api/admin/cards
Liga ou desliga a exibição de um card no jogo em tempo de execução. Persiste em `cards_ativos.json` via GitHub API.

**Body** `{ "dilema_id": "string", "ativo": true | false }`
**Resposta** `200 { ok: true }` | `400/401 { ok: false }`

---

### PUT /api/admin/codes
Cria, atualiza ou remove um código de sala (desbloqueio pós-oficina). Persiste em `room_codes.json` via GitHub API.

**Body** `{ "codigo": "string", "label": "string (opcional)", "ativo": false (omitir para criar/manter) }`

Quando `ativo === false`, o código é removido. Caso contrário é criado/atualizado.

**Resposta** `200 { ok: true }` | `400/401 { ok: false }`

---

### PUT /api/admin/config
Atualiza configurações gerais do site. Persiste em `site_config.json` via GitHub API.

**Body** `{ "spotniks_url": "string (URL do vídeo de inspiração)" }`
**Resposta** `200 { ok: true }` | `401 { ok: false }`

---

### GET /api/admin/formularios
Lista respostas da pesquisa qualitativa, incluindo texto livre (admin-only). Máximo 500 registros, ordenados por `criado_em` desc.

**Resposta** `200 { ok: true, formularios: Formulario[] }` | `401/500 { ok: false, formularios: [] }`

---

### GET /api/admin/registros
Lista todas as inscrições no encontro presencial, ordenadas por `criado_em` desc.

**Resposta** `200 { inscricoes: Inscricao[] }` | `401/500 { error: string }`

---

### PUT /api/admin/registros
Atualiza campos permitidos de uma inscrição.

**Body** `{ "id": number, "nome"?, "idade"?, "turma"?, "contato_tipo"?, "contato_valor"?, "presenca_confirmada"? }`
**Resposta** `200 { ok: true }` | `400/401/500 { error: string }`

---

### DELETE /api/admin/registros
Remove uma inscrição pelo id.

**Body** `{ "id": number }`
**Resposta** `200 { ok: true }` | `400/401/500 { error: string }`

---

### GET /api/admin/memes
Lista memes enviados pela comunidade (fila de moderação). Máximo 500, ordenados por `criado_em` desc.

**Resposta** `200 { ok: true, memes: Meme[] }` | `401/500 { ok: false, memes: [] }`

---

### PUT /api/admin/memes
Modera um meme.

**Body** `{ "id": number, "status": "pendente" | "aprovado" | "recusado" }`
**Resposta** `200 { ok: true }` | `400/401/500 { ok: false }`

---

## Padrão de Autenticação Admin

Todos os endpoints `/api/admin/*` (exceto `login`) verificam o cookie `ozipa_admin=1` via:

```typescript
function authed(req: NextRequest) {
  return req.cookies.get("ozipa_admin")?.value === "1"
}
```

O cookie é definido como `httpOnly`, `sameSite: lax`, `path: /`, `maxAge: 28800` (8h).

**Nota sobre upload**: o callback `onUploadCompleted` do Vercel Blob vem dos servidores da Vercel (sem cookie). Por isso a verificação de auth fica dentro de `onBeforeGenerateToken`, não no topo do handler.
