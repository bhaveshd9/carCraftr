const axios = require('axios');
const MarketData = require('../models/MarketData');
const Car = require('../models/Car');

// Configuration for external APIs
const API_CONFIG = {
  edmunds: {
    baseUrl: process.env.EDMUNDS_API_URL,
    apiKey: process.env.EDMUNDS_API_KEY
  },
  kbb: {
    baseUrl: process.env.KBB_API_URL,
    apiKey: process.env.KBB_API_KEY
  },
  cargurus: {
    baseUrl: process.env.CARGURUS_API_URL,
    apiKey: process.env.CARGURUS_API_KEY
  }
};

class MarketDataService {
  // Fetch price trends from Edmunds API
  async fetchPriceTrends(make, model, year) {
    try {
      const response = await axios.get(`${API_CONFIG.edmunds.baseUrl}/prices`, {
        params: {
          make,
          model,
          year,
          api_key: API_CONFIG.edmunds.apiKey
        }
      });

      return response.data.prices.map(price => ({
        date: new Date(price.date),
        averagePrice: price.averagePrice,
        minPrice: price.minPrice,
        maxPrice: price.maxPrice,
        listingsCount: price.listingsCount
      }));
    } catch (error) {
      console.error('Error fetching price trends:', error);
      return [];
    }
  }

  // Fetch resale values from KBB API
  async fetchResaleValues(make, model, year) {
    try {
      const response = await axios.get(`${API_CONFIG.kbb.baseUrl}/resale-values`, {
        params: {
          make,
          model,
          year,
          api_key: API_CONFIG.kbb.apiKey
        }
      });

      return response.data.predictions.map(prediction => ({
        year: prediction.year,
        predictedValue: prediction.value,
        confidence: prediction.confidence,
        factors: prediction.factors.map(factor => ({
          name: factor.name,
          impact: factor.impact
        }))
      }));
    } catch (error) {
      console.error('Error fetching resale values:', error);
      return [];
    }
  }

  // Fetch market demand from CarGurus API
  async fetchMarketDemand(make, model, year) {
    try {
      const response = await axios.get(`${API_CONFIG.cargurus.baseUrl}/market-demand`, {
        params: {
          make,
          model,
          year,
          api_key: API_CONFIG.cargurus.apiKey
        }
      });

      return response.data.metrics.map(metric => ({
        date: new Date(metric.date),
        demandScore: metric.demandScore,
        searchVolume: metric.searchVolume,
        viewCount: metric.viewCount,
        inquiryCount: metric.inquiryCount
      }));
    } catch (error) {
      console.error('Error fetching market demand:', error);
      return [];
    }
  }

  // Fetch dealer inventory from CarGurus API
  async fetchDealerInventory(make, model, year) {
    try {
      const response = await axios.get(`${API_CONFIG.cargurus.baseUrl}/dealer-inventory`, {
        params: {
          make,
          model,
          year,
          api_key: API_CONFIG.cargurus.apiKey
        }
      });

      return response.data.dealers.map(dealer => ({
        dealerId: dealer.id,
        dealerName: dealer.name,
        location: {
          city: dealer.city,
          state: dealer.state,
          zipCode: dealer.zipCode
        },
        inventoryCount: dealer.inventoryCount,
        averagePrice: dealer.averagePrice,
        lastUpdated: new Date(dealer.lastUpdated)
      }));
    } catch (error) {
      console.error('Error fetching dealer inventory:', error);
      return [];
    }
  }

  // Calculate best time to buy based on historical data
  calculateBestTimeToBuy(priceTrends) {
    if (!priceTrends || priceTrends.length === 0) {
      return {
        month: 1,
        reason: "Insufficient data to determine best time to buy",
        discountPercentage: 0
      };
    }

    // Group prices by month
    const monthlyPrices = priceTrends.reduce((acc, trend) => {
      const month = new Date(trend.date).getMonth();
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(trend.averagePrice);
      return acc;
    }, {});

    // Calculate average price for each month
    const monthlyAverages = Object.entries(monthlyPrices).map(([month, prices]) => ({
      month: parseInt(month) + 1,
      averagePrice: prices.reduce((sum, price) => sum + price, 0) / prices.length
    }));

    // Find month with lowest average price
    const bestMonth = monthlyAverages.reduce((min, current) => 
      current.averagePrice < min.averagePrice ? current : min
    );

    // Calculate discount percentage
    const highestPrice = Math.max(...monthlyAverages.map(m => m.averagePrice));
    const discountPercentage = ((highestPrice - bestMonth.averagePrice) / highestPrice) * 100;

    return {
      month: bestMonth.month,
      reason: `Historically lowest prices in ${new Date(2000, bestMonth.month - 1).toLocaleString('default', { month: 'long' })}`,
      discountPercentage: Math.round(discountPercentage)
    };
  }

  // Calculate market insights
  calculateMarketInsights(priceTrends, marketDemand) {
    if (!priceTrends || !marketDemand) {
      return {
        priceVolatility: 0,
        marketTrend: 'stable',
        competitivePosition: 'moderate',
        lastUpdated: new Date()
      };
    }

    // Calculate price volatility
    const prices = priceTrends.map(trend => trend.averagePrice);
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    const volatility = Math.sqrt(variance) / mean * 100;

    // Determine market trend
    const recentPrices = prices.slice(-3);
    const trend = recentPrices[2] > recentPrices[0] ? 'rising' :
                 recentPrices[2] < recentPrices[0] ? 'falling' : 'stable';

    // Calculate competitive position based on demand
    const recentDemand = marketDemand.slice(-1)[0];
    const competitivePosition = recentDemand.demandScore > 70 ? 'strong' :
                              recentDemand.demandScore > 40 ? 'moderate' : 'weak';

    return {
      priceVolatility: Math.round(volatility),
      marketTrend: trend,
      competitivePosition,
      lastUpdated: new Date()
    };
  }

  // Update market data for a specific car
  async updateMarketData(carId) {
    try {
      const car = await Car.findById(carId);
      if (!car) {
        throw new Error('Car not found');
      }

      // Fetch data from external APIs
      const [priceTrends, resaleValues, marketDemand, dealerInventory] = await Promise.all([
        this.fetchPriceTrends(car.make, car.model, car.year),
        this.fetchResaleValues(car.make, car.model, car.year),
        this.fetchMarketDemand(car.make, car.model, car.year),
        this.fetchDealerInventory(car.make, car.model, car.year)
      ]);

      // Calculate derived data
      const bestTimeToBuy = this.calculateBestTimeToBuy(priceTrends);
      const marketInsights = this.calculateMarketInsights(priceTrends, marketDemand);

      // Update or create market data
      const marketData = await MarketData.findOneAndUpdate(
        { carId },
        {
          carId,
          make: car.make,
          model: car.model,
          year: car.year,
          priceTrends,
          resaleValues,
          marketDemand,
          bestTimeToBuy,
          dealerInventory,
          marketInsights
        },
        { upsert: true, new: true }
      );

      return marketData;
    } catch (error) {
      console.error('Error updating market data:', error);
      throw error;
    }
  }

  // Update market data for all cars
  async updateAllMarketData() {
    try {
      const cars = await Car.find();
      const updates = cars.map(car => this.updateMarketData(car._id));
      await Promise.all(updates);
      console.log(`Updated market data for ${cars.length} cars`);
    } catch (error) {
      console.error('Error updating all market data:', error);
      throw error;
    }
  }
}

module.exports = new MarketDataService(); 