-- ===============================================
-- DDL SCHEMA for Sapphire Sounds DB
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

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'tenant');

CREATE TABLE Users (
    UserId SERIAL PRIMARY KEY,
    Email VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Role user_role NOT NULL,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    LastLogin TIMESTAMP WITH TIME ZONE
);

CREATE TABLE Manager (
    ManagerId SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Address VARCHAR(255),
    City VARCHAR(100),
    State VARCHAR(50),
    Zipcode VARCHAR(20),
    UserId INT UNIQUE,
    FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE SET NULL
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
    UnitId INT UNIQUE,
    FOREIGN KEY (UnitId) REFERENCES Unit(UnitId) ON DELETE SET NULL,
    UserId INT UNIQUE,
    FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE SET NULL
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

CREATE TYPE complaint_status AS ENUM ('open', 'in_progress', 'resolved');

CREATE TABLE Complaint (
    ComplaintId SERIAL PRIMARY KEY,
    InitiatingTenantId INT NOT NULL,
    ComplainedAboutUnitId INT, 
    ComplaintTimestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    Description TEXT,
    Status complaint_status NOT NULL DEFAULT 'open',
    FOREIGN KEY (InitiatingTenantId) REFERENCES Tenant(TenantId) ON DELETE CASCADE,
    FOREIGN KEY (ComplainedAboutUnitId) REFERENCES Unit(UnitId) ON DELETE CASCADE
);

CREATE TABLE NoiseRule (
    NoiseRuleId SERIAL PRIMARY KEY,
    PropertyId INT NOT NULL,
    Description VARCHAR(255),
    ThresholdDb INT NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    -- Array of integers for days of the week, following ISO 8601 standard (1=Monday, 7=Sunday)
    DaysOfWeek INT[] NOT NULL,
    FOREIGN KEY (PropertyId) REFERENCES Property(PropertyId) ON DELETE CASCADE,
    CONSTRAINT no_overlapping_rules EXCLUDE (PropertyId WITH =, DaysOfWeek WITH &&, TSTZRANGE(StartTime::time, EndTime::time, '()') WITH &&)
);

