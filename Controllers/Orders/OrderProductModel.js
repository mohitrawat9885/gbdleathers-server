const mongoose = require('mongoose');

const OrderProductSchema = new mongoose.Schema(
  {
    order_of: {
      type: mongoose.Schema.ObjectId,
      ref: 'Orders',
    },
    product: {
      type: Object,
      required: [true, 'Product of order must have details.'],
    },
    quantity: {
      type: Number,
      required: [true, 'Ordered Product must have quantity'],
    },
    status: {
      type: String,
      required: [
        true,
        'Product of Order should have some order status: [ordered, pending, canceled, completed]',
      ],
      enum: {
        values: ['ordered', 'pending', 'canceled', 'completed'],
      },
    },
    created_at: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const OrderProducts = mongoose.model('OrderProducts', OrderProductSchema);

module.exports = OrderProducts;
