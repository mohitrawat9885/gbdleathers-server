const mongoose = require('mongoose');
const AppError = require('./../../Utils/appError');
const catchAsync = require('./../../Utils/catchAsync');
const factory = require('./../HandlerFactory');

const Customers = require('./CustomerModel');
const Addresses = require('./AddressModel');
const Cart = require('./CartModel');
const Products = require('../Product/ProductModel');
const Variants = require('../Product/VariantModel');

const APIFeatures = require(`${__dirname}/../../Utils/apiFeatures`);

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
  const filteredBody = filterObj(req.body, 'first_name', 'last_name', 'email');
  // if (req.file) filteredBody.photo = req.file.filename;
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

exports.getme = catchAsync(async (req, res, next) => {
  // console.log('Me', req.customer);
  const data = {
    first_name: req.customer.first_name,
    last_name: req.customer.last_name,
    email: req.customer.email,
  };
  res.status(200).json({
    status: 'success',
    data,
  });
});

exports.addToCart = catchAsync(async (req, res, next) => {
  // console.log('Cart', req.body);
  let doc = await Cart.findOne({
    customer: req.body.customer,
    product: req.body.product,
  });
  let newCartItem = {
    product: req.body.product,
    onModel: '',
    customer: req.customer._id,
    quantity: req.body.quantity ? req.body.quantity : 1,
  };
  let doc2 = await Products.findById(req.body.product);
    if (doc2) {
      newCartItem.onModel = 'Products';
    } else {
      doc2 = await Variants.findById(req.body.product);
      if (doc2) {
        newCartItem.onModel = 'Variants';
      } else {
        return next(new AppError('No Product exists with this Id.', 404));
      }
    }
    if(newCartItem.quantity >= 0 && doc2.stock === 0 ){
      return next(new AppError('Not enough stock', 404));
    }
    if(!(newCartItem.quantity <= 0) && doc2.active === false){
      return next(new AppError(`${doc2.name} is no longer in sale.`, 404));
    }
  if (!doc) {
    if(newCartItem.quantity > doc2.stock || newCartItem.quantity <= 0){
      return next(new AppError('Not enough stock', 404));
    }
    doc = await Cart.create(newCartItem);
  } else {
    let qty = doc.quantity + (req.body.quantity ? req.body.quantity : 1);
    if(qty > doc2.stock && !(qty < doc.quantity)){
      return next(new AppError('Not enough stock', 404));
    }
    if (qty === 0 || qty < 0) {
      // console.log(doc._id, qty);
      doc = await Cart.findByIdAndDelete(doc._id);
      res.status(204).json({
        status: 'success',
        data: null,
      });
      return;
    }
    doc = await Cart.findByIdAndUpdate(
      { _id: doc._id },
      {
        quantity: qty,
      }
    );
  }
  res.status(201).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});

exports.getAllFromCart = factory.getAll(Cart);

exports.getAllFromCart = catchAsync(async (req, res, next) => {
  // To allow for nested GET reviews on tour(hack )

  const features = new APIFeatures(
    Cart.find({ customer: req.customer._id }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .skip();

  // const doc = await features.query.explain();

  let query = features.query;
  query.populate({ path: 'product' });
  const doc = await query;

  for (let i in doc) {
    if (doc[i].onModel === 'Variants') {
      let product = doc[i].product;
      let variant_of = product.variant_of;
      // console.log('Properties', product.properties);
      let name_2 = '';
      for (let j in product.properties) {
        if (name_2) name_2 = name_2 + ' ';
        name_2 =
          name_2 + j.toLowerCase() + ' ' + product.properties[j].toLowerCase();
      }
      if (!product.name) product.name = variant_of.name + '-' + name_2;
      else product.name = product.name + ' ' + name_2;
      if (!product.category) product.category = variant_of.category;
      if (!product.front_image) product.front_image = variant_of.front_image;
      if (!product.back_image) product.back_image = variant_of.back_image;
      if (!product.price) product.price = variant_of.price;
      if (!product.stock) product.stock = variant_of.stock;
      if (!product.summary) product.summary = variant_of.summary;
      if (!product.description) product.description = variant_of.description;
      if (!product.images && product.images < 1)
        product.images = variant_of.images;
      // console.log(doc[i]);
      doc[i].product = product;
    }
  }

  res.status(201).json({
    status: 'success',
    result: doc.length,
    data: doc,
  });
});

exports.updateOneFromCart = factory.updateOne(Cart);
exports.deleteOneFromCart = factory.deleteOne(Cart);
// exports.addToCart = catchAsync(async (req, res, next) => {
//   req.body.product
//   const doc = await Cart.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       data: doc,
//     },
//   });
// });
