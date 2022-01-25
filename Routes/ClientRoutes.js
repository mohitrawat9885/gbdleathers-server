const express = require('express');
const CustomerAuthentication = require('../Controllers/CustomerAuthentication');
const CustomerRoutes = require('../Controllers/Customer/CustomerRoutes');
const ReviewRoutes = require('./../Controllers/Reviews/ReviewRoutes');
const ProductController = require('./../Controllers/Product/ProductController');
const CategoryController = require('./../Controllers/Category/CategoryController');

const router = express.Router();

// User Routes
router.use('/customer', CustomerRoutes);

router.get('/product', ProductController.getAllProduct);
router.get('/category', CategoryController.getAllCategory);

router.get('/product/:id', ProductController.getProduct);
router.get('/product/:id', CategoryController.getCategory);

// Protect Rest all routes
router.use(CustomerAuthentication.protect);
router.use('/customer/reviews', ReviewRoutes);

module.exports = router;
