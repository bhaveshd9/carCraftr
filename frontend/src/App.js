// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './pages/Home';
import Compare from './pages/Compare';
import NewsPage from './pages/NewsPage';
import BlogsPage from './pages/BlogsPage';
import NewsDetail from './components/NewsDetail';
import './App.css';
import logo from './/logo.png';
import SearchResults from './pages/SearchResults';
import CarSpecs from './components/CarSpecs';

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
          <Route path="/compare" element={<Compare />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/search-results" element={<SearchResults />} /> 
          <Route path="/car/:id" element={<CarSpecs />} />
          <Route path="/news/:id" element={<NewsDetail />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
