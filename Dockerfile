# Imagem de produção do front-end da Can (Next.js no modo standalone).

# 1. Dependências, nas versões do package-lock.json.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. Build. O Next grava o NEXT_PUBLIC_API_URL no código nesta etapa, por isso o
# endereço público da API chega como argumento do build, e não como variável do contêiner.
FROM node:22-alpine AS build
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
RUN test -n "$NEXT_PUBLIC_API_URL" || \
  (echo "Informe o argumento NEXT_PUBLIC_API_URL: o endereço público da API, terminando em /api." && exit 1)
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3. Execução: só o servidor standalone e os arquivos estáticos.
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# O Next guarda em .next/cache as imagens otimizadas, então a pasta precisa ser do usuário node.
RUN mkdir .next && chown node:node .next
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static

# Executa sem privilégios de root.
USER node

EXPOSE 3000

# A tela de login não depende da API, então mostra só a saúde do próprio front-end.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/login').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]
