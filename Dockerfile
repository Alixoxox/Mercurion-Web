FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN npm install -g http-server

CMD ["http-server", "dist/ecommerce-app-v16", "-p", "4200"]