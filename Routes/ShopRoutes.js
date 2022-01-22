const express = require('express');
const ShopAuthentication = require('./../Controllers/ShopAuthentication');
const UserRoutes = require('./../Controllers/User/UserRoutes');
const CategoryRoutes = require('./../Controllers/Category/CategoryRoutes');
const ProductRoutes = require('./../Controllers/Product/ProductRoutes');
const ShopProfileRoutes = require('./../Controllers/ShopProfile/ShopProfileRoutes');

const router = express.Router();

// User Routes
router.use('/user', UserRoutes);
// Protect Rest all routes
router.use(ShopAuthentication.protect);

//  Category Routes
router.use('/category', CategoryRoutes);
// Product Routes

router.use('/product', ProductRoutes);
router.use('/shop-profile', ShopProfileRoutes);

module.exports = router;
