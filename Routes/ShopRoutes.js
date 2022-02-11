const express = require('express');
const ShopAuthentication = require('./../Controllers/ShopAuthentication');
const UserRoutes = require('./../Controllers/User/UserRoutes');
const CategoryRoutes = require('./../Controllers/Category/CategoryRoutes');
const ProductRoutes = require('./../Controllers/Product/ProductRoutes');
const ShopProfileRoutes = require('./../Controllers/ShopProfile/ShopProfileRoutes');
const OrderRoutes = require('./../Controllers/Orders/OrderRoutes');

const router = express.Router();

// User Routes
router.use('/user', UserRoutes);
// Rest all routes are Protect

router.use(ShopAuthentication.protect);

//  Category Routes
router.use('/category', CategoryRoutes);
// Product Routes

router.use('/product', ProductRoutes);
router.use('/shop-profile', ShopProfileRoutes);
router.use('/orders', OrderRoutes);

module.exports = router;
