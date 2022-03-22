const mongoose = require('mongoose');
const Products = require('../Product/ProductModel');
const Variants = require('../Product/VariantModel');
const ReviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Review must have rating.'],
    },
    images: {
      type: Array,
    },
    created_at: {
      type: Date,
      default: Date.now(),
    },
    updated_at: {
      type: Date,
      default: Date.now(),
    },
    product: {
      type: mongoose.Schema.ObjectId,
      refPath: 'onModel',
      required: [true, 'Review must belong to a product.'],
    },
    onModel: {
      type: String,
      required: true,
      enum: ['Products', 'Variants'],
    },
    customer: {
      type: mongoose.Schema.ObjectId,
      ref: 'Customers',
      required: [true, 'Review must belongs to a customer'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ReviewSchema.index({ product: 1, customer: 1 }, { unique: true });

ReviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'customer',
    select: '_id first_name last_name',
  });
  next();
});

ReviewSchema.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: '$product',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);

  if (stats.length > 0) {
    let doc = await Products.findByIdAndUpdate(productId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
    if (!doc) {
      await Variants.findByIdAndUpdate(productId, {
        ratingsQuantity: stats[0].nRating,
        ratingsAverage: stats[0].avgRating,
      });
    }
  } else {
    let doc = await Products.findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
    if (!doc) {
      await Variants.findByIdAndUpdate(productId, {
        ratingsQuantity: 0,
        ratingsAverage: 0,
      });
    }
  }
};

ReviewSchema.post('save', function () {
  // this points to current review
  this.constructor.calcAverageRatings(this.product);
});

ReviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne().clone();
  // console.log(this.r);
  next();
});

ReviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne().clone(); does not work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.product);
});

const Reviews = mongoose.model('Reviews', ReviewSchema);

module.exports = Reviews;
