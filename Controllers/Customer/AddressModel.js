const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.ObjectId,
    required: [true, 'Address must have customer id.'],
  },
  phone: {
    type: Number,
    required: [true, 'Please provide a number.'],
  },
  pincode: {
    type: Number,
    required: [true, 'Pincode is required.'],
  },
  state: {
    type: String,
    required: [true, 'State is required.'],
  },
  city: {
    type: String,
    required: [true, 'City is required.'],
  },
  houseInfo: {
    type: String,
    required: [true, 'House Information is required.'],
  },
  streetInfo: {
    type: String,
    required: [true, 'Street Information is required.'],
  },
  streetNumber: {
    type: Number,
    required: [true, 'Street number is required.'],
  },
  zoneNumber: {
    type: Number,
    required: [true, 'Zone number is required.'],
  },
  country: {
    type: String,
    required: [true, 'Country is required.'],
  },
});

const Addresses = mongoose.model('addresses', AddressSchema);

module.exports = Addresses;
