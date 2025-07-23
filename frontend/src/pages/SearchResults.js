import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SearchResults.css';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    priceRange: '',
    year: '',
    make: '',
    sortBy: 'relevance'
  });

  useEffect(() => {
    if (location.state?.searchResults) {
      setSearchResults(location.state.searchResults);
      setLoading(false);
    } else {
      // If no search results in state, fetch from URL params
      const searchParams = new URLSearchParams(location.search);
      const query = searchParams.get('q');
      if (query) {
        fetchSearchResults(query);
      }
    }
  }, [location]);

  const fetchSearchResults = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`http://localhost:5000/api/cars/search?q=${query}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error('Error fetching search results:', err);
      setError('Failed to fetch search results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    let filtered = [...searchResults];

    // Apply price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter(car => {
        const price = car.specifications.price;
        return price >= min && price <= max;
      });
    }

    // Apply year filter
    if (filters.year) {
      filtered = filtered.filter(car => car.year === parseInt(filters.year));
    }

    // Apply make filter
    if (filters.make) {
      filtered = filtered.filter(car => car.make.toLowerCase() === filters.make.toLowerCase());
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.specifications.price - b.specifications.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.specifications.price - a.specifications.price);
        break;
      case 'year-desc':
        filtered.sort((a, b) => b.year - a.year);
        break;
      case 'year-asc':
        filtered.sort((a, b) => a.year - b.year);
        break;
      default:
        // Keep original order for relevance
        break;
    }

    return filtered;
  };

  const filteredResults = applyFilters();

  if (loading) {
    return (
      <div className="search-results-loading">
        <div className="loading-spinner"></div>
        <p>Searching for cars...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="search-results-error">
        <p>{error}</p>
        <button onClick={() => navigate('/')} className="back-button">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="search-results-header">
        <h1>Search Results</h1>
        <p>{filteredResults.length} cars found</p>
      </div>

      <div className="search-results-container">
        {/* Filters Sidebar */}
        <div className="filters-sidebar">
          <h2>Filters</h2>
          
          <div className="filter-group">
            <label>Price Range</label>
            <select name="priceRange" value={filters.priceRange} onChange={handleFilterChange}>
              <option value="">Any Price</option>
              <option value="0-20000">Under $20,000</option>
              <option value="20000-40000">$20,000 - $40,000</option>
              <option value="40000-60000">$40,000 - $60,000</option>
              <option value="60000-100000">$60,000 - $100,000</option>
              <option value="100000-999999">Over $100,000</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Year</label>
            <select name="year" value={filters.year} onChange={handleFilterChange}>
              <option value="">Any Year</option>
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>{year}</option>
                );
              })}
            </select>
          </div>

          <div className="filter-group">
            <label>Make</label>
            <select name="make" value={filters.make} onChange={handleFilterChange}>
              <option value="">Any Make</option>
              {[...new Set(searchResults.map(car => car.make))].map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
              <option value="relevance">Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="year-desc">Year: Newest First</option>
              <option value="year-asc">Year: Oldest First</option>
            </select>
          </div>
        </div>

        {/* Results Grid */}
        <div className="results-grid">
          {filteredResults.length > 0 ? (
            filteredResults.map(car => (
              <div key={car._id} className="car-card" onClick={() => navigate(`/car/${car._id}`)}>
                <div className="car-image">
                  <img src={car.imageUrl} alt={`${car.make} ${car.model}`} />
                </div>
                <div className="car-details">
                  <h3>{car.make} {car.model}</h3>
                  <p className="car-year">{car.year}</p>
                  <p className="car-price">${car.specifications.price.toLocaleString()}</p>
                  <div className="car-specs">
                    <span>{car.specifications.engine}</span>
                    <span>{car.specifications.transmission}</span>
                    <span>{car.specifications.fuelType}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <p>No cars found matching your criteria.</p>
              <button onClick={() => navigate('/')} className="back-button">
                Back to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;

