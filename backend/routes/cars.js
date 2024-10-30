const express = require('express');
const router = express.Router();
const Car = require('../models/Car');


router.get('/popular', async (req, res) => {
  try {
    const popularCars = await Car.find({ popularity: { $gte: 50 } }) // Threshold for popularity
      .sort({ popularity: -1 }) // Sort by popularity in descending order
      .limit(10); // Limit the number of popular cars returned
    res.json(popularCars);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch popular cars.' });
  }
});

// Get cars based on query parameters
router.get('/', async (req, res) => {
  try {
    const { search, make, model, year } = req.query;
    let query = {};

    // If 'search' parameter is present, apply it across make, model, and year
    if (search) {
      // Check if the search query looks like a year (numeric)
      const isYearSearch = !isNaN(search);
      
      if (isYearSearch) {
        query = { year: search }; // If it's a number, search in the year field directly
      } else {
        // Generic search across make, model, and year as string
        query = {
          $or: [
            { make: { $regex: search, $options: 'i' } },
            { model: { $regex: search, $options: 'i' } },
            { year: { $regex: search, $options: 'i' } } // Handle year as string
          ]
        };
      }
    } else {
      // Apply individual filters if 'search' is not present
      if (make) query.make = { $regex: make, $options: 'i' };
      if (model) query.model = { $regex: model, $options: 'i' };
      if (year) query.year = year; // Exact match for year
    }

    const cars = await Car.find(query);
    if (cars.length === 0) {
      return res.status(404).json({ message: 'No cars found matching your search.' });
    }
    res.json(cars);
  } catch (err) {
    console.error("Search error:", err); // Log the error
    res.status(500).json({ message: 'No cars found matching your search.' });
  }
});



// Get a single car by ID
router.get('/:id', getCar, (req, res) => {
  res.json(res.car);
});

// Create a new car
router.post('/', async (req, res) => {
  const car = new Car({
    make: req.body.make,
    model: req.body.model,
    year: req.body.year,
    specifications: req.body.specifications,
    imageUrl: req.body.imageUrl,
    popularity: req.body.popularity
  });

  try {
    const newCar = await car.save();
    res.status(201).json(newCar);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a car
router.patch('/:id', getCar, async (req, res) => {
  if (req.body.make != null) {
    res.car.make = req.body.make;
  }
  if (req.body.model != null) {
    res.car.model = req.body.model;
  }
  if (req.body.year != null) {
    res.car.year = req.body.year;
  }
  if (req.body.specifications != null) {
    res.car.specifications = req.body.specifications;
  }
  if (req.body.imageUrl != null) {
    res.car.imageUrl = req.body.imageUrl;
  }
  if (req.body.popularity != null) {
    res.car.popularity = req.body.popularity;
  }

  try {
    const updatedCar = await res.car.save();
    res.json(updatedCar);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a car
router.delete('/:id', getCar, async (req, res) => {
  try {
    await res.car.remove();
    res.json({ message: 'Deleted Car' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware to get car by ID
async function getCar(req, res, next) {
  let car;
  try {
    car = await Car.findById(req.params.id);
    if (car == null) {
      return res.status(404).json({ message: 'Cannot find car' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.car = car;
  next();
}

module.exports = router;
