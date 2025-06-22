FROM node:18-slim

WORKDIR /app

COPY package*.json ./
RUN npm install && chmod +x ./node_modules/.bin/*



COPY . .

EXPOSE 3000

CMD [ "node", "index.js" ]