FROM node:21-alpine

WORKDIR /usr/src/app

# 1. Copier les fichiers de dépendances
COPY package*.json ./

# 2. Installer les dépendances (--legacy-peer-deps pour les conflits hardhat)
RUN npm install --legacy-peer-deps

# 3. Copier le schéma Prisma et générer le client
COPY prisma ./prisma
RUN npx prisma generate

# 4. Copier le reste du code source
COPY . .

EXPOSE 5000

CMD ["npm", "start"]
