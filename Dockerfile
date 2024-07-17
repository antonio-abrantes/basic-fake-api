# Use a imagem base do Node 20
FROM node:20

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

# Comando para iniciar a aplicação
CMD [ "node", "src/index.js" ]
