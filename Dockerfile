FROM oven/bun:1-slim AS base
WORKDIR /app

# install with --production (exclude devDependencies)
FROM node:22-alpine AS install
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /temp/prod
COPY package.json pnpm-lock.yaml /temp/prod/
RUN pnpm install --frozen-lockfile --production

# copy production dependencies and source code into final image
FROM base AS release
COPY . .
COPY --from=install /temp/prod/node_modules node_modules
RUN bunx playwright install-deps firefox

USER bun
RUN bunx playwright install firefox

EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "src/index.ts" ]
