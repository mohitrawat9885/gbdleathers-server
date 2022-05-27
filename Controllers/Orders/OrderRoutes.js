const express = require("express");
const OrderController = require("./OrderController");

const router = express.Router();

router.route("/").get((req, res, next) => {
  req.body.for = "orders";
  next();
}, OrderController.getAllOrders);
router
  .route("/:id")
  .get(OrderController.getOrder)
  .patch(OrderController.updateOrder)
  .delete(OrderController.deleteOrder);

module.exports = router;
