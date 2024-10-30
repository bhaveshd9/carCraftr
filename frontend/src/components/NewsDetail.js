import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './NewsDetail.css'; 
//import { formatDistanceToNow } from 'date-fns';

const NewsDetail = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/news/${id}`);
        setNews(res.data);
      } catch (err) {
        console.error("Error fetching news:", err.message);
        setError('Failed to fetch news details.');
      }
    };

    fetchNewsDetail();
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!news) return <p>Loading...</p>;

  return (
    <div className="news-detail">
      {news.imageUrl && (
        <img src={news.imageUrl} alt={news.title} className="news-detail-image" />
      )}
      <h2>{news.title || 'No Title Available'}</h2>
      <p className="news-detail-description">
        {news.description || 'No Description Available'}
      </p>
      <div className="news-detail-body">
        {news.body ? (
          news.body.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))
        ) : (
          <p>No Content Available</p> // You can change this if you have an alternative message
        )}
      </div>
      <p>
        <strong>Source: </strong>
        <a href={news.url} target="_blank" rel="noopener noreferrer">
          {news.url}
        </a>
        <p className="published-at">
          Published on {new Date(news.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
            })}
            </p>
      </p>
    </div>
  );
};

export default NewsDetail;
