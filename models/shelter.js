const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("../models/review");

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

// Change img url to include w_200 on the fly
// virtual - Won't be stored into database
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const opts = { toJSON: { virtuals: true } };

const ShelterSchema = new Schema(
  {
    title: String,
    description: String,
    location: String,
    geometry: {
      type: {
        type: String,
        enum: ["Point"], // 'location.type' will always be 'Point'
        required: true,
      },
      coordinates: {
        type: [Number], // array of [longitude, latitude]
        required: true,
      },
    },
    images: [ImageSchema],
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    // latitude: Number,
    // longitude: Number,
  },
  opts
);

// Popup text for cluster map location
ShelterSchema.virtual("properties.popUpMarkup").get(function () {
  return `
  <strong><a href="/shelters/${this._id}">${this.title}</a><strong>
  <p>${this.description.substring(0, 20)}...</p>`;
});

// Middleware to remove all reviews in a shelter when a shelter is deleted
// Only triggered by findByIdAndDelete in delete endpoint
ShelterSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
    console.log("Shelter's reviews removed");
  }
});

module.exports = mongoose.model("Shelter", ShelterSchema);
