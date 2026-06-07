# Vozes do Oziel — Licença, Dados Abertos e Princípios CriaLab

> Documento de governança do conhecimento gerado pelo projeto.
> Grupo Diálogos · CriaLab · Minha Campinas · Fundação FEAC · Jardim Oziel, Campinas-SP.

---

## 1. Por que dados abertos

O **CriaLab** financia, pelo Fundo Semente, a criação e o teste de um **modelo replicável de solução** para problemas de participação popular. Um modelo só é replicável se for **aberto**: o conhecimento que sai daqui — o conceito do jogo, o método e os dados agregados sobre a juventude — pertence à comunidade e a quem quiser levar a ideia pra outro território.

Por isso o projeto adota, por princípio inegociável, a abertura no molde de iniciativas como o `caminhos-cps.social`: **dados abertos, código aberto, método aberto.**

---

## 2. Licença

### 2.1 Dados agregados e documentação
Os **dados agregados** publicados em `/dados` (e no endpoint `/api/dados`) e esta documentação são licenciados sob:

> **Creative Commons Atribuição-CompartilhaIgual 4.0 Internacional (CC BY-SA 4.0)**
> https://creativecommons.org/licenses/by-sa/4.0/deed.pt-BR

Você pode **copiar, redistribuir, remixar, transformar e usar** (inclusive para fins não previstos), desde que:
- **Atribua** o crédito: *"Vozes do Oziel — Grupo Diálogos / CriaLab / Minha Campinas / FEAC"*, com link para a fonte.
- **CompartilheIgual:** se remixar ou transformar, distribua sob a mesma licença CC BY-SA 4.0.

### 2.2 Memes co-autorados
Memes enviados pela comunidade e **aprovados** são creditados ao autor (apelido) e tratados como **co-autoria comunitária**, sob a mesma CC BY-SA 4.0. Envio não aprovado não é publicado.

### 2.3 Código
O código do jogo é aberto no repositório. A equipe pode definir a licença de software (recomendado: MIT ou GPL) — independente da licença dos dados/conteúdo.

---

## 3. O que é aberto e o que é protegido

Por serem **dados de adolescentes (12–17 anos)**, a abertura segue um limite ético rígido. A LGPD (art. 14) exige proteção reforçada a dados de menores.

| ✅ Aberto (CC BY-SA) | 🔒 Protegido — nunca publicado |
|---|---|
| Números e gráficos **agregados** | Respostas **individuais** |
| % concordo/discordo por dilema | **Apelido** (não é nem coletado no servidor) |
| Distribuições da pesquisa (idade, sentimentos, escalas…) | **Texto livre** dos jovens (fica só com a equipe) |
| Conceito, mecânica e método do jogo | Qualquer dado que identifique uma pessoa |
| Memes aprovados (com crédito) | Memes pendentes/recusados |

**Garantia técnica:** as tabelas têm RLS travado; todo acesso passa por API no servidor; o dashboard recebe **apenas agregados** calculados no backend. Linha crua nunca sai.

---

## 4. Anonimato por desenho

- O jogo **não tem cadastro nem login**. Apelido e bairro ficam só no `localStorage` do celular.
- O servidor guarda, por partida: **bairro** (grosso, não identifica) + as **escolhas** do jogo. Sem apelido, sem IP persistido, sem rastreio entre sessões.
- A pesquisa é anônima; o texto livre é separado dos agregados públicos.

---

## 5. Alinhamento com as diretrizes do CriaLab

| Diretriz CriaLab | Como o projeto cumpre |
|---|---|
| **Modelo replicável de solução** | Código + método + dados abertos permitem replicar em outro bairro. |
| **Protagonismo juvenil / co-autoria** | Canal de envio de memes; a juventude alimenta o conteúdo (com crédito). |
| **Linguagem do território** | Meme, swipe e print de WhatsApp — a lógica que o público de 12–17 já domina. |
| **Participação popular** | A pesquisa mede as dores e o jogo devolve repertório sobre política do cotidiano. |
| **Prestação de contas e transparência** | Dados abertos públicos; qualquer um audita os agregados. |
| **Cuidado com o público (menores)** | Anonimato por desenho + moderação + texto livre nunca publicado. |

---

## 6. Como citar

> Grupo Diálogos (2026). *Vozes do Oziel — Cidadania Conectada*. CriaLab / Minha Campinas / Fundação FEAC, Jardim Oziel, Campinas-SP. Dados abertos sob CC BY-SA 4.0. https://jogoozipa.vercel.app/dados

---

## 7. Contato

Coletivo Aru a Tem Voz / Grupo Diálogos · coletivoaruatemvoz@gmail.com

---

*Conhecimento da quebrada, aberto pra quebrada.*
