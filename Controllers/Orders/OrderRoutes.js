const express = require('express');
const OrderController = require('./OrderController');

const router = express.Router();

router.route('/').get(OrderController.getAllOrders);
router.route('/:id').patch(OrderController.updateOrder);

module.exports = router;
