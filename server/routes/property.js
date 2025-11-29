const express = require('express');
const pool = require('../db');
const router = express.Router();


/** POST /api/property  
 * Creates a new Property
 * Required fields: name, address001
 */
router.post('/', async (req, res) => {
    try {
        const data = req.body;
        const {name, address001, address002, city, state, zipcode, property_id} = data;
        if(name === undefined || address001 === undefined){
            return res.status(400).json({
                error: 'Missing required property fields: name, address001'
            });
        }
        let result;
        let message;
        if(property_id === undefined){
            result = await pool.query(
                `INSERT INTO Property (name, address001, address002, city, state, zipcode) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [name, address001, address002 ?? null, city ?? null, state ?? null, zipcode ?? null]
            );
            message = "Property created."
        } else {
            result = await pool.query(
                `UPDATE Property SET name = $1, address001 = $2, address002 = $3, city = $4, state = $5, zipcode = $6 WHERE property_id = $7 RETURNING *`,
                [name, address001, address002 ?? null, city ?? null, state ?? null, zipcode ?? null, property_id]
            );
            message = "Property updated."
        }
        const property = result.rows[0]
        res.status(201).json({
            message: message,
            property_id: property.property_id,
            name: property.name,
            address001: property.address001
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database query failed."});
    }  
});

/** GET /api/property
 * Retrieves property details from property_id
 * Required query parameters: property_id
 */
router.get('/', async (req, res) => {
    try {
        const {property_id} = req.query;
        if(property_id === undefined){
            return res.status(400).json({
                error: 'Missing required parameter: property_id'
            });
        }
        const result = await pool.query(`SELECT * FROM V_PropertyDetails WHERE property_id = $1`, [property_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database query failed."})
    }
});

/** GET /api/property/managers
 * Retrieves property managers
 * Required query parameters: property_id
 */
router.get('/managers', async (req, res) => {
    try {
        const {property_id} = req.query;
        if(property_id === undefined){
            return res.status(400).json({
                error: 'Missing required parameter: property_id'
            });
        }
        const result = await pool.query(`SELECT * FROM V_PropertyManagers WHERE property_id = $1`, [property_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database query failed."})
    }
})

/** GET /api/property/unit/units
 * Retrieves all units
 * Required query parameters: property_id
 */
router.get('/unit/units', async (req, res) => {
    try {
        const { property_id } = req.query;
        if (!property_id) {
            return res.status(400).json({ error: 'Missing required parameter: property_id' });
        }
        const result = await pool.query(
            `SELECT * FROM V_UnitDetails WHERE property_id = $1`,
            [property_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database query failed.' });
    }
});


/** POST /api/property/unit 
 * Creates or updates a Unit at the property_id provided
 * Required fields: name, property_id
 */
router.post('/unit', async (req, res) => {
    try {
        const data = req.body;
        const {name, property_id, unit_id} = data;
        if(name === undefined || property_id === undefined){
            return res.status(400).json({
                error: 'Missing required property fields: name, property_id'
            });
        }
        let result;
        let message;
        if(unit_id === undefined){
            result = await pool.query(
                `INSERT INTO UNIT (name, property_id) VALUES ($1, $2) RETURNING *`,
                [name, property_id]
            );
            message = "Unit created."
        }
        else {
            result = await pool.query(
                `UPDATE UNIT SET name = $1 WHERE unit_id = $2 RETURNING *`,
                [name, unit_id]
            );
            message = "Unit updated."
        }
        const unit = result.rows[0]
        res.status(201).json({
            message: message,
            unit_id: unit.unit_id,
            name: unit.name
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database query failed."});
    }  
});

/** GET /api/property/unit
 * Retrieves unit details
 * Required query parameters: unit_id
 */
router.get('/unit', async (req, res) => {
    try {
        const {unit_id} = req.query;
        if(unit_id === undefined){
            return res.status(400).json({
                error: 'Missing required parameter: unit_id'
            });
        }
        const result = await pool.query(`SELECT * FROM V_UnitDetails WHERE unit_id = $1`, [unit_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database query failed."})
    }
});

/** GET /api/property/unit/tenants
 * Retrieves all tenants for a property
 * Required query parameters: property_id
 */
router.get('/unit/tenants', async (req, res) => {
    try {
        const { property_id } = req.query;
        if (!property_id) {
            return res.status(400).json({
                error: 'Missing required parameter: property_id'
            });
        }

        const result = await pool.query(
            `SELECT * FROM V_TenantDetails WHERE property_id = $1`,
            [property_id]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database query failed." });
    }
});


/** POST /api/property/unit/tenant
 * Adds a tenant to a unit
 * Required fields: unit_id, user_id, name
 */
router.post('/unit/tenant', async (req, res) => {
    try {
        const data = req.body;
        const {user_id, unit_id, name} = data;
        if(user_id === undefined || unit_id === undefined || name === undefined){
            return res.status(400).json({
                error: 'Missing required property fields: user_id, unit_id, name'
            });
        }
        const result = await pool.query(
            `INSERT INTO TENANT (user_id, unit_id, name) VALUES ($1, $2, $3) RETURNING *`,
            [user_id, unit_id, name]
        );
        const tenant = result.rows[0]
        res.status(201).json({
            message: 'Tenant created.',
            unit_id: tenant.unit_id,
            tenant: tenant.tenant_id,
            name: tenant.name
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database query failed."});
    }  
});

/** POST /api/property/unit/tenant/remove
 * Removes a tenant from a unit
 * Required fields: tenant_id
 */
router.post('/unit/tenant/remove', async (req, res) => {
    try {
        const data = req.body;
        const {tenant_id} = data;
        if(tenant_id === undefined){
            return res.status(400).json({
                error: 'Missing required property fields: tenant_id'
            });
        }
        const result = await pool.query(
            `DELETE FROM TENANT WHERE tenant_id = $1 RETURNING *`,
            [tenant_id]
        );
        const tenant = result.rows[0];
        res.status(201).json({
            message: 'Tenant removed.',
            name: tenant.name,
            unit_id: tenant.unit_id
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database query failed."});
    }  
});

/** GET /api/property/unit/tenant
 * Retrieves tenant details for a unit
 * Required query parameters: unit_id
 */
router.get('/unit/tenant', async (req, res) => {
    try {
        const {unit_id} = req.query;
        if(unit_id === undefined){
            return res.status(400).json({
                error: 'Missing required parameter: unit_id'
            });
        }
        const result = await pool.query(`SELECT * FROM V_TenantDetails WHERE unit_id = $1`, [unit_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database query failed."})
    }
});

/** GET /api/property/unit/sensors
 * Retrieves all sensors details for a given unit
 * Required query parameters: unit_id
 */
router.get('/unit/sensors', async (req, res) => {
    try {
        const {unit_id} = req.query;
        if(unit_id === undefined){
            return res.status(400).json({
                error: 'Missing required parameter: unit_id'
            });
        }
        const result = await pool.query(`SELECT * FROM V_SensorDetails WHERE unit_id = $1`, [unit_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database query failed."})
    }
});

/** POST /api/property/rewards
 * Adds a tenant to a unit
 * Required fields: unit_id, user_id, name
 */
router.post('/rewards', async (req, res) => {
    try {
        const data = req.body;
        const {name, property_id, description} = data;
        if(name === undefined || property_id === undefined || description === undefined){
            return res.status(400).json({
                error: 'Missing required property fields: name, property_id, description'
            });
        }
        const result = await pool.query(
            `INSERT INTO REWARD (name, property_id, description) VALUES ($1, $2, $3) RETURNING *`,
            [name, property_id, description]
        );
        const reward = result.rows[0]
        res.status(201).json({
            message: 'Reward created.',
            reward_id: reward.reward_id,
            name: reward.name,
            description: reward.description,
            is_active: reward.is_active
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database query failed."});
    }  
});

/** GET /api/property/rewards
 * Retrieves rewards for a property
 * Required query parameters: property_id
 */
router.get('/rewards', async (req, res) => {
    try {
        const {property_id} = req.query;
        if(property_id === undefined){
            return res.status(400).json({
                error: 'Missing required parameter: property_id'
            });
        }
        const result = await pool.query(`SELECT * FROM V_RewardDetails WHERE property_id = $1`, [property_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database query failed."})
    }
});

/** POST /api/property/unit/rewards
 * Adds an association between unit and a reward
 * Required fields: unit_id, property_id, reward_id
 */
router.post('/unit/rewards', async (req, res) => {
    try {
        const data = req.body;
        const {unit_id, property_id, reward_id} = data;
        if(unit_id === undefined || property_id === undefined || reward_id === undefined){
            return res.status(400).json({
                error: 'Missing required property fields: unit, property_id, reward_id'
            });
        }
        const result = await pool.query(
            `INSERT INTO UNITREWARDS (unit_id, property_id, reward_id) VALUES ($1, $2, $3) RETURNING *`,
            [unit_id, property_id, reward_id]
        );
        res.status(201).json({
            message: 'Unit reward created.',
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database query failed."});
    }  
});

/** GET /api/property/unit/rewards
 * Retrieves rewards associated with a unit
 * Required query parameters: unit_id
 */
router.get('/unit/rewards', async (req, res) => {
    try {
        const {unit_id} = req.query;
        if(unit_id === undefined){
            return res.status(400).json({
                error: 'Missing required parameter: unit_id'
            });
        }
        const result = await pool.query(`SELECT * FROM V_UnitRewardsDetails WHERE unit_id = $1`, [unit_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database query failed."})
    }
});

/** POST /api/property/rule
 * Creates a noise rule
 * Required fields: property_id, description, threshold_db, start_time, end_time, days_of_week
 */
router.post('/rule', async (req, res) => {
    try {
        const data = req.body;
        const {property_id, description, threshold_db, start_time, end_time, days_of_week} = data;
        if(property_id === undefined || description === undefined, threshold_db === undefined || start_time === undefined, end_time === undefined || days_of_week === undefined){
            return res.status(400).json({
                error: 'Missing required property fields: {property_id, description, threshold_db, start_time, end_time, days_of_week'
            });
        }
        const result = await pool.query(
            `INSERT INTO NOISERULE (property_id, description, threshold_db, start_time, end_time, days_of_week) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [property_id, description, threshold_db, start_time, end_time, days_of_week]
        );
        const rule = result.rows[0]
        res.status(201).json({
            message: 'Rule created.',
            noise_rule_id: rule.noise_rule_id,
            property_id: rule.property_id,
            description: rule.description,
            threshold_db: rule.threshold_db,
            start_time: rule.start_time,
            end_time: rule.end_time,
            days_of_week: rule.days_of_week
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database query failed."});
    }  
});

/** GET /api/property/rule
 * Retrieves noise rules for the property
 * Required query parameters: property_id
 */
router.get('/rule', async (req, res) => {
    try {
        const {property_id} = req.query;
        if(property_id === undefined){
            return res.status(400).json({
                error: 'Missing required parameter: property_id'
            });
        }
        const result = await pool.query(`SELECT * FROM V_NoiseRuleDetails WHERE property_id = $1`, [property_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database query failed."})
    }
});

/** GET /api/property/complaints
 * Retrieves complaints for the property
 * Required query parameters: property_id
 */
router.get('/complaints', async (req, res) => {
    try {
        const {property_id} = req.query;
        if(property_id === undefined){
            return res.status(400).json({
                error: 'Missing required parameter: property_id'
            });
        }
        const result = await pool.query(`SELECT * FROM V_ComplaintDetails WHERE property_id = $1`, [property_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database query failed."})
    }
});

/** POST /api/property/complaints
 * Submits  a complaint
 * Required query parameters: initiating_tenant_id, complained_about_unit_id, description
 */
router.post('/complaints', async (req, res) => {
    try {
        const data = req.body;
        const {initiating_tenant_id, complained_about_unit_id, description} = data;
        if(initiating_tenant_id === undefined, complained_about_unit_id === undefined, description === undefined){
            return res.status(400).json({
                error: 'Missing required property fields: {initiating_tenant_id, complained_about_unit_id, description}'
            });
        }
        const result = await pool.query(
            `INSERT INTO COMPLAINT (initiating_tenant_id, complained_about_unit_id, description) VALUES ($1, $2, $3) RETURNING *`,
            [initiating_tenant_id, complained_about_unit_id, description]
        );
        const complaint = result.rows[0]
        res.status(201).json({
            message: 'Complaint created.',
            complaint_id: complaint.complaint_id,
            description: complaint.description,
            initiating_tenant_id: complaint.initiating_tenant_id,
            complained_about_unit_id: complaint.complained_about_unit_id,
            status: complaint.status

        });
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database query failed."});
    }  
});


/** POST /api/property/complaints
 * Updates complaint status
 * Required query parameters: complaint_id, status
 */
router.post('/complaints/update', async (req, res) => {
    try {
        const data = req.body;
        const {complaint_id, status} = data;
        const statuses = ['open', 'in_progress', 'resolved'];
        if(complaint_id === undefined, status === undefined){
            return res.status(400).json({
                error: 'Missing required property fields: {complaint_id, status}'
            });
        }
        if(!statuses.includes(status)){
            return res.status(400).json({
                error: 'Status must be one of either open, in_progress or resolved.'
            });
        }
        const result = await pool.query(
             `UPDATE COMPLAINT SET status = $1 WHERE complaint_id = $2 RETURNING *`,
                [status, complaint_id]
        );
        const complaint = result.rows[0]
        res.status(201).json({
            message: 'Status updated.',
            complaint_id: complaint.complaint_id,
            description: complaint.description,
            initiating_tenant_id: complaint.initiating_tenant_id,
            complained_about_unit_id: complaint.complained_about_unit_id,
            status: complaint.status

        });
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database query failed."});
    }  
});

module.exports = router;
