# Verificação pós-deploy — Pesquisa (cadastro + não-resposta + Antes×Depois)

> Use este doc pra **comparar o deploy de produção** com o que foi construído.
> Cada item tem **onde checar** e **resultado esperado**. Marque ✅/❌ ao validar.

- **Commit:** `cfb2b89` · **PR:** #7 (`deploy3 → main`, mergeado 2026-06-24)
- **Projetos Vercel:** `jogo_ozipa` e `ozipagame` (checks Vercel passaram no PR)
- **Banco (projeto A):** `crdcwqacvxwtrfdxaesr` — `avaliacao.sql` já aplicado
- **Substitua** `<PROD>` pela URL de produção ao testar.

---

## 0. Migração de banco (pré-requisito do app)

| Item | Esperado | Status |
|---|---|---|
| Tabela `avaliacoes` existe | sim (RLS on) | ☐ |
| Coluna `formularios.momento` existe | sim (nullable) | ☐ |
| Projeto correto | `crdcwqacvxwtrfdxaesr` (NÃO o `ozhrykvjsobtkgyvxoio` do MCP) | ☐ |

> ⚠️ Se uma avaliação não salvar em prod, a env do app aponta pro projeto errado.

---

## 1. Tela de cadastro (`/admin` → aba ✍️ Cadastrar)

**Onde:** `<PROD>/admin` → login com senha da equipe → aba **✍️ Cadastrar**.

| Checar | Esperado | Status |
|---|---|---|
| Aba "✍️ Cadastrar" aparece na barra | entre Inscrições e Vídeos | ☐ |
| Sub-abas | "pesquisa inicial" e "avaliação (pós)" | ☐ |
| **pesquisa inicial** | seletor de momento (início / fim do jogo / página) + todas as perguntas | ☐ |
| Botão **"não respondeu"** | à direita de cada pergunta; ao ativar, deixa cinza e some a resposta | ☐ |
| Tipos de campo | pills (single), marca-várias (multi), escala 1–5, textos | ☐ |
| Botão salvar | "SALVAR FICHA + PRÓXIMA →" | ☐ |
| Após salvar | vira verde "✓ salvo", limpa form, sobe pro topo, contador +1 | ☐ |
| **avaliação (pós)** | gênero, idade, raça, dificulta, confiança pra falar, o que é política, vontade, diminui medo, 3 textos | ☐ |

**Verificação ponta-a-ponta:** cadastre 1 ficha de cada → confira que caiu no banco
(aba 📋 Pesquisa lista a inicial; avaliação via `GET /api/admin/avaliacao`).

---

## 2. "Não respondeu" honesto (`/api/dados` + `/dados`)

**Onde:** `<PROD>/dados` (público) e `<PROD>/api/dados` (JSON).

| Checar | Esperado | Status |
|---|---|---|
| Bucket no JSON | chave `"não respondeu"` aparece nas perguntas com branco | ☐ |
| Cálculo | não-resposta = perguntados − respondidos | ☐ |
| Ciente de momento | campos só-completa **não** contam como branco em ficha curta (`momento` = `fim_jogo`/`curta`) | ☐ |
| Escalas | objeto traz `nao_respondeu` separado da média | ☐ |
| Dashboard | barra **cinza** "não respondeu" sempre por último | ☐ |
| Escala no dashboard | linha "não respondeu: N" abaixo da barra | ☐ |

**Teste rápido:** cadastre 1 ficha marcando "não respondeu" em `confia_eleitos` →
o `/dados` deve mostrar +1 em "não respondeu" nessa pergunta (não sumir).

---

## 3. Comparação Antes × Depois (`/dados`)

**Onde:** `<PROD>/dados`, aparece só quando há **pesquisa inicial > 0 E avaliação > 0**.

| Checar | Esperado | Status |
|---|---|---|
| Seção "Antes × Depois do encontro" | card com borda laranja | ☐ |
| Aviso de método | texto "comparação de grupo, não de pessoa… cross-section anônimo" | ☐ |
| Par 1 | "falar o que pensa": à vontade 1–5 (antes) × confiança pra falar (depois) | ☐ |
| Par 2 | "medo de falar": % "medo de falar errado" (antes) × diminui_medo (depois) | ☐ |
| Par 3 | "o que trava participação": afasta (antes) × dificulta (depois) | ☐ |

---

## 4. Privacidade / não-regressão

| Checar | Esperado | Status |
|---|---|---|
| Texto livre no `/dados` público | **NUNCA** aparece (só agregado) | ☐ |
| `/api/dados` | sem linha crua, sem apelido, sem texto livre | ☐ |
| Endpoints admin novos | exigem cookie `ozipa_admin` (401 sem login) | ☐ |
| Abas antigas do admin | Inscrições, Vídeos, Cards, Trilha, Conteúdo, Pesquisa, Memes, Códigos intactas | ☐ |

---

## 5. Arquivos do deploy (referência)

```
A  src/lib/pesquisa.ts                     defs data-driven da pesquisa inicial + momentos
A  src/components/CadastroForm.tsx         tela de transcrição reutilizável
A  src/app/api/admin/avaliacao/route.ts    POST/GET avaliação (admin)
M  src/app/api/admin/formularios/route.ts  + POST (transcrição)
M  src/app/api/dados/route.ts              não-resposta ciente de momento
M  src/app/dados/page.tsx                  cinza + Antes×Depois
M  src/app/admin/page.tsx                  aba Cadastrar
A  docs/analise_pesquisa.md                roteiro freakonomics (dia 31)
A  PLANO_PESQUISA_PARCEIROS.md             apresentação pros parceiros
```

Verde local: `npx tsc --noEmit` e `npx eslint` (0 erros). Screenshots das 2 sub-abas conferidas.

---

## 6. Rollback (se algo quebrar em prod)

- Reverter o merge: `git revert -m 1 <merge-commit-de-#7>` → novo deploy.
- Banco é **aditivo** (table + coluna nullable) — não precisa reverter; não quebra o que existia.
- Nenhum dado foi apagado.

---

*Vozes do Oziel · Grupo Diálogos / CriaLab*
