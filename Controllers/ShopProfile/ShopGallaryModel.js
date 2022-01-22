const mongoose = require('mongoose');

const ShopGallarySchema = new mongoose.Schema({
  image: {
    type: String,
    required: [true, 'Image not found'],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const ShopGallary = mongoose.model('ShopGallary', ShopGallarySchema);

module.exports = ShopGallary;
