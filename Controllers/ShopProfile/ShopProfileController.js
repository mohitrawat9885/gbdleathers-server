const multer = require('multer');
const sharp = require('sharp');
const factory = require('../HandlerFactory');
const catchAsync = require('./../../Utils/catchAsync');
const AppError = require('../../Utils/appError');
const ShopProfile = require('./ShopProfileModel');
const ShopGallary = require('./ShopGallaryModel');

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

exports.uploadShopGallaryImage = upload.single('photo');

exports.resizeShopGallaryImage = catchAsync(async (req, re, next) => {
  if (!req.file) return next();

  req.file.filename = `gallary-${req.user._id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(1200, 1200)
    .toFormat('jpeg')
    .jpeg({ quality: 100 })
    .toFile(`./public/images/${req.file.filename}`);
  req.body.image = req.file.filename;
  next();
});

exports.uploadShopProfileImages = upload.fields([
  { name: 'front_image', maxCount: 1 },
  { name: 'back_image', maxCount: 1 },
]);

// upload.single('image')
// upload.array('images', 5)

exports.resizeShopProfileImages = catchAsync(async (req, res, next) => {
  if (!req.files) return next();
  // console.log(req.files);

  if (req.files.front_image) {
    req.body.front_image = `shop-profile-front-image-${Date.now()}.jpeg`;
    await sharp(req.files.front_image[0].buffer)
      .resize(1200, 1200)
      .toFormat('jpeg')
      .jpeg({ quality: 100 })
      .toFile(`public/images/${req.body.front_image}`);
  }
  if (req.files.back_image) {
    req.body.back_image = `shop-profile-back-image-${Date.now()}.jpeg`;
    await sharp(req.files.back_image[0].buffer)
      .resize(1200, 1200)
      .toFormat('jpeg')
      .jpeg({ quality: 100 })
      .toFile(`public/images/${req.body.back_image}`);
  }
  next();
});

exports.getShopProfile = catchAsync(async (req, res, next) => {
  const doc = await ShopProfile.findById({ _id: 'gbdleathers' });
  // console.log('Doc', doc);
  if (!doc) {
    return next(new AppError('No Doc found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: doc,
  });
});

exports.updateShopProfile = catchAsync(async (req, res, next) => {
  const doc = await ShopProfile.findByIdAndUpdate(
    { _id: 'gbdleathers' },
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
    data: {
      data: doc,
    },
  });
});

exports.saveShopGallaryImageName = catchAsync(async (req, res, next) => {
  const doc = await ShopGallary.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});

exports.getShopGallary = factory.getAll(ShopGallary);

exports.removeShopGallaryImageName = catchAsync(async (req, res, next) => {
  const doc = await ShopGallary.findByIdAndDelete(req.params.id);
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
