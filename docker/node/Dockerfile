FROM node:18.12.0-slim

WORKDIR /web

COPY ./package*.json ./
# Prisma is needed for postinstall script
COPY ./prisma ./prisma

RUN chown -R node ./
USER node

RUN npm i
