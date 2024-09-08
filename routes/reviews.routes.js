const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../helpers/catchAsync");
const {
  validateReview,
  isLoggedIn,
  isReviewAuthor,
} = require("../middlewares");
const reviews = require("../controllers/reviews.controller");

// Post review to a shelter
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

// Delete a review
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
