# Prompt para o Claude (navegador) — Apresentação visual do Vozes do Oziel

Copie **tudo abaixo da linha** e cole no Claude (claude.ai). Depois, anexe os prints e vídeos da pasta `docs/apresentacao/`. Ele vai gerar um **artefato HTML** (apresentação navegável) que você pode abrir, projetar e exportar.

---

Você é um(a) designer de apresentações de altíssimo nível. Crie uma **apresentação visual em HTML** (um único arquivo, como artefato), bonita, moderna e navegável por slides (setas do teclado + clique), **mobile e projetor friendly**, explicando o projeto **"Vozes do Oziel — Cidadania Conectada"**.

## Sobre o projeto
Serious game web mobile-first para adolescentes de 12 a 17 anos do **Jardim Oziel, Campinas-SP**. É o EAD de um curso híbrido do **Grupo Diálogos** (CriaLab · Minha Campinas · Fundação FEAC). Mecânica estilo Tinder/Reigns: o jovem **arrasta memes políticos** para concordo (direita) ou discordo (esquerda); cada escolha **revela o contexto que o meme esconde** e por que aquilo importa pro bairro. Sessão de 3–5 min, sem cadastro, 100% anônimo.

**Problema que ataca:** jovens têm visão restrita da política, acham que "não é pra eles", têm medo de opinar e descrença com quem é eleito. **A virada:** em vez de expor o jovem a um ambiente intimidador, oferecemos vivência lúdica; o meme, que normalmente polariza e simplifica, vira a porta de entrada para restaurar o que ele apaga (alfabetização midiática embutida na mecânica, não em aula).

## Funcionalidades a destacar
1. **O jogo** — swipe em memes, revelação da consequência, fact-check (falso/enganoso/verdadeiro), pílula de sabedoria, vídeos.
2. **Trilha sonora** — playlist de raps de fundo + sons de swipe.
3. **Pesquisa qualitativa anônima** — mede as dores dos jovens com política (sentimentos, confiança em eleitos, o que afasta da participação).
4. **Dashboard de dados abertos** (`/dados`) — agregados anônimos, licença **Creative Commons CC BY-SA 4.0**, conhecimento da quebrada aberto pra quebrada.
5. **Co-autoria** — a comunidade envia memes que, aprovados, viram conteúdo.
6. **Privacidade primeiro** — dados de menores: anônimo por desenho, dashboard só agregado, texto livre nunca publicado.

## Identidade visual (use exatamente isto)
- **Conceito:** balão de fala partido em dois tons com o gesto de deslize ‹ › (o diálogo + a mecânica concordo/discordo). Estética **zine / risograph / cartaz de protesto** — ousada, jovem, contraste forte.
- **Cores:** fundo grafite `#13130E` · texto creme `#F7F1E6` · destaque laranja `#EA5B1E` · acento amarelo `#FFD21E` · verde (concordo) `#26C79A` · vermelho (discordo) `#E8402F`.
- **Tipografia:** títulos em uma **grotesca black condensada caixa-alta** (ex.: Archivo Black / Anton), com leading curto; rótulos em **mono** espaçado (ex.: Space Mono). Use Google Fonts.
- **Detalhes:** textura de meio-tom (halftone) sutil no fundo escuro, **sombras duras offset** (sem blur), selos/carimbos, faixas mono em caixa-alta. Evite cara de slide corporativo genérico.

## Estrutura sugerida dos slides
1. **Capa** — lockup "VOZES DO OZIEL", tagline "CIDADANIA CONECTADA", o balão.
2. **O problema** — a dor da juventude com política (frases de impacto).
3. **A virada** — o meme como porta de entrada; "o jogo é o EAD".
4. **Como funciona** — swipe → consequência → o que o meme apaga (use os prints/gif do gameplay).
5. **Trilha + experiência** — som, ritmo, linguagem do território.
6. **Pesquisa** — o que perguntamos e por quê (as dores).
7. **Dados abertos + Creative Commons** — o princípio de abertura, o dashboard.
8. **Co-autoria** — a quebrada produz o conteúdo.
9. **Privacidade** — cuidado com menores (anônimo, agregado, moderado).
10. **Quem faz** — Grupo Diálogos · CriaLab · Minha Campinas · FEAC.
11. **Fechamento** — "{seu bairro} tem voz." + chamada (jogar / ver dados).

## Mídia
Vou anexar **prints** (telas reais do jogo) e **vídeos curtos** (gameplay). Crie **espaços marcados** para encaixar cada mídia nos slides correspondentes (ex.: um quadro com legenda "[print: tela de entrada]"), de forma que eu só troque pelo arquivo. Para os vídeos, use `<video controls>` com molduras na cor da marca (borda + sombra dura).

## Requisitos técnicos
- Um único arquivo HTML autocontido (CSS + JS inline), sem dependências externas além de Google Fonts.
- Navegação por slides: setas ←/→, clique, e indicador de progresso.
- Responsivo (funciona no celular e projetado em tela cheia).
- Acessível: contraste alto, foco visível.
- Comece com uma versão completa; depois eu peço ajustes.

Capriche — quero algo que faça a banca do CriaLab e o pessoal do bairro falarem "que isso ficou lindo".
