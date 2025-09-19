import axios from 'axios';
import logo from './SS-logo.jpg';
import './App.css';

const apiCall = () => {
  axios.get('http://localhost:8080').then((data) => {
    console.log(data)
  })
}


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

      </header>
      <body className="App-body">
        <button onClick={apiCall}>Make API Call</button>
      </body>
    </div>
  );
}

export default App;
