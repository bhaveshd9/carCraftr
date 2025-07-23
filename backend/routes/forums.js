const express = require('express');
const router = express.Router();
const ForumPost = require('../models/Forum');
const auth = require('../middleware/auth');

// Get all forum posts for a car
router.get('/car/:carId', async (req, res) => {
  try {
    const { category, tag, sort = 'createdAt' } = req.query;
    const query = { carId: req.params.carId };

    if (category) query.category = category;
    if (tag) query.tags = tag;

    const posts = await ForumPost.find(query)
      .populate('userId', 'username')
      .sort({ [sort]: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific forum post
router.get('/:id', async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('userId', 'username')
      .populate('comments.userId', 'username');
    
    if (!post) {
      return res.status(404).json({ message: 'Forum post not found' });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new forum post
router.post('/', auth, async (req, res) => {
  try {
    const post = new ForumPost({
      ...req.body,
      userId: req.user._id
    });
    const newPost = await post.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a forum post
router.patch('/:id', auth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Forum post not found' });
    }

    // Check if user is the author
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    Object.assign(post, req.body);
    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a forum post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Forum post not found' });
    }

    // Check if user is the author
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.remove();
    res.json({ message: 'Forum post deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a comment to a forum post
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Forum post not found' });
    }

    post.comments.push({
      userId: req.user._id,
      content: req.body.content
    });

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Like/Unlike a forum post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Forum post not found' });
    }

    const likeIndex = post.likes.indexOf(req.user._id);
    if (likeIndex === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark a forum post as solved
router.post('/:id/solve', auth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Forum post not found' });
    }

    // Check if user is the author
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to mark this post as solved' });
    }

    post.isSolved = true;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 