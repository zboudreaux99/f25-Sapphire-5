-- ===============================================
-- DML Script for Sapphire Sounds DB
-- This script will be executed after the schema is created.
-- ===============================================


-- used bcrypt with cost factor 10
-- admin user:admin@sapphire.com password: admin 
-- manager password: manager
-- tenant password: tenant
INSERT INTO Users (Email, PasswordHash, Role) VALUES
('admin@sapphire.com', '$2a$10$ichrhI/KPhAwBuzitTCyFuUOOXqdhjnmFWzoqrZRHDaxkI/BrmzkC', 'admin'),
('johndoe@example.com', '$2a$10$CBpe7tl6GK1vdnCBTpDazOoiU0Yf9Pd2uqBlVn6z/uZVCE4XmyCoK', 'manager'),
('alice@example.com', '$2a$10$Py.BXLT4fh1DDW7/.kzhJe6f.HAzcl5ogyHiYcE/2b9qI0BuA4rQi', 'tenant'),
('janesmith@example.com', '$2a$10$CBpe7tl6GK1vdnCBTpDazOoiU0Yf9Pd2uqBlVn6z/uZVCE4XmyCoK', 'manager'),
('karen@example.com', '$2a$10$Py.BXLT4fh1DDW7/.kzhJe6f.HAzcl5ogyHiYcE/2b9qI0BuA4rQi', 'tenant'),
('kyle@example.com', '$2a$10$Py.BXLT4fh1DDW7/.kzhJe6f.HAzcl5ogyHiYcE/2b9qI0BuA4rQi', 'tenant'),
('warren@example.com', '$2a$10$Py.BXLT4fh1DDW7/.kzhJe6f.HAzcl5ogyHiYcE/2b9qI0BuA4rQi', 'tenant');

INSERT INTO Property (Name, Address001, City, State, Zipcode) VALUES
('The Grand Apartments', '123 Luxury Lane', 'Metropolis', 'NY', '10001'),
('Oakwood Residences', '456 Suburb Street', 'Smallville', 'KS', '66002');


INSERT INTO Manager (Name, Address, City, State, Zipcode, UserId) VALUES
('John Doe', '10 Manager Way', 'Metropolis', 'NY', '10001', 2),
('Jane Smith', '20 Admin Ave', 'Smallville', 'KS', '66002', 4);


INSERT INTO PropertyManagers (PropertyId, ManagerId) VALUES
(1, 1), 
(2, 2); 

INSERT INTO Unit (Name, PropertyId) VALUES
('Apt 101', 1),
('Apt 102', 1),
('Unit A', 2),
('Unit B', 2);

INSERT INTO Tenant (Name, UnitId, UserId) VALUES
('Alice Wonder', 1, 3),
('Karen Noseybody', 2, 5),
('Kyle Boomerbro', 3, 6),
('Warren Golfhiemer', 4, 7);

INSERT INTO Sensor (Location, UnitId) VALUES
('Living Room', 1),
('Kitchen', 1),
('Living Room', 2),
('Kitchen', 2),
('Living Room', 3),
('Kitchen', 3),
('Living Room', 4),
('Kitchen', 4);

INSERT INTO SensorReading (dB, ReadingTimestamp, SensorId) 
SELECT
    (70 + (random() * 10))::int AS dB,
    NOW() - (random() * INTERVAL '1 year') AS ReadingTimestamp,
    (1 + floor(random() * 2))::int AS SensorId
FROM
    generate_series(1, 10000);

INSERT INTO SensorReading (dB, ReadingTimestamp, SensorId) 
SELECT
    (70 + (random() * 60))::int AS dB,
    NOW() - (random() * INTERVAL '1 year') AS ReadingTimestamp,
    (3 + floor(random() * 2))::int AS SensorId
FROM
    generate_series(1, 10000);

INSERT INTO SensorReading (dB, ReadingTimestamp, SensorId) 
SELECT
    (70 + (random() * 40))::int AS dB,
    NOW() - (random() * INTERVAL '1 year') AS ReadingTimestamp,
    (5 + floor(random() * 2))::int AS SensorId
FROM
    generate_series(1, 10000);

INSERT INTO SensorReading (dB, ReadingTimestamp, SensorId) 
SELECT
    (70 + (random() * 10))::int AS dB,
    NOW() - (random() * INTERVAL '1 year') AS ReadingTimestamp,
    (6 + floor(random() * 2))::int AS SensorId
FROM
    generate_series(1, 10000);

INSERT INTO SensorHeartbeat (SensorId, LastCheckInTimestamp, ConnectivityStatus)
SELECT
    s.SensorId,
    NOW(),
    'OK'
FROM Sensor s;

INSERT INTO Reward (Name, Description, PropertyId) VALUES
('Quiet Neighbor Discount', '10% off next month''s rent for maintaining low noise levels.', 1);

INSERT INTO UnitRewards (UnitId, RewardId) VALUES
(1, 1);

INSERT INTO Complaint (InitiatingTenantId, ComplainedAboutUnitId, Description, Status) VALUES
(2, 1, 'Loud music playing from Apt 101 after 11 PM. This has happened multiple times.', 'open'),
(3, 4, 'Constant stomping and banging noises from Unit B. It sounds like they are moving furniture every day.', 'in_progress');

INSERT INTO NoiseRule (PropertyId, Description, ThresholdDb, StartTime, EndTime, DaysOfWeek) VALUES
(1, 'Weekday Quiet Hours', 75, '22:00:00', '07:00:00', ARRAY[1,2,3,4,5]),
(2, 'General Noise Ordinance', 85, '09:00:00', '23:00:00', ARRAY[1,2,3,4,5,6,7]);
