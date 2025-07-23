const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const auth = require('../middleware/auth');

// Get all reviews for a car
router.get('/car/:carId', async (req, res) => {
  try {
    const reviews = await Review.find({ carId: req.params.carId })
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific review
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('userId', 'username');
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new review
router.post('/', auth, async (req, res) => {
  try {
    const review = new Review({
      ...req.body,
      userId: req.user._id
    });
    const newReview = await review.save();
    res.status(201).json(newReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a review
router.patch('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is the author
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    Object.assign(review, req.body);
    const updatedReview = await review.save();
    res.json(updatedReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is the author
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await review.remove();
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like/Unlike a review
router.post('/:id/like', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const likeIndex = review.likes.indexOf(req.user._id);
    if (likeIndex === -1) {
      review.likes.push(req.user._id);
      review.helpfulCount += 1;
    } else {
      review.likes.splice(likeIndex, 1);
      review.helpfulCount -= 1;
    }

    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get average rating for a car
router.get('/car/:carId/average-rating', async (req, res) => {
  try {
    const result = await Review.aggregate([
      { $match: { carId: new mongoose.Types.ObjectId(req.params.carId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: {
              rating: '$rating',
              count: 1
            }
          }
        }
      }
    ]);

    if (result.length === 0) {
      return res.json({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: []
      });
    }

    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 