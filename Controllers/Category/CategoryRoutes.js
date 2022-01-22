const express = require('express');
const multer = require('multer');
const CategoryController = require('./CategoryController');

const router = express.Router();

router
  .route('/')
  .post(
    CategoryController.uploadCategoryImage,
    CategoryController.resizeCategoryImage,
    CategoryController.createCategory
  )
  .get(CategoryController.getAllCategory);

router.route('/products').get(CategoryController.getAllCategoryProduct);
router
  .route('/:id')
  .get(CategoryController.getCategory)
  .patch(
    CategoryController.uploadCategoryImage,
    CategoryController.resizeCategoryImage,
    CategoryController.updateCategory
  )
  .delete(CategoryController.removeCategory);

module.exports = router;
