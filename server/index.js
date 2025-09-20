const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors())

app.get('/', (req, res) => {
    console.log("Hello")    
    res.send('Welcome to Sapphire sounds!')
})


app.listen(8080, () => {
    console.log('server listening on port 8080')
})
