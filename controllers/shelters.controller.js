const { cloudinary } = require("../cloudinary");
const Shelter = require("../models/shelter");
// const NodeGeocoder = require("node-geocoder");
const maptilerClient = require("@maptiler/client");

// // Google Maps API
// const options = {
//   provider: "google",
//   httpAdapter: "https",
//   apiKey: process.env.GEOCODER_API_KEY,
//   formatter: null,
// };

// const geocoder = NodeGeocoder(options);

// Maptiler API
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
  try {
    const shelters = await Shelter.find({});
    res.render("shelters/index", { shelters });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/shelters`);
  }
};

module.exports.renderNewForm = (req, res) => {
  try {
    res.render("shelters/create");
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/shelters`);
  }
};

module.exports.createShelter = async (req, res) => {
  try {
    const geoData = await maptilerClient.geocoding.forward(
      req.body.shelter.location,
      { limit: 1 }
    );
    const shelter = new Shelter(req.body.shelter);
    shelter.geometry = geoData.features[0].geometry;
    shelter.images = req.files.map((f) => ({
      url: f.path,
      filename: f.filename,
    }));
    shelter.author = req.user._id;
    await shelter.save();
    req.flash("success", "Shelter created successfully");
    res.redirect(`/shelters/${shelter._id}`);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/shelters`);
  }

  // // Google Maps API
  // geocoder.geocode(req.body.location, function (err, data) {
  //   if (err || !data.length) {
  //     console.log(err);
  //     req.flash('error', 'Invalid address');
  //     return res.redirect('back');
  //   }
  //   const lat = data[0].latitude;
  //   const lng = data[0].longitude;
  //   const location = data[0].formattedAddress;
  //   const shelter = {name: title, image: image, description: desc, author:author, location: location, latitude: lat, longitude: lng};
  //   // Create a new shelter and save to DB
  //   Shelter.create(shelter, function(err, newShelter){
  //       if(err){
  //           console.log(err);
  //       } else {
  //           //redirect back to shelters page
  //           console.log(newShelter);
  //           res.redirect("/shelters");
  //       }
  //   });
  // });
};

module.exports.showShelter = async (req, res) => {
  // Find shelter by id and populate author and review
  try {
    const shelter = await Shelter.findById(req.params.id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("author");
    if (!shelter) {
      req.flash("error", "Shelter not found");
      return res.redirect("/shelters");
    }
    res.render("shelters/show", { shelter });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/shelters`);
  }
};

module.exports.renderEditForm = async (req, res) => {
  try {
    const { id } = req.params;
    const shelter = await Shelter.findById(id);
    if (!shelter) {
      req.flash("error", "Shelter not found");
      return res.redirect("/shelters");
    }
    res.render("shelters/edit", { shelter });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/shelters`);
  }
};

module.exports.updateShelter = async (req, res) => {
  try {
    const { id } = req.params;
    const shelter = await Shelter.findByIdAndUpdate(id, {
      ...req.body.shelter,
    });
    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    shelter.images.push(...imgs);
    shelter.save();
    // Remove imgs from cloudinary and mongoDB
    if (req.body.deleteImages) {
      for (let filename of req.body.deleteImages) {
        await cloudinary.uploader.destroy(filename);
      }
      await shelter.updateOne({
        $pull: { images: { filename: { $in: req.body.deleteImages } } },
      });
    }
    req.flash("success", "Shelter updated successfully");
    res.redirect(`/shelters/${shelter._id}`);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/shelters`);
  }

  // // Google Maps API
  // geocoder.geocode(req.body.location, function (err, data) {
  //   if (err || !data.length) {
  //     req.flash('error', 'Invalid address');
  //     return res.redirect('back');
  //   }
  //   req.body.shelter.latitude = data[0].latitude;
  //   req.body.shelter.longitude = data[0].longitude;
  //   req.body.shelter.location = data[0].formattedAddress;

  //   Shelter.findByIdAndUpdate(req.params.id, req.body.shelter, function(err, shelter){
  //       if(err){
  //           req.flash("error", err.message);
  //           res.redirect("back");
  //       } else {
  //           req.flash("success","Successfully Updated!");
  //           res.redirect("/shelters/" + shelter._id);
  //       }
  //   });
  // });
};

module.exports.deleteShelter = async (req, res) => {
  try {
    console.log("1");
    const { id } = req.params;
    await Shelter.findByIdAndDelete(id);
    console.log("2");
    req.flash("success", "Shelter deleted successfully");
    res.redirect(`/shelters`);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/shelters`);
  }
};
