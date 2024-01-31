
FROM node:16-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build


FROM nginx:1.23.1-alpine as deploy
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx/conf.d/nginx.conf /etc/nginx/nginx.conf
COPY nginx/conf.d/frontend.conf /etc/nginx/conf.d/default.conf
COPY nginx/conf.d/backend.conf /etc/nginx/conf.d/backend.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
