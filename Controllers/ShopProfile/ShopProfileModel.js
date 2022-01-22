const mongoose = require('mongoose');

const ShopProfileSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: 'gbdleathers',
  },
  name: {
    type: String,
  },
  emails: [],
  numbers: [],
  address: String,
  front_image: String,
  back_image: String,
});

const ShopProfile = mongoose.model('ShopProfile', ShopProfileSchema);

module.exports = ShopProfile;
