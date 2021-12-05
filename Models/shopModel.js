const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  numbers: {
    type: Number,
    require: true,
  },
  email: {
    type: String,
    require: false,
  },
  address: {
    type: Object,
    require: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const shop = mongoose.model("shop", shopSchema);
module.exports = shop;
