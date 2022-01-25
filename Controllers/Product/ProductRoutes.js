const express = require('express');
const ProductController = require('./ProductController');

const router = express.Router();

router
  .route('/')
  .post(
    ProductController.uploadProductImages,
    ProductController.resizeProductImages,
    ProductController.createProduct
  )
  .get(ProductController.getAllProduct);
router
  .route('/:id')
  .post(
    ProductController.uploadProductImages,
    ProductController.resizeProductImages,
    ProductController.createProductVariant
  )
  .get(ProductController.getProduct)
  .patch(
    ProductController.uploadProductImages,
    ProductController.resizeProductImages,
    ProductController.updateProduct
  )
  .delete(ProductController.removeProduct);

router
  .route('/:id/images')
  .get(ProductController.getProductImages)
  .post(
    ProductController.uploadProductImages,
    ProductController.resizeProductImages,
    ProductController.addProductImages
  );
router
  .route('/:id/images/:image')

  .delete(ProductController.removeProductImage);

module.exports = router;
