const mongoose = require("mongoose");
const catchAsync = require("./../../Utils/catchAsync");
const factory = require("./../HandlerFactory");

const Customers = require("../Customer/CustomerModel");
const Addresses = require("../Customer/AddressModel");
const Cart = require("../Customer/CartModel");
const Orders = require("./OrderModel");
const OrderProducts = require("./OrderProductModel");
const AppError = require("../../Utils/appError");
const Products = require("../Product/ProductModel");
const Variants = require("../Product/VariantModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutData = catchAsync(async (req, res, next) => {
  if (!req.customer._id) {
    return next(new AppError("Customer id is missing!", 404));
  }
  const customer = await Customers.findById(req.customer._id);
  if (!customer) {
    return next(
      new AppError("Your Account not found! Please Login Again.", 404)
    );
  }
  if (!req.body.address) {
    return next(new AppError("Your Address is missing!", 404));
  }
  const address = await Addresses.findById(req.body.address);
  if (!address) {
    return next(
      new AppError("Address not found Please provide other address!", 404)
    );
  }
  let cart = await Cart.find({ customer: req.customer._id }).populate({
    path: "product",
  });
  if (!cart || cart.length == 0) {
    return next(new AppError("Your Cart have no Item!", 404));
  }

  // console.log("Cart", cart);

  cart = cart.map((variant) => {
    if (variant.onModel === "Products") return variant;
    if (variant.product.images.length === 0) {
      variant.product.images = variant.product.variant_of.images;
    }
    variant.product.front_image =
      variant.product.front_image || variant.product.variant_of.front_image;
    variant.product.back_image =
      variant.product.back_image || variant.product.variant_of.back_image;
    if (variant.product.name) {
      variant.product.name =
        variant.product.variant_of.name + "-" + variant.product.name;
    } else {
      variant.product.name = variant.product.variant_of.name;
    }
    variant.product.stock =
      variant.product.stock || variant.product.variant_of.stock;
    variant.product.price =
      variant.product.price || variant.product.variant_of.price;
    variant.product.summary =
      variant.product.summary || variant.product.variant_of.summary;
    variant.product.description =
      variant.product.description || variant.product.variant_of.description;

    return variant;
  });

  let products = [];
  let totalCost = 0;
  for (let i = 0; i < cart.length; i++) {
    // console.log(cart[i].product.variant_of)
    if (cart[i].quantity > cart[i].product.stock) {
      return next(
        new AppError(
          `${cart[i].product.name} have only ${cart[i].product.stock} stock(s) remaining.`,
          404
        )
      );
    }
    if (cart[i].product.active === false) {
      return next(
        new AppError(`${cart[i].product.name} is no longer in sale`, 404)
      );
    }
    // console.log(cart[i].product.properties)
    // console.log(cart[i].multi_properties)
    let product_properties = [];
    for (let p in cart[i].product.properties) {
      let pObj = {
        name: p,
        value: cart[i].product.properties[p],
      };
      product_properties.push(pObj);
      // console.log(cart[i].product.properties[p])
    }
    for (let p in cart[i].multi_properties) {
      let pObj = {
        name: cart[i].multi_properties[p].name,
        value: cart[i].multi_properties[p].value,
      };
      product_properties.push(pObj);
    }

    // console.log(product_properties)

    let productObj = {
      _id: cart[i].product._id,
      name: cart[i].product.name,
      image: cart[i].product.front_image,
      price: cart[i].product.price,
      quantity: cart[i].quantity,
      properties: product_properties,
      status: "ordered",
    };
    totalCost = totalCost + cart[i].quantity * productObj.price;
    products.push(productObj);
  }
  // console.log(products)
  // return res.status(200).json({
  //   status: 'success',
  //   message: 'Your Order has been received.',
  // });

  let order = {
    products: products,
    customer: customer._id,
    customer_detail: {
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
    },
    address: {
      _id: address._id,
      first_name: address.first_name,
      last_name: address.last_name,
      address_1: address.address_1,
      city: address.city,
      country: address.country,
      province: address.province,
      postal_zip_code: address.postal_zip_code,
      phone: address.phone,
    },
    status: "ordered",
    payment: "online",
    ordered_at: Date.now(),
    total_cost: {
      value: totalCost.toFixed(2),
      currency: "USD",
    },
  };
  req.order = order;
  setOrderData(req.order);
  return res.status(200).json({
    status: "success",
    message: "Your Order has been received.",
    payment_url: "/my-account/?option=orders",
  });
  // next();
});

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  let item_Array = [];
  for (let i in req.order.products) {
    let obj = {
      name: req.order.products[i].name,
      amount: req.order.products[i].price * 100,
      currency: "usd",
      quantity: req.order.products[i].quantity,
      images: [
        `${req.protocol}://${req.get("host")}/images/${
          req.order.products[i].image
        }`,
      ],
    };
    item_Array.push(obj);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${req.protocol}://${req.get(
      "host"
    )}/my-account/?option=orders`,
    cancel_url: `${req.protocol}://${req.get(
      "host"
    )}/my-account/?option=orders`,
    customer_email: req.customer.email,
    client_reference_id: "customer-cart-reference-id",
    line_items: item_Array,
  });
  setOrderData(req.order);
  res.status(200).json({
    status: "success",
    payment_url: session.url,
  });
  //   res.redirect(303, session.url);
});

const setOrderData = async (order) => {
  console.log("Order Recieved is ", order);

  for (let i in order.products) {
    Products.findById(order.products[i]._id, (err, prd) => {
      // if(err) {
      //   console.log("Error", err);
      //    return
      // }
      console.log("Product found", prd);
      if (!prd || prd.length == 0) {
        Variants.findById(order.products[i]._id, (err, prd) => {
          prd.stock = prd.stock - order.products[i].quantity;
          prd.save();
        });
      } else {
        prd.stock = prd.stock - order.products[i].quantity;
        prd.save();
      }
    });
  }
  // console.log(order.products)
  await Orders.create(order);
  // await OrderProducts.create(OrderData.products);
  await Cart.deleteMany({ customer: order.customer });
};

exports.getMyOrders = catchAsync(async (req, res) => {
  const doc = await Orders.find({ customer: req.customer._id }).sort(
    "-ordered_at"
  );

  res.status(200).json({
    status: "success",
    data: doc,
  });
});

// ADMIN FUNCTIONSSS----------------
exports.getAllOrders = factory.getAll(Orders);
exports.getOrder = factory.getOne(Orders);
exports.updateOrder = factory.updateOne(Orders);
exports.deleteOrder = factory.deleteOne(Orders);
