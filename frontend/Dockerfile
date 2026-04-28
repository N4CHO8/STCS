FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY next.config.mjs ./
COPY next-env.d.ts ./
COPY src ./src
COPY public ./public

EXPOSE 3000

CMD ["npm", "run", "dev"]
