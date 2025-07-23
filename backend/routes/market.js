const express = require('express');
const router = express.Router();
const MarketData = require('../models/MarketData');
const Car = require('../models/Car');
const marketDataService = require('../services/marketDataService');

// Get market data for a specific car
router.get('/car/:carId', async (req, res) => {
  try {
    let marketData = await MarketData.findOne({ carId: req.params.carId });
    
    // If data is older than 24 hours, update it
    if (!marketData || isDataStale(marketData.marketInsights.lastUpdated)) {
      marketData = await marketDataService.updateMarketData(req.params.carId);
    }
    
    res.json(marketData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get price trends for a specific car
router.get('/car/:carId/price-trends', async (req, res) => {
  try {
    const marketData = await MarketData.findOne({ carId: req.params.carId });
    if (!marketData) {
      return res.status(404).json({ message: 'Price trends not found for this car' });
    }
    res.json(marketData.priceTrends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get resale value predictions
router.get('/car/:carId/resale-values', async (req, res) => {
  try {
    const marketData = await MarketData.findOne({ carId: req.params.carId });
    if (!marketData) {
      return res.status(404).json({ message: 'Resale value predictions not found for this car' });
    }
    res.json(marketData.resaleValues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get market demand analysis
router.get('/car/:carId/market-demand', async (req, res) => {
  try {
    const marketData = await MarketData.findOne({ carId: req.params.carId });
    if (!marketData) {
      return res.status(404).json({ message: 'Market demand data not found for this car' });
    }
    res.json(marketData.marketDemand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get best time to buy
router.get('/car/:carId/best-time', async (req, res) => {
  try {
    const marketData = await MarketData.findOne({ carId: req.params.carId });
    if (!marketData) {
      return res.status(404).json({ message: 'Best time to buy data not found for this car' });
    }
    res.json(marketData.bestTimeToBuy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get dealer inventory
router.get('/car/:carId/dealer-inventory', async (req, res) => {
  try {
    const marketData = await MarketData.findOne({ carId: req.params.carId });
    if (!marketData) {
      return res.status(404).json({ message: 'Dealer inventory data not found for this car' });
    }
    res.json(marketData.dealerInventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get market insights
router.get('/car/:carId/market-insights', async (req, res) => {
  try {
    const marketData = await MarketData.findOne({ carId: req.params.carId });
    if (!marketData) {
      return res.status(404).json({ message: 'Market insights not found for this car' });
    }
    res.json(marketData.marketInsights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Force update market data for a specific car (admin only)
router.post('/car/:carId/update', async (req, res) => {
  try {
    const marketData = await marketDataService.updateMarketData(req.params.carId);
    res.json(marketData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Force update market data for all cars (admin only)
router.post('/update-all', async (req, res) => {
  try {
    await marketDataService.updateAllMarketData();
    res.json({ message: 'Market data update initiated for all cars' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to check if data is stale (older than 24 hours)
function isDataStale(lastUpdated) {
  const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  return Date.now() - new Date(lastUpdated).getTime() > oneDay;
}

module.exports = router; 