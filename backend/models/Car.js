const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const ColorOptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  imageUrl: { type: String, required: true }
});

const VariantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  variantSpecificColors: [ColorOptionSchema],
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
    features: [String],
    safety: [String],
    technology: [String],
    interior: [String],
    exterior: [String]
  },
  imageUrl: String
});

const CarSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: String, required: true },
  description: { type: String },
  basePrice: { type: Number },
  variants: [VariantSchema],
  generalColors: [ColorOptionSchema],
  reviews: [ReviewSchema],
  averageRating: { type: Number, default: 0 },
  popularity: { type: Number, default: 0 },
  mainImageUrl: String,
  gallery: [String]
});

// Calculate average rating before saving
CarSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    this.averageRating = this.reviews.reduce((acc, review) => acc + review.rating, 0) / this.reviews.length;
  }
  next();
});

module.exports = mongoose.model('Car', CarSchema);
