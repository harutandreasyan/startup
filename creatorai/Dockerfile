# Production image for the CreatorAI API (NestJS).
# Build context MUST be the repo root (this directory), because it's an npm-workspaces
# monorepo and the API depends on packages/shared.
#
#   docker build -t creatorai-api .
#   docker run -p 3000:3000 --env-file apps/api/.env creatorai-api
#
# Railway uses this automatically (see railway.json → builder: DOCKERFILE).

FROM node:20-slim AS base
WORKDIR /app
# Prisma's query engine needs OpenSSL at runtime.
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# ---- build stage: install all workspace deps and compile ----
FROM base AS build
ENV NODE_ENV=development
# Copy manifests first for better layer caching.
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
COPY packages/api-client/package.json packages/api-client/
RUN npm ci
# Copy the rest of the source and build the API (+ its workspace deps via turbo).
COPY . .
RUN npx turbo build --filter=api

# ---- runtime stage ----
FROM base AS runtime
ENV NODE_ENV=production
# Bring over the fully-installed + built monorepo (node_modules incl. generated
# Prisma client, compiled dist, and the Prisma schema for `migrate deploy`).
COPY --from=build /app /app
WORKDIR /app/apps/api
EXPOSE 3000
# Apply pending DB migrations, then start the server.
CMD ["npm", "run", "start:prod"]
