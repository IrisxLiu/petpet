const express = require("express");
const router = express.Router();
const passport = require("passport");
const { storeReturnTo } = require("../middlewares");
const users = require("../controllers/users.controller");

// User register
router.route("/register").get(users.renderRegisterForm).post(users.register);

// User login
router
  .route("/login")
  .get(users.renderLoginForm)
  .post(
    storeReturnTo,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.login
  );

// User logout
router.get("/logout", users.logout);

module.exports = router;
