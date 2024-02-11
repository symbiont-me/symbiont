FROM node

WORKDIR /app

COPY package.json ./

RUN npm install -g bun

RUN bun install

COPY . .

EXPOSE 3000

CMD ["bun", "dev"]
