const express = require("express");
const router = express.Router();
const catchAsync = require("../helpers/catchAsync");
const { validateShelter, isLoggedIn, isAuthor } = require("../middlewares");
const shelters = require("../controllers/shelters.controller");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

// All shelters list page & create new shelter
router
  .route("/")
  .get(catchAsync(shelters.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateShelter,
    catchAsync(shelters.createShelter)
  );

// Create new shelter form
router.get("/create", isLoggedIn, shelters.renderNewForm);

// Single shelter detail & update & delete
router
  .route("/:id")
  .get(catchAsync(shelters.showShelter))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateShelter,
    catchAsync(shelters.updateShelter)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(shelters.deleteShelter));

// Single shelter edit
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(shelters.renderEditForm)
);

module.exports = router;
