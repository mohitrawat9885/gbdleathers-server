const express = require('express');
const ReviewController = require('./ReviewController');

const router = express.Router();

router
  .route('/')
  .get(ReviewController.getAllReviews)
  .post(ReviewController.setProductCustomerId, ReviewController.createReview);

router
  .route('/:id')
  .get(ReviewController.getReview)
  .patch(ReviewController.updateReview)
  .delete(ReviewController.deleteReview);

module.exports = router;
