const Reviews = require('./ReviewModel');
const factory = require('./../HandlerFactory');

exports.setProductCustomerId = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.customer) req.body.customer = req.customer._id;
  next();
};

exports.getAllReviews = factory.getAll(Reviews);
exports.getReview = factory.getOne(Reviews);
exports.createReview = factory.createOne(Reviews);
exports.updateReview = factory.updateOne(Reviews);
exports.deleteReview = factory.deleteOne(Reviews);
