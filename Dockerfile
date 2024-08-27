# Use a imagem base do Node 20
FROM node:20

# Instalar PM2 globalmente
RUN npm install -g pm2

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copie os arquivos de package.json e package-lock.json
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o restante do código da aplicação
COPY . .

# Exponha a porta em que sua aplicação irá rodar (por exemplo, 3000)
EXPOSE 3000

# Use PM2 para iniciar a aplicação
CMD [ "pm2-runtime", "src/index.js" ]
