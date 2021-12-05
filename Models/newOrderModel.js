const mongoose = require("mongoose");
const newOrdersSchema = new mongoose.Schema({
  order_status: {
    type: String,
  },
  order_pay: {
    type: String,
  },
  customer_id: {
    type: String,
  },
  craft_name: {
    type: String,
  },
  craft_image: {
    type: String,
  },
  craft_price: {
    type: Number,
  },
  craft_category: {
    type: String,
  },
  craft_quantity: {
    type: Number,
  },
  customer_address: {
    type: Object,
  },
  order_date: {
    type: Object,
    require: false,
  },
});

const newOrders = mongoose.model("newOrders", newOrdersSchema);

module.exports = newOrders;
