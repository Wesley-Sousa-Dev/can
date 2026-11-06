# Guia para agentes

Projeto Next.js 16 (App Router) com React 19, TypeScript e Tailwind CSS v4.

## Manual de identidade visual

Toda interface deste projeto segue o manual abaixo. Use apenas as fontes, os tamanhos, as cores e as sombras listados aqui. Se um caso não estiver coberto, pergunte antes de criar um valor novo.

O manual define uma única paleta, de fundo escuro. Não crie variações de tema claro por conta própria.

### Tipografia

A família da fonte depende do tamanho do texto:

- De `xxxx-large` a `x-large`: **Rajdhani**.
- De `large` a `small`: **Roboto**.

| Nome       | Família  | Tamanho         | Token               |
| ---------- | -------- | --------------- | ------------------- |
| xxxx-large | Rajdhani | 48px (3rem)     | `--text-xxxx-large` |
| xxx-large  | Rajdhani | 40px (2.5rem)   | `--text-xxx-large`  |
| xx-large   | Rajdhani | 32px (2rem)     | `--text-xx-large`   |
| x-large    | Rajdhani | 24px (1.5rem)   | `--text-x-large`    |
| large      | Roboto   | 20px (1.25rem)  | `--text-large`      |
| medium     | Roboto   | 16px (1rem)     | `--text-medium`     |
| small      | Roboto   | 14px (0.875rem) | `--text-small`      |

As famílias usam os tokens `--font-display` (Rajdhani) e `--font-sans` (Roboto).

O manual não define pesos de fonte nem altura de linha. Os valores abaixo foram decididos pelo projeto em 03/11/2026:

| Faixa                    | Peso                                                | Altura de linha |
| ------------------------ | --------------------------------------------------- | --------------- |
| `xxxx-large` a `x-large` | Rajdhani 600 (`font-semibold`)                      | 1,2             |
| `large` a `small`        | Roboto 400 (`font-normal`) e 500 (`font-medium`)    | 1,5             |

Use o peso 500 do Roboto em botões, preços e destaques. A altura de linha 1,5 no corpo atende o critério AAA 1.4.8 da WCAG. Os pesos e as alturas já estão embutidos nos tokens `--text-*`, então `text-x-large` aplica 600 e 1,2 automaticamente.

### Cores

| Grupo       | Uso               | Hex       | Token                     |
| ----------- | ----------------- | --------- | ------------------------- |
| Primary     | Foco / Links      | `#A78BFA` | `--color-primary-focus`   |
| Primary     | Main              | `#7C3AED` | `--color-primary`         |
| Primary     | Hover             | `#5B21B6` | `--color-primary-hover`   |
| Secondary   | Tags              | `#06B6D4` | `--color-tag`             |
| Secondary   | Destrutivos       | `#EF4444` | `--color-destructive`     |
| Secondary   | Call To Action    | `#10B981` | `--color-cta`             |
| Neutrals    | Placeholders      | `#94A3B8` | `--color-placeholder`     |
| Neutrals    | Bordas            | `#334155` | `--color-border`          |
| Neutrals    | Cards             | `#1E293B` | `--color-card`            |
| Neutrals    | Fundo Geral       | `#0F172A` | `--color-background`      |
| Backgrounds | Cards             | `#1E293B` | `--color-card`            |
| Backgrounds | Painéis/Navegação | `#131B2E` | `--color-panel`           |
| Backgrounds | Fundo Base        | `#090D16` | `--color-background-base` |
| Text        | Desativados       | `#64748B` | `--color-disabled`        |
| Text        | Subtítulo         | `#94A3B8` | `--color-subtitle`        |
| Text        | Títulos           | `#F8FAFC` | `--color-title`           |

Placeholders e Subtítulo têm o mesmo hex, mas são papéis diferentes: use o token do papel, não o da cor.

#### Cores de acessibilidade

Três combinações do manual não passavam no nível AA da WCAG. Os tokens abaixo foram aprovados em 03/11/2026 para corrigi-las. Eles vêm das mesmas escalas de cor do manual.

| Uso                                         | Hex       | Token                  | Contraste                          |
| ------------------------------------------- | --------- | ---------------------- | ---------------------------------- |
| Texto sobre fundos de CTA, destrutivo e tag | `#090D16` | `--color-on-accent`    | CTA 7,66 · destrutivo 5,16 · tag 8 |
| Texto de mensagens de erro                  | `#F87171` | `--color-error-text`   | mínimo de 5,29 (sobre card)        |
| Borda de campos de formulário               | `#64748B` | `--color-border-input` | mínimo de 3,07 (sobre card)        |

