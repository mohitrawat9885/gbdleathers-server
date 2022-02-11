const mongoose = require('mongoose');
const catchAsync = require('./../../Utils/catchAsync');
const factory = require('./../HandlerFactory');

const Customers = require('../Customer/CustomerModel');
const Addresses = require('../Customer/AddressModel');
const Cart = require('../Customer/CartModel');
const Orders = require('./OrderModel');
const OrderProducts = require('./OrderProductModel');
const AppError = require('../../Utils/appError');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutData = catchAsync(async (req, res, next) => {
  if (!req.customer._id) {
    return next(new AppError('Customer id is missing!', 404));
  }
  const customer = await Customers.findById(req.customer._id);
  if (!customer) {
    return next(
      new AppError('Your Account not found! Please Login Again.', 404)
    );
  }
  if (!req.body.address) {
    return next(new AppError('Your Address is missing!', 404));
  }
  const address = await Addresses.findById(req.body.address);
  if (!address) {
    return next(
      new AppError('Address not found Please provide other address!', 404)
    );
  }
  const cart = await Cart.find({ customer: req.customer._id }).populate({
    path: 'product',
  });
  const order_id = new mongoose.Types.ObjectId();
  let products = [];
  let totalCost = 0;
  for (let i = 0; i < cart.length; i++) {
    let productObj = {
      order_of: order_id,
      product: {
        product_id: cart[i].product._id,
        name: cart[i].product.name,
        image: cart[i].product.front_image,
        price: cart[i].product.price,
      },
      quantity: cart[i].quantity,
      status: 'ordered',
    };
    totalCost = totalCost + cart[i].quantity * cart[i].product.price;
    products.push(productObj);
  }

  let OrderData = {
    order: {
      products: products,
      _id: order_id,
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
      status: 'ordered',
      payment: 'online',
      ordered_at: Date.now(),
      total_cost: {
        value: totalCost,
        currency: 'USD',
      },
    },
  };
  req.OrderData = OrderData;
  next();
});

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  let item_Array = [];
  for (let i in req.OrderData.order.products) {
    let obj = {
      name: req.OrderData.order.products[i].product.name,
      amount: req.OrderData.order.products[i].product.price * 100,
      currency: 'usd',
      quantity: req.OrderData.order.products[i].quantity,
      images: [
        `${req.protocol}://${req.get('host')}/images/${
          req.OrderData.order.products[i].product.image
        }`,
      ],
    };
    item_Array.push(obj);
  }
  //   console.log(item_Array);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: `${req.protocol}://${req.get(
      'host'
    )}/my-account/?option=orders`,
    cancel_url: `${req.protocol}://${req.get(
      'host'
    )}/my-account/?option=orders`,
    customer_email: req.customer.email,
    client_reference_id: 'customer-cart-reference-id',
    line_items: item_Array,
  });
  setOrderData(req.OrderData);
  res.status(200).json({
    status: 'success',
    payment_url: session.url,
  });

  //   next();
  //   res.send('s');
  //   res.redirect(303, session.url);
});

const setOrderData = async (OrderData) => {
  // console.log('Order Recieved is ', OrderData);
  await Orders.create(OrderData.order);
  // await OrderProducts.create(OrderData.products);
  // await Cart.deleteMany({ customer: OrderData.order.customer });
};

exports.getMyOrders = catchAsync(async (req, res) => {
  const doc = await Orders.find({ customer: req.customer._id })
    .populate({
      path: 'products',
    })
    .sort('-ordered_at');
  //   console.log('Orders', doc);
  res.status(200).json({
    status: 'success',
    data: doc,
  });
});

// ADMIN FUNCTIONSSS----------------
exports.getAllOrders = factory.getAll(Orders, { path: 'products' });
exports.updateOrder = factory.updateOne(Orders);
exports.deleteOrder = factory.deleteOne(Orders);
