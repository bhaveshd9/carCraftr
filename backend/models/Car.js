// backend/models/Car.js
const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  fuelEfficiency: { type: Number, required: true }, // in MPG
  enginePower: { type: Number, required: true }, // in HP
  safetyRating: { type: Number, required: true }, // e.g., out of 5
  imageUrl: { type: String },
  upcoming: { type: Boolean, default: false },
  deals: {
    discount: { type: Number },
    offerValidTill: { type: Date },
  },
});

module.exports = mongoose.model('Car', CarSchema);
