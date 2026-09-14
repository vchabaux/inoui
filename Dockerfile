# syntax=docker/dockerfile:1

# ---- Client (build Vite) ----
FROM node:20-bookworm AS client
WORKDIR /build
ENV NODE_OPTIONS=--max-old-space-size=4096
# Front en same-origin : l'API est appelée en relatif (/api), servie par Express.
# (override de VITE_APP_BACKEND_URL cuit dans client/.env.production — chez Vite,
#  les variables d'environnement du process ont priorité sur les fichiers .env)
ENV VITE_APP_BACKEND_URL=
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build

# ---- Dépendances serveur (outils de compilation = assurance si un prebuild natif manque) ----
FROM node:20-bookworm AS deps
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --omit=dev

# ---- Runtime ----
FROM node:20-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY server/ .
COPY --from=client /build/dist ./public
RUN mkdir -p uploads/temp
EXPOSE 4000
CMD ["node", "start.js"]