- Nunca use texto claro sobre `--color-cta` ou `--color-destructive`: o contraste fica abaixo de 4,5.
- `--color-destructive` continua valendo para a borda e o ícone de um campo com erro, que precisam só de 3:1.
- `--color-border` fica para divisórias decorativas. Campos de formulário usam `--color-border-input`.
- Links e indicadores de foco usam `--color-primary-focus`. O `--color-primary` não tem contraste suficiente para texto sobre o fundo escuro.

### Sombras

| Nome   | Valores do manual | Token             | CSS                           |
| ------ | ----------------- | ----------------- | ----------------------------- |
| Soft   | 2, 0, 2, 15%      | `--shadow-soft`   | `0 2px 2px rgb(0 0 0 / 15%)`  |
| Medium | 8, 0, 4, 15%      | `--shadow-medium` | `0 4px 8px rgb(0 0 0 / 15%)`  |
| Strong | 16, 0, 8, 20%     | `--shadow-strong` | `0 8px 16px rgb(0 0 0 / 20%)` |

O manual traz os quatro números sem rótulos. A coluna CSS os lê como blur, X, Y e opacidade, em preto. Essa leitura é uma interpretação e ainda precisa ser confirmada com o design.

### Marca

| Arquivo                            | Uso                                                        |
| ---------------------------------- | ---------------------------------------------------------- |
| `design/brand/logo.jpeg`           | Original da logo (fundo branco). Não é servido pelo site.  |
| `design/brand/icon.png`            | Original do ícone. Não é servido pelo site.                |
| `src/assets/brand/can-emblem.png`  | Emblema recortado em círculo, usado pelo componente `Logo` |
| `src/app/icon.png`                 | Favicon (convenção de arquivo do Next)                     |
| `src/app/apple-icon.png`           | Ícone da tela inicial do iPhone, sobre `#0F172A`           |

- Use sempre o componente `Logo` no cabeçalho e no rodapé. Ele mostra o emblema com o nome "Can" em texto ao lado, por isso a imagem tem `alt=""`.
- Não use os originais direto na interface. A `logo.jpeg` tem fundo branco, e no `icon.png` as linhas brancas da lata são transparentes: sobre o fundo escuro, a lata desaparece. Os arquivos recortados já corrigem as duas coisas.

### Aplicação no código

- O Tailwind v4 é configurado no CSS. Os tokens ficam em `@theme`, em `src/app/globals.css`, com os nomes da coluna "Token" das tabelas acima. Cada token gera as utilities correspondentes: `bg-primary`, `text-title`, `border-border`, `text-x-large`, `font-display`, `shadow-soft`.
- Nos componentes, use as utilities dos tokens. Não escreva valores soltos (`bg-[#7C3AED]`, `text-[24px]`) nem use a paleta e a escala padrão do Tailwind (`bg-violet-600`, `text-2xl`).
- Se um token ainda não existir no `globals.css`, declare-o lá com o valor deste manual antes de usá-lo.
- Carregue Rajdhani e Roboto com `next/font/google` em `src/app/layout.tsx` e exponha-as ao Tailwind como `--font-display` e `--font-sans`.
- Tamanho e família andam juntos: todo texto de `x-large` para cima leva `font-display`, e o restante fica em `font-sans`.
- O `globals.css` zera a paleta, a escala de texto, os pesos e as sombras padrão do Tailwind (`--color-*: initial` e equivalentes). Uma classe como `bg-violet-600` simplesmente não gera CSS.

## Convenções de código

- Código sempre em inglês: variáveis, funções, componentes, arquivos e rotas.
- Comentários sempre em português.
- Nomes autoexplicativos (clean code): `getSpecialOffers`, `isCurrentPage`, `formatPriceInCents`. Evite abreviações como `g`, `idx` ou `data2`.
- Comentários explicam o porquê, não o quê.

## Arquitetura

O código segue as três camadas vistas na Aula 3:

| Camada       | Pasta                                         | Papel                                          |
| ------------ | --------------------------------------------- | ---------------------------------------------- |
| Apresentação | `src/app/`, `src/components/`, `src/hooks/`   | Telas, componentes e hooks React               |
| Negócio      | `src/services/`, `src/lib/`                   | Regras: filtros, ordenação, preços, datas      |
| Dados        | `src/data/` (mock), depois a API REST         | Origem dos dados                               |

Os componentes nunca leem `src/data/` diretamente: sempre passam por `src/services/`. Quando a API ficar pronta, estas são as funções que trocam o mock por requisições HTTP:

