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

O manual não define pesos de fonte nem altura de linha. Confirme com quem pediu a tarefa antes de fixar um padrão.

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

### Sombras

| Nome   | Valores do manual | Token             | CSS                           |
| ------ | ----------------- | ----------------- | ----------------------------- |
| Soft   | 2, 0, 2, 15%      | `--shadow-soft`   | `0 2px 2px rgb(0 0 0 / 15%)`  |
| Medium | 8, 0, 4, 15%      | `--shadow-medium` | `0 4px 8px rgb(0 0 0 / 15%)`  |
| Strong | 16, 0, 8, 20%     | `--shadow-strong` | `0 8px 16px rgb(0 0 0 / 20%)` |

O manual traz os quatro números sem rótulos. A coluna CSS os lê como blur, X, Y e opacidade, em preto. Essa leitura é uma interpretação e ainda precisa ser confirmada com o design.

### Aplicação no código

- O Tailwind v4 é configurado no CSS. Os tokens ficam em `@theme`, em `src/app/globals.css`, com os nomes da coluna "Token" das tabelas acima. Cada token gera as utilities correspondentes: `bg-primary`, `text-title`, `border-border`, `text-x-large`, `font-display`, `shadow-soft`.
- Nos componentes, use as utilities dos tokens. Não escreva valores soltos (`bg-[#7C3AED]`, `text-[24px]`) nem use a paleta e a escala padrão do Tailwind (`bg-violet-600`, `text-2xl`).
- Se um token ainda não existir no `globals.css`, declare-o lá com o valor deste manual antes de usá-lo.
- Carregue Rajdhani e Roboto com `next/font/google` em `src/app/layout.tsx` e exponha-as ao Tailwind como `--font-display` e `--font-sans`.
- Tamanho e família andam juntos: todo texto de `x-large` para cima leva `font-display`, e o restante fica em `font-sans`.
