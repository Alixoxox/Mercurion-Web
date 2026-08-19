FROM node:20-alpine

WORKDIR /app

ARG NG_APP_API_URL
ENV NG_APP_API_URL=$NG_APP_API_URL

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN npm install -g serve

CMD ["serve", "-s", "dist/ecommerce-app-v16", "-l", "4200"]