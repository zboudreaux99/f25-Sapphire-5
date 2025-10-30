const express = require('express');
const pool = require('../db');
const router = express.Router();


//Routes for the simulator
//POST /api/sensor/reading
router.post('/reading', async (req, res) => {
    try {
        const data = req.body;
        const {sensorId, db, timestamp} = data;
        const result = await pool.query(
            `INSERT INTO SensorReading (sensor_id, db, reading_timestamp) VALUES ($1, $2, $3) RETURNING *`,
            [sensorId, db, timestamp]
        );
        const reading = result.rows[0]
        res.status(201).json({
            message: 'Reading logged to database.',
            sensor_id: reading.sensor_id,
            db: reading.db,
            timestamp: reading.reading_timestamp
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Database query failed.'});
    }  

});

//POST /api/sensor/heartbeat
router.post('/heartbeat', async (req, res) => {
    try {
        const data = req.body;
        const {sensorId, connectivityStatus, timestamp} = data;
        const result = await pool.query(
            `INSERT INTO SensorHeartbeat (sensor_id, last_check_in_timestamp, connectivity_status) VALUES ($1, $2, $3)
             ON CONFLICT (sensor_id) 
             DO UPDATE SET 
             last_check_in_timestamp = EXCLUDED.last_check_in_timestamp, 
             connectivity_status = EXCLUDED.connectivity_status
             RETURNING *`,
            [sensorId, timestamp, connectivityStatus]
        );
        const heartbeat = result.rows[0]
        res.status(201).json({
            message: 'Heartbeat updated.',
            connectivity_status: heartbeat.connectivity_status,
            sensor_id: heartbeat.sensor_id,
            last_check_in_timestamp: heartbeat.last_check_in_timestamp
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Database query failed.'});
    }   
});

//GET /api/sensor/get-sensors
router.get('/get-sensors', async (req, res) => {
    try {
        const result = await pool.query(`SELECT sensor_id FROM Sensor`);
        const sensors = result.rows;
        const sensorIds = sensors.map(sensor => sensor.sensor_id);
        res.json(sensorIds);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Database query failed.'});
    }
});

//Routes for front end
//GET /api/sensor/get-sensor-data
router.get('/get-sensor-data', async (req, res) => {
    // console.log("Fetching sensor data.")
    try {
        const {sensor_id, start_time, end_time} = req.query;
        if (!sensor_id || !start_time || !end_time) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        const result = await pool.query(`SELECT * FROM SensorReading WHERE sensor_id = $1 AND reading_timestamp BETWEEN $2 AND $3 ORDER BY reading_timestamp`, 
            [sensor_id, start_time, end_time]);
        data = result.rows
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Database query failed.'})
    }

});

/**
 * POST /api/sensor
 * Creates a new sensor
 * Required fields: unit_id
 */
router.post('/', async (req, res) => {
    try {
        const data = req.body;
        const {unit_id, location} = data;
        if(unit_id === undefined){
            return res.status(400).json({
                error: 'Missing required property fields: unit_id'
            });
        }
        const result = await pool.query(
            `INSERT INTO Sensor (unit_id, location) VALUES ($1, $2) RETURNING *`,
            [unit_id, location ?? null]
        );
        const sensor = result.rows[0]
        res.status(201).json({
            message: 'Sensor created.',
            unit_id: sensor.unit_id,
            sensor_id: sensor.sensor_id
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database query failed."});
    }  
});

/** GET /api/sensor
 * Retrieves sensor details
 * Required query parameters: unit_id
 */
router.get('/', async (req, res) => {
    try {
        const {sensor_id} = req.query;
        if(sensor_id === undefined){
            return res.status(400).json({
                error: 'Missing required parameter: sensor_id'
            });
        }
        const result = await pool.query(`SELECT * FROM V_SensorDetails WHERE sensor_id = $1`, [sensor_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database query failed."})
    }
});

/** GET /api/sensor
 * Retrieves sensor details
 * Required query parameters: unit_id
 */
router.get('/', async (req, res) => {
    try {
        const {sensor_id} = req.query;
        if(sensor_id === undefined){
            return res.status(400).json({
                error: 'Missing required parameter: sensor_id'
            });
        }
        const result = await pool.query(`SELECT * FROM V_SensorDetails WHERE sensor_id = $1`, [sensor_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database query failed."})
    }
});

module.exports = router;
