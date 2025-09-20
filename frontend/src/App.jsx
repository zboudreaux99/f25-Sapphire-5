import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';


const apiCall = () => {
  axios.get('http://localhost:8080').then((data) => {
    console.log(data)
  })
}

function App() {
  apiCall();  //Check the console to see that server responds.
  return (
    <>
    
    </>
  )
}

export default App
