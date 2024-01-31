FROM node:16.20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:16.20-alpine AS deploy
WORKDIR /app
RUN npm install -g pm2
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/ecosystem.config.js ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
#COPY nginx/conf.d/backend.conf /etc/nginx/conf.d/backend.conf
EXPOSE 3000
CMD ["pm2-runtime", "ecosystem.config.js"]
