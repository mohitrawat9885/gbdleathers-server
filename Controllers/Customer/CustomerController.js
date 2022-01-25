const AppError = require('./../../Utils/appError');
const catchAsync = require('./../../Utils/catchAsync');
const factory = require('./../HandlerFactory');

const Customers = require('./CustomerModel');
const Addresses = require('./AddressModel');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }
  // 2) Filtered out unwanted fields names that are not allowed to be  updated.
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  // 2) Update usert document

  const updatedUser = await Customers.findByIdAndUpdate(
    req.customer._id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      customer: updatedUser,
    },
  });
});

// exports.createAddress = factory.createOne();
exports.createAddress = catchAsync(async (req, res, next) => {
  req.body.customer = req.customer._id;
  const doc = await Addresses.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});

// exports.getAddress = factory.getOne();
exports.getAddress = catchAsync(async (req, res, next) => {
  let doc = await Addresses.find({ customer: req.customer._id });

  if (!doc) {
    doc = [];
  }
  res.status(200).json({
    status: 'success',
    data: doc,
  });
});

exports.updateAddress = factory.updateOne(Addresses);
exports.deleteAddress = factory.deleteOne(Addresses);
