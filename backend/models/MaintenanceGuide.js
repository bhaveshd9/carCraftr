const mongoose = require('mongoose');
const sanitizeHtml = require('sanitize-html');

const StepSchema = new mongoose.Schema({
  order: {
    type: Number,
    required: true,
    min: 1
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    minlength: 20,
    maxlength: 1000
  },
  imageUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  },
  estimatedTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d+\s*(min|hour|day)s?$/.test(v);
      },
      message: props => `${props.value} is not a valid time format!`
    }
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Moderate', 'Difficult', 'Expert'],
    required: true
  },
  tools: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  parts: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    partNumber: {
      type: String,
      trim: true,
      maxlength: 50
    },
    estimatedCost: {
      type: Number,
      min: 0
    }
  }]
});

const MaintenanceGuideSchema = new mongoose.Schema({
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
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
  description: {
    type: String,
    required: true,
    minlength: 50,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['Regular Maintenance', 'Repairs', 'Upgrades', 'DIY Projects', 'Troubleshooting'],
    index: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Moderate', 'Difficult', 'Expert'],
    required: true,
    index: true
  },
  estimatedTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d+\s*(min|hour|day)s?$/.test(v);
      },
      message: props => `${props.value} is not a valid time format!`
    }
  },
  tools: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  parts: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    partNumber: {
      type: String,
      trim: true,
      maxlength: 50
    },
    estimatedCost: {
      type: Number,
      min: 0
    }
  }],
  steps: [StepSchema],
  images: [{
    url: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: props => `${props.value} is not a valid URL!`
      }
    },
    caption: {
      type: String,
      trim: true,
      maxlength: 200
    }
  }],
  videoUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  verifiedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
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

// Virtuals
MaintenanceGuideSchema.virtual('verificationCount').get(function() {
  return this.verifiedBy.length;
});

MaintenanceGuideSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

MaintenanceGuideSchema.virtual('totalEstimatedCost').get(function() {
  return this.parts.reduce((total, part) => total + (part.estimatedCost || 0), 0);
});

// Text search index
MaintenanceGuideSchema.index({
  title: 'text',
  description: 'text',
  'steps.title': 'text',
  'steps.description': 'text'
});

// Compound indexes
MaintenanceGuideSchema.index({ carId: 1, category: 1, difficulty: 1 });
MaintenanceGuideSchema.index({ author: 1, createdAt: -1 });
MaintenanceGuideSchema.index({ 'verifiedBy': 1, createdAt: -1 });

// Pre-save hooks
MaintenanceGuideSchema.pre('save', function(next) {
  // Sanitize content
  this.title = sanitizeHtml(this.title, {
    allowedTags: [],
    allowedAttributes: {}
  });

  this.description = sanitizeHtml(this.description, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    allowedAttributes: {
      'a': ['href']
    }
  });

  // Sanitize steps
  this.steps.forEach(step => {
    step.title = sanitizeHtml(step.title, {
      allowedTags: [],
      allowedAttributes: {}
    });
    step.description = sanitizeHtml(step.description, {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
      allowedAttributes: {
        'a': ['href']
      }
    });
  });

  this.updatedAt = Date.now();
  next();
});

// Instance methods
MaintenanceGuideSchema.methods.verify = async function(userId) {
  if (!this.verifiedBy.includes(userId)) {
    this.verifiedBy.push(userId);
    return this.save();
  }
  return this;
};

MaintenanceGuideSchema.methods.unverify = async function(userId) {
  this.verifiedBy = this.verifiedBy.filter(id => id.toString() !== userId.toString());
  return this.save();
};

MaintenanceGuideSchema.methods.toggleLike = async function(userId) {
  const index = this.likes.indexOf(userId);
  if (index === -1) {
    this.likes.push(userId);
  } else {
    this.likes.splice(index, 1);
  }
  return this.save();
};

MaintenanceGuideSchema.methods.incrementViews = async function() {
  this.views += 1;
  return this.save();
};

// Static methods
MaintenanceGuideSchema.statics.findByCategory = function(category, limit = 10) {
  return this.find({ category })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('author', 'username');
};

MaintenanceGuideSchema.statics.findByDifficulty = function(difficulty, limit = 10) {
  return this.find({ difficulty })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('author', 'username');
};

MaintenanceGuideSchema.statics.findPopular = function(limit = 10) {
  return this.find()
    .sort({ views: -1, likes: -1 })
    .limit(limit)
    .populate('author', 'username');
};

module.exports = mongoose.model('MaintenanceGuide', MaintenanceGuideSchema); 