import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import News from '../components/News';
import Blogs from '../components/Blogs';
import SearchBar from '../components/SearchBar';
import './Home.css';
import axios from 'axios';
import '../components/News.css';

const Home = () => {
  const [cars, setCars] = useState([]);
  const [popularCars, setPopularCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('http://localhost:5000/api/cars');
        const shuffledCars = shuffleArray(res.data); // Shuffle the cars
        setCars(shuffledCars);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch cars.');
      } finally {
        setLoading(false);
      }
    };

    const fetchPopularCars = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/cars/popular');
        setPopularCars(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch popular cars.');
      }
    };

    fetchCars();
    fetchPopularCars();
  }, []); // Empty dependency array ensures this runs once on mount

  const handleSearch = async (query) => {
    if (!query.trim()) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://localhost:5000/api/cars', {
        params: { search: query }
      });

      if (res.data.length > 0) {
        navigate('/search-results', { state: { searchResults: res.data } });
      } else {
        setError('No cars found matching your search.');
      }
    } catch (err) {
      console.error(err);
      setError('No cars found matching your search.');
    } finally {
      setLoading(false);
    }
  };

  // Shuffle array utility function
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  return (
    <div className="home-container">
      <h1>Find Your Dream Car!</h1>
      <h8>Your one-stop destination for comparing cars, staying updated with the latest automotive news, and reading insightful blogs.</h8>
      <div className="search-bar-container">
        <SearchBar onSearch={handleSearch} />
      </div>

      {loading && <p className="loading">Loading...</p>}
      {error && <p className="error">{error}</p>}

      <News />
      <Blogs />

      <div>
        <h2>Popular Cars</h2>
        {popularCars.length > 0 ? (
          <CarList cars={popularCars} navigate={navigate} />
        ) : (
          <p>No popular cars available.</p>
        )}
      </div>

      <div>
        <h2>All Cars</h2>
        {loading ? (
          <p className="loading">Loading cars...</p>
        ) : cars.length > 0 ? (
          <CarList cars={cars} navigate={navigate} />
        ) : (
          <p>No cars available.</p>
        )}
      </div>
    </div>
  );
};

const CarList = ({ cars, navigate }) => {
  const [startIndex, setStartIndex] = useState(0);
  const VISIBLE_CARS = 4; // Number of visible cars at a time

  const scrollLeft = () => {
    setStartIndex((prevIndex) => Math.max(prevIndex - VISIBLE_CARS, 0));
  };

  const scrollRight = () => {
    setStartIndex((prevIndex) =>
      Math.min(prevIndex + VISIBLE_CARS, cars.length - VISIBLE_CARS)
    );
  };

  const visibleCars = cars.slice(startIndex, startIndex + VISIBLE_CARS);

  const handleCardClick = (carId) => {
    navigate(`/car/${carId}`);
  };

  return (
    <div className="car-list-wrapper">
      <button className="scroll-button left" onClick={scrollLeft} disabled={startIndex === 0}>
        &#8249; {/* Left Arrow */}
      </button>

      <div className="car-list">
        {visibleCars.map((car) => (
          <div key={car._id} className="car-card" onClick={() => handleCardClick(car._id)}>
            <img src={car.imageUrl} alt={`${car.make} ${car.model}`} className="car-image" />
            <h3>{car.make} {car.model} ({car.year})</h3>
            <h7>Starting Price: ${car.specifications.price}</h7>
          </div>
        ))}
      </div>

      <button className="scroll-button right" onClick={scrollRight} disabled={startIndex + VISIBLE_CARS >= cars.length}>
        &#8250; {/* Right Arrow */}
      </button>
    </div>
  );
};

export default Home;
