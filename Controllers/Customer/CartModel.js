const mongoose = require('mongoose');
const validator = require('validator');

const CartSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      refPath: 'onModel',
      required: [true, 'Product is missing!'],
    },
    onModel: {
      type: String,
      required: true,
      enum: ['Products', 'Variants'],
    },
    customer: {
      type: mongoose.Schema.ObjectId,
      ref: 'Customers',
      required: [true, 'Customer is missing!'],
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    created_at: {
      type: Date,
      default: Date.now(),
    },
    updated_at: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

CartSchema.index({ product: 1, customer: 1 }, { unique: true });

const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;