| Função ou objeto                          | Hoje                         | Com a API                          |
| ----------------------------------------- | ---------------------------- | ---------------------------------- |
| `fetchAllGames` (`gameService.ts`)        | `src/data/games.ts`          | `GET /games`                       |
| `getGameBySlug` (`gameService.ts`)        | `src/data/gameDetails.ts`    | `GET /games/:slug`                 |
| `getGameListings` (`gameService.ts`)      | `games.ts` + `gameDetails.ts` | `GET /games` com `tags` e `reviewSummary` |
| `getGameShowcases` (`gameService.ts`)     | `games.ts` + `gameDetails.ts` | `GET /games` com `publisher` e `screenshotUrls` |
| `getGameShowcasesByGenre` (`gameService.ts`) | `games.ts` + `gameDetails.ts` | `GET /games?genre=:id` |
| `cartCollection.add` / `.remove`          | `localStorage` (`can:cart`)  | `POST` / `DELETE` no carrinho      |
| `wishlistCollection.add` / `.remove`      | `localStorage` (`can:wishlist`) | `POST` / `DELETE` na lista de desejos |
| `wishlistCollection.move`                 | `localStorage` (`can:wishlist`) | `PATCH` na lista de desejos (posição) |
| `libraryCollection.add` / `.remove`       | `localStorage` (`can:library`) | `POST` / `DELETE` na biblioteca  |
| `launchGame` (`libraryService.ts`)        | `localStorage` (`can:library`) | `PATCH /library/:gameId` (`lastPlayedAt`) |
| `registerAccount` (`authService.ts`)      | `localStorage` (`can:accounts`) | `POST /users`                    |
| `signIn` / `signOut` (`authService.ts`)   | `localStorage` (`can:session`) | `POST` / `DELETE /sessions`      |
| `updateProfile` (`authService.ts`)        | `localStorage` (`can:accounts`) | `PATCH /users/:id`               |
| `deleteAccount` (`authService.ts`)        | `localStorage` (`can:accounts`) | `DELETE /users/:id`              |
| `placeOrder` (`checkoutService.ts`)       | `localStorage` (biblioteca, desejos e carrinho) | `POST /orders`   |

O formato que a API deve devolver está em `src/types/game.ts` (`Game` para listas, `GameListing` para a lista de desejos e as sugestões da busca, `GameShowcase` para as ofertas especiais da loja e as páginas de gênero e de pesquisa e `GameDetails` para a página de um jogo), em `src/types/user.ts` (`UserProfile`, `RegistrationData` e `ProfileChanges`), em `src/types/collection.ts` (`GameCollectionEntry`: o id do jogo, a data em que entrou na coleção e, na biblioteca, a última vez que foi aberto) e em `src/types/order.ts` (`OrderRequest` e `Order`). A ordem dos itens de cada coleção é a ordem do array.

A busca e os filtros (`src/lib/gameCatalog.ts`) rodam sobre a lista que o servidor já entregou, então as sugestões aparecem sem esperar a rede. Com muitos jogos na API, `searchGames` pode virar `GET /games?search=`.

As funções de conta e de pedido esperam 600 ms de propósito (`SIMULATED_NETWORK_DELAY_MS`, em `src/services/simulatedNetwork.ts`), para a interface mostrar o estado "carregando" como faria com a API. A conta de demonstração é `demo` / `Can12345`.

O pagamento acontece em um parceiro externo (gateway) que não faz parte do projeto. Por isso `placeOrder` sempre aprova: ele põe os jogos na biblioteca, tira da lista de desejos e esvazia o carrinho. Finalizar a compra exige estar na conta, e o login e o cadastro aceitam `?redirectTo=` para voltar ao checkout (só caminhos internos, conferidos por `getSafeRedirectPath`).

## Formulários

Todo formulário segue o mesmo padrão. Reaproveite os componentes de `src/components/forms/` e o hook `useValidatedForm`:

- Rótulo visível acima do campo, nunca só o placeholder. O placeholder traz um exemplo (`Ex.: maria_gamer`).
- Campos obrigatórios com `required` e asterisco visual, e um aviso no topo explicando o asterisco.
- `autocomplete` correto em todo dado pessoal (`name`, `username`, `bday`, `street-address`, `email`, `new-password`, `current-password`), como pede a WCAG 1.3.5.
- O formulário usa `noValidate`, e as regras ficam em `src/lib/accountValidation.ts`. As mensagens dizem como corrigir, não só que há erro.
- Ao enviar com erro, o foco vai para o `ErrorSummary` no topo, e cada item leva ao campo. Cada campo com erro recebe `aria-invalid` e a mensagem por `aria-describedby`.
- Erros que só o servidor descobre, como apelido repetido, voltam para o campo certo com `setFieldError`.
- Confirmações aparecem em uma região `role="status"` que fica sempre no HTML, mesmo vazia.

As capas em `public/games/` são SVGs abstratos gerados com as cores do manual, porque os jogos são fictícios.
