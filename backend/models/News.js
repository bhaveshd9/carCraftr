const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  body: String, 
  url: String,
  imageUrl: String,
  publishedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('News', NewsSchema);
