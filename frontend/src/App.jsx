import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap/dist/js/bootstrap.bundle.min";
import './App.css'

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Welcome from './Welcome';
import Tenant from './Tenant';
import PropertyManager from './PropertyManager';


const apiCall = () => {
  axios.get('http://localhost:8080').then((data) => {
    console.log(data)
  })
}
 
function App() {
  apiCall();  //Check the console to see that server responds.
  return (
    <>
    <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/welcome" replace />} />
          <Route path="/welcome" element={<Welcome/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/tenant" element={<Tenant/>} />
          <Route path="/property-manager" element={<PropertyManager/>} />
        </Routes>
      </Router>
    </>
  )
}

export default App
