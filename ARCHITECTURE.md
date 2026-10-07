# Architecture & Design Document

Este documento descreve as abordagens arquiteturais para atender aos requisitos do Pirate Battle.

## 1. Integração React e PixiJS

A estrutura base separa estritamente a "Lógica de Jogo/Renderização Gráfica" (PixiJS) da "Interface de Usuário e Estado do App" (React).
A classe `GameApplication` (Singleton) gerencia a aplicação do PixiJS e é montada em uma div persistente renderizada por um componente React (`GameCanvas.tsx`).
Isso garante que o React não interfira no `requestAnimationFrame` do Canvas, que roda solto de re-renders. A comunicação entre esses dois mundos ocorre por meio de uma classe estática `EventEmitter` local (`gameEvents`) e da store global do `Zustand`.

## 2. Ciclo de Vida e Simulação

A engine principal possui um método `update(delta)` ancorado no Ticker do PixiJS.
O ciclo é responsável por:
- Atualizar a movimentação física de projéteis e entidades.
- Resolver comportamentos de IA contextual (Context-Based Steering) dos inimigos (Chasers e Shooters).
- Processar AABB (Axis-Aligned Bounding Box) simplificado contra o mapa de colisão (`TiledMapParser`) que converte camadas "water" e "islands" do Tiled.
- Disparar instâncias de dano se a colisão ocorrer.

## 3. Gerenciamento de Recursos

Os assets (spritesheets, json e áudios) são pré-carregados assincronamente através de um sistema robusto usando `Assets.load` nativo do PixiJS na tela de Loading.
Não há instâncias pesadas rodando na tela de início. As entidades usam `Sprite` atreladas aos textures do bundle e são destruídas e limpas (`destroy({ children: true })`) quando derrotadas, para manter O(1) de memória limpa sem memory leak através das rodadas.

## 4. Persistência de Dados e Network (Mock)

Ao final do `Game Over`, se o jogador tiver navegado ao log, a mutação da pontuação e registro é efetuada utilizando o Axios via React Query (`useMutation`). 
Essa requisição bate no nosso `MSW` (Mock Service Worker), que a intercepta e grava o resultado da API local no banco da web (`window.localStorage`).
Isso garante que o App rode puramente client-side para fins de desafio/análise, mas preserva a anatomia real que ele teria consumindo um microsserviço de Backend, além de sobreviver a recarregamentos de página (F5) usando caches do TanStack Query.

## 5. Balanceamento e Limitações
- **Spawns**: Encontramos os pontos mais distantes da tela ignorando o raio ao redor do jogador para garantir spawns seguros e distantes, além de validá-los contra a máscara das ilhas.
- **Movimentação (Pathfinding)**: Desenvolvemos um Algoritmo de "Context-based Steering" simplificado com Raycasting em 16 direções para os inimigos desviarem de ilhas. Em casos de becos sem saída complexos os inimigos podem adotar velocidade reduzida enquanto não houverem rotas lógicas contíguas. 
- **Colisões**: Baseadas primariamente no centro da Sprite com raio modular (círculo) por razões de performance. Navios mais angulados podem ter pequenas frestas estéticas nas pontas colidindo, priorizando mecânica fluída no lugar de polígonos perfeitos (Polygon-SAT).
