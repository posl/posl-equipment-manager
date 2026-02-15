FROM node:22-alpine

RUN apk add --no-cache libc6-compat g++ make py3-pip git

WORKDIR /app/

COPY package*.json ./
RUN npm install

COPY . .

# COPY ./ /app/
# RUN npm install -g npm@9.7.2
# RUN npm install -g node-gyp
# RUN npm upgrade --save --legacy-peer-deps
# RUN npm install

# CMD ["sh", "-c", "npx prisma migrate dev --name ini && npx prisma generate && npm run dev"]
CMD ["npm", "run", "dev"]
