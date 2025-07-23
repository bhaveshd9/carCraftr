import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CarDetail.css';
import MarketAnalysis from './MarketAnalysis';

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/cars/${id}`);
        setCar(response.data);
        if (response.data.variants && response.data.variants.length > 0) {
          setSelectedVariant(response.data.variants[0]);
          // First try variant-specific colors, then fall back to general colors
          if (response.data.variants[0].variantSpecificColors?.length > 0) {
            setSelectedColor(response.data.variants[0].variantSpecificColors[0]);
          } else if (response.data.generalColors?.length > 0) {
            setSelectedColor(response.data.generalColors[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching car details:', err);
        setError('Failed to fetch car details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [id]);

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    // First try variant-specific colors, then fall back to general colors
    if (variant.variantSpecificColors?.length > 0) {
      setSelectedColor(variant.variantSpecificColors[0]);
    } else if (car.generalColors?.length > 0) {
      setSelectedColor(car.generalColors[0]);
    } else {
      setSelectedColor(null);
    }
  };

  // Get all available colors for the selected variant
  const getAvailableColors = () => {
    if (!selectedVariant) return [];
    
    // Combine variant-specific colors with general colors
    const variantColors = selectedVariant.variantSpecificColors || [];
    const generalColors = car.generalColors || [];
    
    // Remove duplicates based on color code
    const allColors = [...variantColors];
    generalColors.forEach(generalColor => {
      if (!allColors.some(color => color.code === generalColor.code)) {
        allColors.push(generalColor);
      }
    });
    
    return allColors;
  };

  if (loading) {
    return (
      <div className="car-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading car details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="car-detail-error">
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="back-button">
          Back to Previous Page
        </button>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="car-detail-not-found">
        <p>Car not found.</p>
        <button onClick={() => navigate(-1)} className="back-button">
          Back to Previous Page
        </button>
      </div>
    );
  }

  const availableColors = getAvailableColors();

  return (
    <div className="car-detail">
      {/* Header Section */}
      <div className="car-detail-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <h1>{car.make} {car.model} {car.year}</h1>
        <div className="car-rating">
          <span className="stars">{'★'.repeat(Math.round(car.averageRating))}</span>
          <span className="rating-text">{car.averageRating.toFixed(1)} ({car.reviews.length} reviews)</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="car-detail-content">
        {/* Image Gallery */}
        <div className="car-gallery">
          <div className="main-image">
            <img src={selectedColor?.imageUrl || selectedVariant?.imageUrl || car.mainImageUrl} alt={`${car.make} ${car.model}`} />
          </div>
          <div className="thumbnail-grid">
            {car.gallery.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${car.make} ${car.model} - View ${index + 1}`}
                className="thumbnail"
                onClick={() => setSelectedColor({ imageUrl: image })}
              />
            ))}
          </div>
        </div>

        {/* Variants and Colors */}
        <div className="car-options">
          <div className="variants-section">
            <h2>Available Variants</h2>
            <div className="variants-grid">
              {car.variants.map((variant) => (
                <div
                  key={variant.name}
                  className={`variant-card ${selectedVariant?.name === variant.name ? 'selected' : ''}`}
                  onClick={() => handleVariantChange(variant)}
                >
                  <h3>{variant.name}</h3>
                  <p className="variant-price">${variant.price.toLocaleString()}</p>
                  <div className="variant-specs">
                    <span>{variant.specifications.engine}</span>
                    <span>{variant.specifications.transmission}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {availableColors.length > 0 && (
            <div className="colors-section">
              <h2>Available Colors for {selectedVariant.name}</h2>
              <div className="colors-grid">
                {availableColors.map((color) => (
                  <div
                    key={color.code}
                    className={`color-option ${selectedColor?.code === color.code ? 'selected' : ''}`}
                    onClick={() => setSelectedColor(color)}
                  >
                    <div className="color-swatch" style={{ backgroundColor: color.code }}></div>
                    <span>{color.name}</span>
                    {selectedVariant.variantSpecificColors?.some(c => c.code === color.code) && (
                      <span className="variant-specific-badge">Variant Specific</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tabs Section */}
        <div className="car-tabs">
          <div className="tab-buttons">
            <button
              className={activeTab === 'overview' ? 'active' : ''}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={activeTab === 'specifications' ? 'active' : ''}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
            <button
              className={activeTab === 'features' ? 'active' : ''}
              onClick={() => setActiveTab('features')}
            >
              Features
            </button>
            <button
              className={activeTab === 'reviews' ? 'active' : ''}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-tab">
                <p className="car-description">{car.description}</p>
                {selectedVariant && (
                  <div className="selected-variant-info">
                    <h3>{selectedVariant.name} Specifications</h3>
                    <div className="specs-grid">
                      <div className="spec-item">
                        <span className="spec-label">Engine</span>
                        <span className="spec-value">{selectedVariant.specifications.engine}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Horsepower</span>
                        <span className="spec-value">{selectedVariant.specifications.horsepower}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Transmission</span>
                        <span className="spec-value">{selectedVariant.specifications.transmission}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Fuel Type</span>
                        <span className="spec-value">{selectedVariant.specifications.fuelType}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specifications' && selectedVariant && (
              <div className="specifications-tab">
                <div className="specs-section">
                  <h3>Performance</h3>
                  <div className="specs-grid">
                    <div className="spec-item">
                      <span className="spec-label">Engine</span>
                      <span className="spec-value">{selectedVariant.specifications.engine}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Horsepower</span>
                      <span className="spec-value">{selectedVariant.specifications.horsepower}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Torque</span>
                      <span className="spec-value">{selectedVariant.specifications.torque}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Transmission</span>
                      <span className="spec-value">{selectedVariant.specifications.transmission}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Fuel Type</span>
                      <span className="spec-value">{selectedVariant.specifications.fuelType}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">MPG (City/Highway)</span>
                      <span className="spec-value">
                        {selectedVariant.specifications.mpg.city}/{selectedVariant.specifications.mpg.highway}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="specs-section">
                  <h3>Dimensions</h3>
                  <div className="specs-grid">
                    <div className="spec-item">
                      <span className="spec-label">Length</span>
                      <span className="spec-value">{selectedVariant.specifications.dimensions.length}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Width</span>
                      <span className="spec-value">{selectedVariant.specifications.dimensions.width}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Height</span>
                      <span className="spec-value">{selectedVariant.specifications.dimensions.height}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'features' && selectedVariant && (
              <div className="features-tab">
                <div className="features-section">
                  <h3>Safety Features</h3>
                  <ul className="features-list">
                    {selectedVariant.specifications.safety.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>

                <div className="features-section">
                  <h3>Technology</h3>
                  <ul className="features-list">
                    {selectedVariant.specifications.technology.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>

                <div className="features-section">
                  <h3>Interior Features</h3>
                  <ul className="features-list">
                    {selectedVariant.specifications.interior.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>

                <div className="features-section">
                  <h3>Exterior Features</h3>
                  <ul className="features-list">
                    {selectedVariant.specifications.exterior.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-tab">
                <div className="reviews-summary">
                  <div className="average-rating">
                    <span className="rating-number">{car.averageRating.toFixed(1)}</span>
                    <span className="stars">{'★'.repeat(Math.round(car.averageRating))}</span>
                    <span className="total-reviews">Based on {car.reviews.length} reviews</span>
                  </div>
                </div>

                <div className="reviews-list">
                  {car.reviews.map((review, index) => (
                    <div key={index} className="review-card">
                      <div className="review-header">
                        <span className="reviewer-name">{review.user}</span>
                        <span className="review-date">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="review-rating">
                        <span className="stars">{'★'.repeat(review.rating)}</span>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Market Analysis section after the specifications section */}
        <div className="section market-analysis-section">
          <h2>Market Analysis</h2>
          <MarketAnalysis carId={car._id} />
        </div>
      </div>
    </div>
  );
};

export default CarDetail; 