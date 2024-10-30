const express = require('express');
const router = express.Router();
const News = require('../models/News');

// Get a specific news item by ID
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News item not found' });
    
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all news
router.get('/', async (req, res) => {
  try {
    const news = await News.find().sort({ publishedAt: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new news item
router.post('/', async (req, res) => {
  const { title, description, body, url, imageUrl, publishedAt } = req.body;
  const news = new News({
    title,
    description,
    body,
    url,
    imageUrl,
    publishedAt,
  });

  try {
    const newNews = await news.save();
    res.status(201).json(newNews);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete news by ID
router.delete('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });

    await news.remove();
    res.json({ message: 'News deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update news by ID
router.patch('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });

    if (req.body.title != null) news.title = req.body.title;
    if (req.body.description != null) news.description = req.body.description;
    if (req.body.body != null) news.body = req.body.body;
    if (req.body.url != null) news.url = req.body.url;
    if (req.body.imageUrl != null) news.imageUrl = req.body.imageUrl;
    if (req.body.publishedAt != null) news.publishedAt = req.body.publishedAt;

    const updatedNews = await news.save();
    res.json(updatedNews);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

