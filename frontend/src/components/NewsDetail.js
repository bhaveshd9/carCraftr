import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './NewsDetail.css';
import { formatDistanceToNow } from 'date-fns';

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/news/${id}`);
        setNews(res.data);
      } catch (err) {
        console.error("Error fetching news:", err.message);
        setError('Failed to fetch news details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="news-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading article...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="news-detail-error">
        <p>{error}</p>
        <button onClick={() => navigate('/news')} className="back-button">
          Back to News
        </button>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="news-detail-not-found">
        <p>Article not found.</p>
        <button onClick={() => navigate('/news')} className="back-button">
          Back to News
        </button>
      </div>
    );
  }

  return (
    <div className="news-detail">
      <button onClick={() => navigate('/news')} className="back-button">
        ← Back to News
      </button>
      
      <article className="news-detail-content">
        {news.imageUrl && (
          <div className="news-detail-image-container">
            <img src={news.imageUrl} alt={news.title} className="news-detail-image" />
          </div>
        )}
        
        <header className="news-detail-header">
          <h1>{news.title}</h1>
          <div className="news-detail-meta">
            <p className="published-at">
              Published {formatDistanceToNow(new Date(news.publishedAt))} ago
            </p>
            {news.url && (
              <a
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="source-link"
              >
                Read original article
              </a>
            )}
          </div>
        </header>

        {news.description && (
          <p className="news-detail-description">{news.description}</p>
        )}

        <div className="news-detail-body">
          {news.body ? (
            news.body.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))
          ) : (
            <p className="no-content">No content available for this article.</p>
          )}
        </div>
      </article>
    </div>
  );
};

export default NewsDetail;
