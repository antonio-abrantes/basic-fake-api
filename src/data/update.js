const fs = require("fs");
const path = require("path");

function createJSONFile(data, fileName) {
  const jsonData = {
    data: data, // Estrutura que você pediu
  };

  // Converte o objeto para JSON formatado
  const jsonString = JSON.stringify(jsonData, null, 2);

  // Escreve o arquivo no sistema de arquivos
  fs.writeFile(fileName, jsonString, "utf8", (err) => {
    if (err) {
      console.error("Erro ao escrever o arquivo", err);
    } else {
      console.log(`Arquivo ${fileName} criado com sucesso!`);
    }
  });
}

function mergeArrays(arr1, arr2) {
  // Criar um mapa para o segundo array, baseado no "id"
  const map = new Map(arr2.map((item) => [item.code, item]));

  // Percorrer o primeiro array e adicionar os campos extras
  return arr1.map((item) => {
    // Encontrar o objeto correspondente no segundo array usando o id
    const matchingItem = map.get(item.code);

    // Se houver um objeto correspondente, mesclar os campos de data
    if (matchingItem) {
      return {
        ...item, // Manter os dados do primeiro array
        // Copiar os campos de data do segundo array, caso existam
        date_created: matchingItem.date_created || item.date_created || "", 
        date_updated: matchingItem.date_updated || item.date_updated || "",
      };
    }

    // Caso não haja correspondência, retornar o item original sem alteração
    return item;
  });
}

// Carregar os arquivos de JSON
const fileUpdatedPath = path.join(__dirname, "./client_list_updated.json");
let jsonfileUpdated = JSON.parse(fs.readFileSync(fileUpdatedPath, "utf8"));

const fileOlddPath = path.join(__dirname, "./client_list_new.json");
let jsonfileOld = JSON.parse(fs.readFileSync(fileOlddPath, "utf8"));

// Mesclando os arrays
const mergedArray = mergeArrays(jsonfileUpdated.data, jsonfileOld.data);

// Criar o novo arquivo JSON
createJSONFile(mergedArray, "updated_list.json");
