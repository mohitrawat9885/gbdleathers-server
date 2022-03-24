const mongoose = require('mongoose');
const multer = require('multer');
const sharp = require('sharp');
const factory = require('../HandlerFactory');
const catchAsync = require('../../Utils/catchAsync');
const AppError = require('../../Utils/appError');
const Products = require('./ProductModel');
const Variants = require('./VariantModel');
const Cart = require('../Customer/CartModel');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadProductImages = upload.fields([
  { name: 'front_image', maxCount: 1 },
  { name: 'back_image', maxCount: 1 },
  { name: 'images' },
]);

// upload.single('image')
// upload.array('images', 5)

exports.resizeProductImages = catchAsync(async (req, res, next) => {
  if (!req.files) return next();
  // console.log('User is ', req.body);
  if (req.files.front_image) {
    req.body.front_image = `product-front-${req.params.id}-${
      req.user._id
    }-${Date.now()}.jpeg`;
    await sharp(req.files.front_image[0].buffer)
      .resize(1200, 1200)
      .toFormat('jpeg')
      .jpeg({ quality: 100 })
      .toFile(`public/images/${req.body.front_image}`);
  }
  if (req.files.back_image) {
    req.body.back_image = `product-back-${req.params.id}-${
      req.user._id
    }-${Date.now()}.jpeg`;
    await sharp(req.files.back_image[0].buffer)
      .resize(1200, 1200)
      .toFormat('jpeg')
      .jpeg({ quality: 100 })
      .toFile(`public/images/${req.body.back_image}`);
  }

  if (req.files.images) {
    req.body.images = [];

    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `product-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

        await sharp(file.buffer)
          .resize(1200, 1200)
          .toFormat('jpeg')
          .jpeg({ quality: 100 })
          .toFile(`public/images/${filename}`);
        req.body.images.push(filename);
      })
    );
  }
  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// exports.createProduct = factory.createOne(Products);
exports.createProduct = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  const doc = await Products.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});

exports.getAllProduct = factory.getAll(Products);


exports.getProduct = factory.getOne(Products, { path: 'variants' });

exports.getProduct = catchAsync(async (req, res, next) => {
  let doc = await Products.findById(req.params.id)
    .populate({
      path: 'variants',
    })
    .populate({ path: 'reviews' });
  if (!doc) {
    doc = await Variants.findById(req.params.id)
      .populate({
        path: 'variant_of',
      })
      .populate({ path: 'reviews' });
  }

  res.status(200).json({
    status: 'success',
    data: doc,
  });
});
// exports.updateProduct = factory.updateOne(Products);

exports.updateProduct = catchAsync(async (req, res, next) => {
  // console
  req.body.user = req.user._id;
  if (req.body.multi_properties) {
    req.body.multi_properties = JSON.parse(req.body.multi_properties);
  }
  if (req.body.properties) {
    req.body.properties = JSON.parse(req.body.properties);
  }
  let doc = await Products.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) {
    doc = await Variants.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(
        new AppError('No Product or Variant found with that ID', 404)
      );
    }
  }
  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});

// exports.removeProduct = factory.deleteOne(Products);
exports.removeProduct = catchAsync(async (req, res, next) => {
  await Cart.deleteMany({ product: req.params.id });
  let doc = await Products.findByIdAndDelete(req.params.id);
  if (!doc) {
    doc = await Variants.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
exports.createProductVariant = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  let doc = await Products.findById(req.params.id);
  if (!doc) {
    return next(new AppError('No Product found with that ID', 404));
  }
  req.body.category = doc.category;
  req.body.variant_of = doc._id;

  doc = await Variants.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});

exports.addProductImages = catchAsync(async (req, res, next) => {
  let doc = await Products.findByIdAndUpdate(
    req.params.id,
    {
      $push: { images: req.body.images },
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!doc) {
    doc = await Variants.findByIdAndUpdate(
      req.params.id,
      {
        $push: { images: req.body.images },
      },
      {
        new: true,
        runValidators: true,
      }
    );
  }
  res.status(200).json({
    status: 'success',
    data: {
      data: doc.images ? doc.images : [],
    },
  });
});

exports.getProductImages = catchAsync(async (req, res, next) => {
  console.log(req.params);
  let doc = await Products.findOne({ _id: req.params.id });
  if (!doc) {
    doc = await Variants.findOne({ _id: req.params.id });
  }
  res.status(200).json({
    status: 'success',
    data: {
      data: doc.images ? doc.images : [],
    },
  });
});

exports.removeProductImage = catchAsync(async (req, res, next) => {
  // console.log(req.params.image);

  let doc = await Products.findByIdAndUpdate(
    req.params.id,
    {
      $pull: { images: req.params.image },
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!doc) {
    doc = await Variants.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { images: req.params.image },
      },
      {
        new: true,
        runValidators: true,
      }
    );
  }
  res.status(200).json({
    status: 'success',
    data: {
      data: doc.images,
    },
  });
});

exports.getVariant = catchAsync(async (req, res, next) => {
  // for (let i in req.query) {
  //   let t = {
  //     properties.${i}: req.query[i]
  //   };
  //   console.log(t);
  // }
  let doc = await Variants.findOne({
    properties: req.query,
  });
  console.log('Variants', req.params);
  console.log(req.query);
  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});
