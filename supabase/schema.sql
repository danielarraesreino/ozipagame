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

-- ── Pesquisa qualitativa (curta no fim do jogo + página /pesquisa) ──────────
-- Múltipla escolha/escala: agregável no dashboard. Texto livre: SÓ admin.
-- Campos de marcar-várias guardados como jsonb (array de strings).
create table if not exists formularios (
  id                bigint generated always as identity primary key,
  bairro            text,
  faixa_idade       text,
  estuda            text,
  sentimentos       jsonb,   -- array (marca várias)
  afeta_vida        int,     -- escala 1–5
  avontade_opinar   int,     -- escala 1–5
  confia_eleitos    int,     -- escala 1–5
  afasta            jsonb,   -- array (marca várias)
  ja_participou     text,
  onde_discute      jsonb,   -- array (marca várias)
  sabia_participar  text,
  texto_participar  text,    -- admin-only
  texto_duvida      text,    -- admin-only
  criado_em         timestamptz default now()
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

-- ── Inscrições no encontro (20 de julho) ────────────────────────────────────
-- Dado identificável de participante do evento. RLS trava: leitura/edição só
-- via service role no admin. presenca_confirmada = check-in feito pelo admin.
create table if not exists inscricoes (
  id                  bigint generated always as identity primary key,
  nome                text,
  idade               text,
  turma               text,
  confirmou_presenca  boolean,   -- topou no formulário público
  contato_tipo        text,
  contato_valor       text,
  presenca_confirmada boolean default false,  -- check-in pelo admin
  criado_em           timestamptz default now()
);

-- ── RLS: trava tudo (acesso só via service role) ────────────────────────────
alter table partidas    enable row level security;
alter table respostas   enable row level security;
alter table formularios enable row level security;
alter table memes       enable row level security;
alter table inscricoes  enable row level security;

-- ── Índices ─────────────────────────────────────────────────────────────────
create index if not exists idx_respostas_dilema on respostas(dilema_id);
create index if not exists idx_respostas_partida on respostas(partida_id);
create index if not exists idx_memes_status on memes(status);
create index if not exists idx_partidas_bairro on partidas(bairro);
