// frontend/src/components/CarList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const CarList = () => {
  const [cars, setCars] = useState([]);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const res = await axios.get('/api/cars');
      setCars(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Car List</h2>
      <Link to="/add">Add New Car</Link>
      <ul>
        {cars.map((car) => (
          <li key={car._id}>
            <Link to={`/cars/${car._id}`}>{car.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CarList;
