const express = require("express");
const ShopAuthentication = require("./../Controllers/ShopAuthentication");
const UserRoutes = require("./../Controllers/User/UserRoutes");
const CategoryRoutes = require("./../Controllers/Category/CategoryRoutes");
const ProductRoutes = require("./../Controllers/Product/ProductRoutes");
const ShopProfileRoutes = require("./../Controllers/ShopProfile/ShopProfileRoutes");
const OrderRoutes = require("./../Controllers/Orders/OrderRoutes");
const WorkshopRoutes = require("./../Controllers/Workshop/WorkshopRoutes");
const ContactUsController = require("./../Controllers/ContactUs/ContactUsController");

const router = express.Router();

// User Routes
router.use("/user", UserRoutes);
// Rest all routes are Protect

router.use(ShopAuthentication.protect);

//  Category Routes
router.use("/category", CategoryRoutes);
// Product Routes

router.use("/product", ProductRoutes);
router.use("/shop-profile", ShopProfileRoutes);
router.use("/orders", OrderRoutes);
router.use("/workshop", WorkshopRoutes);

router.route("/contact-us").get(ContactUsController.getAllContactUs);
router.route("/contact-us/:id").delete(ContactUsController.deleteContactUs);

module.exports = router;
