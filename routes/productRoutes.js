const express = require('express');
const router = express.Router();

const { Product } = require('../models/productModel');

router.get(`/`, async (req, res) => {
  const productList = await Product.find();

  if (!productList) {
    res.status(500).json({ success: false })
  }
  res.send(productList);
})




module.exports = router;