import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [cars, setCars] = useState([]);
  const [popularCars, setPopularCars] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [loading, setLoading] = useState({
    cars: true,
    popularCars: true,
    news: true,
    blogs: true
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredCars, setFilteredCars] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    budget: [0, 1000000], // [min, max] in dollars
    fuelType: [],
    carType: [],
    transmission: [],
    mpg: [0, 50], // [min, max]
    torque: [0, 1000], // [min, max] in lb-ft
    power: [0, 1000], // [min, max] in hp
    sortBy: 'price_asc' // price_asc, price_desc, power_asc, power_desc, mpg_asc, mpg_desc
  });

  useEffect(() => {
    fetchCars();
    fetchPopularCars();
    fetchLatestNews();
    fetchLatestBlogs();
  }, []);

  const fetchCars = async () => {
    setLoading(prev => ({ ...prev, cars: true }));
    setError(null);
    try {
      const res = await axios.get('http://localhost:5000/api/cars');
      setCars(res.data);
      setFilteredCars(res.data);
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError('Failed to fetch cars. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, cars: false }));
    }
  };

  const fetchPopularCars = async () => {
    setLoading(prev => ({ ...prev, popularCars: true }));
    try {
      const res = await axios.get('http://localhost:5000/api/cars/popular');
      setPopularCars(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch popular cars.');
    } finally {
      setLoading(prev => ({ ...prev, popularCars: false }));
    }
  };

  const fetchLatestNews = async () => {
    setLoading(prev => ({ ...prev, news: true }));
    try {
      const res = await axios.get('http://localhost:5000/api/news?limit=2');
      setLatestNews(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch latest news.');
    } finally {
      setLoading(prev => ({ ...prev, news: false }));
    }
  };

  const fetchLatestBlogs = async () => {
    setLoading(prev => ({ ...prev, blogs: true }));
    try {
      const res = await axios.get('http://localhost:5000/api/blogs?limit=2');
      setLatestBlogs(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch latest blogs.');
    } finally {
      setLoading(prev => ({ ...prev, blogs: false }));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase();
    
    const results = cars.filter(car => {
      const makeMatch = car.make.toLowerCase().includes(query);
      const modelMatch = car.model.toLowerCase().includes(query);
      const yearMatch = car.year.toString().includes(query);
      
      return makeMatch || modelMatch || yearMatch;
    });

    setFilteredCars(results);
    navigate('/search', { state: { results, filters } });
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const applyFilters = () => {
    let results = [...cars];

    // Apply text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(car => 
        car.make.toLowerCase().includes(query) ||
        car.model.toLowerCase().includes(query) ||
        car.year.toString().includes(query)
      );
    }

    // Apply budget filter
    results = results.filter(car => {
      const price = car.variants[0]?.price || car.basePrice;
      return price >= filters.budget[0] && price <= filters.budget[1];
    });

    // Apply fuel type filter
    if (filters.fuelType.length > 0) {
      results = results.filter(car => 
        car.variants.some(variant => 
          filters.fuelType.includes(variant.specifications.fuelType)
        )
      );
    }

    // Apply car type filter
    if (filters.carType.length > 0) {
      results = results.filter(car => 
        filters.carType.includes(car.type)
      );
    }

    // Apply transmission filter
    if (filters.transmission.length > 0) {
      results = results.filter(car => 
        car.variants.some(variant => 
          filters.transmission.includes(variant.specifications.transmission)
        )
      );
    }

    // Apply MPG filter
    results = results.filter(car => 
      car.variants.some(variant => {
        const mpg = variant.specifications.mpg;
        return mpg.city >= filters.mpg[0] && mpg.highway <= filters.mpg[1];
      })
    );

    // Apply torque filter
    results = results.filter(car => 
      car.variants.some(variant => {
        const torque = parseInt(variant.specifications.torque);
        return torque >= filters.torque[0] && torque <= filters.torque[1];
      })
    );

    // Apply power filter
    results = results.filter(car => 
      car.variants.some(variant => {
        const power = parseInt(variant.specifications.horsepower);
        return power >= filters.power[0] && power <= filters.power[1];
      })
    );

    // Apply sorting
    results.sort((a, b) => {
      const aValue = getSortValue(a, filters.sortBy);
      const bValue = getSortValue(b, filters.sortBy);
      return filters.sortBy.includes('asc') ? aValue - bValue : bValue - aValue;
    });

    setFilteredCars(results);
    navigate('/search', { state: { results, filters } });
  };

  const getSortValue = (car, sortBy) => {
    switch (sortBy) {
      case 'price_asc':
      case 'price_desc':
        return car.variants[0]?.price || car.basePrice;
      case 'power_asc':
      case 'power_desc':
        return parseInt(car.variants[0]?.specifications.horsepower) || 0;
      case 'mpg_asc':
      case 'mpg_desc':
        return car.variants[0]?.specifications.mpg.highway || 0;
      default:
        return 0;
    }
  };

  return (
    <div className="home">
      {/* Hero Section with Search */}
      <section className="homepage-hero">
        <div className="hero-content">
          <h1>Welcome to CarCraftr</h1>
          <p>Your ultimate destination for car comparisons, news, and insights</p>
          <div className="search-bar-container">
            <form onSubmit={handleSearch} className="search-container">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search by make, model, or year..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="button" className="filter-button" onClick={() => setShowFilters(!showFilters)}>
                  Filters
                </button>
                <button type="submit" className="search-button">
                  Search
                </button>
              </div>
            </form>
          </div>
          <div className="hero-buttons">
            <Link to="/compare" className="cta-button primary">Compare Cars</Link>
            <Link to="/news" className="cta-button secondary">Latest News</Link>
          </div>
        </div>
      </section>

      {/* Filter Modal */}
      {showFilters && (
        <div className="filter-modal">
          <div className="filter-content">
            <h2>Filter Cars</h2>
            
            {/* Budget Range Slider */}
            <div className="filter-section">
              <h3>Budget Range</h3>
              <div className="range-slider">
                <input
                  type="range"
                  min="0"
                  max="1000000"
                  step="10000"
                  value={filters.budget[0]}
                  onChange={(e) => handleFilterChange('budget', [parseInt(e.target.value), filters.budget[1]])}
                />
                <input
                  type="range"
                  min="0"
                  max="1000000"
                  step="10000"
                  value={filters.budget[1]}
                  onChange={(e) => handleFilterChange('budget', [filters.budget[0], parseInt(e.target.value)])}
                />
                <div className="range-values">
                  ${filters.budget[0].toLocaleString()} - ${filters.budget[1].toLocaleString()}
                </div>
              </div>
            </div>

            {/* Fuel Type */}
            <div className="filter-section">
              <h3>Fuel Type</h3>
              <div className="checkbox-group">
                {['Petrol', 'Diesel', 'Electric', 'Hybrid'].map(type => (
                  <label key={type}>
                    <input
                      type="checkbox"
                      checked={filters.fuelType.includes(type)}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...filters.fuelType, type]
                          : filters.fuelType.filter(t => t !== type);
                        handleFilterChange('fuelType', newTypes);
                      }}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            {/* Car Type */}
            <div className="filter-section">
              <h3>Car Type</h3>
              <div className="checkbox-group">
                {['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible'].map(type => (
                  <label key={type}>
                    <input
                      type="checkbox"
                      checked={filters.carType.includes(type)}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...filters.carType, type]
                          : filters.carType.filter(t => t !== type);
                        handleFilterChange('carType', newTypes);
                      }}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            {/* Transmission */}
            <div className="filter-section">
              <h3>Transmission</h3>
              <div className="checkbox-group">
                {['Manual', 'Automatic', 'CVT'].map(type => (
                  <label key={type}>
                    <input
                      type="checkbox"
                      checked={filters.transmission.includes(type)}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...filters.transmission, type]
                          : filters.transmission.filter(t => t !== type);
                        handleFilterChange('transmission', newTypes);
                      }}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            {/* MPG Range */}
            <div className="filter-section">
              <h3>MPG Range</h3>
              <div className="range-slider">
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={filters.mpg[0]}
                  onChange={(e) => handleFilterChange('mpg', [parseInt(e.target.value), filters.mpg[1]])}
                />
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={filters.mpg[1]}
                  onChange={(e) => handleFilterChange('mpg', [filters.mpg[0], parseInt(e.target.value)])}
                />
                <div className="range-values">
                  {filters.mpg[0]} - {filters.mpg[1]} MPG
                </div>
              </div>
            </div>

            {/* Torque Range */}
            <div className="filter-section">
              <h3>Torque Range (lb-ft)</h3>
              <div className="range-slider">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={filters.torque[0]}
                  onChange={(e) => handleFilterChange('torque', [parseInt(e.target.value), filters.torque[1]])}
                />
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={filters.torque[1]}
                  onChange={(e) => handleFilterChange('torque', [filters.torque[0], parseInt(e.target.value)])}
                />
                <div className="range-values">
                  {filters.torque[0]} - {filters.torque[1]} lb-ft
                </div>
              </div>
            </div>

            {/* Power Range */}
            <div className="filter-section">
              <h3>Power Range (hp)</h3>
              <div className="range-slider">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={filters.power[0]}
                  onChange={(e) => handleFilterChange('power', [parseInt(e.target.value), filters.power[1]])}
                />
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={filters.power[1]}
                  onChange={(e) => handleFilterChange('power', [filters.power[0], parseInt(e.target.value)])}
                />
                <div className="range-values">
                  {filters.power[0]} - {filters.power[1]} hp
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div className="filter-section">
              <h3>Sort By</h3>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="sort-select"
              >
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="power_asc">Power: Low to High</option>
                <option value="power_desc">Power: High to Low</option>
                <option value="mpg_asc">MPG: Low to High</option>
                <option value="mpg_desc">MPG: High to Low</option>
              </select>
            </div>

            <div className="filter-actions">
              <button onClick={applyFilters} className="apply-filters">
                Apply Filters
              </button>
              <button onClick={() => setShowFilters(false)} className="close-filters">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popular Cars Section */}
      <section className="popular-cars">
        <div className="section-header">
          <h2>Popular Cars</h2>
          <Link to="/compare" className="view-all">View All Cars →</Link>
        </div>
        {loading.popularCars ? (
          <div className="loading">Loading popular cars...</div>
        ) : popularCars.length > 0 ? (
          <div className="cars-grid">
            {popularCars.map(car => (
              <div key={car._id} className="car-card" onClick={() => navigate(`/car/${car._id}`)}>
                <img src={car.imageUrl} alt={`${car.make} ${car.model}`} className="car-image" />
                <div className="car-content">
                  <h3>{car.make} {car.model}</h3>
                  <p className="car-year">{car.year}</p>
                  <p className="car-price">Starting at ${car.specifications.price}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-cars">No popular cars available.</p>
        )}
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose CarCraftr?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚗</div>
            <h3>Car Comparison</h3>
            <p>Compare different car models side by side with detailed specifications and features</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📰</div>
            <h3>Latest News</h3>
            <p>Stay updated with the latest automotive news and industry developments</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Expert Blogs</h3>
            <p>Read in-depth articles and insights from automotive experts</p>
          </div>
        </div>
      </section>

      {/* Latest News Preview */}
      <section className="latest-news">
        <div className="section-header">
          <h2>Latest News</h2>
          <Link to="/news" className="view-all">View All News →</Link>
        </div>
        {loading.news ? (
          <div className="loading">Loading latest news...</div>
        ) : latestNews.length > 0 ? (
          <div className="news-preview">
            {latestNews.map(news => (
              <div key={news._id} className="news-card" onClick={() => navigate(`/news/${news._id}`)}>
                <img src={news.imageUrl} alt={news.title} className="news-image" />
                <div className="news-content">
                  <h3>{news.title}</h3>
                  <p>{news.content ? news.content.substring(0, 150) : ''}...</p>
                  <Link to={`/news/${news._id}`} className="read-more">Read More</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-content">No news available.</p>
        )}
      </section>

      {/* Latest Blogs Preview */}
      <section className="latest-blogs">
        <div className="section-header">
          <h2>Latest Blogs</h2>
          <Link to="/blogs" className="view-all">View All Blogs →</Link>
        </div>
        {loading.blogs ? (
          <div className="loading">Loading latest blogs...</div>
        ) : latestBlogs.length > 0 ? (
          <div className="blogs-preview">
            {latestBlogs.map(blog => (
              <div key={blog._id} className="blog-card" onClick={() => navigate(`/blogs/${blog._id}`)}>
                <img src={blog.imageUrl} alt={blog.title} className="blog-image" />
                <div className="blog-content">
                  <h3>{blog.title}</h3>
                  <p>{blog.content ? blog.content.substring(0, 150) : ''}...</p>
                  <Link to={`/blogs/${blog._id}`} className="read-more">Read More</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-content">No blogs available.</p>
        )}
      </section>

      {/* All Cars Section */}
      <section className="all-cars">
        <div className="section-header">
          <h2>All Cars</h2>
          <Link to="/compare" className="view-all">View All Cars →</Link>
        </div>
        {loading.cars ? (
          <div className="loading">Loading cars...</div>
        ) : cars.length > 0 ? (
          <div className="cars-grid">
            {filteredCars.slice(0, 4).map(car => (
              <div key={car._id} className="car-card" onClick={() => navigate(`/car/${car._id}`)}>
                <img src={car.imageUrl} alt={`${car.make} ${car.model}`} className="car-image" />
                <div className="car-content">
                  <h3>{car.make} {car.model}</h3>
                  <p className="car-year">{car.year}</p>
                  <p className="car-price">Starting at ${car.specifications.price}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-cars">No cars available.</p>
        )}
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Find Your Perfect Car?</h2>
          <p>Start comparing cars now and make an informed decision</p>
          <Link to="/compare" className="cta-button primary">Start Comparing</Link>
        </div>
      </section>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Home;
