FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev    # changed from npm ci

COPY . .

EXPOSE 6000
CMD ["npm", "start"]
