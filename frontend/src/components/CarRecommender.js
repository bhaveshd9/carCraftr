import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CarRecommender.css';

const CarRecommender = () => {
  const [preferences, setPreferences] = useState({
    budget: [20000, 50000],
    primaryUse: '',
    fuelPreference: '',
    mustHaveFeatures: [],
    lifestyle: '',
    familySize: 1
  });

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const handlePreferenceChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getRecommendations = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/cars/recommend', preferences);
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error getting recommendations:', error);
    }
    setLoading(false);
  };

  return (
    <div className="car-recommender">
      <h2>Find Your Perfect Car Match</h2>
      
      <div className="preferences-form">
        <div className="preference-section">
          <h3>Budget Range</h3>
          <div className="range-slider">
            <input
              type="range"
              min="10000"
              max="100000"
              step="5000"
              value={preferences.budget[0]}
              onChange={(e) => handlePreferenceChange('budget', [parseInt(e.target.value), preferences.budget[1]])}
            />
            <input
              type="range"
              min="10000"
              max="100000"
              step="5000"
              value={preferences.budget[1]}
              onChange={(e) => handlePreferenceChange('budget', [preferences.budget[0], parseInt(e.target.value)])}
            />
            <div className="range-values">
              ${preferences.budget[0].toLocaleString()} - ${preferences.budget[1].toLocaleString()}
            </div>
          </div>
        </div>

        <div className="preference-section">
          <h3>Primary Use</h3>
          <select
            value={preferences.primaryUse}
            onChange={(e) => handlePreferenceChange('primaryUse', e.target.value)}
          >
            <option value="">Select primary use</option>
            <option value="commuting">Daily Commuting</option>
            <option value="family">Family Vehicle</option>
            <option value="luxury">Luxury/Comfort</option>
            <option value="performance">Performance/Sport</option>
            <option value="adventure">Adventure/Off-road</option>
          </select>
        </div>

        <div className="preference-section">
          <h3>Fuel Preference</h3>
          <select
            value={preferences.fuelPreference}
            onChange={(e) => handlePreferenceChange('fuelPreference', e.target.value)}
          >
            <option value="">Select fuel preference</option>
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Electric</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        <div className="preference-section">
          <h3>Must-Have Features</h3>
          <div className="checkbox-group">
            {[
              'Apple CarPlay',
              'Android Auto',
              'Leather Seats',
              'Sunroof',
              'Parking Sensors',
              '360° Camera',
              'Adaptive Cruise Control',
              'Heated Seats'
            ].map(feature => (
              <label key={feature}>
                <input
                  type="checkbox"
                  checked={preferences.mustHaveFeatures.includes(feature)}
                  onChange={(e) => {
                    const newFeatures = e.target.checked
                      ? [...preferences.mustHaveFeatures, feature]
                      : preferences.mustHaveFeatures.filter(f => f !== feature);
                    handlePreferenceChange('mustHaveFeatures', newFeatures);
                  }}
                />
                {feature}
              </label>
            ))}
          </div>
        </div>

        <div className="preference-section">
          <h3>Lifestyle</h3>
          <select
            value={preferences.lifestyle}
            onChange={(e) => handlePreferenceChange('lifestyle', e.target.value)}
          >
            <option value="">Select lifestyle</option>
            <option value="urban">Urban/City Living</option>
            <option value="suburban">Suburban</option>
            <option value="rural">Rural</option>
            <option value="active">Active/Outdoor</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>

        <div className="preference-section">
          <h3>Family Size</h3>
          <input
            type="number"
            min="1"
            max="8"
            value={preferences.familySize}
            onChange={(e) => handlePreferenceChange('familySize', parseInt(e.target.value))}
          />
        </div>

        <button onClick={getRecommendations} className="get-recommendations">
          Get Personalized Recommendations
        </button>
      </div>

      {loading ? (
        <div className="loading">Finding your perfect match...</div>
      ) : recommendations.length > 0 ? (
        <div className="recommendations-grid">
          {recommendations.map(car => (
            <div key={car._id} className="recommendation-card">
              <img src={car.imageUrl} alt={`${car.make} ${car.model}`} />
              <div className="recommendation-content">
                <h3>{car.make} {car.model}</h3>
                <p className="match-score">Match Score: {car.matchScore}%</p>
                <p className="price">Starting at ${car.basePrice.toLocaleString()}</p>
                <div className="match-reasons">
                  <h4>Why This Car Matches You:</h4>
                  <ul>
                    {car.matchReasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default CarRecommender; 