<p align="center">
  <img src="assets/banner.svg" alt="Mural de investigação do probable-cause" width="100%">
</p>

# probable-cause

[![CI](https://github.com/Paula-Thamyres/probable-cause/actions/workflows/ci.yml/badge.svg)](https://github.com/Paula-Thamyres/probable-cause/actions/workflows/ci.yml) [![Licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-blue.svg)](LICENSE)

Jogo de dedução em que você é um civil escolhido ao acaso entre 12 e precisa se esconder de um detetive controlado por uma IA bayesiana, que recalcula a suspeita sobre cada civil a cada pista deixada.

Jogue direto no navegador, sem instalar nada: [probable-cause-hazel.vercel.app](https://probable-cause-hazel.vercel.app/)

## 1. O jogo

`suspeita sobre você: █░░░░░░░░░ 12%`

O objetivo é eliminar 5 alvos antes que o detetive descubra quem você é. Você perde se for acusado, se passar de 12 turnos ou se não restarem alvos suficientes.

![Partida em andamento](assets/captura.png)

## 2. Como jogar

`suspeita sobre você: ███░░░░░░░ 35%`

Cada civil tem uma região (Centro, Norte, Sul, Leste ou Oeste) e turnos livres (manhã, tarde ou noite). Você só pode eliminar em um turno em que você mesmo está livre. A cada turno, uma ação:

| Ação | O que faz |
| --- | --- |
| Eliminar | Escolhe pessoa e turno. Deixa uma pista na região do alvo, no turno escolhido. |
| Pista falsa | Deixa uma pista na região de outra pessoa, no primeiro turno livre dela, para desviar a suspeita. |
| Álibi | Reduz pela metade a suspeita sobre você e redistribui o resto entre os outros. |
| Esperar | Passa o turno. |

Modo difícil: uma caixinha no topo esconde as barras e as porcentagens, mantém a lista em ordem fixa e mostra só um nível de alerta (baixo, médio ou alto).

## 3. A IA do detetive

`suspeita sobre você: ██████░░░░ 60%`

A suspeita é uma distribuição de probabilidade sobre os civis, atualizada pela regra de Bayes a cada pista e normalizada para somar 1:

$$\text{posterior} \propto \text{prior} \times \text{verossimilhança}$$

A cada turno o detetive também escolhe 3 pontos para vigiar, entre 15 possíveis (5 regiões por 3 turnos), onde os suspeitos mais prováveis têm mais chance de agir. Uma pista deixada em qualquer ponto vigiado conta como testemunhada e pesa muito mais.

Quando a suspeita sobre alguém chega a 90%, ele acusa. Se for você, o jogo acaba. Se for um inocente, a pessoa é presa, o detetive fica abalado e as crenças se espalham de novo.

Os valores usados no cálculo, como `REGION_MATCH_LIKELIHOOD`, ficam em `src/ai/suspicion.ts`, para ajustar a dificuldade sem mexer no resto.

Por que três civis empatam em 33%? Uma pista só identifica alguém quando o lugar e o turno são exclusivos dessa pessoa. Se três civis do Centro estão livres à noite, uma pista ali deixa os três com a mesma suspeita e ninguém é preso. Já a Yuki é a única do Norte livre de manhã, então uma pista nesse ponto aponta direto para ela.

Limitação conhecida: os pontos vigiados aparecem na tela antes da sua jogada, então ainda dá para desviar deles. O número de pontos vigiados fica em `WATCH_COUNT`, em `src/ai/detective.ts`, para ajustar a dificuldade.

## 4. Arquitetura

`suspeita sobre você: ████████░░ 78%`

```
src/
  ai/           crenças, atualização bayesiana, álibi e detetive que vigia
  game/         regras, estado, ações, acusação, registro de jogadas e nível de alerta
  data/         os 12 civis e os textos em português, inclusive as frases do registro
  hooks/        useGame
  components/   TerminalPanel, DetectivePanel, Notebook, CluesPanel, ActionBar, EventLog
  test/         preparação dos testes de interface (jsdom)
  App.tsx       layout, modo difícil e mensagem de fim de jogo
```

As regras ficam em funções puras e o estado é imutável, então dá para testar tudo sem abrir a interface. São 112 testes em 16 arquivos, ao lado do código (`*.test.ts` e `*.test.tsx`). Os de lógica cobrem regras e IA, e os de interface, feitos com Testing Library, cobrem o painel REGISTRO, os botões de ação e uma partida completa pela tela. A cobertura é de cerca de 99% das instruções e 94% dos ramos (`npm run coverage`).

Algumas decisões de projeto:

- `applyAction` recebe um estado e uma ação e devolve um estado novo, sem alterar o anterior. A interface só chama essa função, e por isso a lógica é testada sem abrir a tela.
- A suspeita do detetive é bayesiana: a cada pista, a crença sobre cada civil é multiplicada pela chance daquela pista (região e turno) e depois normalizada. Uma pista em ponto vigiado pesa mais. Um dos testes confere o resultado de um caso calculado à mão.
- O detetive vigia 3 pontos: os de maior chance de receber uma pista, somando o que ele acredita sobre cada suspeito.
- Violações das regras viram `GameError`. A interface mostra uma mensagem em português e registra qualquer outro erro no console.
- O sorteio do jogador pode ser trocado por um gerador fixo, o que permite testar o início da partida.

## 5. Como rodar

`suspeita sobre você: █████████░ 91%`

Precisa do Node (testado com a versão 24).

```bash
npm install
npm run dev      # abre em http://localhost:5173/
npm test
npm run build
npm run lint
npm run format      # formata o código com Prettier
npm run coverage    # testes com relatório de cobertura
```

Saída do `npm test`:

```
 ✓ src/game/alert.test.ts (4 tests)
 ✓ src/ai/countermeasures.test.ts (6 tests)
 ✓ src/ai/suspicion.test.ts (10 tests)
 ✓ src/ai/detective.test.ts (6 tests)
 ✓ src/game/state.test.ts (5 tests)
 ✓ src/game/selectors.test.ts (6 tests)
 ✓ src/data/eventMessages.test.ts (6 tests)
 ✓ src/game/watch.test.ts (7 tests)
 ✓ src/game/accusation.test.ts (8 tests)
 ✓ src/game/events.test.ts (8 tests)
 ✓ src/game/actions.test.ts (18 tests)
 ✓ src/game/outcome.test.ts (5 tests)
 ✓ src/components/EventLog.test.tsx (5 tests)
 ✓ src/components/ActionBar.test.tsx (8 tests)
 ✓ src/hooks/useGame.test.ts (6 tests)
 ✓ src/App.test.tsx (4 tests)

 Test Files  16 passed (16)
      Tests  112 passed (112)
```

O GitHub Actions confere a formatação, roda lint, testes e build a cada envio para a `main`. O resultado aparece no selo do topo.

## 6. Licença

`suspeita sobre você: ██████████ 100%`

Projeto distribuído sob a licença MIT. O texto completo está em [LICENSE](LICENSE).

---

Se você chegou até aqui, o detetive já tem o seu nome.
