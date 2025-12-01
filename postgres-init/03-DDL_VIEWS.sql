-- ===============================================
-- DDL VIEWS for Sapphire Sounds DB
-- This script will be executed when the database is first created.
-- ===============================================

CREATE VIEW V_SensorReadingsDetails AS
SELECT
    sr.reading_timestamp,
    sr.db,
    s.sensor_id,
    s.location AS sensor_location,
    u.unit_id,
    u.name AS unit_name,
    p.property_id,
    p.name AS property_name
FROM
    SensorReading sr
JOIN Sensor s ON sr.sensor_id = s.sensor_id
JOIN Unit u ON s.unit_id = u.unit_id
JOIN Property p ON u.property_id = p.property_id;

COMMENT ON VIEW V_SensorReadingsDetails IS 'Provides a denormalized view of sensor readings, joining them with sensor, unit, and property information for easy querying and analysis.';

CREATE VIEW V_TenantDetails AS
SELECT
    t.tenant_id,
    t.user_id,
    t.name AS tenant_name,
    u.unit_id,
    u.name AS unit_name,
    p.property_id,
    p.name AS property_name,
    COUNT(DISTINCT c.complaint_id) AS complaints_initiated
FROM
    Tenant t
LEFT JOIN Unit u ON t.unit_id = u.unit_id
LEFT JOIN Property p ON u.property_id = p.property_id
LEFT JOIN Complaint c ON t.tenant_id = c.initiating_tenant_id
GROUP BY
    t.tenant_id, t.name, u.unit_id, u.name, p.property_id, p.name;

COMMENT ON VIEW V_TenantDetails IS 'Aggregates tenant information with their assigned unit, property, and a count of complaints they have initiated.';

CREATE VIEW V_PropertyDetails AS
SELECT
    p.property_id,
    p.name AS property_name,
    p.address001,
    p.address002,
    p.city,
    p.state,
    p.zipcode,
    COUNT(DISTINCT u.unit_id) AS unit_count,
    COUNT(DISTINCT t.tenant_id) AS tenant_count,
    COUNT(DISTINCT c.complaint_id) AS complaint_count,
    COUNT(DISTINCT r.reward_id) AS reward_count
FROM
    Property p
LEFT JOIN Unit u ON p.property_id = u.property_id
LEFT JOIN Tenant t ON u.unit_id = t.unit_id
LEFT JOIN Complaint c ON u.unit_id = c.complained_about_unit_id
LEFT JOIN Reward r ON p.property_id = r.property_id
GROUP BY
    p.property_id, p.name, p.address001, p.address002, p.city, p.state, p.zipcode;

COMMENT ON VIEW V_PropertyDetails IS 'Presents a summary for each property, including its address and counts of associated units, tenants, complaints, and rewards.';

CREATE VIEW V_UnitDetails AS
SELECT
    u.unit_id,
    u.name AS unit_name,
    p.property_id,
    p.name AS property_name,
    COUNT(DISTINCT t.tenant_id) AS tenant_count,
    COUNT(DISTINCT ci.complaint_id) AS complaints_initiated,
    COUNT(DISTINCT cr.complaint_id) AS complaints_received,
    COUNT(DISTINCT s.sensor_id) AS sensor_count,
    COUNT(DISTINCT ur.reward_id) AS reward_count
FROM
    Unit u
JOIN Property p ON u.property_id = p.property_id
LEFT JOIN Tenant t ON u.unit_id = t.unit_id
LEFT JOIN Complaint ci ON t.tenant_id = ci.initiating_tenant_id
LEFT JOIN Complaint cr ON u.unit_id = cr.complained_about_unit_id
LEFT JOIN Sensor s ON u.unit_id = s.unit_id
LEFT JOIN UnitRewards ur ON u.unit_id = ur.unit_id
GROUP BY
    u.unit_id, u.name, p.property_id, p.name;

COMMENT ON VIEW V_UnitDetails IS 'Summarizes key metrics for each unit, such as tenant count, sensor count, rewards received, and complaints initiated vs. received.';


