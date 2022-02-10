const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [
        true,
        'User details are missing. Please logout and then login again!',
      ],
    },
    variant_of: {
      type: mongoose.Schema.ObjectId,
      ref: 'Products',
      // ref: 'Variants',
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Categorys',
    },
    name: {
      type: String,
      // required: [true, 'Please give one name to your new product variant'],
    },
    front_image: String,
    back_image: String,
    price: {
      type: Number,
      min: 0,
    },
    stock: {
      type: Number,
      min: 0,
    },
    active: {
      type: Boolean,
      default: false,
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    images: {
      type: Array,
      default: [],
    },
    properties: {
      type: Object,
      // unique: [true, 'This Variant is already present.'],
    },
    multi_properties: {
      type: Object,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// VariantSchema.virtual('product', {
//   ref: 'Product',
//   foreignField: 'variant_of',
//   localField: '_id',
// });

VariantSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'variant_of',
  });
  next();
});

const Variants = mongoose.model('Variants', VariantSchema);

module.exports = Variants;
