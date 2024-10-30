const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: String, required: true },
  specifications: {
    engine: String,
    horsepower: String,
    torque: String,
    transmission: String,
    fuelType: String,
    mpg: {
      city: Number,
      highway: Number
    },
    dimensions: {
      length: String,
      width: String,
      height: String
    },
    price: Number
  },
  imageUrl: String,
  popularity: { type: Number, default: 0 }
});

module.exports = mongoose.model('Car', CarSchema);
