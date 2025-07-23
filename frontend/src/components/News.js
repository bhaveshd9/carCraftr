// src/components/News.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './News.css'; // Add CSS for card styling
import { formatDistanceToNow } from 'date-fns';

const News = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://localhost:5000/api/news');
      setNewsItems(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch news. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const openDetailPage = (newsId) => {
    navigate(`/news/${newsId}`);
  };

  const filteredNews = newsItems.filter(news =>
    news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    news.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const paginatedNews = filteredNews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="news-loading">
        <div className="loading-spinner"></div>
        <p>Loading latest news...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="news-error">
        <p>{error}</p>
        <button onClick={fetchNews} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="news-section">
      <div className="news-header">
        <h2>Latest News</h2>
        <div className="news-search">
          <input
            type="text"
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="news-search-input"
          />
        </div>
      </div>

      {filteredNews.length === 0 ? (
        <div className="no-news">
          <p>No news articles found.</p>
        </div>
      ) : (
        <>
          <div className="news-cards">
            {paginatedNews.map((news) => (
              <div
                key={news._id}
                className="news-card"
                onClick={() => openDetailPage(news._id)}
              >
                <div className="news-image-container">
                  <img
                    src={news.imageUrl || '/default-news.jpg'}
                    alt={news.title}
                    className="news-image"
                  />
                </div>
                <div className="news-content">
                  <h3 className="news-title">{news.title}</h3>
                  <p className="news-description">{news.description}</p>
                  <p className="published-at">
                    Published {formatDistanceToNow(new Date(news.publishedAt))} ago
                  </p>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Previous
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default News;

