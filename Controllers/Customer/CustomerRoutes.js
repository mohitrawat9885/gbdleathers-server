const express = require("express");
const CustomerAuthentication = require("./../CustomerAuthentication");
const CustomerController = require("./CustomerController");
const OrderController = require("../Orders/OrderController");

const router = express.Router();

router.post("/signup", CustomerAuthentication.signup);
router.post("/login", CustomerAuthentication.login);
router.get("/logout", CustomerAuthentication.logout);
router.post("/forgotPassword", CustomerAuthentication.forgotPassword);
router.patch("/resetPassword/:token", CustomerAuthentication.resetPassword);

router.use(CustomerAuthentication.protect);

router.patch("/updateMyPassword", CustomerAuthentication.updatePassword);
router.patch("/updateMe", CustomerController.updateMe);

router.get("/getme", CustomerController.getme);
router
  .route("/address")
  .post(CustomerController.createAddress)
  .get(CustomerController.getAddress);
router
  .route("/address/:id")
  .patch(CustomerController.updateAddress)
  .delete(CustomerController.deleteAddress);

router
  .route("/cart")
  .post(CustomerController.addToCart)
  .get((req, res, next) => {
    req.body.for = "cart";
    next();
  }, CustomerController.getAllFromCart);

router
  .route("/cart/:id")
  // .get(CustomerController.getOneFromCart)
  .patch(CustomerController.updateOneFromCart)
  .delete(CustomerController.deleteOneFromCart);
router.route("/orders").get(OrderController.getMyOrders);

router
  .route("/checkout")
  .post(OrderController.createCheckoutData, OrderController.getCheckoutSession);

router.route("/success").get(OrderController.paymentSuccess);

module.exports = router;
