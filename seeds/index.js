const mongoose = require("mongoose");
const Shelter = require("../models/shelter");
const cities = require("./cities");
const { places, descriptions } = require("./seedHelpers");

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/petpet");

// Connection events
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const getAtRandomIndex = (array) =>
  array[Math.floor(Math.random() * array.length)];

// Seed database with cities and seedHelpers
const seedDB = async () => {
  await Shelter.deleteMany({});
  for (let i = 0; i < 200; i++) {
    const location = getAtRandomIndex(cities);
    const shelter = new Shelter({
      title: `${getAtRandomIndex(places)}`,
      description: `${getAtRandomIndex(descriptions)}`,
      location: `${location.city}, ${location.state}`,
      geometry: {
        type: "Point",
        coordinates: [location.longitude, location.latitude],
      },
      images: [
        {
          url: "https://res.cloudinary.com/dvfvycxxc/image/upload/v1725660215/PetPet/bj69rw4shy5p6fpn3osl.jpg",
          filename: "PetPet/bj69rw4shy5p6fpn3osl",
        },
        {
          url: "https://res.cloudinary.com/dvfvycxxc/image/upload/v1725660215/PetPet/az1n24ipxuhklm4yjpjk.jpg",
          filename: "PetPet/az1n24ipxuhklm4yjpjk",
        },
      ],
      author: "66d4332abfad89101e4dd783",
    });
    await shelter.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
