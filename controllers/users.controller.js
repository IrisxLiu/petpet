const User = require("../models/user");

module.exports.renderRegisterForm = (req, res) => {
  try {
    res.render("users/register");
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("register");
  }
};

module.exports.register = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to PetPet!");
      res.redirect("/shelters");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("register");
  }
};

module.exports.renderLoginForm = (req, res) => {
  try {
    res.render("users/login");
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("login");
  }
};

module.exports.login = (req, res) => {
  try {
    req.flash("success", "Welcome back!");
    const redirectUrl = res.locals.returnTo || "/shelters";
    res.redirect(redirectUrl);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("login");
  }
};

module.exports.logout = (req, res, next) => {
  try {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      req.flash("success", "Goodbye!");
      res.redirect("/shelters");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("login");
  }
};
