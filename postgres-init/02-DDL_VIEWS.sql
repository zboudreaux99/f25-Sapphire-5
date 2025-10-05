-- ===============================================
-- DDL VIEWS for Sapphire Sounds DB
-- This script will be executed when the database is first created.
-- ===============================================

CREATE VIEW V_SensorReadingsDetails AS
SELECT
    sr.ReadingTimestamp,
    sr.dB,
    s.SensorId,
    s.Location AS SensorLocation,
    u.UnitId,
    u.Name AS UnitName,
    p.PropertyId,
    p.Name AS PropertyName
FROM
    SensorReading sr
JOIN Sensor s ON sr.SensorId = s.SensorId
JOIN Unit u ON s.UnitId = u.UnitId
JOIN Property p ON u.PropertyId = p.PropertyId;

CREATE VIEW V_TenantDetails AS
SELECT
    t.TenantId,
    t.Name AS TenantName,
    u.UnitId,
    u.Name AS UnitName,
    p.PropertyId,
    p.Name AS PropertyName,
    COUNT(DISTINCT c.ComplaintId) AS ComplaintsInitiated
FROM
    Tenant t
LEFT JOIN Unit u ON t.UnitId = u.UnitId
LEFT JOIN Property p ON u.PropertyId = p.PropertyId
LEFT JOIN Complaint c ON t.TenantId = c.InitiatingTenantId
GROUP BY
    t.TenantId, t.Name, u.UnitId, u.Name, p.PropertyId, p.Name;

CREATE VIEW V_PropertyDetails AS
SELECT
    p.PropertyId,
    p.Name AS PropertyName,
    p.Address001,
    p.Address002,
    p.City,
    p.State,
    p.Zipcode,
    COUNT(DISTINCT u.UnitId) AS UnitCount,
    COUNT(DISTINCT t.TenantId) AS TenantCount,
    COUNT(DISTINCT c.ComplaintId) AS ComplaintCount,
    COUNT(DISTINCT r.RewardId) AS RewardCount
FROM
    Property p
LEFT JOIN Unit u ON p.PropertyId = u.PropertyId
LEFT JOIN Tenant t ON u.UnitId = t.UnitId
LEFT JOIN Complaint c ON u.UnitId = c.ComplainedAboutUnitId
LEFT JOIN Reward r ON p.PropertyId = r.PropertyId
GROUP BY
    p.PropertyId, p.Name, p.Address001, p.Address002, p.City, p.State, p.Zipcode;

CREATE VIEW V_UnitDetails AS
SELECT
    u.UnitId,
    u.Name AS UnitName,
    p.PropertyId,
    p.Name AS PropertyName,
    COUNT(DISTINCT t.TenantId) AS TenantCount,
    COUNT(DISTINCT ci.ComplaintId) AS Complaints_initiatied,
    COUNT(DISTINCT cr.ComplaintId) AS Complaints_received,
    COUNT(DISTINCT s.SensorId) AS SensorCount,
    COUNT(DISTINCT r.RewardId) AS RewardCount
FROM
    Unit u
JOIN Property p ON u.PropertyId = p.PropertyId
LEFT JOIN Tenant t ON u.UnitId = t.UnitId
LEFT JOIN Complaint ci ON u.UnitId = ci.InitiatingTenantId
LEFT JOIN Complaint cr ON u.UnitId = cr.ComplainedAboutUnitId
LEFT JOIN Sensor s ON u.UnitId = s.UnitId
LEFT JOIN UnitRewards ur ON u.UnitId = ur.UnitId
LEFT JOIN Reward r ON ur.RewardId = r.RewardId
GROUP BY
    u.UnitId, u.Name, p.PropertyId, p.Name;


CREATE VIEW V_SensorDetails AS
SELECT
    s.SensorId,
    s.UnitId,
    s.Location AS SensorLocation,
    h.LastCheckInTimestamp,
    p.PropertyId,
    p.Name AS PropertyName,
    u.Name AS UnitName,
    CASE
        WHEN h.LastCheckInTimestamp IS NULL THEN 'NEVER_REPORTED'
        WHEN h.LastCheckInTimestamp > NOW() - INTERVAL '10 minutes' THEN 'ONLINE'
        ELSE 'OFFLINE'
    END AS CurrentStatus,
    NOW() - h.LastCheckInTimestamp AS TimeSinceLastCheckIn
FROM
    Sensor s
JOIN SensorHeartbeat h ON s.SensorId = h.SensorId
JOIN Unit u ON s.UnitId = u.UnitId
JOIN Property p ON u.PropertyId = p.PropertyId;

CREATE VIEW V_RewardDetails AS
SELECT
    r.RewardId,
    r.Name AS RewardName,
    r.Description AS RewardDescription,
    p.PropertyId,
    p.Name AS PropertyName,
    COUNT(DISTINCT u.UnitId) AS UnitCount
FROM
    Reward r
JOIN Property p ON r.PropertyId = p.PropertyId
LEFT JOIN UnitRewards ur ON r.RewardId = ur.RewardId
LEFT JOIN Unit u ON ur.UnitId = u.UnitId
GROUP BY
    r.RewardId, r.Name, r.Description, p.PropertyId, p.Name;





