const cron = require('node-cron');
const marketDataService = require('../services/marketDataService');

// Update market data every day at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Starting scheduled market data update...');
  try {
    await marketDataService.updateAllMarketData();
    console.log('Market data update completed successfully');
  } catch (error) {
    console.error('Error in scheduled market data update:', error);
  }
});

// Export the cron job for testing purposes
module.exports = cron; 