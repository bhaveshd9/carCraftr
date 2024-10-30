import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './CarSpecs.css'; // Ensure you add relevant styles

const CarSpecs = () => {
  const { id } = useParams(); // Get the car ID from the URL
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/cars/${id}`);
        setCar(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch car details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!car) return <p>Car not found.</p>;

  return (
    <div className="car-specs-container">
      <h1>{car.make} {car.model} ({car.year})</h1>
      <img src={car.imageUrl} alt={`${car.make} ${car.model}`} className="car-specs-image" />
      <div className="specifications">
        <h9>Specifications:</h9>
        <p><strong>Base Engine:</strong> {car.specifications.engine}</p>
        <p><strong>Horsepower:</strong> {car.specifications.horsepower} hp</p>
        <p><strong>Torque:</strong> {car.specifications.torque} lb-ft</p>
        <p><strong>Transmission:</strong> {car.specifications.transmission}</p>
        <p><strong>Fuel Type:</strong> {car.specifications.fuelType}</p>
        <p><strong>MPG (City/Highway):</strong> {car.specifications.mpg.city}/{car.specifications.mpg.highway}</p>
        <p><strong>Dimensions (L x W x H):</strong> {car.specifications.dimensions.length} x {car.specifications.dimensions.width} x {car.specifications.dimensions.height} inches</p>
        <p><strong>Starting Price:</strong> ${car.specifications.price}</p>
      </div>
    </div>
  );
};

export default CarSpecs;
