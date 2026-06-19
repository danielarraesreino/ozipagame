-- Vozes do Oziel — Avaliação pós-encontro (pesquisa FIM) + tag de momento.
-- Rode este script no SQL editor do Supabase (projeto crdcwqacvxwtrfdxaesr), uma vez.
-- Princípio igual ao schema.sql: NENHUM dado identificável de menor. Sem e-mail.
-- Gênero/idade/raça entram só como agregado anônimo. Texto livre = SÓ admin.

-- ── Avaliação do encontro (respondida no FIM, dia 20) ───────────────────────
-- Múltipla escolha: agregável no dashboard. Texto livre (por_que/te_marcou/
-- mudaria): admin-only, nunca no /dados público. Marca-várias = jsonb.
create table if not exists avaliacoes (
  id                  bigint generated always as identity primary key,
  genero              text,
  faixa_idade         text,
  raca                text,
  dificulta           jsonb,   -- array (marca várias)
  confianca_falar     text,    -- escala em palavras (5 pontos)
  o_que_e_politica    jsonb,   -- array (marca várias)
  vontade_participar  text,    -- escala em palavras (5 pontos)
  diminui_medo        text,    -- escala em palavras (4 pontos)
  por_que             text,    -- admin-only
  te_marcou           text,    -- admin-only
  mudaria             text,    -- admin-only
  criado_em           timestamptz default now()
);

alter table avaliacoes enable row level security;

-- ── Tag de momento na pesquisa baseline (formularios) ───────────────────────
-- Distingue a aplicação no INÍCIO do encontro (/inicio) da versão curta no fim
-- do jogo. Aditivo e nullable — não quebra linhas existentes.
alter table formularios add column if not exists momento text;
