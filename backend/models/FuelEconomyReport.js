const mongoose = require('mongoose');

const FuelEconomyReportSchema = new mongoose.Schema({
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
  drivingConditions: {
    cityPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      validate: {
        validator: function(v) {
          return v + this.drivingConditions.highwayPercentage === 100;
        },
        message: 'City and highway percentages must sum to 100%'
      }
    },
    highwayPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    terrain: {
      type: String,
      enum: ['Flat', 'Hilly', 'Mountainous', 'Mixed'],
      required: true,
      index: true
    },
    climate: {
      type: String,
      enum: ['Hot', 'Cold', 'Moderate', 'Mixed'],
      required: true,
      index: true
    }
  },
  fuelConsumption: {
    city: {
      type: Number,
      required: true,
      min: 0
    },
    highway: {
      type: Number,
      required: true,
      min: 0
    },
    combined: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function(v) {
          const calculated = (this.fuelConsumption.city * this.drivingConditions.cityPercentage +
            this.fuelConsumption.highway * this.drivingConditions.highwayPercentage) / 100;
          return Math.abs(v - calculated) < 0.1;
        },
        message: 'Combined consumption must match weighted average of city and highway'
      }
    },
    unit: {
      type: String,
      enum: ['mpg', 'l/100km'],
      required: true
    }
  },
  drivingStyle: {
    type: String,
    enum: ['Economical', 'Moderate', 'Aggressive'],
    required: true,
    index: true
  },
  vehicleCondition: {
    mileage: {
      type: Number,
      required: true,
      min: 0
    },
    maintenanceStatus: {
      type: String,
      enum: ['Well Maintained', 'Regular Maintenance', 'Needs Attention'],
      required: true,
      index: true
    },
    modifications: [{
      type: String,
      trim: true,
      maxlength: 100
    }]
  },
  additionalNotes: {
    type: String,
    maxlength: 1000
  },
  verifiedOwner: {
    type: Boolean,
    default: false,
    index: true
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

// Virtuals
FuelEconomyReportSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

FuelEconomyReportSchema.virtual('fuelEfficiency').get(function() {
  if (this.fuelConsumption.unit === 'mpg') {
    return {
      city: this.fuelConsumption.city,
      highway: this.fuelConsumption.highway,
      combined: this.fuelConsumption.combined,
      unit: 'mpg'
    };
  } else {
    return {
      city: 235.215 / this.fuelConsumption.city,
      highway: 235.215 / this.fuelConsumption.highway,
      combined: 235.215 / this.fuelConsumption.combined,
      unit: 'mpg'
    };
  }
});

// Compound indexes
FuelEconomyReportSchema.index({ carId: 1, createdAt: -1 });
FuelEconomyReportSchema.index({ userId: 1, createdAt: -1 });
FuelEconomyReportSchema.index({ 'drivingConditions.terrain': 1, 'drivingConditions.climate': 1 });
FuelEconomyReportSchema.index({ drivingStyle: 1, 'vehicleCondition.maintenanceStatus': 1 });

// Pre-save hooks
FuelEconomyReportSchema.pre('save', function(next) {
  // Calculate combined consumption if not provided
  if (!this.fuelConsumption.combined) {
    this.fuelConsumption.combined = (this.fuelConsumption.city * this.drivingConditions.cityPercentage +
      this.fuelConsumption.highway * this.drivingConditions.highwayPercentage) / 100;
  }

  this.updatedAt = Date.now();
  next();
});

// Instance methods
FuelEconomyReportSchema.methods.toggleLike = async function(userId) {
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

FuelEconomyReportSchema.methods.convertToMPG = function() {
  if (this.fuelConsumption.unit === 'mpg') return this.fuelConsumption;
  
  return {
    city: 235.215 / this.fuelConsumption.city,
    highway: 235.215 / this.fuelConsumption.highway,
    combined: 235.215 / this.fuelConsumption.combined,
    unit: 'mpg'
  };
};

FuelEconomyReportSchema.methods.convertToL100km = function() {
  if (this.fuelConsumption.unit === 'l/100km') return this.fuelConsumption;
  
  return {
    city: 235.215 / this.fuelConsumption.city,
    highway: 235.215 / this.fuelConsumption.highway,
    combined: 235.215 / this.fuelConsumption.combined,
    unit: 'l/100km'
  };
};

// Static methods
FuelEconomyReportSchema.statics.getAverageConsumption = async function(carId) {
  const result = await this.aggregate([
    { $match: { carId: mongoose.Types.ObjectId(carId) } },
    {
      $group: {
        _id: null,
        averageCity: { $avg: '$fuelConsumption.city' },
        averageHighway: { $avg: '$fuelConsumption.highway' },
        averageCombined: { $avg: '$fuelConsumption.combined' },
        totalReports: { $sum: 1 }
      }
    }
  ]);

  return result[0] || {
    averageCity: 0,
    averageHighway: 0,
    averageCombined: 0,
    totalReports: 0
  };
};

FuelEconomyReportSchema.statics.findByConditions = function(terrain, climate, limit = 10) {
  return this.find({
    'drivingConditions.terrain': terrain,
    'drivingConditions.climate': climate
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'username');
};

module.exports = mongoose.model('FuelEconomyReport', FuelEconomyReportSchema); 