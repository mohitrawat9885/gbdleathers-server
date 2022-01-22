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

// router.route('/:id/variant').patch(ProductController.updateVariant);
// .post(ProductController.createVariant);

// Product Varient
// router
//   .route('/product-variant')
//   .post(ShopController.createProductVariant)
//   .get(ShopController.getAllProductVariant);
// router
//   .route('/product-variant/:id')
//   .get(ShopController.getProductVariant)
//   .patch(ShopController.updateProductVariant)
//   .delete(ShopController.removeProductVariant);
module.exports = router;
