const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  admin_id: {
    type: String,
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  image: {
    type: String,
    require: false,
    default: "gbdleathers_category_image.png",
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

const Categorys = mongoose.model("Categorys", CategorySchema);

module.exports = Categorys;
