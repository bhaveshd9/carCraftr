// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import AddCar from './components/AddCar';
import CarList from './components/CarList';
import CarDetail from './components/CarDetail';
import EditCar from './components/EditCar';

const App = () => {
  return (
    <Router>
      <div>
        <h1>CarCraftr</h1>
        <nav>
          <Link to="/">Car List</Link>
          <Link to="/add">Add New Car</Link>
        </nav>
        <Routes>
          <Route path="/" element={<CarList />} />
          <Route path="/add" element={<AddCar />} />
          <Route path="/cars/:id" element={<CarDetail />} />
          <Route path="/edit/:id" element={<EditCar />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

