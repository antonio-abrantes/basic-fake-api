const express = require("express");
const router = express.Router();
const productsService = require("../services/productsService");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/products", authMiddleware, (req, res) => {
  const { merchantId } = req.query;
  let result = [];

  console.log(merchantId);
  if (merchantId) {
    result = productsService.getProductsByMerchantId(merchantId);
  } else {
    return res.status(400).send("Merchant ID is required");
  }
  res.json(result);
});

router.get("/products/category", authMiddleware, (req, res) => {
  const { categoryId } = req.query;
  let result = [];

  if (categoryId) {
    result = productsService.getProductsByCategoryId(categoryId);
  } else {
    return res.status(400).send("Category ID is required");
  }

  res.json(result);
});

// router.get("/products/:merchantId", authMiddleware, (req, res) => {
//   const { merchantId } = req.params;
//   const products = productsService.getProductsByMerchantId(merchantId);
//   res.json(products);
// });

router.get("/products/find", authMiddleware, (req, res) => {
  const { find } = req.query;

  // old
  // const productsByName = productsService.findProductsByName(find);
  // const productsByDescription = productsService.findProductsByDescription(find);
  // res.json(productsByName.concat(productsByDescription));

  // new
  const productsByName = productsService.findProductsByName(find);
  const productsByDescription = productsService.findProductsByDescription(find);

  const combinedProducts = productsByName.concat(productsByDescription);
  const uniqueProducts = Array.from(new Set(combinedProducts));
  res.json(uniqueProducts);
});

router.get("/product/:id", authMiddleware, (req, res) => {
  const { id } = req.params;
  const product = productsService.getProductById(id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).send("Product not found");
  }
});

module.exports = router;
