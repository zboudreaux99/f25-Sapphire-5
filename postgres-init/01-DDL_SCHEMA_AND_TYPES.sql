-- ===============================================
-- DDL SCHEMA for Sapphire Sounds DB
-- This script will be executed when the database is first created.
-- ===============================================

CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS intarray;

-- This function is IMMUTABLE, which is required for it to be used in an index or EXCLUDE constraint.
-- It converts a start and end time into a timestamp range on a fixed, arbitrary date.
CREATE OR REPLACE FUNCTION time_to_tstzrange(start_time TIME, end_time TIME)
RETURNS TSTZRANGE AS $$
DECLARE
    base_date DATE := '2000-01-01';
    start_ts TIMESTAMPTZ;
    end_ts TIMESTAMPTZ;
BEGIN
    start_ts := base_date + start_time;
    end_ts := base_date + end_time;
    
    IF end_time <= start_time THEN
        end_ts := end_ts + INTERVAL '1 day';
    END IF;

    RETURN TSTZRANGE(start_ts, end_ts, '()');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

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
    UNIQUE (PropertyId, Name),
    UNIQUE (PropertyId, UnitId)
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

CREATE TABLE SensorHeartbeat (
    SensorId INT PRIMARY KEY, 
    LastCheckInTimestamp TIMESTAMPTZ NOT NULL,
    ConnectivityStatus VARCHAR(20) NOT NULL,
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
    PropertyId INT NOT NULL,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    Description TEXT,
    FOREIGN KEY (PropertyId) REFERENCES Property(PropertyId) ON DELETE CASCADE,
    UNIQUE (PropertyId, Name),
    UNIQUE (PropertyId, RewardId)
); 

CREATE TABLE UnitRewards (
    UnitRewardId SERIAL PRIMARY KEY,
    PropertyId INT NOT NULL,
    RewardId INT NOT NULL,
    UnitId INT NOT NULL,
    DateGranted TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    DateRedeemed TIMESTAMPTZ,
    FOREIGN KEY (RewardId) REFERENCES Reward(RewardId) ON DELETE RESTRICT,
    FOREIGN KEY (PropertyId, UnitId) REFERENCES Unit(PropertyId, UnitId) ON DELETE CASCADE,
    FOREIGN KEY (PropertyId, RewardId) REFERENCES Reward(PropertyId, RewardId) ON DELETE RESTRICT,
    CONSTRAINT chk_redeemed_after_granted CHECK (DateRedeemed IS NULL OR DateRedeemed >= DateGranted)
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
    CONSTRAINT no_overlapping_rules EXCLUDE USING GIST (PropertyId WITH =, DaysOfWeek WITH &&, time_to_tstzrange(StartTime, EndTime) WITH &&)
);
