FROM node:22-alpine

# For prisma
RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npm install prisma
RUN npx prisma generate

RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3005

ENTRYPOINT ["./docker-entrypoint.sh"]