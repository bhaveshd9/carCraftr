// src/components/Blogs.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
//import './Blogs.css'; // Create this CSS file if you want to style Blogs component

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      setError('Failed to fetch blogs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="blogs-section">
      <h2>Blogs</h2>
      {loading && <p>Loading blogs...</p>}
      {error && <p className="error">{error}</p>}
      {blogs.map((blog) => (
        <div key={blog._id} className="blog-item">
          <h3>{blog.title}</h3>
          <p>{blog.content.substring(0, 200)}...</p>
          <p className="blog-meta">
            By: {blog.author} | {new Date(blog.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Blogs;
