-- ===============================================
-- DML Script for Sapphire Sounds DB
-- This script will be executed after the schema is created.
-- ===============================================

INSERT INTO Property (Name, Address001, City, State, Zipcode) VALUES
('The Grand Apartments', '123 Luxury Lane', 'Metropolis', 'NY', '10001'),
('Oakwood Residences', '456 Suburb Street', 'Smallville', 'KS', '66002');


INSERT INTO Manager (Name, Address, City, State, Zipcode) VALUES
('John Doe', '10 Manager Way', 'Metropolis', 'NY', '10001'),
('Jane Smith', '20 Admin Ave', 'Smallville', 'KS', '66002');


INSERT INTO PropertyManagers (PropertyId, ManagerId) VALUES
(1, 1), 
(2, 2); 

INSERT INTO Unit (Name, PropertyId) VALUES
('Apt 101', 1),
('Apt 102', 1),
('Unit A', 2),
('Unit B', 2);

INSERT INTO Tenant (Name, UnitId) VALUES
('Alice Wonder', 1);

INSERT INTO Sensor (Location, UnitId) VALUES
('Living Room', 1);

INSERT INTO SensorReading (dB, ReadingTimestamp, SensorId) VALUES
(95, '2024-05-21 10:00:00-05', 1),
(98, '2024-05-21 10:05:00-05', 1),
(96, '2024-05-21 10:10:00-05', 1),
(97, '2024-05-21 10:15:00-05', 1);

INSERT INTO Reward (Name, Description) VALUES
('Quiet Neighbor Discount', '10% off next month''s rent for maintaining low noise levels.');

INSERT INTO UnitRewards (UnitId, RewardId) VALUES
(1, 1);
