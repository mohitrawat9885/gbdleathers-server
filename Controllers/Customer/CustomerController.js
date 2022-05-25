const mongoose = require("mongoose");
const AppError = require("./../../Utils/appError");
const catchAsync = require("./../../Utils/catchAsync");
const factory = require("./../HandlerFactory");

const Customers = require("./CustomerModel");
const Addresses = require("./AddressModel");
const Cart = require("./CartModel");
const Products = require("../Product/ProductModel");
const Variants = require("../Product/VariantModel");

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
        "This route is not for password updates. Please use /updateMyPassword",
        400
      )
    );
  }
  // 2) Filtered out unwanted fields names that are not allowed to be  updated.
  const filteredBody = filterObj(req.body, "first_name", "last_name", "email");
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
    status: "success",
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
    status: "success",
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
    status: "success",
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
    status: "success",
    data,
  });
});

exports.addToCart = catchAsync(async (req, res, next) => {
  // console.log('Cart', req.body);

  let doc = await Cart.find({
    customer: req.body.customer,
    product: req.body.product,
  });
  let newCartItem = {
    product: req.body.product,
    onModel: "",
    customer: req.customer._id,
    quantity: req.body.quantity ? req.body.quantity : 1,
    multi_properties: req.body.multi_properties,
  };
  let doc2 = await Products.findById(req.body.product);
  if (doc2) {
    newCartItem.onModel = "Products";
  } else {
    doc2 = await Variants.findById(req.body.product);
    if (doc2) {
      newCartItem.onModel = "Variants";
    } else {
      return next(new AppError("No Product exists with this Id.", 404));
    }
  }
  // console.log("Product is ", doc2);
  if (newCartItem.quantity >= 0 && doc2.stock === 0) {
    return next(new AppError("Not enough stock", 404));
  }
  if (!(newCartItem.quantity <= 0) && doc2.active === false) {
    return next(new AppError(`${doc2.name} is no longer in sale.`, 404));
  }

  // here
  // console.log("doc is ", doc);

  if (!doc || doc.length === 0) {
    if (newCartItem.quantity > doc2.stock || newCartItem.quantity <= 0) {
      return next(new AppError("Not enough stock", 404));
    }
    console.log("Creating new");
    doc = await Cart.create(newCartItem);
  } else {
    if (
      !newCartItem.multi_properties ||
      newCartItem.multi_properties.length === 0
    ) {
      let found = false;
      for (let i = 0; i < doc.length; i++) {
        if (!doc[i].multi_properties || doc[i].multi_properties.length === 0) {
          doc = doc[i];
          found = true;
          break;
        }
      }
      if (!found) {
        doc = await Cart.create(newCartItem);
        res.status(201).json({
          status: "success",
          data: {
            data: doc,
          },
        });
        return;
      }
    } else {
      let matched = false;
      let matchedIndex = -1;
      console.log("Pass 1");
      for (let i = 0; i < doc.length; i++) {
        if (
          !doc[i].multi_properties ||
          newCartItem.multi_properties.length !== doc[i].multi_properties.length
        ) {
          console.log("pass 2");
          continue;
        }
        let testObj1 = {};
        let testObj2 = {};
        for (let j = 0; j < doc[i].multi_properties.length; j++) {
          testObj1[doc[i].multi_properties[j].name] =
            doc[i].multi_properties[j].value;
          testObj2[newCartItem.multi_properties[j].name] =
            newCartItem.multi_properties[j].value;
        }
        console.log("Cooo", testObj1, testObj2);
        matched = true;
        for (let k in testObj1) {
          if (testObj1[k] !== testObj2[k]) {
            matched = false;
            break;
          }
        }
        if (matched) {
          matchedIndex = i;
          break;
        }
      }
      if (!matched) {
        doc = await Cart.create(newCartItem);
        res.status(201).json({
          status: "success",
          data: {
            data: doc,
          },
        });
        return;
      } else {
        doc = doc[matchedIndex];
      }
    }
    // console.log("Here", doc.length);
    // // console.log("New Here", newCartItem);
    // for (let i = 0; i < doc.length; i++) {
    //   console.log(doc[i]);
    //   for(let j in doc[i].multi_properties){}
    // }
    // return;

    let qty = doc.quantity + (req.body.quantity ? req.body.quantity : 1);
    if (qty > doc2.stock && !(qty < doc.quantity)) {
      return next(new AppError("Not enough stock", 404));
    }
    if (qty === 0 || qty < 0) {
      // console.log(doc._id, qty);
      doc = await Cart.findByIdAndDelete(doc._id);
      res.status(204).json({
        status: "success",
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
    status: "success",
    data: {
      data: doc,
    },
  });
});

exports.getAllFromCart = factory.getAll(Cart, { path: "product" });

// exports.getAllFromCart = catchAsync(async (req, res, next) => {
//   const features = new APIFeatures(
//     Cart.find({ customer: req.customer._id }),
//     req.query
//   )
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   // .skip();

//   let query = features.query;
//   query.populate({ path: "product" });
//   let doc = await query;
//   let newDoc = new Array(doc);

//   for (let i = 0; i < newDoc.length; i++) {
//     if (newDoc[i].onModel === "Variants") {
//       let product = newDoc[i].product;
//       console.log(product);
//       let variant_of = product.variant_of;
//       product.subName = product.name;
//       product.name = variant_of.name;

//       if (!product.category) product.category = variant_of.category;
//       if (!product.front_image)
//         product.front_image =
//           variant_of.front_image || variant_of.images[0] || "";
//       if (!product.back_image)
//         product.back_image =
//           variant_of.back_image || variant_of.images[1] || "";
//       if (!product.price) product.price = variant_of.price;
//       if (!product.stock) product.stock = variant_of.stock;
//       if (!product.summary) product.summary = variant_of.summary;
//       if (!product.description) product.description = variant_of.description;
//       if (!product.images && product.images.length < 1)
//         product.images = variant_of.images;

//       newDoc[i].product = product;
//       console.log(product);
//     }
//   }
//   // console.log(doc);

//   res.status(200).json({
//     status: "success",
//     result: newDoc.length,
//     data: newDoc,
//   });
// });

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
