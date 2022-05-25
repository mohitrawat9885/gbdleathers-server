const multer = require("multer");
const sharp = require("sharp");
const factory = require("../HandlerFactory");
const catchAsync = require("./../../Utils/catchAsync");
const Categorys = require("./CategoryModel");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadCategoryImage = upload.single("photo");

exports.resizeCategoryImage = catchAsync(async (req, re, next) => {
  if (!req.file) return next();

  req.file.filename = `category-${req.user._id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(1200, 1200)
    .toFormat("jpeg")
    .jpeg({ quality: 100 })
    .toFile(`./public/images/${req.file.filename}`);
  req.body.image = req.file.filename;
  next();
});

// exports.createCategory = factory.createOne(Categorys);
exports.createCategory = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  const doc = await Categorys.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      data: doc,
    },
  });
});

exports.getAllCategory = factory.getAll(Categorys);

exports.getAllCategoryProduct = factory.getAll(Categorys, { path: "products" });

exports.getCategory = factory.getOne(Categorys, { path: "products" });
// exports.updateCategory = factory.updateOne(Categorys);
exports.updateCategory = catchAsync(async (req, res, next) => {
  const doc = await Categorys.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      data: doc,
    },
  });
});
exports.removeCategory = factory.deleteOne(Categorys);
