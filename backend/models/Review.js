const mongoose = require('mongoose');
const sanitizeHtml = require('sanitize-html');

const ReviewSchema = new mongoose.Schema({
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    minlength: 50,
    maxlength: 5000
  },
  pros: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  cons: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  verifiedOwner: {
    type: Boolean,
    default: false
  },
  ownershipDuration: {
    type: String,
    enum: ['Less than 1 year', '1-3 years', '3-5 years', 'More than 5 years'],
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  helpfulCount: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for average rating
ReviewSchema.virtual('averageRating').get(function() {
  return this.rating;
});

// Text search index
ReviewSchema.index({
  title: 'text',
  content: 'text',
  'pros': 'text',
  'cons': 'text'
});

// Compound indexes
ReviewSchema.index({ carId: 1, rating: -1 });
ReviewSchema.index({ carId: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1, createdAt: -1 });

// Pre-save hooks
ReviewSchema.pre('save', function(next) {
  // Sanitize content
  this.content = sanitizeHtml(this.content, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a'],
    allowedAttributes: {
      'a': ['href']
    }
  });

  // Sanitize pros and cons
  this.pros = this.pros.map(pro => sanitizeHtml(pro, {
    allowedTags: [],
    allowedAttributes: {}
  }));

  this.cons = this.cons.map(con => sanitizeHtml(con, {
    allowedTags: [],
    allowedAttributes: {}
  }));

  // Update timestamps
  this.updatedAt = Date.now();
  next();
});

// Static method to get average rating for a car
ReviewSchema.statics.getAverageRating = async function(carId) {
  const result = await this.aggregate([
    { $match: { carId: mongoose.Types.ObjectId(carId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  return result[0] || { averageRating: 0, totalReviews: 0 };
};

// Instance method to check if user has liked
ReviewSchema.methods.hasLiked = function(userId) {
  return this.likes.includes(userId);
};

// Instance method to toggle like
ReviewSchema.methods.toggleLike = function(userId) {
  const index = this.likes.indexOf(userId);
  if (index === -1) {
    this.likes.push(userId);
    this.helpfulCount += 1;
  } else {
    this.likes.splice(index, 1);
    this.helpfulCount -= 1;
  }
  return this.save();
};

module.exports = mongoose.model('Review', ReviewSchema); 