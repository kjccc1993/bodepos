# syntax=docker/dockerfile:1
# Patrón Aurigo / Isla Data: build con Prisma + TypeScript; runtime con node_modules del build.

FROM node:20-slim AS build

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
COPY prisma ./prisma/

# Coolify suele pasar NODE_ENV=production al build; sin esto yarn omite devDependencies y falla tsc.
ENV NODE_ENV=development
RUN yarn install --immutable

RUN yarn prisma generate

COPY tsconfig.json ./
COPY src ./src/

RUN yarn exec tsc -p tsconfig.json

FROM node:20-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/package.json /app/yarn.lock /app/.yarnrc.yml ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY entrypoint.sh ./entrypoint.sh

RUN chmod +x entrypoint.sh \
  && sed -i 's/\r$//' entrypoint.sh \
  && chown -R node:node /app

USER node

EXPOSE 3610

CMD ["./entrypoint.sh"]
