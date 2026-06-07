-- Vozes do Oziel — coleta anônima + co-autoria
-- Rode este script no SQL editor do Supabase (uma vez).
-- Princípio: NENHUM dado identificável de menor. Sem apelido nas partidas;
-- só bairro (grosso) e respostas do jogo. RLS trava tudo — acesso só via
-- service role nas rotas de API do Next. Dashboard público vê só agregados.

-- ── Partidas (uma por sessão de jogo, anônima) ──────────────────────────────
create table if not exists partidas (
  id            uuid primary key default gen_random_uuid(),
  bairro        text,
  total_cards   int,
  qtd_discordou int,
  criado_em     timestamptz default now()
);

-- ── Respostas (uma por card respondido) ─────────────────────────────────────
create table if not exists respostas (
  id                  bigint generated always as identity primary key,
  partida_id          uuid references partidas(id) on delete cascade,
  dilema_id           text,
  modulo              text,
  escolha             text check (escolha in ('right','left')),
  verificacao_status  text,
  criado_em           timestamptz default now()
);

-- ── Formulário qualitativo (fim do jogo) ────────────────────────────────────
-- Múltipla escolha: agregável no dashboard. Texto livre: SÓ admin, nunca público.
create table if not exists formularios (
  id               bigint generated always as identity primary key,
  bairro           text,
  faixa_idade      text,
  sentimento       text,
  ja_participou    text,
  opiniao_importa  int,
  onde_discute     text,
  texto_participar text,   -- admin-only
  texto_duvida     text,   -- admin-only
  criado_em        timestamptz default now()
);

-- ── Memes enviados (co-autoria) → fila de moderação ─────────────────────────
create table if not exists memes (
  id           bigint generated always as identity primary key,
  autor_apelido text,
  bairro       text,
  descricao    text,
  imagem_url   text,
  status       text default 'pendente' check (status in ('pendente','aprovado','recusado')),
  criado_em    timestamptz default now(),
  revisado_em  timestamptz
);

-- ── RLS: trava tudo (acesso só via service role) ────────────────────────────
alter table partidas    enable row level security;
alter table respostas   enable row level security;
alter table formularios enable row level security;
alter table memes       enable row level security;

-- ── Índices ─────────────────────────────────────────────────────────────────
create index if not exists idx_respostas_dilema on respostas(dilema_id);
create index if not exists idx_respostas_partida on respostas(partida_id);
create index if not exists idx_memes_status on memes(status);
create index if not exists idx_partidas_bairro on partidas(bairro);
