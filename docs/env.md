# Variáveis de Ambiente — Vozes do Oziel

Configure em `.env.local` para desenvolvimento local e no painel da Vercel para produção.

---

## Variáveis obrigatórias

### `SUPABASE_URL`
URL do projeto Supabase.

Exemplo: `https://xyzxyzxyz.supabase.co`

Também pode ser fornecida como `NEXT_PUBLIC_SUPABASE_URL` (o código tenta as duas).

---

### `SUPABASE_SERVICE_ROLE_KEY`
Chave service role do Supabase. Ignora RLS — usada exclusivamente nas rotas de API do servidor.

**Nunca expor no cliente.** Não prefixar com `NEXT_PUBLIC_`.

---

### `BLOB_READ_WRITE_TOKEN`
Token de leitura/escrita do Vercel Blob. Usado nos endpoints de upload de vídeo, áudio e imagem de meme.

Obtido em: Vercel Dashboard → Project → Storage → Blob → Token.

---

### `GITHUB_TOKEN`
Personal Access Token do GitHub com permissão `contents:write` no repositório `danielarraesreino/ozipagame`.

Usado pelo CMS admin para persistir os JSONs de configuração (`video_urls.json`, `audio_config.json`, `cards_ativos.json`, `room_codes.json`, `site_config.json`) sem rebuild.

**Nunca expor no cliente.**

---

### `ADMIN_PASSWORD`
Senha de acesso ao painel `/admin`. Verificada em `POST /api/admin/login`.

**Nunca expor no cliente.**

---

## Variáveis opcionais

Nenhuma atualmente.

---

## Exemplo de `.env.local`

```bash
SUPABASE_URL=https://xyzxyzxyz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
GITHUB_TOKEN=ghp_...
ADMIN_PASSWORD=senha_segura_aqui
```

---

## Notas de segurança

- `SUPABASE_SERVICE_ROLE_KEY` ignora Row Level Security. Toda validação e anonimização ocorre nas rotas de API — nunca importar `supa()` em componente cliente.
- `GITHUB_TOKEN` deve ter escopo mínimo (`contents:write` só no repositório). Rotacionar se vazar.
- `ADMIN_PASSWORD` não tem rate limiting implementado — usar uma senha forte.
- `BLOB_READ_WRITE_TOKEN`: o upload público de memes (`/api/memes/upload`) não exige autenticação, mas está limitado a imagens (max 8MB) e usa sufixo aleatório para evitar enumeração.
