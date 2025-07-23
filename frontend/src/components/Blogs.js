// src/components/Blogs.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Blogs.css';
import { formatDistanceToNow } from 'date-fns';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState('');
  const itemsPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://localhost:5000/api/blogs');
      setBlogs(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch blogs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const openBlogDetail = (blogId) => {
    navigate(`/blogs/${blogId}`);
  };

  // Get unique tags from all blogs
  const allTags = [...new Set(blogs.flatMap(blog => blog.tags || []))];

  // Filter blogs based on search query and selected tag
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = !selectedTag || (blog.tags && blog.tags.includes(selectedTag));
    
    return matchesSearch && matchesTag;
  });

  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const paginatedBlogs = filteredBlogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="blogs-loading">
        <div className="loading-spinner"></div>
        <p>Loading blogs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blogs-error">
        <p>{error}</p>
        <button onClick={fetchBlogs} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="blogs-section">
      <div className="blogs-header">
        <h2>Latest Blogs</h2>
        <div className="blogs-search">
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="blogs-search-input"
          />
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="blogs-tags">
          <button
            className={`tag-button ${selectedTag === '' ? 'active' : ''}`}
            onClick={() => setSelectedTag('')}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              className={`tag-button ${selectedTag === tag ? 'active' : ''}`}
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {filteredBlogs.length === 0 ? (
        <div className="no-blogs">
          <p>No blogs found.</p>
        </div>
      ) : (
        <>
          <div className="blogs-grid">
            {paginatedBlogs.map((blog) => (
              <div
                key={blog._id}
                className="blog-card"
                onClick={() => openBlogDetail(blog._id)}
              >
                <div className="blog-content">
                  <h3 className="blog-title">{blog.title}</h3>
                  <p className="blog-excerpt">
                    {blog.content.substring(0, 150)}...
                  </p>
                  <div className="blog-meta">
                    <span className="blog-author">By {blog.author}</span>
                    <span className="blog-date">
                      {formatDistanceToNow(new Date(blog.createdAt))} ago
                    </span>
                  </div>
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="blog-tags">
                      {blog.tags.map(tag => (
                        <span key={tag} className="blog-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
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

export default Blogs;
