const mongoose = require('mongoose');
const sanitizeHtml = require('sanitize-html');

const SolutionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    minlength: 50,
    maxlength: 2000
  },
  steps: [{
    order: {
      type: Number,
      required: true,
      min: 1
    },
    description: {
      type: String,
      required: true,
      minlength: 20,
      maxlength: 500
    }
  }],
  estimatedCost: {
    type: Number,
    min: 0
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Moderate', 'Difficult', 'Expert'],
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
  helpfulCount: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Solution methods
SolutionSchema.methods.toggleLike = async function(userId) {
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

SolutionSchema.methods.verify = async function(userId) {
  if (!this.verifiedBy.includes(userId)) {
    this.verifiedBy.push(userId);
    return this.save();
  }
  return this;
};

const CommonIssueSchema = new mongoose.Schema({
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
    enum: ['Engine', 'Transmission', 'Electrical', 'Suspension', 'Brakes', 'Interior', 'Exterior', 'Other'],
    index: true
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    required: true,
    index: true
  },
  affectedModels: [{
    type: String,
    trim: true,
    maxlength: 100
  }],
  affectedYears: [{
    start: {
      type: Number,
      required: true,
      min: 1900,
      max: new Date().getFullYear()
    },
    end: {
      type: Number,
      required: true,
      min: 1900,
      max: new Date().getFullYear()
    }
  }],
  symptoms: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  solutions: [SolutionSchema],
  preventiveMeasures: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  reportedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  verifiedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['Under Review', 'Verified', 'Resolved', 'Recalled'],
    default: 'Under Review',
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

// Virtuals
CommonIssueSchema.virtual('verificationCount').get(function() {
  return this.verifiedBy.length;
});

CommonIssueSchema.virtual('solutionCount').get(function() {
  return this.solutions.length;
});

CommonIssueSchema.virtual('isVerified').get(function() {
  return this.verifiedBy.length >= 3;
});

// Text search index
CommonIssueSchema.index({
  title: 'text',
  description: 'text',
  'symptoms': 'text',
  'preventiveMeasures': 'text',
  'solutions.content': 'text',
  'solutions.steps.description': 'text'
});

// Compound indexes
CommonIssueSchema.index({ carId: 1, category: 1, severity: -1 });
CommonIssueSchema.index({ carId: 1, status: 1, createdAt: -1 });
CommonIssueSchema.index({ severity: 1, status: 1, createdAt: -1 });

// Pre-save hooks
CommonIssueSchema.pre('save', function(next) {
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

  // Sanitize symptoms and preventive measures
  this.symptoms = this.symptoms.map(symptom => sanitizeHtml(symptom, {
    allowedTags: [],
    allowedAttributes: {}
  }));

  this.preventiveMeasures = this.preventiveMeasures.map(measure => sanitizeHtml(measure, {
    allowedTags: [],
    allowedAttributes: {}
  }));

  // Sanitize solutions
  this.solutions.forEach(solution => {
    solution.content = sanitizeHtml(solution.content, {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
      allowedAttributes: {
        'a': ['href']
      }
    });

    solution.steps.forEach(step => {
      step.description = sanitizeHtml(step.description, {
        allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
        allowedAttributes: {
          'a': ['href']
        }
      });
    });
  });

  this.updatedAt = Date.now();
  next();
});

// Instance methods
CommonIssueSchema.methods.addSolution = async function(userId, solutionData) {
  this.solutions.push({
    userId,
    ...solutionData
  });
  return this.save();
};

CommonIssueSchema.methods.removeSolution = async function(solutionId) {
  this.solutions = this.solutions.filter(solution => solution._id.toString() !== solutionId);
  return this.save();
};

CommonIssueSchema.methods.verify = async function(userId) {
  if (!this.verifiedBy.includes(userId)) {
    this.verifiedBy.push(userId);
    if (this.verifiedBy.length >= 3) {
      this.status = 'Verified';
    }
    return this.save();
  }
  return this;
};

CommonIssueSchema.methods.updateStatus = async function(status) {
  this.status = status;
  return this.save();
};

// Static methods
CommonIssueSchema.statics.findByCategory = function(category, limit = 10) {
  return this.find({ category })
    .sort({ severity: -1, createdAt: -1 })
    .limit(limit)
    .populate('reportedBy', 'username')
    .populate('verifiedBy', 'username');
};

CommonIssueSchema.statics.findBySeverity = function(severity, limit = 10) {
  return this.find({ severity })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('reportedBy', 'username')
    .populate('verifiedBy', 'username');
};

CommonIssueSchema.statics.findPopular = function(limit = 10) {
  return this.find()
    .sort({ 'solutions.length': -1, severity: -1 })
    .limit(limit)
    .populate('reportedBy', 'username')
    .populate('verifiedBy', 'username');
};

module.exports = mongoose.model('CommonIssue', CommonIssueSchema); 