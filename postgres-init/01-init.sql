-- ===============================================
-- DDL Script for Sapphire Sounds DB
-- This script will be executed when the database is first created.
-- ===============================================

CREATE TABLE Property (
    PropertyId SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Address001 VARCHAR(255) NOT NULL,
    Address002 VARCHAR(255),
    City VARCHAR(100),
    State VARCHAR(50),
    Zipcode VARCHAR(20)
);

CREATE TABLE Manager (
    ManagerId SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Address VARCHAR(255),
    City VARCHAR(100),
    State VARCHAR(50),
    Zipcode VARCHAR(20)
);


CREATE TABLE PropertyManagers (
    PropertyId INT NOT NULL,
    ManagerId INT NOT NULL,
    PRIMARY KEY (PropertyId, ManagerId),
    FOREIGN KEY (PropertyId) REFERENCES Property(PropertyId) ON DELETE CASCADE,
    FOREIGN KEY (ManagerId) REFERENCES Manager(ManagerId) ON DELETE CASCADE
);

CREATE TABLE Unit (
    UnitId SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    PropertyId INT NOT NULL,
    FOREIGN KEY (PropertyId) REFERENCES Property(PropertyId) ON DELETE CASCADE,
    UNIQUE (PropertyId, Name)
);

CREATE TABLE Sensor (
    SensorId SERIAL PRIMARY KEY,
    Location VARCHAR(255),
    UnitId INT NOT NULL,
    FOREIGN KEY (UnitId) REFERENCES Unit(UnitId) ON DELETE CASCADE,
    UNIQUE (UnitId, Location)
);

CREATE TABLE SensorReading (
    ReadingId SERIAL PRIMARY KEY,
    dB INTEGER NOT NULL,
    ReadingTimestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    SensorId INT NOT NULL,
    FOREIGN KEY (SensorId) REFERENCES Sensor(SensorId) ON DELETE CASCADE
);


CREATE TABLE Tenant (
    TenantId SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    UnitId INT,
    FOREIGN KEY (UnitId) REFERENCES Unit(UnitId) ON DELETE SET NULL
);


CREATE TABLE Reward (
    RewardId SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Description TEXT
);

CREATE TABLE UnitRewards (
    UnitId INT NOT NULL,
    RewardId INT NOT NULL,
    PRIMARY KEY (UnitId, RewardId),
    FOREIGN KEY (UnitId) REFERENCES Unit(UnitId) ON DELETE CASCADE,
    FOREIGN KEY (RewardId) REFERENCES Reward(RewardId) ON DELETE CASCADE
);
