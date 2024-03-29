const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    products: {
      type: Array,
      required: [true, "Order must have Product/Products"],
    },
    customer: {
      type: mongoose.Schema.ObjectId,
      ref: "Customers",
      required: [true, "Order must have customer!"],
    },
    customer_detail: {
      type: Object,
    },
    address: {
      type: Object,
      required: [true, "Order must have Address."],
    },
    status: {
      type: String,
      required: [true, "Order should have some status"],
      enum: {
        values: ["ordered", "pending", "canceled", "completed"],
      },
    },
    payment: {
      type: String,
      required: [true, "Order should have payment status"],
      enum: {
        values: ["pending", "completed"],
        message: "Order should be either pending or completed!",
      },
    },
    paymentId: {
      type: String,
    },
    payerId: {
      type: String,
    },
    ordered_at: {
      type: Date,
      default: Date.now(),
    },
    total_cost: {
      value: {
        type: mongoose.SchemaTypes.Decimal128,
      },
      currency: {
        type: String,
      },
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// OrderSchema.virtual('products', {
//   ref: 'OrderProducts',
//   foreignField: 'order_of',
//   localField: '_id',
// });

const Orders = mongoose.model("Orders", OrderSchema);

module.exports = Orders;
