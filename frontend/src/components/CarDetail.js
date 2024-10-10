// frontend/src/components/CarDetail.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Use useNavigate instead of useHistory
  const [car, setCar] = useState(null);

  useEffect(() => {
    const fetchCar = async () => { // Define fetchCar inside useEffect
      try {
        const res = await axios.get(`http://localhost:5000/api/cars/${id}`);
        setCar(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchCar(); // Call fetchCar inside useEffect
    // eslint-disable-next-line
  }, [id]); // Only need 'id' in the dependency array

  const deleteCar = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/cars/${id}`);
      navigate('/'); // Use navigate instead of history.push
    } catch (err) {
      console.error(err);
    }
  };

  if (!car) return <div>Loading...</div>;

  return (
    <div>
      <h2>{car.name}</h2>
      <img src={car.imageUrl} alt={car.name} width="300" />
      <p>Price: ${car.price}</p>
      <p>Fuel Efficiency: {car.fuelEfficiency} MPG</p>
      <p>Engine Power: {car.enginePower} HP</p>
      <p>Safety Rating: {car.safetyRating}/5</p>
      {car.deals && (
        <div>
          <h4>Current Deals</h4>
          <p>Discount: {car.deals.discount}%</p>
          <p>Offer Valid Till: {new Date(car.deals.offerValidTill).toDateString()}</p>
        </div>
      )}
      <Link to={`/edit/${car._id}`}>Edit</Link>
      <button onClick={deleteCar}>Delete</button>
      <br />
      <Link to="/">Back to Car List</Link>
    </div>
  );
};

export default CarDetail;


