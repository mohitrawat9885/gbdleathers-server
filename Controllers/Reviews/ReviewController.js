const Reviews = require('./ReviewModel');
const factory = require('./../HandlerFactory');
const catchAsync = require('./../../Utils/catchAsync');
const AppError = require('./../../Utils/appError');
const Products = require('../Product/ProductModel');
const Variants = require('../Product/VariantModel');

const multer = require('multer');
const sharp = require('sharp');

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

exports.uploadReviewImages = upload.fields([{ name: 'images', maxCount: 5 }]);

// upload.single('image')
// upload.array('images', 5)

exports.resizeReviewImages = catchAsync(async (req, res, next) => {
  
  if (!req.files) return next();

  // console.log("Images are ", req.files.images[1])
  // for(let i in req.files.images){
  //   console.log(`Image no ${i}`, req.body.images)
  // }
  // console.log("My files", req.files.images)
  // return;

  if (req.files.images) {
    req.body.images = [];
    // console.log("Review Images ", req.file.images)

    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `review-${req.params.productId}-${Date.now()}-${
          i + 1
        }.jpeg`;
        await sharp(file.buffer)
          .resize(800, 800)
          .toFormat('jpeg')
          .jpeg({ quality: 80 })
          .toFile(`public/images/${filename}`);
        req.body.images.push(filename);
      })
    );
  }
  next();
});

exports.createReview = catchAsync(async (req, res, next) => {
  console.log("Request is ", req.body)
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.customer) req.body.customer = req.customer._id;
  console.log('Review and Rating is ', req.body.review, ' ', req.body.rating);
  let newReview = {
    product: req.params.productId,
    customer: req.customer._id,
    onModel: '',
    review: req.body.review,
    rating: req.body.rating,
    images: req.body.images,
  };
  let prd = await Products.findById(req.body.product);
  newReview.onModel = 'Products';
  if (!prd) {
    prd = await Variants.findById(req.body.product);
    if (prd) newReview.onModel = 'Variants';
    else {
      return next(new AppError('No Product found for this review', 404));
    }
  }
  const doc = await Reviews.create(newReview);
  console.log("Created Review is ", doc)
  res.status(201).json({
    status: 'success',
    data: doc,
  });
});

exports.getReview = catchAsync(async (req, res, next) => {
  let query = Reviews.findOne({
    product: req.params.productId,
    customer: req.body.customer,
  });

  let doc = await query;
  if (!doc) {
    doc = [];
  }
  res.status(200).json({
    status: 'success',
    data: doc,
  });
});

exports.getAllReview = catchAsync(async (req, res, next) => {
  let query = Reviews.find({
    product: req.params.productId,
  });

 let doc = await query.sort("-created_at");
  if (!doc) {
    doc = [];
  }
  res.status(200).json({
    status: 'success',
    data: doc,
  });
});

// exports.updateReview = factory.updateOne(Reviews);

exports.updateReview = catchAsync(async (req, res, next) => {
  const doc = await Reviews.findOneAndUpdate(
    { product: req.params.productId, customer: req.body.customer },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: doc,
  });
});

// exports.deleteReview = factory.deleteOne(Reviews);

exports.deleteReview = catchAsync(async (req, res, next) => {
  const doc = await Reviews.findOneAndDelete({
    product: req.params.productId,
    customer: req.body.customer,
  });
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
