// Set dotenv for non-prod
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const morgan = require("morgan");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./helpers/ExpressError");
const methodOverride = require("method-override");

const helmet = require("helmet");

const mongoSanitize = require("express-mongo-sanitize");

const sheltersRouter = require("./routes/shelters.routes");
const reviewsRouter = require("./routes/reviews.routes");
const userRouter = require("./routes/users.routes");
const User = require("./models/user");

// Connect to MongoDB
const dbUrl = process.env.MONGODB_ATLAS_URL || process.env.LOCAL_DB_URL;
mongoose.connect(`${dbUrl}`);

// Connection events
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

// Initialize express
const app = express();

// Set up ejs-mate
app.engine("ejs", ejsMate);
// Set up EJS for templating
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Parse request body
app.use(express.urlencoded({ extended: true }));
// Set up method override
app.use(methodOverride("_method"));
// Set up console log for dev
app.use(morgan("tiny"));
// Serve static assets
app.use(express.static(path.join(__dirname, "public")));
// Sanitize query
app.use(mongoSanitize({ replaceWith: "_" }));

// Setup Mongo for session store
const secret = process.env.SESSION_SECRET;
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: secret,
  },
});

store.on("error", function (e) {
  console.log("Session store error", e);
});

// Session config
const sessionConfig = {
  store,
  name: "session", // prevent easy hack
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // milliseconds of a week
  },
};
app.use(session(sessionConfig));

app.use(flash());

// Configure helmet allowence
const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/",
];
const connectSrcUrls = ["https://api.maptiler.com/"];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/`,
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

// Set up passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Users routes
app.use("/", userRouter);

// Shelters routes
app.use("/shelters", sheltersRouter);

// Reviews routes
app.use("/shelters/:id/reviews", reviewsRouter);

// Define routes
// Home page
app.get("/", (req, res) => {
  res.render("home");
});

// Process unmatched urls
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// Catch errors
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong...";
  res.status(statusCode).render("error", { err });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(process.env.PORT, () => {
  console.log(`Listening to port ${port}`);
});
