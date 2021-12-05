const mongoose = require("mongoose");

const categorysSchema = new mongoose.Schema({
  admin_id: {
    type: String,
    require: true,
  },
  category: {
    type: String,
    require: false,
  },
  image_name: {
    type: String,
    require: false,
  },
});

const categorys = mongoose.model("categorys", categorysSchema);

module.exports = categorys;
