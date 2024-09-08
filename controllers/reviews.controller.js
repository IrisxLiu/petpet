const Review = require("../models/review");
const Shelter = require("../models/shelter");

module.exports.createReview = async (req, res) => {
  try {
    const { id } = req.params;
    const shelter = await Shelter.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    shelter.reviews.push(review);
    await review.save();
    await shelter.save();
    req.flash("success", "Review posted successfully.");
    res.redirect(`/shelters/${shelter._id}`);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/shelters/${id}`);
  }
};

module.exports.deleteReview = async (req, res) => {
  try {
    const { id: shelterId, reviewId } = req.params;
    await Shelter.findByIdAndUpdate(shelterId, {
      $pull: { reviews: reviewId },
    });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted successfully.");
    res.redirect(`/shelters/${shelterId}`);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/shelters/${id}`);
    D;
  }
};
