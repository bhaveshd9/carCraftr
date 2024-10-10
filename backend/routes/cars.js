// backend/routes/cars.js
const express = require('express');
const router = express.Router();
const Car = require('../models/car');

// @route GET /api/cars
// @desc Get all cars
router.get('/', async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/cars/:id
// @desc Get a single car
router.get('/:id', getCar, (req, res) => {
  res.json(res.car);
});

// @route POST /api/cars
// @desc Create a new car
router.post('/', async (req, res) => {
  const car = new Car({
    name: req.body.name,
    price: req.body.price,
    fuelEfficiency: req.body.fuelEfficiency,
    enginePower: req.body.enginePower,
    safetyRating: req.body.safetyRating,
    imageUrl: req.body.imageUrl,
    upcoming: req.body.upcoming,
    deals: req.body.deals,
  });

  try {
    const newCar = await car.save();
    res.status(201).json(newCar);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route PUT /api/cars/:id
// @desc Update a car
router.put('/:id', getCar, async (req, res) => {
  if (req.body.name != null) {
    res.car.name = req.body.name;
  }
  if (req.body.price != null) {
    res.car.price = req.body.price;
  }
  if (req.body.fuelEfficiency != null) {
    res.car.fuelEfficiency = req.body.fuelEfficiency;
  }
  if (req.body.enginePower != null) {
    res.car.enginePower = req.body.enginePower;
  }
  if (req.body.safetyRating != null) {
    res.car.safetyRating = req.body.safetyRating;
  }
  if (req.body.imageUrl != null) {
    res.car.imageUrl = req.body.imageUrl;
  }
  if (req.body.upcoming != null) {
    res.car.upcoming = req.body.upcoming;
  }
  if (req.body.deals != null) {
    res.car.deals = req.body.deals;
  }

  try {
    const updatedCar = await res.car.save();
    res.json(updatedCar);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route DELETE /api/cars/:id
// @desc Delete a car
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
