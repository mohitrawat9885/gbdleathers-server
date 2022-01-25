const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [
        true,
        'User details are missing. Please logout and then login again!',
      ],
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'categorys',
    },
    name: {
      type: String,
      //  required: [true, 'Please give one name to your new product'],
    },
    front_image: String,
    back_image: String,
    price: {
      type: Number,
      //  require: [true, 'Please provide price of new product'],
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
      //  required: [true, 'Product must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    images: {
      type: Array,
      default: [],
    },
    slug: {
      type: String,
      unique: true,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    variant_name: {
      type: String,
      default: '',
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

//  Virtual populate
ProductSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

ProductSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

ProductSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'category',
    select: '_id name',
  });
  next();
});
ProductSchema.virtual('variants', {
  ref: 'Variants',
  foreignField: 'variant_of',
  localField: '_id',
});

const Products = mongoose.model('Products', ProductSchema);

module.exports = Products;
