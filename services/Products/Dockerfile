FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm install --save-dev @nestjs/cli

COPY init.prod.sh .
RUN chmod +x init.prod.sh

EXPOSE 3000

CMD ["sh", "init.prod.sh"]