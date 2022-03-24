const express = require('express');
const ReviewController = require('./ReviewController');

const router = express.Router();

router.route('/');
// .get(ReviewController.getAllReviews)

router
  .route('/:productId')
  .post(
    ReviewController.uploadReviewImages,
    ReviewController.resizeReviewImages,
    ReviewController.createReview
  )
  .get(ReviewController.getReview)
  .patch(ReviewController.updateReview)
  .delete(ReviewController.deleteReview);

module.exports = router;
