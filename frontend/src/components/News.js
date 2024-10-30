// src/components/News.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './News.css'; // Add CSS for card styling
import { formatDistanceToNow } from 'date-fns';

const News = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
      setError('Failed to fetch news.');
    } finally {
      setLoading(false);
    }
  };

  const openDetailPage = (newsId) => {
    navigate(`/news/${newsId}`);
  };

  return (
    <div className="news-section">
      <h2>Latest News</h2>
      {loading && <p>Loading news...</p>}
      {error && <p className="error">{error}</p>}
      <div className="news-cards">
        {newsItems.map((news) => (
          <div key={news._id} className="news-card" onClick={() => openDetailPage(news._id)}>
            <img src={news.imageUrl} alt={news.title} className="news-image" />
            <div className="news-content">
              <h3 className="news-title">{news.title}</h3>
              <h9 className="news-description">{news.description}</h9>
              <p className="published-at">
             Published {formatDistanceToNow(new Date(news.publishedAt))} ago
            </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default News;

