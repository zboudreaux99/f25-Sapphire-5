const express = require('express');
const cors = require('cors');
const pool = require('./db'); // Import the database pool
const { listenForNotifications } = require('./services/notification-listener');
const { initializeTransporter } = require('./services/emailService');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware');
const roleMiddleware = require('./middleware/roleMiddleware');
const sensorRoutes = require('./routes/sensor');
const propertyRoutes = require('./routes/property');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth/', authRoutes);
app.use('/api/sensor/', sensorRoutes);
app.use('/api/property/', propertyRoutes);

app.get('/', (req, res) => {
    console.log("Hello");    
    res.send('Welcome to Sapphire sounds!');
})

// Example protected routes
app.get('/api/profile', authMiddleware, (req, res) => {
  res.json({ message: `Hello user ${req.user.id} (${req.user.role})` });
});

app.get('/api/tenant/dashboard', authMiddleware, roleMiddleware(['tenant']), (req, res) => {
  res.json({ message: 'Tenant dashboard' });
});

app.get('/api/manager/dashboard', authMiddleware, roleMiddleware(['manager', 'admin']), (req, res) => {
  res.json({ message: 'Manager dashboard' });
});

app.listen(8080, async () => {
    console.log('server listening on port 8080');
    //intialize emailService
    await initializeTransporter();
    //intialize notification listener
    listenForNotifications(pool);
});
