const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Customers',
    required: [true, 'Address must have customer id.'],
  },
  first_name: {
    type: String,
    required: [true, 'Address must have First Name.'],
  },
  last_name: {
    type: String,
  },
  address_1: {
    type: String,
    required: [true, 'Address must have address 1.'],
  },
  address_2: {
    type: String,
  },
  city: {
    type: String,
    required: [true, 'Address must have city.'],
  },
  country: {
    type: String,
    required: [true, 'Address must have country.'],
  },
  province: {
    type: String,
    required: [true, 'Address must have province.'],
  },
  postal_zip_code: {
    type: Number,
    required: [true, 'Address must have postal or zip code.'],
  },
  phone: {
    type: Number,
    required: [true, 'Please provide a number.'],
  },
  defaultAddress: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
  updated_at: {
    type: Date,
    default: Date.now(),
  },
});

const Addresses = mongoose.model('addresses', AddressSchema);

module.exports = Addresses;
