// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import Compare from './pages/Compare';
import BlogDetail from './components/BlogDetail';
import CarDetail from './components/CarDetail';
import './App.css';
import logo from './logo.png';
import BlogsPage from './pages/BlogsPage';
import NewsPage from './pages/NewsPage';
import NewsDetail from './components/NewsDetail';

const App = () => {
  return (
    <Router>
      <header className="header">
        <Link to="/" className="logo-link">
          <img src={logo} alt="CarCrafter" className="logo" />
          <h3>CarCraftr</h3>
        </Link>
      </header>
      
      <nav>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/compare">Compare Cars</Link></li>
          <li><Link to="/news">News</Link></li>
          <li><Link to="/blogs">Blogs</Link></li>
        </ul>
      </nav>

      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/blogs/:id" element={<BlogDetail />} />
          <Route path="/car/:id" element={<CarDetail />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
