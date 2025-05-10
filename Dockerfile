FROM node:alpine

WORKDIR /app
 
COPY package.json package.json
COPY package-lock.json package-lock.json

COPY build build
 
RUN npm install

CMD [ "node", "build" ]