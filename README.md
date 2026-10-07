# Pirate Battle Game

Um shooter naval 2D com visão superior construído com React, TypeScript, PixiJS e integrado a um backend mockado (MSW) e TanStack Query.

## Tecnologias e Decisões

- **Engine Gráfica**: PixiJS v8 para alta performance 2D.
- **UI & Estado**: React 19, Zustand para estado global síncrono da partida, TanStack Query para comunicação HTTP.
- **Networking/Mocking**: Axios + MSW executando Service Worker no front-end para simular o servidor perfeitamente.
- **Testes**: Playwright cobrindo os fluxos principais (Start, Config, Gameplay, Game Over, Persistência).

## Como rodar localmente (Setup)

1. Clone o repositório e acesse a pasta raiz.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o ambiente de desenvolvimento:
   ```bash
   npm run dev
   ```
   *O MSW será inicializado automaticamente interceptando as requisições para `/api/ranking` e `/api/history`.*

## Comandos Úteis

- `npm run dev`: Executa a aplicação localmente no Vite.
- `npm run build`: Verifica tipos com tsc e gera os estáticos de produção.
- `npm run preview`: Sobe um servidor local testando a pasta `dist` gerada no build.
- `npm run test`: Executa os testes E2E em background no Playwright.
- `npm run test:ui`: Executa os testes E2E abrindo a interface do Playwright.

## Controles e Gameplay

- **W, A, S, D** ou **Setas**: Movimentação e Rotação do navio.
- **Espaço**: Disparo Frontal.
- **E / Enter**: Disparos Laterais (Canhões a bombordo e estibordo).
- **Esc**: Pausa / Retoma a partida.

Na tela principal (`OPTIONS`), é possível ajustar livremente a Duração da Partida e a Taxa de Spawn (nascimento) de Inimigos.

## Cenários de Rede & Limitações

A camada de dados (`MSW`) armazena as vitórias no `localStorage`. Não há banco de dados real. Ao limpar o cache do navegador, os dados do "Captain's Log" serão resetados.
- Não existem falhas simuladas constantes (apenas timeouts de infra padrão). 
- Pontuações menores ou iguais a zero são ignoradas na tabela de Ranking, mas logadas no Histórico.
