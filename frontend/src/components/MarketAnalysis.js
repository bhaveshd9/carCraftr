import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import './MarketAnalysis.css';

const MarketAnalysis = ({ carId }) => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('price-trends');

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/market/car/${carId}`);
        setMarketData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load market data');
        setLoading(false);
      }
    };

    fetchMarketData();
  }, [carId]);

  if (loading) return <div className="loading">Loading market analysis...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!marketData) return <div className="no-data">No market data available</div>;

  const renderPriceTrends = () => (
    <div className="chart-container">
      <h3>Price Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={marketData.priceTrends}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="averagePrice" stroke="#8884d8" name="Average Price" />
          <Line type="monotone" dataKey="minPrice" stroke="#82ca9d" name="Minimum Price" />
          <Line type="monotone" dataKey="maxPrice" stroke="#ffc658" name="Maximum Price" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const renderResaleValues = () => (
    <div className="chart-container">
      <h3>Resale Value Predictions</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={marketData.resaleValues}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="predictedValue" stroke="#8884d8" name="Predicted Value" />
        </LineChart>
      </ResponsiveContainer>
      <div className="confidence-indicator">
        Confidence Level: {marketData.resaleValues[0]?.confidence}%
      </div>
    </div>
  );

  const renderMarketDemand = () => (
    <div className="chart-container">
      <h3>Market Demand Analysis</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={marketData.marketDemand}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="demandScore" fill="#8884d8" name="Demand Score" />
          <Bar dataKey="searchVolume" fill="#82ca9d" name="Search Volume" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderBestTimeToBuy = () => (
    <div className="best-time-container">
      <h3>Best Time to Buy</h3>
      <div className="best-time-content">
        <div className="month-indicator">
          <span className="month">{new Date(2000, marketData.bestTimeToBuy.month - 1).toLocaleString('default', { month: 'long' })}</span>
          <span className="discount">Save up to {marketData.bestTimeToBuy.discountPercentage}%</span>
        </div>
        <p className="reason">{marketData.bestTimeToBuy.reason}</p>
      </div>
    </div>
  );

  const renderDealerInventory = () => (
    <div className="dealer-inventory">
      <h3>Dealer Inventory</h3>
      <div className="dealer-grid">
        {marketData.dealerInventory.map((dealer, index) => (
          <div key={index} className="dealer-card">
            <h4>{dealer.dealerName}</h4>
            <p className="location">{dealer.location.city}, {dealer.location.state}</p>
            <p className="inventory">Available: {dealer.inventoryCount} units</p>
            <p className="price">Avg. Price: ${dealer.averagePrice.toLocaleString()}</p>
            <p className="updated">Last Updated: {new Date(dealer.lastUpdated).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMarketInsights = () => (
    <div className="market-insights">
      <h3>Market Insights</h3>
      <div className="insights-grid">
        <div className="insight-card">
          <h4>Price Volatility</h4>
          <div className="volatility-meter">
            <div 
              className="volatility-bar" 
              style={{ width: `${marketData.marketInsights.priceVolatility}%` }}
            />
          </div>
          <span>{marketData.marketInsights.priceVolatility}%</span>
        </div>
        <div className="insight-card">
          <h4>Market Trend</h4>
          <span className={`trend ${marketData.marketInsights.marketTrend}`}>
            {marketData.marketInsights.marketTrend}
          </span>
        </div>
        <div className="insight-card">
          <h4>Competitive Position</h4>
          <span className={`position ${marketData.marketInsights.competitivePosition}`}>
            {marketData.marketInsights.competitivePosition}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="market-analysis">
      <div className="tabs">
        <button 
          className={activeTab === 'price-trends' ? 'active' : ''} 
          onClick={() => setActiveTab('price-trends')}
        >
          Price Trends
        </button>
        <button 
          className={activeTab === 'resale-values' ? 'active' : ''} 
          onClick={() => setActiveTab('resale-values')}
        >
          Resale Values
        </button>
        <button 
          className={activeTab === 'market-demand' ? 'active' : ''} 
          onClick={() => setActiveTab('market-demand')}
        >
          Market Demand
        </button>
        <button 
          className={activeTab === 'best-time' ? 'active' : ''} 
          onClick={() => setActiveTab('best-time')}
        >
          Best Time to Buy
        </button>
        <button 
          className={activeTab === 'dealer-inventory' ? 'active' : ''} 
          onClick={() => setActiveTab('dealer-inventory')}
        >
          Dealer Inventory
        </button>
        <button 
          className={activeTab === 'market-insights' ? 'active' : ''} 
          onClick={() => setActiveTab('market-insights')}
        >
          Market Insights
        </button>
      </div>

      <div className="content">
        {activeTab === 'price-trends' && renderPriceTrends()}
        {activeTab === 'resale-values' && renderResaleValues()}
        {activeTab === 'market-demand' && renderMarketDemand()}
        {activeTab === 'best-time' && renderBestTimeToBuy()}
        {activeTab === 'dealer-inventory' && renderDealerInventory()}
        {activeTab === 'market-insights' && renderMarketInsights()}
      </div>
    </div>
  );
};

export default MarketAnalysis; 