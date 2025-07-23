const express = require('express');
const router = express.Router();
const CommonIssue = require('../models/CommonIssue');
const auth = require('../middleware/auth');

// Get all common issues for a car
router.get('/car/:carId', async (req, res) => {
  try {
    const { category, severity, status } = req.query;
    const query = { carId: req.params.carId };

    if (category) query.category = category;
    if (severity) query.severity = severity;
    if (status) query.status = status;

    const issues = await CommonIssue.find(query)
      .populate('reportedBy', 'username')
      .populate('verifiedBy', 'username')
      .sort({ severity: -1, createdAt: -1 });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific common issue
router.get('/:id', async (req, res) => {
  try {
    const issue = await CommonIssue.findById(req.params.id)
      .populate('reportedBy', 'username')
      .populate('verifiedBy', 'username')
      .populate('solutions.userId', 'username')
      .populate('solutions.verifiedBy', 'username');
    
    if (!issue) {
      return res.status(404).json({ message: 'Common issue not found' });
    }

    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new common issue
router.post('/', auth, async (req, res) => {
  try {
    const issue = new CommonIssue({
      ...req.body,
      reportedBy: [req.user._id]
    });
    const newIssue = await issue.save();
    res.status(201).json(newIssue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a common issue
router.patch('/:id', auth, async (req, res) => {
  try {
    const issue = await CommonIssue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Common issue not found' });
    }

    // Check if user is the author
    if (!issue.reportedBy.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this issue' });
    }

    Object.assign(issue, req.body);
    const updatedIssue = await issue.save();
    res.json(updatedIssue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a common issue
router.delete('/:id', auth, async (req, res) => {
  try {
    const issue = await CommonIssue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Common issue not found' });
    }

    // Check if user is the author
    if (!issue.reportedBy.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this issue' });
    }

    await issue.remove();
    res.json({ message: 'Common issue deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a solution to a common issue
router.post('/:id/solutions', auth, async (req, res) => {
  try {
    const issue = await CommonIssue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Common issue not found' });
    }

    issue.solutions.push({
      userId: req.user._id,
      content: req.body.content,
      steps: req.body.steps,
      estimatedCost: req.body.estimatedCost,
      difficulty: req.body.difficulty
    });

    await issue.save();
    res.json(issue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Verify a common issue
router.post('/:id/verify', auth, async (req, res) => {
  try {
    const issue = await CommonIssue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Common issue not found' });
    }

    // Check if user has already verified
    if (issue.verifiedBy.includes(req.user._id)) {
      return res.status(400).json({ message: 'You have already verified this issue' });
    }

    issue.verifiedBy.push(req.user._id);
    await issue.save();
    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify a solution
router.post('/:issueId/solutions/:solutionId/verify', auth, async (req, res) => {
  try {
    const issue = await CommonIssue.findById(req.params.issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Common issue not found' });
    }

    const solution = issue.solutions.id(req.params.solutionId);
    if (!solution) {
      return res.status(404).json({ message: 'Solution not found' });
    }

    // Check if user has already verified
    if (solution.verifiedBy.includes(req.user._id)) {
      return res.status(400).json({ message: 'You have already verified this solution' });
    }

    solution.verifiedBy.push(req.user._id);
    await issue.save();
    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like/Unlike a solution
router.post('/:issueId/solutions/:solutionId/like', auth, async (req, res) => {
  try {
    const issue = await CommonIssue.findById(req.params.issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Common issue not found' });
    }

    const solution = issue.solutions.id(req.params.solutionId);
    if (!solution) {
      return res.status(404).json({ message: 'Solution not found' });
    }

    const likeIndex = solution.likes.indexOf(req.user._id);
    if (likeIndex === -1) {
      solution.likes.push(req.user._id);
      solution.helpfulCount += 1;
    } else {
      solution.likes.splice(likeIndex, 1);
      solution.helpfulCount -= 1;
    }

    await issue.save();
    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get most common issues
router.get('/popular', async (req, res) => {
  try {
    const issues = await CommonIssue.find()
      .populate('reportedBy', 'username')
      .sort({ 'solutions.length': -1, severity: -1 })
      .limit(10);
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 