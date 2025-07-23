import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './BlogDetail.css';
import { formatDistanceToNow } from 'date-fns';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/blogs/${id}`);
        setBlog(res.data);
      } catch (err) {
        console.error("Error fetching blog:", err.message);
        setError('Failed to fetch blog details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="blog-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading blog post...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-detail-error">
        <p>{error}</p>
        <button onClick={() => navigate('/blogs')} className="back-button">
          Back to Blogs
        </button>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="blog-detail-not-found">
        <p>Blog post not found.</p>
        <button onClick={() => navigate('/blogs')} className="back-button">
          Back to Blogs
        </button>
      </div>
    );
  }

  return (
    <div className="blog-detail">
      <button onClick={() => navigate('/blogs')} className="back-button">
        ← Back to Blogs
      </button>
      
      <article className="blog-detail-content">
        <header className="blog-detail-header">
          <h1>{blog.title}</h1>
          <div className="blog-detail-meta">
            <div className="blog-detail-author">
              <span className="author-label">By</span>
              <span className="author-name">{blog.author}</span>
            </div>
            <div className="blog-detail-date">
              Published {formatDistanceToNow(new Date(blog.createdAt))} ago
            </div>
          </div>
          {blog.tags && blog.tags.length > 0 && (
            <div className="blog-detail-tags">
              {blog.tags.map(tag => (
                <span key={tag} className="blog-detail-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="blog-detail-body">
          {blog.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  );
};

export default BlogDetail; 