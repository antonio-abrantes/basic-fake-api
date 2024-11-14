const fs = require("fs");
const path = require("path");

const getCategories = () => {
  const filePath = path.join(__dirname, "categories.json");
  const data = fs.readFileSync(filePath);
  return JSON.parse(data);
};

const getCategoriesByMerchantId = (merchantId) => {
  const categories = getCategories();
  return categories.filter((category) => category.merchantId === merchantId);
};

const getCategoryById = (id) => {
  const categories = getCategories();
  return categories.find((category) => category.id === id);
};

const findCategoryByName = (name) => {
  const categories = getCategories();
  return categories.filter((category) =>
    category.name.toLowerCase().includes(name.toLowerCase())
  );
};

module.exports = {
  getCategories,
  getCategoriesByMerchantId,
  getCategoryById,
  findCategoryByName,
};
