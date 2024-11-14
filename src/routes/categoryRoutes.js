const express = require("express");
const router = express.Router();
const categoriesService = require("../services/categoriesService");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/categories", authMiddleware, (req, res) => {
  const { merchantId } = req.query;
  let result = [];

  console.log(merchantId);
  if (merchantId) {
    result = categoriesService.getCategoriesByMerchantId(merchantId);
  }
  // else {
  //   result = categoriesService.getCategories(merchantId);
  // }
  res.json(result);
});

router.get("/category/find", authMiddleware, (req, res) => {
  const { find } = req.query;

  // const categoryByName = categoriesService.findCategoryByName(find);
  // res.json(categoryByName);

  // new
  const categoryByName = categoriesService.findCategoryByName(find);
  res.json(categoryByName);
});

router.get("/category/:id", authMiddleware, (req, res) => {
  const { id } = req.params;
  const category = categoriesService.getCategoryById(id);
  if (category) {
    res.json(category);
  } else {
    res.status(404).send("Product not found");
  }
});

module.exports = router;
