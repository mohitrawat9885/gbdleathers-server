const mongoose = require('mongoose');
const slugify = require('slugify');

const CategorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [
        true,
        'User details are missing. Please logout and then login again!',
      ],
    },
    name: {
      type: String,
      unique: [true, 'Please give unique name to each category!'],
      required: [true, 'Please give any name to your new Category'],
    },
    image: {
      type: String,
      default: 'gbdleathers_category_default_image.jpg',
    },
    slug: {
      type: String,
      unique: true,
    },
    active: {
      type: Boolean,
      default: false,
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

CategorySchema.virtual('products', {
  ref: 'products',
  foreignField: 'category',
  localField: '_id',
});

CategorySchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Categorys = mongoose.model('categorys', CategorySchema);

module.exports = Categorys;
