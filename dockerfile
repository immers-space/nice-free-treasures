FROM node:16
WORKDIR /usr/src/destination

COPY package*.json ./
RUN npm ci

COPY . .

CMD [ "npm", "run", "build" ]
