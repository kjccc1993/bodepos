# syntax=docker/dockerfile:1
# Production SPA: Vite build + nginx (patrón Isla Data).

FROM node:22-slim AS build

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
ENV NODE_ENV=development
RUN yarn install --immutable

COPY . .

ARG VITE_API_BASE_URL=https://bodepos-api.camargosystems.com
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN yarn build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
