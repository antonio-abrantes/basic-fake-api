const fs = require("fs");
const path = require("path");

const getProducts = () => {
  const filePath = path.join(__dirname, "products.json");
  const data = fs.readFileSync(filePath);
  return JSON.parse(data);
};

const getProductsByMerchantId = (merchantId) => {
  const products = getProducts();
  return products.filter((product) => product.merchantId === merchantId);
};

const getProductById = (id) => {
  const products = getProducts();
  return products.find((product) => product.id === id);
};

const findProductsByName = (name) => {
  const products = getProducts();
  return products.filter((product) =>
    product.name.toLowerCase().includes(name.toLowerCase())
  );
};

const findProductsByDescription = (description) => {
  const products = getProducts();
  return products.filter((product) =>
    product.description.toLowerCase().includes(description.toLowerCase())
  );
};

module.exports = {
  getProducts,
  getProductsByMerchantId,
  getProductById,
  findProductsByName,
  findProductsByDescription,
};
