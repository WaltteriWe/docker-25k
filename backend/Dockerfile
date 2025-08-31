# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.16.0

FROM node:${NODE_VERSION}-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production || npm install --only=production

COPY . .

ENV NODE_ENV production

USER node

EXPOSE 3000

CMD ["npm", "start"]
