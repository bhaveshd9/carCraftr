const mongoose = require('mongoose');
const sanitizeHtml = require('sanitize-html');

const CommentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
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
  timestamps: true
});

// Pre-save hook for comment
CommentSchema.pre('save', function(next) {
  this.content = sanitizeHtml(this.content, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a'],
    allowedAttributes: {
      'a': ['href']
    }
  });
  this.updatedAt = Date.now();
  next();
});

// Comment methods
CommentSchema.methods.toggleLike = function(userId) {
  const index = this.likes.indexOf(userId);
  if (index === -1) {
    this.likes.push(userId);
  } else {
    this.likes.splice(index, 1);
  }
  return this.save();
};

const ForumPostSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    minlength: 50,
    maxlength: 5000
  },
  category: {
    type: String,
    required: true,
    enum: ['General Discussion', 'Technical Issues', 'Modifications', 'Maintenance', 'Buying Advice', 'Selling Advice'],
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [CommentSchema],
  isSolved: {
    type: Boolean,
    default: false,
    index: true
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

// Virtual for comment count
ForumPostSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Text search index
ForumPostSchema.index({
  title: 'text',
  content: 'text',
  'tags': 'text'
});

// Compound indexes
ForumPostSchema.index({ carId: 1, category: 1, createdAt: -1 });
ForumPostSchema.index({ userId: 1, createdAt: -1 });
ForumPostSchema.index({ isSolved: 1, createdAt: -1 });

// Pre-save hooks
ForumPostSchema.pre('save', function(next) {
  // Sanitize content
  this.content = sanitizeHtml(this.content, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    allowedAttributes: {
      'a': ['href']
    }
  });

  // Sanitize title
  this.title = sanitizeHtml(this.title, {
    allowedTags: [],
    allowedAttributes: {}
  });

  // Sanitize tags
  this.tags = this.tags.map(tag => sanitizeHtml(tag, {
    allowedTags: [],
    allowedAttributes: {}
  }));

  this.updatedAt = Date.now();
  next();
});

// Post methods
ForumPostSchema.methods.addComment = async function(userId, content) {
  this.comments.push({ userId, content });
  return this.save();
};

ForumPostSchema.methods.removeComment = async function(commentId) {
  this.comments = this.comments.filter(comment => comment._id.toString() !== commentId);
  return this.save();
};

ForumPostSchema.methods.toggleLike = async function(userId) {
  const index = this.likes.indexOf(userId);
  if (index === -1) {
    this.likes.push(userId);
  } else {
    this.likes.splice(index, 1);
  }
  return this.save();
};

ForumPostSchema.methods.incrementViews = async function() {
  this.views += 1;
  return this.save();
};

// Static methods
ForumPostSchema.statics.findByCategory = function(category, limit = 10) {
  return this.find({ category })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'username');
};

ForumPostSchema.statics.findPopular = function(limit = 10) {
  return this.find()
    .sort({ views: -1, likes: -1 })
    .limit(limit)
    .populate('userId', 'username');
};

module.exports = mongoose.model('ForumPost', ForumPostSchema); 