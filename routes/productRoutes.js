const express = require('express');
const router = express.Router();
const multer = require('multer');
const moongose = require('mongoose');
const { Product } = require('../models/productModel');
const { Category } = require('../models/categoryModel');

// Allowed file types
const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let uploadError = new Error('Invalid image type');
    if (isValid) {
      uploadError = null
    }
    cb(uploadError, 'public/uploads/')
  },
  // By default, multer removes file extensions so let's add them back  
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(' ').join('-');
    const extension = MIME_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  }
})

const uploadOptions = multer({ storage: storage })




router.post(`/add`, uploadOptions.single('image'), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send('Invalid Category')

  const file = req.file.filename;
  if (!file) return res.status(400).send('No image in the request')
  const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${file}`,
    images: req.body.images,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  })
    

  product = await product.save();

  if (!product)
    return res.status(404).send('the product cannot be created!')

res.send(product);
})

router.get(`/`, async (req, res) => {
  let filter = {};
  if (req.query.categories) { 
    
    filter = { category: req.query.categories.split(',') }
  }
  const productList = await Product.find(filter);

  if (!productList) {
    res.status(500).json({ success: false })
  }
  res.send(productList);
}
)

router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category');

  if (!product) {
    res.status(500).json({ message: 'The product with the given ID was not found.' })
  }
  res.send(product);
})

//update a product

router.put('/:id', uploadOptions.single('image'), async (req, res) => {
  if (!moongose.isValidObjectId(req.params.id)) {
    res.status(400).send('Invalid Product Id')
  }

  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send('Invalid Category')
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(400).send('Invalid Product')
  const file = req.file;
  let imagepath;
  if (file) {
    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    imagepath = `${basePath}${fileName}`;
  } else {
    imagepath = product.image;
  }
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: imagepath,
      images: req.body.images,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  )


  if (!updatedProduct)
    return res.status(404).send('the product cannot be updated!')

  res.send(updatedProduct);
}
)

//delete a product and validate the id

router.delete('/:id', (req, res) => {
  Product.findByIdAndRemove(req.params.id).then(product => {
    if (product) {
      return res.status(200).json({ success: true, message: 'the product is deleted!' })
    } else {
      return res.status(404).json({ success: false, message: 'product not found!' })
    }
  }).catch(err => {
    return res.status(400).json({ success: false, error: err })
  })
})


//get the total number of products

router.get(`/get/count`, async (req, res) => {
  const productCount = await Product.countDocuments((count) => count)

  if (!productCount) {
    res.status(500).json({ success: false })
  }
  res.send({
    productCount: productCount
  });
})

//get the featured products only with user intrest using AI

router.get(`/get/featured/:count`, async (req, res) => {
  const count = req.params.count ? req.params.count : 0
  const products = await Product.find({ isFeatured: true }).limit(+count)

  if (!products) {
    res.status(500).json({ success: false })
  }
  res.send(products);
})

// update the gallery images of the product

router.put('/gallery-images/:id',uploadOptions.array('images', 10),async (req, res) => {
    if (!moongose.isValidObjectId(req.params.id)) {
      res.status(400).send('Invalid Product Id')
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if (files) {
      files.map(file => {
        imagesPaths.push(`${basePath}${file.filename}`);
      })
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths
      },
      { new: true }
    )

    if (!product)
      return res.status(404).send('the product cannot be updated!')

    res.send(product);
  }
)









module.exports = router;