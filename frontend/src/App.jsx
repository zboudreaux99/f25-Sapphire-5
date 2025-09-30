import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap/dist/js/bootstrap.bundle.min";

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';


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
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login/>} />
        </Routes>
      </Router>
    </>
  )
}

export default App
