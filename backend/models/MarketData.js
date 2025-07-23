const mongoose = require('mongoose');

const PriceTrendSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  averagePrice: { type: Number, required: true },
  minPrice: { type: Number, required: true },
  maxPrice: { type: Number, required: true },
  listingsCount: { type: Number, required: true }
});

const ResaleValueSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  predictedValue: { type: Number, required: true },
  confidence: { type: Number, required: true }, // 0-100 percentage
  factors: [{
    name: String,
    impact: Number // positive or negative impact on value
  }]
});

const MarketDemandSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  demandScore: { type: Number, required: true }, // 0-100
  searchVolume: { type: Number, required: true },
  viewCount: { type: Number, required: true },
  inquiryCount: { type: Number, required: true }
});

const DealerInventorySchema = new mongoose.Schema({
  dealerId: { type: String, required: true },
  dealerName: { type: String, required: true },
  location: {
    city: String,
    state: String,
    zipCode: String
  },
  inventoryCount: { type: Number, required: true },
  averagePrice: { type: Number, required: true },
  lastUpdated: { type: Date, required: true }
});

const MarketDataSchema = new mongoose.Schema({
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  
  // Price trends over time
  priceTrends: [PriceTrendSchema],
  
  // Resale value predictions
  resaleValues: [ResaleValueSchema],
  
  // Market demand metrics
  marketDemand: [MarketDemandSchema],
  
  // Best time to buy indicators
  bestTimeToBuy: {
    month: { type: Number, required: true }, // 1-12
    reason: { type: String, required: true },
    discountPercentage: { type: Number, required: true }
  },
  
  // Dealer inventory tracking
  dealerInventory: [DealerInventorySchema],
  
  // Market insights
  marketInsights: {
    priceVolatility: { type: Number, required: true }, // 0-100
    marketTrend: { type: String, enum: ['rising', 'stable', 'falling'], required: true },
    competitivePosition: { type: String, enum: ['strong', 'moderate', 'weak'], required: true },
    lastUpdated: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

// Index for efficient querying
MarketDataSchema.index({ make: 1, model: 1, year: 1 });
MarketDataSchema.index({ 'marketInsights.lastUpdated': -1 });

module.exports = mongoose.model('MarketData', MarketDataSchema); 