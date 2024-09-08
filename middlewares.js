const { shelterSchema, reviewSchema } = require("./schemas");
const ExpressError = require("./helpers/ExpressError");
const Shelter = require("./models/shelter");
const Review = require("./models/review");

module.exports.validateShelter = (req, res, next) => {
  const { error } = shelterSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    console.log("shelter validated");
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    console.log("review validated");
    next();
  }
};

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "Please signin first. :)");
    return res.redirect("/login");
  }
  next();
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    // Save session's returnTo value to locals
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const shelter = await Shelter.findById(id);
  if (!shelter.author.equals(req.user._id)) {
    req.flash("error", "Ah-oh! Seems you don't have permission to do that...");
    return res.redirect(`/shelters/${id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "Ah-oh! Seems you don't have permission to do that...");
    return res.redirect(`/shelters/${id}`);
  }
  next();
};
