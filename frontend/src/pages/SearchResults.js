import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SearchResults.css'; // Add relevant styles for search results

const SearchResults = () => {
  const location = useLocation();
  const { searchResults: initialResults } = location.state || {};
  const [searchResults, setSearchResults] = useState(initialResults || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get('http://localhost:5000/api/cars', {
        params: { search: searchQuery }
      });

      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
      setError('No cars found matching your search.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults([]); // Clear the search results
    setError(null); // Clear any errors
  };

  const handleCarClick = (id) => {
    navigate(`/car/${id}`); // Navigate to the car specifications page
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-results-container">
      <h1>Search Results</h1>

      {/* Search bar */}
      <div className="search-bar-container2">
        <input
          type="text"
          placeholder="Search cars by make, model, or year..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
        <button onClick={handleClear} className="clear-button">
          Clear
        </button>
      </div>

      {loading && <p className="loading">Loading...</p>}
      {error && <p className="error">{error}</p>}

      {searchResults && searchResults.length > 0 ? (
        <div className="car-list">
          {searchResults.map((car) => (
            <div key={car._id} className="car-card" onClick={() => handleCarClick(car._id)}>
              <img src={car.imageUrl} alt={`${car.make} ${car.model}`} className="car-image" />
              <h3>{car.make} {car.model} ({car.year})</h3>
              <h5>Starting Price: ${car.specifications.price}</h5>
            </div>
          ))}
        </div>
      ) : (
        !loading
      )}
    </div>
  );
};

export default SearchResults;

