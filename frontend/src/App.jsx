import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap/dist/js/bootstrap.bundle.min";
import './App.css'

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Welcome from './Welcome';
import Tenant from './Tenant';
import PropertyManager from './PropertyManager';
import LoudNoise from './LoudNoise';


// Example API call to retrieve sensor data.
const apiCall = () => {
  axios.get('http://localhost:8080/api/sensor/get-sensor-data?sensor_id=1&start_time=2025-10-01T00:00:00Z&end_time=2025-12-31T12:00:00Z').then((data) => {
    console.log(data)
  })
}

/**
 * Renders a customizable button component.
 * Redirects an empty path to /welcome -> login -> tenant or property-manager -> button.
 * @returns {Router} Configures an element to render when a pattern matches the current location.
 */
function App() {
  apiCall(); // Check the console to see that server responds.
  return (
    <>
    <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/welcome" replace />} />
          <Route path="/welcome" element={<Welcome/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/tenant" element={<Tenant/>} />
          <Route path="/property-manager" element={<PropertyManager/>} />
          <Route path="/button" element={<LoudNoise/>} />
        </Routes>
      </Router>
    </>
  )
}

export default App
