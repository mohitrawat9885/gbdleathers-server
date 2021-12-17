const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  admin_id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    require: true,
  },
  price: {
    type: Number,
    require: true,
  },
  stock: {
    type: Number,
    default: 0,
  },
  published: {
    type: Boolean,
    default: false,
  },
  image: {
    type: Array,
    require: true,
  },
  sort_detail: {
    type: String,
    require: false,
  },
  long_detail: {
    type: String,
    require: false,
  },
  category: {
    type: String,
    default: "0",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

const Products = mongoose.model("Products", ProductSchema);
module.exports = Products;
