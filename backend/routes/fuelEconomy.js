const express = require('express');
const router = express.Router();
const FuelEconomyReport = require('../models/FuelEconomyReport');
const auth = require('../middleware/auth');

// Get all fuel economy reports for a car
router.get('/car/:carId', async (req, res) => {
  try {
    const { terrain, climate } = req.query;
    const query = { carId: req.params.carId };

    if (terrain) query['drivingConditions.terrain'] = terrain;
    if (climate) query['drivingConditions.climate'] = climate;

    const reports = await FuelEconomyReport.find(query)
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific fuel economy report
router.get('/:id', async (req, res) => {
  try {
    const report = await FuelEconomyReport.findById(req.params.id)
      .populate('userId', 'username');
    
    if (!report) {
      return res.status(404).json({ message: 'Fuel economy report not found' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new fuel economy report
router.post('/', auth, async (req, res) => {
  try {
    const report = new FuelEconomyReport({
      ...req.body,
      userId: req.user._id
    });
    const newReport = await report.save();
    res.status(201).json(newReport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a fuel economy report
router.patch('/:id', auth, async (req, res) => {
  try {
    const report = await FuelEconomyReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Fuel economy report not found' });
    }

    // Check if user is the author
    if (report.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this report' });
    }

    Object.assign(report, req.body);
    const updatedReport = await report.save();
    res.json(updatedReport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a fuel economy report
router.delete('/:id', auth, async (req, res) => {
  try {
    const report = await FuelEconomyReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Fuel economy report not found' });
    }

    // Check if user is the author
    if (report.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this report' });
    }

    await report.remove();
    res.json({ message: 'Fuel economy report deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like/Unlike a fuel economy report
router.post('/:id/like', auth, async (req, res) => {
  try {
    const report = await FuelEconomyReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Fuel economy report not found' });
    }

    const likeIndex = report.likes.indexOf(req.user._id);
    if (likeIndex === -1) {
      report.likes.push(req.user._id);
      report.helpfulCount += 1;
    } else {
      report.likes.splice(likeIndex, 1);
      report.helpfulCount -= 1;
    }

    await report.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get average fuel economy for a car
router.get('/car/:carId/average', async (req, res) => {
  try {
    const result = await FuelEconomyReport.aggregate([
      { $match: { carId: new mongoose.Types.ObjectId(req.params.carId) } },
      {
        $group: {
          _id: null,
          averageCity: { $avg: '$fuelConsumption.city' },
          averageHighway: { $avg: '$fuelConsumption.highway' },
          averageCombined: { $avg: '$fuelConsumption.combined' },
          totalReports: { $sum: 1 }
        }
      }
    ]);

    if (result.length === 0) {
      return res.json({
        averageCity: 0,
        averageHighway: 0,
        averageCombined: 0,
        totalReports: 0
      });
    }

    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 