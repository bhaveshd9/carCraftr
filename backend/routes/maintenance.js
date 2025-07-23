const express = require('express');
const router = express.Router();
const MaintenanceGuide = require('../models/MaintenanceGuide');
const auth = require('../middleware/auth');

// Get all maintenance guides for a car
router.get('/car/:carId', async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    const query = { carId: req.params.carId };

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    const guides = await MaintenanceGuide.find(query)
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    res.json(guides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific maintenance guide
router.get('/:id', async (req, res) => {
  try {
    const guide = await MaintenanceGuide.findById(req.params.id)
      .populate('author', 'username')
      .populate('verifiedBy', 'username');
    
    if (!guide) {
      return res.status(404).json({ message: 'Maintenance guide not found' });
    }

    // Increment view count
    guide.views += 1;
    await guide.save();

    res.json(guide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new maintenance guide
router.post('/', auth, async (req, res) => {
  try {
    const guide = new MaintenanceGuide({
      ...req.body,
      author: req.user._id
    });
    const newGuide = await guide.save();
    res.status(201).json(newGuide);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a maintenance guide
router.patch('/:id', auth, async (req, res) => {
  try {
    const guide = await MaintenanceGuide.findById(req.params.id);
    if (!guide) {
      return res.status(404).json({ message: 'Maintenance guide not found' });
    }

    // Check if user is the author
    if (guide.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this guide' });
    }

    Object.assign(guide, req.body);
    const updatedGuide = await guide.save();
    res.json(updatedGuide);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a maintenance guide
router.delete('/:id', auth, async (req, res) => {
  try {
    const guide = await MaintenanceGuide.findById(req.params.id);
    if (!guide) {
      return res.status(404).json({ message: 'Maintenance guide not found' });
    }

    // Check if user is the author
    if (guide.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this guide' });
    }

    await guide.remove();
    res.json({ message: 'Maintenance guide deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify a maintenance guide
router.post('/:id/verify', auth, async (req, res) => {
  try {
    const guide = await MaintenanceGuide.findById(req.params.id);
    if (!guide) {
      return res.status(404).json({ message: 'Maintenance guide not found' });
    }

    // Check if user has already verified
    if (guide.verifiedBy.includes(req.user._id)) {
      return res.status(400).json({ message: 'You have already verified this guide' });
    }

    guide.verifiedBy.push(req.user._id);
    await guide.save();
    res.json(guide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like/Unlike a maintenance guide
router.post('/:id/like', auth, async (req, res) => {
  try {
    const guide = await MaintenanceGuide.findById(req.params.id);
    if (!guide) {
      return res.status(404).json({ message: 'Maintenance guide not found' });
    }

    const likeIndex = guide.likes.indexOf(req.user._id);
    if (likeIndex === -1) {
      guide.likes.push(req.user._id);
    } else {
      guide.likes.splice(likeIndex, 1);
    }

    await guide.save();
    res.json(guide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get popular maintenance guides
router.get('/popular', async (req, res) => {
  try {
    const guides = await MaintenanceGuide.find()
      .populate('author', 'username')
      .sort({ views: -1, likes: -1 })
      .limit(10);
    res.json(guides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 