ARG NODE_VERSION=18.18.0
# ---------------------------------------------------------------------------- #
#                                     Base                                     #
# ---------------------------------------------------------------------------- #

# Setup alpine image
FROM node:${NODE_VERSION}-alpine AS alpine
RUN apk update
RUN apk add --no-cache libc6-compat

# Setup pnpm and turbo on the alpine base
FROM alpine as base
RUN npm install pnpm turbo --global
RUN pnpm config set store-dir ~/.pnpm-store


# ---------------------------------------------------------------------------- #
#                                    Pruner                                    #
# ---------------------------------------------------------------------------- #
# Prune projects
FROM base AS pruner
ARG PROJECT

WORKDIR /app
COPY . .
RUN turbo prune --scope=${PROJECT} --docker

# ---------------------------------------------------------------------------- #
#                                    Builder                                   #
# ---------------------------------------------------------------------------- #
# Build the project
FROM base AS builder
ARG PROJECT
WORKDIR /app

# Copy lockfile and package.json's of isolated subworkspace
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/out/json/ .

# First install the dependencies (as they change less often)
# Install the deps needed to build the target
RUN corepack enable
RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm install --frozen-lockfile

# Copy source code of isolated subworkspace
COPY --from=pruner /app/out/full/ .
RUN turbo build --filter=${PROJECT}
RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm prune --prod --no-optional
RUN rm -rf ./**/*/src



# ---------------------------------------------------------------------------- #
#                                    Runner                                    #
# ---------------------------------------------------------------------------- #
# Runner image
FROM alpine AS runner
ARG PROJECT
ARG NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app .
WORKDIR /app/apps/token-generator-api

ARG PORT=3000
ENV PORT=${PORT}
ENV NODE_ENV=${NODE_ENV}
EXPOSE ${PORT}

CMD node dist/main