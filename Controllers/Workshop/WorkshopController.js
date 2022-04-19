const mongoose = require("mongoose");
const multer = require("multer");
const sharp = require("sharp");
const factory = require("../HandlerFactory");
const catchAsync = require("../../Utils/catchAsync");
const AppError = require("../../Utils/appError");
const Workshops = require("./WorkshopModel");
const Participants = require("./ParticipantModel");

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

exports.uploadWorkshopImages = upload.fields([
  { name: "banner", maxCount: 1 },
  { name: "images" },
]);

exports.resizeWorkshopImages = catchAsync(async (req, res, next) => {
  if (!req.files) return next();
  if (req.files.banner) {
    req.body.banner = `banner-${req.params.id}-${
      req.user._id
    }-${Date.now()}.jpeg`;
    await sharp(req.files.banner[0].buffer)
      .resize(1200, 1200)
      .toFormat("jpeg")
      .jpeg({ quality: 100 })
      .toFile(`public/images/${req.body.banner}`);
  }

  if (req.files.images) {
    req.body.images = [];

    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `workshop-images-${req.params.id}-${Date.now()}-${
          i + 1
        }.jpeg`;

        await sharp(file.buffer)
          .resize(1200, 1200)
          .toFormat("jpeg")
          .jpeg({ quality: 100 })
          .toFile(`public/images/${filename}`);
        req.body.images.push(filename);
      })
    );
  }
  next();
});

exports.createWorkshop = factory.createOne(Workshops);

exports.getAllWorkshops = factory.getAll(Workshops);

exports.getWorkshop = factory.getOne(Workshops, { path: "participants" });
// , { path: "participants" }

exports.updateWorkshop = factory.updateOne(Workshops);

exports.removeWorkshop = factory.deleteOne(Workshops);

exports.addWorkshopImages = catchAsync(async (req, res, next) => {
  let doc = await Workshops.findByIdAndUpdate(
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
  }
  res.status(200).json({
    status: "success",
    data: {
      data: doc.images ? doc.images : [],
    },
  });
});
exports.getWorkshopImages = catchAsync(async (req, res, next) => {
  let doc = await Workshops.findOne({ _id: req.params.id });
  if (!doc) {
    doc = await Variants.findOne({ _id: req.params.id });
  }
  res.status(200).json({
    status: "success",
    data: {
      data: doc.images ? doc.images : [],
    },
  });
});
exports.removeWorkshopImage = catchAsync(async (req, res, next) => {
  let doc = await Workshops.findByIdAndUpdate(
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
  }
  res.status(200).json({
    status: "success",
    data: {
      data: doc.images,
    },
  });
});

exports.createParticipant = factory.createOne(Participants);
exports.getAllParticipants = factory.getAll(Participants);
exports.getParticipant = factory.getOne(Participants);
exports.updateParticipant = factory.updateOne(Participants);
exports.removeParticipant = factory.deleteOne(Participants);