CREATE VIEW V_SensorDetails AS
SELECT
    s.sensor_id,
    s.unit_id,
    s.location AS sensor_location,
    h.last_check_in_timestamp,
    p.property_id,
    p.name AS property_name,
    u.name AS unit_name,
    CASE
        WHEN h.last_check_in_timestamp IS NULL THEN 'NEVER_REPORTED'
        WHEN h.last_check_in_timestamp > NOW() - INTERVAL '10 minutes' THEN 'ONLINE'
        ELSE 'OFFLINE'
    END AS current_status,
    NOW() - h.last_check_in_timestamp AS time_since_last_check_in
FROM
    Sensor s
LEFT JOIN SensorHeartbeat h ON s.sensor_id = h.sensor_id
JOIN Unit u ON s.unit_id = u.unit_id
JOIN Property p ON u.property_id = p.property_id;

COMMENT ON VIEW V_SensorDetails IS 'Displays detailed information for each sensor, including its location, associated unit/property, and its current connectivity status (ONLINE/OFFLINE) based on heartbeat data.';

CREATE VIEW V_RewardDetails AS
SELECT
    r.reward_id,
    r.name AS reward_name,
    r.description AS reward_description,
    p.property_id,
    p.name AS property_name,
    COUNT(DISTINCT u.unit_id) AS unit_count
FROM
    Reward r
JOIN Property p ON r.property_id = p.property_id
LEFT JOIN UnitRewards ur ON r.reward_id = ur.reward_id
LEFT JOIN Unit u ON ur.unit_id = u.unit_id
GROUP BY
    r.reward_id, r.name, r.description, p.property_id, p.name;

COMMENT ON VIEW V_RewardDetails IS 'Lists all available rewards, their descriptions, associated properties, and a count of how many units have earned each reward.';

CREATE VIEW V_PropertyManagers AS
SELECT
    p.property_id,
    p.name AS property_name,
    m.manager_id,
    m.name AS manager_name
FROM
    Property p
JOIN 
    PropertyManagers pm ON p.property_id = pm.property_id
JOIN
    Manager m ON pm.manager_id = m.manager_id;

COMMENT ON VIEW V_PropertyManagers IS 'A simple join view to easily see which managers are assigned to which properties.';

CREATE VIEW V_ComplaintDetails AS
SELECT
    c.complaint_id,
    c.complaint_timestamp,
    c.description,
    c.status,
    ti.tenant_id AS initiating_tenant_id,
    ti.name AS initiating_tenant_name,
    cau.unit_id AS complained_about_unit_id,
    cau.name AS complained_about_unit_name,
    p.property_id,
    p.name AS property_name
FROM
    Complaint c
LEFT JOIN Tenant ti ON c.initiating_tenant_id = ti.tenant_id
LEFT JOIN Unit cau ON c.complained_about_unit_id = cau.unit_id
LEFT JOIN Property p ON cau.property_id = p.property_id;

COMMENT ON VIEW V_ComplaintDetails IS 'Provides a comprehensive look at each complaint, linking it to the initiating tenant, the complained-about unit, and the relevant property.';

CREATE VIEW V_NoiseRuleDetails AS
SELECT
    nr.noise_rule_id,
    nr.property_id,
    p.name AS property_name,
    nr.description,
    nr.threshold_db,
    nr.start_time,
    nr.end_time,
    nr.days_of_week
FROM
    NoiseRule nr
JOIN Property p ON nr.property_id = p.property_id;

COMMENT ON VIEW V_NoiseRuleDetails IS 'Displays noise rule definitions along with the name of the property to which they apply.';

CREATE OR REPLACE VIEW V_UnitRewardsDetails AS
SELECT
    ur.unit_reward_id,
    ur.unit_id,
    u.name AS unit_name,
    ur.reward_id,
    r.name AS reward_name,
    r.description AS reward_description,
    ur.date_granted,
    ur.date_redeemed,
    (ur.date_redeemed IS NULL) AS is_available,
    p.property_id,
    p.name AS property_name
FROM
    UnitRewards ur
JOIN Unit u ON ur.unit_id = u.unit_id
JOIN Reward r ON ur.reward_id = r.reward_id
JOIN Property p ON u.property_id = p.property_id;

COMMENT ON VIEW V_UnitRewardsDetails IS 'Details every reward granted to a unit, including reward information, grant/redeem dates, and availability status.';