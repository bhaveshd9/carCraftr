// frontend/src/components/AddCar.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Use useNavigate instead of useHistory

const AddCar = () => {
  const navigate = useNavigate(); // Replace useHistory with useNavigate
  const [car, setCar] = useState({
    name: '',
    price: '',
    fuelEfficiency: '',
    enginePower: '',
    safetyRating: '',
    imageUrl: '',
    upcoming: false,
    deals: {
      discount: '',
      offerValidTill: '',
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name in car.deals) {
      setCar({
        ...car,
        deals: {
          ...car.deals,
          [name]: value,
        },
      });
    } else if (type === 'checkbox') {
      setCar({ ...car, [name]: checked });
    } else {
      setCar({ ...car, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/cars', car);
      navigate('/'); // Use navigate instead of history.push
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Add New Car</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Car Name"
          value={car.name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={car.price}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="fuelEfficiency"
          placeholder="Fuel Efficiency (MPG)"
          value={car.fuelEfficiency}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="enginePower"
          placeholder="Engine Power (HP)"
          value={car.enginePower}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="safetyRating"
          placeholder="Safety Rating (1-5)"
          value={car.safetyRating}
          onChange={handleChange}
          required
          min="1"
          max="5"
        />
        <input
          type="text"
          name="imageUrl"
          placeholder="Image URL"
          value={car.imageUrl}
          onChange={handleChange}
        />
        <label>
          Upcoming:
          <input
            type="checkbox"
            name="upcoming"
            checked={car.upcoming}
            onChange={handleChange}
          />
        </label>
        <h4>Deals</h4>
        <input
          type="number"
          name="discount"
          placeholder="Discount (%)"
          value={car.deals.discount}
          onChange={handleChange}
        />
        <input
          type="date"
          name="offerValidTill"
          placeholder="Offer Valid Till"
          value={car.deals.offerValidTill}
          onChange={handleChange}
        />
        <button type="submit">Add Car</button>
      </form>
    </div>
  );
};

export default AddCar;

