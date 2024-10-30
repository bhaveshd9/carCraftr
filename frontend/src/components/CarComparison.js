import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CarComparison = () => {
  const [cars, setCars] = useState([]);
  const [selectedCars, setSelectedCars] = useState([]);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/cars');
      setCars(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelect = (car) => {
    if (selectedCars.find((c) => c._id === car._id)) {
      setSelectedCars(selectedCars.filter((c) => c._id !== car._id));
    } else {
      if (selectedCars.length < 3) { // Limit to 3 comparisons
        setSelectedCars([...selectedCars, car]);
      } else {
        alert('You can only compare up to 3 cars.');
      }
    }
  };

  return (
    <div>
      <h2>Compare Cars</h2>
      <div className="car-list">
        {cars.map((car) => (
          <div key={car._id}>
            <input
              type="checkbox"
              onChange={() => handleSelect(car)}
              checked={selectedCars.find((c) => c._id === car._id)}
            />
            {car.make} {car.model} ({car.year})
          </div>
        ))}
      </div>

      {selectedCars.length > 0 && (
        <div className="comparison-table">
          <h3>Comparison</h3>
          <table border="1">
            <thead>
              <tr>
                <th>Specification</th>
                {selectedCars.map((car) => (
                  <th key={car._id}>{car.make} {car.model}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Engine</td>
                {selectedCars.map((car) => (
                  <td key={car._id}>{car.specifications.engine}</td>
                ))}
              </tr>
              <tr>
                <td>Horsepower</td>
                {selectedCars.map((car) => (
                  <td key={car._id}>{car.specifications.horsepower} hp</td>
                ))}
              </tr>
              <tr>
                <td>Transmission</td>
                {selectedCars.map((car) => (
                  <td key={car._id}>{car.specifications.transmission}</td>
                ))}
              </tr>
              <tr>
                <td>Fuel Type</td>
                {selectedCars.map((car) => (
                  <td key={car._id}>{car.specifications.fuelType}</td>
                ))}
              </tr>
              <tr>
                <td>Price</td>
                {selectedCars.map((car) => (
                  <td key={car._id}>${car.specifications.price}</td>
                ))}
              </tr>
              <tr>
              <td>Transmission</td>
                {selectedCars.map((car) => (
                  <td key={car._id}>{car.specifications.transmission}</td>
                ))}
              </tr>
              <tr>
                <td>Fuel Type</td>
                {selectedCars.map((car) => (
                  <td key={car._id}>{car.specifications.fuelType}</td>
                ))}
              </tr>
              <tr>
                <td>Price</td>
                {selectedCars.map((car) => (
                  <td key={car._id}>${car.specifications.price}</td>
                ))}
              </tr>
              {/* Add more specifications as needed */}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CarComparison;
