const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongooee = require("passport-local-mongoose");
const passport = require("passport");
const { Unique } = require("typeorm");

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

// Add on username and password to the schema
UserSchema.plugin(passportLocalMongooee);

module.exports = mongoose.model("User", UserSchema);
